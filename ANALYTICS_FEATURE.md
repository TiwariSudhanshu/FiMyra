# Nutrition Analytics Dashboard

## Overview
A comprehensive analytics dashboard that visualizes nutritional data from meal tracking. Provides insights through multiple chart types including line charts, bar charts, and pie charts with daily, weekly, and monthly views.

## Features

### 📊 Time Range Views
- **Daily View**: Last 7 days of meal data
- **Weekly View**: Last 4 weeks (averaged per day)
- **Monthly View**: Last 6 months (averaged per day)

### 📈 Visualizations

#### 1. **Today's Stats Cards**
Real-time display of current day's nutrition:
- 🔥 **Calories** - Total caloric intake
- 💪 **Protein** - Protein consumption in grams
- 🍞 **Carbs** - Carbohydrate intake in grams
- 🥑 **Fat** - Fat consumption in grams
- 🌾 **Fiber** - Fiber intake in grams

Each card features:
- Gradient background with hover effects
- Real-time values
- Smooth animations

#### 2. **Calorie Trend (Line Chart)**
- Visualizes calorie intake over selected time period
- Smooth line with data points
- Interactive tooltips showing exact values
- Color: Orange gradient

#### 3. **Today's Macros (Pie Chart)**
- Shows distribution of macronutrients for current day
- Interactive segments with labels
- Color-coded:
  - Protein: Purple
  - Carbs: Blue
  - Fat: Green
  - Fiber: Pink

#### 4. **Protein Intake (Bar Chart)**
- Dedicated chart for protein tracking
- Rounded bars with gradient
- Helps monitor protein goals

#### 5. **Nutrient Comparison (Stacked Bar Chart)**
- Compares all nutrients side-by-side
- Stacked bars for easy comparison
- Legend for quick reference
- All nutrients color-coded

### 🎨 Design Features

#### Visual Elements
- Glassmorphism effects with backdrop blur
- Gradient borders and backgrounds
- Smooth hover animations
- Responsive grid layout
- Dark theme optimized

#### Interactive Elements
- Time range selector (Daily/Weekly/Monthly)
- Hover effects on all cards
- Custom tooltips on charts
- Animated transitions

### 📊 Data Processing

#### Daily View Calculation
```typescript
// Last 7 days
sortedMeals.slice(0, 7).reverse().map(day => {
  const totals = calculateDayTotals(day);
  return { date, ...totals };
});
```

#### Weekly View Calculation
```typescript
// Last 4 weeks, averaged per day
weekTotals = {
  calories: total / 7,
  protein: total / 7,
  // ... other nutrients
};
```

#### Monthly View Calculation
```typescript
// Last 6 months, averaged per day in month
monthTotals = {
  calories: total / daysInMonth,
  protein: total / daysInMonth,
  // ... other nutrients
};
```

### 🔢 Metrics Calculated

For each time period, the following metrics are calculated:

1. **Total Calories**: Sum of all meal calories
2. **Total Protein**: Sum of all protein (in grams)
3. **Total Carbs**: Sum of all carbohydrates (in grams)
4. **Total Fat**: Sum of all fats (in grams)
5. **Total Fiber**: Sum of all fiber (in grams)

All values are:
- Rounded to nearest integer for display
- Scaled based on quantity consumed
- Aggregated across all meal types (breakfast, lunch, dinner, snacks)

## Technical Implementation

### Dependencies
```json
{
  "recharts": "^2.x" // For charts and visualizations
  "framer-motion": "^12.x" // For animations
}
```

### Component Structure
```tsx
AnalyticsOverview
├── Time Range Selector
├── Today's Stats Cards (5)
├── Charts Grid
│   ├── Calorie Trend (Line Chart)
│   ├── Today's Macros (Pie Chart)
│   ├── Protein Intake (Bar Chart)
│   └── Nutrient Comparison (Bar Chart)
```

### State Management
```typescript
- timeRange: 'daily' | 'weekly' | 'monthly'
- meals: MealDay[] // Fetched from API
- loading: boolean
```

### Custom Components

#### CustomTooltip
```typescript
// Dark themed tooltip for chart hover
- Shows date/period
- Lists all nutrients with values
- Color-coded by nutrient type
```

### Color Scheme
```typescript
const COLORS = {
  calories: '#f59e0b', // Orange
  protein: '#8b5cf6', // Purple
  carbs: '#3b82f6',   // Blue
  fat: '#10b981',     // Green
  fiber: '#ec4899'    // Pink
};
```

## API Integration

### Endpoint Used
```typescript
GET /api/profile/meals

Response:
{
  success: true,
  meals: [
    {
      date: "2025-10-14",
      breakfast: [{ name, quantity, calories, protein, carbs, fat, fiber }],
      lunch: [...],
      dinner: [...],
      snacks: [...]
    }
  ]
}
```

### Data Flow
1. Component mounts → Fetch meals from API
2. Process meals based on selected time range
3. Calculate aggregated totals
4. Render visualizations
5. Update on time range change

## Usage Examples

### Daily View
Shows last 7 days:
- Oct 8: 2,100 cal
- Oct 9: 1,950 cal
- Oct 10: 2,250 cal
- Oct 11: 2,000 cal
- Oct 12: 2,180 cal
- Oct 13: 2,050 cal
- Oct 14: 1,900 cal

### Weekly View
Shows last 4 weeks (daily average):
- Week 1: 2,050 cal/day
- Week 2: 2,150 cal/day
- Week 3: 1,980 cal/day
- Week 4: 2,100 cal/day

### Monthly View
Shows last 6 months (daily average):
- May: 2,050 cal/day
- Jun: 2,100 cal/day
- Jul: 1,950 cal/day
- Aug: 2,200 cal/day
- Sep: 2,080 cal/day
- Oct: 2,100 cal/day

## Responsive Design

### Desktop (lg+)
- Spans 2 columns in grid
- 2-column chart layout
- 5-column stats cards

### Tablet (md)
- 2-column chart layout
- 5-column stats cards

### Mobile
- Single column charts
- 2-column stats cards
- Stacked layout

## Performance Optimizations

1. **useMemo** for data calculations
   - Recalculates only when meals or timeRange changes
   - Prevents unnecessary re-renders

2. **Lazy Loading**
   - Charts render only when data is available
   - Loading state shown during fetch

3. **Data Aggregation**
   - Pre-calculates totals
   - Cached in useMemo

## Future Enhancements

### Analytics Features
1. **Goal Tracking**: Set daily calorie/macro goals with progress bars
2. **Trends Analysis**: Show percentage changes week-over-week
3. **Meal Timing**: Visualize when meals are consumed
4. **Nutrient Ratios**: Show macro percentage distribution
5. **Recommendations**: AI-powered suggestions based on trends

### Visualization Enhancements
1. **Area Charts**: For cumulative tracking
2. **Radar Charts**: For balanced nutrition view
3. **Heatmaps**: For meal frequency patterns
4. **Comparison Mode**: Compare different time periods
5. **Export Charts**: Download as images or PDF

### Data Features
1. **Custom Date Ranges**: Select specific date ranges
2. **Meal Type Breakdown**: Filter by breakfast/lunch/dinner
3. **Food Categories**: Group by food types
4. **Annotations**: Add notes to specific days
5. **Streaks**: Track consecutive days of goal achievement

## Troubleshooting

### No Data Displayed
- Check if meals have been tracked
- Verify API connection
- Ensure dates are within selected range

### Charts Not Rendering
- Check browser console for errors
- Verify recharts installation
- Ensure responsive container has height

### Incorrect Calculations
- Verify meal data has nutrient values
- Check quantity scaling logic
- Ensure date filtering is correct
