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

    const user = await User.findById(userId).select('hairCareProfile healthProfile');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hairCareProfile: user.hairCareProfile || null,
      age: user.healthProfile?.age || null
    });

  } catch (error) {
    console.error('Error fetching hair care profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hair care profile' },
      { status: 500 }
    );
  }
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

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          hairCareProfile: {
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
          }
        }
      },
      { new: true, runValidators: true }
    ).select('hairCareProfile');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hair care profile saved successfully',
      hairCareProfile: user.hairCareProfile
    });

  } catch (error) {
    console.error('Error saving hair care profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save hair care profile' },
      { status: 500 }
    );
  }
}
