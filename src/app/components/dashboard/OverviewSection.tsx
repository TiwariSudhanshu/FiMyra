'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DailyTracking {
  date: Date;
  waterIntake: number;
  waterGoal: number;
  exerciseMinutes: number;
  exerciseGoal: number;
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  stepsCount?: number;
  stepsGoal?: number;
  sleepHours?: number;
  sleepGoal?: number;
  completed: boolean;
}

interface Goal {
  type: 'weight-loss' | 'weight-gain' | 'muscle-gain' | 'maintenance';
  currentWeight: number;
  targetWeight: number;
  duration: number;
  startDate: Date;
}

interface Activity {
  _id?: string;
  type: 'goal_complete' | 'target_achieved' | 'meal_logged' | 'exercise_completed' | 'streak' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  read: boolean;
}

interface Streaks {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

type TabId = 'overview' | 'analytics' | 'goals' | 'nutrition' | 'coach' | 'habits' | 'aura' | 'selfcare';

interface OverviewSectionProps {
  onTabChange?: (tab: TabId) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ onTabChange }) => {
  const [tracking, setTracking] = useState<DailyTracking | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [streaks, setStreaks] = useState<Streaks | null>(null);

  useEffect(() => {
    console.log('📊 OverviewSection mounted/re-mounted, fetching data...');
    // Small delay to ensure any pending DB writes are complete
    const timer = setTimeout(() => {
      fetchData();
      fetchActivityData();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async (retryCount = 0) => {
    console.log('📊 OverviewSection: Starting fetchData... (attempt:', retryCount + 1, ')');
    setLoading(true);
    try {
      // Fetch meals data to calculate actual consumed values
      const mealsRes = await fetch('/api/profile/meals', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (mealsRes.ok) {
        const mealsData = await mealsRes.json();
        console.log('📊 Meals data received:', mealsData.meals?.length || 0, 'days');

        // Calculate today's actual consumption from meals
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayMeal = (mealsData.meals || []).find((day: any) => {
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate.getTime() === today.getTime();
        });

        let actualConsumed = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        if (todayMeal) {
          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            const mealArray = todayMeal[mealType] || [];
            mealArray.forEach((item: any) => {
              actualConsumed.calories += item.calories || 0;
              actualConsumed.protein += item.protein || 0;
              actualConsumed.carbs += item.carbs || 0;
              actualConsumed.fat += item.fat || 0;
              actualConsumed.fiber += item.fiber || 0;
            });
          });
        }

        console.log('📊 Today\'s actual consumption from meals:', actualConsumed);

        // Fetch tracking data for goals
        const trackingRes = await fetch('/api/tracking/daily', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (trackingRes.ok) {
          const trackingData = await trackingRes.json();
          console.log('📊 Tracking goals received:', trackingData.tracking);

          // Merge actual consumed values with tracking goals
          setTracking({
            ...trackingData.tracking,
            caloriesConsumed: Math.round(actualConsumed.calories),
            proteinConsumed: Math.round(actualConsumed.protein),
            carbsConsumed: Math.round(actualConsumed.carbs),
            fatConsumed: Math.round(actualConsumed.fat),
          });
        } else {
          console.error('Failed to fetch tracking data:', trackingRes.status);
          // Set default tracking if API fails
          setTracking({
            date: new Date(),
            waterIntake: 0,
            waterGoal: 8,
            exerciseMinutes: 0,
            exerciseGoal: 60,
            caloriesConsumed: Math.round(actualConsumed.calories),
            caloriesGoal: 2000,
            proteinConsumed: Math.round(actualConsumed.protein),
            proteinGoal: 150,
            carbsConsumed: Math.round(actualConsumed.carbs),
            carbsGoal: 250,
            fatConsumed: Math.round(actualConsumed.fat),
            fatGoal: 65,
            completed: false
          });
        }
      } else {
        console.error('Failed to fetch meals data:', mealsRes.status);
        // Retry once if first attempt fails
        if (retryCount < 2) {
          console.log('📊 Retrying fetchData in 500ms...');
          setTimeout(() => fetchData(retryCount + 1), 500);
          return;
        }
      }

      // Fetch goal
      const goalRes = await fetch('/api/profile/goal', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (goalRes.ok) {
        const goalData = await goalRes.json();
        console.log('🎯 Goal data received:', goalData.goal);
        setGoal(goalData.goal);
      } else {
        console.error('Failed to fetch goal data:', goalRes.status);
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error);
      // Retry on error
      if (retryCount < 2) {
        console.log('📊 Retrying fetchData after error in 500ms...');
        setTimeout(() => fetchData(retryCount + 1), 500);
        return;
      }
    } finally {
      setLoading(false);
      console.log('📊 OverviewSection: fetchData complete');
    }
  };

  const fetchActivityData = async () => {
    try {
      // Fetch activities
      const activitiesRes = await fetch('/api/tracking/activities');
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities((data.activities || []).slice(0, 5)); // Only show latest 5
      }

      // Fetch profile for streaks
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.user?.streaks) {
          setStreaks(data.user.streaks);
        }
      }
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      goal_complete: 'from-green-500/10 to-emerald-500/10 border-green-400/20',
      target_achieved: 'from-blue-500/10 to-purple-500/10 border-blue-400/20',
      meal_logged: 'from-purple-500/10 to-pink-500/10 border-purple-400/20',
      exercise_completed: 'from-yellow-500/10 to-orange-500/10 border-yellow-400/20',
      streak: 'from-orange-500/10 to-red-500/10 border-orange-400/20',
      milestone: 'from-pink-500/10 to-purple-500/10 border-pink-400/20'
    };
    return colors[type] || 'from-white/5 to-white/5 border-white/10';
  };

  const updateTracking = async (field: string, value: number) => {
    if (!tracking) return;

    const updated = { ...tracking, [field]: value };
    setTracking(updated);

    try {
      await fetch('/api/tracking/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      // Add activity notification if goal reached
      if (field === 'waterIntake' && value >= updated.waterGoal) {
        await addActivity('target_achieved', 'Hydration Goal Reached!', `Completed ${value}/${updated.waterGoal} glasses`, '💧');
      } else if (field === 'exerciseMinutes' && value >= updated.exerciseGoal) {
        await addActivity('target_achieved', 'Exercise Goal Completed!', `Finished ${value}/${updated.exerciseGoal} minutes`, '🏃‍♀️');
      }
    } catch (error) {
      console.error('Failed to update tracking:', error);
    }
  };

  const addActivity = async (type: string, title: string, description: string, icon: string) => {
    try {
      await fetch('/api/tracking/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, icon })
      });
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-purple-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    if (percentage > 0) return 'from-purple-500 to-blue-500';
    return 'from-gray-500 to-gray-600'; // Show gray for 0%
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Debug: Log current tracking state
  console.log('🔍 Current tracking state:', tracking);

  return (
    <div className="space-y-8">
      {/* Daily Targets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Daily Targets {goal && goal.type && <span className="text-sm text-purple-400">({goal.type.replace('-', ' ')})</span>}
          </h3>
          <motion.button
            onClick={() => fetchData()}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-white/70 hover:text-white transition-all"
            title="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Calories */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-white/70 text-sm">Calories</p>
                  <p className="text-white text-2xl font-bold">
                    {Math.round(tracking?.caloriesConsumed || 0)}
                    <span className="text-white/50 text-base">/{Math.round(tracking?.caloriesGoal || 2000)}</span>
                  </p>
                </div>
              </div>
              <span className="text-purple-400 text-sm font-semibold">
                {Math.round(getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000))}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={`calories-${tracking?.caloriesConsumed}`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000))}`}
                style={{ minWidth: getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000) > 0 ? '8px' : '0px' }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💪</span>
                <div>
                  <p className="text-white/70 text-sm">Protein</p>
                  <p className="text-white text-2xl font-bold">
                    {tracking?.proteinConsumed || 0}g
                    <span className="text-white/50 text-base">/{tracking?.proteinGoal || 150}g</span>
                  </p>
                </div>
              </div>
              <span className="text-blue-400 text-sm font-semibold">
                {Math.round(getProgressPercentage(tracking?.proteinConsumed || 0, tracking?.proteinGoal || 150))}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={`protein-${tracking?.proteinConsumed}`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.proteinConsumed || 0, tracking?.proteinGoal || 150)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.proteinConsumed || 0, tracking?.proteinGoal || 150))}`}
                style={{ minWidth: getProgressPercentage(tracking?.proteinConsumed || 0, tracking?.proteinGoal || 150) > 0 ? '8px' : '0px' }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍞</span>
                <div>
                  <p className="text-white/70 text-sm">Carbs</p>
                  <p className="text-white text-2xl font-bold">
                    {tracking?.carbsConsumed || 0}g
                    <span className="text-white/50 text-base">/{tracking?.carbsGoal || 250}g</span>
                  </p>
                </div>
              </div>
              <span className="text-purple-400 text-sm font-semibold">
                {Math.round(getProgressPercentage(tracking?.carbsConsumed || 0, tracking?.carbsGoal || 250))}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={`carbs-${tracking?.carbsConsumed}`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.carbsConsumed || 0, tracking?.carbsGoal || 250)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.carbsConsumed || 0, tracking?.carbsGoal || 250))}`}
                style={{ minWidth: getProgressPercentage(tracking?.carbsConsumed || 0, tracking?.carbsGoal || 250) > 0 ? '8px' : '0px' }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥑</span>
                <div>
                  <p className="text-white/70 text-sm">Fat</p>
                  <p className="text-white text-2xl font-bold">
                    {tracking?.fatConsumed || 0}g
                    <span className="text-white/50 text-base">/{tracking?.fatGoal || 65}g</span>
                  </p>
                </div>
              </div>
              <span className="text-blue-400 text-sm font-semibold">
                {Math.round(getProgressPercentage(tracking?.fatConsumed || 0, tracking?.fatGoal || 65))}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={`fat-${tracking?.fatConsumed}`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.fatConsumed || 0, tracking?.fatGoal || 65)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.fatConsumed || 0, tracking?.fatGoal || 65))}`}
                style={{ minWidth: getProgressPercentage(tracking?.fatConsumed || 0, tracking?.fatGoal || 65) > 0 ? '8px' : '0px' }}
              />
            </div>
          </div>

          {/* Water */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💧</span>
                <div>
                  <p className="text-white/70 text-sm">Water</p>
                  <p className="text-white text-2xl font-bold">
                    {tracking?.waterIntake || 0}
                    <span className="text-white/50 text-base">/{tracking?.waterGoal || 8}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateTracking('waterIntake', (tracking?.waterIntake || 0) + 1)}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 text-sm font-semibold transition-all"
              >
                +1
              </button>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={`water-${tracking?.waterIntake}`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.waterIntake || 0, tracking?.waterGoal || 8)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.waterIntake || 0, tracking?.waterGoal || 8))}`}
                style={{ minWidth: getProgressPercentage(tracking?.waterIntake || 0, tracking?.waterGoal || 8) > 0 ? '8px' : '0px' }}
              />
            </div>
          </div>

          {/* Exercise */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏃‍♀️</span>
                <div>
                  <p className="text-white/70 text-sm">Exercise</p>
                  <p className="text-white text-2xl font-bold">
                    {tracking?.exerciseMinutes || 0}
                    <span className="text-white/50 text-base">/{tracking?.exerciseGoal || 60} min</span>
                  </p>
                </div>
              </div>
              <span className="text-purple-400 text-sm font-semibold">
                {Math.round(getProgressPercentage(tracking?.exerciseMinutes || 0, tracking?.exerciseGoal || 60))}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                key={`exercise-${tracking?.exerciseMinutes}`}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.exerciseMinutes || 0, tracking?.exerciseGoal || 60)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.exerciseMinutes || 0, tracking?.exerciseGoal || 60))}`}
                style={{ minWidth: getProgressPercentage(tracking?.exerciseMinutes || 0, tracking?.exerciseGoal || 60) > 0 ? '8px' : '0px' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Goals & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Goals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            Today's Goals
          </h3>

          <div className="space-y-4">
            {[
              { label: 'Complete water intake', done: (tracking?.waterIntake || 0) >= (tracking?.waterGoal || 8), icon: '💧' },
              { label: 'Reach exercise goal', done: (tracking?.exerciseMinutes || 0) >= (tracking?.exerciseGoal || 60), icon: '🏃‍♀️' },
              { label: 'Stay within calorie limit', done: (tracking?.caloriesConsumed || 0) <= (tracking?.caloriesGoal || 2000), icon: '🔥' },
              { label: 'Meet protein target', done: (tracking?.proteinConsumed || 0) >= (tracking?.proteinGoal || 150), icon: '💪' }
            ].map((goal, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  goal.done
                    ? 'bg-green-500/10 border-green-400/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-2xl">{goal.icon}</span>
                <span className={`flex-1 ${goal.done ? 'text-green-300' : 'text-white/70'}`}>
                  {goal.label}
                </span>
                {goal.done && (
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            Quick Actions
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => onTabChange?.('analytics')}
              className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-400/20 hover:border-blue-400/40 text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <p className="font-semibold">View Detailed Analytics</p>
                  <p className="text-white/60 text-sm">Track your progress over time</p>
                </div>
                <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => onTabChange?.('nutrition')}
              className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-400/20 hover:border-purple-400/40 text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍽️</span>
                <div className="flex-1">
                  <p className="font-semibold">Log Today's Meals</p>
                  <p className="text-white/60 text-sm">Track your nutrition intake</p>
                </div>
                <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => onTabChange?.('goals')}
              className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 hover:from-green-500/20 hover:to-blue-500/20 border border-green-400/20 hover:border-green-400/40 text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="font-semibold">Update Your Goals</p>
                  <p className="text-white/60 text-sm">Adjust your targets and progress</p>
                </div>
                <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => onTabChange?.('coach')}
              className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-400/20 hover:border-yellow-400/40 text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="font-semibold">Get AI Recommendations</p>
                  <p className="text-white/60 text-sm">Personalized health advice</p>
                </div>
                <svg className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Activity & Streaks Section */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Streaks Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-xl flex items-center justify-center text-3xl">
              🔥
            </div>
            <div>
              <p className="text-white/60 text-sm">Current Streak</p>
              <p className="text-white text-3xl font-bold">{streaks?.currentStreak || 0} days</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Longest: {streaks?.longestStreak || 0} days</span>
            <span className="text-orange-400 font-medium">Keep it up!</span>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Recent Activity
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-6 text-white/50">
              <span className="text-4xl mb-2 block">📭</span>
              <p>No recent activities. Start tracking to see updates!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity._id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-xl border bg-gradient-to-r ${getActivityColor(activity.type)}`}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{activity.title}</p>
                    <p className="text-white/60 text-sm truncate">{activity.description}</p>
                  </div>
                  <span className="text-white/40 text-xs flex-shrink-0">{formatTimestamp(activity.timestamp)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewSection;
