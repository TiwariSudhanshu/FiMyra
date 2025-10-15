/**
 * Skin Care & Hair Care API Service
 * 
 * Utility functions for interacting with skin care and hair care APIs
 * from the frontend components.
 */

// ============================================
// SKIN CARE SERVICES
// ============================================

export interface SkinCareProfile {
  skinType: string;
  concerns: string[];
  routine: {
    morning: string[];
    evening: string[];
    products: string[];
  };
  goals: string[];
  notes?: string;
  updatedAt?: Date;
}

export interface SkinCareTracking {
  date: Date;
  morningRoutineCompleted: boolean;
  eveningRoutineCompleted: boolean;
  notes?: string;
}

export interface SkinCareSuggestions {
  morningRoutine: string[];
  eveningRoutine: string[];
  productRecommendations: string[];
  lifestyleTips: string[];
  avoidMistakes: string[];
}

/**
 * Fetch user's skin care profile
 */
export async function getSkinCareProfile(): Promise<{
  success: boolean;
  skinCareProfile: SkinCareProfile | null;
  age: number | null;
}> {
  const response = await fetch('/api/profile/skincare', {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

/**
 * Save or update skin care profile
 */
export async function saveSkinCareProfile(profile: Partial<SkinCareProfile>): Promise<{
  success: boolean;
  message: string;
  skinCareProfile?: SkinCareProfile;
}> {
  const response = await fetch('/api/profile/skincare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(profile)
  });
  return response.json();
}

/**
 * Get AI-powered skin care suggestions
 */
export async function getSkinCareSuggestions(): Promise<{
  success: boolean;
  suggestions?: SkinCareSuggestions;
  profile?: {
    skinType: string;
    concerns: string[];
    age: number;
  };
  message?: string;
}> {
  const response = await fetch('/api/ai/skincare-suggestions', {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
}

/**
 * Fetch skin care tracking history
 */
export async function getSkinCareTracking(days: number = 30): Promise<{
  success: boolean;
  tracking: SkinCareTracking[];
  todayStatus: SkinCareTracking | null;
  stats: {
    totalDays: number;
    morningCompleted: number;
    eveningCompleted: number;
    bothCompleted: number;
  };
}> {
  const response = await fetch(`/api/tracking/skincare?days=${days}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

/**
 * Update today's skin care routine tracking
 */
export async function updateSkinCareTracking(data: {
  morningRoutineCompleted?: boolean;
  eveningRoutineCompleted?: boolean;
  notes?: string;
}): Promise<{
  success: boolean;
  message: string;
  tracking?: SkinCareTracking;
}> {
  const response = await fetch('/api/tracking/skincare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return response.json();
}

/**
 * Clear all skin care tracking history
 */
export async function clearSkinCareTracking(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch('/api/tracking/skincare', {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
}

// ============================================
// HAIR CARE SERVICES
// ============================================

export interface HairCareProfile {
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
}

export interface HairCareTracking {
  date: Date;
  washScheduled: boolean;
  washCompleted: boolean;
  skipped: boolean;
  notes?: string;
}

export interface HairCareSuggestions {
  dailyCare: string[];
  weeklyTreatments: string[];
  productRecommendations: string[];
  lifestyleTips: string[];
  avoidMistakes: string[];
}

/**
 * Fetch user's hair care profile with wash reminder status
 */
export async function getHairCareProfile(): Promise<{
  success: boolean;
  hairCareProfile: HairCareProfile | null;
  age: number | null;
  nextWashDate: Date | null;
  isWashDueToday: boolean;
  isWashOverdue: boolean;
}> {
  const response = await fetch('/api/profile/haircare', {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

/**
 * Save or update hair care profile
 */
export async function saveHairCareProfile(profile: Partial<HairCareProfile>): Promise<{
  success: boolean;
  message: string;
  hairCareProfile?: HairCareProfile;
  nextWashDate?: Date;
}> {
  const response = await fetch('/api/profile/haircare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(profile)
  });
  return response.json();
}

/**
 * Get AI-powered hair care suggestions
 */
export async function getHairCareSuggestions(): Promise<{
  success: boolean;
  suggestions?: HairCareSuggestions;
  profile?: {
    hairType: string;
    concerns: string[];
    age: number;
  };
  message?: string;
}> {
  const response = await fetch('/api/ai/haircare-suggestions', {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
}

/**
 * Fetch hair care tracking history
 */
export async function getHairCareTracking(days: number = 30): Promise<{
  success: boolean;
  tracking: HairCareTracking[];
  todayStatus: HairCareTracking | null;
  nextWashDate: Date | null;
  isWashDueToday: boolean;
  isWashOverdue: boolean;
  frequency: string | null;
  stats: {
    totalWashes: number;
    totalSkipped: number;
    totalScheduled: number;
    completionRate: number;
  };
}> {
  const response = await fetch(`/api/tracking/haircare?days=${days}`, {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

/**
 * Update hair care wash tracking
 * @param action - 'schedule', 'complete', or 'skip'
 * @param notes - Optional notes
 * @param date - Optional date (defaults to today)
 */
export async function updateHairCareTracking(
  action: 'schedule' | 'complete' | 'skip',
  notes?: string,
  date?: Date
): Promise<{
  success: boolean;
  message: string;
  tracking?: HairCareTracking;
  nextWashDate?: Date;
}> {
  const response = await fetch('/api/tracking/haircare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, notes, date })
  });
  return response.json();
}

/**
 * Update wash frequency
 */
export async function updateWashFrequency(frequency: string): Promise<{
  success: boolean;
  message: string;
  frequency: string;
  nextWashDate: Date;
}> {
  const response = await fetch('/api/tracking/haircare', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ frequency })
  });
  return response.json();
}

/**
 * Clear all hair care tracking history
 */
export async function clearHairCareTracking(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch('/api/tracking/haircare', {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate days until next wash
 */
export function getDaysUntilWash(nextWashDate: Date | string | null): number {
  if (!nextWashDate) return -1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const washDate = new Date(nextWashDate);
  washDate.setHours(0, 0, 0, 0);
  
  const diffTime = washDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate skin care routine streak
 */
export function calculateStreak(tracking: SkinCareTracking[]): {
  current: number;
  longest: number;
} {
  if (!tracking || tracking.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort by date descending
  const sorted = [...tracking].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const trackDate = new Date(sorted[i].date);
    trackDate.setHours(0, 0, 0, 0);

    const bothCompleted = sorted[i].morningRoutineCompleted && sorted[i].eveningRoutineCompleted;

    if (bothCompleted) {
      tempStreak++;
      
      // Calculate current streak from today
      const daysDiff = Math.floor((today.getTime() - trackDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === i) {
        currentStreak = tempStreak;
      }
      
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Get wash frequency display text
 */
export function getFrequencyText(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    'daily': 'Daily',
    'every-other-day': 'Every Other Day',
    'alternate days': 'Every Other Day',
    'twice-a-week': 'Twice a Week',
    'twice a week': 'Twice a Week',
    'weekly': 'Weekly',
    'once-a-week': 'Weekly',
    'once a week': 'Weekly',
    'twice-a-month': 'Twice a Month',
    'twice a month': 'Twice a Month',
    'monthly': 'Monthly',
    'once-a-month': 'Monthly'
  };

  return frequencyMap[frequency.toLowerCase()] || frequency;
}
