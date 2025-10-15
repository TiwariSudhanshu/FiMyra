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

// GET - Fetch hair care profile
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

    const user = await User.findById(userId).select('hairCareProfile healthProfile nextHairWashDate');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if wash is due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWashDate = user.nextHairWashDate;
    const isWashDueToday = nextWashDate && new Date(nextWashDate).setHours(0, 0, 0, 0) === today.getTime();
    const isWashOverdue = nextWashDate && new Date(nextWashDate) < today;

    return NextResponse.json({
      success: true,
      hairCareProfile: user.hairCareProfile || null,
      age: user.healthProfile?.age || null,
      nextWashDate: nextWashDate || null,
      isWashDueToday,
      isWashOverdue
    });

  } catch (error) {
    console.error('Error fetching hair care profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hair care profile' },
      { status: 500 }
    );
  }
}

// Helper function to calculate next wash date based on frequency
function calculateNextWashDate(frequency: string, lastWashDate?: Date): Date {
  const today = lastWashDate || new Date();
  const nextDate = new Date(today);
  nextDate.setHours(0, 0, 0, 0);

  switch (frequency.toLowerCase()) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'every-other-day':
    case 'alternate days':
      nextDate.setDate(nextDate.getDate() + 2);
      break;
    case 'twice-a-week':
    case 'twice a week':
      nextDate.setDate(nextDate.getDate() + 3);
      break;
    case 'weekly':
    case 'once-a-week':
    case 'once a week':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'twice-a-month':
    case 'twice a month':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
    case 'once-a-month':
      nextDate.setDate(nextDate.getDate() + 30);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
}

// POST - Save/Update hair care profile
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
    const { hairType, concerns, routine, goals, notes } = body;

    // Validation
    if (!hairType) {
      return NextResponse.json(
        { success: false, message: 'Hair type is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update hair care profile
    user.hairCareProfile = {
      hairType,
      concerns: concerns || [],
      routine: {
        shampoo: routine?.shampoo || '',
        conditioner: routine?.conditioner || '',
        treatments: routine?.treatments || [],
        frequency: routine?.frequency || ''
      },
      goals: goals || [],
      notes: notes || '',
      updatedAt: new Date()
    } as any;

    // If frequency is provided, calculate next wash date
    if (routine?.frequency) {
      // Find the last completed wash
      const lastCompletedWash = user.hairCareTracking
        ?.filter((t: any) => t.washCompleted)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      user.nextHairWashDate = calculateNextWashDate(
        routine.frequency,
        lastCompletedWash?.date
      );
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Hair care profile saved successfully',
      hairCareProfile: user.hairCareProfile,
      nextWashDate: user.nextHairWashDate
    });

  } catch (error) {
    console.error('Error saving hair care profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save hair care profile' },
      { status: 500 }
    );
  }
}
