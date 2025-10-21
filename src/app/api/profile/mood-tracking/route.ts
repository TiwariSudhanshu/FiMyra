import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import { decode } from 'next-auth/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

async function getUserIdFromReq(req: Request | any) {
  const cookies = (req.cookies && typeof req.cookies.get === 'function') ? req.cookies : null;
  let userId: string | null = null;

  if (cookies) {
    const nextAuthToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value;
    if (nextAuthToken) {
      try {
        const decoded = await decode({ token: nextAuthToken, secret: process.env.NEXTAUTH_SECRET! });
        if (decoded?.userId) userId = decoded.userId as string;
        else if (decoded?.sub) userId = decoded.sub as string;
      } catch (e) {
        // ignore
      }
    }
  }

  if (!userId && cookies) {
    const token = cookies.get('auth-token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {
        // ignore
      }
    }
  }

  return userId;
}

// GET mood tracking data
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    console.log('📖 GET /api/profile/mood-tracking');
    console.log('📖 User:', user.email);
    console.log('📖 Total mood entries:', user.moodTracking?.length || 0);

    // Sort mood tracking by timestamp (most recent first)
    const moodTracking = user.moodTracking || [];
    const sortedMoodTracking = [...moodTracking].sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({ 
      success: true, 
      moodTracking: sortedMoodTracking 
    });
  } catch (err: any) {
    console.error('Get mood tracking error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch mood tracking' }, { status: 500 });
  }
}
