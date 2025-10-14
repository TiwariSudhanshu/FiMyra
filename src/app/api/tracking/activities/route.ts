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

// GET activities
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Get recent activities (last 30)
    const activities = user.activities?.slice(-30).reverse() || [];

    return NextResponse.json({
      success: true,
      activities,
      unreadCount: activities.filter((a: any) => !a.read).length
    });
  } catch (err: any) {
    console.error('Get activities error:', err);
    return NextResponse.json({ success: false, message: 'Failed to get activities' }, { status: 500 });
  }
}

// POST add new activity
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const { type, title, description, icon } = body;

    if (!type || !title || !description || !icon) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    if (!user.activities) {
      user.activities = [];
    }

    const newActivity = {
      type,
      title,
      description,
      timestamp: new Date(),
      icon,
      read: false
    };

    user.activities.push(newActivity as any);

    // Keep only last 100 activities
    if (user.activities.length > 100) {
      user.activities = user.activities.slice(-100);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Activity added successfully',
      activity: newActivity
    });
  } catch (err: any) {
    console.error('Add activity error:', err);
    return NextResponse.json({ success: false, message: 'Failed to add activity' }, { status: 500 });
  }
}

// PATCH mark activity as read
export async function PATCH(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const { activityId, markAllRead } = body;

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    if (markAllRead) {
      // Mark all activities as read
      if (user.activities) {
        user.activities.forEach((activity: any) => {
          activity.read = true;
        });
      }
    } else if (activityId) {
      // Mark specific activity as read
      const activity = user.activities?.find((a: any) => a._id?.toString() === activityId);
      if (activity) {
        (activity as any).read = true;
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Activity marked as read'
    });
  } catch (err: any) {
    console.error('Mark activity read error:', err);
    return NextResponse.json({ success: false, message: 'Failed to mark activity as read' }, { status: 500 });
  }
}
