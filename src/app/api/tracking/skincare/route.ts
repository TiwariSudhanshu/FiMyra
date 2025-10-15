import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { decode } from 'next-auth/jwt';
import { connectDB } from '@/database';
import User from '@/models/user.model';

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

// GET - Fetch skin care tracking history
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30; // Default 30 days

    await connectDB();

    const user = await User.findById(userId).select('skinCareTracking');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Filter tracking data for the requested time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const trackingData = user.skinCareTracking?.filter(
      (track: any) => new Date(track.date) >= cutoffDate
    ) || [];

    // Get today's tracking status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTracking = trackingData.find(
      (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    return NextResponse.json({
      success: true,
      tracking: trackingData,
      todayStatus: todayTracking || null,
      stats: {
        totalDays: trackingData.length,
        morningCompleted: trackingData.filter((t: any) => t.morningRoutineCompleted).length,
        eveningCompleted: trackingData.filter((t: any) => t.eveningRoutineCompleted).length,
        bothCompleted: trackingData.filter(
          (t: any) => t.morningRoutineCompleted && t.eveningRoutineCompleted
        ).length
      }
    });

  } catch (error) {
    console.error('Error fetching skin care tracking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}

// POST - Update/Create skin care tracking for today
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { morningRoutineCompleted, eveningRoutineCompleted, notes } = body;

    await connectDB();

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find user and check if tracking exists for today
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if tracking exists for today
    const trackingIndex = user.skinCareTracking?.findIndex(
      (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === today.getTime()
    ) ?? -1;

    if (trackingIndex >= 0) {
      // Update existing tracking
      user.skinCareTracking![trackingIndex] = {
        ...user.skinCareTracking![trackingIndex],
        morningRoutineCompleted: morningRoutineCompleted ?? user.skinCareTracking![trackingIndex].morningRoutineCompleted,
        eveningRoutineCompleted: eveningRoutineCompleted ?? user.skinCareTracking![trackingIndex].eveningRoutineCompleted,
        notes: notes ?? user.skinCareTracking![trackingIndex].notes
      };
    } else {
      // Create new tracking entry
      if (!user.skinCareTracking) {
        user.skinCareTracking = [];
      }
      user.skinCareTracking.push({
        date: today,
        morningRoutineCompleted: morningRoutineCompleted ?? false,
        eveningRoutineCompleted: eveningRoutineCompleted ?? false,
        notes: notes || ''
      } as any);
    }

    await user.save();

    // Get updated tracking entry
    const updatedTracking = user.skinCareTracking?.find(
      (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    return NextResponse.json({
      success: true,
      message: 'Skin care routine updated successfully',
      tracking: updatedTracking
    });

  } catch (error) {
    console.error('Error updating skin care tracking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update tracking' },
      { status: 500 }
    );
  }
}

// DELETE - Clear tracking history
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { skinCareTracking: [] } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tracking history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing tracking history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear tracking history' },
      { status: 500 }
    );
  }
}
