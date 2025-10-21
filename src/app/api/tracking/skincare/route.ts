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

// GET - Fetch skin care tracking history and profile
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

    const user = await User.findById(userId).select('skinCareTracking skinCareProfile');
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
      profile: user.skinCareProfile || null,
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

// POST - Update/Create skin care tracking for today (including individual steps)
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
    const { morningRoutineCompleted, eveningRoutineCompleted, notes, step, routine } = body;

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

    // Handle individual step completion
    if (step && routine) {
      if (trackingIndex >= 0) {
        // Check if step already completed today
        const existingStep = user.skinCareTracking![trackingIndex].completedSteps?.find(
          (s: any) => s.step === step && s.routine === routine
        );

        if (existingStep) {
          return NextResponse.json({
            success: false,
            message: 'Step already completed today'
          }, { status: 400 });
        }

        // Add step to completedSteps
        if (!user.skinCareTracking![trackingIndex].completedSteps) {
          user.skinCareTracking![trackingIndex].completedSteps = [];
        }
        user.skinCareTracking![trackingIndex].completedSteps!.push({
          step,
          time: new Date(),
          routine
        } as any);
      } else {
        // Create new tracking entry with this step
        if (!user.skinCareTracking) {
          user.skinCareTracking = [];
        }
        user.skinCareTracking.push({
          date: today,
          morningRoutineCompleted: false,
          eveningRoutineCompleted: false,
          notes: '',
          completedSteps: [{
            step,
            time: new Date(),
            routine
          }]
        } as any);
      }

      await user.save();

      // Check if all steps for this routine are completed
      const updatedTrackingIndex = user.skinCareTracking?.findIndex(
        (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === today.getTime()
      ) ?? -1;

      if (updatedTrackingIndex >= 0) {
        const completedSteps = user.skinCareTracking![updatedTrackingIndex].completedSteps || [];
        const routineSteps = routine === 'morning' 
          ? user.skinCareProfile?.morningSteps?.filter((s: any) => s.enabled) 
          : user.skinCareProfile?.eveningSteps?.filter((s: any) => s.enabled);

        const completedRoutineSteps = completedSteps.filter((s: any) => s.routine === routine);
        const allStepsCompleted = routineSteps && completedRoutineSteps.length >= routineSteps.length;

        if (allStepsCompleted) {
          // Mark routine as completed
          if (routine === 'morning') {
            user.skinCareTracking![updatedTrackingIndex].morningRoutineCompleted = true;
          } else {
            user.skinCareTracking![updatedTrackingIndex].eveningRoutineCompleted = true;
          }

          // Add activity feed entry
          if (!user.activities) {
            user.activities = [];
          }
          user.activities.unshift({
            type: 'milestone',
            title: routine === 'morning' ? '🌅 Morning Skincare Completed!' : '🌙 Evening Skincare Completed!',
            description: `Completed all ${routineSteps?.length || 0} steps of your ${routine} skincare routine`,
            icon: routine === 'morning' ? '☀️' : '🌜',
            timestamp: new Date(),
            read: false
          } as any);

          await user.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Step completed successfully',
        tracking: user.skinCareTracking?.find(
          (track: any) => new Date(track.date).setHours(0, 0, 0, 0) === today.getTime()
        )
      });
    }

    // Handle whole routine update (existing functionality)
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
