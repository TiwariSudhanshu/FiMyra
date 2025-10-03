import React from 'react';

interface ProblemsSectionProps {}

const ProblemsSection: React.FC<ProblemsSectionProps> = () => {
  const problems = [
    {
      title: "Complex Nutrient Tracking",
      description: "Tracking nutrients is complicated and time-consuming."
    },
    {
      title: "Missing Mood Connection", 
      description: "Most apps ignore how your food affects your mood."
    },
    {
      title: "Lack of Motivation",
      description: "Staying consistent with health goals is hard without motivation."
    }
  ];

  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Common Health Tracking Problems
            </h2>
            <p className="text-xl text-gray-300">
              We understand the challenges you face with traditional health apps
            </p>
          </div>
          
          {/* Problems Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-400 font-bold text-xl">!</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {problem.title}
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;