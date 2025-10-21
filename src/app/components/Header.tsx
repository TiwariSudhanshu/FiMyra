"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

type HeaderProps = {}

const Header: React.FC<HeaderProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 w-[96%] sm:w-[95%] max-w-7xl z-50">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 shadow-2xl">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold text-white hover:text-white/80 transition-colors duration-200 flex items-center gap-2"
            >
              <Image 
                src="/logo.png" 
                alt="FiMyra Logo" 
                width={28}
                height={28}
                className="sm:w-8 sm:h-8 rounded-lg object-contain"
              />
              <span className="hidden xs:inline">FiMyra</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <nav>
                <ul className="flex items-center gap-6 lg:gap-8">
                  <li>
                    <Link href="/" className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                      Home
                    </Link>
                  </li>
                  <li>
                    <a href="#contact" className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-white/90 hover:text-white font-medium transition-colors duration-200 px-3 lg:px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold px-4 lg:px-6 py-2 rounded-full transition-all duration-200 text-sm lg:text-base shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Modal */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 md:hidden">
            <div className="backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <nav className="flex flex-col p-4">
                <Link
                  href="/"
                  className="text-white/90 hover:text-white hover:bg-white/5 font-medium transition-all duration-200 py-3 px-4 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <a
                  href="#contact"
                  className="text-white/90 hover:text-white hover:bg-white/5 font-medium transition-all duration-200 py-3 px-4 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                
                <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-white/10">
                  <Link
                    href="/login"
                    className="text-white/90 hover:text-white hover:bg-white/5 font-medium transition-all duration-200 py-3 px-4 text-center rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Header
