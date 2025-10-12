'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AIHealthCoachProps {
  userName?: string;
}

const AIHealthCoach: React.FC<AIHealthCoachProps> = ({ userName = 'User' }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<{
    id: string;
    text: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: Date;
  }[]>([
    {
      id: '1',
      text: `Hi ${userName}! I'm your AI Health Coach — ask me for meal ideas, workouts, or quick tips.`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickLoadingIndex, setQuickLoadingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Convert simple markdown-like text to JSX: supports headings (##), unordered lists (- or *), and numbered lists (1.)
  const renderMessageText = (text: string) => {
    const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
    let listBuffer: string[] | null = null;
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (!listBuffer || !listType) return;
      if (listType === 'ul') {
        elements.push(
          <ul className="list-disc pl-5 mt-2 mb-2 text-sm text-white/90" key={elements.length}>
            {listBuffer.map((item, i) => (
              <li key={i} className="mb-1">{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol className="list-decimal pl-5 mt-2 mb-2 text-sm text-white/90" key={elements.length}>
            {listBuffer.map((item, i) => (
              <li key={i} className="mb-1">{item}</li>
            ))}
          </ol>
        );
      }
      listBuffer = null;
      listType = null;
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        // blank line -> flush list and add spacing
        flushList();
        elements.push(<div key={elements.length} className="my-2" />);
        continue;
      }

      // Heading level 2
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={elements.length} className="text-lg font-semibold text-white mb-2">{line.replace(/^##\s+/, '')}</h3>
        );
        continue;
      }

      // Heading level 3
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={elements.length} className="text-sm font-semibold text-white/95 mb-2">{line.replace(/^###\s+/, '')}</h4>
        );
        continue;
      }

      // Unordered list
      if (/^[-*]\s+/.test(line)) {
        const item = line.replace(/^[-*]\s+/, '');
        if (listType === 'ol') {
          // flush previous ordered list
          flushList();
        }
        listType = 'ul';
        listBuffer = listBuffer ?? [];
        listBuffer.push(item);
        continue;
      }

      // Ordered list (e.g., 1. )
      if (/^\d+\.\s+/.test(line)) {
        const item = line.replace(/^\d+\.\s+/, '');
        if (listType === 'ul') {
          flushList();
        }
        listType = 'ol';
        listBuffer = listBuffer ?? [];
        listBuffer.push(item);
        continue;
      }

      // Regular paragraph line
      flushList();
      elements.push(
        <p key={elements.length} className="text-sm text-white/90 leading-relaxed mb-2">
          {line}
        </p>
      );
    }

    // flush any trailing list
    flushList();
    return elements;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const resp = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage.text })
      });
      const data = await resp.json();
      const aiText = data?.text ?? data?.error ?? 'Sorry, I could not get a response.';

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: String(aiText),
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: 'An error occurred while contacting the AI service.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    { text: "🍎 Meal suggestions", time: "Quick" },
    { text: "💪 Workout tips", time: "Quick" },
    { text: "😌 Mood support", time: "Quick" },
    { text: "📊 Progress review", time: "Quick" }
  ];

  const handleQuickAction = async (actionText: string, index: number) => {
    if (quickLoadingIndex !== null) return; // one quick action at a time
    setQuickLoadingIndex(index);
    setIsTyping(true);

    const userMessage = {
      id: Date.now().toString(),
      text: actionText,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const resp = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: actionText })
      });
      const data = await resp.json();
      const aiText = data?.text ?? data?.error ?? 'Sorry, no response.';

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: String(aiText),
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Failed to reach AI service.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
      setQuickLoadingIndex(null);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white">AI Health Coach</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm font-medium">Online</span>
        </div>
      </div>
      
      {/* Coach Messages */}
  <div className="space-y-4 mb-8 h-96 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${m.sender === 'user' ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white' : 'bg-white/5 text-white border border-white/6'}`}>
              {m.sender === 'ai' || m.sender === 'system' ? (
                <div className="text-sm leading-relaxed">{renderMessageText(m.text)}</div>
              ) : (
                <p className="text-sm leading-relaxed">{m.text}</p>
              )}
              <span className="text-xs opacity-70 mt-2 block">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-3 rounded-2xl max-w-[60%]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <span className="text-white/60 text-xs">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your AI coach..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 focus:bg-white/15 transition-all backdrop-blur-sm disabled:opacity-50"
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-white/60 text-sm mb-3">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.text, index)}
              disabled={quickLoadingIndex !== null}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-sm transition-all border border-white/10 hover:border-white/20 disabled:opacity-50"
            >
              {quickLoadingIndex === index ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIHealthCoach;