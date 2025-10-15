/**
 * Aura Score API Endpoints
 * 
 * GET  /api/aura-score - Get current score and history
 * POST /api/aura-score - Calculate/update Aura Score
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { decode } from 'next-auth/jwt';
import { calculateAuraScore, getAuraScoreHistory } from '@/utils/auraScore';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

async function getUserIdFromReq(req: Request | any) {
  const cookies = (req.cookies && typeof req.cookies.get === 'function') ? req.cookies : null;
  let userId: string | null = null;

  if (cookies) {
    const nextAuthToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value;
    if (nextAuthToken) {
      try {
        const decoded = await decode({ token: nextAuthToken, secret: process.env.NEXTAUTH_SECRET! });
        if (decoded?.userId) userId = decoded.userId as string;
        else if (decoded?.sub) userId = decoded.sub as string;
      } catch (e) {
        // ignore
      }
    }
  }

  if (!userId && cookies) {
    const token = cookies.get('auth-token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (e) {
        // ignore
      }
    }
  }

  return userId;
}

/**
 * GET /api/aura-score
 * Fetch user's current Aura Score and history
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getUserIdFromReq(req);
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized - Please login' 
        },
        { status: 401 }
      );
    }
    
    // Get query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // Fetch Aura Score history
    const result = await getAuraScoreHistory(userId, limit);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Failed to fetch Aura Score' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      currentScore: result.currentScore,
      lastUpdated: result.lastUpdated,
      history: result.history,
      message: 'Aura Score fetched successfully'
    });
    
  } catch (error) {
    console.error('Error in GET /api/aura-score:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aura-score
 * Calculate and update user's Aura Score
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getUserIdFromReq(req);
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized - Please login' 
        },
        { status: 401 }
      );
    }
    
    // Calculate Aura Score
    const result = await calculateAuraScore(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.error || 'Failed to calculate Aura Score' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      auraScore: result.auraScore,
      breakdown: result.breakdown,
      weights: result.weights,
      updatedAt: result.updatedAt,
      message: 'Aura Score calculated successfully'
    });
    
  } catch (error) {
    console.error('Error in POST /api/aura-score:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
