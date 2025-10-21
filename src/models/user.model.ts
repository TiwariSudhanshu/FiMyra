import mongoose, { Document, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;
  password?: string;
  authProvider?: 'local' | 'google' | 'clerk';
  googleId?: string;
  clerkId?: string;
  
  // Health Profile
  healthProfile?: {
    height?: number; // in cm
    weight?: number; // in kg
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
    healthGoals?: string[]; // e.g., ['weight-loss', 'muscle-gain', 'maintenance']
    medicalConditions?: string[];
    allergies?: string[];
    dietaryPreferences?: string[]; // e.g., ['vegetarian', 'vegan', 'keto']
    hairType?: string;
    hairConcerns?: string[];
    skinType?: string;
    skinConcerns?: string[];
  };
  
  profileCompleted?: boolean;
  meals?: {
    date?: Date;
    breakfast?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      carbs?: number;
      protein?: number;
      fat?: number;
      fiber?: number;
      calories?: number;
      mood?: string; // Emoji: 😀 😐 😔 😡 😴
      moodNote?: string; // Optional note about mood
    }>;
    lunch?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      carbs?: number;
      protein?: number;
      fat?: number;
      fiber?: number;
      calories?: number;
      mood?: string; // Emoji: 😀 😐 😔 😡 😴
      moodNote?: string; // Optional note about mood
    }>;
    dinner?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      carbs?: number;
      protein?: number;
      fat?: number;
      fiber?: number;
      calories?: number;
      mood?: string; // Emoji: 😀 😐 😔 😡 😴
      moodNote?: string; // Optional note about mood
    }>;
    snacks?: Array<{
      name: string;
      quantity?: number;
      unit?: string;
      carbs?: number;
      protein?: number;
      fat?: number;
      fiber?: number;
      calories?: number;
      mood?: string; // Emoji: 😀 😐 😔 😡 😴
      moodNote?: string; // Optional note about mood
    }>;
  }[];
  // Mood tracking (aggregated from meals)
  moodTracking?: Array<{
    date: Date;
    mood: string; // Emoji: 😀 😐 😔 😡 😴
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    note?: string;
    timestamp: Date;
  }>;
  savedMeals?: string[];
  recentMeals?: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    carbs?: number;
    protein?: number;
    fat?: number;
    fiber?: number;
    calories?: number;
  }>;
  goal?: {
    type: 'weight-loss' | 'weight-gain' | 'muscle-gain' | 'maintenance';
    currentWeight: number;
    targetWeight: number;
    duration: number;
    startDate: Date;
  };
  // Daily tracking
  dailyTracking?: Array<{
    date: Date;
    waterIntake: number; // glasses
    waterGoal: number; // glasses
    exerciseMinutes: number;
    exerciseGoal: number; // minutes
    caloriesConsumed: number;
    caloriesGoal: number;
    proteinConsumed: number;
    proteinGoal: number;
    carbsConsumed: number;
    carbsGoal: number;
    fatConsumed: number;
    fatGoal: number;
    stepsCount?: number;
    stepsGoal?: number;
    sleepHours?: number;
    sleepGoal?: number;
    completed: boolean;
  }>;
  // Activity/notifications
  activities?: Array<{
    type: 'goal_complete' | 'target_achieved' | 'meal_logged' | 'exercise_completed' | 'streak' | 'milestone';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
    read: boolean;
  }>;
  // Streaks
  streaks?: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  };
  // Hair Care Profile
  hairCareProfile?: {
    hairType: string;
    concerns: string[];
    routine: {
      shampoo: string;
      conditioner: string;
      treatments: string[];
      frequency: string;
    };
    goals: string[];
    notes?: string;
    updatedAt?: Date;
  };
  // Skin Care Profile
  skinCareProfile?: {
    skinType: string;
    concerns: string[];
    routine: {
      morning: string[];
      evening: string[];
      products: string[];
    };
    // Enhanced routine with times and reminders
    morningSteps?: Array<{
      step: string;
      product?: string;
      reminderTime?: string; // HH:mm format
      enabled: boolean;
    }>;
    eveningSteps?: Array<{
      step: string;
      product?: string;
      reminderTime?: string; // HH:mm format
      enabled: boolean;
    }>;
    goals: string[];
    notes?: string;
    updatedAt?: Date;
  };
  // Skin Care Daily Tracking
  skinCareTracking?: Array<{
    date: Date;
    morningRoutineCompleted: boolean;
    eveningRoutineCompleted: boolean;
    // Track individual steps
    completedSteps?: Array<{
      step: string;
      time: Date;
      routine: 'morning' | 'evening';
    }>;
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
  // Aura Score (overall wellness score 0-100)
  auraScore?: number;
  auraScoreHistory?: Array<{
    score: number;
    date: Date;
    breakdown: {
      nutrition: number;
      activity: number;
      consistency: number;
      routines: number;
      goals: number;
    };
  }>;
  lastAuraUpdate?: Date;
  // Daily Habits Tracker
  dailyHabits?: Array<{
    date: Date;
    habits: {
      exercised: boolean;
      ateHealthy: boolean;
      drankWater: boolean;
      sleptWell: boolean;
      tookVitamins: boolean;
      meditated: boolean;
      stretched: boolean;
      journaled: boolean;
      skinCareRoutine: boolean;
      hairCareRoutine: boolean;
    };
    completionRate: number; // Percentage of habits completed
    notes?: string;
  }>;
  // Password reset fields
  resetOTP?: string;
  resetOTPExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    avatar: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff&size=128'
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      // Password is optional for OAuth users
      required: function(this: IUser) {
        return this.authProvider === 'local' || !this.authProvider;
      }
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'clerk'],
      default: 'local'
    },
    googleId: {
      type: String,
      index: true,
      sparse: true // Allows multiple null values but unique non-null values
    },
    clerkId: {
      type: String,
      index: true,
      sparse: true
    },
    healthProfile: {
      height: {
        type: Number,
        min: [50, 'Height must be at least 50 cm'],
        max: [300, 'Height cannot exceed 300 cm']
      },
      weight: {
        type: Number,
        min: [20, 'Weight must be at least 20 kg'],
        max: [500, 'Weight cannot exceed 500 kg']
      },
      age: {
        type: Number,
        min: [13, 'Age must be at least 13'],
        max: [120, 'Age cannot exceed 120']
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
      },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active']
      },
      healthGoals: [{
        type: String,
        enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'improve-fitness', 'better-nutrition']
      }],
      medicalConditions: [String],
      allergies: [String],
      dietaryPreferences: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'none']
      }],
      hairType: {
        type: String,
        enum: ['straight', 'wavy', 'curly', 'coily']
      },
      hairConcerns: [String],
      skinType: {
        type: String,
        enum: ['normal', 'dry', 'oily', 'combination', 'sensitive']
      },
      skinConcerns: [String]
    },
    profileCompleted: {
      type: Boolean,
      default: false
    }
    ,
    // Daily meals storage
    meals: [{
      date: { type: Date, required: true },
      breakfast: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number },
        mood: { type: String }, // Emoji: 😀 😐 😔 😡 😴
        moodNote: { type: String } // Optional note
      }],
      lunch: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number },
        mood: { type: String }, // Emoji: 😀 😐 😔 😡 😴
        moodNote: { type: String } // Optional note
      }],
      dinner: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number },
        mood: { type: String }, // Emoji: 😀 😐 😔 😡 😴
        moodNote: { type: String } // Optional note
      }],
      snacks: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number },
        mood: { type: String }, // Emoji: 😀 😐 😔 😡 😴
        moodNote: { type: String } // Optional note
      }]
    }],
    // Mood tracking (aggregated from meals)
    moodTracking: [{
      date: { type: Date, required: true },
      mood: { type: String, required: true }, // Emoji: 😀 😐 😔 😡 😴
      mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snacks'], required: true },
      note: { type: String },
      timestamp: { type: Date, default: Date.now }
    }],
    recentMeals: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      unit: { type: String, default: 'serving' },
      carbs: { type: Number },
      protein: { type: Number },
      fat: { type: Number },
      fiber: { type: Number },
      calories: { type: Number }
    }],
    goal: {
      type: {
        type: String,
        enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance']
      },
      currentWeight: { type: Number },
      targetWeight: { type: Number },
      duration: { type: Number },
      startDate: { type: Date }
    },
    // Daily tracking
    dailyTracking: [{
      date: { type: Date, required: true },
      waterIntake: { type: Number, default: 0 },
      waterGoal: { type: Number, default: 8 },
      exerciseMinutes: { type: Number, default: 0 },
      exerciseGoal: { type: Number, default: 60 },
      caloriesConsumed: { type: Number, default: 0 },
      caloriesGoal: { type: Number, default: 2000 },
      proteinConsumed: { type: Number, default: 0 },
      proteinGoal: { type: Number, default: 150 },
      carbsConsumed: { type: Number, default: 0 },
      carbsGoal: { type: Number, default: 250 },
      fatConsumed: { type: Number, default: 0 },
      fatGoal: { type: Number, default: 65 },
      stepsCount: { type: Number, default: 0 },
      stepsGoal: { type: Number, default: 10000 },
      sleepHours: { type: Number, default: 0 },
      sleepGoal: { type: Number, default: 8 },
      completed: { type: Boolean, default: false }
    }],
    // Activity/notifications
    activities: [{
      type: {
        type: String,
        enum: ['goal_complete', 'target_achieved', 'meal_logged', 'exercise_completed', 'streak', 'milestone'],
        required: true
      },
      title: { type: String, required: true },
      description: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      icon: { type: String, required: true },
      read: { type: Boolean, default: false }
    }],
    // Streaks
    streaks: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActivityDate: { type: Date }
    },
    // Hair Care Profile
    hairCareProfile: {
      hairType: { type: String },
      concerns: [{ type: String }],
      routine: {
        shampoo: { type: String },
        conditioner: { type: String },
        treatments: [{ type: String }],
        frequency: { type: String }
      },
      goals: [{ type: String }],
      notes: { type: String },
      updatedAt: { type: Date, default: Date.now }
    },
    // Skin Care Profile
    skinCareProfile: {
      skinType: { type: String },
      concerns: [{ type: String }],
      routine: {
        morning: [{ type: String }],
        evening: [{ type: String }],
        products: [{ type: String }]
      },
      // Enhanced routine with times and reminders
      morningSteps: [{
        step: { type: String, required: true },
        product: { type: String },
        reminderTime: { type: String }, // HH:mm format
        enabled: { type: Boolean, default: true }
      }],
      eveningSteps: [{
        step: { type: String, required: true },
        product: { type: String },
        reminderTime: { type: String }, // HH:mm format
        enabled: { type: Boolean, default: true }
      }],
      goals: [{ type: String }],
      notes: { type: String },
      updatedAt: { type: Date, default: Date.now }
    },
    // Skin Care Daily Tracking
    skinCareTracking: [{
      date: { type: Date, required: true },
      morningRoutineCompleted: { type: Boolean, default: false },
      eveningRoutineCompleted: { type: Boolean, default: false },
      // Track individual steps
      completedSteps: [{
        step: { type: String, required: true },
        time: { type: Date, required: true },
        routine: { type: String, enum: ['morning', 'evening'], required: true }
      }],
      notes: { type: String }
    }],
    // Hair Care Tracking (wash reminders and completion)
    hairCareTracking: [{
      date: { type: Date, required: true },
      washScheduled: { type: Boolean, default: false },
      washCompleted: { type: Boolean, default: false },
      skipped: { type: Boolean, default: false },
      notes: { type: String }
    }],
    // Next scheduled hair wash date
    nextHairWashDate: { type: Date },
    // Aura Score (overall wellness score 0-100)
    auraScore: { 
      type: Number, 
      min: 0, 
      max: 100,
      default: 0 
    },
    auraScoreHistory: [{
      score: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      breakdown: {
        nutrition: { type: Number, default: 0 },
        activity: { type: Number, default: 0 },
        consistency: { type: Number, default: 0 },
        routines: { type: Number, default: 0 },
        goals: { type: Number, default: 0 }
      }
    }],
    lastAuraUpdate: { type: Date },
    // Daily Habits Tracker
    dailyHabits: [{
      date: { type: Date, required: true },
      habits: {
        exercised: { type: Boolean, default: false },
        ateHealthy: { type: Boolean, default: false },
        drankWater: { type: Boolean, default: false },
        sleptWell: { type: Boolean, default: false },
        tookVitamins: { type: Boolean, default: false },
        meditated: { type: Boolean, default: false },
        stretched: { type: Boolean, default: false },
        journaled: { type: Boolean, default: false },
        skinCareRoutine: { type: Boolean, default: false },
        hairCareRoutine: { type: Boolean, default: false }
      },
      completionRate: { type: Number, default: 0 },
      notes: { type: String }
    }],
    // Password reset fields
    resetOTP: {
      type: String,
      select: false,
    },
    resetOTPExpiry: {
      type: Date,
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      transform: function(doc, ret) {
        // Remove password from JSON output for security
        delete ret.password;
        return ret;
      }
    }
  }
);

// Note: email uses `unique: true` in the field definition which creates its own index.
// We declare `index: true` on googleId and clerkId fields above (with `sparse: true`) to
// create sparse indexes and avoid duplicating index declarations.

// Pre-save middleware to set dynamic default avatar
UserSchema.pre('save', function(next) {
  if (this.isNew && !this.avatar) {
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=fff&size=128`;
  }
  next();
});

// Instance methods
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByGoogleId = function(googleId: string) {
  return this.findOne({ googleId });
};

UserSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ clerkId });
};

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;