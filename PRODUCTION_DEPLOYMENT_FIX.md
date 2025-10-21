# Production Deployment & Meal Tracking Issues - Fix Guide

## 🚨 Critical Issues Identified

### 1. Production Stuck on Oct 16
**Problem:** Latest code changes committed on Oct 19 haven't been deployed to production
**Impact:** 
- Analytics refresh not working in production
- Meal tracking improvements not available
- Activity feed enhancements missing
- OTP fixes not deployed

### 2. Meal Tracking Inconsistencies
**Problem:** Overview not updating when meals are added, charts not displaying after Oct 16
**Root Causes:**
- Date comparison issues (timezone mismatches)
- Analytics not re-fetching after meal changes
- Daily tracking not updating properly
- State synchronization issues between components

## 🔧 Immediate Fixes Required

### Fix 1: Deploy Latest Code to Production

**Your latest commit (e684c21) includes:**
- ✅ Analytics auto-refresh mechanism
- ✅ Meal tracking immediate UI updates
- ✅ Overview refresh triggers
- ✅ Activity feed enhancements
- ✅ Console logging for debugging

**Action Required:**
```bash
# Verify you're on the latest commit
git log --oneline -1

# Should show: e684c21 feat: Add footer logo, OTP verification...

# If your production platform is Vercel/Netlify:
# 1. Push to main (already done)
# 2. Trigger redeployment in platform dashboard
# 3. Or force redeploy with:
git commit --allow-empty -m "chore: trigger production rebuild"
git push origin main
```

### Fix 2: Date Handling Issues

**Problem:** Charts not showing data after Oct 16 suggests date filtering issue

**Check these in your code:**

1. **Analytics Date Filtering** (AnalyticsOverview.tsx line ~115-175)
   - Currently filters based on date ranges
   - May be excluding recent dates due to timezone issues
   
2. **Meal API Date Comparison** (meals/route.ts line ~127-133)
   - Uses `setHours(0,0,0,0)` for date normalization
   - Timezone differences between client/server can cause mismatches

**Date Issues to Fix:**
```typescript
// Current problematic code:
const targetDate = date ? new Date(date) : new Date()
targetDate.setHours(0, 0, 0, 0)

// Issue: Client sends date in local timezone
// Server interprets it differently
// Result: Meals stored with wrong date
```

### Fix 3: Overview Not Updating

**Problem:** When adding meals, overview section doesn't reflect changes

**Current Flow:**
```
Add Meal → MealTracking.addMeals()
          ↓
    onMealAdded() callback
          ↓
    Dashboard.handleMealUpdate()
          ↓
    setOverviewKey(prev => prev + 1)
          ↓
    OverviewSection re-mounts with new key
          ↓
    Fetches /api/tracking/daily
          ↓
    Should show updated calories
```

**Why it fails:**
1. `/api/tracking/daily` might not have the updated data yet
2. Race condition between meal save and tracking update
3. Daily tracking updates in POST /meals but GET /daily fetches stale data

## 🎯 Comprehensive Solution

### Step 1: Fix Date Handling in Meal API

The meal API needs to handle dates in UTC to avoid timezone issues:

**File:** `src/app/api/profile/meals/route.ts`

**Change needed in POST method (around line 132):**
```typescript
// OLD - can cause timezone issues:
const targetDate = date ? new Date(date) : new Date()
targetDate.setHours(0, 0, 0, 0)

// NEW - parse as UTC:
const targetDate = date ? new Date(date) : new Date()
// Create UTC date
const year = targetDate.getFullYear()
const month = targetDate.getMonth()
const day = targetDate.getDate()
const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
```

### Step 2: Fix Analytics Date Range

**File:** `src/app/components/dashboard/AnalyticsOverview.tsx`

The issue is in the date filtering logic (lines 115-178). When checking `timeRange === 'daily'`, it only gets the last 7 days but may exclude today if there's a timezone mismatch.

**Add logging to debug:**
```typescript
const analyticsData = useMemo(() => {
  console.log('📊 Analytics: Processing', meals.length, 'meal days');
  console.log('📊 Analytics: Time range:', timeRange);
  
  if (meals.length === 0) {
    console.warn('⚠️ Analytics: No meals data available');
    return [];
  }

  const now = new Date();
  console.log('📊 Analytics: Current date:', now.toISOString());
  
  const sortedMeals = [...meals].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  console.log('📊 Analytics: Latest meal date:', sortedMeals[0]?.date);
  console.log('📊 Analytics: Oldest meal date:', sortedMeals[sortedMeals.length - 1]?.date);

  if (timeRange === 'daily') {
    // Last 7 days
    const result = sortedMeals.slice(0, 7).reverse().map(day => {
      const totals = calculateDayTotals(day);
      console.log('📊 Day:', day.date, 'Calories:', totals.calories);
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...totals
      };
    });
    console.log('📊 Analytics: Returning', result.length, 'data points');
    return result;
  }
  // ... rest of code
}, [meals, timeRange]);
```

### Step 3: Ensure Daily Tracking Updates

**File:** `src/app/api/profile/meals/route.ts` (already implemented)

The POST method already updates `dailyTracking` when meals are added (lines 255-293). However, we need to ensure this data is immediately available.

**Verify this section exists in your production code:**
```typescript
// After adding meals, update daily tracking
const totalCalories = processedMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
const totalProtein = processedMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
const totalCarbs = processedMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
const totalFat = processedMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

// Find or create today's tracking
let todayTracking = user.dailyTracking.find((day: any) => {
  const trackingDate = new Date(day.date);
  trackingDate.setHours(0, 0, 0, 0);
  return trackingDate.getTime() === targetDate.getTime();
});

if (!todayTracking) {
  // Create new tracking entry
  todayTracking = {
    date: targetDate,
    caloriesConsumed: totalCalories,
    proteinConsumed: totalProtein,
    // ... etc
  };
  user.dailyTracking.push(todayTracking);
} else {
  // Update existing
  todayTracking.caloriesConsumed = (todayTracking.caloriesConsumed || 0) + totalCalories;
  todayTracking.proteinConsumed = (todayTracking.proteinConsumed || 0) + totalProtein;
  // ... etc
}

user.markModified('dailyTracking');
await user.save();
```

### Step 4: Force Database Sync (If Data is Stuck)

If your production database has stale data or corrupted dates, you may need to fix it:

**Option A: Clear and Rebuild**
```javascript
// Run this in MongoDB console or create a migration script
db.users.updateMany(
  {},
  {
    $set: {
      "meals": [],
      "dailyTracking": []
    }
  }
)
```

**Option B: Fix Date Formats**
```javascript
// Fix dates that may have been stored incorrectly
db.users.find({}).forEach(function(user) {
  if (user.meals) {
    user.meals.forEach(function(meal) {
      // Ensure date is properly formatted
      meal.date = new Date(meal.date);
      meal.date.setHours(0, 0, 0, 0);
    });
    db.users.save(user);
  }
});
```

## 🧪 Testing Procedure

### Test 1: Verify Production Deployment

1. **Check deployed version:**
   - Open production site
   - Open browser console (F12)
   - Add a meal
   - Look for these logs:
     ```
     ✅ Meals updated from API
     🔄 Calling onMealAdded callback
     🔄 Triggering overview and analytics refresh
     📊 OverviewSection mounted/re-mounted
     📊 AnalyticsOverview: refreshTrigger changed
     ```

2. **If logs are missing:**
   - Deployment hasn't happened yet
   - Trigger redeploy on your hosting platform
   - Or run: `git commit --allow-empty -m "redeploy" && git push`

### Test 2: Verify Date Handling

1. **Add meal for today:**
   ```javascript
   // In browser console, check the date being sent:
   const today = new Date();
   console.log('Client date:', today.toISOString());
   console.log('UTC date:', new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
   ```

2. **Check server response:**
   - Network tab → Filter XHR
   - POST to `/api/profile/meals`
   - Check response → `meals` array
   - Verify dates match today

3. **Check analytics:**
   - Go to Analytics tab
   - Should see today's data in charts
   - Console should show:
     ```
     📊 Analytics: Latest meal date: 2025-10-21T00:00:00.000Z
     📊 Day: 2025-10-21T00:00:00.000Z Calories: 450
     ```

### Test 3: Verify Overview Updates

1. **Start with Overview tab open**
2. **Note current calorie count**
3. **Go to Meals tab → Add a meal with known calories (e.g., "Banana" ~100 cal)**
4. **Go back to Overview tab**
5. **Should see:**
   - Calorie count increased by ~100
   - Progress bars updated
   - If not immediate, wait 1-2 seconds for re-mount

### Test 4: Verify Analytics Charts

1. **Go to Analytics tab**
2. **Select "Daily" view**
3. **Should see:**
   - Last 7 days of data
   - Today's date on the rightmost point
   - Bars/lines for each day with meals
4. **Add a new meal**
5. **Return to Analytics**
6. **Today's chart should update** (may take 30s for auto-refresh)

## 🐛 Debugging Commands

### Check What's in Production

```bash
# See latest production commit
git log origin/main --oneline -1

# Compare with local
git log --oneline -1

# If different, production is behind
```

### Check Database State

```bash
# Connect to MongoDB
# Check a user's meal data
db.users.findOne({email: "your@email.com"}, {meals: 1, dailyTracking: 1})

# Look for:
# - Are there meals for recent dates?
# - Are dates in correct format?
# - Is dailyTracking updating?
```

### Check Network Requests

In browser console:
```javascript
// Watch for meal API calls
fetch('/api/profile/meals')
  .then(r => r.json())
  .then(data => {
    console.log('Meals in database:', data.meals.length);
    console.log('Latest meal:', data.meals[data.meals.length - 1]);
    console.log('Dates:', data.meals.map(m => m.date));
  });

// Watch for tracking API calls
fetch('/api/tracking/daily')
  .then(r => r.json())
  .then(data => {
    console.log('Today\'s tracking:', data.tracking);
    console.log('Calories consumed:', data.tracking.caloriesConsumed);
  });
```

## ✅ Checklist for Resolution

- [ ] **Redeploy to Production**
  - Trigger rebuild on hosting platform
  - Verify deployment completes
  - Check deployed commit hash matches local

- [ ] **Verify Logs Appear**
  - Open production site in browser
  - Add a meal
  - Console shows all refresh logs

- [ ] **Test Meal Addition**
  - Add meal for today
  - Verify it appears in Meal Tracking
  - Check Overview updates
  - Check Analytics shows today's data

- [ ] **Test Date Range**
  - Add meals for multiple days
  - Check Analytics daily view shows all days
  - Verify dates are correct (not off by timezone)

- [ ] **Check Database**
  - Verify meals are being saved
  - Check date formats are consistent
  - Confirm dailyTracking is updating

- [ ] **Monitor Console**
  - No errors in browser console
  - All expected logs appear
  - API calls return 200 status

## 🎯 Expected Behavior After Fix

1. **Meal Addition:**
   - ✅ Add meal → immediately appears in meal list
   - ✅ Toast shows success with calories
   - ✅ Overview section auto-updates within 2 seconds
   - ✅ Analytics updates within 30 seconds (or on manual refresh)

2. **Charts Display:**
   - ✅ Daily view shows last 7 days including today
   - ✅ Today's data appears on the right
   - ✅ Bars/lines show correct values
   - ✅ No gaps or missing dates

3. **Production Consistency:**
   - ✅ Localhost and production behave the same
   - ✅ All features work in both environments
   - ✅ No timezone-related date issues

## 🆘 If Still Not Working

1. **Hard refresh browser:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)
   - Clears cached JavaScript

2. **Check environment variables:**
   - Verify `MONGODB_URI` is correct in production
   - Check `NEXTAUTH_SECRET` is set
   - Ensure `GEMINI_API_KEY` is configured

3. **Check hosting platform logs:**
   - Look for build errors
   - Check runtime errors
   - Verify deployment succeeded

4. **Test with curl:**
   ```bash
   # Test meal addition
   curl -X POST https://your-production-url.com/api/profile/meals \
     -H "Content-Type: application/json" \
     -H "Cookie: auth-token=YOUR_TOKEN" \
     -d '{"mealType":"breakfast","items":[{"name":"Test","quantity":1}],"date":"2025-10-21T00:00:00.000Z"}'
   ```

## 📝 Summary

**Main Issue:** Production is running old code from Oct 16, missing all recent fixes

**Solution:** Redeploy latest code to production platform

**Secondary Issue:** Date handling inconsistencies causing charts to not show recent data

**Solution:** Add UTC date handling and improved logging to debug

**Action Items:**
1. Trigger production redeploy NOW
2. After deploy, test meal addition flow
3. Check console logs to verify all hooks are working
4. If charts still don't show data, check database dates
5. Use the debugging commands above to investigate further
