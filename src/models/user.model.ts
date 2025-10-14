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
    }>;
  }[];
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
        calories: { type: Number }
      }],
      lunch: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number }
      }],
      dinner: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number }
      }],
      snacks: [{
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: 'serving' },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        fiber: { type: Number },
        calories: { type: Number }
      }]
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