import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { EmailTemplate } from '@/app/components/templates/forgot-pass';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+email');
    if (!user) {
      // For security, respond with success even if user not found
      return NextResponse.json({ success: true, message: 'OTP sent if the email exists' });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // store hashed otp and expiry (10 minutes)
    const hashed = await bcrypt.hash(otp, 10);
    user.resetOTP = hashed;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // send email using Resend
    await resend.emails.send({
      from: 'MyApp <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Your OTP for Password Reset',
      react: EmailTemplate({ firstName: firstName || user.name || 'User', otp }),
    });

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error: any) {
    console.error('Forgot request error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}
