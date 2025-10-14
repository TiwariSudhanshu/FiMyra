import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/database'
import User from '@/models/user.model'
import { decode } from 'next-auth/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'

async function getUserIdFromReq(req: Request | any) {
  const cookies = (req.cookies && typeof req.cookies.get === 'function') ? req.cookies : null
  let userId: string | null = null

  if (cookies) {
    const nextAuthToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value
    if (nextAuthToken) {
      try {
        const decoded = await decode({ token: nextAuthToken, secret: process.env.NEXTAUTH_SECRET! })
        if (decoded?.userId) userId = decoded.userId as string
        else if (decoded?.sub) userId = decoded.sub as string
      } catch (e) {
        // ignore
      }
    }
  }

  if (!userId && cookies) {
    const token = cookies.get('auth-token')?.value
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        userId = decoded.userId
      } catch (e) {
        // ignore
      }
    }
  }

  return userId
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromReq(req)
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })

    const body = await req.json()
    const { type, currentWeight, targetWeight, duration, startDate } = body

    if (!type || !currentWeight || !targetWeight || !duration) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    // Save goal
    user.goal = {
      type,
      currentWeight,
      targetWeight,
      duration,
      startDate: startDate || new Date().toISOString()
    }

    await user.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Goal saved successfully',
      goal: user.goal
    })
  } catch (err: any) {
    console.error('Save goal error:', err)
    return NextResponse.json({ success: false, message: 'Failed to save goal' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromReq(req)
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    return NextResponse.json({ 
      success: true, 
      goal: user.goal || null
    })
  } catch (err: any) {
    console.error('Get goal error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch goal' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromReq(req)
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    user.goal = undefined
    await user.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Goal deleted successfully'
    })
  } catch (err: any) {
    console.error('Delete goal error:', err)
    return NextResponse.json({ success: false, message: 'Failed to delete goal' }, { status: 500 })
  }
}
