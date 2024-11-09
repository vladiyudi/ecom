import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import User from '../../../models/User';
import connectDB from '../../../lib/mongodb';

export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find the user and get their clothes
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      clothes: user.clothes.sort((a, b) => b.createdAt - a.createdAt) // Sort by newest first
    });

  } catch (error) {
    console.error('Error fetching user clothes:', error);
    return NextResponse.json({ error: 'Error fetching user clothes' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Find the user and remove the clothing item
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove the item from the clothes array
    user.clothes = user.clothes.filter(item => item.imageUrl !== imageUrl);
    await user.save();

    return NextResponse.json({ 
      message: 'Clothing item removed successfully',
      clothes: user.clothes
    });

  } catch (error) {
    console.error('Error deleting clothing item:', error);
    return NextResponse.json({ error: 'Error deleting clothing item' }, { status: 500 });
  }
}
