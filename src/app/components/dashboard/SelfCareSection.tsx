"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import HairCare from "./HairCare";
import SkinCare from "./SkinCare";

type SelfCareTab = "skin" | "hair";

const SelfCareSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SelfCareTab>("skin");

  const tabs = [
    { id: "skin" as SelfCareTab, label: "Skin Care", icon: "✨", color: "rose" },
    { id: "hair" as SelfCareTab, label: "Hair Care", icon: "💇‍♀️", color: "pink" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-400/30 bg-pink-400/10 backdrop-blur-sm mb-4">
          <span className="text-2xl">💆‍♀️</span>
          <span className="text-pink-300 text-sm font-medium">Self Care</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Personal Care Routines
        </h2>
        <p className="text-white/70">
          Manage your skincare and haircare routines with AI-powered recommendations
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
                  ? `bg-gradient-to-r ${tab.id === "skin" ? "from-rose-500 to-pink-600" : "from-pink-500 to-purple-600"} text-white shadow-lg`
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-xl p-4 border border-rose-400/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">☀️</span>
            <div>
              <p className="text-white/60 text-xs">Morning Routine</p>
              <p className="text-white font-semibold">5 Steps</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-4 border border-purple-400/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div>
              <p className="text-white/60 text-xs">Evening Routine</p>
              <p className="text-white font-semibold">4 Steps</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-400/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💇</span>
            <div>
              <p className="text-white/60 text-xs">Hair Wash</p>
              <p className="text-white font-semibold">2-3x/week</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-400/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-white/60 text-xs">AI Tips</p>
              <p className="text-white font-semibold">Available</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === "skin" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "skin" && <SkinCare />}
          {activeTab === "hair" && <HairCare />}
        </motion.div>
      </div>
    </div>
  );
};

export default SelfCareSection;
