/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all database credential fields.');
      return;
    }

    setLoading(true);

    // Simulate database lookup/validation delay
    setTimeout(() => {
      if (username === 'admin' && password === 'cvcreation') {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      } else {
        setError('Invalid username or unauthorized access token key.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute b-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-700/50 p-2 overflow-hidden">
            <img 
              src="https://phillycarrental.com/wp-content/uploads/2026/05/Untitled-design-2.png" 
              alt="Philly Car Rental Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight font-sans">
          Philly Car Rental
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400 font-mono tracking-wider uppercase">
          Enterprise Fleet Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-md py-8 px-8 sm:px-10 rounded-2xl border border-slate-800/80 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/50 rounded-lg flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-400 leading-normal font-sans">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-900/50 rounded-lg flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-emerald-400 leading-normal font-sans">
                Access authorized! Loading secure session dashboard...
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-300 font-sans tracking-wide uppercase">
                Username
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  disabled={loading || success}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-lg transition text-sm font-sans focus:outline-none"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 font-sans tracking-wide uppercase">
                Password
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  disabled={loading || success}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-lg transition text-sm font-sans focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={loading || success}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500 font-sans font-normal">Security standard AES-256</span>
              <span className="text-slate-400 font-mono">System portal V2.6</span>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex justify-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 font-sans font-semibold text-white rounded-lg transition text-sm shadow-md cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating Credentials...</span>
                </div>
              ) : success ? (
                <span>Access Granted</span>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-500 text-[11px] font-mono select-none">
        Philly Car Rental NW Hub • Secured Private Network • Unauthorized Connection Attempts Area Logged
      </div>
    </div>
  );
}
