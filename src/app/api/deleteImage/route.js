import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { formatPrivateKey } from '../../utils/fixEnvVar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import User from '@/app/models/User';
import connectDB from '@/app/lib/mongodb';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Helper function to delete a file from Google Cloud Storage
async function deleteFromBucket(fileName) {
  try {
    await bucket.file(fileName).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileName} from bucket:`, error);
    return false;
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await req.json();
    const fileName = imageUrl.split('/').pop();

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from bucket
    await deleteFromBucket(fileName);

    // Remove from user's clothes array
    user.clothes = user.clothes.filter(item => item.imageUrl !== imageUrl);
    await user.save();

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

// Bulk delete endpoint
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
    const deletePromises = user.clothes.map(item => {
      const fileName = item.imageUrl.split('/').pop();
      return deleteFromBucket(fileName);
    });
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
