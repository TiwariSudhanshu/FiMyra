import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { connectDB } from '@/database';
import User, { type IUser } from '@/models/user.model';

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Initialize Google OAuth2 Client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Interface for Google Token Payload
 */
interface GoogleTokenPayload {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub?: string; // Google user ID
  given_name?: string;
  family_name?: string;
}

/**
 * Interface for Request Body
 */
interface GoogleLoginRequest {
  idToken: string;
}

/**
 * Google Login Controller
 * Verifies Google ID token and creates/authenticates user
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: GoogleLoginRequest = await req.json();
    const { idToken } = body;

    // Validation
    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Google ID token is required'
        },
        { status: 400 }
      );
    }

    // Check if Google Client ID is configured
    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not configured in environment variables');
      return NextResponse.json(
        {
          success: false,
          message: 'Google authentication is not configured'
        },
        { status: 500 }
      );
    }

    // Verify Google ID token
    let payload: GoogleTokenPayload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
      });
      
      const tokenPayload = ticket.getPayload();
      if (!tokenPayload) {
        throw new Error('Invalid token payload');
      }
      
      payload = tokenPayload as GoogleTokenPayload;
    } catch (verifyError: any) {
      console.error('Google token verification failed:', verifyError);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Google token'
        },
        { status: 401 }
      );
    }

    // Validate email from Google
    const { email, email_verified, name, picture, sub: googleId } = payload;

    if (!email || !email_verified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email not verified by Google'
        },
        { status: 400 }
      );
    }

    if (!googleId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Google user ID'
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user exists by email or Google ID
    let user: IUser | null = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    let existingUser: IUser;

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId && user.authProvider === 'local') {
        // User signed up with email/password, now linking Google account
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      } else if (user.googleId !== googleId) {
        // Email exists but with different Google ID - possible security issue
        return NextResponse.json(
          {
            success: false,
            message: 'An account with this email already exists'
          },
          { status: 409 }
        );
      }
      existingUser = user;
    } else {
      // Create new user
      const newUser = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=3b82f6&color=fff&size=128`,
        authProvider: 'google',
        googleId: googleId,
        // No password needed for Google OAuth users
        password: undefined
      });

      existingUser = await newUser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: (existingUser._id as any).toString(),
        email: existingUser.email,
        name: existingUser.name,
        authProvider: existingUser.authProvider
      },
      JWT_SECRET as Secret,
      { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }
    ) as unknown as string;

    // Prepare response data (exclude password)
    const userData = {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      avatar: existingUser.avatar,
      authProvider: existingUser.authProvider,
      profileCompleted: existingUser.profileCompleted,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt
    };

    // Determine if this is a new account or existing login
    const isNewAccount = existingUser.createdAt && existingUser.updatedAt && 
      Math.abs(existingUser.createdAt.getTime() - existingUser.updatedAt.getTime()) < 1000;

    // Create response with token
    const response = NextResponse.json(
      {
        success: true,
        message: isNewAccount ? 'Account created successfully' : 'Login successful',
        user: userData,
        token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return response;

  } catch (error: any) {
    console.error('Google login error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email or Google ID already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again.'
      },
      { status: 500 }
    );
  }
}

/**
 * GET method not allowed
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST request.'
    },
    { status: 405 }
  );
}
