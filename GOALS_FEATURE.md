# Goals & Nutrition Targets Feature

## Overview
A comprehensive goal-setting system that calculates personalized daily nutrition targets based on user's health objectives. Uses scientifically-backed formulas (Mifflin-St Jeor equation) to determine optimal calorie and macronutrient intake.

## Features

### 🎯 Goal Types
1. **Weight Loss** 📉
   - Caloric deficit for sustainable fat loss
   - High protein to preserve muscle mass
   - Moderate carbs and fats

2. **Weight Gain** 📈
   - Caloric surplus for healthy weight gain
   - Balanced macronutrient distribution
   - Adequate protein for muscle support

3. **Muscle Gain** 💪
   - Optimized for muscle building
   - Very high protein intake (2.2g per kg)
   - Higher calories with balanced macros

4. **Maintenance** ⚖️
   - Maintain current weight
   - Balanced nutrition
   - Lifestyle sustainability

### 📊 Calculations

#### 1. **Basal Metabolic Rate (BMR)**
Uses the Mifflin-St Jeor Equation:

**For Males:**
```
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
```

**For Females:**
```
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
```

#### 2. **Total Daily Energy Expenditure (TDEE)**
```
TDEE = BMR × Activity Multiplier
```

Activity Multipliers:
- **Sedentary**: 1.2 (little or no exercise)
- **Lightly Active**: 1.375 (1-3 days/week)
- **Moderately Active**: 1.55 (3-5 days/week)
- **Very Active**: 1.725 (6-7 days/week)
- **Extremely Active**: 1.9 (physical job + training)

#### 3. **Target Calories**
```
Target Calories = TDEE + Daily Calorie Adjustment
Daily Calorie Adjustment = (Weight Change × 7700) / (Duration × 7)
```

**Safety Limits:**
- **Minimum Calories**: 1500 cal (male), 1200 cal (female)
- **Maximum Deficit**: 25% of TDEE
- **Maximum Surplus**: 15% of TDEE

#### 4. **Macronutrient Distribution**

**Weight Loss:**
- Protein: 2.0g per kg body weight
- Fat: 0.8g per kg body weight
- Carbs: Remainder of calories

**Weight Gain:**
- Protein: 1.8g per kg body weight
- Fat: 1.0g per kg body weight
- Carbs: Remainder of calories

**Muscle Gain:**
- Protein: 2.2g per kg body weight
- Fat: 1.0g per kg body weight
- Carbs: Remainder of calories

**Maintenance:**
- Protein: 1.6g per kg body weight
- Fat: 0.9g per kg body weight
- Carbs: Remainder of calories

#### 5. **Additional Targets**
- **Fiber**: 25g base + 10g if calories > 2000
- **Water**: 33ml per kg body weight

### 🎨 UI Components

#### Goal Setting Modal
- **Goal Type Selection**: 4 options with icons
- **Current Weight Input**: Numeric input (kg)
- **Target Weight Input**: Numeric input (kg)
- **Duration Input**: Number of weeks
- **Weekly Change Calculator**: Real-time calculation

#### Goal Display Card
- **Progress Bar**: Visual progress tracking
- **Stats Grid**: Start, Current, Target weights
- **Time Remaining**: Weeks left to goal
- **Color-coded**: Based on goal type

#### Daily Targets Dashboard
Six metric cards displaying:
1. 🔥 **Calories** (Orange) - Total daily target
2. 💪 **Protein** (Purple) - Grams per day
3. 🍞 **Carbs** (Blue) - Grams per day
4. 🥑 **Fat** (Green) - Grams per day
5. 🌾 **Fiber** (Pink) - Grams per day
6. 💧 **Water** (Cyan) - Liters per day

### 📈 Progress Tracking

**Progress Calculation:**
```typescript
progress = ((current_weight - start_weight) / (target_weight - start_weight)) × 100
```

**Weeks Remaining:**
```typescript
weeks_elapsed = (today - start_date) / 7
weeks_remaining = total_duration - weeks_elapsed
```

## API Endpoints

### POST `/api/profile/goal`
Save or update user's goal.

**Request Body:**
```json
{
  "type": "weight-loss",
  "currentWeight": 75,
  "targetWeight": 68,
  "duration": 12,
  "startDate": "2025-10-14T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goal saved successfully",
  "goal": {
    "type": "weight-loss",
    "currentWeight": 75,
    "targetWeight": 68,
    "duration": 12,
    "startDate": "2025-10-14T00:00:00.000Z"
  }
}
```

### GET `/api/profile/goal`
Retrieve user's current goal.

**Response:**
```json
{
  "success": true,
  "goal": {
    "type": "muscle-gain",
    "currentWeight": 70,
    "targetWeight": 75,
    "duration": 16,
    "startDate": "2025-09-01T00:00:00.000Z"
  }
}
```

### DELETE `/api/profile/goal`
Delete user's goal.

**Response:**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

## Database Schema

```typescript
goal: {
  type: {
    type: String,
    enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance']
  },
  currentWeight: { type: Number },
  targetWeight: { type: Number },
  duration: { type: Number }, // in weeks
  startDate: { type: Date }
}
```

## Usage Examples

### Example 1: Weight Loss Goal
```
User: 75kg → 68kg in 12 weeks
Activity: Moderately Active
Gender: Male
Age: 28
Height: 175cm

Calculations:
- BMR = 1,715 cal
- TDEE = 2,658 cal (BMR × 1.55)
- Weekly Loss = 0.58kg
- Daily Deficit = 583 cal
- Target Calories = 2,075 cal/day

Macros:
- Protein: 150g (2.0 × 75kg)
- Fat: 60g (0.8 × 75kg)
- Carbs: 264g
- Fiber: 35g
- Water: 2.5L
```

### Example 2: Muscle Gain Goal
```
User: 70kg → 75kg in 16 weeks
Activity: Very Active
Gender: Male
Age: 25
Height: 180cm

Calculations:
- BMR = 1,730 cal
- TDEE = 2,985 cal (BMR × 1.725)
- Weekly Gain = 0.31kg
- Daily Surplus = 335 cal
- Target Calories = 3,320 cal/day

Macros:
- Protein: 154g (2.2 × 70kg)
- Fat: 70g (1.0 × 70kg)
- Carbs: 557g
- Fiber: 35g
- Water: 2.3L
```

## Integration with Other Features

### Meal Tracking Integration
- Compare daily intake vs. targets
- Show percentage of goal achieved
- Color-coded progress indicators

### Analytics Integration
- Track goal progress over time
- Visualize adherence to targets
- Show trends and patterns

### AI Coach Integration
- Personalized recommendations based on goals
- Adjust suggestions for goal achievement
- Provide motivation and tips

## Safety Features

### Healthy Weight Loss Rate
- Maximum: 1kg per week
- Recommended: 0.5-0.75kg per week
- Prevents excessive deficits

### Healthy Weight Gain Rate
- Maximum: 0.5kg per week
- Recommended: 0.25-0.4kg per week
- Prevents excessive fat gain

### Minimum Calorie Thresholds
- Male: 1500 calories minimum
- Female: 1200 calories minimum
- Prevents metabolic adaptation

### Maximum Deficit/Surplus
- Deficit: Max 25% of TDEE
- Surplus: Max 15% of TDEE
- Sustainable approach

## UI/UX Features

### Visual Design
- Glassmorphism effects
- Color-coded goal types
- Smooth animations with Framer Motion
- Responsive grid layouts

### Interactive Elements
- Modal for goal setting
- Progress bars with animations
- Hover effects on all cards
- Real-time calculations

### User Guidance
- Tooltips and tips
- Weekly change preview
- Recommended duration ranges
- Safety warnings for extreme goals

## Best Practices

### For Users
1. **Realistic Goals**: Set achievable targets
2. **Adequate Duration**: Allow sufficient time
3. **Track Progress**: Update weight regularly
4. **Stay Consistent**: Follow daily targets
5. **Adjust as Needed**: Modify if not progressing

### For Developers
1. **Validate Input**: Check for reasonable values
2. **Safety Checks**: Implement all limits
3. **Clear Feedback**: Show calculation details
4. **Error Handling**: Graceful degradation
5. **Data Persistence**: Save progress regularly

## Future Enhancements

1. **Goal History**: Track past goals and results
2. **Milestone Celebrations**: Achievements and badges
3. **Weekly Check-ins**: Prompt for weight updates
4. **Goal Adjustments**: Auto-adjust based on progress
5. **Community Goals**: Share and compare with others
6. **Photo Progress**: Before/after comparisons
7. **Body Measurements**: Track beyond just weight
8. **Goal Templates**: Pre-set popular goals
9. **Nutrition Plans**: Sample meal plans for goals
10. **Coaching Tips**: Personalized advice per goal

## Scientific References

1. Mifflin-St Jeor Equation (1990) - Most accurate BMR formula
2. TDEE Multipliers - Standard activity factors
3. 7700 calories = 1kg body weight change
4. Protein requirements: International Society of Sports Nutrition
5. Healthy weight loss/gain rates: WHO guidelines
