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
      nextDate.setDate(nextDate.getDate() + 3); // Average 3-4 days
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
      // Default to weekly if frequency not recognized
      nextDate.setDate(nextDate.getDate() + 7);
  }

  return nextDate;
}

// GET - Fetch hair care tracking history and next wash reminder
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

    const user = await User.findById(userId).select('hairCareTracking hairCareProfile nextHairWashDate');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Filter tracking data for the requested time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const trackingData = user.hairCareTracking?.filter(
      (track: any) => new Date(track.date) >= cutoffDate
    ) || [];

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if wash is scheduled for today
    const todayTracking = trackingData.find(
      (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    // Check next wash date
    const nextWashDate = user.nextHairWashDate || null;
    const isWashDueToday = nextWashDate && new Date(nextWashDate).setHours(0, 0, 0, 0) === today.getTime();
    const isWashOverdue = nextWashDate && new Date(nextWashDate) < today;

    return NextResponse.json({
      success: true,
      tracking: trackingData,
      todayStatus: todayTracking || null,
      nextWashDate,
      isWashDueToday,
      isWashOverdue,
      frequency: user.hairCareProfile?.routine?.frequency || null,
      stats: {
        totalWashes: trackingData.filter((t: any) => t.washCompleted).length,
        totalSkipped: trackingData.filter((t: any) => t.skipped).length,
        totalScheduled: trackingData.filter((t: any) => t.washScheduled).length,
        completionRate: trackingData.length > 0 
          ? Math.round((trackingData.filter((t: any) => t.washCompleted).length / trackingData.filter((t: any) => t.washScheduled).length) * 100)
          : 0
      }
    });

  } catch (error) {
    console.error('Error fetching hair care tracking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}

// POST - Update/Create hair care tracking
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
    const { action, notes, date } = body;
    // action can be: 'schedule', 'complete', 'skip'

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get target date (today or specified date)
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Initialize tracking array if needed
    if (!user.hairCareTracking) {
      user.hairCareTracking = [];
    }

    // Find existing tracking for target date
    const trackingIndex = user.hairCareTracking.findIndex(
      (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === targetDate.getTime()
    );

    let trackingEntry: any;

    if (trackingIndex >= 0) {
      // Update existing tracking
      trackingEntry = user.hairCareTracking[trackingIndex];
    } else {
      // Create new tracking entry
      trackingEntry = {
        date: targetDate,
        washScheduled: false,
        washCompleted: false,
        skipped: false,
        notes: ''
      };
      user.hairCareTracking.push(trackingEntry);
    }

    // Update based on action
    switch (action) {
      case 'schedule':
        trackingEntry.washScheduled = true;
        user.nextHairWashDate = targetDate;
        break;

      case 'complete':
        trackingEntry.washCompleted = true;
        trackingEntry.washScheduled = true;
        trackingEntry.skipped = false;
        
        // Calculate and set next wash date based on frequency
        if (user.hairCareProfile?.routine?.frequency) {
          user.nextHairWashDate = calculateNextWashDate(
            user.hairCareProfile.routine.frequency,
            targetDate
          );
          
          // Create a scheduled entry for next wash date
          const nextWashDate = new Date(user.nextHairWashDate);
          nextWashDate.setHours(0, 0, 0, 0);
          
          const nextTrackingExists = user.hairCareTracking.some(
            (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === nextWashDate.getTime()
          );
          
          if (!nextTrackingExists) {
            user.hairCareTracking.push({
              date: nextWashDate,
              washScheduled: true,
              washCompleted: false,
              skipped: false,
              notes: 'Auto-scheduled'
            } as any);
          }
        }
        break;

      case 'skip':
        trackingEntry.skipped = true;
        trackingEntry.washCompleted = false;
        
        // Calculate next wash date if frequency is set
        if (user.hairCareProfile?.routine?.frequency) {
          user.nextHairWashDate = calculateNextWashDate(
            user.hairCareProfile.routine.frequency,
            targetDate
          );
        }
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action. Use: schedule, complete, or skip' },
          { status: 400 }
        );
    }

    // Update notes if provided
    if (notes !== undefined) {
      trackingEntry.notes = notes;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Hair wash ${action}d successfully`,
      tracking: trackingEntry,
      nextWashDate: user.nextHairWashDate
    });

  } catch (error) {
    console.error('Error updating hair care tracking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update tracking' },
      { status: 500 }
    );
  }
}

// PUT - Update wash frequency and recalculate next wash date
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromReq(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { frequency } = body;

    if (!frequency) {
      return NextResponse.json(
        { success: false, message: 'Frequency is required' },
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

    // Update frequency in hair care profile
    if (!user.hairCareProfile) {
      user.hairCareProfile = {
        hairType: '',
        concerns: [],
        routine: {
          shampoo: '',
          conditioner: '',
          treatments: [],
          frequency: frequency
        },
        goals: []
      } as any;
    } else if (!user.hairCareProfile.routine) {
      user.hairCareProfile.routine = {
        shampoo: '',
        conditioner: '',
        treatments: [],
        frequency: frequency
      };
    } else {
      user.hairCareProfile.routine.frequency = frequency;
    }

    // Find the last completed wash
    const lastCompletedWash = user.hairCareTracking
      ?.filter((t: any) => t.washCompleted)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // Calculate next wash date
    user.nextHairWashDate = calculateNextWashDate(
      frequency,
      lastCompletedWash?.date
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Wash frequency updated successfully',
      frequency,
      nextWashDate: user.nextHairWashDate
    });

  } catch (error) {
    console.error('Error updating wash frequency:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update frequency' },
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
      { 
        $set: { 
          hairCareTracking: [],
          nextHairWashDate: null
        } 
      },
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
