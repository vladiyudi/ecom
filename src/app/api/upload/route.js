import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { analyzeImage } from '../../utils/openaiApi';
import { formatPrivateKey } from '../../utils/fixEnvVar';

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

// Function to sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/\s+/g, '_');
}

export async function POST(request) {
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
          modelDescription: modelDescriptions[index] || '',
          upscale: upscaleFlags[index] === 'true' ? 'true' : 'false',
          aiDescription: aiDescription.outfit,
          modelDescription: `full body shot, fashion ${aiDescription.gender} model wearing ${aiDescription.outfit} in a neutral pose, full body shot, studio lighting`,
        };

        // Update the blob's metadata
        await blob.setMetadata({ metadata });

        resolve({
          url: publicUrl,
          name: sanitizedFilename,
          description: aiDescription.outfit || '',
          modelDescription: modelDescriptions[index] || '',
          upscale: upscaleFlags[index] === 'true',
          aiDescription: aiDescription.outfit,
          modelDescription: `full body shot, fashion ${aiDescription.gender} model wearing ${aiDescription.outfit} in a neutral pose, full body shot, studio lighting`,
        });
      });

      blobStream.on('error', reject);

      blobStream.end(Buffer.from(buffer));
    });
  });

  try {
    const uploadedImages = await Promise.all(uploadPromises);
    return NextResponse.json({ message: 'Images uploaded successfully', images: uploadedImages });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: error.message || 'Error uploading images' }, { status: 400 });
  }
}