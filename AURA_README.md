# Aura Score System Documentation

## Overview

The **Aura Score** is a comprehensive wellness metric that evaluates a user's overall health habits on a scale from **0 to 100**. It provides an intelligent, data-driven assessment of how consistently and effectively users are maintaining their health routines across multiple dimensions.

---

## Philosophy

The Aura Score is designed to:
- **Reward consistency** over perfection
- **Encourage balanced wellness** across multiple areas
- **Reflect recent activity** more heavily than old data
- **Handle missing data gracefully** without penalizing users
- **Provide actionable insights** through dimension breakdown

---

## Scoring Dimensions

The Aura Score is calculated from **5 key dimensions**, each weighted differently based on its impact on overall wellness:

| Dimension | Weight | Max Points | Description |
|-----------|--------|------------|-------------|
| **Nutrition** | 30% | 100 | Diet quality, meal tracking, macro balance |
| **Activity** | 25% | 100 | Exercise, steps, sleep quality |
| **Consistency** | 20% | 100 | Daily tracking streaks, habit formation |
| **Routines** | 15% | 100 | Skin care and hair care routine completion |
| **Goals** | 10% | 100 | Goal setting and progress tracking |

### Formula:
```
Aura Score = (Nutrition × 0.30) + (Activity × 0.25) + (Consistency × 0.20) + (Routines × 0.15) + (Goals × 0.10)
```

---

## Detailed Formula Breakdown

### 1. Nutrition Score (0-100 points)

**Purpose:** Evaluate dietary habits, meal logging consistency, and nutritional balance.

#### Components:

##### A. Meal Logging Consistency (40 points)
Rewards users for consistently tracking their meals.

**Formula:**
```
Consistency Score = min((Days with Meals / 7) × 40, 40)
```

**Logic:**
- Count days with logged meals in the last 7 days
- Award up to 40 points proportionally
- 7 days of logging = full 40 points

##### B. Calorie Target Accuracy (25 points)
Measures how close users are to their daily calorie goals.

**Formula:**
```
For each day:
  Accuracy = 1 - |Calories Consumed - Calorie Goal| / Calorie Goal
  Day Score = clamp(Accuracy × 100, 0, 100)

Calorie Score = (Sum of Day Scores / Valid Days) × 0.25
```

**Logic:**
- Perfect match (goal = consumed) = 100% accuracy
- 20% over/under goal = 80% accuracy
- 50% over/under goal = 50% accuracy
- Average across all valid days in last week

##### C. Macro Balance (25 points)
Evaluates protein, carbs, and fat intake against goals.

**Formula:**
```
For each day:
  Protein % = (Protein Consumed / Protein Goal) × 100
  Carbs % = (Carbs Consumed / Carbs Goal) × 100
  Fat % = (Fat Consumed / Fat Goal) × 100
  
  Day Macro Score = (Protein % + Carbs % + Fat %) / 3

Macro Score = (Sum of Day Macro Scores / Valid Days) × 0.25
```

**Logic:**
- Each macro is scored independently (0-100%)
- Average the three macros per day
- Average across the week

##### D. Meal Variety (10 points)
Rewards logging diverse meal types (breakfast, lunch, dinner).

**Formula:**
```
For each day:
  Meal Types Logged = count(breakfast, lunch, dinner)
  Day Variety = (Meal Types / 3) × 10

Variety Score = Average(Day Variety across all meal days)
```

**Logic:**
- 3 meal types logged = 10 points
- 2 meal types logged = 6.67 points
- 1 meal type logged = 3.33 points

---

### 2. Activity Score (0-100 points)

**Purpose:** Measure physical activity, movement, and sleep quality.

#### Components:

##### A. Exercise Minutes (40 points)
Tracks workout duration vs goals.

**Formula:**
```
For each day:
  Exercise % = (Exercise Minutes / Exercise Goal) × 100
  Exercise % = clamp(Exercise %, 0, 100)

Exercise Score = (Sum of Exercise % / Valid Days) × 0.40
```

**Logic:**
- Meeting exercise goal = 100%
- 50% of goal = 50%
- Exceeding goal caps at 100%

##### B. Steps Count (30 points)
Evaluates daily step count vs targets.

**Formula:**
```
For each day:
  Steps % = (Steps Count / Steps Goal) × 100
  Steps % = clamp(Steps %, 0, 100)

Steps Score = (Sum of Steps % / Valid Days) × 0.30
```

**Logic:**
- 10,000 steps (typical goal) = 100%
- 5,000 steps = 50%
- 15,000 steps = 100% (capped)

##### C. Activity Consistency (20 points)
Rewards any form of daily activity.

**Formula:**
```
Active Days = count(days with exercise > 0 OR steps > 0)
Consistency Score = (Active Days / 7) × 20
```

**Logic:**
- Any activity counts (even 1 minute or 100 steps)
- 7 days active = 20 points
- 3 days active = ~8.6 points

##### D. Sleep Quality (10 points)
Evaluates sleep duration vs goals.

**Formula:**
```
For each day:
  Sleep % = (Sleep Hours / Sleep Goal) × 100
  Sleep % = clamp(Sleep %, 0, 100)

Sleep Score = (Sum of Sleep % / Valid Days) × 0.10
```

**Logic:**
- Meeting sleep goal (e.g., 8 hours) = 100%
- 6 hours when goal is 8 = 75%
- Oversleeping doesn't penalize (capped at 100%)

---

### 3. Consistency Score (0-100 points)

**Purpose:** Reward habit formation and daily tracking discipline.

#### Components:

##### A. Streak Length (50 points)
Heavily rewards maintaining consecutive days of activity.

**Formula:**
```
Streak Score = min((Current Streak / 30) × 50, 50)
```

**Logic:**
- Maxes out at 30-day streak (50 points)
- 15-day streak = 25 points
- 7-day streak = ~11.7 points
- 1-day streak = 1.67 points

**Why 30 days?** Research shows it takes 21-30 days to form a habit.

##### B. Water Intake Tracking (25 points)
Measures hydration goals vs consumption.

**Formula:**
```
For each day:
  Water % = (Glasses Consumed / Water Goal) × 100
  Water % = clamp(Water %, 0, 100)

Water Score = (Sum of Water % / Valid Days) × 0.25
```

**Logic:**
- Meeting daily water goal (e.g., 8 glasses) = 100%
- 6/8 glasses = 75%
- 10/8 glasses = 100% (capped)

##### C. Daily Completion Rate (25 points)
Percentage of days marked as "completed" in tracking.

**Formula:**
```
Completed Days = count(days where completed = true)
Completion Score = (Completed Days / 7) × 25
```

**Logic:**
- Users manually mark days as complete
- Rewards overall satisfaction with daily progress
- 7/7 days = 25 points
- 4/7 days = ~14.3 points

---

### 4. Routines Score (0-100 points)

**Purpose:** Evaluate self-care routines beyond nutrition and exercise.

#### Components:

##### A. Skin Care Routine (50 points)
Tracks morning and evening skin care completion.

**Formula:**
```
For each tracked day:
  Morning Points = morningCompleted ? 0.5 : 0
  Evening Points = eveningCompleted ? 0.5 : 0
  Day Score = (Morning + Evening) × 100

Skin Score = (Sum of Day Scores / Tracked Days) × 0.50
```

**Logic:**
- Both routines completed = 100%
- One routine completed = 50%
- No routines completed = 0%
- If profile exists but no tracking: 10 points bonus

##### B. Hair Care Routine (50 points)
Tracks scheduled hair wash completion.

**Formula:**
```
For each scheduled wash day:
  if washCompleted: 100 points
  else if not skipped: 50 points
  else if skipped: 0 points

Hair Score = (Sum of Points / Scheduled Days) × 0.50
```

**Logic:**
- Completing scheduled wash = 100%
- Scheduled but not done (yet) = 50%
- Deliberately skipped = 0%
- If profile exists but no tracking: 10 points bonus

---

### 5. Goals Score (0-100 points)

**Purpose:** Assess goal-setting and progress tracking.

#### Components:

##### A. Goal Completeness (30 points)
Rewards having a well-defined goal.

**Formula:**
```
Has Type? (6 points)
Has Current Weight? (6 points)
Has Target Weight? (6 points)
Has Duration? (6 points)
Has Start Date? (6 points)

Completeness = (Count of Yes / 5) × 30
```

**Logic:**
- All fields filled = 30 points
- 3/5 fields filled = 18 points
- No goal set = 0 points

##### B. Weight Progress (40 points)
Measures actual progress toward weight goal.

**Formula:**
```
Total Weight Change Needed = |Target Weight - Start Weight|
Current Weight Change = |Current Weight - Start Weight|

Progress % = (Current Change / Total Change) × 100
Progress Score = clamp(Progress %, 0, 100) × 0.40
```

**Example:**
- Start: 80kg, Target: 70kg, Current: 75kg
- Total needed: 10kg
- Current progress: 5kg
- Score: (5/10) × 100 = 50% → 20 points

##### C. Time on Track (30 points)
Evaluates consistency over the goal duration.

**Formula:**
```
Days Elapsed = today - startDate
Total Days = duration (months) × 30

Time Progress = min((Days Elapsed / Total Days) × 100, 100)
Time Score = Time Progress × 0.30
```

**Logic:**
- Rewards time commitment
- 50% through 3-month goal = 15 points
- Completed duration = 30 points
- Just started = few points (encourages sticking with it)

---

## Example Calculation

### User Profile:
- **Nutrition:** Logged 5/7 days, 90% calorie accuracy, good macros
- **Activity:** 4/7 days exercised, 6/7 days hit step goals, slept well
- **Consistency:** 12-day streak, 7/7 water intake, 5/7 completed days
- **Routines:** 6/7 skin care days (both routines), 1 hair wash completed
- **Goals:** Has complete goal, 40% progress, 2 months into 6-month goal

### Calculation:

#### 1. Nutrition Score:
```
Meal Logging: (5/7) × 40 = 28.6
Calorie Accuracy: 90 × 0.25 = 22.5
Macro Balance: 85 × 0.25 = 21.25
Meal Variety: 8.5

Total Nutrition = 28.6 + 22.5 + 21.25 + 8.5 = 80.85 ≈ 81
```

#### 2. Activity Score:
```
Exercise: (4/7) × 100 × 0.40 = 22.86
Steps: (6/7) × 100 × 0.30 = 25.71
Consistency: (4/7) × 20 = 11.43
Sleep: 95 × 0.10 = 9.5

Total Activity = 22.86 + 25.71 + 11.43 + 9.5 = 69.5 ≈ 70
```

#### 3. Consistency Score:
```
Streak: (12/30) × 50 = 20
Water: 100 × 0.25 = 25
Completion: (5/7) × 25 = 17.86

Total Consistency = 20 + 25 + 17.86 = 62.86 ≈ 63
```

#### 4. Routines Score:
```
Skin Care: (6/7) × 100 × 0.50 = 42.86
Hair Care: (1/1) × 100 × 0.50 = 50

Total Routines = 42.86 + 50 = 92.86 ≈ 93
```

#### 5. Goals Score:
```
Completeness: (5/5) × 30 = 30
Weight Progress: 40 × 0.40 = 16
Time on Track: (60/180) × 30 = 10

Total Goals = 30 + 16 + 10 = 56
```

### Final Aura Score:
```
Aura Score = (81 × 0.30) + (70 × 0.25) + (63 × 0.20) + (93 × 0.15) + (56 × 0.10)
           = 24.3 + 17.5 + 12.6 + 13.95 + 5.6
           = 73.95
           ≈ 74
```

**Result:** This user has an Aura Score of **74/100** - a good score indicating solid wellness habits with room for improvement in activity and goal progress.

---

## Scoring Tiers

| Score | Tier | Badge | Meaning |
|-------|------|-------|---------|
| 90-100 | **Legendary** | 🏆 | Exceptional wellness habits |
| 80-89 | **Excellent** | ⭐ | Very consistent and balanced |
| 70-79 | **Great** | 💎 | Good habits, minor improvements needed |
| 60-69 | **Good** | ✨ | On the right track |
| 50-59 | **Fair** | 🌱 | Building habits, keep going |
| 40-49 | **Needs Work** | 🔥 | Time to step it up |
| 0-39 | **Getting Started** | 🌟 | Just beginning the journey |

---

## Data Recency & Decay

The system prioritizes **recent activity** using a 7-day window:

- **Last 7 days:** Full weight in calculations
- **Older data:** Not currently used (may implement decay in future)

This ensures:
- Users see immediate impact of their actions
- Scores reflect current habits, not past glory
- Motivation to maintain daily consistency

---

## Handling Missing Data

The scoring system is **graceful with missing data**:

1. **No penalty for empty fields** - Users only scored on what they track
2. **Partial scoring** - Having a profile but no tracking gives small credit
3. **Zero state handling** - Division by zero is prevented
4. **Proportional scoring** - If you track 3 days, you're scored on those 3 days

**Example:** User logs meals but not exercise
- Nutrition: Scored normally
- Activity: 0 points (not penalized for other dimensions)
- Consistency: Scored on streak and water only
- Final score reflects what they DO track

---

## API Usage

### Calculate Aura Score
```typescript
POST /api/aura-score

Response:
{
  "success": true,
  "auraScore": 74,
  "breakdown": {
    "nutrition": 81,
    "activity": 70,
    "consistency": 63,
    "routines": 93,
    "goals": 56
  },
  "weights": {
    "nutrition": 0.30,
    "activity": 0.25,
    "consistency": 0.20,
    "routines": 0.15,
    "goals": 0.10
  },
  "updatedAt": "2025-10-16T10:30:00.000Z"
}
```

### Get Score History
```typescript
GET /api/aura-score?limit=30

Response:
{
  "success": true,
  "currentScore": 74,
  "lastUpdated": "2025-10-16T10:30:00.000Z",
  "history": [
    {
      "score": 74,
      "date": "2025-10-16T10:30:00.000Z",
      "breakdown": {...}
    },
    ...
  ]
}
```

---

## Implementation Notes

### Database Schema
```typescript
auraScore: Number (0-100)
auraScoreHistory: Array<{
  score: Number,
  date: Date,
  breakdown: {
    nutrition: Number,
    activity: Number,
    consistency: Number,
    routines: Number,
    goals: Number
  }
}>
lastAuraUpdate: Date
```

### Calculation Function
```typescript
calculateAuraScore(userId: string): Promise<{
  success: boolean;
  auraScore: number;
  breakdown: {...};
  weights: {...};
}>
```

---

## Future Enhancements

Potential improvements to the Aura Score system:

1. **Personalized Weights** - Let users adjust dimension importance
2. **Historical Trends** - Show score changes over time with charts
3. **Achievements System** - Unlock badges for score milestones
4. **Social Comparison** - Anonymous percentile ranking
5. **AI Recommendations** - Suggest which dimension to focus on
6. **Decay Factor** - Gradually reduce weight of older data
7. **Bonus Multipliers** - Extra points for exceptional streaks
8. **Weekly Challenges** - Temporary score boosts for hitting targets

---

## Technical Details

### Performance
- **Calculation Time:** ~50-200ms depending on data volume
- **Database Queries:** Single user fetch with all needed data
- **Caching Strategy:** Results stored in user document
- **Update Frequency:** On-demand or via scheduled job

### Error Handling
- Graceful degradation if data is missing
- Returns 0 scores for failed calculations
- Logs errors without exposing to user
- Maintains partial scores if some dimensions fail

---

## Conclusion

The Aura Score provides users with a **holistic view of their wellness journey**. By combining multiple dimensions with intelligent weighting, it encourages balanced habits while rewarding consistency and progress.

The system is:
- ✅ **Explainable** - Users understand why they got their score
- ✅ **Fair** - No penalties for missing data
- ✅ **Motivating** - Immediate feedback on daily actions
- ✅ **Actionable** - Breakdown shows where to improve
- ✅ **Dynamic** - Updates as users track new data

**Start tracking your Aura Score today and see your wellness journey quantified!** ✨
