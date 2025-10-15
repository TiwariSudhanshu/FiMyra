/**
 * Daily Habits Tracker API
 * 
 * GET  /api/habits - Get habits for today or specific date
 * POST /api/habits - Create or update today's habits
 * PUT  /api/habits - Toggle a specific habit
 */

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

/**
 * GET /api/habits
 * Fetch habits for today or a specific date
 * Query params: ?date=YYYY-MM-DD (optional, defaults to today)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get date from query params or use today
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    let targetDate = new Date();
    if (dateParam) {
      targetDate = new Date(dateParam);
    }
    targetDate.setHours(0, 0, 0, 0);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Find habits for the target date
    const habitEntry = user.dailyHabits?.find((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    });

    if (!habitEntry) {
      // Return empty habits if not found
      return NextResponse.json({
        success: true,
        date: targetDate,
        habits: {
          exercised: false,
          ateHealthy: false,
          drankWater: false,
          sleptWell: false,
          tookVitamins: false,
          meditated: false,
          stretched: false,
          journaled: false,
          skinCareRoutine: false,
          hairCareRoutine: false
        },
        completionRate: 0,
        notes: '',
        message: 'No habits recorded for this date'
      });
    }

    return NextResponse.json({
      success: true,
      date: habitEntry.date,
      habits: habitEntry.habits,
      completionRate: habitEntry.completionRate,
      notes: habitEntry.notes || '',
      message: 'Habits fetched successfully'
    });

  } catch (error) {
    console.error('Error in GET /api/habits:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 * Create or update today's habits
 * Body: { habits: {...}, notes?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { habits, notes, date } = body;

    if (!habits) {
      return NextResponse.json(
        { success: false, message: 'Habits data is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Use provided date or today
    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }
    targetDate.setHours(0, 0, 0, 0);

    // Calculate completion rate
    const habitKeys = Object.keys(habits);
    const completedCount = habitKeys.filter(key => habits[key] === true).length;
    const completionRate = Math.round((completedCount / habitKeys.length) * 100);

    // Check if entry for this date already exists
    const existingIndex = user.dailyHabits?.findIndex((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    });

    if (existingIndex !== undefined && existingIndex >= 0 && user.dailyHabits) {
      // Update existing entry
      user.dailyHabits[existingIndex] = {
        date: targetDate,
        habits,
        completionRate,
        notes: notes || user.dailyHabits[existingIndex].notes
      };
    } else {
      // Create new entry
      if (!user.dailyHabits) {
        user.dailyHabits = [];
      }
      user.dailyHabits.push({
        date: targetDate,
        habits,
        completionRate,
        notes: notes || ''
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      date: targetDate,
      habits,
      completionRate,
      notes: notes || '',
      message: 'Habits updated successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/habits:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/habits
 * Toggle a specific habit for today
 * Body: { habitKey: string, value: boolean, date?: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { habitKey, value, date } = body;

    if (!habitKey || typeof value !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'habitKey and value are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Use provided date or today
    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }
    targetDate.setHours(0, 0, 0, 0);

    // Find or create habit entry for today
    let habitEntry = user.dailyHabits?.find((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    });

    if (!habitEntry) {
      // Create new entry with default values
      if (!user.dailyHabits) {
        user.dailyHabits = [];
      }
      
      habitEntry = {
        date: targetDate,
        habits: {
          exercised: false,
          ateHealthy: false,
          drankWater: false,
          sleptWell: false,
          tookVitamins: false,
          meditated: false,
          stretched: false,
          journaled: false,
          skinCareRoutine: false,
          hairCareRoutine: false
        },
        completionRate: 0,
        notes: ''
      };
      
      user.dailyHabits.push(habitEntry);
    }

    // Toggle the specific habit
    (habitEntry.habits as any)[habitKey] = value;

    // Recalculate completion rate
    const habitKeys = Object.keys(habitEntry.habits);
    const completedCount = habitKeys.filter(key => (habitEntry.habits as any)[key] === true).length;
    habitEntry.completionRate = Math.round((completedCount / habitKeys.length) * 100);

    await user.save();

    return NextResponse.json({
      success: true,
      date: targetDate,
      habits: habitEntry.habits,
      completionRate: habitEntry.completionRate,
      message: `Habit "${habitKey}" updated successfully`
    });

  } catch (error) {
    console.error('Error in PUT /api/habits:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
