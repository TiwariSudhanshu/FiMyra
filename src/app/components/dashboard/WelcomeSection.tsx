'use client';

import React, { useEffect, useState } from 'react';

interface WelcomeSectionProps {
  userName?: string;
  auraScore?: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  userName = 'User', 
  auraScore 
}) => {
  const [dynamicScore, setDynamicScore] = useState<number>(auraScore || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch actual Aura Score from API
    const fetchAuraScore = async () => {
      try {
        const response = await fetch('/api/aura-score', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.currentScore !== undefined) {
          setDynamicScore(data.currentScore);
        } else if (auraScore !== undefined) {
          setDynamicScore(auraScore);
        }
      } catch (error) {
        console.error('Error fetching Aura Score:', error);
        if (auraScore !== undefined) {
          setDynamicScore(auraScore);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAuraScore();
  }, [auraScore]);

  const getScoreTier = (score: number) => {
    if (score >= 90) return { tier: 'Legendary', color: 'from-yellow-400 to-orange-500' };
    if (score >= 80) return { tier: 'Excellent', color: 'from-purple-400 to-pink-500' };
    if (score >= 70) return { tier: 'Great', color: 'from-blue-400 to-cyan-500' };
    if (score >= 60) return { tier: 'Good', color: 'from-green-400 to-teal-500' };
    if (score >= 50) return { tier: 'Fair', color: 'from-lime-400 to-green-500' };
    if (score >= 40) return { tier: 'Needs Work', color: 'from-orange-400 to-red-500' };
    return { tier: 'Getting Started', color: 'from-gray-400 to-gray-500' };
  };

  const tier = getScoreTier(dynamicScore);

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
          {loading ? (
            <div className="flex items-center justify-end">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <>
              <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tier.color}`}>
                {dynamicScore}
              </div>
              <p className="text-white/60 text-sm">Aura Score</p>
              <p className="text-xs text-white/40">{tier.tier}</p>
              <div className={`w-16 h-1 bg-gradient-to-r ${tier.color} rounded-full ml-auto`}></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;