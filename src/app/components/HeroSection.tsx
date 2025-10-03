'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {}

const HeroSection: React.FC<HeroSectionProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      setIsAuthenticated(data.success);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Unlock Your Health Aura Today!
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl mb-8 leading-relaxed text-gray-300">
            Track nutrients, understand your mood, and reach your health goals effortlessly with FiMyra.
          </p>
          
          {/* Call-to-Action Button */}
          <button 
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;