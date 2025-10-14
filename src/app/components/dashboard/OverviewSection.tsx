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

type TabId = 'overview' | 'analytics' | 'goals' | 'meals' | 'coach' | 'activity' | 'haircare' | 'skincare';

interface OverviewSectionProps {
  onTabChange?: (tab: TabId) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ onTabChange }) => {
  const [tracking, setTracking] = useState<DailyTracking | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tracking data
      const trackingRes = await fetch('/api/tracking/daily');
      if (trackingRes.ok) {
        const trackingData = await trackingRes.json();
        setTracking(trackingData.tracking);
      }

      // Fetch goal
      const goalRes = await fetch('/api/profile/goal');
      if (goalRes.ok) {
        const goalData = await goalRes.json();
        setGoal(goalData.goal);
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error);
    } finally {
      setLoading(false);
    }
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
    return 'from-red-500 to-pink-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Daily Targets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          Daily Targets {goal && <span className="text-sm text-purple-400">({goal.type.replace('-', ' ')})</span>}
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Calories */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-white/70 text-sm">Calories</p>
                  <p className="text-white text-2xl font-bold">
                    {tracking?.caloriesConsumed || 0}
                    <span className="text-white/50 text-base">/{tracking?.caloriesGoal || 2000}</span>
                  </p>
                </div>
              </div>
              <span className="text-purple-400 text-sm font-semibold">
                {Math.round(getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000))}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.caloriesConsumed || 0, tracking?.caloriesGoal || 2000))}`}
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
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.proteinConsumed || 0, tracking?.proteinGoal || 150)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.proteinConsumed || 0, tracking?.proteinGoal || 150))}`}
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
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.carbsConsumed || 0, tracking?.carbsGoal || 250)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.carbsConsumed || 0, tracking?.carbsGoal || 250))}`}
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
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.fatConsumed || 0, tracking?.fatGoal || 65)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.fatConsumed || 0, tracking?.fatGoal || 65))}`}
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
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.waterIntake || 0, tracking?.waterGoal || 8)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.waterIntake || 0, tracking?.waterGoal || 8))}`}
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
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(tracking?.exerciseMinutes || 0, tracking?.exerciseGoal || 60)}%` }}
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(getProgressPercentage(tracking?.exerciseMinutes || 0, tracking?.exerciseGoal || 60))}`}
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
              onClick={() => onTabChange?.('meals')}
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
    </div>
  );
};

export default OverviewSection;
