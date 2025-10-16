import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import { Resend } from 'resend';
import { otpStore, generateOTP } from '@/utils/otpStore';

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
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to FiMyra! 🎯</h1>
                </div>
                <div class="content">
                  <h2>Hello ${name || 'there'}!</h2>
                  <p>Thank you for signing up with FiMyra. To complete your registration, please verify your email address.</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0 0 10px 0; color: #666;">Your verification code is:</p>
                    <div class="otp-code">${otp}</div>
                  </div>
                  
                  <p><strong>This code will expire in 10 minutes.</strong></p>
                  
                  <p>If you didn't request this code, please ignore this email.</p>
                  
                  <p>Best regards,<br>The FiMyra Team</p>
                </div>
                <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('✅ Email sent successfully:', emailResult);

      return NextResponse.json(
        { 
          success: true, 
          message: 'OTP sent successfully. Please check your email.' 
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
