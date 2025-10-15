/**
 * Aura Score Calculation System
 * 
 * This module calculates a user's overall wellness score (0-100)
 * based on multiple health dimensions with weighted formulas.
 */

import User, { IUser } from '@/models/user.model';
import { connectDB } from '@/database';

// ==================== CONFIGURATION ====================

// Weights for each dimension (must sum to 1.0)
const WEIGHTS = {
  nutrition: 0.30,      // 30% - Diet quality and calorie tracking
  activity: 0.25,       // 25% - Exercise, steps, and movement
  consistency: 0.20,    // 20% - Streaks and daily tracking habits
  routines: 0.15,       // 15% - Skin/hair care routines
  goals: 0.10           // 10% - Goal progress and achievement
};

// Configuration for score decay (encourages recent activity)
const DAYS_FOR_FULL_SCORE = 7;  // Data from last 7 days gets full weight
const DECAY_FACTOR = 0.85;       // Older data multiplied by this factor

// ==================== HELPER FUNCTIONS ====================

/**
 * Get date object for N days ago
 */
function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get today's date at midnight
 */
function getToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Calculate how many days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate percentage with bounds
 */
function percentage(current: number, target: number): number {
  if (target === 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}

// ==================== DIMENSION CALCULATORS ====================

/**
 * NUTRITION SCORE (0-100)
 * 
 * Evaluates:
 * - Meal logging consistency (40%)
 * - Calorie target accuracy (25%)
 * - Macro balance (protein, carbs, fat) (25%)
 * - Meal variety and completeness (10%)
 */
async function calculateNutritionScore(user: IUser): Promise<number> {
  let score = 0;
  const today = getToday();
  const sevenDaysAgo = getDaysAgo(7);
  
  // Get recent daily tracking data
  const recentTracking = user.dailyTracking?.filter(day => 
    new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
  ) || [];
  
  // Get recent meals
  const recentMeals = user.meals?.filter(meal => 
    meal.date && new Date(meal.date) >= sevenDaysAgo && new Date(meal.date) <= today
  ) || [];
  
  if (recentTracking.length === 0 && recentMeals.length === 0) {
    return 0; // No data = no score
  }
  
  // 1. MEAL LOGGING CONSISTENCY (40 points)
  // Award points for each day with logged meals
  const daysWithMeals = recentMeals.length;
  const consistencyScore = Math.min((daysWithMeals / 7) * 40, 40);
  score += consistencyScore;
  
  // 2. CALORIE TARGET ACCURACY (25 points)
  // Check how close to calorie goals
  let calorieScore = 0;
  let validCalorieDays = 0;
  
  for (const day of recentTracking) {
    if (day.caloriesGoal > 0 && day.caloriesConsumed > 0) {
      const accuracy = 1 - Math.abs(day.caloriesConsumed - day.caloriesGoal) / day.caloriesGoal;
      calorieScore += clamp(accuracy * 100, 0, 100);
      validCalorieDays++;
    }
  }
  
  if (validCalorieDays > 0) {
    score += (calorieScore / validCalorieDays) * 0.25;
  }
  
  // 3. MACRO BALANCE (25 points)
  // Average macro accuracy across recent days
  let macroScore = 0;
  let validMacroDays = 0;
  
  for (const day of recentTracking) {
    const proteinAccuracy = percentage(day.proteinConsumed, day.proteinGoal);
    const carbsAccuracy = percentage(day.carbsConsumed, day.carbsGoal);
    const fatAccuracy = percentage(day.fatConsumed, day.fatGoal);
    
    if (day.proteinGoal > 0 || day.carbsGoal > 0 || day.fatGoal > 0) {
      const avgMacro = (proteinAccuracy + carbsAccuracy + fatAccuracy) / 3;
      macroScore += avgMacro;
      validMacroDays++;
    }
  }
  
  if (validMacroDays > 0) {
    score += (macroScore / validMacroDays) * 0.25;
  }
  
  // 4. MEAL VARIETY (10 points)
  // Check if user logs breakfast, lunch, dinner (not just one meal type)
  let varietyScore = 0;
  for (const meal of recentMeals) {
    const hasBreakfast = meal.breakfast && meal.breakfast.length > 0;
    const hasLunch = meal.lunch && meal.lunch.length > 0;
    const hasDinner = meal.dinner && meal.dinner.length > 0;
    
    const mealTypes = [hasBreakfast, hasLunch, hasDinner].filter(Boolean).length;
    varietyScore += (mealTypes / 3) * 10;
  }
  
  if (recentMeals.length > 0) {
    score += varietyScore / recentMeals.length;
  }
  
  return clamp(score, 0, 100);
}

/**
 * ACTIVITY SCORE (0-100)
 * 
 * Evaluates:
 * - Exercise minutes vs goal (40%)
 * - Steps count vs goal (30%)
 * - Consistency of activity (20%)
 * - Sleep quality (10%)
 */
async function calculateActivityScore(user: IUser): Promise<number> {
  let score = 0;
  const today = getToday();
  const sevenDaysAgo = getDaysAgo(7);
  
  const recentTracking = user.dailyTracking?.filter(day => 
    new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
  ) || [];
  
  if (recentTracking.length === 0) {
    return 0;
  }
  
  // 1. EXERCISE MINUTES (40 points)
  let exerciseScore = 0;
  let validExerciseDays = 0;
  
  for (const day of recentTracking) {
    if (day.exerciseGoal > 0) {
      const accuracy = percentage(day.exerciseMinutes, day.exerciseGoal);
      exerciseScore += accuracy;
      validExerciseDays++;
    }
  }
  
  if (validExerciseDays > 0) {
    score += (exerciseScore / validExerciseDays) * 0.40;
  }
  
  // 2. STEPS COUNT (30 points)
  let stepsScore = 0;
  let validStepsDays = 0;
  
  for (const day of recentTracking) {
    if (day.stepsGoal && day.stepsGoal > 0) {
      const accuracy = percentage(day.stepsCount || 0, day.stepsGoal);
      stepsScore += accuracy;
      validStepsDays++;
    }
  }
  
  if (validStepsDays > 0) {
    score += (stepsScore / validStepsDays) * 0.30;
  }
  
  // 3. ACTIVITY CONSISTENCY (20 points)
  // Award points for having any activity on each day
  let activeDays = 0;
  for (const day of recentTracking) {
    if (day.exerciseMinutes > 0 || (day.stepsCount && day.stepsCount > 0)) {
      activeDays++;
    }
  }
  
  score += (activeDays / 7) * 20;
  
  // 4. SLEEP QUALITY (10 points)
  let sleepScore = 0;
  let validSleepDays = 0;
  
  for (const day of recentTracking) {
    if (day.sleepGoal && day.sleepGoal > 0) {
      const accuracy = percentage(day.sleepHours || 0, day.sleepGoal);
      sleepScore += accuracy;
      validSleepDays++;
    }
  }
  
  if (validSleepDays > 0) {
    score += (sleepScore / validSleepDays) * 0.10;
  }
  
  return clamp(score, 0, 100);
}

/**
 * CONSISTENCY SCORE (0-100)
 * 
 * Evaluates:
 * - Current streak length (35%)
 * - Water intake tracking (20%)
 * - Daily completion rate (20%)
 * - Daily habits completion (25%)
 */
async function calculateConsistencyScore(user: IUser): Promise<number> {
  let score = 0;
  
  // 1. STREAK LENGTH (35 points)
  // Award points based on current streak (max out at 30 days)
  const currentStreak = user.streaks?.currentStreak || 0;
  const streakScore = Math.min((currentStreak / 30) * 35, 35);
  score += streakScore;
  
  // 2. WATER INTAKE TRACKING (20 points)
  const today = getToday();
  const sevenDaysAgo = getDaysAgo(7);
  
  const recentTracking = user.dailyTracking?.filter(day => 
    new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
  ) || [];
  
  let waterScore = 0;
  let validWaterDays = 0;
  
  for (const day of recentTracking) {
    if (day.waterGoal > 0) {
      const accuracy = percentage(day.waterIntake, day.waterGoal);
      waterScore += accuracy;
      validWaterDays++;
    }
  }
  
  if (validWaterDays > 0) {
    score += (waterScore / validWaterDays) * 0.20;
  }
  
  // 3. DAILY COMPLETION RATE (20 points)
  // How many days were marked as "completed"
  const completedDays = recentTracking.filter(day => day.completed).length;
  score += (completedDays / 7) * 20;
  
  // 4. DAILY HABITS COMPLETION (25 points)
  // Check habit completion rates from last 7 days
  const recentHabits = user.dailyHabits?.filter(day => 
    new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
  ) || [];
  
  if (recentHabits.length > 0) {
    let totalCompletionRate = 0;
    for (const habitDay of recentHabits) {
      totalCompletionRate += habitDay.completionRate || 0;
    }
    const avgCompletionRate = totalCompletionRate / recentHabits.length;
    score += (avgCompletionRate / 100) * 25;
  }
  
  return clamp(score, 0, 100);
}

/**
 * ROUTINES SCORE (0-100)
 * 
 * Evaluates:
 * - Skin care routine completion (50%)
 * - Hair care routine completion (50%)
 */
async function calculateRoutinesScore(user: IUser): Promise<number> {
  let score = 0;
  const today = getToday();
  const sevenDaysAgo = getDaysAgo(7);
  
  // 1. SKIN CARE ROUTINE (50 points)
  const skinTracking = user.skinCareTracking?.filter(day => 
    new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
  ) || [];
  
  if (skinTracking.length > 0) {
    let skinScore = 0;
    for (const day of skinTracking) {
      // Award points for completing both morning and evening routines
      const morningPoints = day.morningRoutineCompleted ? 0.5 : 0;
      const eveningPoints = day.eveningRoutineCompleted ? 0.5 : 0;
      skinScore += (morningPoints + eveningPoints) * 100;
    }
    score += (skinScore / skinTracking.length) * 0.50;
  } else if (user.skinCareProfile?.skinType) {
    // If they have a profile but no tracking, give partial credit
    score += 10;
  }
  
  // 2. HAIR CARE ROUTINE (50 points)
  const hairTracking = user.hairCareTracking?.filter(day => 
    new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
  ) || [];
  
  if (hairTracking.length > 0) {
    let hairScore = 0;
    for (const day of hairTracking) {
      if (day.washScheduled) {
        // If wash was scheduled, award points based on completion
        if (day.washCompleted) {
          hairScore += 100; // Full points for completing scheduled wash
        } else if (!day.skipped) {
          hairScore += 50; // Partial points if not skipped but not completed
        }
      }
    }
    
    const scheduledDays = hairTracking.filter(d => d.washScheduled).length;
    if (scheduledDays > 0) {
      score += (hairScore / scheduledDays) * 0.50;
    }
  } else if (user.hairCareProfile?.hairType) {
    // If they have a profile but no tracking, give partial credit
    score += 10;
  }
  
  return clamp(score, 0, 100);
}

/**
 * GOALS SCORE (0-100)
 * 
 * Evaluates:
 * - Goal existence and completeness (30%)
 * - Progress toward weight goal (40%)
 * - Time on track vs duration (30%)
 */
async function calculateGoalsScore(user: IUser): Promise<number> {
  let score = 0;
  
  // 1. GOAL COMPLETENESS (30 points)
  if (user.goal) {
    const hasType = !!user.goal.type;
    const hasCurrentWeight = user.goal.currentWeight > 0;
    const hasTargetWeight = user.goal.targetWeight > 0;
    const hasDuration = user.goal.duration > 0;
    const hasStartDate = !!user.goal.startDate;
    
    const completeness = [hasType, hasCurrentWeight, hasTargetWeight, hasDuration, hasStartDate]
      .filter(Boolean).length;
    
    score += (completeness / 5) * 30;
    
    // 2. WEIGHT PROGRESS (40 points)
    if (hasCurrentWeight && hasTargetWeight && user.goal.startDate) {
      const startWeight = user.goal.currentWeight;
      const targetWeight = user.goal.targetWeight;
      
      // Get most recent weight from tracking
      const recentTracking = user.dailyTracking?.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // For now, use profile weight if available
      const currentWeight = user.healthProfile?.weight || startWeight;
      
      const totalWeightChange = Math.abs(targetWeight - startWeight);
      const currentWeightChange = Math.abs(currentWeight - startWeight);
      
      if (totalWeightChange > 0) {
        const progressPercent = (currentWeightChange / totalWeightChange) * 100;
        score += clamp(progressPercent * 0.40, 0, 40);
      }
    }
    
    // 3. TIME ON TRACK (30 points)
    if (user.goal.startDate && user.goal.duration > 0) {
      const startDate = new Date(user.goal.startDate);
      const today = new Date();
      const daysElapsed = daysBetween(startDate, today);
      const totalDays = user.goal.duration * 30; // Convert months to days
      
      // Award points for being on track (linear progress)
      const timeProgress = Math.min((daysElapsed / totalDays) * 100, 100);
      score += timeProgress * 0.30;
    }
  }
  
  return clamp(score, 0, 100);
}

// ==================== MAIN CALCULATION FUNCTION ====================

/**
 * Calculate the overall Aura Score for a user
 * 
 * @param userId - MongoDB ObjectId of the user
 * @returns Object containing total score, breakdown, and metadata
 */
export async function calculateAuraScore(userId: string) {
  try {
    // Connect to database
    await connectDB();
    
    // Fetch user with all data
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Calculate each dimension score
    const nutritionScore = await calculateNutritionScore(user);
    const activityScore = await calculateActivityScore(user);
    const consistencyScore = await calculateConsistencyScore(user);
    const routinesScore = await calculateRoutinesScore(user);
    const goalsScore = await calculateGoalsScore(user);
    
    // Calculate weighted total score
    const totalScore = Math.round(
      (nutritionScore * WEIGHTS.nutrition) +
      (activityScore * WEIGHTS.activity) +
      (consistencyScore * WEIGHTS.consistency) +
      (routinesScore * WEIGHTS.routines) +
      (goalsScore * WEIGHTS.goals)
    );
    
    // Prepare breakdown
    const breakdown = {
      nutrition: Math.round(nutritionScore),
      activity: Math.round(activityScore),
      consistency: Math.round(consistencyScore),
      routines: Math.round(routinesScore),
      goals: Math.round(goalsScore)
    };
    
    // Update user record
    user.auraScore = totalScore;
    user.lastAuraUpdate = new Date();
    
    // Add to history (limit to last 30 entries)
    if (!user.auraScoreHistory) {
      user.auraScoreHistory = [];
    }
    
    user.auraScoreHistory.push({
      score: totalScore,
      date: new Date(),
      breakdown
    });
    
    // Keep only last 30 entries
    if (user.auraScoreHistory.length > 30) {
      user.auraScoreHistory = user.auraScoreHistory.slice(-30);
    }
    
    await user.save();
    
    return {
      success: true,
      auraScore: totalScore,
      breakdown,
      weights: WEIGHTS,
      message: 'Aura Score calculated successfully',
      updatedAt: new Date()
    };
    
  } catch (error) {
    console.error('Error calculating Aura Score:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      auraScore: 0,
      breakdown: {
        nutrition: 0,
        activity: 0,
        consistency: 0,
        routines: 0,
        goals: 0
      }
    };
  }
}

/**
 * Get user's Aura Score history
 */
export async function getAuraScoreHistory(userId: string, limit: number = 30) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('auraScore auraScoreHistory lastAuraUpdate');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const history = user.auraScoreHistory?.slice(-limit) || [];
    
    return {
      success: true,
      currentScore: user.auraScore || 0,
      lastUpdated: user.lastAuraUpdate,
      history
    };
    
  } catch (error) {
    console.error('Error fetching Aura Score history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      currentScore: 0,
      history: []
    };
  }
}
