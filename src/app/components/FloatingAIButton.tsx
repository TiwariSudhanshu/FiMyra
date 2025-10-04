'use client';

import React, { useState } from 'react';
import AIChatInline from './AIChatInline';

const FloatingAIButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className={`
            group relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
            text-white rounded-full shadow-2xl transition-all duration-300 ease-out
            ${isChatOpen ? 'scale-110 rotate-90' : 'hover:scale-110 hover:shadow-blue-500/25'}
          `}
        >
          {/* Button Icon */}
          <div className="flex items-center justify-center w-full h-full">
            {isChatOpen ? (
              <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-ping"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
        </button>

        {/* Tooltip */}
        {!isChatOpen && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Chat with AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
            </div>
          </div>
        )}

        {/* Pulse Animation Rings */}
        {!isChatOpen && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping animation-delay-1000"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping animation-delay-2000"></div>
          </>
        )}
      </div>

      {/* AI Chat Component */}
      <AIChatInline 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        position={{ bottom: 90, right: 24 }}
      />

      {/* Custom Animation Styles */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default FloatingAIButton;