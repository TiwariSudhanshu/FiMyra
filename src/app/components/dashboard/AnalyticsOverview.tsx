'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

type MealItem = {
  name: string;
  quantity?: number;
  unit?: string;
  carbs?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  calories?: number;
};

type MealDay = {
  date: string;
  breakfast?: MealItem[];
  lunch?: MealItem[];
  dinner?: MealItem[];
  snacks?: MealItem[];
};

type TimeRange = 'daily' | 'weekly' | 'monthly';

const COLORS = {
  calories: '#f59e0b',
  protein: '#8b5cf6',
  carbs: '#3b82f6',
  fat: '#10b981',
  fiber: '#ec4899'
};

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#ec4899'];

interface AnalyticsOverviewProps {
  stats?: {
    steps: string;
    calories: string;
    sleep: string;
    hydration: string;
  };
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ 
  stats = {
    steps: '7.2k',
    calories: '1,847',
    sleep: '6.5h',
    hydration: '94%'
  }
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [meals, setMeals] = useState<MealDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/meals');
      if (res.ok) {
        const json = await res.json();
        setMeals(json.meals || []);
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily totals
  const calculateDayTotals = (day: MealDay) => {
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
      const mealArray = day[mealType as keyof MealDay] as MealItem[] || [];
      mealArray.forEach(item => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        totals.carbs += item.carbs || 0;
        totals.fat += item.fat || 0;
        totals.fiber += item.fiber || 0;
      });
    });
    
    return totals;
  };

  // Get data based on time range
  const analyticsData = useMemo(() => {
    if (meals.length === 0) return [];

    const now = new Date();
    const sortedMeals = [...meals].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (timeRange === 'daily') {
      // Last 7 days
      return sortedMeals.slice(0, 7).reverse().map(day => {
        const totals = calculateDayTotals(day);
        return {
          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...totals
        };
      });
    } else if (timeRange === 'weekly') {
      // Last 4 weeks
      const weeks: any[] = [];
      for (let i = 0; i < 4; i++) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        const weekMeals = sortedMeals.filter(day => {
          const dayDate = new Date(day.date);
          return dayDate >= weekStart && dayDate <= weekEnd;
        });

        const weekTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        weekMeals.forEach(day => {
          const totals = calculateDayTotals(day);
          Object.keys(weekTotals).forEach(key => {
            weekTotals[key as keyof typeof weekTotals] += totals[key as keyof typeof totals];
          });
        });

        weeks.unshift({
          date: `Week ${4 - i}`,
          calories: Math.round(weekTotals.calories / 7),
          protein: Math.round(weekTotals.protein / 7),
          carbs: Math.round(weekTotals.carbs / 7),
          fat: Math.round(weekTotals.fat / 7),
          fiber: Math.round(weekTotals.fiber / 7)
        });
      }
      return weeks;
    } else {
      // Last 6 months
      const months: any[] = [];
      for (let i = 0; i < 6; i++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        
        const monthMeals = sortedMeals.filter(day => {
          const dayDate = new Date(day.date);
          return dayDate.getMonth() === monthDate.getMonth() && 
                 dayDate.getFullYear() === monthDate.getFullYear();
        });

        const monthTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        monthMeals.forEach(day => {
          const totals = calculateDayTotals(day);
          Object.keys(monthTotals).forEach(key => {
            monthTotals[key as keyof typeof monthTotals] += totals[key as keyof typeof totals];
          });
        });

        const daysInMonth = monthMeals.length || 1;
        months.unshift({
          date: monthName,
          calories: Math.round(monthTotals.calories / daysInMonth),
          protein: Math.round(monthTotals.protein / daysInMonth),
          carbs: Math.round(monthTotals.carbs / daysInMonth),
          fat: Math.round(monthTotals.fat / daysInMonth),
          fiber: Math.round(monthTotals.fiber / daysInMonth)
        });
      }
      return months;
    }
  }, [meals, timeRange]);

  // Calculate today's totals and macro distribution
  const todayData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMeal = meals.find(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === today.getTime();
    });

    if (!todayMeal) {
      return {
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        pieData: []
      };
    }

    const totals = calculateDayTotals(todayMeal);
    const pieData = [
      { name: 'Protein', value: Math.round(totals.protein), color: COLORS.protein },
      { name: 'Carbs', value: Math.round(totals.carbs), color: COLORS.carbs },
      { name: 'Fat', value: Math.round(totals.fat), color: COLORS.fat },
      { name: 'Fiber', value: Math.round(totals.fiber), color: COLORS.fiber }
    ].filter(item => item.value > 0);

    return { totals, pieData };
  }, [meals]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {Math.round(entry.value)}{entry.name === 'Calories' ? ' cal' : 'g'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Nutrition Analytics
          </h3>
          <p className="text-white/60 text-xs sm:text-sm mt-1">Track your dietary patterns and nutrient intake</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 w-full sm:w-auto">
          {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
            <motion.button
              key={range}
              onClick={() => setTimeRange(range)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-white/60">Loading analytics...</div>
        </div>
      ) : analyticsData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-white/60">No meal data yet. Start tracking meals to see analytics!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Today's Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15)" }}
              className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/20 rounded-xl p-3 sm:p-4"
            >
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{Math.round(todayData.totals.calories)}</div>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Calories Today</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)" }}
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 rounded-xl p-3 sm:p-4"
            >
              <div className="text-xl sm:text-2xl font-bold text-purple-400">{Math.round(todayData.totals.protein)}g</div>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Protein</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)" }}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-3 sm:p-4"
            >
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{Math.round(todayData.totals.carbs)}g</div>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Carbs</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)" }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-3 sm:p-4"
            >
              <div className="text-xl sm:text-2xl font-bold text-green-400">{Math.round(todayData.totals.fat)}g</div>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Fat</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(236, 72, 153, 0.15)" }}
              className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/20 rounded-xl p-3 sm:p-4"
            >
              <div className="text-xl sm:text-2xl font-bold text-pink-400">{Math.round(todayData.totals.fiber)}g</div>
              <p className="text-white/60 text-xs sm:text-sm mt-1">Fiber</p>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Calories Trend - Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🔥</span> Calorie Trend
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff60" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#ffffff60" style={{ fontSize: '10px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke={COLORS.calories} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.calories, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Macros Distribution - Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📊</span> Today's Macros
              </h4>
              {todayData.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={todayData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}g`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      style={{ fontSize: '11px' }}
                    >
                      {todayData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-white/40 text-sm">
                  No data for today
                </div>
              )}
            </motion.div>

            {/* Protein Trend - Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10"
            >
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">💪</span> Protein Intake
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff60" style={{ fontSize: '10px' }} />
                  <YAxis stroke="#ffffff60" style={{ fontSize: '10px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="protein" fill={COLORS.protein} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* All Macros Comparison - Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 lg:col-span-2"
            >
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🥗</span> Nutrient Comparison
              </h4>
              <div className="overflow-x-auto -mx-2 px-2">
                <ResponsiveContainer width="100%" height={220} minWidth={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#ffffff60" style={{ fontSize: '10px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="protein" fill={COLORS.protein} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="carbs" fill={COLORS.carbs} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fat" fill={COLORS.fat} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fiber" fill={COLORS.fiber} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsOverview;