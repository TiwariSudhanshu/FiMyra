'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type GoalType = 'weight-loss' | 'weight-gain' | 'muscle-gain' | 'maintenance' | null;
type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';

interface UserProfile {
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: ActivityLevel;
}

interface Goal {
  type: GoalType;
  currentWeight: number;
  targetWeight: number;
  duration: number; // in weeks
  startDate: string;
}

interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number; // in liters
}

const GoalsSection: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [dailyTargets, setDailyTargets] = useState<DailyTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form states
  const [goalType, setGoalType] = useState<GoalType>(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Progress update state
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    fetchProfileAndGoal();
  }, []);

  const fetchProfileAndGoal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.healthProfile || {});
        
        // Check if user has a goal saved
        if (data.goal) {
          setGoal(data.goal);
          calculateDailyTargets(data.healthProfile, data.goal);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMR = (profile: UserProfile): number => {
    if (!profile.weight || !profile.height || !profile.age) return 0;
    
    // Mifflin-St Jeor Equation
    if (profile.gender === 'male') {
      return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
    } else {
      return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
    }
  };

  const getActivityMultiplier = (level?: ActivityLevel): number => {
    const multipliers = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extremely-active': 1.9
    };
    return multipliers[level || 'sedentary'];
  };

  const calculateDailyTargets = (userProfile: UserProfile, userGoal: Goal) => {
    if (!userProfile.weight || !userProfile.height || !userProfile.age) {
      return;
    }

    // Calculate BMR
    const bmr = calculateBMR(userProfile);
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * getActivityMultiplier(userProfile.activityLevel);
    
    // Calculate weight change per week
    const weightChange = userGoal.targetWeight - userGoal.currentWeight;
    const weeksToGoal = userGoal.duration;
    const weeklyWeightChange = weightChange / weeksToGoal;
    
    // Calculate calorie adjustment (3500 cal = 1 lb, 7700 cal = 1 kg)
    const dailyCalorieAdjustment = (weeklyWeightChange * 7700) / 7;
    
    // Calculate target calories
    let targetCalories = tdee + dailyCalorieAdjustment;
    
    // Safety limits
    const minCalories = userProfile.gender === 'male' ? 1500 : 1200;
    const maxDeficit = tdee * 0.25; // Max 25% deficit
    const maxSurplus = tdee * 0.15; // Max 15% surplus
    
    if (targetCalories < minCalories) {
      targetCalories = minCalories;
    } else if (dailyCalorieAdjustment < 0 && Math.abs(dailyCalorieAdjustment) > maxDeficit) {
      targetCalories = tdee - maxDeficit;
    } else if (dailyCalorieAdjustment > 0 && dailyCalorieAdjustment > maxSurplus) {
      targetCalories = tdee + maxSurplus;
    }
    
    // Calculate macros
    let protein, carbs, fat;
    
    if (userGoal.type === 'muscle-gain') {
      // High protein for muscle gain
      protein = userGoal.currentWeight * 2.2; // 2.2g per kg
      fat = userGoal.currentWeight * 1.0; // 1g per kg
      carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    } else if (userGoal.type === 'weight-loss') {
      // High protein to preserve muscle
      protein = userGoal.currentWeight * 2.0; // 2g per kg
      fat = userGoal.currentWeight * 0.8; // 0.8g per kg
      carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    } else if (userGoal.type === 'weight-gain') {
      // Balanced macros
      protein = userGoal.currentWeight * 1.8; // 1.8g per kg
      fat = userGoal.currentWeight * 1.0; // 1g per kg
      carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    } else {
      // Maintenance - balanced
      protein = userGoal.currentWeight * 1.6; // 1.6g per kg
      fat = userGoal.currentWeight * 0.9; // 0.9g per kg
      carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;
    }
    
    // Calculate fiber and water
    const fiber = 25 + (targetCalories > 2000 ? 10 : 0);
    const water = userGoal.currentWeight * 0.033; // 33ml per kg
    
    setDailyTargets({
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(Math.max(carbs, 100)), // Min 100g carbs
      fat: Math.round(fat),
      fiber: Math.round(fiber),
      water: Math.round(water * 10) / 10
    });
  };

  const openEditGoal = () => {
    if (!goal || !goal.type) return;
    
    setIsEditMode(true);
    setGoalType(goal.type);
    setCurrentWeight(goal.currentWeight?.toString() || '');
    setTargetWeight(goal.targetWeight?.toString() || '');
    setDuration(goal.duration?.toString() || '');
    setShowGoalModal(true);
  };

  const saveGoal = async () => {
    if (!goalType || !currentWeight || !targetWeight || !duration) {
      toast.error('Please fill all fields');
      return;
    }

    const currentWeightValue = parseFloat(currentWeight);
    const targetWeightValue = parseFloat(targetWeight);
    const durationValue = parseInt(duration);

    // Validation
    if (currentWeightValue <= 0 || targetWeightValue <= 0) {
      toast.error('Please enter valid weights');
      return;
    }

    if (durationValue < 1 || durationValue > 52) {
      toast.error('Duration must be between 1 and 52 weeks');
      return;
    }

    // Check if goal makes sense
    if (goalType === 'weight-loss' && targetWeightValue >= currentWeightValue) {
      toast.error('Target weight should be less than current weight for weight loss');
      return;
    }

    if ((goalType === 'weight-gain' || goalType === 'muscle-gain') && targetWeightValue <= currentWeightValue) {
      toast.error('Target weight should be more than current weight for weight gain');
      return;
    }

    setSaving(true);
    try {
      const newGoal: Goal = {
        type: goalType,
        currentWeight: currentWeightValue,
        targetWeight: targetWeightValue,
        duration: durationValue,
        startDate: isEditMode && goal ? goal.startDate : new Date().toISOString()
      };

      const res = await fetch('/api/profile/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      });

      if (res.ok) {
        const data = await res.json();
        setGoal(data.goal || newGoal);
        
        if (profile) {
          calculateDailyTargets(profile, data.goal || newGoal);
        }
        
        toast.success(isEditMode ? '✅ Goal updated successfully!' : '🎯 Goal set successfully!');
        setShowGoalModal(false);
        setIsEditMode(false);
        resetForm();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to save goal');
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateProgress = async () => {
    if (!newWeight || !goal) {
      toast.error('Please enter your current weight');
      return;
    }

    const weightValue = parseFloat(newWeight);
    if (weightValue <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    setSaving(true);
    try {
      // Update profile weight
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthProfile: {
            ...profile,
            weight: weightValue
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update local state with new weight
        setProfile(data.healthProfile);
        
        // Recalculate targets with updated weight
        if (goal) {
          calculateDailyTargets(data.healthProfile, goal);
        }
        
        // Show success message
        const weightDiff = weightValue - (profile?.weight || 0);
        const isImprovement = 
          (goal.type === 'weight-loss' && weightDiff < 0) ||
          (goal.type === 'weight-gain' && weightDiff > 0) ||
          (goal.type === 'muscle-gain' && weightDiff > 0);
        
        if (isImprovement) {
          toast.success(`🎉 Great progress! Weight updated to ${weightValue}kg`);
        } else {
          toast.info(`📊 Progress updated: ${weightValue}kg`);
        }
        
        setShowProgressModal(false);
        setNewWeight('');
        
        // Refresh the complete profile data
        await fetchProfileAndGoal();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setGoalType(null);
    setCurrentWeight('');
    setTargetWeight('');
    setDuration('');
    setIsEditMode(false);
  };

  const getGoalIcon = (type: GoalType) => {
    const icons = {
      'weight-loss': '📉',
      'weight-gain': '📈',
      'muscle-gain': '💪',
      'maintenance': '⚖️'
    };
    return type ? icons[type] : '🎯';
  };

  const getGoalColor = (type: GoalType) => {
    const colors = {
      'weight-loss': 'from-purple-500 to-blue-500',
      'weight-gain': 'from-blue-500 to-purple-600',
      'muscle-gain': 'from-purple-600 to-blue-600',
      'maintenance': 'from-blue-400 to-purple-400'
    };
    return type ? colors[type] : 'from-purple-500 to-blue-500';
  };

  const calculateProgress = () => {
    if (!goal || !profile?.weight || !goal.targetWeight || !goal.currentWeight) return 0;
    
    const totalChange = goal.targetWeight - goal.currentWeight;
    const currentChange = profile.weight - goal.currentWeight;
    
    // Prevent division by zero
    if (totalChange === 0) return 0;
    
    const progress = (currentChange / totalChange) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const getWeeksRemaining = () => {
    if (!goal || !goal.startDate || !goal.duration) return 0;
    
    const startDate = new Date(goal.startDate);
    const now = new Date();
    const weeksElapsed = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    return Math.max(goal.duration - weeksElapsed, 0);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="text-white/60 text-center">Loading goals...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Goals
            </h3>
            <p className="text-white/60 text-sm mt-1">Track your health and fitness journey</p>
          </div>
          <motion.button
            onClick={() => setShowGoalModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all"
          >
            {goal ? 'Update Goal' : 'Set Goal'}
          </motion.button>
        </div>

        {!goal ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-white/70 text-lg mb-2">No goals set yet</p>
            <p className="text-white/50 text-sm">Set your first goal to get personalized nutrition targets</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${getGoalColor(goal.type || 'maintenance')} bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white/20`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{getGoalIcon(goal.type || 'maintenance')}</span>
                    <div>
                      <h4 className="text-xl font-bold text-white capitalize">
                        {goal.type?.replace('-', ' ') || 'No Type'}
                      </h4>
                      <p className="text-white/70 text-sm">
                        {goal.currentWeight || 0}kg → {goal.targetWeight || 0}kg
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{getWeeksRemaining()}</div>
                  <p className="text-white/70 text-sm">weeks left</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Progress</span>
                  <span className="text-white font-semibold">{Math.round(calculateProgress())}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-white">{goal.currentWeight || 0}kg</div>
                  <p className="text-white/60 text-xs">Start</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-white">{profile?.weight || '—'}kg</div>
                  <p className="text-white/60 text-xs">Current</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-white">{goal.targetWeight || 0}kg</div>
                  <p className="text-white/60 text-xs">Target</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={openEditGoal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all border border-white/10"
                >
                  ✏️ Edit Goal
                </motion.button>
                <motion.button
                  onClick={() => setShowProgressModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  📊 Update Progress
                </motion.button>
              </div>
            </motion.div>

            {/* Daily Targets */}
            {dailyTargets && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
              >
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Daily Nutrition Targets
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Calories */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)" }}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-xl p-4"
                  >
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-purple-400">{dailyTargets.calories}</div>
                    <p className="text-white/70 text-sm">Calories/day</p>
                  </motion.div>

                  {/* Protein */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)" }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-4"
                  >
                    <div className="text-3xl mb-2">💪</div>
                    <div className="text-2xl font-bold text-blue-400">{dailyTargets.protein}g</div>
                    <p className="text-white/70 text-sm">Protein/day</p>
                  </motion.div>

                  {/* Carbs */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)" }}
                    className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-400/20 rounded-xl p-4"
                  >
                    <div className="text-3xl mb-2">🍞</div>
                    <div className="text-2xl font-bold text-purple-400">{dailyTargets.carbs}g</div>
                    <p className="text-white/70 text-sm">Carbs/day</p>
                  </motion.div>

                  {/* Fat */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(96, 165, 250, 0.15)" }}
                    className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-xl p-4"
                  >
                    <div className="text-3xl mb-2">🥑</div>
                    <div className="text-2xl font-bold text-blue-400">{dailyTargets.fat}g</div>
                    <p className="text-white/70 text-sm">Fat/day</p>
                  </motion.div>

                  {/* Fiber */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)" }}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-400/10 border border-purple-400/20 rounded-xl p-4"
                  >
                    <div className="text-3xl mb-2">🌾</div>
                    <div className="text-2xl font-bold text-purple-400">{dailyTargets.fiber}g</div>
                    <p className="text-white/70 text-sm">Fiber/day</p>
                  </motion.div>

                  {/* Water */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(34, 211, 238, 0.15)" }}
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4"
                  >
                    <div className="text-3xl mb-2">💧</div>
                    <div className="text-2xl font-bold text-cyan-400">{dailyTargets.water}L</div>
                    <p className="text-white/70 text-sm">Water/day</p>
                  </motion.div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                  <p className="text-white/80 text-sm">
                    💡 <span className="font-semibold">Tip:</span> These targets are calculated based on your goal, current metrics, and activity level. Track your meals daily to stay on target!
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Goal Setting Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoalModal(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl border border-white/10 shadow-2xl pointer-events-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {isEditMode ? 'Edit Your Goal' : 'Set Your Goal'}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">Define your health and fitness objectives</p>
                  </div>
                  <motion.button
                    onClick={() => {
                      setShowGoalModal(false);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Goal Type Selection */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-3">Goal Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: 'weight-loss' as GoalType, label: 'Weight Loss', icon: '📉' },
                        { type: 'weight-gain' as GoalType, label: 'Weight Gain', icon: '📈' },
                        { type: 'muscle-gain' as GoalType, label: 'Muscle Gain', icon: '💪' },
                        { type: 'maintenance' as GoalType, label: 'Maintenance', icon: '⚖️' }
                      ].map((item) => (
                        <motion.button
                          key={item.type}
                          onClick={() => setGoalType(item.type)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border transition-all ${
                            goalType === item.type
                              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <div className="text-white font-medium text-sm">{item.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Weight Inputs */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Current Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder={profile?.weight?.toString() || "65.0"}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Target Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        placeholder="60.0"
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Duration (weeks)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="12"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                    />
                    <p className="text-white/50 text-xs mt-2">
                      Recommended: 8-16 weeks for sustainable results
                    </p>
                  </div>

                  {/* Info Box */}
                  {goalType && currentWeight && targetWeight && duration && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-purple-500/10 border border-purple-400/20 rounded-xl"
                    >
                      <p className="text-white/90 text-sm">
                        📊 <span className="font-semibold">Weekly Change:</span>{' '}
                        {Math.abs((parseFloat(targetWeight) - parseFloat(currentWeight)) / parseInt(duration)).toFixed(2)} kg/week
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center gap-3">
                  <motion.button
                    onClick={() => setShowGoalModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={saving}
                    className="flex-1 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all font-medium disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={saveGoal}
                    whileHover={!saving ? { scale: 1.05 } : {}}
                    whileTap={!saving ? { scale: 0.95 } : {}}
                    disabled={saving || !goalType || !currentWeight || !targetWeight || !duration}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Goal'}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Progress Update Modal */}
        {showProgressModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProgressModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl pointer-events-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Update Progress</h3>
                    <p className="text-white/60 text-sm mt-1">Enter your current weight</p>
                  </div>
                  <motion.button
                    onClick={() => setShowProgressModal(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Current Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder={profile?.weight?.toString() || "Enter your current weight"}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      step="0.1"
                      min="0"
                    />
                    {profile?.weight && (
                      <p className="text-white/50 text-xs mt-2">
                        Previous: {profile.weight}kg
                      </p>
                    )}
                    {newWeight && parseFloat(newWeight) > 0 && profile?.weight && (
                      <p className={`text-xs mt-1 ${
                        parseFloat(newWeight) < profile.weight 
                          ? 'text-green-400' 
                          : parseFloat(newWeight) > profile.weight 
                          ? 'text-blue-400' 
                          : 'text-white/60'
                      }`}>
                        {parseFloat(newWeight) < profile.weight 
                          ? `📉 ${(profile.weight - parseFloat(newWeight)).toFixed(1)}kg lost`
                          : parseFloat(newWeight) > profile.weight 
                          ? `📈 ${(parseFloat(newWeight) - profile.weight).toFixed(1)}kg gained`
                          : 'No change'}
                      </p>
                    )}
                  </div>

                  <motion.button
                    onClick={updateProgress}
                    whileHover={!saving ? { scale: 1.02 } : {}}
                    whileTap={!saving ? { scale: 0.98 } : {}}
                    disabled={saving || !newWeight || parseFloat(newWeight) <= 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Progress'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GoalsSection;
