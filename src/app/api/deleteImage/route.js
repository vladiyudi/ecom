import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { formatPrivateKey } from '@/app/utils/fixEnvVar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import User from '@/app/models/User';
import connectDB from '@/app/lib/mongodb';
import mongoose from 'mongoose';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Helper function to delete a file from Google Cloud Storage
async function deleteFromBucket(imageUrl) {
  try {
    if (!imageUrl) return true;
    const fileName = imageUrl.split('/').pop();
    await bucket.file(fileName).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting file from bucket:`, error);
    return false;
  }
}

// Helper function to delete both top and bottom images for a clothing item
async function deleteClothingSet(clothingItem) {
  const deletePromises = [];
  
  // Delete top image if exists
  if (clothingItem.top && clothingItem.top.imageUrl) {
    deletePromises.push(deleteFromBucket(clothingItem.top.imageUrl));
  }
  
  // Delete bottom image if exists
  if (clothingItem.bottom && clothingItem.bottom.imageUrl) {
    deletePromises.push(deleteFromBucket(clothingItem.bottom.imageUrl));
  }
  
  await Promise.all(deletePromises);
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await req.json();
    console.log('Received itemId:', itemId); // Debug log

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the clothing item by _id
    const clothingItem = user.clothes.find(item => 
      item._id.toString() === itemId
    );

    if (!clothingItem) {
      console.log('Clothing item not found for ID:', itemId); // Debug log
      console.log('Available IDs:', user.clothes.map(item => item._id.toString())); // Debug log
      return NextResponse.json({ error: 'Clothing item not found' }, { status: 404 });
    }

    // Delete both top and bottom images from bucket
    await deleteClothingSet(clothingItem);

    // Remove the clothing item from user's clothes array using pull
    await User.updateOne(
      { email: session.user.email },
      { $pull: { clothes: { _id: new mongoose.Types.ObjectId(itemId) } } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Images deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting images:', error);
    return NextResponse.json({ error: 'Failed to delete images' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all user's images from bucket
    const deletePromises = user.clothes.map(clothingItem => deleteClothingSet(clothingItem));
    await Promise.all(deletePromises);

    // Clear user's clothes array
    user.clothes = [];
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'All images deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting all images:', error);
    return NextResponse.json({ 
      error: 'Failed to delete all images' 
    }, { status: 500 });
  }
}
