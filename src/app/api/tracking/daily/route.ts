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

// GET today's tracking data
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's tracking data
    const todayTracking = user.dailyTracking?.find((day: any) => {
      const trackingDate = new Date(day.date);
      trackingDate.setHours(0, 0, 0, 0);
      return trackingDate.getTime() === today.getTime();
    });

    if (!todayTracking) {
      // Return default values if no tracking for today
      return NextResponse.json({
        success: true,
        tracking: {
          date: today,
          waterIntake: 0,
          waterGoal: 8,
          exerciseMinutes: 0,
          exerciseGoal: 60,
          caloriesConsumed: 0,
          caloriesGoal: 2000,
          proteinConsumed: 0,
          proteinGoal: 150,
          carbsConsumed: 0,
          carbsGoal: 250,
          fatConsumed: 0,
          fatGoal: 65,
          stepsCount: 0,
          stepsGoal: 10000,
          sleepHours: 0,
          sleepGoal: 8,
          completed: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      tracking: todayTracking
    });
  } catch (err: any) {
    console.error('Get tracking error:', err);
    return NextResponse.json({ success: false, message: 'Failed to get tracking data' }, { status: 500 });
  }
}

// POST/UPDATE today's tracking data
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const {
      waterIntake,
      waterGoal,
      exerciseMinutes,
      exerciseGoal,
      caloriesConsumed,
      caloriesGoal,
      proteinConsumed,
      proteinGoal,
      carbsConsumed,
      carbsGoal,
      fatConsumed,
      fatGoal,
      stepsCount,
      stepsGoal,
      sleepHours,
      sleepGoal
    } = body;

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find if today's tracking exists
    const todayIndex = user.dailyTracking?.findIndex((day: any) => {
      const trackingDate = new Date(day.date);
      trackingDate.setHours(0, 0, 0, 0);
      return trackingDate.getTime() === today.getTime();
    });

    const trackingData = {
      date: today,
      waterIntake: waterIntake ?? 0,
      waterGoal: waterGoal ?? 8,
      exerciseMinutes: exerciseMinutes ?? 0,
      exerciseGoal: exerciseGoal ?? 60,
      caloriesConsumed: caloriesConsumed ?? 0,
      caloriesGoal: caloriesGoal ?? 2000,
      proteinConsumed: proteinConsumed ?? 0,
      proteinGoal: proteinGoal ?? 150,
      carbsConsumed: carbsConsumed ?? 0,
      carbsGoal: carbsGoal ?? 250,
      fatConsumed: fatConsumed ?? 0,
      fatGoal: fatGoal ?? 65,
      stepsCount: stepsCount ?? 0,
      stepsGoal: stepsGoal ?? 10000,
      sleepHours: sleepHours ?? 0,
      sleepGoal: sleepGoal ?? 8,
      completed: false
    };

    // Check if all goals are met
    trackingData.completed = 
      trackingData.waterIntake >= trackingData.waterGoal &&
      trackingData.exerciseMinutes >= trackingData.exerciseGoal &&
      trackingData.caloriesConsumed <= trackingData.caloriesGoal * 1.1; // 10% tolerance

    if (!user.dailyTracking) {
      user.dailyTracking = [];
    }

    if (todayIndex !== undefined && todayIndex !== -1) {
      // Update existing tracking
      user.dailyTracking[todayIndex] = trackingData as any;
    } else {
      // Add new tracking
      user.dailyTracking.push(trackingData as any);
    }

    // Keep only last 90 days of tracking
    if (user.dailyTracking.length > 90) {
      user.dailyTracking = user.dailyTracking.slice(-90);
    }

    // Update streaks
    if (!user.streaks) {
      user.streaks = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: today
      } as any;
    }

    const lastActivityDate = user.streaks.lastActivityDate ? new Date(user.streaks.lastActivityDate) : null;
    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        user.streaks.currentStreak = (user.streaks.currentStreak || 0) + 1;
      } else if (daysDiff > 1) {
        // Streak broken
        user.streaks.currentStreak = 1;
      }
      // If daysDiff === 0, same day, don't increment
    } else {
      user.streaks.currentStreak = 1;
    }

    if ((user.streaks.currentStreak || 0) > (user.streaks.longestStreak || 0)) {
      user.streaks.longestStreak = user.streaks.currentStreak;
    }

    user.streaks.lastActivityDate = today as any;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Tracking data updated successfully',
      tracking: trackingData,
      streaks: user.streaks
    });
  } catch (err: any) {
    console.error('Update tracking error:', err);
    return NextResponse.json({ success: false, message: 'Failed to update tracking data' }, { status: 500 });
  }
}
