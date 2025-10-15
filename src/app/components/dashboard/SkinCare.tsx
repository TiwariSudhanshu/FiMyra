'use client';

import React, { useState, useEffect } from 'react';

interface SkinCareProps {}

const SkinCare: React.FC<SkinCareProps> = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [goals, setGoals] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Load existing profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/skincare', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.skinCareProfile) {
        const profile = data.skinCareProfile;
        
        // Set skin type
        if (profile.skinType) {
          setSkinType(profile.skinType.charAt(0).toUpperCase() + profile.skinType.slice(1));
        }
        
        // Set concerns
        if (profile.concerns) {
          setConcerns(profile.concerns);
        }
        
        // Parse routine from arrays back to the UI structure
        if (profile.routine) {
          const morningRoutine = {
            cleanser: '',
            toner: '',
            serum: '',
            moisturizer: '',
            sunscreen: ''
          };
          
          const eveningRoutine = {
            cleanser: '',
            toner: '',
            serum: '',
            moisturizer: '',
            treatment: ''
          };
          
          // Parse morning routine
          if (profile.routine.morning) {
            profile.routine.morning.forEach((item: string) => {
              const lower = item.toLowerCase();
              if (lower.includes('cleanser')) morningRoutine.cleanser = item;
              else if (lower.includes('toner')) morningRoutine.toner = item;
              else if (lower.includes('serum')) morningRoutine.serum = item;
              else if (lower.includes('moisturizer')) morningRoutine.moisturizer = item;
              else if (lower.includes('sunscreen') || lower.includes('spf')) morningRoutine.sunscreen = item;
            });
          }
          
          // Parse evening routine
          if (profile.routine.evening) {
            profile.routine.evening.forEach((item: string) => {
              const lower = item.toLowerCase();
              if (lower.includes('cleanser')) eveningRoutine.cleanser = item;
              else if (lower.includes('toner')) eveningRoutine.toner = item;
              else if (lower.includes('serum') || lower.includes('treatment')) eveningRoutine.serum = item;
              else if (lower.includes('moisturizer')) eveningRoutine.moisturizer = item;
            });
          }
          
          // Parse weekly treatments (stored in products array in API)
          const weeklyTreatments: string[] = [];
          if (profile.routine.products) {
            profile.routine.products.forEach((item: string) => {
              weeklyTreatments.push(item);
            });
          }
          
          setRoutine({
            morning: morningRoutine,
            evening: eveningRoutine,
            weekly: weeklyTreatments
          });
        }
        
        // Set goals
        if (profile.goals) {
          setGoals(profile.goals);
        }
        
        // Set notes
        if (profile.notes) {
          setNotes(profile.notes);
        }
      }
    } catch (error) {
      console.error('Error loading skin care profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    // Validate required fields
    if (!skinType) {
      alert('Please select your skin type');
      return;
    }

    setSaving(true);
    
    try {
      // Build morning routine array (only include items that are filled)
      const morningRoutine: string[] = [];
      if (routine.morning.cleanser && routine.morning.cleanser !== 'None') {
        morningRoutine.push(routine.morning.cleanser);
      }
      if (routine.morning.toner && routine.morning.toner !== 'None') {
        morningRoutine.push(routine.morning.toner);
      }
      if (routine.morning.serum && routine.morning.serum !== 'None') {
        morningRoutine.push(routine.morning.serum);
      }
      if (routine.morning.moisturizer && routine.morning.moisturizer !== 'None') {
        morningRoutine.push(routine.morning.moisturizer);
      }
      if (routine.morning.sunscreen && routine.morning.sunscreen !== 'None') {
        morningRoutine.push(routine.morning.sunscreen);
      }
      
      // Build evening routine array (only include items that are filled)
      const eveningRoutine: string[] = [];
      if (routine.evening.cleanser && routine.evening.cleanser !== 'None') {
        eveningRoutine.push(routine.evening.cleanser);
      }
      if (routine.evening.toner && routine.evening.toner !== 'None') {
        eveningRoutine.push(routine.evening.toner);
      }
      if (routine.evening.serum && routine.evening.serum !== 'None') {
        eveningRoutine.push(routine.evening.serum);
      }
      if (routine.evening.moisturizer && routine.evening.moisturizer !== 'None') {
        eveningRoutine.push(routine.evening.moisturizer);
      }
      
      const payload = {
        skinType: skinType.toLowerCase(),
        concerns: concerns,
        routine: {
          morning: morningRoutine,
          evening: eveningRoutine,
          products: routine.weekly
        },
        goals: goals,
        notes: notes
      };
      
      const response = await fetch('/api/profile/skincare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Skin care profile saved successfully!');
      } else {
        alert('❌ Failed to save profile: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving skin care profile:', error);
      alert('❌ Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cleanser 
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.morning.cleanser}
                  onChange={(e) => updateRoutine('morning', 'cleanser', e.target.value)}
                  placeholder="e.g., Gentle foaming cleanser or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.morning.cleanser && (
                  <button
                    onClick={() => updateRoutine('morning', 'cleanser', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Toner
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.morning.toner}
                  onChange={(e) => updateRoutine('morning', 'toner', e.target.value)}
                  placeholder="e.g., Hydrating toner or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.morning.toner && (
                  <button
                    onClick={() => updateRoutine('morning', 'toner', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Serum
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.morning.serum}
                  onChange={(e) => updateRoutine('morning', 'serum', e.target.value)}
                  placeholder="e.g., Vitamin C serum or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.morning.serum && (
                  <button
                    onClick={() => updateRoutine('morning', 'serum', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moisturizer
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.morning.moisturizer}
                  onChange={(e) => updateRoutine('morning', 'moisturizer', e.target.value)}
                  placeholder="e.g., Lightweight moisturizer or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.morning.moisturizer && (
                  <button
                    onClick={() => updateRoutine('morning', 'moisturizer', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sunscreen (SPF)
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.morning.sunscreen}
                  onChange={(e) => updateRoutine('morning', 'sunscreen', e.target.value)}
                  placeholder="e.g., Broad spectrum SPF 30+ or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.morning.sunscreen && (
                  <button
                    onClick={() => updateRoutine('morning', 'sunscreen', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cleanser
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.evening.cleanser}
                  onChange={(e) => updateRoutine('evening', 'cleanser', e.target.value)}
                  placeholder="e.g., Double cleansing oil or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.evening.cleanser && (
                  <button
                    onClick={() => updateRoutine('evening', 'cleanser', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Toner
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.evening.toner}
                  onChange={(e) => updateRoutine('evening', 'toner', e.target.value)}
                  placeholder="e.g., Exfoliating toner or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.evening.toner && (
                  <button
                    onClick={() => updateRoutine('evening', 'toner', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Serum/Treatment
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.evening.serum}
                  onChange={(e) => updateRoutine('evening', 'serum', e.target.value)}
                  placeholder="e.g., Hyaluronic acid serum or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.evening.serum && (
                  <button
                    onClick={() => updateRoutine('evening', 'serum', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moisturizer
                <span className="text-xs text-gray-500 ml-2">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={routine.evening.moisturizer}
                  onChange={(e) => updateRoutine('evening', 'moisturizer', e.target.value)}
                  placeholder="e.g., Rich night cream or leave blank"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm"
                />
                {routine.evening.moisturizer && (
                  <button
                    onClick={() => updateRoutine('evening', 'moisturizer', '')}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs transition-all"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Treatments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Weekly Treatments
              <span className="text-xs text-gray-500 ml-2">(optional - select any that apply)</span>
            </label>
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

      {/* Additional Notes */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-400">📝</span>
          Additional Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any allergies, sensitivities, or additional information about your skin... (optional)"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 text-sm resize-none"
          rows={4}
        />
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
        <button 
          onClick={saveProfile}
          disabled={saving || !skinType}
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Skincare Profile'
          )}
        </button>
        {!skinType && (
          <p className="text-rose-300 text-sm mt-2">Please select your skin type to save</p>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white text-lg">Loading your profile...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkinCare;