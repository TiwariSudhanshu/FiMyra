'use client';

import React, { useState, useEffect } from 'react';

interface AuraScoreProps {}

interface ScoreBreakdown {
  nutrition: number;
  activity: number;
  consistency: number;
  routines: number;
  goals: number;
}

interface ScoreHistory {
  score: number;
  date: string;
  breakdown: ScoreBreakdown;
}

const AuraScore: React.FC<AuraScoreProps> = () => {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown>({
    nutrition: 0,
    activity: 0,
    consistency: 0,
    routines: 0,
    goals: 0
  });
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load Aura Score on mount
  useEffect(() => {
    loadAuraScore();
  }, []);

  const loadAuraScore = async () => {
    try {
      const response = await fetch('/api/aura-score', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCurrentScore(data.currentScore || 0);
        setLastUpdated(data.lastUpdated);
        setHistory(data.history || []);
        
        // Set breakdown from most recent history entry
        if (data.history && data.history.length > 0) {
          setBreakdown(data.history[data.history.length - 1].breakdown);
        }
      }
    } catch (error) {
      console.error('Error loading Aura Score:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = async () => {
    setCalculating(true);
    try {
      const response = await fetch('/api/aura-score', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCurrentScore(data.auraScore);
        setBreakdown(data.breakdown);
        setLastUpdated(data.updatedAt);
        
        // Reload to get updated history
        await loadAuraScore();
      } else {
        alert('Failed to calculate Aura Score: ' + data.message);
      }
    } catch (error) {
      console.error('Error calculating Aura Score:', error);
      alert('Error calculating Aura Score. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const getScoreTier = (score: number) => {
    if (score >= 90) return { tier: 'Legendary', badge: '🏆', color: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-500/50' };
    if (score >= 80) return { tier: 'Excellent', badge: '⭐', color: 'from-purple-400 to-pink-500', glow: 'shadow-purple-500/50' };
    if (score >= 70) return { tier: 'Great', badge: '💎', color: 'from-blue-400 to-cyan-500', glow: 'shadow-blue-500/50' };
    if (score >= 60) return { tier: 'Good', badge: '✨', color: 'from-green-400 to-teal-500', glow: 'shadow-green-500/50' };
    if (score >= 50) return { tier: 'Fair', badge: '🌱', color: 'from-lime-400 to-green-500', glow: 'shadow-lime-500/50' };
    if (score >= 40) return { tier: 'Needs Work', badge: '🔥', color: 'from-orange-400 to-red-500', glow: 'shadow-orange-500/50' };
    return { tier: 'Getting Started', badge: '🌟', color: 'from-gray-400 to-gray-500', glow: 'shadow-gray-500/50' };
  };

  const tier = getScoreTier(currentScore);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const updated = new Date(lastUpdated);
    const hours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Aura Score Card */}
      <div className={`bg-gradient-to-br ${tier.color} rounded-3xl p-1 ${tier.glow} shadow-2xl`}>
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Aura Score</h2>
              <p className="text-gray-400 text-sm">Overall wellness metric</p>
            </div>
            <button
              onClick={calculateScore}
              disabled={calculating}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {calculating ? '⚡ Calculating...' : '🔄 Update Score'}
            </button>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {/* Circular Progress */}
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-white/10"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(currentScore / 100) * 552.92} 552.92`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`${tier.color.split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
                    <stop offset="100%" className={`${tier.color.split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-white">{currentScore}</span>
                <span className="text-xl text-gray-400">/100</span>
              </div>
            </div>
          </div>

          {/* Tier Badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{tier.badge}</span>
            <span className="text-2xl font-semibold text-white">{tier.tier}</span>
          </div>

          {/* Last Updated */}
          <p className="text-center text-gray-400 text-sm">
            Last updated: {getTimeSinceUpdate()}
          </p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Nutrition */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-2xl">🥗</span>
              <span className="text-2xl font-bold text-white">{breakdown.nutrition}</span>
            </div>
            <h4 className="text-sm font-medium text-green-300">Nutrition</h4>
            <p className="text-xs text-gray-400 mt-1">30% weight</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${breakdown.nutrition}%` }}
              />
            </div>
          </div>

          {/* Activity */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-2xl">🏃</span>
              <span className="text-2xl font-bold text-white">{breakdown.activity}</span>
            </div>
            <h4 className="text-sm font-medium text-orange-300">Activity</h4>
            <p className="text-xs text-gray-400 mt-1">25% weight</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                style={{ width: `${breakdown.activity}%` }}
              />
            </div>
          </div>

          {/* Consistency */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-2xl">🔥</span>
              <span className="text-2xl font-bold text-white">{breakdown.consistency}</span>
            </div>
            <h4 className="text-sm font-medium text-purple-300">Consistency</h4>
            <p className="text-xs text-gray-400 mt-1">20% weight</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                style={{ width: `${breakdown.consistency}%` }}
              />
            </div>
          </div>

          {/* Routines */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-2xl">✨</span>
              <span className="text-2xl font-bold text-white">{breakdown.routines}</span>
            </div>
            <h4 className="text-sm font-medium text-blue-300">Routines</h4>
            <p className="text-xs text-gray-400 mt-1">15% weight</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${breakdown.routines}%` }}
              />
            </div>
          </div>

          {/* Goals */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-2xl">🎯</span>
              <span className="text-2xl font-bold text-white">{breakdown.goals}</span>
            </div>
            <h4 className="text-sm font-medium text-yellow-300">Goals</h4>
            <p className="text-xs text-gray-400 mt-1">10% weight</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                style={{ width: `${breakdown.goals}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score History */}
      {history.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Score History</h3>
          <div className="space-y-2">
            {history.slice(-10).reverse().map((entry, index) => {
              const entryTier = getScoreTier(entry.score);
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entryTier.badge}</span>
                    <div>
                      <p className="text-white font-medium">{entry.score} - {entryTier.tier}</p>
                      <p className="text-xs text-gray-400">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">N: {entry.breakdown.nutrition}</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded">A: {entry.breakdown.activity}</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">C: {entry.breakdown.consistency}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">R: {entry.breakdown.routines}</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">G: {entry.breakdown.goals}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-blue-400/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-400">💡</span>
          How to Improve Your Aura Score
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-medium text-blue-300 mb-2">🥗 Boost Nutrition</h4>
            <p className="text-gray-300 text-sm">Log all your meals daily and hit your macro targets consistently.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-medium text-orange-300 mb-2">🏃 Increase Activity</h4>
            <p className="text-gray-300 text-sm">Exercise regularly, hit your daily step goals, and get quality sleep.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-medium text-purple-300 mb-2">🔥 Build Consistency</h4>
            <p className="text-gray-300 text-sm">Build streaks by tracking daily and completing your wellness checklist.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-medium text-blue-300 mb-2">✨ Maintain Routines</h4>
            <p className="text-gray-300 text-sm">Complete your skin care and hair care routines as scheduled.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraScore;
