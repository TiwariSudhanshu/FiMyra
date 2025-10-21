"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type MealItem = {
  name: string;
  quantity?: number;
  unit?: string;
  carbs?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  calories?: number;
};

type MealDay = {
  date: string;
  breakfast?: MealItem[];
  lunch?: MealItem[];
  dinner?: MealItem[];
  snacks?: MealItem[];
};

const SECTION_ORDER: Array<"breakfast" | "lunch" | "snacks" | "dinner"> = [
  "breakfast",
  "lunch",
  "snacks",
  "dinner",
];

const MEAL_ICONS: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🍲",
  snacks: "🍎",
  dinner: "🍽️",
};

const Chip: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}> = ({ children, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-3 py-1 rounded-full text-sm transition-all ${active ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/30" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
  >
    {children}
  </motion.button>
);

interface MealTrackingProps {
  onMealAdded?: () => void;
}

const MealTracking: React.FC<MealTrackingProps> = ({ onMealAdded }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [allMeals, setAllMeals] = useState<MealDay[]>([]);
  const [mealsData, setMealsData] = useState<MealDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingMeal, setAddingMeal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snacks"
  >("breakfast");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [selected, setSelected] = useState<
    Array<{ name: string; quantity: number; unit: string }>
  >([]);
  const [savedMeals, setSavedMeals] = useState<string[]>([]);
  const [savingSavedMeal, setSavingSavedMeal] = useState(false);
  const [newSavedName, setNewSavedName] = useState("");
  
  // Water tracking state
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(8);
  const [updatingWater, setUpdatingWater] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("fimyra:recentMeals");
    if (raw) {
      try {
        setRecent(JSON.parse(raw));
      } catch (e) {
        setRecent([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchMeals();
    fetchWaterIntake();
  }, []);
  
  useEffect(() => {
    // Fetch water when date changes
    fetchWaterIntake();
  }, [currentDate]);

  useEffect(() => {
    // Update mealsData when currentDate changes
    const targetDate = new Date(currentDate);
    targetDate.setHours(0, 0, 0, 0);
    const found = allMeals.find((d: any) => {
      const dt = new Date(d.date);
      dt.setHours(0, 0, 0, 0);
      return dt.getTime() === targetDate.getTime();
    });
    setMealsData(
      found || {
        date: currentDate.toISOString(),
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      }
    );
  }, [currentDate, allMeals]);

  const fetchMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/meals");
      if (!res.ok) {
        throw new Error("Unable to fetch meals");
      }
      const json = await res.json();
      
      if (json.success && Array.isArray(json.meals)) {
        setAllMeals(json.meals);
      } else {
        console.warn("Invalid meals response:", json);
        setAllMeals([]);
      }
    } catch (err: any) {
      console.error("Fetch meals error:", err);
      const errorMessage = err?.message || "Failed to load meals";
      setError(errorMessage);
      // Don't show toast on initial load failure, just log it
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWaterIntake = async () => {
    try {
      const res = await fetch("/api/tracking/daily");
      if (res.ok) {
        const json = await res.json();
        setWaterIntake(json.tracking?.waterIntake || 0);
        setWaterGoal(json.tracking?.waterGoal || 8);
      }
    } catch (err: any) {
      console.error("Failed to fetch water intake:", err);
    }
  };
  
  const updateWater = async (newValue: number) => {
    if (newValue < 0) return;
    setUpdatingWater(true);
    setWaterIntake(newValue);
    
    try {
      const res = await fetch("/api/tracking/daily");
      if (!res.ok) throw new Error("Failed to get tracking data");
      const json = await res.json();
      const tracking = json.tracking;
      
      // Update water intake
      const updatedTracking = {
        ...tracking,
        waterIntake: newValue
      };
      
      const updateRes = await fetch("/api/tracking/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTracking)
      });
      
      if (!updateRes.ok) throw new Error("Failed to update water");
      
      // Notify parent to refresh overview
      if (onMealAdded) {
        onMealAdded();
      }
    } catch (err: any) {
      console.error("Failed to update water:", err);
      // Revert on error
      await fetchWaterIntake();
    } finally {
      setUpdatingWater(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const openModal = (type: "breakfast" | "lunch" | "dinner" | "snacks") => {
    setModalMealType(type);
    setSelected([]);
    setQuery("");
    setIsModalOpen(true);
  };

  // load saved meals when modal opens
  useEffect(() => {
    if (!isModalOpen) return;
    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/profile/saved-meals");
        if (!res.ok) return;
        const json = await res.json();
        setSavedMeals(json.savedMeals || []);
      } catch (e) {
        // ignore
      }
    };
    fetchSaved();
  }, [isModalOpen]);

  const toggleSelect = (itemName: string) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.name === itemName);
      if (exists) {
        return prev.filter((p) => p.name !== itemName);
      } else {
        return [...prev, { name: itemName, quantity: 1, unit: "serving" }];
      }
    });
  };

  const updateQuantity = (itemName: string, quantity: number) => {
    setSelected((prev) =>
      prev.map((p) =>
        p.name === itemName ? { ...p, quantity: Math.max(0.1, quantity) } : p
      )
    );
  };

  const updateUnit = (itemName: string, unit: string) => {
    setSelected((prev) =>
      prev.map((p) => (p.name === itemName ? { ...p, unit } : p))
    );
  };

  const saveRecent = (items: string[]) => {
    const next = [...items, ...recent.filter((r) => !items.includes(r))].slice(
      0,
      20
    );
    setRecent(next);
    localStorage.setItem("fimyra:recentMeals", JSON.stringify(next));
  };

  const addMeals = async (
    type: "breakfast" | "lunch" | "dinner" | "snacks",
    items: Array<{ name: string; quantity: number; unit: string }>
  ) => {
    if (!items || items.length === 0) {
      toast.error("Please add at least one meal item");
      return;
    }

    setAddingMeal(true);
    setError(null);
    
    try {
      // Send date in YYYY-MM-DD format to avoid timezone issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('📅 Sending meal for date:', dateString);
      
      const res = await fetch("/api/profile/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: type,
          items,
          date: dateString, // Send as YYYY-MM-DD string
        }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.message || "Failed to add meal");
      }

      // Update meals data immediately
      if (json.success && json.meals) {
        console.log("✅ Meals updated from API:", json.meals);
        setAllMeals(json.meals);
        
        // Force update mealsData for current date
        const targetDate = new Date(currentDate);
        targetDate.setHours(0, 0, 0, 0);
        const updatedDayMeals = json.meals.find((d: any) => {
          const dt = new Date(d.date);
          dt.setHours(0, 0, 0, 0);
          return dt.getTime() === targetDate.getTime();
        });
        
        if (updatedDayMeals) {
          console.log("📅 Setting meals data for current date:", updatedDayMeals);
          setMealsData(updatedDayMeals);
        }
        
        // Show success toast with nutrient info
        const mealNames = items.map(i => i.name).join(", ");
        const addedMeals = json.addedMeals || items;
        const totalCalories = addedMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
        
        if (totalCalories > 0) {
          toast.success(`✅ Added to ${type}: ${mealNames} (${Math.round(totalCalories)} cal)`);
        } else {
          toast.success(`✅ Added to ${type}: ${mealNames}`);
        }
        
        // Save to recent meals
        saveRecent(items.map((i) => i.name));
        
        // Reset modal state
        setIsModalOpen(false);
        setSelected([]);
        setQuery("");
        
        // Notify parent component
        console.log('🔄 Calling onMealAdded callback to refresh overview & analytics');
        if (onMealAdded) {
          onMealAdded();
        } else {
          console.warn('⚠️ onMealAdded callback not provided');
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("❌ Add meal error:", err);
      const errorMessage = err?.message || "Failed to add meal";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddingMeal(false);
    }
  };

  const removeMeal = async (
    type: "breakfast" | "lunch" | "dinner" | "snacks",
    itemIndex: number
  ) => {
    try {
      // Send date in YYYY-MM-DD format to avoid timezone issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const res = await fetch("/api/profile/meals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: type,
          itemIndex,
          date: dateString, // Send as YYYY-MM-DD string
        }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.message || "Failed to remove meal");
      }

      if (json.success && json.meals) {
        console.log("✅ Meal removed, updated meals:", json.meals);
        setAllMeals(json.meals);
        
        // Force update mealsData for current date
        const targetDate = new Date(currentDate);
        targetDate.setHours(0, 0, 0, 0);
        const updatedDayMeals = json.meals.find((d: any) => {
          const dt = new Date(d.date);
          dt.setHours(0, 0, 0, 0);
          return dt.getTime() === targetDate.getTime();
        });
        
        if (updatedDayMeals) {
          setMealsData(updatedDayMeals);
        } else {
          // No meals left for this date
          setMealsData({
            date: currentDate.toISOString(),
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: [],
          });
        }
        
        toast.success(`🗑️ Meal removed from ${type}`);
        
        // Notify parent component
        console.log('🔄 Calling onMealAdded callback after removal to refresh overview & analytics');
        if (onMealAdded) {
          onMealAdded();
        } else {
          console.warn('⚠️ onMealAdded callback not provided');
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("❌ Remove meal error:", err);
      const errorMessage = err?.message || "Failed to remove meal";
      toast.error(errorMessage);
    }
  };

  const filteredRecent = useMemo(
    () => recent.filter((r) => r.toLowerCase().includes(query.toLowerCase())),
    [recent, query]
  );

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Meal Tracking
          </h3>
          <p className="text-white/60 text-sm sm:text-base">
            Track what you eat throughout the day — stay consistent, stay
            healthy.
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-2 sm:py-3 border border-white/10 w-full sm:w-auto justify-center">
          <motion.button
            onClick={() => navigateDate("prev")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-white/60 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-lg"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <div className="text-center min-w-[70px] sm:min-w-[80px]">
            <div className="text-white font-semibold text-base sm:text-lg">
              {formatDate(currentDate)}
            </div>
            {isToday(currentDate) && (
              <div className="text-purple-400 text-xs font-medium">Today</div>
            )}
          </div>

          <motion.button
            onClick={() => navigateDate("next")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={isToday(currentDate)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              isToday(currentDate)
                ? "text-white/20 cursor-not-allowed"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Water Intake Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-blue-400/20 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
              💧
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-semibold text-white">Water Intake</h4>
              <p className="text-white/60 text-xs sm:text-sm">Stay hydrated throughout the day</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {waterIntake}<span className="text-white/50 text-lg sm:text-xl">/{waterGoal}</span>
            </div>
            <p className="text-blue-400 text-xs sm:text-sm font-medium">
              {Math.round((waterIntake / waterGoal) * 100)}% Complete
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2.5 sm:h-3 mb-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
          />
        </div>
        
        {/* Water Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <motion.button
            onClick={() => updateWater(waterIntake - 1)}
            disabled={waterIntake === 0 || updatingWater}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all"
          >
            -1 Glass
          </motion.button>
          
          <div className="px-3 sm:px-4 py-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
            <span className="text-white/80 text-xs sm:text-sm">Glasses</span>
          </div>
          
          <motion.button
            onClick={() => updateWater(waterIntake + 1)}
            disabled={updatingWater}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all"
          >
            +1 Glass
          </motion.button>
          
          <motion.button
            onClick={() => updateWater(waterIntake + 2)}
            disabled={updatingWater}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/30 transition-all"
          >
            +2 Glasses
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-white/70 text-center py-8">
          Loading your meals...
        </div>
      ) : error ? (
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {SECTION_ORDER.map((section) => {
            const key = section as keyof MealDay;
            const items: MealItem[] =
              (mealsData && (mealsData as any)[key]) || [];
            return (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)",
                }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
                      {MEAL_ICONS[section]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-xl font-semibold text-white capitalize">
                        {section}
                      </h4>
                      <p className="text-white/50 text-xs sm:text-sm truncate">
                        {items.length === 0
                          ? "No items added yet"
                          : `${items.length} item${items.length > 1 ? "s" : ""} logged`}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => openModal(section)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full text-xs sm:text-sm font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex-shrink-0"
                  >
                    + Add
                  </motion.button>
                </div>

                {items.length > 0 && (
                  <div className="mt-4 space-y-2 pl-0 sm:pl-[60px]">
                    {items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 bg-white/5 rounded-lg p-2.5 sm:p-3 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-1.5 sm:mt-0 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="text-white/90 text-xs sm:text-sm font-medium break-words">
                                {item.name}
                              </span>
                              {item.quantity && item.quantity !== 1 && (
                                <span className="text-[10px] sm:text-xs text-purple-400 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {item.quantity} {item.unit || "serving"}
                                  {item.quantity > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            {item.calories !== undefined && (
                              <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-white/60">
                                <span>🔥 {Math.round(item.calories)} cal</span>
                                {item.protein !== undefined && (
                                  <span>
                                    💪 {Math.round(item.protein)}g
                                  </span>
                                )}
                                {item.carbs !== undefined && (
                                  <span>
                                    🍞 {Math.round(item.carbs)}g
                                  </span>
                                )}
                                {item.fat !== undefined && (
                                  <span>🥑 {Math.round(item.fat)}g</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <motion.button
                          onClick={() => removeMeal(section, idx)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1 hover:bg-red-500/10 rounded flex-shrink-0"
                          title="Remove item"
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-4xl border border-white/10 shadow-2xl pointer-events-auto my-4"
              >
                <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                      {MEAL_ICONS[modalMealType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg sm:text-2xl font-bold text-white capitalize">
                        Add to {modalMealType}
                      </h4>
                      <p className="text-white/60 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                        Add one or multiple items. Use recent items for quick
                        selection.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white/60 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>

                <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                  {/* Search Input */}
                  <div>
                    <label className="block text-white/80 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                      Search or Type Meal Name
                    </label>
                    <input
                      placeholder="E.g., Grilled chicken salad..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  {/* Recent Items */}
                  <div>
                    <label className="block text-white/80 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                      Recent Items
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[50px] sm:min-h-[60px] bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5">
                      {filteredRecent.length === 0 ? (
                        <span className="text-white/40 text-xs sm:text-sm">
                          No recent items yet. Start adding meals!
                        </span>
                      ) : (
                        filteredRecent.map((r, i) => (
                          <motion.button
                            key={i}
                            onClick={() => toggleSelect(r)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                              selected.find((s) => s.name === r)
                                ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                                : "bg-white/10 text-white/90 hover:bg-white/20"
                            }`}
                          >
                            {r}
                          </motion.button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Saved Items */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-3">
                      Saved Meals (from your library)
                    </label>
                    <div className="flex flex-wrap gap-2 min-h-[60px] bg-white/5 rounded-xl p-4 border border-white/5">
                      {savedMeals.length === 0 ? (
                        <span className="text-white/40 text-sm">
                          No saved meals yet. Save one below.
                        </span>
                      ) : (
                        savedMeals
                          .filter((s) =>
                            s.toLowerCase().includes(query.toLowerCase())
                          )
                          .map((s, i) => (
                            <motion.button
                              key={i}
                              onClick={() => toggleSelect(s)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selected.find((sel) => sel.name === s) ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg" : "bg-white/10 text-white/90 hover:bg-white/20"}`}
                            >
                              {s}
                            </motion.button>
                          ))
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={newSavedName}
                        onChange={(e) => setNewSavedName(e.target.value)}
                        placeholder="Save meal name..."
                        className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                      />
                      <button
                        onClick={async () => {
                          const name = newSavedName.trim();
                          if (!name) return;
                          setSavingSavedMeal(true);
                          try {
                            const res = await fetch(
                              "/api/profile/saved-meals",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name }),
                              }
                            );
                            const json = await res.json();
                            if (res.ok) {
                              setSavedMeals(json.savedMeals || []);
                              setNewSavedName("");
                            }
                          } catch (e) {
                          } finally {
                            setSavingSavedMeal(false);
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                      >
                        {savingSavedMeal ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Selected Items */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-3">
                      Selected Items{" "}
                      {selected.length > 0 && (
                        <span className="text-purple-400">
                          ({selected.length})
                        </span>
                      )}
                    </label>
                    <div className="flex flex-col gap-3 min-h-[60px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                      {selected.length === 0 ? (
                        <span className="text-white/40 text-sm">
                          No items selected. Click on recent items or type
                          above.
                        </span>
                      ) : (
                        selected.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-purple-500/30"
                          >
                            <span className="text-sm text-white font-medium flex-1">
                              {item.name}
                            </span>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0.1"
                                step="0.5"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.name,
                                    parseFloat(e.target.value) || 1
                                  )
                                }
                                className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              />
                              <select
                                value={item.unit}
                                onChange={(e) =>
                                  updateUnit(item.name, e.target.value)
                                }
                                className="px-2 py-1 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-gradient-to-r from-purple-500 to-blue-600 appearance-none"
                              >
                                <option value="serving" className="bg-gray-900">
                                  serving
                                </option>
                                <option value="cup" className="bg-gray-900">
                                  cup
                                </option>
                                <option value="bowl" className="bg-gray-900">
                                  bowl
                                </option>
                                <option value="plate" className="bg-gray-900">
                                  plate
                                </option>
                                <option value="piece" className="bg-gray-900">
                                  piece
                                </option>
                                <option value="slice" className="bg-gray-900">
                                  slice
                                </option>
                                <option value="tbsp" className="bg-gray-900">
                                  tbsp
                                </option>
                                <option value="tsp" className="bg-gray-900">
                                  tsp
                                </option>
                                <option value="oz" className="bg-gray-900">
                                  oz
                                </option>
                                <option value="g" className="bg-gray-900">
                                  g
                                </option>
                              </select>
                            </div>

                            <motion.button
                              onClick={() => toggleSelect(item.name)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              className="text-white/60 hover:text-white transition-colors p-1"
                            >
                              ✕
                            </motion.button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => {
                        const trimmed = query.trim();
                        if (trimmed) {
                          setSelected((prev) => {
                            const exists = prev.find((p) => p.name === trimmed);
                            if (exists) return prev;
                            return [
                              ...prev,
                              { name: trimmed, quantity: 1, unit: "serving" },
                            ];
                          });
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-purple-500/20"
                    >
                      Add Typed Item
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const samples = [
                          { name: "Apple", quantity: 1, unit: "piece" },
                          { name: "Banana", quantity: 1, unit: "piece" },
                          { name: "Greek Yogurt", quantity: 1, unit: "cup" },
                        ];
                        setSelected((prev) => {
                          const newItems = samples.filter(
                            (s) => !prev.find((p) => p.name === s.name)
                          );
                          return [...prev, ...newItems];
                        });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                      Add Sample Items
                    </motion.button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 sm:pt-6 border-t border-white/10">
                  <p className="text-white/50 text-xs sm:text-sm text-center sm:text-left">
                    Items will be saved to your meals for{" "}
                    {isToday(currentDate) ? "today" : formatDate(currentDate)}.
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.button
                      onClick={() => setIsModalOpen(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={addingMeal}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const itemsToAdd =
                          selected.length > 0
                            ? selected
                            : query.trim()
                              ? [
                                  {
                                    name: query.trim(),
                                    quantity: 1,
                                    unit: "serving",
                                  },
                                ]
                              : [];
                        if (itemsToAdd.length > 0 && !addingMeal)
                          addMeals(modalMealType, itemsToAdd);
                      }}
                      whileHover={
                        !addingMeal
                          ? {
                              scale: 1.05,
                              boxShadow: "0 10px 40px rgba(139, 92, 246, 0.4)",
                            }
                          : {}
                      }
                      whileTap={!addingMeal ? { scale: 0.95 } : {}}
                      disabled={addingMeal}
                      className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px] sm:min-w-[120px]"
                    >
                      {addingMeal ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          Add{" "}
                          {selected.length > 0 ? `(${selected.length})` : ""}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealTracking;
