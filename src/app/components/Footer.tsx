import React from 'react';
import Link from 'next/link';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Newsletter Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-400/10 backdrop-blur-sm mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                <span className="text-purple-300 text-sm font-medium">Stay Connected</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Get Aura Insights 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Delivered Weekly</span>
              </h3>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                Join our community of wellness enthusiasts. Get personalized tips, 
                exclusive features, and be the first to know about aura-enhancing updates.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all backdrop-blur-sm"
                />
                <button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
                  Join Waitlist
                </button>
              </div>
            </div>
            
            {/* Footer Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded opacity-90"></div>
                  </div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    FiMyra
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed mb-6 max-w-md">
                  Transforming wellness through intelligent technology. 
                  Your aura is your algorithm — let's make it shine brighter, together.
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-sm">100% Privacy Focused</span>
                  </div>
                </div>
              </div>
              
              {/* Product Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
                <ul className="space-y-3">
                  {[
                    { name: 'Aura Score', href: '#' },
                    { name: 'Mood Tracking', href: '#' },
                    { name: 'Nutrition Intelligence', href: '#' },
                    { name: 'AI Health Coach', href: '#' },
                    { name: 'Premium Features', href: '#' }
                  ].map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        className="text-white/60 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 transition-all duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Company Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
                <ul className="space-y-3">
                  {[
                    { name: 'About Us', href: '#' },
                    { name: 'Our Science', href: '#' },
                    { name: 'Privacy Policy', href: '#' },
                    { name: 'Terms of Service', href: '#' },
                    { name: 'Contact Support', href: '#' }
                  ].map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        className="text-white/60 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 transition-all duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Social Media & App Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-6">
                <span className="text-white/60 text-sm">Follow the Aura:</span>
                <div className="flex gap-4">
                  {[
                    { name: 'Twitter', icon: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z' },
                    { name: 'Instagram', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zm5.568 16.556c-.29 1.778-1.723 3.21-3.501 3.501-4.142.394-8.13.394-12.272 0-1.778-.29-3.21-1.723-3.501-3.501-.394-4.142-.394-8.13 0-12.272.29-1.778 1.723-3.21 3.501-3.501 4.142-.394 8.13-.394 12.272 0 1.778.29 3.21 1.723 3.501 3.501.394 4.142.394 8.13 0 12.272z' },
                    { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 bg-white/5 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 rounded-full flex items-center justify-center border border-white/10 hover:border-purple-400/30 transition-all duration-300 group"
                      aria-label={social.name}
                    >
                      <svg className="w-5 h-5 text-white/60 group-hover:text-purple-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d={social.icon}/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>© {currentYear} FiMyra</span>
                <span>•</span>
                <span>Built with ✨ and algorithms</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"></div>
      </div>
    </footer>
  );
};

export default Footer;