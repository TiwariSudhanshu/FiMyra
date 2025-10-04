'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatInlineProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { bottom: number; right: number };
}

const AIChatInline: React.FC<AIChatInlineProps> = ({ 
  isOpen, 
  onClose, 
  position = { bottom: 80, right: 24 } 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi there! 👋 I\'m your FiMyra AI assistant. I can help you with nutrition advice, mood tracking insights, and health goal planning. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);
    setIsLoading(true);

    // Simulate AI response with realistic delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      setIsLoading(false);
    }, Math.random() * 2000 + 1000); // 1-3 second delay
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    const responses = {
      nutrition: [
        'Great question about nutrition! Based on your profile, I recommend focusing on balanced meals with lean proteins, complex carbohydrates, and plenty of vegetables. Would you like me to suggest some specific meal ideas? 🥗',
        'Nutrition is key to feeling your best! Try incorporating more colorful vegetables, omega-3 rich foods, and staying hydrated. What specific nutrition goals are you working on?',
      ],
      mood: [
        'Mood and energy are closely connected to what you eat! Foods rich in omega-3s, complex carbs, and B-vitamins can help stabilize your mood. Have you noticed any patterns between your meals and how you feel? 😊',
        'Your emotional well-being matters! Regular exercise, good sleep, and mindful eating can significantly impact your mood. What aspect would you like to focus on first?',
      ],
      weight: [
        'Weight management is about creating sustainable habits. I can help you track your progress and suggest personalized strategies based on your Aura Score. What are your current goals? 💪',
        'Healthy weight management combines proper nutrition, regular activity, and adequate rest. Let me help you create a balanced approach that works for your lifestyle!',
      ],
      aura: [
        'Your Aura Score reflects your overall health balance! It takes into account your nutrition, mood, sleep, and activity. Currently, you\'re at 85 - that\'s great! Want tips to reach 90+? ✨',
        'I see your Aura Score is 85! This means you\'re doing well with your health habits. Focus on consistency in sleep, hydration, and movement to boost it even higher!',
      ],
      default: [
        'That\'s a great question! I\'m here to help with nutrition advice, mood tracking, health goals, and understanding your Aura Score. Could you tell me more about what specific area you\'d like help with? 🤔',
        'I\'m excited to help you on your wellness journey! Whether it\'s meal planning, mood insights, or goal setting, I\'m here for you. What would you like to explore today?',
        'Thanks for reaching out! I can assist with personalized nutrition recommendations, activity suggestions, and wellness insights. What\'s on your mind?',
      ]
    };
    
    if (input.includes('nutrition') || input.includes('food') || input.includes('eat') || input.includes('meal')) {
      return responses.nutrition[Math.floor(Math.random() * responses.nutrition.length)];
    }
    
    if (input.includes('mood') || input.includes('feeling') || input.includes('energy') || input.includes('emotion')) {
      return responses.mood[Math.floor(Math.random() * responses.mood.length)];
    }
    
    if (input.includes('weight') || input.includes('lose') || input.includes('gain') || input.includes('fitness')) {
      return responses.weight[Math.floor(Math.random() * responses.weight.length)];
    }
    
    if (input.includes('aura') || input.includes('score')) {
      return responses.aura[Math.floor(Math.random() * responses.aura.length)];
    }
    
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: "🍎 Meal Ideas", action: () => setInputText("Can you suggest some healthy meal ideas?") },
    { label: "📊 Aura Score", action: () => setInputText("How can I improve my Aura Score?") },
    { label: "💧 Hydration Tips", action: () => setInputText("Help me stay hydrated") },
    { label: "😊 Mood Support", action: () => setInputText("I'm feeling low on energy today") }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Chat Container */}
      <div 
        className="fixed z-50 w-96 h-[500px] bg-gradient-to-br from-gray-900/95 to-blue-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden"
        style={{ 
          bottom: `${position.bottom}px`, 
          right: `${position.right}px`,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transition: 'all 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold">FiMyra AI Assistant</h3>
              <p className="text-white/60 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Online • Ready to help
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-black/10">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[280px] px-4 py-3 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/10'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-white/60 text-xs">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-white/10">
            <p className="text-white/60 text-xs mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-black/20 to-transparent">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 transition-all backdrop-blur-sm text-sm disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatInline;