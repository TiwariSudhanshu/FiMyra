'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AIChatbot from '../components/AIChatbot';

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
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              FiMyra
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.name}!</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100">Manage your health journey with FiMyra</p>
          </div>

          {/* User Profile Card */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=128`;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  {user?.healthProfile && (
                    <div className="mt-1 text-sm text-gray-500">
                      {user.healthProfile.age && <span>{user.healthProfile.age} years • </span>}
                      {user.healthProfile.height && user.healthProfile.weight && (
                        <span>{user.healthProfile.height}cm, {user.healthProfile.weight}kg</span>
                      )}
                    </div>
                  )}
                  <span className="inline-block bg-blue-600 text-blue-100 px-3 py-1 rounded-full text-sm mt-2">
                    {user.authProvider === 'local' ? 'Email Account' : user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1) + ' Account'}
                  </span>
                </div>
              </div>
              
              <Link
                href="/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Edit Profile
              </Link>
            </div>

            {/* Health Profile Status */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              {user?.profileCompleted ? (
                <div>
                  <p className="text-green-400 font-medium mb-2">✓ Profile Complete</p>
                  <p className="text-gray-300 mb-3">Your health profile is complete! We can now provide personalized recommendations.</p>
                  {user.healthProfile?.healthGoals && user.healthProfile.healthGoals.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Your goals:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.healthProfile.healthGoals.map((goal, index) => (
                          <span key={index} className="bg-blue-600 text-blue-100 px-3 py-1 rounded-full text-xs">
                            {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-yellow-400 font-medium mb-2">⚠ Profile Incomplete</p>
                  <p className="text-gray-300 mb-3">Complete your health profile to get personalized recommendations and unlock all features.</p>
                  <Link
                    href="/profile"
                    className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Account Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-gray-300 font-mono text-sm">{user.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="text-white">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Email Address:</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Account Type:</span>
                    <span className="text-white capitalize">{user.authProvider}</span>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Account Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Member Since:</span>
                    <span className="text-white text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white text-sm">{formatDate(user.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 font-semibold">Active</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Security:</span>
                    <span className="text-green-400">✓ Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="text-blue-500 text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Aura Score</h3>
              <p className="text-gray-400 text-sm mb-4">View your daily health score</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition-colors">
                Check Score
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="text-purple-500 text-3xl mb-3">🍎</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Food</h3>
              <p className="text-gray-400 text-sm mb-4">Log your meals and nutrients</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full transition-colors">
                Add Meal
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
              <div className="text-green-500 text-3xl mb-3">😊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Mood Track</h3>
              <p className="text-gray-400 text-sm mb-4">Record your mood and energy</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full transition-colors">
                Log Mood
              </button>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <div className="text-gray-500 text-4xl mb-3">📈</div>
              <p className="text-gray-400">No activity yet. Start tracking to see your progress!</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Chatbot Button */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 z-40"
      >
        <svg 
          className="w-6 h-6 group-hover:scale-110 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
      </button>

      {/* AI Chatbot Modal */}
      <AIChatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;