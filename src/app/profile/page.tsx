'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  healthProfile?: HealthProfile;
  profileCompleted?: boolean;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: '',
    healthGoals: [] as string[],
    medicalConditions: [] as string[],
    allergies: [] as string[],
    dietaryPreferences: [] as string[]
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          height: data.user.healthProfile?.height?.toString() || '',
          weight: data.user.healthProfile?.weight?.toString() || '',
          age: data.user.healthProfile?.age?.toString() || '',
          gender: data.user.healthProfile?.gender || '',
          activityLevel: data.user.healthProfile?.activityLevel || '',
          healthGoals: data.user.healthProfile?.healthGoals || [],
          medicalConditions: data.user.healthProfile?.medicalConditions || [],
          allergies: data.user.healthProfile?.allergies || [],
          dietaryPreferences: data.user.healthProfile?.dietaryPreferences || []
        });
      } else {
        router.push('/login?redirect=/profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      router.push('/login?redirect=/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update avatar if new one selected
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);

        const avatarResponse = await fetch('/api/profile/avatar', {
          method: 'POST',
          credentials: 'include',
          body: avatarFormData,
        });

        if (!avatarResponse.ok) {
          throw new Error('Failed to update avatar');
        }
      }

      // Update profile
      const healthProfile = {
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        activityLevel: formData.activityLevel || undefined,
        healthGoals: formData.healthGoals,
        medicalConditions: formData.medicalConditions,
        allergies: formData.allergies,
        dietaryPreferences: formData.dietaryPreferences
      };

      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          healthProfile
        }),
      });

      const data = await profileResponse.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setUser(data.user);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
            FiMyra
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Complete Your Health Profile</h1>
          <p className="mt-2 text-gray-400">Help us personalize your FiMyra experience</p>
        </div>

        {/* Profile Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          {error && (
            <div className="mb-6 p-3 bg-red-900 border border-red-600 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-900 border border-green-600 rounded-md text-green-200 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=3b82f6&color=fff&size=128`}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-2 text-gray-400 text-sm">Click + to change avatar</p>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="13"
                  max="120"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Physical Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  min="50"
                  max="300"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="20"
                  max="500"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="lightly-active">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="moderately-active">Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="very-active">Very Active (hard exercise 6-7 days/week)</option>
                <option value="extremely-active">Extremely Active (very hard exercise, physical job)</option>
              </select>
            </div>

            {/* Health Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Health Goals (select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'improve-fitness', 'better-nutrition'].map(goal => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.healthGoals.includes(goal)}
                      onChange={() => handleMultiSelectChange('healthGoals', goal)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300 text-sm capitalize">{goal.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dietary Preferences (optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free', 'none'].map(pref => (
                  <label key={pref} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences.includes(pref)}
                      onChange={() => handleMultiSelectChange('dietaryPreferences', pref)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                    />
                    <span className="ml-2 text-gray-300 text-sm capitalize">{pref.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Skip for now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;