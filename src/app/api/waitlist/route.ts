import { NextResponse } from 'next/server';
import { connectDB } from '@/database';
import Waitlist from '@/models/waitlist.model';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email already exists
    const existingEntry = await Waitlist.findOne({ email: email.toLowerCase() });
    if (existingEntry) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'You\'re already on the waitlist! We\'ll notify you soon.',
          alreadyExists: true 
        },
        { status: 200 }
      );
    }

    // Create new waitlist entry
    const waitlistEntry = await Waitlist.create({
      email: email.toLowerCase(),
      source: source || 'homepage',
      status: 'pending'
    });

    return NextResponse.json(
      {
        success: true,
        message: '✅ Waitlisted for upcoming premium features',
        data: {
          email: waitlistEntry.email,
          subscribedAt: waitlistEntry.subscribedAt
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to join waitlist. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Only for admin purposes - you might want to add authentication here
    await connectDB();
    
    const count = await Waitlist.countDocuments({ status: 'pending' });
    
    return NextResponse.json(
      {
        success: true,
        count
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch waitlist data' },
      { status: 500 }
    );
  }
}
