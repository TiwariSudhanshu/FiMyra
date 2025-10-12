'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  // OTP as individual digits for 6-box UI
  const [otpDigits, setOtpDigits] = useState<string[]>(() => Array(6).fill(''));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/forgot/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('OTP sent to your email');
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const otp = otpDigits.join('')
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/forgot/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('reset');
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('OTP verification failed');
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const otp = otpDigits.join('')
      const res = await fetch('/api/auth/forgot/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password updated — redirecting to dashboard...');
        // small delay then redirect
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('Password reset failed');
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/auth/forgot/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      });
      const data = await res.json();
      if (data.success) setSuccess('OTP resent'); else setError(data.message || 'Failed to resend');
    } catch (err) { setError('Failed to resend OTP'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-white/5 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        {success && <div className="mb-3 text-sm text-green-300">{success}</div>}

        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">First name (optional)</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="w-full mt-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50"
                placeholder="you@domain.com"
              />
            </div>
            <div>
              <button
                disabled={loading}
                className={`w-full p-3 rounded-lg text-white flex items-center justify-center space-x-2 transition-transform ${
                  loading ? 'opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">Enter 6-digit OTP</label>
              <div className="mt-2 flex gap-2 justify-between">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      if (!val && otpDigits[idx] === val) return
                      const next = [...otpDigits]
                      next[idx] = val ? val.slice(-1) : ''
                      setOtpDigits(next)
                      if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                        const prev = [...otpDigits]
                        prev[idx - 1] = ''
                        setOtpDigits(prev)
                        otpRefs.current[idx - 1]?.focus()
                      } else if (e.key === 'ArrowLeft' && idx > 0) {
                        otpRefs.current[idx - 1]?.focus()
                      } else if (e.key === 'ArrowRight' && idx < 5) {
                        otpRefs.current[idx + 1]?.focus()
                      }
                    }}
                    onPaste={e => {
                      const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                      if (!paste) return
                      const next = Array(6).fill('')
                      for (let i = 0; i < paste.length; i++) next[i] = paste[i]
                      setOtpDigits(next)
                      const focusIndex = Math.min(paste.length, 5)
                      setTimeout(() => otpRefs.current[focusIndex]?.focus(), 0)
                      e.preventDefault()
                    }}
                    className="w-[44px] h-12 text-center text-lg rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                    aria-label={`OTP digit ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={loading}
                className={`flex-1 p-3 rounded-lg text-white flex items-center justify-center space-x-2 transition-transform ${
                  loading ? 'opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>

              <button
                type="button"
                onClick={resendOtp}
                disabled={loading}
                className={`flex-1 p-3 rounded-lg text-white flex items-center justify-center space-x-2 transition-transform ${
                  loading ? 'opacity-60 cursor-not-allowed' : 'bg-yellow-600 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                  </svg>
                ) : (
                  <span>Resend</span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">New password</label>
              <input required value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" className="w-full mt-1 p-3 rounded bg-white/5" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Confirm password</label>
              <input required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" className="w-full mt-1 p-3 rounded bg-white/5" />
            </div>
            <div>
              <button disabled={loading} className="w-full p-3 bg-blue-600 rounded">Update password</button>
            </div>
          </form>
        )}

        <div className="mt-4 text-sm text-gray-400">
          <a href="/login" className="text-blue-300">Back to login</a>
        </div>
      </div>
    </div>
  );
}
