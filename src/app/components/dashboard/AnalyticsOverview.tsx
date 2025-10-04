'use client';

import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  gradient: string;
  borderColor: string;
  textColor: string;
}

interface AnalyticsOverviewProps {
  stats?: {
    steps: string;
    calories: string;
    sleep: string;
    hydration: string;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  value, 
  label, 
  gradient, 
  borderColor, 
  textColor 
}) => (
  <div className={`${gradient} rounded-xl p-4 border ${borderColor} transition-all hover:scale-105 hover:shadow-lg`}>
    <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
    <p className="text-white/60 text-sm mt-1">{label}</p>
  </div>
);

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ 
  stats = {
    steps: '7.2k',
    calories: '1,847',
    sleep: '6.5h',
    hydration: '94%'
  }
}) => {
  return (
    <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white">Analytics Overview</h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-400/20 border border-blue-400/30 rounded-full">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-300 text-sm font-medium">Live Data</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          value={stats.steps}
          label="Steps Today"
          gradient="bg-gradient-to-br from-blue-500/10 to-purple-500/10"
          borderColor="border-blue-400/20"
          textColor="text-blue-400"
        />
        <StatCard
          value={stats.calories}
          label="Calories"
          gradient="bg-gradient-to-br from-green-500/10 to-blue-500/10"
          borderColor="border-green-400/20"
          textColor="text-green-400"
        />
        <StatCard
          value={stats.sleep}
          label="Sleep"
          gradient="bg-gradient-to-br from-purple-500/10 to-blue-500/10"
          borderColor="border-purple-400/20"
          textColor="text-purple-400"
        />
        <StatCard
          value={stats.hydration}
          label="Hydration"
          gradient="bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
          borderColor="border-yellow-400/20"
          textColor="text-yellow-400"
        />
      </div>
      
      {/* Chart Placeholder */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-8 border border-blue-400/20 transition-all hover:border-blue-400/40">
        <div className="flex items-center justify-center h-40">
          <div className="text-center space-y-3">
            <div className="text-5xl mb-3">📈</div>
            <p className="text-white/80 text-lg font-medium">Weekly Aura Trend</p>
            <p className="text-blue-300 text-base font-semibold">+12% improvement</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;