# Skin Care & Hair Care API Documentation

Complete documentation for all Skin Care and Hair Care features including profile management, AI suggestions, and daily tracking.

---

## 🧴 **Skin Care APIs**

### 1. **Skin Care Profile Management**

#### **GET** `/api/profile/skincare`
Fetch the user's skin care profile and basic health info.

**Response:**
```json
{
  "success": true,
  "skinCareProfile": {
    "skinType": "oily",
    "concerns": ["acne", "dark spots"],
    "routine": {
      "morning": ["cleanser", "vitamin C serum", "moisturizer", "sunscreen"],
      "evening": ["cleanser", "toner", "retinol", "night cream"],
      "products": ["CeraVe Cleanser", "The Ordinary Vitamin C"]
    },
    "goals": ["clear skin", "reduce acne"],
    "notes": "Sensitive to fragrance",
    "updatedAt": "2025-10-16T00:00:00.000Z"
  },
  "age": 28
}
```

---

#### **POST** `/api/profile/skincare`
Save or update the user's skin care profile.

**Request Body:**
```json
{
  "skinType": "oily",
  "concerns": ["acne", "dark spots"],
  "routine": {
    "morning": ["cleanser", "vitamin C serum", "moisturizer", "sunscreen"],
    "evening": ["cleanser", "toner", "retinol", "night cream"],
    "products": ["CeraVe Cleanser", "The Ordinary Vitamin C"]
  },
  "goals": ["clear skin", "reduce acne"],
  "notes": "Sensitive to fragrance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skin care profile saved successfully",
  "skinCareProfile": { /* same as request body with updatedAt */ }
}
```

---

### 2. **AI Skin Care Suggestions**

#### **POST** `/api/ai/skincare-suggestions`
Get personalized AI-powered skin care recommendations based on user profile.

**Requirements:** User must have at least `skinType` set in their profile.

**Response:**
```json
{
  "success": true,
  "suggestions": {
    "morningRoutine": [
      "Cleanse your face with a gentle, pH-balanced cleanser",
      "Apply a vitamin C serum to brighten and protect",
      "Moisturize with a lightweight, non-comedogenic moisturizer",
      "Finish with broad-spectrum SPF 30+ sunscreen"
    ],
    "eveningRoutine": [
      "Remove makeup and cleanse thoroughly",
      "Use a toner to balance skin pH",
      "Apply treatment serums (retinol, niacinamide, etc.)",
      "Finish with a richer night cream or moisturizer"
    ],
    "productRecommendations": [
      "Look for hyaluronic acid for hydration",
      "Use niacinamide to reduce inflammation and pores",
      "Consider retinol for anti-aging (start slow)",
      "Try ceramides to strengthen skin barrier"
    ],
    "lifestyleTips": [
      "Drink at least 8 glasses of water daily for skin hydration",
      "Get 7-8 hours of quality sleep for skin regeneration",
      "Eat antioxidant-rich foods like berries, nuts, and green tea"
    ],
    "avoidMistakes": [
      "Don't skip sunscreen - UV damage accelerates aging",
      "Avoid over-exfoliating - it can damage your skin barrier",
      "Don't use hot water - it strips natural oils from skin"
    ]
  },
  "profile": {
    "skinType": "oily",
    "concerns": ["acne", "dark spots"],
    "age": 28
  }
}
```

---

### 3. **Skin Care Daily Tracking**

#### **GET** `/api/tracking/skincare?days=30`
Fetch skin care routine tracking history.

**Query Parameters:**
- `days` (optional): Number of days to fetch (default: 30)

**Response:**
```json
{
  "success": true,
  "tracking": [
    {
      "date": "2025-10-16T00:00:00.000Z",
      "morningRoutineCompleted": true,
      "eveningRoutineCompleted": false,
      "notes": "Forgot evening routine"
    }
  ],
  "todayStatus": {
    "date": "2025-10-16T00:00:00.000Z",
    "morningRoutineCompleted": true,
    "eveningRoutineCompleted": false
  },
  "stats": {
    "totalDays": 15,
    "morningCompleted": 14,
    "eveningCompleted": 12,
    "bothCompleted": 11
  }
}
```

---

#### **POST** `/api/tracking/skincare`
Update or create today's skin care routine tracking.

**Request Body:**
```json
{
  "morningRoutineCompleted": true,
  "eveningRoutineCompleted": false,
  "notes": "Skipped evening routine - too tired"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skin care routine updated successfully",
  "tracking": {
    "date": "2025-10-16T00:00:00.000Z",
    "morningRoutineCompleted": true,
    "eveningRoutineCompleted": false,
    "notes": "Skipped evening routine - too tired"
  }
}
```

---

#### **DELETE** `/api/tracking/skincare`
Clear all skin care tracking history.

**Response:**
```json
{
  "success": true,
  "message": "Tracking history cleared successfully"
}
```

---

## 💇 **Hair Care APIs**

### 1. **Hair Care Profile Management**

#### **GET** `/api/profile/haircare`
Fetch the user's hair care profile with wash reminder status.

**Response:**
```json
{
  "success": true,
  "hairCareProfile": {
    "hairType": "curly",
    "concerns": ["frizz", "dryness"],
    "routine": {
      "shampoo": "Sulfate-free moisturizing shampoo",
      "conditioner": "Deep conditioning treatment",
      "treatments": ["hair mask", "leave-in conditioner"],
      "frequency": "twice-a-week"
    },
    "goals": ["reduce frizz", "add moisture"],
    "notes": "Use cold water for final rinse",
    "updatedAt": "2025-10-16T00:00:00.000Z"
  },
  "age": 28,
  "nextWashDate": "2025-10-18T00:00:00.000Z",
  "isWashDueToday": false,
  "isWashOverdue": false
}
```

---

#### **POST** `/api/profile/haircare`
Save or update the user's hair care profile. Automatically calculates next wash date based on frequency.

**Request Body:**
```json
{
  "hairType": "curly",
  "concerns": ["frizz", "dryness"],
  "routine": {
    "shampoo": "Sulfate-free moisturizing shampoo",
    "conditioner": "Deep conditioning treatment",
    "treatments": ["hair mask", "leave-in conditioner"],
    "frequency": "twice-a-week"
  },
  "goals": ["reduce frizz", "add moisture"],
  "notes": "Use cold water for final rinse"
}
```

**Supported Frequencies:**
- `daily`
- `every-other-day` / `alternate days`
- `twice-a-week` / `twice a week`
- `weekly` / `once-a-week` / `once a week`
- `twice-a-month` / `twice a month`
- `monthly` / `once-a-month`

**Response:**
```json
{
  "success": true,
  "message": "Hair care profile saved successfully",
  "hairCareProfile": { /* same as request body */ },
  "nextWashDate": "2025-10-18T00:00:00.000Z"
}
```

---

### 2. **AI Hair Care Suggestions**

#### **POST** `/api/ai/haircare-suggestions`
Get personalized AI-powered hair care recommendations.

**Requirements:** User must have at least `hairType` set in their profile.

**Response:**
```json
{
  "success": true,
  "suggestions": {
    "dailyCare": [
      "Use a sulfate-free shampoo to maintain your hair's natural oils",
      "Apply conditioner from mid-length to ends, avoiding the scalp",
      "Gently detangle hair when wet using a wide-tooth comb"
    ],
    "weeklyTreatments": [
      "Apply a deep conditioning mask once a week for 20-30 minutes",
      "Use a scalp massage with oil to improve blood circulation",
      "Try a protein treatment if you have damaged or processed hair"
    ],
    "productRecommendations": [
      "Look for products with argan oil or coconut oil for moisture",
      "Use a heat protectant spray before styling with heat tools",
      "Consider a leave-in conditioner for extra protection",
      "Try silk or satin pillowcases to reduce friction"
    ],
    "lifestyleTips": [
      "Stay hydrated by drinking at least 8 glasses of water daily",
      "Eat protein-rich foods like eggs, fish, and nuts for hair strength",
      "Take biotin or vitamin E supplements after consulting your doctor"
    ],
    "avoidMistakes": [
      "Avoid washing hair with very hot water - use lukewarm instead",
      "Don't rub hair vigorously with a towel - pat dry gently",
      "Minimize heat styling and always use a heat protectant when you do"
    ]
  },
  "profile": {
    "hairType": "curly",
    "concerns": ["frizz", "dryness"],
    "age": 28
  }
}
```

---

### 3. **Hair Care Wash Tracking & Reminders**

#### **GET** `/api/tracking/haircare?days=30`
Fetch hair care wash tracking history and reminder status.

**Query Parameters:**
- `days` (optional): Number of days to fetch (default: 30)

**Response:**
```json
{
  "success": true,
  "tracking": [
    {
      "date": "2025-10-14T00:00:00.000Z",
      "washScheduled": true,
      "washCompleted": true,
      "skipped": false,
      "notes": "Used new shampoo"
    },
    {
      "date": "2025-10-17T00:00:00.000Z",
      "washScheduled": true,
      "washCompleted": false,
      "skipped": true,
      "notes": "Too busy"
    }
  ],
  "todayStatus": null,
  "nextWashDate": "2025-10-18T00:00:00.000Z",
  "isWashDueToday": false,
  "isWashOverdue": false,
  "frequency": "twice-a-week",
  "stats": {
    "totalWashes": 10,
    "totalSkipped": 2,
    "totalScheduled": 12,
    "completionRate": 83
  }
}
```

---

#### **POST** `/api/tracking/haircare`
Update hair care wash tracking (schedule, complete, or skip a wash).

**Request Body:**
```json
{
  "action": "complete",  // Options: "schedule", "complete", "skip"
  "notes": "Used deep conditioning mask",
  "date": "2025-10-16T00:00:00.000Z"  // Optional, defaults to today
}
```

**Actions:**
- `schedule`: Schedule a wash for the specified date
- `complete`: Mark wash as completed (auto-schedules next wash based on frequency)
- `skip`: Skip the scheduled wash (recalculates next wash date)

**Response:**
```json
{
  "success": true,
  "message": "Hair wash completed successfully",
  "tracking": {
    "date": "2025-10-16T00:00:00.000Z",
    "washScheduled": true,
    "washCompleted": true,
    "skipped": false,
    "notes": "Used deep conditioning mask"
  },
  "nextWashDate": "2025-10-19T00:00:00.000Z"
}
```

---

#### **PUT** `/api/tracking/haircare`
Update wash frequency and recalculate next wash date.

**Request Body:**
```json
{
  "frequency": "twice-a-week"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wash frequency updated successfully",
  "frequency": "twice-a-week",
  "nextWashDate": "2025-10-19T00:00:00.000Z"
}
```

---

#### **DELETE** `/api/tracking/haircare`
Clear all hair care tracking history and next wash date.

**Response:**
```json
{
  "success": true,
  "message": "Tracking history cleared successfully"
}
```

---

## 🔐 **Authentication**

All endpoints require authentication. The API supports:
- **NextAuth session tokens** (cookies: `next-auth.session-token` or `__Secure-next-auth.session-token`)
- **JWT tokens** (cookie: `auth-token`)

Unauthorized requests will receive:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 📊 **Database Schema Updates**

The user model has been extended with the following fields:

```typescript
// Skin Care Daily Tracking
skinCareTracking?: Array<{
  date: Date;
  morningRoutineCompleted: boolean;
  eveningRoutineCompleted: boolean;
  notes?: string;
}>;

// Hair Care Tracking (wash reminders and completion)
hairCareTracking?: Array<{
  date: Date;
  washScheduled: boolean;
  washCompleted: boolean;
  skipped: boolean;
  notes?: string;
}>;

// Next scheduled hair wash date
nextHairWashDate?: Date;
```

---

## 🎯 **Usage Flow Examples**

### **Skin Care Flow:**

1. **Save Profile**: `POST /api/profile/skincare`
2. **Get AI Suggestions**: `POST /api/ai/skincare-suggestions`
3. **Track Daily Routine**: `POST /api/tracking/skincare`
4. **View Progress**: `GET /api/tracking/skincare?days=7`

### **Hair Care Flow:**

1. **Save Profile with Frequency**: `POST /api/profile/haircare`
2. **Get AI Suggestions**: `POST /api/ai/haircare-suggestions`
3. **Check Reminder**: `GET /api/profile/haircare` (shows if wash is due today)
4. **Complete Wash**: `POST /api/tracking/haircare` with `action: "complete"`
5. **View History**: `GET /api/tracking/haircare?days=30`

---

## ⚙️ **Environment Variables**

Ensure these are set in your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret
```

---

## 🎨 **UI Integration Notes**

### **Skin Care Section:**
- Show morning/evening checkboxes for daily check-ins
- Display completion stats and streak tracking
- Show AI suggestions in an expandable card

### **Hair Care Section:**
- Display "Next Wash Date" prominently
- Show "Wash Due Today" badge when `isWashDueToday` is true
- Show "Overdue" warning when `isWashOverdue` is true
- Provide "Done" and "Skip" buttons for wash reminders
- Display wash completion rate as a percentage

---

## 🚀 **Features Summary**

✅ **CRUD operations** for skin care and hair care profiles  
✅ **AI-powered personalized suggestions** using Gemini API  
✅ **Daily tracking** for skin care routines  
✅ **Smart wash reminders** for hair care with auto-scheduling  
✅ **Complete tracking history** with statistics  
✅ **Flexible frequency system** for hair wash scheduling  
✅ **Auto-calculation** of next wash dates  
✅ **Notes support** for all tracking entries  

---

This completes the comprehensive backend logic for Skin Care and Hair Care sections! 🎉
