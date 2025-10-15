# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Next.js)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐      ┌────────────────────────┐   │
│  │   Skin Care Section    │      │   Hair Care Section    │   │
│  ├────────────────────────┤      ├────────────────────────┤   │
│  │ • Profile Form         │      │ • Profile Form         │   │
│  │ • AI Suggestions Card  │      │ • AI Suggestions Card  │   │
│  │ • Daily Check-In       │      │ • Wash Reminder        │   │
│  │ • Progress Stats       │      │ • Wash History         │   │
│  └────────────────────────┘      └────────────────────────┘   │
│             │                                │                  │
│             └────────────┬───────────────────┘                  │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           │ API Calls via careServices.ts
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Skin Care APIs                              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ GET  /api/profile/skincare          → Fetch profile      │  │
│  │ POST /api/profile/skincare          → Save profile       │  │
│  │ POST /api/ai/skincare-suggestions   → Get AI tips        │  │
│  │ GET  /api/tracking/skincare         → Get tracking       │  │
│  │ POST /api/tracking/skincare         → Update tracking    │  │
│  │ DELETE /api/tracking/skincare       → Clear history      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Hair Care APIs                              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ GET  /api/profile/haircare          → Fetch profile      │  │
│  │ POST /api/profile/haircare          → Save profile       │  │
│  │ POST /api/ai/haircare-suggestions   → Get AI tips        │  │
│  │ GET  /api/tracking/haircare         → Get tracking       │  │
│  │ POST /api/tracking/haircare         → Track wash         │  │
│  │ PUT  /api/tracking/haircare         → Update frequency   │  │
│  │ DELETE /api/tracking/haircare       → Clear history      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Authentication Middleware                     │  │
│  │  • NextAuth session tokens                               │  │
│  │  • JWT auth tokens                                       │  │
│  │  • User ID extraction                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────┬───────────────────────┬────────────────────────┘
                 │                       │
                 │                       │
         ┌───────▼────────┐      ┌──────▼───────┐
         │   MongoDB       │      │  Gemini AI   │
         │   Database      │      │   Service    │
         ├────────────────┤      ├──────────────┤
         │ • User Model   │      │ • Generate   │
         │ • Profiles     │      │   suggestions│
         │ • Tracking     │      │ • Personalize│
         │   Data         │      │   tips       │
         └────────────────┘      └──────────────┘
```

---

## Data Model Structure

```
User Document (MongoDB)
├── _id: ObjectId
├── name: String
├── email: String
├── authProvider: String
│
├── skinCareProfile: {
│   ├── skinType: String
│   ├── concerns: [String]
│   ├── routine: {
│   │   ├── morning: [String]
│   │   ├── evening: [String]
│   │   └── products: [String]
│   │   }
│   ├── goals: [String]
│   ├── notes: String
│   └── updatedAt: Date
│   }
│
├── skinCareTracking: [{
│   ├── date: Date
│   ├── morningRoutineCompleted: Boolean
│   ├── eveningRoutineCompleted: Boolean
│   └── notes: String
│   }]
│
├── hairCareProfile: {
│   ├── hairType: String
│   ├── concerns: [String]
│   ├── routine: {
│   │   ├── shampoo: String
│   │   ├── conditioner: String
│   │   ├── treatments: [String]
│   │   └── frequency: String
│   │   }
│   ├── goals: [String]
│   ├── notes: String
│   └── updatedAt: Date
│   }
│
├── hairCareTracking: [{
│   ├── date: Date
│   ├── washScheduled: Boolean
│   ├── washCompleted: Boolean
│   ├── skipped: Boolean
│   └── notes: String
│   }]
│
└── nextHairWashDate: Date
```

---

## Request/Response Flow

### Skin Care Daily Check-In Flow:

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ 1. User checks "Morning Routine Done"
       ▼
┌────────────────────────────────────────────┐
│  POST /api/tracking/skincare               │
│  Body: { morningRoutineCompleted: true }  │
└──────┬─────────────────────────────────────┘
       │ 2. Extract userId from auth token
       ▼
┌─────────────────────────────────────┐
│  Find User in MongoDB               │
│  Check if tracking exists for today │
└──────┬──────────────────────────────┘
       │ 3. Update or create tracking entry
       ▼
┌──────────────────────────────────────┐
│  Save tracking with date stamp       │
│  { date: today, morning: true }      │
└──────┬───────────────────────────────┘
       │ 4. Return success response
       ▼
┌────────────────────────────────────┐
│  Response: {                       │
│    success: true,                  │
│    tracking: { ... },              │
│    message: "Updated"              │
│  }                                 │
└──────┬─────────────────────────────┘
       │ 5. Update UI with confirmation
       ▼
┌─────────────┐
│  User sees  │
│  ✓ Updated  │
└─────────────┘
```

### Hair Care Wash Reminder Flow:

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ 1. User saves profile with frequency
       ▼
┌────────────────────────────────────────────┐
│  POST /api/profile/haircare                │
│  Body: { frequency: "twice-a-week" }      │
└──────┬─────────────────────────────────────┘
       │ 2. Calculate next wash date
       │    (today + frequency interval)
       ▼
┌─────────────────────────────────────┐
│  Save profile + nextWashDate        │
│  nextWashDate: 3 days from now      │
└──────┬──────────────────────────────┘
       │ 3. Return saved data
       ▼
┌──────────────────────────┐
│  User sees reminder:     │
│  "Next wash: Oct 19"     │
└──────┬───────────────────┘
       │ 4. On wash day, user clicks "Done"
       ▼
┌────────────────────────────────────────┐
│  POST /api/tracking/haircare           │
│  Body: { action: "complete" }         │
└──────┬─────────────────────────────────┘
       │ 5. Mark wash as completed
       │    Recalculate next wash date
       ▼
┌──────────────────────────────────────┐
│  Update: washCompleted = true        │
│  New nextWashDate: Oct 22            │
└──────┬───────────────────────────────┘
       │ 6. Auto-schedule next wash
       ▼
┌────────────────────────────────┐
│  Create tracking entry for     │
│  Oct 22 with scheduled = true  │
└──────┬─────────────────────────┘
       │ 7. Return updated dates
       ▼
┌──────────────────────────┐
│  User sees new reminder: │
│  "Next wash: Oct 22"     │
└──────────────────────────┘
```

---

## AI Suggestion Generation Flow

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ 1. User clicks "Get Suggestions"
       ▼
┌────────────────────────────────────┐
│  POST /api/ai/skincare-suggestions │
└──────┬─────────────────────────────┘
       │ 2. Fetch user profile from DB
       ▼
┌─────────────────────────────────────┐
│  User Profile:                      │
│  • skinType: "oily"                 │
│  • concerns: ["acne"]               │
│  • age: 28                          │
└──────┬──────────────────────────────┘
       │ 3. Build AI prompt
       ▼
┌────────────────────────────────────────────┐
│  Prompt: "You are a dermatologist.        │
│  User has oily skin with acne.            │
│  Provide morning routine, evening         │
│  routine, products, tips..."              │
└──────┬─────────────────────────────────────┘
       │ 4. Call Gemini AI API
       ▼
┌────────────────────────────────┐
│  Google Gemini AI              │
│  Model: gemini-2.0-flash-exp   │
└──────┬─────────────────────────┘
       │ 5. AI generates suggestions
       ▼
┌──────────────────────────────────────┐
│  AI Response (JSON):                 │
│  {                                   │
│    morningRoutine: [...],            │
│    eveningRoutine: [...],            │
│    productRecommendations: [...],    │
│    lifestyleTips: [...],             │
│    avoidMistakes: [...]              │
│  }                                   │
└──────┬───────────────────────────────┘
       │ 6. Parse and validate JSON
       ▼
┌────────────────────────────────┐
│  Return formatted suggestions  │
└──────┬─────────────────────────┘
       │ 7. Display in UI
       ▼
┌──────────────────────────────────┐
│  User sees personalized tips:   │
│  • Morning: Cleanser, Serum...  │
│  • Evening: Toner, Retinol...   │
│  • Products: Niacinamide...     │
└──────────────────────────────────┘
```

---

## File Structure

```
FiMyra/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── profile/
│   │   │   │   ├── skincare/route.ts      ← Profile CRUD
│   │   │   │   └── haircare/route.ts      ← Profile CRUD + wash date
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── skincare-suggestions/route.ts  ← AI tips
│   │   │   │   └── haircare-suggestions/route.ts  ← AI tips
│   │   │   │
│   │   │   └── tracking/
│   │   │       ├── skincare/route.ts      ← Daily tracking
│   │   │       └── haircare/route.ts      ← Wash tracking
│   │   │
│   │   └── components/
│   │       └── dashboard/
│   │           ├── SkinCare.tsx           ← UI component
│   │           └── HairCare.tsx           ← UI component
│   │
│   ├── models/
│   │   └── user.model.ts                  ← User schema with tracking
│   │
│   └── utils/
│       └── careServices.ts                ← Frontend API service
│
├── SKINCARE_HAIRCARE_API_DOCS.md         ← Complete API docs
├── IMPLEMENTATION_GUIDE.md                ← UI implementation guide
├── SKINCARE_HAIRCARE_SUMMARY.md          ← Overview
└── ARCHITECTURE.md                        ← This file
```

---

## Technology Stack

```
┌─────────────────────────────────────┐
│         Frontend Stack              │
├─────────────────────────────────────┤
│ • React 18                          │
│ • Next.js 14 (App Router)           │
│ • TypeScript                        │
│ • Tailwind CSS (for styling)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Backend Stack               │
├─────────────────────────────────────┤
│ • Next.js API Routes                │
│ • MongoDB (via Mongoose)            │
│ • NextAuth.js (authentication)      │
│ • JWT (JSON Web Tokens)             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         AI & External Services      │
├─────────────────────────────────────┤
│ • Google Gemini AI API              │
│ • Model: gemini-2.0-flash-exp       │
└─────────────────────────────────────┘
```

---

## Security & Authentication

```
┌──────────────────────────────────────────┐
│      Authentication Flow                 │
├──────────────────────────────────────────┤
│                                          │
│  1. User logs in                         │
│     ↓                                    │
│  2. NextAuth creates session token       │
│     OR JWT token is generated            │
│     ↓                                    │
│  3. Token stored in HTTP-only cookie     │
│     ↓                                    │
│  4. Every API request includes cookie    │
│     ↓                                    │
│  5. API route extracts & validates token │
│     ↓                                    │
│  6. If valid: extract userId             │
│     If invalid: return 401 Unauthorized  │
│     ↓                                    │
│  7. Query user data from MongoDB         │
│     ↓                                    │
│  8. Return data only for authenticated   │
│     user (data isolation)                │
│                                          │
└──────────────────────────────────────────┘

Security Features:
✓ HTTP-only cookies (XSS protection)
✓ User data isolation (no cross-user access)
✓ Token validation on every request
✓ Password hashing (for local auth)
✓ Environment variable secrets
```

---

## Scalability Considerations

### Current Architecture:
- ✅ Modular API design (easy to extend)
- ✅ Separate tracking collections (efficient queries)
- ✅ Indexed user IDs (fast lookups)
- ✅ Stateless API routes (horizontal scaling)

### Future Optimizations:
- Add Redis caching for frequently accessed profiles
- Implement pagination for tracking history
- Use MongoDB aggregation for complex statistics
- Add CDN for static assets
- Implement rate limiting for AI API calls

---

## Error Handling Strategy

```
┌─────────────────────────────────────┐
│      Error Handling Layers          │
├─────────────────────────────────────┤
│                                     │
│  Layer 1: Input Validation          │
│  • Required field checks            │
│  • Data type validation             │
│  • Return 400 Bad Request           │
│                                     │
│  Layer 2: Authentication            │
│  • Token validation                 │
│  • User existence check             │
│  • Return 401 Unauthorized          │
│                                     │
│  Layer 3: Database Operations       │
│  • Try-catch blocks                 │
│  • Connection error handling        │
│  • Return 500 Internal Error        │
│                                     │
│  Layer 4: External Services (AI)    │
│  • API call error handling          │
│  • Fallback suggestions             │
│  • Timeout handling                 │
│  • Return 500 or fallback data      │
│                                     │
│  Layer 5: Client-Side               │
│  • Check response.success           │
│  • Display user-friendly messages   │
│  • Log errors for debugging         │
│                                     │
└─────────────────────────────────────┘
```

---

## Performance Metrics

### Expected Performance:
- **Profile Load**: < 100ms (cached), < 500ms (first load)
- **AI Suggestions**: 2-5 seconds (depends on Gemini API)
- **Tracking Update**: < 200ms
- **History Fetch**: < 300ms (30 days)

### Database Indexes:
```javascript
// Optimized queries
User.find({ _id: userId })                    // O(1) with _id index
User.find({ 'skinCareTracking.date': date }) // O(log n) with date index
User.find({ email: email })                   // O(1) with email index
```

---

This architecture provides a scalable, maintainable, and secure foundation for the Skin Care and Hair Care features! 🏗️
