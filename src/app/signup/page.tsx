'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      // DIRECT REGISTRATION - OTP COMMENTED OUT
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Registration failed');
      }

      /* OTP VERIFICATION - COMMENTED OUT FOR NOW
      // Send OTP to email
      const response = await fetch('/api/auth/verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          name: formData.name 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP sent to your email! Please check your inbox.');
        setShowOtpModal(true);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
      */
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP VERIFICATION FUNCTION - DISABLED (empty function for TypeScript)
  const handleVerifyOtp = async () => {
    return; // OTP verification disabled
  };
  
  /* ORIGINAL OTP FUNCTION - COMMENTED OUT
  const handleVerifyOtpOriginal = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifying(true);
    setOtpError('');

    try {
      // Verify OTP
      const verifyResponse = await fetch('/api/auth/verify/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          otp 
        }),
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        // OTP verified, now register the user
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });

        const registerData = await registerResponse.json();

        if (registerData.success) {
          setSuccess('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setOtpError(registerData.message || 'Registration failed');
        }
      } else {
        setOtpError(verifyData.message || 'Invalid OTP');
      }
    } catch (error) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };
  */

  // RESEND OTP FUNCTION - DISABLED (empty function for TypeScript)
  const handleResendOtp = async () => {
    return; // Resend OTP disabled
  };
  
  /* ORIGINAL RESEND FUNCTION - COMMENTED OUT
  const handleResendOtpOriginal = async () => {
    setLoading(true);
    setOtpError('');

    try {
      const response = await fetch('/api/auth/verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          name: formData.name 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtp('');
        setSuccess('New OTP sent to your email!');
      } else {
        setOtpError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      if (result?.error) {
        setError('Google signup failed. Please try again.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      setError('Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 left-32 w-96 h-96 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="min-h-screen flex">
            {/* Left Side - Logo Section */}
            <div className="hidden lg:flex lg:flex-1 items-center justify-center px-8 xl:px-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Image 
                    src="/logo.png" 
                    alt="FiMyra Logo" 
                    width={64}
                    height={64}
                    className="rounded-2xl shadow-2xl"
                  />
                  <Link href="/" className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    FiMyra
                  </Link>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Begin Your Transformation
                </h1>
                <p className="text-xl text-white/70 max-w-md mx-auto">
                  Join thousands who've discovered their perfect wellness balance with AI guidance
                </p>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 lg:flex-1 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <Image 
                  src="/logo.png" 
                  alt="FiMyra Logo" 
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
                <Link href="/" className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  FiMyra
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-center text-4xl font-extrabold text-white mb-3">
                Begin Your Journey
              </h2>
              <p className="text-center text-lg text-white/70 mb-8">
                Create your wellness account
              </p>
              <p className="text-center text-sm text-white/60">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-300 hover:to-blue-300 transition-all"
                >
                  Sign in here
                </Link>
              </p>
            </div>
            
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-xl text-green-300 text-sm backdrop-blur-sm">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-4 py-4 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/15 transition-all backdrop-blur-sm text-base"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-4 py-4 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/15 transition-all backdrop-blur-sm text-base"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-4 py-4 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/15 transition-all backdrop-blur-sm text-base"
                    placeholder="Enter your password (min 6 characters)"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-4 py-4 bg-white/10 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 focus:bg-white/15 transition-all backdrop-blur-sm text-base"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-700 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-3 block text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      className="w-full inline-flex justify-center py-4 px-6 border border-white/20 rounded-xl shadow-lg bg-white/10 text-base font-medium text-white/90 hover:bg-white/15 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {loading ? 'Signing up...' : 'Continue with Google'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* OTP Verification Modal - COMMENTED OUT FOR NOW */}
    {false && showOtpModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <button
            onClick={() => setShowOtpModal(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Verify Your Email</h3>
            <p className="text-white/70 text-sm">
              We've sent a 6-digit code to<br />
              <span className="font-semibold text-purple-400">{formData.email}</span>
            </p>
          </div>

          {otpError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg text-red-300 text-sm">
              {otpError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                Enter OTP Code
              </label>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value) {
                        const newOtp = otp.split('');
                        newOtp[index] = value;
                        setOtp(newOtp.join(''));
                        
                        // Auto-focus next input
                        if (index < 5) {
                          document.getElementById(`otp-${index + 1}`)?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        const newOtp = otp.split('');
                        if (!otp[index] && index > 0) {
                          // If current box is empty, go to previous box
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        } else {
                          // Clear current box
                          newOtp[index] = '';
                          setOtp(newOtp.join(''));
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      setOtp(pastedData);
                      if (pastedData.length === 6) {
                        document.getElementById('otp-5')?.focus();
                      } else if (pastedData.length > 0) {
                        document.getElementById(`otp-${Math.min(pastedData.length, 5)}`)?.focus();
                      }
                    }}
                    className="w-12 h-14 sm:w-14 sm:h-16 bg-white/10 border-2 border-white/20 placeholder-white/50 text-white text-center text-2xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 focus:bg-white/15 transition-all backdrop-blur-sm"
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={verifying || otp.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {verifying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify & Create Account'
              )}
            </button>

            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default SignupPage;