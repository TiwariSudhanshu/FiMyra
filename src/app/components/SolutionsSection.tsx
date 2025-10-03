import React from 'react';

interface SolutionsSectionProps {}

const SolutionsSection: React.FC<SolutionsSectionProps> = () => {
  const solutions = [
    {
      title: "Aura Score",
      description: "One simple number summarizing your daily health.",
      icon: "⭐"
    },
    {
      title: "Mood Tracking", 
      description: "Understand how your meals affect energy & focus.",
      icon: "😊"
    },
    {
      title: "Smart Food Swap Suggestions",
      description: "Eat smarter without sacrificing taste.",
      icon: "🔄"
    }
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              How FiMyra Solves These Problems
            </h2>
            <p className="text-xl text-gray-300">
              Simple, smart solutions that make healthy living effortless
            </p>
          </div>
          
          {/* Solutions Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">{solution.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {solution.title}
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {solution.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              Try FiMyra Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;