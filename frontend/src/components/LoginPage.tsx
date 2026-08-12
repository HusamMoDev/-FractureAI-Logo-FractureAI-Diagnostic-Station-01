import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { authService } from '../services/AuthService';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigate?: (view: 'register' | 'forgot_password') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const logoUrl = '/logo.png';

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({ email, password });
      onLoginSuccess();
    } catch (err: any) {
      setErrors({ general: err.message || 'An error occurred during login. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen medical-net-bg flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="glass-card w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col md:flex-row relative z-10 ai-glow">
        
        {/* Left Side - Branding & Info */}
        <div className="w-full md:w-5/12 bg-[#020617]/60 p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00B4DB]/10 to-transparent opacity-50"></div>
          
          <div className="relative z-10 flex flex-col gap-6 h-full">
            <div>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-[#00B4DB]/30 shadow-[0_0_15px_rgba(0,180,219,0.2)] mb-6">
                <img src={logoUrl} alt="FractureAI Logo" className="w-10 h-10 object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-[#4cd6fe] tracking-tight mb-2">FractureAI</h1>
              <p className="text-sm text-[#bcc8ce] tracking-widest font-semibold uppercase">Diagnostic Station 01</p>
            </div>
            
            <div className="mt-auto pt-12 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 rounded-lg bg-[#00B4DB]/20 border border-[#00B4DB]/30 text-[#4cd6fe]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">HIPAA Compliant</h3>
                    <p className="text-xs text-slate-400 mt-0.5">End-to-end encrypted medical data</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Authorized personnel only. All access is logged and monitored for compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm mb-8">Sign in to access diagnostic tools and patient records.</p>
            
            {errors.general && (
              <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-[#020617]/50 border ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#00B4DB]'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00B4DB] transition-colors`}
                  placeholder="doctor@hospital.com"
                />
                {errors.email && <p className="text-xs text-rose-400 ml-1 mt-1">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`w-full bg-[#020617]/50 border ${errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#00B4DB]'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00B4DB] transition-colors pr-10`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-400 ml-1 mt-1">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="appearance-none w-4 h-4 rounded border border-white/20 bg-white/5 checked:bg-[#00B4DB] checked:border-[#00B4DB] transition-colors cursor-pointer"
                    />
                    {rememberMe && (
                      <svg className="absolute w-3 h-3 text-white pointer-events-none" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Remember me</span>
                </label>

                <a 
                  href="#forgot-password" 
                  onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('forgot_password'); }} 
                  className="text-xs text-[#4cd6fe] hover:text-white transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gradient py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
            
            {/* Create Account Link */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <a 
                  href="#register" 
                  onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('register'); }}
                  className="text-[#4cd6fe] font-semibold hover:text-white transition-colors"
                >
                  Create Account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
