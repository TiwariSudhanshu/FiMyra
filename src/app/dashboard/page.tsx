'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview';
import QuickStats from '../components/dashboard/QuickStats';
import MealTracking from '../components/dashboard/MealTracking';
import AIHealthCoach from '../components/dashboard/AIHealthCoach';
import RecentActivity from '../components/dashboard/RecentActivity';
import FloatingAIButton from '../components/FloatingAIButton';

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

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded opacity-90"></div>
              </div>
              <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 transition-all">
                FiMyra
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Welcome, {user.name}!</span>
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full border-2 border-blue-400/50 hover:border-blue-400 transition-all overflow-hidden"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&size=40`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-full transition-all backdrop-blur-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Welcome Section */}
          <WelcomeSection userName={user.name} auraScore={85} />

          {/* Main Features Grid */}
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Analytics Overview */}
            <AnalyticsOverview />
            
            {/* Quick Stats */}
            <QuickStats user={user} />
          </div>



          {/* Meal Tracking & AI Health Coach Section */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Meal Tracking */}
            <MealTracking />
            
            {/* AI Health Coach */}
            <AIHealthCoach userName={user.name} />
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </main>

      {/* Floating AI Button */}
      <FloatingAIButton />
    </div>
  );
};

export default Dashboard;