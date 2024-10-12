import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { formatPrivateKey } from '../../utils/fixEnvVar';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();

    // Extract the file name from the URL
    const fileName = imageUrl.split('/').pop();

    // Delete the file from Google Cloud Storage
    await bucket.file(fileName).delete();

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}