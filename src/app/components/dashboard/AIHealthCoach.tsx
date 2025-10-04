'use client';

import React, { useState } from 'react';

interface AIHealthCoachProps {
  userName?: string;
}

const AIHealthCoach: React.FC<AIHealthCoachProps> = ({ userName = 'User' }) => {
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    // This would integrate with the floating AI chat
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    { text: "💧 You're 87% towards your hydration goal. Keep it up!", time: "2 min ago" },
    { text: "🧘‍♀️ Try a 10-minute walk or some protein-rich snacks. A short meditation might help too!", time: "Just now" }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white">AI Health Coach</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm font-medium">Online</span>
        </div>
      </div>
      
      {/* Coach Messages */}
      <div className="space-y-6 mb-8 h-64 overflow-y-auto">
        {quickSuggestions.map((suggestion, index) => (
          <div key={index} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20 transition-all hover:border-blue-400/40">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex-1">
                <p className="text-white/90 text-sm leading-relaxed mb-2">{suggestion.text}</p>
                <span className="text-white/50 text-xs">{suggestion.time}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* User message example */}
        <div className="flex justify-end">
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-400/20 max-w-xs">
            <p className="text-white/90 text-sm">Thanks! Any tips for my afternoon energy dip?</p>
            <span className="text-white/50 text-xs">1 min ago</span>
          </div>
        </div>
      </div>
      
      {/* Chat Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your AI coach..."
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 transition-all backdrop-blur-sm"
        />
        <button 
          onClick={handleSendMessage}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-white/60 text-sm mb-3">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "🍎 Meal suggestions",
            "💪 Workout tips", 
            "😌 Mood support",
            "📊 Progress review"
          ].map((action, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-sm transition-all border border-white/10 hover:border-white/20"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIHealthCoach;