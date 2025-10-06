"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

type HeaderProps = {}

const Header: React.FC<HeaderProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-full px-6 py-3 shadow-2xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-white/80 transition-colors duration-200 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            FiMyra
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <nav>
              <ul className="flex items-center gap-8">
                <li>
                  <Link href="/" className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                    Home
                  </Link>
                </li>

                <li>
                  <a href="#" className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                    Contact
                  </a>
                </li>
              </ul>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-white/90 hover:text-white font-medium transition-colors duration-200 px-4 py-2"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-6 py-2 rounded-full transition-all duration-200"
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
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-white/90 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a
                href="#"
                className="text-white/90 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#"
                className="text-white/90 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#"
                className="text-white/90 hover:text-white font-medium transition-colors duration-200 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <Link
                  href="/login"
                  className="text-white/90 hover:text-white font-medium transition-colors duration-200 py-2 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-6 py-2 rounded-full transition-all duration-200 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
