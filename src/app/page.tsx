import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProblemsSection from './components/ProblemsSection';
import SolutionsSection from './components/SolutionsSection';
import Footer from './components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main>
        <HeroSection />
        <ProblemsSection />
        <SolutionsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
