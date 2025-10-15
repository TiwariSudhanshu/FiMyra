"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LiquidEther from "./ui/LiquidEther"

type HeroSectionProps = {}

const HeroSection: React.FC<HeroSectionProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      const data = await response.json()
      setIsAuthenticated(data.success)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
            <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded opacity-80" />
            <span className="text-white/90 text-sm font-medium">FiMyra</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
            Your Aura. Your Algorithm.
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-white/80 max-w-3xl">
            FiMyra decodes your moods, habits, and nutrition into one powerful Aura Score — helping you understand
            yourself better, vibe smarter, and glow from within.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              onClick={handleGetStarted}
              className="bg-white hover:bg-white/90 text-gray-900 font-semibold px-8 py-4 rounded-full text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[180px]"
            >
              {isAuthenticated ? "Go to Dashboard" : "Begin Your Aura Journey"}
            </button>

            <button className="border-2 border-white/40 hover:border-white/60 bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full text-base md:text-lg transition-all duration-200 backdrop-blur-sm min-w-[180px]">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
