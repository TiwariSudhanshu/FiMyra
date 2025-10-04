'use client';

import React from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  profileCompleted?: boolean;
}

interface QuickStatsProps {
  user: User;
  waterProgress?: number;
  exerciseProgress?: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({ 
  user, 
  waterProgress = 87, 
  exerciseProgress = 75 
}) => {
  return (
    <div className="space-y-8">
      {/* Profile Status */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg transition-all hover:bg-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=60`}
              alt={user?.name}
              className="w-16 h-16 rounded-full border-2 border-blue-400/50 object-cover transition-all hover:border-blue-400"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-gray-900 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white text-lg">{user?.name}</h4>
            <p className="text-white/60 text-sm">{user?.email}</p>
          </div>
        </div>
        
        {user?.profileCompleted ? (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-400/30 rounded-xl transition-all hover:bg-green-500/15">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">Profile Complete</span>
            <div className="ml-auto">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ) : (
          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-400/30 hover:border-yellow-400/50 rounded-xl transition-all group"
          >
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-300 text-sm font-medium group-hover:text-yellow-200">Complete Profile</span>
            <div className="ml-auto">
              <svg className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}
      </div>
      
      {/* Today's Goals */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg transition-all hover:bg-white/10">
        <h4 className="font-semibold text-white mb-6 text-lg">Today's Goals</h4>
        <div className="space-y-6">
          {/* Water Intake */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💧</span>
                <span className="text-white/70 text-sm font-medium">Water Intake</span>
              </div>
              <span className="text-blue-300 text-sm font-semibold">7/8 glasses</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{width: `${waterProgress}%`}}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-white/50 text-xs">{waterProgress}% complete</span>
            </div>
          </div>
          
          {/* Exercise */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏃‍♀️</span>
                <span className="text-white/70 text-sm font-medium">Exercise</span>
              </div>
              <span className="text-green-300 text-sm font-semibold">45/60 min</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{width: `${exerciseProgress}%`}}
              ></div>
            </div>
            <div className="text-right">
              <span className="text-white/50 text-xs">{exerciseProgress}% complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;