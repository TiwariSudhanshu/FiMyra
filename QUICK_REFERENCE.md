# 🚀 Quick Reference Card - Skin Care & Hair Care APIs

## 📞 **Quick API Reference**

### **Skin Care**

| Method | Endpoint | Purpose | Body/Params |
|--------|----------|---------|-------------|
| GET | `/api/profile/skincare` | Get profile | - |
| POST | `/api/profile/skincare` | Save profile | `{ skinType, concerns, routine, goals, notes }` |
| POST | `/api/ai/skincare-suggestions` | Get AI tips | - |
| GET | `/api/tracking/skincare?days=30` | Get history | `?days=30` |
| POST | `/api/tracking/skincare` | Update today | `{ morningRoutineCompleted, eveningRoutineCompleted, notes }` |
| DELETE | `/api/tracking/skincare` | Clear history | - |

### **Hair Care**

| Method | Endpoint | Purpose | Body/Params |
|--------|----------|---------|-------------|
| GET | `/api/profile/haircare` | Get profile + reminder | - |
| POST | `/api/profile/haircare` | Save profile | `{ hairType, concerns, routine, goals, notes }` |
| POST | `/api/ai/haircare-suggestions` | Get AI tips | - |
| GET | `/api/tracking/haircare?days=30` | Get history | `?days=30` |
| POST | `/api/tracking/haircare` | Track wash | `{ action: "complete|skip|schedule", notes?, date? }` |
| PUT | `/api/tracking/haircare` | Update frequency | `{ frequency }` |
| DELETE | `/api/tracking/haircare` | Clear history | - |

---

## 💻 **Quick Code Snippets**

### **Import Services**
```typescript
import {
  getSkinCareProfile, saveSkinCareProfile, getSkinCareSuggestions,
  updateSkinCareTracking, getSkinCareTracking,
  getHairCareProfile, saveHairCareProfile, getHairCareSuggestions,
  updateHairCareTracking, getHairCareTracking
} from '@/utils/careServices';
```

### **Save Skin Care Profile**
```typescript
const result = await saveSkinCareProfile({
  skinType: 'oily',
  concerns: ['acne', 'dark spots'],
  routine: {
    morning: ['cleanser', 'moisturizer', 'sunscreen'],
    evening: ['cleanser', 'toner', 'night cream'],
    products: ['CeraVe Cleanser']
  },
  goals: ['clear skin'],
  notes: 'Sensitive to fragrance'
});
```

### **Mark Routine Completed**
```typescript
await updateSkinCareTracking({
  morningRoutineCompleted: true,
  eveningRoutineCompleted: false,
  notes: 'Felt good today'
});
```

### **Save Hair Care Profile**
```typescript
const result = await saveHairCareProfile({
  hairType: 'curly',
  concerns: ['frizz', 'dryness'],
  routine: {
    shampoo: 'Sulfate-free shampoo',
    conditioner: 'Deep conditioner',
    treatments: ['hair mask', 'oil treatment'],
    frequency: 'twice-a-week'
  },
  goals: ['reduce frizz'],
  notes: 'Use cold water rinse'
});
console.log('Next wash:', result.nextWashDate);
```

### **Complete Hair Wash**
```typescript
const result = await updateHairCareTracking('complete', 'Used new shampoo');
console.log('Next wash scheduled for:', result.nextWashDate);
```

### **Get AI Suggestions**
```typescript
const skinSuggestions = await getSkinCareSuggestions();
if (skinSuggestions.success) {
  console.log('Morning:', skinSuggestions.suggestions?.morningRoutine);
  console.log('Evening:', skinSuggestions.suggestions?.eveningRoutine);
}

const hairSuggestions = await getHairCareSuggestions();
if (hairSuggestions.success) {
  console.log('Daily care:', hairSuggestions.suggestions?.dailyCare);
  console.log('Weekly:', hairSuggestions.suggestions?.weeklyTreatments);
}
```

---

## 🗄️ **Database Schema Quick View**

```typescript
// User Model Fields
user: {
  // Skin Care
  skinCareProfile: {
    skinType: string,
    concerns: string[],
    routine: { morning: string[], evening: string[], products: string[] },
    goals: string[],
    notes: string
  },
  skinCareTracking: [{
    date: Date,
    morningRoutineCompleted: boolean,
    eveningRoutineCompleted: boolean,
    notes: string
  }],
  
  // Hair Care
  hairCareProfile: {
    hairType: string,
    concerns: string[],
    routine: { shampoo: string, conditioner: string, treatments: string[], frequency: string },
    goals: string[],
    notes: string
  },
  hairCareTracking: [{
    date: Date,
    washScheduled: boolean,
    washCompleted: boolean,
    skipped: boolean,
    notes: string
  }],
  nextHairWashDate: Date
}
```

---

## 🎯 **Wash Frequency Options**

| Frequency | Next Wash |
|-----------|-----------|
| `daily` | +1 day |
| `every-other-day` | +2 days |
| `twice-a-week` | +3 days |
| `weekly` | +7 days |
| `twice-a-month` | +14 days |
| `monthly` | +30 days |

---

## 🔐 **Authentication Quick Check**

```typescript
// All APIs require authentication
// Token is extracted from cookies:
// 1. next-auth.session-token (NextAuth)
// 2. __Secure-next-auth.session-token (NextAuth HTTPS)
// 3. auth-token (JWT)

// If not authenticated:
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## ✅ **Response Format**

All APIs return:
```typescript
{
  success: boolean,      // true = success, false = error
  message?: string,      // Human-readable message
  data?: any,           // Response data
  error?: string        // Error details (if failed)
}
```

---

## 🧪 **Testing Commands**

### **cURL Examples:**

```bash
# Save skin care profile
curl -X POST http://localhost:3000/api/profile/skincare \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"skinType":"oily","concerns":["acne"]}'

# Get AI suggestions
curl -X POST http://localhost:3000/api/ai/skincare-suggestions \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Update tracking
curl -X POST http://localhost:3000/api/tracking/skincare \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"morningRoutineCompleted":true}'

# Complete hair wash
curl -X POST http://localhost:3000/api/tracking/haircare \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"action":"complete","notes":"Washed today"}'
```

---

## 🛠️ **Helper Functions**

```typescript
// Format date
formatDate(date) // → "Oct 16, 2025"

// Days until wash
getDaysUntilWash(nextWashDate) // → 3

// Calculate streak
calculateStreak(tracking) // → { current: 5, longest: 12 }

// Get frequency text
getFrequencyText('twice-a-week') // → "Twice a Week"
```

---

## 📊 **Common UI Patterns**

### **Loading State**
```typescript
const [loading, setLoading] = useState(false);
setLoading(true);
const data = await getSkinCareProfile();
setLoading(false);
```

### **Error Handling**
```typescript
const result = await saveSkinCareProfile(data);
if (!result.success) {
  alert(result.message || 'Failed to save');
} else {
  alert('Saved successfully!');
}
```

### **Auto-refresh After Update**
```typescript
const handleUpdate = async () => {
  await updateSkinCareTracking({ morningRoutineCompleted: true });
  loadProfile(); // Reload data
};
```

---

## 🐛 **Common Errors & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Not logged in | Check authentication |
| 400 Bad Request | Missing skinType/hairType | Ensure required fields set |
| 500 Internal Error | Database/AI error | Check logs, retry |
| Empty suggestions | Profile not set | Save profile first |
| Null nextWashDate | No frequency set | Set wash frequency in profile |

---

## 📝 **Quick Checklist**

### **Before Going Live:**
- [ ] Set `GEMINI_API_KEY` in `.env`
- [ ] Set `NEXTAUTH_SECRET` in `.env`
- [ ] Set `JWT_SECRET` in `.env`
- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Test AI suggestions
- [ ] Test wash reminder calculation
- [ ] Test tracking updates
- [ ] Check error handling
- [ ] Test on mobile/desktop

---

## 📖 **Documentation Files**

| File | Purpose |
|------|---------|
| `SKINCARE_HAIRCARE_API_DOCS.md` | Complete API documentation |
| `IMPLEMENTATION_GUIDE.md` | UI component examples |
| `SKINCARE_HAIRCARE_SUMMARY.md` | Overview & features |
| `ARCHITECTURE.md` | System architecture |
| `QUICK_REFERENCE.md` | This file - quick lookup |

---

## 🔗 **Quick Links**

- **Service File**: `src/utils/careServices.ts`
- **User Model**: `src/models/user.model.ts`
- **Skin APIs**: `src/app/api/profile/skincare/`, `src/app/api/tracking/skincare/`
- **Hair APIs**: `src/app/api/profile/haircare/`, `src/app/api/tracking/haircare/`
- **AI APIs**: `src/app/api/ai/skincare-suggestions/`, `src/app/api/ai/haircare-suggestions/`

---

## 💡 **Pro Tips**

1. **Cache profile data** in useState to avoid repeated API calls
2. **Use loading states** for better UX
3. **Debounce AI suggestions** to avoid rate limits
4. **Show wash reminders prominently** on dashboard
5. **Celebrate streaks** with animations
6. **Auto-save notes** after 2 seconds of typing
7. **Use optimistic updates** for better perceived performance
8. **Add confirmation** before clearing history

---

**Keep this card handy while implementing! 📌**

For detailed examples, see `IMPLEMENTATION_GUIDE.md`  
For API specs, see `SKINCARE_HAIRCARE_API_DOCS.md`
