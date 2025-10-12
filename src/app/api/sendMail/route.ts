import { NextRequest, NextResponse } from 'next/server';
import { EmailTemplate } from '@/app/components/templates/forgot-pass';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, otp } = body;

    const { data, error } = await resend.emails.send({
      from: 'MyApp <onboarding@resend.dev>',
      to: [email],
      subject: 'Your OTP for Password Reset',
      react: EmailTemplate({ firstName: firstName || 'User', otp }),
    });

    if (error) {
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('sendMail error:', err);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}