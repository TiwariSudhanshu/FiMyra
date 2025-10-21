'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview';
import QuickStats from '../components/dashboard/QuickStats';
import MealTracking from '../components/dashboard/MealTracking';
import AIHealthCoach from '../components/dashboard/AIHealthCoach';
import RecentActivity from '../components/dashboard/RecentActivity';
import HairCare from '../components/dashboard/HairCare';
import SkinCare from '../components/dashboard/SkinCare';
import GoalsSection from '../components/dashboard/GoalsSection';
import OverviewSection from '../components/dashboard/OverviewSection';
import ActivitySection from '../components/dashboard/ActivitySection';
import AuraScore from '../components/dashboard/AuraScore';
import DailyHabits from '../components/dashboard/DailyHabits';
import MoodSection from '../components/dashboard/MoodSection';
import FloatingAIChatButton from '../components/FloatingAIChatButton';

interface HealthProfile {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  healthGoals?: string[];
  medicalConditions?: string[];
  allergies?: string[];
  dietaryPreferences?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
  healthProfile?: HealthProfile;
  profileCompleted?: boolean;
}

type TabId = 'overview' | 'analytics' | 'goals' | 'meals' | 'mood' | 'coach' | 'activity' | 'habits' | 'aura' | 'haircare' | 'skincare';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const getTabs = (
  user: User | null, 
  onTabChange: (tab: TabId) => void,
  overviewKey: number,
  onMealUpdate: () => void,
  analyticsKey: number
): Tab[] => [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
    component: user ? (
      <div className="space-y-8">
        <WelcomeSection userName={user.name} />
        <OverviewSection key={overviewKey} onTabChange={onTabChange} />
      </div>
    ) : null
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    component: <AnalyticsOverview refreshTrigger={analyticsKey} />
  },
  {
    id: 'goals',
    label: 'My Goals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    component: <GoalsSection />
  },
  {
    id: 'meals',
    label: 'Meal Tracking',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
    component: <MealTracking onMealAdded={onMealUpdate} />
  },
  {
    id: 'mood',
    label: 'Mood Insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    component: <MoodSection />
  },
  {
    id: 'coach',
    label: 'AI Coach',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    component: user ? <AIHealthCoach userName={user.name} /> : null
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    component: <ActivitySection />
  },
  {
    id: 'habits',
    label: 'Daily Habits',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    component: <DailyHabits />
  },
  {
    id: 'aura',
    label: 'Aura Score',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    component: <AuraScore />
  },
  {
    id: 'haircare',
    label: 'Hair Care',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    component: <HairCare />
  },
  {
    id: 'skincare',
    label: 'Skin Care',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    component: <SkinCare />
  }
];

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [overviewKey, setOverviewKey] = useState(0); // Key to force re-render of overview
  const [analyticsKey, setAnalyticsKey] = useState(0); // Key to force re-render of analytics
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleMealUpdate = () => {
    // Force re-render of overview section and analytics when meals are added/removed
    setOverviewKey(prev => prev + 1);
    setAnalyticsKey(prev => prev + 1);
    console.log('🔄 Triggering overview and analytics refresh');
  };

  useEffect(() => {
    // Always try to fetch user data first (works for both NextAuth and JWT auth)
    // Only redirect to login if the fetch fails
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.message);
        router.push('/login?redirect=/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load user data');
      router.push('/login?redirect=/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/');
      } else {
        setError('Failed to logout');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'User not found'}</p>
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md shadow-2xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/logo.png" 
                alt="FiMyra Logo" 
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain"
              />
              <Link href="/" className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 transition-all">
                FiMyra
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <span className="text-white/80 text-sm lg:text-base hidden lg:inline">Welcome, {user.name}!</span>
              <Link
                href="/profile"
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-blue-400/50 hover:border-blue-400 transition-all overflow-hidden"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=40`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full transition-all backdrop-blur-sm text-sm lg:text-base"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <Link
                  href="/profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-400/50 hover:border-blue-400 transition-all overflow-hidden"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=40`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-white/60 text-sm">{user.email}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 px-4 py-3 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="mb-8">
            {/* Desktop Navigation */}
            <div className="hidden lg:block bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2">
              <div className="flex flex-wrap gap-1">
                {getTabs(user, setActiveTab, overviewKey, handleMealUpdate, analyticsKey).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className={`transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile/Tablet Navigation - Icons Grid */}
            <div className="lg:hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3">
              <div className="grid grid-cols-5 gap-2">
                {getTabs(user, setActiveTab, overviewKey, handleMealUpdate, analyticsKey).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl font-medium text-xs transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className={`transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                      {tab.icon}
                    </span>
                    <span className="text-[10px] leading-tight text-center hidden sm:block">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {getTabs(user, setActiveTab, overviewKey, handleMealUpdate, analyticsKey).map((tab) => (
              <div
                key={tab.id}
                className={`transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'opacity-100 translate-y-0 block' 
                    : 'opacity-0 translate-y-4 hidden'
                }`}
              >
                {tab.component}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating AI Chat Button */}
      <FloatingAIChatButton />
    </div>
  );
};

export default Dashboard;