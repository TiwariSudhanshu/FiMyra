"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type MoodEntry = {
  date: string;
  mood: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  note?: string;
  timestamp: string;
};

type MoodStats = {
  mostCommonMood: string;
  moodCount: Record<string, number>;
  totalEntries: number;
  recentTrend: string;
};

const MOOD_LABELS: Record<string, string> = {
  "😀": "Happy",
  "😐": "Neutral",
  "😔": "Sad",
  "😡": "Angry",
  "😴": "Tired",
};

const MOOD_COLORS: Record<string, string> = {
  "😀": "from-green-500 to-emerald-500",
  "😐": "from-gray-500 to-slate-500",
  "😔": "from-blue-500 to-indigo-500",
  "😡": "from-red-500 to-rose-500",
  "😴": "from-purple-500 to-violet-500",
};

const MoodSection: React.FC = () => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("week");
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);

  useEffect(() => {
    fetchMoodData();
  }, []);

  useEffect(() => {
    if (moodData.length > 0) {
      calculateMoodStats();
    }
  }, [moodData, selectedPeriod]);

  const fetchMoodData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/mood-tracking");
      if (!res.ok) {
        throw new Error("Unable to fetch mood data");
      }
      const json = await res.json();

      if (json.success && Array.isArray(json.moodTracking)) {
        setMoodData(json.moodTracking);
      } else {
        console.warn("Invalid mood response:", json);
        setMoodData([]);
      }
    } catch (err: any) {
      console.error("Fetch mood error:", err);
      const errorMessage = err?.message || "Failed to load mood data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoodStats = () => {
    const now = new Date();
    const filteredData = moodData.filter((entry) => {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (selectedPeriod === "week") return daysDiff <= 7;
      if (selectedPeriod === "month") return daysDiff <= 30;
      return true; // all
    });

    const moodCount: Record<string, number> = {};
    filteredData.forEach((entry) => {
      moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
    });

    const sortedMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]);
    const mostCommonMood = sortedMoods[0]?.[0] || "😐";

    // Calculate recent trend (last 3 vs previous 3 entries)
    let recentTrend = "stable";
    if (filteredData.length >= 6) {
      const recent = filteredData.slice(0, 3);
      const previous = filteredData.slice(3, 6);
      
      const recentPositive = recent.filter((e) => e.mood === "😀").length;
      const previousPositive = previous.filter((e) => e.mood === "😀").length;
      
      if (recentPositive > previousPositive) recentTrend = "improving";
      else if (recentPositive < previousPositive) recentTrend = "declining";
    }

    setMoodStats({
      mostCommonMood,
      moodCount,
      totalEntries: filteredData.length,
      recentTrend,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mood Insights
          </h3>
          <p className="text-white/60 text-sm sm:text-base">
            Track how you feel with your meals and discover patterns
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
          {(["week", "month", "all"] as const).map((period) => (
            <motion.button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {period === "week" ? "7 Days" : period === "month" ? "30 Days" : "All Time"}
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-white/70 text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"></div>
          <p>Loading your mood data...</p>
        </div>
      ) : error ? (
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold mb-2">Oops!</p>
          <p>{error}</p>
        </div>
      ) : moodData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-white/60 text-lg mb-4">No mood data yet</p>
          <p className="text-white/40 text-sm">
            Start logging your mood with meals to see insights here
          </p>
        </div>
      ) : (
        <>
          {/* Mood Statistics Cards */}
          {moodStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Most Common Mood */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${MOOD_COLORS[moodStats.mostCommonMood] || "from-purple-500 to-blue-500"}/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{moodStats.mostCommonMood}</div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm">Most Common</p>
                    <p className="text-white text-xl font-bold">
                      {MOOD_LABELS[moodStats.mostCommonMood] || "Unknown"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Total Entries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/20 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">📊</div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm">Total Logged</p>
                    <p className="text-white text-xl font-bold">{moodStats.totalEntries}</p>
                  </div>
                </div>
              </motion.div>

              {/* Recent Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br backdrop-blur-md rounded-2xl p-6 border shadow-lg ${
                  moodStats.recentTrend === "improving"
                    ? "from-green-500/20 to-emerald-500/20 border-green-400/20"
                    : moodStats.recentTrend === "declining"
                      ? "from-orange-500/20 to-red-500/20 border-orange-400/20"
                      : "from-gray-500/20 to-slate-500/20 border-gray-400/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {moodStats.recentTrend === "improving" ? "📈" : moodStats.recentTrend === "declining" ? "📉" : "➡️"}
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm">Trend</p>
                    <p className="text-white text-xl font-bold capitalize">{moodStats.recentTrend}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Mood Distribution Chart */}
          {moodStats && Object.keys(moodStats.moodCount).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg mb-6"
            >
              <h4 className="text-xl font-semibold text-white mb-4">Mood Distribution</h4>
              <div className="space-y-3">
                {Object.entries(moodStats.moodCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const percentage = (count / moodStats.totalEntries) * 100;
                    return (
                      <div key={mood}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{mood}</span>
                            <span className="text-white/80 text-sm font-medium">
                              {MOOD_LABELS[mood] || "Unknown"}
                            </span>
                          </div>
                          <div className="text-white/60 text-sm">
                            {count} ({Math.round(percentage)}%)
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-2.5 rounded-full bg-gradient-to-r ${MOOD_COLORS[mood] || "from-purple-500 to-blue-500"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Recent Mood Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg"
          >
            <h4 className="text-xl font-semibold text-white mb-4">Recent Mood Logs</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {moodData
                .filter((entry) => {
                  const now = new Date();
                  const entryDate = new Date(entry.date);
                  const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

                  if (selectedPeriod === "week") return daysDiff <= 7;
                  if (selectedPeriod === "month") return daysDiff <= 30;
                  return true;
                })
                .slice(0, 20)
                .map((entry, idx) => (
                  <motion.div
                    key={`${entry.timestamp}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="text-3xl flex-shrink-0">{entry.mood}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white/90 font-medium">
                          {MOOD_LABELS[entry.mood] || "Unknown"}
                        </span>
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase">
                          {entry.mealType}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-white/60 text-sm mb-2">{entry.note}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span>📅 {formatDate(entry.timestamp)}</span>
                        <span>🕐 {formatTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Insights Section */}
          {moodStats && moodStats.totalEntries >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-lg"
            >
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>💡</span> Insights
              </h4>
              <ul className="space-y-2 text-white/70 text-sm">
                {moodStats.mostCommonMood === "😀" && (
                  <li>✨ Great job! Your most common mood is happy. Keep up the positive energy!</li>
                )}
                {moodStats.mostCommonMood === "😔" && (
                  <li>💙 You've been feeling down lately. Consider talking to someone or trying mood-boosting foods.</li>
                )}
                {moodStats.recentTrend === "improving" && (
                  <li>📈 Your mood is trending upward! Whatever you're doing, it's working.</li>
                )}
                {moodStats.recentTrend === "declining" && (
                  <li>🤗 Your mood has dipped recently. Remember to take care of yourself.</li>
                )}
                <li>
                  📊 You've logged {moodStats.totalEntries} mood entries. Consistency helps identify patterns!
                </li>
              </ul>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default MoodSection;
