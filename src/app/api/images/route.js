import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import User from '@/app/models/User';
import connectDB from '@/app/lib/mongodb';

export async function GET() {
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

    const images = user.clothes
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(item => ({
        name: item.name,
        url: item.imageUrl,
        uploadDate: item.createdAt,
        description: item.description || '',
        modelDescription: item.modelDescription || '',
        upscale: item.upscale || false,
        contentType: 'image/jpeg', // Default content type for uploaded images
        size: 0 // Size information not stored in user model
      }));

    console.log('Successfully retrieved user images:', images);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 });
  }
}
