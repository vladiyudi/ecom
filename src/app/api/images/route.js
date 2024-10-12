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

export async function GET() {
  try {
    const [files] = await bucket.getFiles();
    const images = await Promise.all(files.map(async (file) => {
      const [metadata] = await file.getMetadata();
      return {
        name: file.name,
        url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        uploadDate: metadata.timeCreated,
        size: metadata.size,
        contentType: metadata.contentType,
        description: metadata.metadata ? metadata.metadata.description : '',
        modelDescription: metadata.metadata ? metadata.metadata.modelDescription : '',
        upscale: metadata.metadata ? metadata.metadata.upscale === 'true' : false
      };
    }));
    console.log('Successfully retrieved files:', images);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 });
  }
}