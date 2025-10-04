'use client';

import React from 'react';

interface WelcomeSectionProps {
  userName?: string;
  auraScore?: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  userName = 'User', 
  auraScore = 85 
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Aura Dashboard
          </h1>
          <p className="text-white/70 text-lg">
            Track your wellness journey with intelligent insights
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {auraScore}
          </div>
          <p className="text-white/60 text-sm">Aura Score</p>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full ml-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;