# Implementation Guide: Skin Care & Hair Care Features

This guide provides practical examples for implementing the Skin Care and Hair Care features in your UI components.

---

## 📦 **Setup**

### 1. Import the Service Utilities

```typescript
import {
  // Skin Care
  getSkinCareProfile,
  saveSkinCareProfile,
  getSkinCareSuggestions,
  getSkinCareTracking,
  updateSkinCareTracking,
  
  // Hair Care
  getHairCareProfile,
  saveHairCareProfile,
  getHairCareSuggestions,
  getHairCareTracking,
  updateHairCareTracking,
  
  // Helpers
  formatDate,
  getDaysUntilWash,
  calculateStreak,
  getFrequencyText
} from '@/utils/careServices';
```

---

## 🧴 **Skin Care Implementation Examples**

### Example 1: Skin Care Profile Form Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getSkinCareProfile, saveSkinCareProfile } from '@/utils/careServices';

export default function SkinCareProfileForm() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    skinType: '',
    concerns: [] as string[],
    routine: {
      morning: [] as string[],
      evening: [] as string[],
      products: [] as string[]
    },
    goals: [] as string[],
    notes: ''
  });

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      const data = await getSkinCareProfile();
      if (data.success && data.skinCareProfile) {
        setProfile(data.skinCareProfile);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // Save profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveSkinCareProfile(profile);
    
    if (result.success) {
      alert('Profile saved successfully!');
    } else {
      alert('Failed to save profile: ' + result.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skin Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Skin Type *</label>
        <select
          value={profile.skinType}
          onChange={(e) => setProfile({ ...profile, skinType: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Skin Type</option>
          <option value="normal">Normal</option>
          <option value="dry">Dry</option>
          <option value="oily">Oily</option>
          <option value="combination">Combination</option>
          <option value="sensitive">Sensitive</option>
        </select>
      </div>

      {/* Concerns (Multi-select) */}
      <div>
        <label className="block text-sm font-medium mb-2">Skin Concerns</label>
        <div className="space-y-2">
          {['acne', 'dark spots', 'wrinkles', 'dryness', 'redness', 'large pores'].map(concern => (
            <label key={concern} className="flex items-center">
              <input
                type="checkbox"
                checked={profile.concerns.includes(concern)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProfile({ ...profile, concerns: [...profile.concerns, concern] });
                  } else {
                    setProfile({ ...profile, concerns: profile.concerns.filter(c => c !== concern) });
                  }
                }}
                className="mr-2"
              />
              {concern.charAt(0).toUpperCase() + concern.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Morning Routine */}
      <div>
        <label className="block text-sm font-medium mb-2">Morning Routine Steps</label>
        <textarea
          value={profile.routine.morning.join('\n')}
          onChange={(e) => setProfile({
            ...profile,
            routine: { ...profile.routine, morning: e.target.value.split('\n').filter(s => s) }
          })}
          placeholder="Enter each step on a new line&#10;e.g., Cleanser&#10;Toner&#10;Moisturizer&#10;Sunscreen"
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>

      {/* Evening Routine */}
      <div>
        <label className="block text-sm font-medium mb-2">Evening Routine Steps</label>
        <textarea
          value={profile.routine.evening.join('\n')}
          onChange={(e) => setProfile({
            ...profile,
            routine: { ...profile.routine, evening: e.target.value.split('\n').filter(s => s) }
          })}
          placeholder="Enter each step on a new line"
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>

      {/* Products */}
      <div>
        <label className="block text-sm font-medium mb-2">Favorite Products</label>
        <textarea
          value={profile.routine.products.join('\n')}
          onChange={(e) => setProfile({
            ...profile,
            routine: { ...profile.routine, products: e.target.value.split('\n').filter(s => s) }
          })}
          placeholder="List your products"
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-medium mb-2">Skin Goals</label>
        <input
          type="text"
          value={profile.goals.join(', ')}
          onChange={(e) => setProfile({
            ...profile,
            goals: e.target.value.split(',').map(g => g.trim()).filter(g => g)
          })}
          placeholder="e.g., clear skin, even tone, reduce wrinkles"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <textarea
          value={profile.notes}
          onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
          placeholder="Any allergies, sensitivities, or special notes"
          className="w-full p-2 border rounded"
          rows={2}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
}
```

---

### Example 2: AI Suggestions Display Component

```typescript
'use client';

import { useState } from 'react';
import { getSkinCareSuggestions, type SkinCareSuggestions } from '@/utils/careServices';

export default function SkinCareSuggestionsCard() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkinCareSuggestions | null>(null);
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    
    const result = await getSkinCareSuggestions();
    
    if (result.success && result.suggestions) {
      setSuggestions(result.suggestions);
    } else {
      setError(result.message || 'Failed to get suggestions');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">AI Skin Care Suggestions</h3>
      
      {!suggestions && (
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Get Personalized Suggestions'}
        </button>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {suggestions && (
        <div className="space-y-6">
          {/* Morning Routine */}
          <div>
            <h4 className="font-semibold text-lg mb-2">☀️ Morning Routine</h4>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.morningRoutine.map((step, i) => (
                <li key={i} className="text-gray-700">{step}</li>
              ))}
            </ul>
          </div>

          {/* Evening Routine */}
          <div>
            <h4 className="font-semibold text-lg mb-2">🌙 Evening Routine</h4>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.eveningRoutine.map((step, i) => (
                <li key={i} className="text-gray-700">{step}</li>
              ))}
            </ul>
          </div>

          {/* Product Recommendations */}
          <div>
            <h4 className="font-semibold text-lg mb-2">🧴 Product Recommendations</h4>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.productRecommendations.map((product, i) => (
                <li key={i} className="text-gray-700">{product}</li>
              ))}
            </ul>
          </div>

          {/* Lifestyle Tips */}
          <div>
            <h4 className="font-semibold text-lg mb-2">💡 Lifestyle Tips</h4>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.lifestyleTips.map((tip, i) => (
                <li key={i} className="text-gray-700">{tip}</li>
              ))}
            </ul>
          </div>

          {/* Things to Avoid */}
          <div>
            <h4 className="font-semibold text-lg mb-2">⚠️ Common Mistakes to Avoid</h4>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.avoidMistakes.map((mistake, i) => (
                <li key={i} className="text-gray-700">{mistake}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="text-blue-600 hover:underline"
          >
            🔄 Refresh Suggestions
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### Example 3: Daily Check-In Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getSkinCareTracking, updateSkinCareTracking } from '@/utils/careServices';

export default function SkinCareDailyCheckIn() {
  const [todayStatus, setTodayStatus] = useState({
    morningRoutineCompleted: false,
    eveningRoutineCompleted: false
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // Load today's status
  useEffect(() => {
    async function loadStatus() {
      const data = await getSkinCareTracking(1);
      if (data.success && data.todayStatus) {
        setTodayStatus({
          morningRoutineCompleted: data.todayStatus.morningRoutineCompleted,
          eveningRoutineCompleted: data.todayStatus.eveningRoutineCompleted
        });
        setNotes(data.todayStatus.notes || '');
      }
      setLoading(false);
    }
    loadStatus();
  }, []);

  const handleUpdate = async (routine: 'morning' | 'evening', completed: boolean) => {
    const update = routine === 'morning' 
      ? { morningRoutineCompleted: completed }
      : { eveningRoutineCompleted: completed };
    
    const result = await updateSkinCareTracking(update);
    
    if (result.success) {
      setTodayStatus(prev => ({
        ...prev,
        [routine === 'morning' ? 'morningRoutineCompleted' : 'eveningRoutineCompleted']: completed
      }));
    }
  };

  const saveNotes = async () => {
    await updateSkinCareTracking({ notes });
    alert('Notes saved!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Today's Routine Check-In</h3>
      
      <div className="space-y-4">
        {/* Morning Routine */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded">
          <div>
            <h4 className="font-semibold">☀️ Morning Routine</h4>
            <p className="text-sm text-gray-600">Did you complete your morning routine?</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={todayStatus.morningRoutineCompleted}
              onChange={(e) => handleUpdate('morning', e.target.checked)}
              className="w-6 h-6"
            />
            <span className="ml-2">Done</span>
          </label>
        </div>

        {/* Evening Routine */}
        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded">
          <div>
            <h4 className="font-semibold">🌙 Evening Routine</h4>
            <p className="text-sm text-gray-600">Did you complete your evening routine?</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={todayStatus.eveningRoutineCompleted}
              onChange={(e) => handleUpdate('evening', e.target.checked)}
              className="w-6 h-6"
            />
            <span className="ml-2">Done</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How does your skin feel today? Any changes?"
            className="w-full p-2 border rounded"
            rows={3}
          />
          <button
            onClick={saveNotes}
            className="mt-2 text-blue-600 hover:underline text-sm"
          >
            Save Notes
          </button>
        </div>

        {/* Completion Message */}
        {todayStatus.morningRoutineCompleted && todayStatus.eveningRoutineCompleted && (
          <div className="bg-green-50 text-green-700 p-3 rounded text-center">
            🎉 Great job! You completed both routines today!
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 💇 **Hair Care Implementation Examples**

### Example 4: Hair Care Profile with Wash Frequency

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getHairCareProfile, saveHairCareProfile, getFrequencyText } from '@/utils/careServices';

export default function HairCareProfileForm() {
  const [profile, setProfile] = useState({
    hairType: '',
    concerns: [] as string[],
    routine: {
      shampoo: '',
      conditioner: '',
      treatments: [] as string[],
      frequency: ''
    },
    goals: [] as string[],
    notes: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const data = await getHairCareProfile();
      if (data.success && data.hairCareProfile) {
        setProfile(data.hairCareProfile);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveHairCareProfile(profile);
    
    if (result.success) {
      alert(`Profile saved! Next wash scheduled for: ${new Date(result.nextWashDate!).toLocaleDateString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hair Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Hair Type *</label>
        <select
          value={profile.hairType}
          onChange={(e) => setProfile({ ...profile, hairType: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Hair Type</option>
          <option value="straight">Straight</option>
          <option value="wavy">Wavy</option>
          <option value="curly">Curly</option>
          <option value="coily">Coily</option>
        </select>
      </div>

      {/* Wash Frequency */}
      <div>
        <label className="block text-sm font-medium mb-2">Wash Frequency *</label>
        <select
          value={profile.routine.frequency}
          onChange={(e) => setProfile({
            ...profile,
            routine: { ...profile.routine, frequency: e.target.value }
          })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Frequency</option>
          <option value="daily">Daily</option>
          <option value="every-other-day">Every Other Day</option>
          <option value="twice-a-week">Twice a Week</option>
          <option value="weekly">Weekly</option>
          <option value="twice-a-month">Twice a Month</option>
          <option value="monthly">Monthly</option>
        </select>
        {profile.routine.frequency && (
          <p className="text-sm text-gray-600 mt-1">
            You'll wash your hair: {getFrequencyText(profile.routine.frequency)}
          </p>
        )}
      </div>

      {/* Shampoo */}
      <div>
        <label className="block text-sm font-medium mb-2">Shampoo</label>
        <input
          type="text"
          value={profile.routine.shampoo}
          onChange={(e) => setProfile({
            ...profile,
            routine: { ...profile.routine, shampoo: e.target.value }
          })}
          placeholder="e.g., Sulfate-free moisturizing shampoo"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Conditioner */}
      <div>
        <label className="block text-sm font-medium mb-2">Conditioner</label>
        <input
          type="text"
          value={profile.routine.conditioner}
          onChange={(e) => setProfile({
            ...profile,
            routine: { ...profile.routine, conditioner: e.target.value }
          })}
          placeholder="e.g., Deep conditioning treatment"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Treatments */}
      <div>
        <label className="block text-sm font-medium mb-2">Treatments</label>
        <input
          type="text"
          value={profile.routine.treatments.join(', ')}
          onChange={(e) => setProfile({
            ...profile,
            routine: {
              ...profile.routine,
              treatments: e.target.value.split(',').map(t => t.trim()).filter(t => t)
            }
          })}
          placeholder="e.g., hair mask, leave-in conditioner, oil treatment"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Hair Concerns */}
      <div>
        <label className="block text-sm font-medium mb-2">Hair Concerns</label>
        <div className="space-y-2">
          {['frizz', 'dryness', 'dandruff', 'hair fall', 'split ends', 'dullness'].map(concern => (
            <label key={concern} className="flex items-center">
              <input
                type="checkbox"
                checked={profile.concerns.includes(concern)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProfile({ ...profile, concerns: [...profile.concerns, concern] });
                  } else {
                    setProfile({ ...profile, concerns: profile.concerns.filter(c => c !== concern) });
                  }
                }}
                className="mr-2"
              />
              {concern.charAt(0).toUpperCase() + concern.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
}
```

---

### Example 5: Hair Wash Reminder Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { 
  getHairCareProfile, 
  updateHairCareTracking, 
  getDaysUntilWash,
  formatDate 
} from '@/utils/careServices';

export default function HairWashReminder() {
  const [reminderData, setReminderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReminder = async () => {
    const data = await getHairCareProfile();
    if (data.success) {
      setReminderData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReminder();
  }, []);

  const handleComplete = async () => {
    const result = await updateHairCareTracking('complete', '');
    if (result.success) {
      alert(`Great! Next wash scheduled for: ${formatDate(result.nextWashDate!)}`);
      loadReminder(); // Reload data
    }
  };

  const handleSkip = async () => {
    const result = await updateHairCareTracking('skip', '');
    if (result.success) {
      alert(`Skipped. Next wash scheduled for: ${formatDate(result.nextWashDate!)}`);
      loadReminder(); // Reload data
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!reminderData?.nextWashDate) {
    return (
      <div className="bg-gray-100 p-4 rounded">
        <p>Set your wash frequency in the Hair Care Profile to enable reminders.</p>
      </div>
    );
  }

  const daysUntil = getDaysUntilWash(reminderData.nextWashDate);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Hair Wash Reminder</h3>
      
      {/* Wash Due Today */}
      {reminderData.isWashDueToday && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-700">💧 Time to wash your hair!</h4>
              <p className="text-sm text-blue-600">It's wash day according to your schedule</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleComplete}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✓ Done
            </button>
            <button
              onClick={handleSkip}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {reminderData.isWashOverdue && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <h4 className="font-semibold text-red-700">⚠️ Wash Overdue!</h4>
          <p className="text-sm text-red-600">
            You missed your scheduled wash on {formatDate(reminderData.nextWashDate)}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleComplete}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✓ Wash Now
            </button>
            <button
              onClick={handleSkip}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Wash */}
      {!reminderData.isWashDueToday && !reminderData.isWashOverdue && (
        <div className="bg-green-50 p-4 rounded">
          <h4 className="font-semibold text-green-700">✅ You're on schedule!</h4>
          <p className="text-sm text-green-600 mt-1">
            Next wash: <strong>{formatDate(reminderData.nextWashDate)}</strong>
            {daysUntil > 0 && ` (in ${daysUntil} day${daysUntil > 1 ? 's' : ''})`}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### Example 6: Wash History & Stats Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getHairCareTracking, formatDate } from '@/utils/careServices';

export default function HairCareHistory() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function loadHistory() {
      const result = await getHairCareTracking(days);
      if (result.success) {
        setData(result);
      }
    }
    loadHistory();
  }, [days]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Wash History</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border rounded px-3 py-1"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-blue-600">{data.stats.totalWashes}</div>
          <div className="text-sm text-gray-600">Total Washes</div>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-green-600">{data.stats.completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.stats.totalScheduled}</div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-red-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-red-600">{data.stats.totalSkipped}</div>
          <div className="text-sm text-gray-600">Skipped</div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        <h4 className="font-semibold mb-2">Recent Activity</h4>
        {data.tracking.length === 0 ? (
          <p className="text-gray-500">No wash history yet</p>
        ) : (
          data.tracking.slice(0, 10).map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{formatDate(entry.date)}</div>
                {entry.notes && (
                  <div className="text-sm text-gray-600">{entry.notes}</div>
                )}
              </div>
              <div>
                {entry.washCompleted && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                    ✓ Completed
                  </span>
                )}
                {entry.skipped && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                    ✗ Skipped
                  </span>
                )}
                {entry.washScheduled && !entry.washCompleted && !entry.skipped && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">
                    ⏰ Scheduled
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 **Best Practices**

1. **Error Handling**: Always check `success` property in API responses
2. **Loading States**: Show loading indicators while fetching data
3. **Optimistic Updates**: Update UI immediately, then sync with server
4. **Data Validation**: Validate required fields before submitting
5. **User Feedback**: Show success/error messages after operations
6. **Refresh Data**: Reload data after create/update operations
7. **Caching**: Consider caching profile data to reduce API calls

---

## 🔄 **Complete User Flow**

### Skin Care Flow:
1. User fills profile → Gets AI suggestions → Sets up routines
2. Daily check-in: Mark morning/evening routine completion
3. View stats and streaks to track progress

### Hair Care Flow:
1. User fills profile with wash frequency → Gets AI suggestions
2. System calculates next wash date automatically
3. On wash day: User sees reminder → Marks as Done/Skip
4. System auto-schedules next wash based on frequency
5. View wash history and completion rate

---

This implementation guide provides everything you need to integrate the Skin Care and Hair Care features into your UI! 🎨
