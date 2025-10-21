import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/database'
import User from '@/models/user.model'
import { decode } from 'next-auth/jwt'
import { getNutrientData, type NutrientData, type MealItem } from '@/utils/getNutrientData'

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

/**
 * Helper function to find existing meal with nutrient data
 * Checks both meals and recentMeals arrays
 */
function findExistingMeal(user: any, mealName: string): MealItem | null {
  const nameLower = mealName.toLowerCase().trim()

  // Check recentMeals first (most recently used meals with nutrients)
  if (user.recentMeals && Array.isArray(user.recentMeals)) {
    const found = user.recentMeals.find(
      (m: MealItem) => m.name.toLowerCase().trim() === nameLower
    )
    if (found && found.carbs !== undefined) {
      return found
    }
  }

  // Check all historical meals
  if (user.meals && Array.isArray(user.meals)) {
    for (const dayEntry of user.meals) {
      for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks']) {
        const mealArray = dayEntry[mealType] || []
        const found = mealArray.find(
          (m: MealItem) => m.name.toLowerCase().trim() === nameLower
        )
        if (found && found.carbs !== undefined) {
          return found
        }
      }
    }
  }

  return null
}

/**
 * Add or update a meal in recentMeals (limit to 50 most recent)
 */
function updateRecentMeals(user: any, mealItem: MealItem) {
  if (!user.recentMeals) {
    user.recentMeals = []
  }

  // Remove existing entry with same name (case-insensitive)
  user.recentMeals = user.recentMeals.filter(
    (m: MealItem) => m.name.toLowerCase().trim() !== mealItem.name.toLowerCase().trim()
  )

  // Add to beginning
  user.recentMeals.unshift(mealItem)

  // Keep only the 50 most recent
  if (user.recentMeals.length > 50) {
    user.recentMeals = user.recentMeals.slice(0, 50)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { mealType, items, date } = body as { 
      mealType: string; 
      items: Array<{ name: string; quantity?: number; unit?: string }> | string[]; 
      date?: string 
    }

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

    // Handle date properly - if string format YYYY-MM-DD, parse it without timezone conversion
    let targetDate: Date;
    if (date) {
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // YYYY-MM-DD format - parse as local date
        const [year, month, day] = date.split('-').map(Number);
        targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      } else {
        // ISO string or other format
        targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
      }
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }
    
    console.log('📅 Parsed target date:', targetDate.toISOString());
    console.log('📅 Local date string:', targetDate.toLocaleDateString());

    // Initialize meals array if not exists
    if (!user.meals) {
      user.meals = []
    }

    // Find existing entry for the target date
    let dayEntryIndex = user.meals.findIndex((m: any) => {
      const d = new Date(m.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === targetDate.getTime()
    })

    let dayEntry: any
    if (dayEntryIndex === -1) {
      // Create new day entry
      dayEntry = { date: targetDate, breakfast: [], lunch: [], dinner: [], snacks: [] }
      user.meals.push(dayEntry)
      dayEntryIndex = user.meals.length - 1
    } else {
      dayEntry = user.meals[dayEntryIndex]
    }

    // Process each meal item
    const processedMeals: MealItem[] = []

    for (const item of items) {
      // Handle both string and object formats for backward compatibility
      const itemName = typeof item === 'string' ? item : item.name
      const quantity = typeof item === 'object' && item.quantity ? item.quantity : 1
      const unit = typeof item === 'object' && item.unit ? item.unit : 'serving'
      
      const trimmedName = itemName.trim()
      if (!trimmedName) continue

      // 1. Check if meal already exists with nutrient data
      const existingMeal = findExistingMeal(user, trimmedName)

      if (existingMeal && existingMeal.carbs !== undefined) {
        // Reuse existing nutrient data and scale by quantity
        const scaledMeal: MealItem = {
          name: trimmedName,
          quantity,
          unit,
          carbs: existingMeal.carbs ? existingMeal.carbs * quantity : undefined,
          protein: existingMeal.protein ? existingMeal.protein * quantity : undefined,
          fat: existingMeal.fat ? existingMeal.fat * quantity : undefined,
          fiber: existingMeal.fiber ? existingMeal.fiber * quantity : undefined,
          calories: existingMeal.calories ? existingMeal.calories * quantity : undefined,
        }
        processedMeals.push(scaledMeal)
        
        // Store base meal (quantity = 1) in recentMeals
        updateRecentMeals(user, {
          name: trimmedName,
          quantity: 1,
          unit,
          carbs: existingMeal.carbs,
          protein: existingMeal.protein,
          fat: existingMeal.fat,
          fiber: existingMeal.fiber,
          calories: existingMeal.calories,
        })
      } else {
        // 2. Meal is new OR missing nutrient data - fetch from Gemini
        const nutrientData = await getNutrientData(trimmedName)

        if (nutrientData) {
          // Scale nutrients by quantity
          const mealItem: MealItem = {
            name: trimmedName,
            quantity,
            unit,
            carbs: nutrientData.carbs * quantity,
            protein: nutrientData.protein * quantity,
            fat: nutrientData.fat * quantity,
            fiber: nutrientData.fiber * quantity,
            calories: nutrientData.calories * quantity,
          }
          processedMeals.push(mealItem)
          
          // Store base meal (quantity = 1) in recentMeals
          updateRecentMeals(user, {
            name: trimmedName,
            quantity: 1,
            unit,
            carbs: nutrientData.carbs,
            protein: nutrientData.protein,
            fat: nutrientData.fat,
            fiber: nutrientData.fiber,
            calories: nutrientData.calories,
          })
        } else {
          // No nutrient data available
          const mealItem: MealItem = {
            name: trimmedName,
            quantity,
            unit,
          }
          processedMeals.push(mealItem)
        }
      }
    }

    // 4. Add processed meals to the day entry
    if (!dayEntry[mealType]) {
      dayEntry[mealType] = []
    }
    dayEntry[mealType].push(...processedMeals)

    // Mark the meals array as modified for Mongoose to track changes
    user.markModified('meals')
    
    console.log('📝 Saving meal to database...');
    console.log('📝 Date:', targetDate.toISOString());
    console.log('📝 Meal type:', mealType);
    console.log('📝 Items:', processedMeals.map(m => m.name).join(', '));

    // 5. Update daily tracking with the added nutrients
    const totalCalories = processedMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalProtein = processedMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = processedMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFat = processedMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

    // Initialize dailyTracking if not exists
    if (!user.dailyTracking) {
      user.dailyTracking = [];
    }

    // Find today's tracking entry
    let todayTracking = user.dailyTracking.find((day: any) => {
      const trackingDate = new Date(day.date);
      trackingDate.setHours(0, 0, 0, 0);
      return trackingDate.getTime() === targetDate.getTime();
    });

    if (!todayTracking) {
      // Create new tracking entry for the day
      todayTracking = {
        date: targetDate,
        waterIntake: 0,
        waterGoal: 8,
        exerciseMinutes: 0,
        exerciseGoal: 60,
        caloriesConsumed: totalCalories,
        caloriesGoal: 2000,
        proteinConsumed: totalProtein,
        proteinGoal: 150,
        carbsConsumed: totalCarbs,
        carbsGoal: 250,
        fatConsumed: totalFat,
        fatGoal: 65,
        stepsCount: 0,
        stepsGoal: 10000,
        sleepHours: 0,
        sleepGoal: 8,
        completed: false
      } as any;
      user.dailyTracking.push(todayTracking);
    } else {
      // Update existing tracking entry
      todayTracking.caloriesConsumed = (todayTracking.caloriesConsumed || 0) + totalCalories;
      todayTracking.proteinConsumed = (todayTracking.proteinConsumed || 0) + totalProtein;
      todayTracking.carbsConsumed = (todayTracking.carbsConsumed || 0) + totalCarbs;
      todayTracking.fatConsumed = (todayTracking.fatConsumed || 0) + totalFat;
      
      // Check if all goals are met
      todayTracking.completed = 
        todayTracking.waterIntake >= todayTracking.waterGoal &&
        todayTracking.exerciseMinutes >= todayTracking.exerciseGoal &&
        todayTracking.caloriesConsumed <= todayTracking.caloriesGoal * 1.1;
    }

    user.markModified('dailyTracking');

    // Save everything atomically
    await user.save()
    
    console.log('✅ SAVED TO DATABASE');
    console.log('✅ Total meal days in DB:', user.meals.length);
    console.log('✅ Latest meal date:', user.meals[user.meals.length - 1]?.date);

    return NextResponse.json({ 
      success: true, 
      message: 'Meal added', 
      meals: user.meals,
      addedMeals: processedMeals,
      trackingUpdated: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      }
    })
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

    console.log('📖 GET /api/profile/meals');
    console.log('📖 User:', user.email);
    console.log('📖 Total meal days:', user.meals?.length || 0);
    if (user.meals && user.meals.length > 0) {
      const dates = user.meals.map((m: any) => new Date(m.date).toLocaleDateString()).slice(-5);
      console.log('📖 Recent dates:', dates.join(', '));
    }

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

    // Handle date properly - same as POST
    let targetDate: Date;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // YYYY-MM-DD format - parse as local date
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      // ISO string or other format
      targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
    }

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

    // Get nutrients from the meal being removed for tracking adjustment
    const removedMeal = mealArray[itemIndex];
    const removedCalories = removedMeal?.calories || 0;
    const removedProtein = removedMeal?.protein || 0;
    const removedCarbs = removedMeal?.carbs || 0;
    const removedFat = removedMeal?.fat || 0;

    mealArray.splice(itemIndex, 1)
    dayEntry[mealType] = mealArray

    // Update daily tracking by subtracting removed nutrients
    if (user.dailyTracking) {
      const todayTracking = user.dailyTracking.find((day: any) => {
        const trackingDate = new Date(day.date);
        trackingDate.setHours(0, 0, 0, 0);
        return trackingDate.getTime() === targetDate.getTime();
      });

      if (todayTracking) {
        todayTracking.caloriesConsumed = Math.max(0, (todayTracking.caloriesConsumed || 0) - removedCalories);
        todayTracking.proteinConsumed = Math.max(0, (todayTracking.proteinConsumed || 0) - removedProtein);
        todayTracking.carbsConsumed = Math.max(0, (todayTracking.carbsConsumed || 0) - removedCarbs);
        todayTracking.fatConsumed = Math.max(0, (todayTracking.fatConsumed || 0) - removedFat);
        
        // Recheck completion status
        todayTracking.completed = 
          todayTracking.waterIntake >= todayTracking.waterGoal &&
          todayTracking.exerciseMinutes >= todayTracking.exerciseGoal &&
          todayTracking.caloriesConsumed <= todayTracking.caloriesGoal * 1.1;
        
        user.markModified('dailyTracking');
      }
    }

    await user.save()

    return NextResponse.json({ success: true, message: 'Meal item removed', meals: user.meals })
  } catch (err: any) {
    console.error('Delete meal error:', err)
    return NextResponse.json({ success: false, message: 'Failed to remove meal' }, { status: 500 })
  }
}
