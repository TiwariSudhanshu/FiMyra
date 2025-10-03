import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT Secret - In production, use a strong environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

/**
 * Authentication Middleware
 * Verifies JWT token and adds user info to request
 */
export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Access denied. No token provided.' 
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Add user info to headers for the next handler
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-email', decoded.email);
    requestHeaders.set('x-user-name', decoded.name);

    // Return NextResponse with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;

  } catch (error: any) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token' 
        },
        { status: 401 }
      );
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token expired' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Authentication failed' 
      },
      { status: 401 }
    );
  }
}

/**
 * Check if user is authenticated (for client-side usage)
 * Returns user data or null
 */
export async function getAuthUser(request: NextRequest): Promise<any | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };

  } catch (error) {
    return null;
  }
}

/**
 * Redirect middleware for protected routes
 * Redirects to login if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Verify token
    jwt.verify(token, JWT_SECRET);
    
    // Token is valid, proceed
    return NextResponse.next();

  } catch (error) {
    // Token is invalid, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}