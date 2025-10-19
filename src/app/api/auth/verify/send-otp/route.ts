import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import { Resend } from 'resend';
import { otpStore, generateOTP } from '@/utils/otpStore';
import { SignupOTPTemplate } from '@/app/components/templates/signup-otp';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (in production, use Redis or database)
    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    // Send OTP email
    console.log('🔄 Attempting to send OTP email to:', email);
    console.log('📧 OTP Code:', otp);
    console.log('🔑 Resend API Key exists:', !!process.env.RESEND_API_KEY);
    
    try {
      const emailResult = await resend.emails.send({
        from: 'FiMyra <onboarding@resend.dev>',
        to: [email],
        subject: 'Verify Your Email - FiMyra',
        react: SignupOTPTemplate({ firstName: name || 'there', otp }),
      });

      console.log('✅ Email sent successfully:', emailResult);

      return NextResponse.json(
        { 
          success: true, 
          message: 'OTP sent successfully. Please check your email.',
          // Include OTP in development for testing (remove in production)
          ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
        },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error('❌ Email sending error:', emailError);
      console.error('Error details:', {
        name: emailError.name,
        message: emailError.message,
        stack: emailError.stack
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to send OTP email. Please try again.' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
