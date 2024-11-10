import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { analyzeImage } from '../../utils/openaiApi';
import { formatPrivateKey } from '../../utils/fixEnvVar';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import User from '../../models/User';
import connectDB from '../../lib/mongodb';

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
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('image');
    const description = formData.get('description');
    const index = formData.get('index'); // Index of the clothing item to update

    if (!file) {
      throw new Error('No file provided');
    }

    if (!isValidFileType(file)) {
      throw new Error('Invalid file type. Only JPEG and PNG are allowed.');
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

    // Find user and update the bottom garment
    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.clothes[index]) {
      throw new Error('User or clothing item not found');
    }

    // Update the bottom property of the specified clothing item
    user.clothes[index].bottom = {
      imageUrl: uploadResult.url,
      name: uploadResult.name,
      description: uploadResult.description,
      aiDescription: uploadResult.aiDescription,
    };

    user.clothes[index].top.modelDescription = `${user.clothes[index].top.modelDescription} and ${uploadResult.description}`

    await user.save();

    return NextResponse.json({ 
      message: 'Bottom image uploaded successfully',
      bottom: user.clothes[index].bottom
    });

  } catch (error) {
    console.error('Error uploading bottom image:', error);
    return NextResponse.json({ error: error.message || 'Error uploading bottom image' }, { status: 400 });
  }
}
