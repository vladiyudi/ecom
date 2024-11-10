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
      .filter(item => item.top) // Only include items that have a top garment
      .sort((a, b) => (b.top.createdAt || 0) - (a.top.createdAt || 0))
      .map(item => ({
        name: item.top.name,
        url: item.top.imageUrl,
        uploadDate: item.top.createdAt,
        description: item.top.description || '',
        modelDescription: item.top.modelDescription || '',
        upscale: item.top.upscale || false,
        contentType: 'image/jpeg', // Default content type for uploaded images
        size: 0 // Size information not stored in user model
      }));
      
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 });
  }
}
