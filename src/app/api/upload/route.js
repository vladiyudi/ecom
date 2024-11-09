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

    // Get the user first
    let user = await User.findOne({ email: session.user.email });
    
    // If user doesn't exist, create one
    if (!user) {
      user = new User({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        clothes: [] // Initialize empty clothes array
      });
    }

    const formData = await request.formData();
    const files = formData.getAll('images');
    const descriptions = formData.getAll('descriptions');
    const modelDescriptions = formData.getAll('modelDescriptions');
    const upscaleFlags = formData.getAll('upscale');

    const uploadPromises = files.map(async (file, index) => {
      if (!isValidFileType(file)) {
        throw new Error(`Invalid file type for ${file.name}. Only JPEG and PNG are allowed.`);
      }

      const buffer = await file.arrayBuffer();
      const sanitizedFilename = sanitizeFilename(file.name);
      const blob = bucket.file(sanitizedFilename);

      const blobStream = blob.createWriteStream();

      return new Promise((resolve, reject) => {
        blobStream.on('finish', async () => {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          
          const aiDescription = await analyzeImage(publicUrl);

          const metadata = {
            description: aiDescription.outfit || '',
            modelDescription: modelDescriptions[index] || `full body shot, fashion ${aiDescription.gender} model wearing ${aiDescription.outfit} in a neutral pose, studio lighting`,
            upscale: upscaleFlags[index] === 'true' ? 'true' : 'false',
            aiDescription: aiDescription.outfit,
          };

          // Update the blob's metadata
          await blob.setMetadata({ metadata });

          resolve({
            url: publicUrl,
            name: sanitizedFilename,
            description: aiDescription.outfit || '',
            modelDescription: modelDescriptions[index] || `full body shot, fashion ${aiDescription.gender} model wearing ${aiDescription.outfit} in a neutral pose, studio lighting`,
            upscale: upscaleFlags[index] === 'true',
            aiDescription: aiDescription.outfit,
          });
        });

        blobStream.on('error', reject);

        blobStream.end(Buffer.from(buffer));
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Add new clothes to the user's clothes array
    for (const image of uploadedImages) {
      user.clothes.push({
        imageUrl: image.url,
        name: image.name,
        description: image.description,
        modelDescription: image.modelDescription,
        upscale: image.upscale,
        aiDescription: image.aiDescription
      });
    }

    // Save the updated user
    await user.save();

    console.log('Updated user:', user); // Add logging to verify the update

    return NextResponse.json({ 
      message: 'Images uploaded successfully', 
      images: uploadedImages,
      savedToUser: true,
      userClothes: user.clothes // Return clothes array to verify the update
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: error.message || 'Error uploading images' }, { status: 400 });
  }
}
