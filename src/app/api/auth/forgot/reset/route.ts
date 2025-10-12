import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword, confirmPassword } = await req.json();

    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetOTP +resetOTPExpiry +password');
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

    // update password
    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.resetOTP = undefined as any;
    user.resetOTPExpiry = undefined as any;
    await user.save();

    // generate token and set cookie
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    ) as unknown as string;
    const response = NextResponse.json({ success: true, message: 'Password reset successful', token });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return response;
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ success: false, message: 'Password reset failed' }, { status: 500 });
  }
}
