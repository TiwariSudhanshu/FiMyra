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

// GET - Fetch skin care profile
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

    const user = await User.findById(userId).select('skinCareProfile healthProfile');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      skinCareProfile: user.skinCareProfile || null,
      age: user.healthProfile?.age || null
    });

  } catch (error) {
    console.error('Error fetching skin care profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch skin care profile' },
      { status: 500 }
    );
  }
}

// POST - Save/Update skin care profile
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
    const { skinType, concerns, routine, goals, notes } = body;

    // Validation
    if (!skinType) {
      return NextResponse.json(
        { success: false, message: 'Skin type is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          skinCareProfile: {
            skinType,
            concerns: concerns || [],
            routine: {
              morning: routine?.morning || [],
              evening: routine?.evening || [],
              products: routine?.products || []
            },
            goals: goals || [],
            notes: notes || '',
            updatedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).select('skinCareProfile');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Skin care profile saved successfully',
      skinCareProfile: user.skinCareProfile
    });

  } catch (error) {
    console.error('Error saving skin care profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save skin care profile' },
      { status: 500 }
    );
  }
}
