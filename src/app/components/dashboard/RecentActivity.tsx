'use client';

import React from 'react';

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconBg: string;
  gradient: string;
  borderColor: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => (
  <div className={`flex items-center gap-6 p-6 ${activity.gradient} rounded-xl border ${activity.borderColor} transition-all hover:scale-105 hover:shadow-lg group`}>
    <div className={`w-12 h-12 ${activity.iconBg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <span className="text-xl">{activity.icon}</span>
    </div>
    <div className="flex-1 space-y-1">
      <p className="text-white font-semibold text-lg">{activity.title}</p>
      <p className="text-white/70 text-sm">{activity.description}</p>
    </div>
    <div className="text-right">
      <span className="text-white/60 text-sm font-medium">{activity.time}</span>
    </div>
  </div>
);

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const defaultActivities: Activity[] = [
    {
      id: '1',
      title: 'Completed morning workout',
      description: '45 minutes • Cardio & Strength',
      time: '2 hours ago',
      icon: '✅',
      iconBg: 'bg-green-400/20',
      gradient: 'bg-gradient-to-r from-green-500/10 to-blue-500/10',
      borderColor: 'border-green-400/20'
    },
    {
      id: '2',
      title: 'Hydration goal reached',
      description: '8 glasses of water consumed',
      time: '4 hours ago',
      icon: '💧',
      iconBg: 'bg-blue-400/20',
      gradient: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
      borderColor: 'border-blue-400/20'
    },
    {
      id: '3',
      title: 'Healthy lunch logged',
      description: 'Quinoa bowl with vegetables',
      time: '6 hours ago',
      icon: '🍎',
      iconBg: 'bg-purple-400/20',
      gradient: 'bg-gradient-to-r from-purple-500/10 to-blue-500/10',
      borderColor: 'border-purple-400/20'
    },
    {
      id: '4',
      title: 'Meditation session completed',
      description: '15 minutes mindfulness practice',
      time: '8 hours ago',
      icon: '🧘‍♀️',
      iconBg: 'bg-indigo-400/20',
      gradient: 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-400/20'
    }
  ];

  const activitiesToShow = activities || defaultActivities;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <button className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-400/10">
            View All
          </button>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        {activitiesToShow.map((activity, index) => (
          <div key={activity.id} className="relative">
            <ActivityCard activity={activity} />
            {/* Connection line between activities */}
            {index < activitiesToShow.length - 1 && (
              <div className="absolute left-6 top-full w-0.5 h-4 bg-gradient-to-b from-white/20 to-transparent"></div>
            )}
          </div>
        ))}
      </div>
      
      {/* Activity Summary */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
            <div className="text-xl font-bold text-blue-400">4</div>
            <p className="text-white/60 text-xs mt-1">Activities Today</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg border border-green-400/20">
            <div className="text-xl font-bold text-green-400">12</div>
            <p className="text-white/60 text-xs mt-1">This Week</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-400/20">
            <div className="text-xl font-bold text-purple-400">95%</div>
            <p className="text-white/60 text-xs mt-1">Goal Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;