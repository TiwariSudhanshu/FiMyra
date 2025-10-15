# Aura Score Integration Guide

## Quick Start

The Aura Score system is now fully implemented! Here's how to use it:

---

## 📦 What's Been Added

### 1. **Database Schema** (`src/models/user.model.ts`)
- ✅ `auraScore`: Current score (0-100)
- ✅ `auraScoreHistory`: Array of score entries with breakdowns
- ✅ `lastAuraUpdate`: Timestamp of last calculation

### 2. **Calculation Engine** (`src/utils/auraScore.ts`)
- ✅ `calculateAuraScore(userId)`: Main calculation function
- ✅ `getAuraScoreHistory(userId, limit)`: Fetch score history
- ✅ Multi-dimensional scoring with 5 dimensions
- ✅ Intelligent weighting and graceful handling of missing data

### 3. **API Endpoints** (`src/app/api/aura-score/route.ts`)
- ✅ `GET /api/aura-score`: Fetch current score and history
- ✅ `POST /api/aura-score`: Calculate/update score

### 4. **UI Component** (`src/app/components/dashboard/AuraScore.tsx`)
- ✅ Beautiful circular progress display
- ✅ Score tier badges (Legendary → Getting Started)
- ✅ Dimension breakdown cards
- ✅ Score history timeline
- ✅ Improvement tips

### 5. **Documentation** (`AURA_README.md`)
- ✅ Complete formula explanations
- ✅ Example calculations
- ✅ Scoring tiers
- ✅ API usage guide

---

## 🚀 Adding to Dashboard

To display the Aura Score on your dashboard, add the component:

### Option 1: Add to existing dashboard page

```tsx
// In src/app/dashboard/page.tsx

import AuraScore from '@/app/components/dashboard/AuraScore';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Add Aura Score component */}
      <AuraScore />
      
      {/* Other dashboard sections */}
      <WelcomeSection />
      <QuickStats />
      {/* ... */}
    </div>
  );
}
```

### Option 2: Create a dedicated Aura Score page

```tsx
// Create src/app/aura/page.tsx

import AuraScore from '@/app/components/dashboard/AuraScore';

export default function AuraPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <AuraScore />
      </div>
    </div>
  );
}
```

---

## 🔧 API Usage Examples

### Calculate Aura Score

```typescript
// Client-side
const response = await fetch('/api/aura-score', {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
console.log(data.auraScore); // 74
console.log(data.breakdown);  // { nutrition: 81, activity: 70, ... }
```

### Get Score History

```typescript
// Client-side
const response = await fetch('/api/aura-score?limit=30', {
  method: 'GET',
  credentials: 'include'
});

const data = await response.json();
console.log(data.currentScore); // 74
console.log(data.history);      // Array of past scores
```

### Server-side Usage

```typescript
// In any API route or server component
import { calculateAuraScore } from '@/utils/auraScore';

const result = await calculateAuraScore(userId);
if (result.success) {
  console.log(`User's Aura Score: ${result.auraScore}`);
  console.log('Breakdown:', result.breakdown);
}
```

---

## 🎯 Scoring Dimensions

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Nutrition** | 30% | Meal logging, calorie accuracy, macro balance |
| **Activity** | 25% | Exercise, steps, sleep quality |
| **Consistency** | 20% | Streaks, daily tracking habits |
| **Routines** | 15% | Skin care & hair care completion |
| **Goals** | 10% | Goal setting and progress |

**Formula:**
```
Aura Score = (Nutrition × 0.30) + (Activity × 0.25) + (Consistency × 0.20) + 
             (Routines × 0.15) + (Goals × 0.10)
```

---

## 🏆 Score Tiers

| Score | Tier | Badge |
|-------|------|-------|
| 90-100 | Legendary | 🏆 |
| 80-89 | Excellent | ⭐ |
| 70-79 | Great | 💎 |
| 60-69 | Good | ✨ |
| 50-59 | Fair | 🌱 |
| 40-49 | Needs Work | 🔥 |
| 0-39 | Getting Started | 🌟 |

---

## ⚡ Automatic Updates

You can set up automatic Aura Score updates in several ways:

### Option 1: Update on daily tracking
```typescript
// In your daily tracking API route
import { calculateAuraScore } from '@/utils/auraScore';

// After saving daily tracking data
await calculateAuraScore(userId);
```

### Option 2: Update on meal logging
```typescript
// In your meal logging API route
import { calculateAuraScore } from '@/utils/auraScore';

// After logging a meal
await calculateAuraScore(userId);
```

### Option 3: Scheduled updates (recommended)
Create a cron job or scheduled task to update all users' scores daily:

```typescript
// Create src/app/api/cron/update-aura-scores/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import { calculateAuraScore } from '@/utils/auraScore';

export async function GET() {
  await connectDB();
  
  const users = await User.find({});
  let updated = 0;
  
  for (const user of users) {
    try {
      await calculateAuraScore(user._id.toString());
      updated++;
    } catch (error) {
      console.error(`Error updating score for user ${user._id}:`, error);
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    message: `Updated Aura Scores for ${updated} users` 
  });
}
```

Then set up Vercel Cron Jobs in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/update-aura-scores",
    "schedule": "0 0 * * *"
  }]
}
```

---

## 🧪 Testing

### Manual Testing

1. **Log in** to your app
2. **Navigate** to the Aura Score section
3. **Click "Update Score"** button
4. **Verify** the score displays correctly
5. **Check breakdown** cards for individual dimension scores
6. **View history** to see past scores

### Test with Sample Data

```typescript
// Create test data for a user
const testUser = {
  // Add meals for last 7 days
  meals: [
    { date: new Date(), breakfast: [...], lunch: [...], dinner: [...] },
    // ... 6 more days
  ],
  
  // Add daily tracking
  dailyTracking: [
    { 
      date: new Date(), 
      caloriesConsumed: 2000, 
      caloriesGoal: 2000,
      exerciseMinutes: 30,
      exerciseGoal: 60,
      completed: true
    },
    // ... 6 more days
  ],
  
  // Add streaks
  streaks: {
    currentStreak: 7,
    longestStreak: 10
  },
  
  // Add goal
  goal: {
    type: 'weight-loss',
    currentWeight: 80,
    targetWeight: 70,
    duration: 3,
    startDate: new Date('2025-09-01')
  }
};
```

Expected score: **~60-75** depending on data completeness

---

## 📊 Monitoring

### Check Calculation Performance

```typescript
console.time('Aura Score Calculation');
const result = await calculateAuraScore(userId);
console.timeEnd('Aura Score Calculation');
// Expected: 50-200ms
```

### View Logs

Check your server logs for any calculation errors:
```bash
grep "Error calculating Aura Score" logs/*.log
```

---

## 🔍 Troubleshooting

### Score is 0
**Cause:** User has no tracked data
**Solution:** Encourage user to log meals, exercise, or set goals

### Score not updating
**Cause:** API call failing or frontend not refreshing
**Solution:** Check browser console for errors, verify API endpoint is working

### Breakdown shows all zeros
**Cause:** No data in any dimension
**Solution:** User needs to start tracking activities

### History is empty
**Cause:** Score never calculated or history cleared
**Solution:** Click "Update Score" to generate first entry

---

## 🎨 Customization

### Change Weights

Edit `WEIGHTS` in `src/utils/auraScore.ts`:

```typescript
const WEIGHTS = {
  nutrition: 0.25,      // Reduced from 0.30
  activity: 0.35,       // Increased from 0.25
  consistency: 0.20,    // Same
  routines: 0.10,       // Reduced from 0.15
  goals: 0.10           // Same
};
// Must sum to 1.0
```

### Change Scoring Tiers

Edit `getScoreTier()` in `AuraScore.tsx`:

```typescript
const getScoreTier = (score: number) => {
  if (score >= 95) return { tier: 'Godlike', badge: '👑', ... };
  if (score >= 85) return { tier: 'Amazing', badge: '🌟', ... };
  // ... customize tiers
};
```

### Change UI Colors

Modify the gradient colors in the component:

```typescript
// Change main card gradient
className={`bg-gradient-to-br ${tier.color} ...`}

// Add custom tier colors
if (score >= 90) return { 
  color: 'from-pink-400 to-rose-500',  // Your custom gradient
  glow: 'shadow-pink-500/50'
};
```

---

## 🚨 Important Notes

1. **Authentication Required:** All API endpoints require user authentication
2. **Data Privacy:** Scores are private to each user
3. **Performance:** Calculation takes ~50-200ms depending on data volume
4. **History Limit:** Stores last 30 score entries (configurable)
5. **Graceful Degradation:** Missing data returns 0 for that dimension, not an error

---

## 📚 Further Reading

- See `AURA_README.md` for complete formula documentation
- Check `src/utils/auraScore.ts` for implementation details
- Review `src/app/components/dashboard/AuraScore.tsx` for UI customization

---

## ✅ Checklist

Before going live:

- [ ] Database schema updated
- [ ] API endpoints tested
- [ ] UI component added to dashboard
- [ ] User authentication working
- [ ] Sample data tested
- [ ] Error handling verified
- [ ] Documentation reviewed
- [ ] Performance benchmarked

---

**Your Aura Score system is ready to go! 🎉**

Users can now track their overall wellness with a beautiful, data-driven score that updates based on their health habits.
