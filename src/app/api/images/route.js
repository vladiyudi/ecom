export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
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
      .filter(item => item.top)
      .sort((a, b) => (b.top.createdAt || 0) - (a.top.createdAt || 0))
      .map(item => ({
        _id: item._id.toString(), // Explicitly include _id and convert to string
        name: item.top.name,
        url: item.top.imageUrl,
        uploadDate: item.top.createdAt,
        description: item.top.description || '',
        modelDescription: item.top.modelDescription || '',
        upscale: item.top.upscale || false,
        contentType: 'image/jpeg',
        size: 0,
        bottom: item.bottom ? {
          name: item.bottom.name,
          url: item.bottom.imageUrl,
          description: item.bottom.description || '',
          aiDescription: item.bottom.aiDescription || ''
        } : null
      }));
      
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 });
  }
}
