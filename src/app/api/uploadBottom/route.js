import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { analyzeImage } from '../../utils/openaiApi';
import { formatPrivateKey } from '../../utils/fixEnvVar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import User from '../../models/User';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

function isValidFileType(file) {
  const validTypes = ['image/jpeg', 'image/png'];
  return validTypes.includes(file.type);
}

function sanitizeFilename(filename) {
  return filename.replace(/\s+/g, '_');
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('image');
    const description = formData.get('description');
    const itemId = formData.get('itemId'); // Changed from index to itemId

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    if (!isValidFileType(file)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG and PNG are allowed.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the clothing item by ID
    const clothingItem = user.clothes.id(itemId);
    if (!clothingItem) {
      console.log('Available IDs:', user.clothes.map(item => item._id.toString())); // Debug log
      return NextResponse.json({ error: 'Clothing item not found' }, { status: 404 });
    }

    const buffer = await file.arrayBuffer();
    const sanitizedFilename = sanitizeFilename(file.name);
    const blob = bucket.file(sanitizedFilename);

    const blobStream = blob.createWriteStream();

    const uploadResult = await new Promise((resolve, reject) => {
      blobStream.on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        
        const aiDescription = await analyzeImage(publicUrl);

        resolve({
          url: publicUrl,
          name: sanitizedFilename,
          description: description || aiDescription.outfit || '',
          aiDescription: aiDescription.outfit,
        });
      });

      blobStream.on('error', reject);
      blobStream.end(Buffer.from(buffer));
    });

    // Update the bottom property of the specified clothing item
    clothingItem.bottom = {
      imageUrl: uploadResult.url,
      name: uploadResult.name,
      description: uploadResult.description,
      aiDescription: uploadResult.aiDescription,
    };

    await user.save();

    return NextResponse.json({ 
      message: 'Bottom image uploaded successfully',
      bottom: clothingItem.bottom
    });

  } catch (error) {
    console.error('Error uploading bottom image:', error);
    return NextResponse.json({ error: error.message || 'Error uploading bottom image' }, { status: 500 });
  }
}
