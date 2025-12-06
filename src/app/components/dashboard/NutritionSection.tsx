"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import MealTracking from "./MealTracking";
import MoodSection from "./MoodSection";

interface NutritionSectionProps {
  onMealAdded?: () => void;
}

type NutritionTab = "meals" | "mood";

const NutritionSection: React.FC<NutritionSectionProps> = ({ onMealAdded }) => {
  const [activeTab, setActiveTab] = useState<NutritionTab>("meals");

  const tabs = [
    { id: "meals" as NutritionTab, label: "Meal Tracking", icon: "🍽️" },
    { id: "mood" as NutritionTab, label: "Mood Insights", icon: "😊" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-400/30 bg-green-400/10 backdrop-blur-sm mb-4">
          <span className="text-2xl">🥗</span>
          <span className="text-green-300 text-sm font-medium">Nutrition</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Nutrition & Wellness
        </h2>
        <p className="text-white/70">
          Track your meals, monitor nutrition, and understand your mood patterns
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-1.5 inline-flex gap-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "meals" && <MealTracking onMealAdded={onMealAdded} />}
        {activeTab === "mood" && <MoodSection />}
      </div>
    </div>
  );
};

export default NutritionSection;
