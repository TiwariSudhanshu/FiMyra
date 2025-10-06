'use client';

import React, { useState } from 'react';

interface HairCareProps {}

const HairCare: React.FC<HairCareProps> = () => {
  const [hairType, setHairType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [routine, setRoutine] = useState({
    shampoo: '',
    conditioner: '',
    treatments: [] as string[],
    frequency: ''
  });

  const hairTypes = [
    'Straight (Type 1)',
    'Wavy (Type 2)',
    'Curly (Type 3)',
    'Coily (Type 4)'
  ];

  const hairConcerns = [
    'Hair Loss',
    'Dandruff',
    'Dryness',
    'Oiliness',
    'Split Ends',
    'Frizz',
    'Lack of Volume',
    'Gray Hair',
    'Damaged Hair',
    'Slow Growth'
  ];

  const treatments = [
    'Deep Conditioning',
    'Hair Masks',
    'Oil Treatments',
    'Scalp Massage',
    'Heat Protection',
    'Leave-in Conditioner',
    'Hair Vitamins',
    'Protein Treatments'
  ];

  const toggleConcern = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const toggleTreatment = (treatment: string) => {
    setRoutine(prev => ({
      ...prev,
      treatments: prev.treatments.includes(treatment)
        ? prev.treatments.filter(t => t !== treatment)
        : [...prev.treatments, treatment]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-400/30 bg-pink-400/10 backdrop-blur-sm mb-4">
          <span className="text-2xl">💇‍♀️</span>
          <span className="text-pink-300 text-sm font-medium">Hair Care</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Hair Health & Care Routine
        </h2>
        <p className="text-white/70">
          Maintain healthy, beautiful hair with personalized care recommendations
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hair Assessment */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-pink-400">🔍</span>
            Hair Assessment
          </h3>
          
          {/* Hair Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Hair Type</label>
            <div className="grid grid-cols-2 gap-2">
              {hairTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setHairType(type)}
                  className={`p-3 rounded-xl text-sm transition-all ${
                    hairType === type
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white border border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Concerns */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Current Concerns</label>
            <div className="grid grid-cols-2 gap-2">
              {hairConcerns.map((concern) => (
                <button
                  key={concern}
                  onClick={() => toggleConcern(concern)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    concerns.includes(concern)
                      ? 'bg-pink-500/30 border border-pink-400/50 text-pink-300'
                      : 'bg-white/10 text-gray-400 hover:bg-white/15 hover:text-gray-300 border border-white/10'
                  }`}
                >
                  {concern}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Routine */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-pink-400">📋</span>
            Current Routine
          </h3>
          
          {/* Wash Frequency */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Wash Frequency</label>
            <select
              value={routine.frequency}
              onChange={(e) => setRoutine(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50"
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="every-other-day">Every other day</option>
              <option value="2-3-times-week">2-3 times per week</option>
              <option value="weekly">Weekly</option>
              <option value="less-than-weekly">Less than weekly</option>
            </select>
          </div>

          {/* Products */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Shampoo</label>
              <input
                type="text"
                value={routine.shampoo}
                onChange={(e) => setRoutine(prev => ({ ...prev, shampoo: e.target.value }))}
                placeholder="Enter your shampoo brand/type"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Conditioner</label>
              <input
                type="text"
                value={routine.conditioner}
                onChange={(e) => setRoutine(prev => ({ ...prev, conditioner: e.target.value }))}
                placeholder="Enter your conditioner brand/type"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              />
            </div>
          </div>

          {/* Treatments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Hair Treatments</label>
            <div className="grid grid-cols-2 gap-2">
              {treatments.map((treatment) => (
                <button
                  key={treatment}
                  onClick={() => toggleTreatment(treatment)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    routine.treatments.includes(treatment)
                      ? 'bg-pink-500/30 border border-pink-400/50 text-pink-300'
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

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-pink-400/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-pink-400">💡</span>
          AI Hair Care Recommendations
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-pink-300 mb-2">Daily Care</h4>
            <p className="text-gray-300 text-sm">Use a gentle, sulfate-free shampoo and always follow with conditioner to maintain moisture balance.</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-pink-300 mb-2">Weekly Treatment</h4>
            <p className="text-gray-300 text-sm">Deep condition once a week and use a hair mask to repair damage and add shine.</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-pink-300 mb-2">Protection Tips</h4>
            <p className="text-gray-300 text-sm">Use heat protectant before styling and sleep on silk pillowcases to reduce friction.</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          Save Hair Care Profile
        </button>
      </div>
    </div>
  );
};

export default HairCare;