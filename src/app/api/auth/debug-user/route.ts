import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';

/**
 * Debug endpoint to check user's password and auth status
 * DELETE THIS FILE IN PRODUCTION!
 * 
 * Usage: GET /api/auth/debug-user?email=user@example.com
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password +resetOTP +resetOTPExpiry');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      debug: {
        email: user.email,
        name: user.name,
        authProvider: user.authProvider || 'NOT SET',
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordPreview: user.password ? user.password.substring(0, 10) + '...' : 'NO PASSWORD',
        hasResetOTP: !!user.resetOTP,
        resetOTPExpiry: user.resetOTPExpiry,
        isResetOTPExpired: user.resetOTPExpiry ? user.resetOTPExpiry < new Date() : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching user data', error: error.message },
      { status: 500 }
    );
  }
}
