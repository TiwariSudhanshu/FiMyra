'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface HairCareProps {}

interface AISuggestions {
  dailyCare: string[];
  weeklyTreatments: string[];
  productRecommendations: string[];
  lifestyleTips: string[];
  avoidMistakes: string[];
}

const HairCare: React.FC<HairCareProps> = () => {
  const [hairType, setHairType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [routine, setRoutine] = useState({
    shampoo: '',
    conditioner: '',
    treatments: [] as string[],
    frequency: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    fetchHairCareProfile();
  }, []);

  const fetchHairCareProfile = async () => {
    try {
      const response = await fetch('/api/profile/haircare', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.hairCareProfile) {
        const profile = data.hairCareProfile;
        setHairType(profile.hairType || '');
        setConcerns(profile.concerns || []);
        setGoals(profile.goals || []);
        setRoutine({
          shampoo: profile.routine?.shampoo || '',
          conditioner: profile.routine?.conditioner || '',
          treatments: profile.routine?.treatments || [],
          frequency: profile.routine?.frequency || ''
        });
        setNotes(profile.notes || '');
        setAge(data.age);
      }
    } catch (error) {
      console.error('Error fetching hair care profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hairType) {
      toast.error('Please select your hair type');
      return;
    }

    setSaving(true);
    const savePromise = fetch('/api/profile/haircare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        hairType,
        concerns,
        routine,
        goals,
        notes
      })
    }).then(res => res.json());

    toast.promise(savePromise, {
      loading: 'Saving hair care profile...',
      success: (data) => {
        if (data.success) {
          return 'Hair care profile saved successfully! 💇‍♀️';
        }
        throw new Error(data.message || 'Failed to save profile');
      },
      error: (err) => err.message || 'Failed to save profile'
    });

    try {
      await savePromise;
    } catch (error) {
      console.error('Error saving hair care profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getAISuggestions = async () => {
    if (!hairType) {
      toast.error('Please select your hair type first');
      return;
    }

    // Save profile first if not saved, then get suggestions
    if (!hairType) {
      toast.error('Please complete your hair profile');
      return;
    }

    setLoadingAI(true);
    
    // First, save the profile to ensure latest data
    try {
      const saveResponse = await fetch('/api/profile/haircare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hairType,
          concerns,
          routine,
          goals,
          notes
        })
      });

      const saveData = await saveResponse.json();
      if (!saveData.success) {
        toast.error(saveData.message || 'Failed to save profile');
        setLoadingAI(false);
        return;
      }

      // Now get AI suggestions
      const suggestionPromise = fetch('/api/ai/haircare-suggestions', {
        method: 'POST',
        credentials: 'include'
      }).then(res => res.json());

      toast.promise(suggestionPromise, {
        loading: 'Generating AI recommendations... 🤖',
        success: (data) => {
          if (data.success) {
            setAiSuggestions(data.suggestions);
            return 'AI recommendations generated successfully! ✨';
          }
          throw new Error(data.message || 'Failed to get AI suggestions');
        },
        error: (err) => err.message || 'Failed to get AI suggestions'
      });

      await suggestionPromise;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

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

  const hairGoals = [
    'Grow Longer Hair',
    'Increase Volume',
    'Reduce Breakage',
    'Control Frizz',
    'Add Shine',
    'Improve Texture',
    'Scalp Health',
    'Color Protection'
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

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading hair care profile...</p>
        </div>
      </div>
    );
  }

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
          <div className="mb-6">
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

          {/* Hair Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Hair Goals</label>
            <div className="grid grid-cols-2 gap-2">
              {hairGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    goals.includes(goal)
                      ? 'bg-purple-500/30 border border-purple-400/50 text-purple-300'
                      : 'bg-white/10 text-gray-400 hover:bg-white/15 hover:text-gray-300 border border-white/10'
                  }`}
                >
                  {goal}
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
              className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50"
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

      {/* Notes Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-pink-400">📝</span>
          Additional Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about your hair care routine, allergies, or preferences..."
          rows={4}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={handleSave}
          disabled={saving || !hairType}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          {saving ? 'Saving...' : 'Save Hair Care Profile'}
        </button>
        
        <button 
          onClick={getAISuggestions}
          disabled={loadingAI || !hairType}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
        >
          {loadingAI ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <span>🤖</span>
              Get AI Suggestions
            </>
          )}
        </button>
      </div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {aiSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-pink-400/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-pink-400">💡</span>
                AI Hair Care Recommendations
                {age && <span className="text-sm text-gray-400 font-normal">(Based on age {age})</span>}
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Daily Care */}
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-medium text-pink-300 mb-3 flex items-center gap-2">
                  <span>📅</span> Daily Care Routine
                </h4>
                <ul className="space-y-2">
                  {aiSuggestions.dailyCare.map((tip, index) => (
                    <li key={index} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-pink-400">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weekly Treatments */}
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-medium text-purple-300 mb-3 flex items-center gap-2">
                  <span>🗓️</span> Weekly Treatments
                </h4>
                <ul className="space-y-2">
                  {aiSuggestions.weeklyTreatments.map((treatment, index) => (
                    <li key={index} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{treatment}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product Recommendations */}
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                  <span>🛍️</span> Product Recommendations
                </h4>
                <ul className="space-y-2">
                  {aiSuggestions.productRecommendations.map((product, index) => (
                    <li key={index} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-blue-400">•</span>
                      <span>{product}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lifestyle Tips */}
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-medium text-green-300 mb-3 flex items-center gap-2">
                  <span>🥗</span> Lifestyle & Diet Tips
                </h4>
                <ul className="space-y-2">
                  {aiSuggestions.lifestyleTips.map((tip, index) => (
                    <li key={index} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-green-400">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Avoid Mistakes */}
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-medium text-red-300 mb-3 flex items-center gap-2">
                  <span>⚠️</span> Common Mistakes to Avoid
                </h4>
                <ul className="space-y-2">
                  {aiSuggestions.avoidMistakes.map((mistake, index) => (
                    <li key={index} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-red-400">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HairCare;