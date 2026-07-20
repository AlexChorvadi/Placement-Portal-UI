// LoginPage
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn
} from 'lucide-react';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password toggle
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Temporary navigate mock function
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        email,
        password,
        role,
      });

      // console.log('Login successful:', response.data);

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      // Temporary post-login navigation
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      }
      else if (response.data.user.role === 'company') {
        navigate('/company/dashboard');
      }
      else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        error.response?.data?.message || 'Invalid credentials or server error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden selection:bg-violet-500/30">
      
      {/* Cinematic Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl shadow-2xl p-8 sm:p-10 z-10 relative animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-violet-900/20 ring-1 ring-white/10">
            <LogIn className="w-8 h-8 text-white ml-1" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            Select your portal role and sign in to continue
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center flex items-center justify-center font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Role Selection with Icons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 text-center">
              Login As
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;

                return (
                  <label
                    key={r.id}
                    className={`cursor-pointer rounded-2xl border flex flex-col items-center justify-center py-4 px-2 transition-all duration-300 select-none ${
                      isSelected
                        ? 'bg-violet-500/10 border-violet-500/50 text-violet-400 shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)] scale-105'
                        : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={isSelected}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`mb-2.5 w-6 h-6 transition-colors ${isSelected ? 'text-violet-400' : 'text-zinc-600'}`} />
                    <span className="text-xs font-bold">{r.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="h-px bg-zinc-800/80 w-full"></div>
          </div>

          {/* Email Field */}
          <div className="group">
            <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
            />
          </div>

          {/* Password Field with Toggle */}
          <div className="group">
            <label className="block text-sm font-semibold text-zinc-400 mb-2 group-focus-within:text-violet-400 transition-colors" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-zinc-700 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-900 font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 focus:outline-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin mr-3"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Bottom Actions */}
        <div className="mt-8 pt-8 border-t border-zinc-800/80 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-zinc-400 hover:text-white font-bold transition-colors focus:outline-none"
          >
            Create an account
          </button>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-violet-400 hover:text-violet-300 font-bold transition-colors focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}