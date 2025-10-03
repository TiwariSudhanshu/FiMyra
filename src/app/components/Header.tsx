import React from 'react';
import Link from 'next/link';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-200">
            FiMyra
          </Link>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4 ml-8">
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 px-4 py-2"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 inline-block"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;