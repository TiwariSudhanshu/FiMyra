'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SolutionsSectionProps {}

const SolutionsSection: React.FC<SolutionsSectionProps> = () => {
  const router = useRouter();
  
  const solutions = [
    {
      title: "Your Personal Aura Score",
      description: "One intelligent number that captures your complete wellness state. No more drowning in data - just pure insight into your energy, nutrition, and mood harmony.",
      icon: "✨",
      feature: "AI-Powered Algorithm",
      benefit: "Understand your wellness in seconds, not hours"
    },
    {
      title: "Mood × Nutrition Intelligence", 
      description: "Discover the hidden connections between what you eat and how you feel. Our smart tracking reveals patterns that transform how you fuel your body and mind.",
      icon: "🧠",
      feature: "Pattern Recognition",
      benefit: "Eat for your mood, not just your body"
    },
    {
      title: "Effortless Health Optimization",
      description: "Gentle nudges and personalized suggestions that fit seamlessly into your life. No rigid rules, just intelligent guidance that adapts to your unique rhythm.",
      icon: "🎯",
      feature: "Adaptive Recommendations",
      benefit: "Sustainable changes that actually stick"
    }
  ];

  const features = [
    {
      icon: "📱",
      title: "Intuitive Design",
      description: "Beautiful, minimal interface that energizes rather than overwhelms"
    },
    {
      icon: "🤖",
      title: "AI Health Companion",
      description: "Your personal wellness coach available 24/7 for guidance and support"
    },
    {
      icon: "📊",
      title: "Smart Analytics",
      description: "Meaningful insights delivered when you need them, not data dumps"
    },
    {
      icon: "🎨",
      title: "Personalized Experience",
      description: "Adapts to your lifestyle, preferences, and wellness journey"
    }
  ];

  const handleGetStarted = () => {
    router.push('/signup');
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/30 bg-blue-400/10 backdrop-blur-sm mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-medium">The Solution</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Meet Your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600"> Aura Algorithm</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              FiMyra transforms the overwhelming world of wellness into elegant simplicity. 
              Finally, a health companion that thinks like you do.
            </p>
          </div>
          
          {/* Main Solutions Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {solutions.map((solution, index) => (
              <div key={index} className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-400/30 transition-all duration-500 hover:transform hover:scale-[1.05]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-400/20">
                    <span className="text-3xl">{solution.icon}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {solution.title}
                  </h3>
                  
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-full mb-4">
                    <span className="text-blue-300 text-sm font-medium">{solution.feature}</span>
                  </div>
                  
                  <p className="text-white/70 leading-relaxed mb-4">
                    {solution.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
                    <span className="text-green-300 font-medium">{solution.benefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Features Grid */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Everything You Need, Nothing You Don't
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center">
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Elevate Your Wellness Game?
              </h3>
              <p className="text-white/70">
                Join thousands who've discovered their perfect health rhythm with FiMyra.
                Your aura transformation starts with one simple step.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px]"
              >
                Start Your Aura Journey
              </button>
              
              <button className="border-2 border-white/30 hover:border-white/50 bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 backdrop-blur-sm min-w-[200px]">
                See How It Works
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;