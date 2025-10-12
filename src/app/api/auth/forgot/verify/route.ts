import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetOTP +resetOTPExpiry');
    if (!user || !user.resetOTP || !user.resetOTPExpiry) {
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    if (user.resetOTPExpiry < new Date()) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    // success
    return NextResponse.json({ success: true, message: 'OTP verified' });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
  }
}
