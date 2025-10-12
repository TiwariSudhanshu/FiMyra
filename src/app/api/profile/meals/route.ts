import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/database'
import User from '@/models/user.model'
import { decode } from 'next-auth/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'

async function getUserIdFromReq(req: Request | any) {
  // Try next-auth token
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

  // fallback to auth-token cookie
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
    const body = await req.json()
    const { mealType, items } = body as { mealType: string; items: string[] }

    if (!mealType || !['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return NextResponse.json({ success: false, message: 'Invalid mealType' }, { status: 400 })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 })
    }

    const userId = await getUserIdFromReq(req)
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find existing entry for today
    let dayEntry = (user.meals || []).find((m: any) => {
      const d = new Date(m.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    if (!dayEntry) {
      dayEntry = { date: today, breakfast: [], lunch: [], dinner: [] }
      user.meals.push(dayEntry)
    }

    // append items
    dayEntry[mealType] = [...(dayEntry[mealType] || []), ...items]

    await user.save()

    return NextResponse.json({ success: true, message: 'Meal added', meals: user.meals })
  } catch (err: any) {
    console.error('Add meal error:', err)
    return NextResponse.json({ success: false, message: 'Failed to add meal' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromReq(req)
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    return NextResponse.json({ success: true, meals: user.meals || [] })
  } catch (err: any) {
    console.error('Get meals error:', err)
    return NextResponse.json({ success: false, message: 'Failed to fetch meals' }, { status: 500 })
  }
}
