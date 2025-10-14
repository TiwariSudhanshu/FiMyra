# Meal Tracking with AI-Powered Nutrient Data

## Overview
This feature automatically fetches nutritional information for meals using the Gemini AI model. When users add meals, the system:
1. Checks if the meal already exists in the database (recentMeals or historical meals)
2. If the meal is new OR missing nutrient data, calls Gemini AI to fetch nutritional values
3. **Allows users to specify quantity and unit** (e.g., 2 servings, 1 cup, 3 pieces)
4. **Automatically scales nutrient values** based on the specified quantity
5. Saves the meal with nutrient data to the database
6. Adds the base meal (1 serving) to recentMeals for quick future access
7. Displays the nutrient information in the UI with quantity indicators

## Implementation Details

### 1. Database Schema Updates (`src/models/user.model.ts`)

**Updated meal structure to include nutrient data and quantity:**
```typescript
type MealItem = {
  name: string;
  quantity?: number;   // e.g., 1, 2, 0.5
  unit?: string;       // e.g., 'serving', 'cup', 'piece', 'bowl'
  carbs?: number;      // grams (scaled by quantity)
  protein?: number;    // grams (scaled by quantity)
  fat?: number;        // grams (scaled by quantity)
  fiber?: number;      // grams (scaled by quantity)
  calories?: number;   // kcal (scaled by quantity)
}
```

**Added recentMeals field:**
- Stores up to 50 most recently used meals with their nutrient data
- Provides quick access for autocomplete and reusing meals
- Prevents redundant API calls to Gemini

### 2. Nutrient Data Utility (`src/utils/getNutrientData.ts`)

**Function: `getNutrientData(mealName: string)`**
- Calls Gemini AI with a structured prompt
- Requests JSON format: `{ carbs, protein, fat, fiber, calories }`
- Handles response cleaning (removes markdown code blocks)
- Validates the response structure
- Returns `null` on error (graceful degradation)

**Error Handling:**
- Missing API key → Returns null
- Invalid JSON → Returns null
- Network errors → Logs error and returns null

### 3. API Route Updates (`src/app/api/profile/meals/route.ts`)

**Key Functions:**

**`findExistingMeal(user, mealName)`**
- Searches recentMeals first (O(n) where n ≤ 50)
- Falls back to searching all historical meals
- Case-insensitive matching
- Returns meal with nutrient data if found

**`updateRecentMeals(user, mealItem)`**
- Maintains a FIFO queue of 50 meals
- Removes duplicates (case-insensitive)
- Adds new meal to the front
- Automatically trims to 50 items

**`POST` endpoint workflow:**
```
For each meal item:
  1. Check if exists with nutrient data
     ├─ Yes → Reuse existing data
     └─ No  → Fetch from Gemini AI
  
  2. Create MealItem object with nutrients
  
  3. Update recentMeals cache
  
  4. Add to today's meal log

5. Save user document (atomic operation)
```

### 4. Frontend Updates (`src/app/components/dashboard/MealTracking.tsx`)

**Updated to display nutrient information:**
- Shows calories, protein, carbs, and fat for each meal item
- Uses emoji icons for visual appeal:
  - 🔥 Calories
  - 💪 Protein
  - 🍞 Carbs
  - 🥑 Fat
- Only displays nutrients if data is available

**Type updates:**
```typescript
type MealItem = {
  name: string;
  carbs?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  calories?: number;
};
```

## Usage Example

### Adding a new meal with quantity:
```typescript
// User adds "Grilled Chicken Salad" with quantity 2 servings
POST /api/profile/meals
{
  mealType: "lunch",
  items: [
    { name: "Grilled Chicken Salad", quantity: 2, unit: "serving" }
  ],
  date: "2025-10-13"
}

// System workflow:
// 1. Check existing meals → Not found
// 2. Call Gemini AI with prompt:
//    "Provide approximate nutritional values for 'Grilled Chicken Salad'..."
// 3. Gemini returns (per serving):
//    { carbs: 12, protein: 35, fat: 8, fiber: 4, calories: 260 }
// 4. Scale nutrients by quantity (×2):
//    { carbs: 24, protein: 70, fat: 16, fiber: 8, calories: 520 }
// 5. Save to database with scaled nutrient data
// 6. Add base meal (1 serving) to recentMeals
// 7. Return to UI for display
```

### Adding a repeated meal with different quantity:
```typescript
// User adds "Grilled Chicken Salad" again with 1.5 bowls
POST /api/profile/meals
{
  mealType: "dinner",
  items: [
    { name: "Grilled Chicken Salad", quantity: 1.5, unit: "bowl" }
  ],
  date: "2025-10-14"
}

// System workflow:
// 1. Check recentMeals → Found with nutrient data (per serving)
// 2. Reuse existing data (no API call)
// 3. Scale nutrients by quantity (×1.5):
//    { carbs: 18, protein: 52.5, fat: 12, fiber: 6, calories: 390 }
// 4. Save to database with scaled data
// 5. Update recentMeals position (move to front)
// 6. Return to UI for display
```

## Benefits

✅ **Performance**: Caches nutrient data to minimize API calls
✅ **User Experience**: Instant nutrient information display with quantity controls
✅ **Flexible Portioning**: Support for 10+ different units (serving, cup, bowl, piece, slice, etc.)
✅ **Smart Scaling**: Automatically scales nutrient values based on quantity
✅ **Data Consistency**: Reuses nutrient data for repeated meals
✅ **Scalability**: LRU cache (50 items) prevents unbounded growth
✅ **Fault Tolerance**: Graceful degradation if Gemini API fails
✅ **Atomic Operations**: Database saves are atomic (all or nothing)
✅ **Backward Compatible**: Accepts both string array and object array formats

## Configuration

**Environment Variables:**
- `GEMINI_API_KEY` - Required for nutrient data fetching
- `GEMINI_MODEL` - Optional (defaults to "gemini-2.5-flash")

## UI Features

### Quantity Input Controls
- **Number Input**: Allows decimal values (e.g., 0.5, 1, 2.5)
- **Unit Dropdown**: 10 common units
  - serving, cup, bowl, plate, piece, slice
  - tbsp, tsp, oz, g
- **Real-time Display**: Shows quantity badge on meal items
- **Scaled Nutrients**: Automatically displays scaled values

### Visual Indicators
- 🔥 Calories display with quantity scaling
- 💪 Protein content (scaled)
- 🍞 Carbs content (scaled)
- 🥑 Fat content (scaled)
- Badge showing "2 servings" or "1.5 cups"

## Future Enhancements

1. **Batch Processing**: Fetch nutrients for multiple meals in parallel
2. **User Corrections**: Allow users to edit nutrient values
3. **Meal Library**: Pre-populate with common meals
4. **Analytics**: Track most frequently eaten meals
5. **Daily Totals**: Calculate total daily intake (sum all scaled values)
6. **Goals Tracking**: Compare against daily nutrition goals
7. **Custom Units**: Allow users to define custom portion units
8. **Meal Templates**: Save combinations of meals as templates with quantities
