'use client';

import React, { useState } from 'react';

interface SkinCareProps {}

const SkinCare: React.FC<SkinCareProps> = () => {
  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [routine, setRoutine] = useState({
    morning: {
      cleanser: '',
      toner: '',
      serum: '',
      moisturizer: '',
      sunscreen: ''
    },
    evening: {
      cleanser: '',
      toner: '',
      serum: '',
      moisturizer: '',
      treatment: ''
    },
    weekly: [] as string[]
  });

  const skinTypes = [
    'Normal',
    'Dry',
    'Oily',
    'Combination',
    'Sensitive'
  ];

  const skinConcerns = [
    'Acne',
    'Aging/Wrinkles',
    'Dark Spots',
    'Dullness',
    'Large Pores',
    'Redness',
    'Sensitivity',
    'Uneven Texture',
    'Blackheads',
    'Fine Lines',
    'Hyperpigmentation',
    'Dehydration'
  ];

  const weeklyTreatments = [
    'Face Mask',
    'Exfoliation',
    'Face Oil',
    'Retinol Treatment',
    'Vitamin C Serum',
    'Hydrating Mask',
    'Clay Mask',
    'Chemical Peel'
  ];

  const toggleConcern = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const toggleWeeklyTreatment = (treatment: string) => {
    setRoutine(prev => ({
      ...prev,
      weekly: prev.weekly.includes(treatment)
        ? prev.weekly.filter(t => t !== treatment)
        : [...prev.weekly, treatment]
    }));
  };

  const updateRoutine = (period: 'morning' | 'evening', field: string, value: string) => {
    setRoutine(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-400/30 bg-rose-400/10 backdrop-blur-sm mb-4">
          <span className="text-2xl">✨</span>
          <span className="text-rose-300 text-sm font-medium">Skin Care</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Skincare Routine & Analysis
        </h2>
        <p className="text-white/70">
          Achieve radiant, healthy skin with personalized skincare recommendations
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skin Assessment */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-rose-400">🔍</span>
            Skin Analysis
          </h3>
          
          {/* Skin Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Skin Type</label>
            <div className="space-y-2">
              {skinTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSkinType(type)}
                  className={`w-full p-3 rounded-xl text-sm transition-all text-left ${
                    skinType === type
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white border border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Concerns */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Current Concerns</label>
            <div className="grid grid-cols-1 gap-2">
              {skinConcerns.map((concern) => (
                <button
                  key={concern}
                  onClick={() => toggleConcern(concern)}
                  className={`p-2 rounded-lg text-xs transition-all text-left ${
                    concerns.includes(concern)
                      ? 'bg-rose-500/30 border border-rose-400/50 text-rose-300'
                      : 'bg-white/10 text-gray-400 hover:bg-white/15 hover:text-gray-300 border border-white/10'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Morning Routine */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">☀️</span>
            Morning Routine
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cleanser</label>
              <input
                type="text"
                value={routine.morning.cleanser}
                onChange={(e) => updateRoutine('morning', 'cleanser', e.target.value)}
                placeholder="e.g., Gentle foaming cleanser"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Toner</label>
              <input
                type="text"
                value={routine.morning.toner}
                onChange={(e) => updateRoutine('morning', 'toner', e.target.value)}
                placeholder="e.g., Hydrating toner"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Serum</label>
              <input
                type="text"
                value={routine.morning.serum}
                onChange={(e) => updateRoutine('morning', 'serum', e.target.value)}
                placeholder="e.g., Vitamin C serum"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Moisturizer</label>
              <input
                type="text"
                value={routine.morning.moisturizer}
                onChange={(e) => updateRoutine('morning', 'moisturizer', e.target.value)}
                placeholder="e.g., Lightweight moisturizer"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sunscreen (SPF)</label>
              <input
                type="text"
                value={routine.morning.sunscreen}
                onChange={(e) => updateRoutine('morning', 'sunscreen', e.target.value)}
                placeholder="e.g., Broad spectrum SPF 30+"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Evening Routine */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-purple-400">🌙</span>
            Evening Routine
          </h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cleanser</label>
              <input
                type="text"
                value={routine.evening.cleanser}
                onChange={(e) => updateRoutine('evening', 'cleanser', e.target.value)}
                placeholder="e.g., Double cleansing oil"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Toner</label>
              <input
                type="text"
                value={routine.evening.toner}
                onChange={(e) => updateRoutine('evening', 'toner', e.target.value)}
                placeholder="e.g., Exfoliating toner"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Serum/Treatment</label>
              <input
                type="text"
                value={routine.evening.serum}
                onChange={(e) => updateRoutine('evening', 'serum', e.target.value)}
                placeholder="e.g., Hyaluronic acid serum"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Moisturizer</label>
              <input
                type="text"
                value={routine.evening.moisturizer}
                onChange={(e) => updateRoutine('evening', 'moisturizer', e.target.value)}
                placeholder="e.g., Rich night cream"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
              />
            </div>
          </div>

          {/* Weekly Treatments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Weekly Treatments</label>
            <div className="grid grid-cols-1 gap-2">
              {weeklyTreatments.map((treatment) => (
                <button
                  key={treatment}
                  onClick={() => toggleWeeklyTreatment(treatment)}
                  className={`p-2 rounded-lg text-xs transition-all text-left ${
                    routine.weekly.includes(treatment)
                      ? 'bg-rose-500/30 border border-rose-400/50 text-rose-300'
                      : 'bg-white/10 text-gray-400 hover:bg-white/15 hover:text-gray-300 border border-white/10'
                  }`}
                >
                  {treatment}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-gradient-to-r from-rose-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-rose-400/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-rose-400">💡</span>
          AI Skincare Recommendations
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-rose-300 mb-2">Morning Essential</h4>
            <p className="text-gray-300 text-sm">Always apply sunscreen as your final step to protect against UV damage and premature aging.</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-rose-300 mb-2">Evening Care</h4>
            <p className="text-gray-300 text-sm">Use retinol or active ingredients at night when skin repairs itself naturally.</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-rose-300 mb-2">Hydration Focus</h4>
            <p className="text-gray-300 text-sm">Layer lightweight, hydrating products before heavier creams for better absorption.</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-rose-300 mb-2">Consistency Key</h4>
            <p className="text-gray-300 text-sm">Stick to your routine for 6-8 weeks to see noticeable improvements in skin health.</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          Save Skincare Profile
        </button>
      </div>
    </div>
  );
};

export default SkinCare;