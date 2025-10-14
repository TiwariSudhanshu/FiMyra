'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  _id?: string;
  type: 'goal_complete' | 'target_achieved' | 'meal_logged' | 'exercise_completed' | 'streak' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  read: boolean;
}

interface DailyTracking {
  date: Date;
  waterIntake: number;
  waterGoal: number;
  exerciseMinutes: number;
  exerciseGoal: number;
  caloriesConsumed: number;
  caloriesGoal: number;
  completed: boolean;
}

interface Streaks {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

const ActivitySection: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tracking, setTracking] = useState<DailyTracking | null>(null);
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch activities
      const activitiesRes = await fetch('/api/tracking/activities');
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
        setUnreadCount(data.unreadCount || 0);
      }

      // Fetch tracking data
      const trackingRes = await fetch('/api/tracking/daily');
      if (trackingRes.ok) {
        const data = await trackingRes.json();
        setTracking(data.tracking);
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
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (activityId?: string, all?: boolean) => {
    try {
      await fetch('/api/tracking/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, markAllRead: all })
      });

      if (all) {
        setActivities(prev => prev.map(a => ({ ...a, read: true })));
        setUnreadCount(0);
      } else if (activityId) {
        setActivities(prev => prev.map(a => a._id === activityId ? { ...a, read: true } : a));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getActivityColor = (type: string) => {
    const colors = {
      goal_complete: 'from-green-500/10 to-emerald-500/10 border-green-400/20',
      target_achieved: 'from-blue-500/10 to-purple-500/10 border-blue-400/20',
      meal_logged: 'from-purple-500/10 to-pink-500/10 border-purple-400/20',
      exercise_completed: 'from-yellow-500/10 to-orange-500/10 border-yellow-400/20',
      streak: 'from-orange-500/10 to-red-500/10 border-orange-400/20',
      milestone: 'from-pink-500/10 to-purple-500/10 border-pink-400/20'
    };
    return colors[type as keyof typeof colors] || 'from-white/5 to-white/5 border-white/10';
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

  const calculateWeeklyProgress = () => {
    // This would ideally fetch last 7 days of tracking
    // For now, using today's data as example
    return {
      daysActive: streaks?.currentStreak || 0,
      goalsAchieved: tracking?.completed ? 1 : 0,
      totalTargets: 7
    };
  };

  const weeklyProgress = calculateWeeklyProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Streaks & Weekly Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-white/70 text-sm">Current Streak</p>
              <p className="text-white text-3xl font-bold">{streaks?.currentStreak || 0}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs">Keep it up! Your longest: {streaks?.longestStreak || 0} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-white/70 text-sm">This Week</p>
              <p className="text-white text-3xl font-bold">{weeklyProgress.daysActive}/7</p>
            </div>
          </div>
          <p className="text-white/50 text-xs">Days active this week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="text-white/70 text-sm">Goals Achieved</p>
              <p className="text-white text-3xl font-bold">{weeklyProgress.goalsAchieved}/{weeklyProgress.totalTargets}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs">Daily targets completed</p>
        </motion.div>
      </div>

      {/* Activities Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-white">Activity Feed</h3>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-sm font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead(undefined, true)}
              className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-400/10"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {activities.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <span className="text-5xl mb-4 block">📭</span>
                <p>No activities yet. Start tracking your progress!</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <motion.div
                  key={activity._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-6 rounded-xl border bg-gradient-to-r ${getActivityColor(activity.type)} transition-all hover:scale-[1.02] cursor-pointer ${
                    !activity.read ? 'ring-2 ring-blue-400/30' : ''
                  }`}
                  onClick={() => !activity.read && markAsRead(activity._id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-white font-semibold text-lg">{activity.title}</h4>
                        <span className="text-white/50 text-sm">{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      <p className="text-white/70 text-sm">{activity.description}</p>
                    </div>
                    {!activity.read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Weekly Targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="text-3xl">📅</span>
          Weekly Targets
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily Streak Target */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="text-white/70 text-sm">Maintain Streak</p>
                  <p className="text-white text-xl font-bold">7-Day Goal</p>
                </div>
              </div>
              <span className="text-orange-400 font-semibold">
                {Math.round((Math.min(streaks?.currentStreak || 0, 7) / 7) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((streaks?.currentStreak || 0) / 7) * 100, 100)}%` }}
                className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
            <p className="text-white/50 text-xs mt-2">
              {Math.min(streaks?.currentStreak || 0, 7)}/7 days completed
            </p>
          </div>

          {/* Daily Goals Target */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <p className="text-white/70 text-sm">Complete Goals</p>
                  <p className="text-white text-xl font-bold">5/7 Days</p>
                </div>
              </div>
              <span className="text-green-400 font-semibold">
                {Math.round((weeklyProgress.goalsAchieved / 7) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(weeklyProgress.goalsAchieved / 7) * 100}%` }}
                className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
            <p className="text-white/50 text-xs mt-2">
              {weeklyProgress.goalsAchieved}/7 days achieved
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivitySection;
