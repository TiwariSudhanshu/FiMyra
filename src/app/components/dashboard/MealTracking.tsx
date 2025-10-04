'use client';

import React from 'react';

interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  emoji: string;
  time: string;
  gradient: string;
  borderColor: string;
  calorieColor: string;
}

interface MealTrackingProps {
  meals?: Meal[];
}

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => (
  <div className={`${meal.gradient} rounded-xl p-6 border ${meal.borderColor} transition-all hover:scale-105 hover:shadow-lg group`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-2xl">{meal.emoji}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-lg">{meal.name}</h4>
          <p className="text-white/70 text-sm mt-1">{meal.description}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`${meal.calorieColor} text-sm font-semibold`}>{meal.calories} cal</span>
        <p className="text-white/50 text-xs mt-1">{meal.time}</p>
      </div>
    </div>
  </div>
);

const EmptyMealCard: React.FC<{ mealName: string; emoji: string }> = ({ mealName, emoji }) => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10 border-dashed transition-all hover:bg-white/10 hover:border-white/20 group cursor-pointer">
    <div className="text-center py-6">
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{emoji}</div>
      <p className="text-white/60 text-sm mb-3">No {mealName.toLowerCase()} logged yet</p>
      <button className="text-blue-300 text-sm font-medium hover:text-blue-200 transition-colors px-4 py-2 rounded-lg bg-blue-400/10 hover:bg-blue-400/20">
        Add {mealName}
      </button>
    </div>
  </div>
);

const MealTracking: React.FC<MealTrackingProps> = ({ meals }) => {
  const defaultMeals: Meal[] = [
    {
      id: '1',
      name: 'Breakfast',
      description: 'Oatmeal with berries',
      calories: 387,
      emoji: '🥗',
      time: '8:30 AM',
      gradient: 'bg-gradient-to-r from-green-500/10 to-blue-500/10',
      borderColor: 'border-green-400/20',
      calorieColor: 'text-green-300'
    },
    {
      id: '2',
      name: 'Lunch',
      description: 'Grilled chicken salad',
      calories: 542,
      emoji: '🥪',
      time: '1:15 PM',
      gradient: 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10',
      borderColor: 'border-orange-400/20',
      calorieColor: 'text-orange-300'
    }
  ];

  const mealsToShow = meals || defaultMeals;
  const totalCalories = mealsToShow.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Meal Tracking</h3>
          <p className="text-white/60 text-sm">
            Today's calories: <span className="text-blue-300 font-semibold">{totalCalories}</span> / 2000
          </p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105">
          Add Meal
        </button>
      </div>
      
      {/* Calorie Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-700 ease-out" 
            style={{width: `${Math.min((totalCalories / 2000) * 100, 100)}%`}}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-white/50 text-xs">0 cal</span>
          <span className="text-white/50 text-xs">2000 cal</span>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Logged Meals */}
        {mealsToShow.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
        
        {/* Empty Dinner Slot */}
        <EmptyMealCard mealName="Dinner" emoji="🍽️" />
        
        {/* Snacks Section */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium text-lg">Snacks & Drinks</h4>
            <button className="text-blue-300 text-sm hover:text-blue-200 transition-colors">
              + Add Snack
            </button>
          </div>
          <EmptyMealCard mealName="Snack" emoji="🍎" />
        </div>
      </div>
    </div>
  );
};

export default MealTracking;