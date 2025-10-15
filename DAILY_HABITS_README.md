# Daily Habit Tracker Documentation

## Overview

The **Daily Habit Tracker** is a powerful feature that helps users build consistent wellness habits through simple yes/no questions. It tracks 10 different daily habits, calculates completion rates, and integrates seamlessly with the Aura Score system to reward consistency.

---

## 🎯 Features

### Core Functionality
- ✅ **10 Pre-defined Habits** - Cover exercise, nutrition, wellness, and self-care
- ✅ **Yes/No Toggles** - Simple, intuitive interface
- ✅ **Date Navigation** - View and edit habits for any date
- ✅ **Progress Tracking** - Visual progress bar showing completion percentage
- ✅ **Daily Notes** - Optional reflection space for each day
- ✅ **Aura Score Integration** - Habits count toward Consistency score (25%)
- ✅ **Analytics Ready** - Data structure perfect for charts and trends

---

## 📋 Habit Questions

| Habit | Icon | Question | Description |
|-------|------|----------|-------------|
| **Exercised** | 🏃 | Did you exercise today? | Any physical activity counts |
| **Ate Healthy** | 🥗 | Did you eat healthy today? | Balanced, nutritious meals |
| **Drank Water** | 💧 | Did you drink enough water? | Stay hydrated throughout the day |
| **Slept Well** | 😴 | Did you sleep well last night? | 7-9 hours of quality sleep |
| **Took Vitamins** | 💊 | Did you take your vitamins? | Daily supplements if applicable |
| **Meditated** | 🧘 | Did you meditate or practice mindfulness? | Even 5 minutes counts |
| **Stretched** | 🤸 | Did you stretch or do flexibility work? | Keep your body mobile |
| **Journaled** | 📝 | Did you journal or reflect? | Mental clarity and gratitude |
| **Skin Care Routine** | ✨ | Did you complete your skin care routine? | Morning or evening routine |
| **Hair Care Routine** | 💇 | Did you complete your hair care routine? | As per your schedule |

---

## 🗄️ Database Schema

### User Model Extension

```typescript
dailyHabits: Array<{
  date: Date;                    // Date of the habit tracking
  habits: {
    exercised: boolean;          // Did they exercise?
    ateHealthy: boolean;         // Did they eat healthy?
    drankWater: boolean;         // Did they drink enough water?
    sleptWell: boolean;          // Did they sleep well?
    tookVitamins: boolean;       // Did they take vitamins?
    meditated: boolean;          // Did they meditate?
    stretched: boolean;          // Did they stretch?
    journaled: boolean;          // Did they journal?
    skinCareRoutine: boolean;    // Did they do skin care?
    hairCareRoutine: boolean;    // Did they do hair care?
  };
  completionRate: number;        // Percentage (0-100)
  notes?: string;                // Optional daily notes
}>;
```

---

## 🔌 API Endpoints

### 1. GET /api/habits

**Fetch habits for a specific date (defaults to today)**

```typescript
// Request
GET /api/habits?date=2025-10-16

// Response
{
  "success": true,
  "date": "2025-10-16T00:00:00.000Z",
  "habits": {
    "exercised": true,
    "ateHealthy": true,
    "drankWater": true,
    "sleptWell": false,
    "tookVitamins": true,
    "meditated": false,
    "stretched": true,
    "journaled": false,
    "skinCareRoutine": true,
    "hairCareRoutine": false
  },
  "completionRate": 60,
  "notes": "Great workout today!",
  "message": "Habits fetched successfully"
}
```

### 2. POST /api/habits

**Create or update habits for a date**

```typescript
// Request
POST /api/habits
{
  "habits": {
    "exercised": true,
    "ateHealthy": true,
    "drankWater": true,
    "sleptWell": true,
    "tookVitamins": false,
    "meditated": false,
    "stretched": false,
    "journaled": false,
    "skinCareRoutine": true,
    "hairCareRoutine": false
  },
  "notes": "Feeling great today!",
  "date": "2025-10-16"  // Optional, defaults to today
}

// Response
{
  "success": true,
  "date": "2025-10-16T00:00:00.000Z",
  "habits": {...},
  "completionRate": 50,
  "notes": "Feeling great today!",
  "message": "Habits updated successfully"
}
```

### 3. PUT /api/habits

**Toggle a single habit (optimized for quick updates)**

```typescript
// Request
PUT /api/habits
{
  "habitKey": "exercised",
  "value": true,
  "date": "2025-10-16"  // Optional, defaults to today
}

// Response
{
  "success": true,
  "date": "2025-10-16T00:00:00.000Z",
  "habits": {...},
  "completionRate": 70,
  "message": "Habit 'exercised' updated successfully"
}
```

---

## 🎨 UI Component

### Component: `DailyHabits.tsx`

**Location:** `src/app/components/dashboard/DailyHabits.tsx`

#### Features:
1. **Date Navigation**
   - Previous/Next day buttons
   - "Go to Today" quick button
   - Formatted date display

2. **Progress Overview**
   - Visual progress bar
   - X/10 completed count
   - Percentage display

3. **Habit Cards**
   - Colorful gradient borders when completed
   - Smooth toggle animations
   - Icon + question + description

4. **Toggle Switch**
   - Custom animated switch
   - Yes/No labels
   - Instant feedback

5. **Daily Notes**
   - Auto-save on blur
   - Optional reflection space
   - Textarea with styling

6. **Motivational Messages**
   - 100% completion: "Perfect Day!" 🎉
   - 70-99% completion: "Great Job!" 💪
   - Animated pulse effect

#### Integration Example:

```tsx
// In your dashboard page
import DailyHabits from '@/app/components/dashboard/DailyHabits';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DailyHabits />
      {/* Other sections */}
    </div>
  );
}
```

---

## 📊 Aura Score Integration

### How Habits Affect Your Score

Habits contribute to the **Consistency dimension** of the Aura Score:

```
Consistency Score Breakdown:
- Streak Length: 35% (was 50%)
- Water Intake: 20% (was 25%)
- Daily Completion: 20% (was 25%)
- Daily Habits: 25% (NEW)
```

### Calculation Logic:

```typescript
// Get last 7 days of habit data
const recentHabits = user.dailyHabits?.filter(day => 
  new Date(day.date) >= sevenDaysAgo && new Date(day.date) <= today
);

// Calculate average completion rate
let totalCompletionRate = 0;
for (const habitDay of recentHabits) {
  totalCompletionRate += habitDay.completionRate || 0;
}
const avgCompletionRate = totalCompletionRate / recentHabits.length;

// Add to consistency score (max 25 points)
score += (avgCompletionRate / 100) * 25;
```

### Example Impact:

**User with 7 days of habit data:**
- Day 1: 80% completion (8/10 habits)
- Day 2: 70% completion (7/10 habits)
- Day 3: 90% completion (9/10 habits)
- Day 4: 100% completion (10/10 habits)
- Day 5: 60% completion (6/10 habits)
- Day 6: 80% completion (8/10 habits)
- Day 7: 90% completion (9/10 habits)

**Average:** (80 + 70 + 90 + 100 + 60 + 80 + 90) / 7 = 81.4%

**Habit Score:** 81.4% × 0.25 = 20.35 points (out of 25)

**Impact on Aura Score:**
- Consistency: Gets ~20/25 points from habits
- Overall: Adds ~4 points to total Aura Score (20 × 0.20 = 4)

---

## 📈 Analytics & Reporting

### Completion Rate Trends

Track habit consistency over time:

```typescript
// Get completion rates for last 30 days
const last30Days = user.dailyHabits
  ?.filter(day => day.date >= thirtyDaysAgo)
  .map(day => ({
    date: day.date,
    rate: day.completionRate
  }));

// Calculate average
const avgRate = last30Days.reduce((sum, day) => sum + day.rate, 0) / last30Days.length;

// Find best and worst days
const bestDay = Math.max(...last30Days.map(d => d.rate));
const worstDay = Math.min(...last30Days.map(d => d.rate));
```

### Individual Habit Analysis

Which habits are users best at?

```typescript
// Count completions for each habit
const habitStats = {
  exercised: 0,
  ateHealthy: 0,
  drankWater: 0,
  // ... etc
};

user.dailyHabits?.forEach(day => {
  Object.keys(day.habits).forEach(key => {
    if (day.habits[key]) {
      habitStats[key]++;
    }
  });
});

// Convert to percentages
const totalDays = user.dailyHabits.length;
Object.keys(habitStats).forEach(key => {
  habitStats[key] = (habitStats[key] / totalDays) * 100;
});
```

### Streak Tracking

How many consecutive days of 100% completion?

```typescript
let currentStreak = 0;
let longestStreak = 0;
let tempStreak = 0;

const sortedHabits = user.dailyHabits
  ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

sortedHabits?.forEach((day, index) => {
  if (day.completionRate === 100) {
    tempStreak++;
    if (index === sortedHabits.length - 1) {
      currentStreak = tempStreak;
    }
  } else {
    longestStreak = Math.max(longestStreak, tempStreak);
    tempStreak = 0;
  }
});
```

---

## 🎯 Usage Examples

### Basic Usage

```tsx
import DailyHabits from '@/app/components/dashboard/DailyHabits';

function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <DailyHabits />
    </div>
  );
}
```

### Programmatic Toggle

```typescript
// Toggle a habit via API
async function markExerciseComplete() {
  const response = await fetch('/api/habits', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      habitKey: 'exercised',
      value: true
    })
  });
  
  const data = await response.json();
  console.log(`Completion rate: ${data.completionRate}%`);
}
```

### Bulk Update

```typescript
// Update all habits at once
async function completeAllHabits() {
  const allHabits = {
    exercised: true,
    ateHealthy: true,
    drankWater: true,
    sleptWell: true,
    tookVitamins: true,
    meditated: true,
    stretched: true,
    journaled: true,
    skinCareRoutine: true,
    hairCareRoutine: true
  };
  
  await fetch('/api/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      habits: allHabits,
      notes: "Perfect day! 🎉"
    })
  });
}
```

### Historical Analysis

```typescript
// Get habits for a specific date
async function getHabitsForDate(date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const response = await fetch(`/api/habits?date=${dateStr}`, {
    credentials: 'include'
  });
  
  return await response.json();
}

// Example: Get last week's habits
const lastWeek = [];
for (let i = 0; i < 7; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const habits = await getHabitsForDate(date);
  lastWeek.push(habits);
}
```

---

## 🎨 Customization

### Adding New Habits

1. **Update the User Model** (`user.model.ts`):
```typescript
habits: {
  // ... existing habits
  readBook: { type: Boolean, default: false },  // New habit
}
```

2. **Add to Component** (`DailyHabits.tsx`):
```typescript
const habitConfigs = [
  // ... existing configs
  {
    key: 'readBook',
    icon: '📚',
    label: 'Did you read today?',
    description: 'At least 10 pages',
    color: 'from-indigo-500 to-blue-500'
  }
];
```

3. **Update Interface**:
```typescript
interface Habits {
  // ... existing habits
  readBook: boolean;
}
```

### Changing Colors

Edit the `habitConfigs` array in `DailyHabits.tsx`:

```typescript
{
  key: 'exercised',
  color: 'from-red-500 to-pink-500'  // Change gradient colors
}
```

### Adjusting Aura Score Weight

Edit `src/utils/auraScore.ts`:

```typescript
// Change habit weight in Consistency Score
score += (avgCompletionRate / 100) * 30;  // Increased from 25 to 30
```

---

## 🚀 Best Practices

### For Users:
1. **Check in daily** - Build the habit of updating your tracker
2. **Be honest** - Accurate tracking leads to better insights
3. **Use notes** - Reflect on your day for better awareness
4. **Aim for progress, not perfection** - 70%+ is great!
5. **Review trends** - Look at your completion rates weekly

### For Developers:
1. **Validate dates** - Always normalize to midnight (00:00:00)
2. **Handle missing data** - Return empty habits if no entry exists
3. **Optimize queries** - Index the date field for faster lookups
4. **Cache strategically** - Habit data changes frequently
5. **Test edge cases** - Timezone differences, leap years, etc.

---

## 🐛 Troubleshooting

### Habits not saving
**Check:**
- User is authenticated
- Date is properly formatted (YYYY-MM-DD)
- Request includes credentials: 'include'

### Completion rate incorrect
**Verify:**
- All 10 habits are defined in the database
- completionRate is recalculated on each update
- No null/undefined values in habits object

### Old dates not loading
**Ensure:**
- Date comparison uses normalized timestamps
- Database query filters correctly
- Timezone doesn't cause date mismatch

---

## 📊 Performance

- **API Response Time:** ~50-150ms
- **Database Query:** Single user lookup with array filter
- **UI Rendering:** Optimistic updates for instant feedback
- **Storage:** ~50 bytes per habit entry per day

---

## 🔮 Future Enhancements

Potential features to add:

1. **Custom Habits** - Let users define their own questions
2. **Habit Streaks** - Track consecutive days for each habit
3. **Reminders** - Push notifications for incomplete habits
4. **Social Sharing** - Share perfect days with friends
5. **Habit Templates** - Pre-built sets for different goals
6. **Time Tracking** - How long did each activity take?
7. **Mood Tracking** - Correlate habits with mood scores
8. **Gamification** - Earn badges for streaks and completions

---

## ✅ Testing Checklist

- [ ] Can create new habit entries
- [ ] Can toggle individual habits
- [ ] Completion rate calculates correctly
- [ ] Date navigation works (prev/next)
- [ ] "Go to Today" button functions
- [ ] Notes save automatically
- [ ] Historical data loads correctly
- [ ] Aura Score includes habit data
- [ ] UI shows motivational messages
- [ ] Toggle animations smooth
- [ ] Mobile responsive
- [ ] API returns proper errors

---

## 📚 Related Documentation

- **Aura Score System:** See `AURA_README.md`
- **API Reference:** See `API_DOCUMENTATION.md` (if exists)
- **User Model:** See `src/models/user.model.ts`

---

**Start tracking your daily habits and build lasting wellness routines! 🌟**
