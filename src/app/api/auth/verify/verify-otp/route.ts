import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/utils/otpStore';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData) {
      return NextResponse.json(
        { success: false, message: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from store
    otpStore.delete(email.toLowerCase());

    return NextResponse.json(
      { success: true, message: 'Email verified successfully!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
