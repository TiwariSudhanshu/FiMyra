'use client';

import React, { useState, useEffect } from 'react';

interface DailyHabitsProps {}

interface Habits {
  exercised: boolean;
  ateHealthy: boolean;
  drankWater: boolean;
  sleptWell: boolean;
  tookVitamins: boolean;
  meditated: boolean;
  stretched: boolean;
  journaled: boolean;
  skinCareRoutine: boolean;
  hairCareRoutine: boolean;
}

const DailyHabits: React.FC<DailyHabitsProps> = () => {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habits>({
    exercised: false,
    ateHealthy: false,
    drankWater: false,
    sleptWell: false,
    tookVitamins: false,
    meditated: false,
    stretched: false,
    journaled: false,
    skinCareRoutine: false,
    hairCareRoutine: false
  });
  const [completionRate, setCompletionRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Habit configurations with icons and descriptions
  const habitConfigs = [
    {
      key: 'exercised',
      icon: '🏃',
      label: 'Did you exercise today?',
      description: 'Any physical activity counts',
      color: 'from-orange-500 to-red-500'
    },
    {
      key: 'ateHealthy',
      icon: '🥗',
      label: 'Did you eat healthy today?',
      description: 'Balanced, nutritious meals',
      color: 'from-green-500 to-emerald-500'
    },
    {
      key: 'drankWater',
      icon: '💧',
      label: 'Did you drink enough water?',
      description: 'Stay hydrated throughout the day',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'sleptWell',
      icon: '😴',
      label: 'Did you sleep well last night?',
      description: '7-9 hours of quality sleep',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      key: 'tookVitamins',
      icon: '💊',
      label: 'Did you take your vitamins?',
      description: 'Daily supplements if applicable',
      color: 'from-pink-500 to-rose-500'
    },
    {
      key: 'meditated',
      icon: '🧘',
      label: 'Did you meditate or practice mindfulness?',
      description: 'Even 5 minutes counts',
      color: 'from-purple-500 to-violet-500'
    },
    {
      key: 'stretched',
      icon: '🤸',
      label: 'Did you stretch or do flexibility work?',
      description: 'Keep your body mobile',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      key: 'journaled',
      icon: '📝',
      label: 'Did you journal or reflect?',
      description: 'Mental clarity and gratitude',
      color: 'from-teal-500 to-green-500'
    },
    {
      key: 'skinCareRoutine',
      icon: '✨',
      label: 'Did you complete your skin care routine?',
      description: 'Morning or evening routine',
      color: 'from-rose-500 to-pink-500'
    },
    {
      key: 'hairCareRoutine',
      icon: '💇',
      label: 'Did you complete your hair care routine?',
      description: 'As per your schedule',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  useEffect(() => {
    loadHabits();
  }, [selectedDate]);

  // Check for 100% completion milestone
  useEffect(() => {
    if (completionRate === 100 && isToday() && Object.keys(habits).length > 0) {
      // Check if at least one habit is actually completed (not default empty state)
      const anyCompleted = Object.values(habits).some(Boolean);
      if (anyCompleted) {
        // Add milestone activity only once per day
        fetch('/api/tracking/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'milestone',
            title: `🏆 Perfect Day Achievement!`,
            description: `Completed all ${Object.keys(habits).length} daily habits`,
            icon: '🎉'
          })
        }).catch(err => console.error('Failed to add milestone:', err));
      }
    }
  }, [completionRate]);

  const loadHabits = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/habits?date=${dateStr}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setHabits(data.habits);
        setCompletionRate(data.completionRate || 0);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitKey: keyof Habits) => {
    const newValue = !habits[habitKey];
    
    // Optimistic update
    const updatedHabits = { ...habits, [habitKey]: newValue };
    setHabits(updatedHabits);
    
    // Calculate new completion rate
    const total = Object.keys(updatedHabits).length;
    const completed = Object.values(updatedHabits).filter(Boolean).length;
    const newRate = Math.round((completed / total) * 100);
    setCompletionRate(newRate);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          habitKey,
          value: newValue,
          date: dateStr
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        // Revert on failure
        setHabits(habits);
        setCompletionRate(completionRate);
      } else if (newValue) {
        // Habit was marked as completed - add to activity feed
        const habitConfig = habitConfigs.find(h => h.key === habitKey);
        if (habitConfig && isToday()) {
          // Only add activity for today's habits
          await fetch('/api/tracking/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'target_achieved',
              title: `🔥 Habit Completed!`,
              description: `${habitConfig.label.replace('Did you ', '').replace('?', '')}`,
              icon: habitConfig.icon
            })
          }).catch(err => console.error('Failed to add activity:', err));
        }
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      // Revert on error
      setHabits(habits);
      setCompletionRate(completionRate);
    }
  };

  const saveNotes = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          habits,
          notes,
          date: dateStr
        })
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  const completedCount = Object.values(habits).filter(Boolean).length;
  const totalHabits = Object.keys(habits).length;

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border border-purple-400/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Daily Habit Tracker</h2>
          {!isToday() && (
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-xl transition-all text-sm font-medium"
            >
              📅 Go to Today
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
          >
            ← Previous Day
          </button>
          <div className="text-center">
            <p className="text-white font-semibold">{formatDate(selectedDate)}</p>
            {isToday() && <p className="text-sm text-purple-300">Today</p>}
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday()}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Day →
          </button>
        </div>

        {/* Progress Overview */}
        <div className="mt-4 bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Daily Progress</span>
            <span className="text-purple-300 font-bold text-lg">{completedCount}/{totalHabits}</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-center text-purple-300 font-semibold mt-2">{completionRate}% Complete</p>
        </div>
      </div>

      {/* Habit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habitConfigs.map((config) => {
          const isChecked = habits[config.key as keyof Habits];
          
          return (
            <div
              key={config.key}
              className={`bg-white/5 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                isChecked 
                  ? `border-${config.color.split('-')[1]}-400/50 bg-gradient-to-br ${config.color}/10` 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{config.label}</h3>
                      <p className="text-xs text-gray-400 mt-1">{config.description}</p>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={() => toggleHabit(config.key as keyof Habits)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      isChecked 
                        ? `bg-gradient-to-r ${config.color}` 
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                        isChecked ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`ml-3 font-medium ${isChecked ? 'text-green-400' : 'text-gray-400'}`}>
                    {isChecked ? 'Yes ✓' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-yellow-400">📝</span>
          Daily Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="How did you feel today? Any reflections or thoughts... (optional)"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-sm resize-none"
          rows={3}
        />
        <p className="text-xs text-gray-400 mt-2">Notes are saved automatically</p>
      </div>

      {/* Motivational Message */}
      {completionRate === 100 && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-400/30 p-6 text-center animate-pulse">
          <span className="text-5xl mb-2 block">🎉</span>
          <h3 className="text-2xl font-bold text-white mb-2">Perfect Day!</h3>
          <p className="text-yellow-300">You completed all your daily habits. Keep up the amazing work!</p>
        </div>
      )}

      {completionRate >= 70 && completionRate < 100 && (
        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl border border-green-400/30 p-6 text-center">
          <span className="text-4xl mb-2 block">💪</span>
          <h3 className="text-xl font-bold text-white mb-2">Great Job!</h3>
          <p className="text-green-300">You're crushing it today! Just a few more habits to go.</p>
        </div>
      )}
    </div>
  );
};

export default DailyHabits;
