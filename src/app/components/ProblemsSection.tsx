import React from 'react';

interface ProblemsSectionProps {}

const ProblemsSection: React.FC<ProblemsSectionProps> = () => {
  const problems = [
    {
      icon: "📊",
      title: "Overwhelming Data Chaos",
      description: "Traditional health apps bombard you with endless charts, numbers, and metrics that confuse more than clarify. You spend more time analyzing data than actually living healthily.",
      stat: "89% of users abandon health apps within 6 months"
    },
    {
      icon: "🧠",
      title: "Missing Mind-Body Connection", 
      description: "Most wellness platforms treat your physical and mental health as separate entities, ignoring the profound connection between what you eat, how you feel, and your overall aura.",
      stat: "Your mood affects food choices 73% of the time"
    },
    {
      icon: "🎯",
      title: "Generic Cookie-Cutter Advice",
      description: "One-size-fits-all recommendations that don't account for your unique lifestyle, preferences, or personal energy patterns. What works for others might drain your aura.",
      stat: "Only 12% find generic health advice personally relevant"
    },
    {
      icon: "⚡",
      title: "Energy Drain Instead of Boost",
      description: "Complex tracking systems that require constant input become another source of stress rather than a tool for wellness. Your health app shouldn't exhaust your mental energy.",
      stat: "Average user spends 47 minutes daily on health tracking"
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-400/30 bg-red-400/10 backdrop-blur-sm mb-6">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm font-medium">The Problem</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Why Most Health Apps
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400"> Fail You</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              The wellness industry is broken. Apps that promise transformation but deliver complexity, 
              confusion, and eventually, abandonment. Sound familiar?
            </p>
          </div>
          
          {/* Problems Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {problems.map((problem, index) => (
              <div key={index} className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-red-400/30 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-400/20 to-purple-400/20 rounded-xl flex items-center justify-center border border-red-400/20 group-hover:border-red-400/40 transition-colors">
                      <span className="text-2xl">{problem.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-300 transition-colors">
                        {problem.title}
                      </h3>
                      <div className="inline-block px-3 py-1 bg-red-400/10 border border-red-400/20 rounded-full mb-3">
                        <span className="text-red-300 text-sm font-medium">{problem.stat}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-white/60 text-lg mb-6">
              It's time for a different approach. One that honors your whole being.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
              <span className="text-white/90 font-medium">Ready for something better?</span>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;