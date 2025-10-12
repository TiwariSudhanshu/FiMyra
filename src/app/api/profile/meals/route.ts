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
    const { mealType, items, date } = body as { mealType: string; items: string[]; date?: string }

    if (!mealType || !['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
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

    const targetDate = date ? new Date(date) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    // Find existing entry for the target date
    let dayEntry = (user.meals || []).find((m: any) => {
      const d = new Date(m.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === targetDate.getTime()
    })

    if (!dayEntry) {
      dayEntry = { date: targetDate, breakfast: [], lunch: [], dinner: [], snacks: [] }
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

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { mealType, itemIndex, date } = body as { mealType: string; itemIndex: number; date: string }

    if (!mealType || !['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
      return NextResponse.json({ success: false, message: 'Invalid mealType' }, { status: 400 })
    }
    if (itemIndex === undefined || itemIndex < 0) {
      return NextResponse.json({ success: false, message: 'Invalid item index' }, { status: 400 })
    }
    if (!date) {
      return NextResponse.json({ success: false, message: 'Date is required' }, { status: 400 })
    }

    const userId = await getUserIdFromReq(req)
    if (!userId) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })

    await connectDB()
    const user = await User.findById(userId)
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)

    // Find existing entry for the date
    const dayEntry = (user.meals || []).find((m: any) => {
      const d = new Date(m.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === targetDate.getTime()
    })

    if (!dayEntry) {
      return NextResponse.json({ success: false, message: 'No meals found for this date' }, { status: 404 })
    }

    // Remove item from the array
    const mealArray = dayEntry[mealType] || []
    if (itemIndex >= mealArray.length) {
      return NextResponse.json({ success: false, message: 'Item index out of range' }, { status: 400 })
    }

    mealArray.splice(itemIndex, 1)
    dayEntry[mealType] = mealArray

    await user.save()

    return NextResponse.json({ success: true, message: 'Meal item removed', meals: user.meals })
  } catch (err: any) {
    console.error('Delete meal error:', err)
    return NextResponse.json({ success: false, message: 'Failed to remove meal' }, { status: 500 })
  }
}
