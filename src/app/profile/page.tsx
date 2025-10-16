'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import InstallPWAButton from '../components/InstallPWAButton';

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
  hairType?: string;
  hairConcerns?: string[];
  skinType?: string;
  skinConcerns?: string[];
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    dietaryPreferences: [] as string[],
    hairType: '',
    hairConcerns: [] as string[],
    skinType: '',
    skinConcerns: [] as string[]
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
          dietaryPreferences: data.user.healthProfile?.dietaryPreferences || [],
          hairType: data.user.healthProfile?.hairType || '',
          hairConcerns: data.user.healthProfile?.hairConcerns || [],
          skinType: data.user.healthProfile?.skinType || '',
          skinConcerns: data.user.healthProfile?.skinConcerns || []
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
        dietaryPreferences: formData.dietaryPreferences,
        hairType: formData.hairType || undefined,
        hairConcerns: formData.hairConcerns,
        skinType: formData.skinType || undefined,
        skinConcerns: formData.skinConcerns
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
        setIsEditModalOpen(false);
        setTimeout(() => setSuccess(''), 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md shadow-2xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="FiMyra Logo" 
                width={32}
                height={32}
                className="rounded-lg"
              />
              <Link href="/dashboard" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-300 hover:to-blue-300 transition-all">
                FiMyra
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-white/90 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-sm font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-400/10 backdrop-blur-sm mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
              <span className="text-purple-300 text-sm font-medium">Your Profile</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Complete Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 ml-5 to-blue-400">Health Profile</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Help us personalize your FiMyra experience with detailed health insights
            </p>
          </div>

          {/* Profile Display/Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-xl text-green-300 text-sm backdrop-blur-sm">
                {success}
              </div>
            )}

          {/* Profile Display */}
          {!isEditModalOpen && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-400/20">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=7c3aed&color=fff&size=120`}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full border-4 border-purple-400/50 object-cover"
                />
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{formData.name || 'Your Name'}</h2>
                  <p className="text-white/70 mb-4">{user?.email}</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.profileCompleted ? (
                      <span className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm">
                        ✓ Profile Complete
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full text-yellow-300 text-sm">
                        Profile Incomplete
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Edit Profile
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Age:</span>
                      <span className="text-white">{formData.age || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gender:</span>
                      <span className="text-white capitalize">{formData.gender || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Height:</span>
                      <span className="text-white">{formData.height ? `${formData.height} cm` : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Weight:</span>
                      <span className="text-white">{formData.weight ? `${formData.weight} kg` : 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Activity & Goals */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Activity & Goals</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-white/60 block mb-1">Activity Level:</span>
                      <span className="text-white capitalize">{formData.activityLevel?.replace('-', ' ') || 'Not set'}</span>
                    </div>
                    {formData.healthGoals.length > 0 && (
                      <div>
                        <span className="text-white/60 block mb-2">Health Goals:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.healthGoals.map((goal, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-blue-300 text-xs">
                              {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dietary Preferences */}
                {formData.dietaryPreferences.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Dietary Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.dietaryPreferences.map((pref, index) => (
                        <span key={index} className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm">
                          {pref.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Notes */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Health Notes</h3>
                  <div className="space-y-2">
                    {formData.medicalConditions.length > 0 ? (
                      <div>
                        <span className="text-white/60 text-sm">Medical Conditions:</span>
                        <p className="text-white/80 text-sm">{formData.medicalConditions.join(', ')}</p>
                      </div>
                    ) : (
                      <p className="text-white/60 text-sm">No medical conditions noted</p>
                    )}
                    {formData.allergies.length > 0 ? (
                      <div>
                        <span className="text-white/60 text-sm">Allergies:</span>
                        <p className="text-white/80 text-sm">{formData.allergies.join(', ')}</p>
                      </div>
                    ) : (
                      <p className="text-white/60 text-sm">No allergies noted</p>
                    )}
                  </div>
                </div>

                {/* Hair Care Profile */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>💇‍♀️</span>
                    Hair Care
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Hair Type:</span>
                      <span className="text-white bg-black">{formData.hairType || 'Not set'}</span>
                    </div>
                    {formData.hairConcerns.length > 0 && (
                      <div>
                        <span className="text-white/60 block mb-2">Hair Concerns:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.hairConcerns.map((concern, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-500/20 border border-pink-400/30 rounded text-pink-300 text-xs">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skin Care Profile */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>✨</span>
                    Skin Care
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Skin Type:</span>
                      <span className="text-white">{formData.skinType || 'Not set'}</span>
                    </div>
                    {formData.skinConcerns.length > 0 && (
                      <div>
                        <span className="text-white/60 block mb-2">Skin Concerns:</span>
                        <div className="flex flex-wrap gap-2">
                          {formData.skinConcerns.map((concern, index) => (
                            <span key={index} className="px-2 py-1 bg-rose-500/20 border border-rose-400/30 rounded text-rose-300 text-xs">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Install App Section */}
              <div className="mt-6">
                <InstallPWAButton />
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=7c3aed&color=fff&size=128`}
                      alt="Profile Avatar"
                      className="w-24 h-24 rounded-full border-4 border-purple-400/50 object-cover"
                    />
                    <label className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white p-2 rounded-full cursor-pointer hover:from-purple-600 hover:to-blue-700 transition-all">
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
                  <p className="mt-2 text-white/60 text-sm">Click + to change avatar</p>
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/15 transition-all backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-gray-900 transition-all"
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
                className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-gray-900 transition-all [&>option]:bg-black [&>option]:text-white"
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
                      className="rounded border-white/20 text-purple-500 focus:ring-purple-400/50 bg-white/10"
                    />
                    <span className="ml-2 text-white/80 text-sm capitalize">{goal.replace('-', ' ')}</span>
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
                      className="rounded border-white/20 text-purple-500 focus:ring-purple-400/50 bg-white/10"
                    />
                    <span className="ml-2 text-white/80 text-sm capitalize">{pref.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hair Care Section */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-400/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>💇‍♀️</span>
                Hair Care Profile
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hair Type</label>
                  <select
                    name="hairType"
                    value={formData.hairType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 focus:bg-gray-900 transition-all [&>option]:bg-black [&>option]:text-white"
                  >
                    <option value="">Select Hair Type</option>
                    <option value="straight">Straight (Type 1)</option>
                    <option value="wavy">Wavy (Type 2)</option>
                    <option value="curly">Curly (Type 3)</option>
                    <option value="coily">Coily (Type 4)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hair Concerns (select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Hair Loss', 'Dandruff', 'Dryness', 'Oiliness', 'Split Ends', 'Frizz', 'Lack of Volume', 'Gray Hair', 'Damaged Hair', 'Slow Growth'].map(concern => (
                      <label key={concern} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.hairConcerns.includes(concern)}
                          onChange={() => handleMultiSelectChange('hairConcerns', concern)}
                          className="rounded border-white/20 text-pink-500 focus:ring-pink-400/50 bg-white/10"
                        />
                        <span className="ml-2 text-white/80 text-sm">{concern}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Skin Care Section */}
            <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-xl p-6 border border-rose-400/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>✨</span>
                Skin Care Profile
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Skin Type</label>
                  <select
                    name="skinType"
                    value={formData.skinType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 focus:bg-gray-900 transition-all [&>option]:bg-black [&>option]:text-white"
                  >
                    <option value="">Select Skin Type</option>
                    <option value="normal">Normal</option>
                    <option value="dry">Dry</option>
                    <option value="oily">Oily</option>
                    <option value="combination">Combination</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Skin Concerns (select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Acne', 'Aging/Wrinkles', 'Dark Spots', 'Dullness', 'Large Pores', 'Redness', 'Sensitivity', 'Uneven Texture', 'Blackheads', 'Fine Lines', 'Hyperpigmentation', 'Dehydration'].map(concern => (
                      <label key={concern} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.skinConcerns.includes(concern)}
                          onChange={() => handleMultiSelectChange('skinConcerns', concern)}
                          className="rounded border-white/20 text-rose-500 focus:ring-rose-400/50 bg-white/10"
                        />
                        <span className="ml-2 text-white/80 text-sm">{concern}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 border border-white/20 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;