'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const LearnMorePage: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: '✨',
      title: 'Aura Score',
      description: 'Your personalized wellness metric that combines nutrition, activity, mood, and consistency into one powerful score.',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: '🧠',
      title: 'AI Health Coach',
      description: 'Get real-time, intelligent recommendations tailored to your unique health profile and goals.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🍎',
      title: 'Nutrition Intelligence',
      description: 'Track meals effortlessly with AI-powered nutrition analysis and personalized macro targets.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🎯',
      title: 'Smart Goal Setting',
      description: 'Set achievable health goals with science-backed recommendations and progress tracking.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '💪',
      title: 'Habit Tracker',
      description: 'Build lasting wellness habits with daily tracking and streak management.',
      color: 'from-pink-500 to-purple-500'
    },
    {
      icon: '🌿',
      title: 'Holistic Wellness',
      description: 'Track skincare, haircare, hydration, exercise, and more in one unified platform.',
      color: 'from-teal-500 to-green-500'
    }
  ];

  const roadmap = [
    {
      phase: 'Phase 1',
      title: 'Foundation',
      status: 'Completed',
      items: [
        'Core health tracking',
        'Aura Score algorithm',
        'Basic nutrition logging',
        'Goal setting & tracking'
      ]
    },
    {
      phase: 'Phase 2',
      title: 'Intelligence',
      status: 'In Progress',
      items: [
        'AI-powered insights',
        'Advanced analytics',
        'Personalized recommendations',
        'Smart meal suggestions'
      ]
    },
    {
      phase: 'Phase 3',
      title: 'Community',
      status: 'Coming Soon',
      items: [
        'Social features',
        'Group challenges',
        'Expert consultations',
        'Peer support network'
      ]
    },
    {
      phase: 'Phase 4',
      title: 'Premium',
      status: 'Coming Soon',
      items: [
        'Wearable integrations',
        'Advanced biomarker tracking',
        'Personalized meal plans',
        'Priority AI support'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-gray-900/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="FiMyra Logo" 
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                FiMyra
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-white/70 hover:text-white transition-colors"
              >
                Home
              </button>
              <Link
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full font-semibold transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-400/10 backdrop-blur-sm mb-6">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded opacity-80" />
              <span className="text-purple-300 text-sm font-medium">Learn About FiMyra</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your Health Journey,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Powered by Intelligence
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              FiMyra is more than just a health tracker. It's your personal wellness companion that 
              understands you, adapts to your lifestyle, and helps you achieve your health goals with 
              intelligent insights and personalized guidance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              We believe that everyone deserves access to intelligent, personalized health guidance. 
              FiMyra was created to democratize wellness by combining cutting-edge AI technology with 
              proven health science, making it easier than ever to understand your body, track your 
              progress, and achieve your goals.
            </p>
            <p className="text-lg text-white/80 leading-relaxed">
              Our unique <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">Aura Score</span> algorithm 
              transforms complex health data into a single, actionable metric that helps you make 
              better decisions every day. Because your health isn't just about numbers — it's about 
              feeling your best, inside and out.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-white/70 text-lg">
              Everything you need to transform your health journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}
                className={`bg-gradient-to-br ${feature.color} bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white/10 cursor-pointer`}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Product Roadmap
            </h2>
            <p className="text-white/70 text-lg">
              Building the future of wellness, one feature at a time
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {roadmap.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-purple-400 font-semibold text-sm mb-1">{phase.phase}</div>
                    <h3 className="text-2xl font-bold text-white">{phase.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    phase.status === 'Completed' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : phase.status === 'In Progress'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Health?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already on their journey to better health with FiMyra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => router.push('/')}
                className="border-2 border-white/40 hover:border-white/60 bg-transparent hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 backdrop-blur-sm"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} FiMyra. Built with ✨ and algorithms.</p>
        </div>
      </footer>
    </div>
  );
};

export default LearnMorePage;
