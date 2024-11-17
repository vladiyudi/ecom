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

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the clothing item
    const clothingItem = user.clothes.id(itemId);
    if (!clothingItem) {
      return NextResponse.json({ error: 'Clothing item not found' }, { status: 404 });
    }

    // Delete bottom image from bucket if it exists
    if (clothingItem.bottom && clothingItem.bottom.url) {
      await deleteFromBucket(clothingItem.bottom.url);
    }

    // Update the clothing item to remove the bottom image
    await User.updateOne(
      { 
        'email': session.user.email, 
        'clothes._id': new mongoose.Types.ObjectId(itemId)
      },
      { 
        $set: { 
          'clothes.$.bottom': null 
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Bottom image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bottom image:', error);
    return NextResponse.json({ error: 'Failed to delete bottom image' }, { status: 500 });
  }
}
