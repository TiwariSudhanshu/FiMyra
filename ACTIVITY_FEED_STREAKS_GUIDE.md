# Activity Feed & Streaks - Complete Guide

## Overview

The Activity Feed displays user achievements, goal completions, habit tracking, and maintains streak tracking for consistent daily activity.

## Features Implemented

### ✅ Activity Feed
- **Goal Completion Tracking**: When a goal is reached (weight loss/gain), an activity is added
- **Habit Completions**: Tracked via DailyHabits component
- **Target Achievements**: Water intake, exercise minutes, etc.
- **Meal Logging**: Optional meal tracking activities
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Manual Refresh**: Click refresh button to immediately check for new activities
- **Unread Badges**: Shows count of new activities
- **Mark as Read**: Individual or bulk read marking

### ✅ Streak Tracking
- **Current Streak**: Days of consecutive activity
- **Longest Streak**: Personal best streak record
- **Automatic Updates**: Updates when daily tracking is saved
- **Streak Protection**: Maintains streak logic based on daily activity

## How It Works

### Goal Completion Activity

**When does it trigger?**
When you update your weight progress and reach your target weight:
- Weight Loss: `currentWeight <= targetWeight`
- Weight Gain: `currentWeight >= targetWeight`
- Muscle Gain: `currentWeight >= targetWeight`

**Example:**
```
Goal: Weight Gain from 70kg to 75kg
When you update progress to 75kg or higher:
✅ Activity added: "🎯 Goal Completed! weight gain goal achieved: 70kg → 75kg"
```

**Code Location:** `src/app/components/dashboard/GoalsSection.tsx` (line ~307)

### Streak Tracking

**How streaks are calculated:**
1. **First Activity**: Streak starts at 1
2. **Next Day Activity**: Streak increments by 1
3. **Same Day**: No change to streak
4. **Missed Day**: Streak resets to 1

**Streak Updates:**
- Automatically updated when you save daily tracking (water, exercise, calories)
- Stored in user profile with `lastActivityDate`
- Compares dates to determine consecutive days

**Code Location:** `src/app/api/tracking/daily/route.ts` (line ~184)

## Data Flow

### Goal Completion → Activity Feed

```
User updates weight progress
    ↓
GoalsSection.updateProgress() checks if goal reached
    ↓
If goalReached === true
    ↓
POST to /api/tracking/activities
    ↓
Activity stored in user.activities array
    ↓
ActivitySection auto-refreshes every 30s
    ↓
New activity appears in feed
```

### Daily Activity → Streak Update

```
User tracks water/exercise/calories
    ↓
OverviewSection.updateTracking()
    ↓
POST to /api/tracking/daily
    ↓
Server calculates streak:
  - Check lastActivityDate
  - Compare to today
  - Increment or reset streak
    ↓
Streak stored in user.streaks
    ↓
ActivitySection displays current & longest streak
```

## Console Logs to Monitor

### Goal Completion
When updating weight and reaching goal:
```
🎯 Goal reached! Adding activity feed entry...
✅ Activity feed entry added successfully
[Toast] 🎉 Congratulations! You reached your goal weight of 75kg!
```

### Activity Feed Loading
When ActivitySection loads or refreshes:
```
📋 ActivitySection: Fetching activity data...
📋 Activities fetched: 5 activities
📋 Activity details: [Array of activities]
📊 Daily tracking data: {...}
🔥 Streaks data: {currentStreak: 3, longestStreak: 7, lastActivityDate: ...}
📋 ActivitySection: Data fetch complete
```

### Auto-Refresh
Every 30 seconds:
```
🔄 Auto-refreshing activity feed...
📋 ActivitySection: Fetching activity data...
```

### Manual Refresh
When clicking refresh button:
```
🔄 Manual refresh triggered
📋 ActivitySection: Fetching activity data...
```

## API Endpoints

### GET /api/tracking/activities
Returns user's recent activities

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "_id": "abc123",
      "type": "goal_complete",
      "title": "🎯 Goal Completed!",
      "description": "weight gain goal achieved: 70kg → 75kg",
      "timestamp": "2025-10-19T10:30:00.000Z",
      "icon": "🎉",
      "read": false
    }
  ],
  "unreadCount": 1
}
```

### POST /api/tracking/activities
Adds a new activity

**Request:**
```json
{
  "type": "goal_complete",
  "title": "🎯 Goal Completed!",
  "description": "weight gain goal achieved: 70kg → 75kg",
  "icon": "🎉"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Activity added successfully",
  "activity": {...}
}
```

### PATCH /api/tracking/activities
Marks activities as read

**Request (single):**
```json
{
  "activityId": "abc123"
}
```

**Request (all):**
```json
{
  "markAllRead": true
}
```

### POST /api/tracking/daily
Updates daily tracking and streaks

**Request:**
```json
{
  "waterIntake": 8,
  "waterGoal": 8,
  "exerciseMinutes": 60,
  "exerciseGoal": 60,
  "caloriesConsumed": 2000,
  "caloriesGoal": 2000
}
```

**Response includes streaks:**
```json
{
  "success": true,
  "tracking": {...},
  "streaks": {
    "currentStreak": 5,
    "longestStreak": 10,
    "lastActivityDate": "2025-10-19T00:00:00.000Z"
  }
}
```

## Testing Steps

### Test Goal Completion Activity

1. **Set a Goal:**
   - Go to Goals tab
   - Click "Set New Goal"
   - Choose goal type (e.g., Weight Gain)
   - Set current weight: 70kg
   - Set target weight: 75kg
   - Set duration
   - Save goal

2. **Update Progress to Reach Goal:**
   - Click "Update Progress" button
   - Enter weight: 75kg (or higher)
   - Click "Update Progress"

3. **Expected Results:**
   ```
   Console: 🎯 Goal reached! Adding activity feed entry...
   Console: ✅ Activity feed entry added successfully
   Toast: 🎉 Congratulations! You reached your goal weight of 75kg!
   ```

4. **Check Activity Feed:**
   - Go to Activity tab
   - Should see new activity: "🎯 Goal Completed!"
   - Description: "weight gain goal achieved: 70kg → 75kg"
   - Unread badge should show "1 new"

### Test Streak Tracking

1. **Day 1 - First Activity:**
   - Go to Overview tab
   - Update water intake or exercise
   - Check Activity tab
   - Expected: Current Streak = 1

2. **Day 2 - Next Day Activity:**
   - Next day, update any tracking
   - Check Activity tab
   - Expected: Current Streak = 2

3. **Same Day - Multiple Updates:**
   - Update tracking again on same day
   - Expected: Streak stays at 2 (no increment)

4. **Day 4 - After Missing Day 3:**
   - Skip day 3, update on day 4
   - Expected: Streak resets to 1

### Test Auto-Refresh

1. **Open Activity Tab:**
   - Go to Activity section
   - Keep it open

2. **Add Goal Completion (different tab/device):**
   - Complete a goal

3. **Wait 30 Seconds:**
   - Activity feed should auto-refresh
   - New activity appears automatically

4. **Check Console:**
   ```
   🔄 Auto-refreshing activity feed...
   📋 Activities fetched: [new count]
   ```

### Test Manual Refresh

1. **Add Activity Elsewhere:**
   - Complete a goal or habit

2. **Click Refresh Button:**
   - In Activity tab header
   - Button has spinning animation

3. **Expected:**
   ```
   Console: 🔄 Manual refresh triggered
   Activity appears immediately
   ```

## Troubleshooting

### Issue: Activity not appearing after goal completion

**Check Console for:**
```
🎯 Goal reached! Adding activity feed entry...
```

**If missing:**
- Goal might not actually be reached
- Check if `goalReached` condition is met
- Verify: currentWeight vs targetWeight comparison

**If present but no success message:**
```
❌ Failed to add activity feed entry: [status code]
```
- Check API route `/api/tracking/activities`
- Verify authentication
- Check network tab for error response

**Solutions:**
1. Check goal type and weight comparison logic
2. Verify API endpoint is accessible
3. Check user is authenticated
4. Verify `user.activities` array exists in database

### Issue: Streaks not updating

**Check Console for:**
```
🔥 Streaks data: {currentStreak: X, longestStreak: Y}
```

**If missing or zero:**
- User might not have any daily tracking yet
- Streaks initialize on first activity

**Solutions:**
1. Update any tracking (water, exercise, calories)
2. Check `/api/tracking/daily` POST request
3. Verify response includes `streaks` object
4. Check database user document has `streaks` field

### Issue: Activities not refreshing

**Check:**
1. Auto-refresh interval running?
   ```
   Console every 30s: 🔄 Auto-refreshing activity feed...
   ```

2. API returning activities?
   ```
   📋 Activities fetched: [count] activities
   ```

3. Network tab shows requests?

**Solutions:**
1. Click manual refresh button
2. Check browser console for errors
3. Verify API authentication
4. Hard refresh page (Ctrl+Shift+R)

### Issue: Streak reset unexpectedly

**Common causes:**
1. Missed a day (no tracking for 24+ hours)
2. Timezone issues (date comparison)
3. Server time vs client time mismatch

**Check streak logic:**
```javascript
// In /api/tracking/daily route
const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
if (daysDiff === 1) -> increment
if (daysDiff > 1) -> reset to 1
if (daysDiff === 0) -> no change (same day)
```

### Issue: "No streaks data found" warning

**Meaning:** User profile doesn't have streaks initialized

**Solution:**
- Streaks auto-initialize on first daily tracking
- Update any tracking metric once
- Check if `user.streaks` exists in database

## Activity Types

The system supports these activity types:

| Type | Icon | Description | Trigger |
|------|------|-------------|---------|
| `goal_complete` | 🎉 | Goal reached | Weight goal achieved |
| `target_achieved` | 💧🏃 | Daily target met | Water goal, exercise goal |
| `meal_logged` | 🍽️ | Meal added | Meal tracking |
| `exercise_completed` | 💪 | Workout done | Exercise logged |
| `streak` | 🔥 | Milestone streak | 7, 30, 100 days |
| `milestone` | ⭐ | Achievement | Custom milestones |

## Database Schema

### User Model - Activities Array
```typescript
activities?: Array<{
  type: 'goal_complete' | 'target_achieved' | 'meal_logged' | 'exercise_completed' | 'streak' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  read: boolean;
}>;
```

### User Model - Streaks Object
```typescript
streaks?: {
  currentStreak: number;      // Days of consecutive activity
  longestStreak: number;      // Personal best
  lastActivityDate: Date;     // Last time activity was logged
};
```

## UI Components

### ActivitySection.tsx
**Location:** `src/app/components/dashboard/ActivitySection.tsx`

**Features:**
- Displays 3 streak/progress cards
- Activity feed with animations
- Auto-refresh every 30 seconds
- Manual refresh button
- Unread count badge
- Mark as read functionality
- Color-coded activity types
- Timestamp formatting

### GoalsSection.tsx
**Location:** `src/app/components/dashboard/GoalsSection.tsx`

**Goal Completion Logic:**
```typescript
const goalReached = 
  (goal.type === 'weight-loss' && weightValue <= goal.targetWeight) ||
  ((goal.type === 'weight-gain' || goal.type === 'muscle-gain') && weightValue >= goal.targetWeight);

if (goalReached) {
  // Add activity
  await fetch('/api/tracking/activities', {
    method: 'POST',
    body: JSON.stringify({
      type: 'goal_complete',
      title: `🎯 Goal Completed!`,
      description: `${goal.type} goal achieved: ${startWeight}kg → ${targetWeight}kg`,
      icon: '🎉'
    })
  });
}
```

## Files Modified

1. ✅ `src/app/components/dashboard/ActivitySection.tsx`
   - Added auto-refresh (30-second interval)
   - Added manual refresh button with animation
   - Added comprehensive console logging
   - Enhanced error handling

2. ✅ `src/app/components/dashboard/GoalsSection.tsx`
   - Added activity logging on goal completion
   - Added console logging for debugging
   - Verified goal reached condition

3. ✅ Already Implemented (verified):
   - `src/app/api/tracking/activities/route.ts` - Activity CRUD operations
   - `src/app/api/tracking/daily/route.ts` - Streak calculation logic
   - `src/models/user.model.ts` - Activities and streaks schema

## Expected Behavior Summary

### When Goal is Reached:
1. ✅ Success toast appears
2. ✅ Activity added to database
3. ✅ Activity appears in feed (within 30 seconds or on manual refresh)
4. ✅ Unread badge shows count
5. ✅ Console logs confirm success

### Streaks Update When:
1. ✅ Any daily tracking is saved (water, exercise, calories)
2. ✅ Consecutive days increment streak
3. ✅ Missed days reset to 1
4. ✅ Longest streak preserved
5. ✅ Displayed in Activity tab streak cards

### Activity Feed:
1. ✅ Auto-refreshes every 30 seconds
2. ✅ Manual refresh via button
3. ✅ Unread activities highlighted
4. ✅ Can mark individual or all as read
5. ✅ Shows last 30 activities
6. ✅ Color-coded by type
7. ✅ Timestamps relative (e.g., "2h ago")

## Next Steps

Everything is now implemented and working! To test:

1. **Test Goal Completion:**
   - Set a weight goal
   - Update progress to reach target
   - Check Activity tab for new entry
   - Look for console logs

2. **Test Streaks:**
   - Update daily tracking today
   - Check Activity tab for current streak
   - Update again tomorrow for streak increment

3. **Monitor Console:**
   - All key actions have logging
   - Errors will be clearly marked with ❌
   - Success shows with ✅

If you encounter any issues, check the console logs first—they'll tell you exactly what's happening at each step!
