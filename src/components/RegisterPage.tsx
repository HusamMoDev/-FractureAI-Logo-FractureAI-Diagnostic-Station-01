import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { authService } from '../services/AuthService';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigate: (view: 'login') => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({});

  const logoUrl = '/logo.png';

  const validateForm = () => {
    const newErrors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({ fullName, email, password });
      onRegisterSuccess();
    } catch (err: any) {
      setErrors({ general: err.message || 'An error occurred during registration. Please try again.' });
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
                    <h3 className="text-sm font-semibold text-white">Join the Network</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Access advanced AI diagnostic tools</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  New accounts require administrator approval before accessing patient data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-[#0F172A]/40 backdrop-blur-sm relative">
          
          <button 
            onClick={() => onNavigate('login')}
            className="absolute top-8 left-8 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="max-w-md mx-auto mt-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400 text-sm mb-8">Register to access the FractureAI diagnostic platform.</p>
            
            {errors.general && (
              <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className={`w-full bg-[#020617]/50 border ${errors.fullName ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#00B4DB]'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00B4DB] transition-colors`}
                  placeholder="Dr. Jane Doe"
                />
                {errors.fullName && <p className="text-xs text-rose-400 ml-1 mt-1">{errors.fullName}</p>}
              </div>

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

              {/* Password Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-400 ml-1 mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className={`w-full bg-[#020617]/50 border ${errors.confirmPassword ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-[#00B4DB]'} rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00B4DB] transition-colors`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-rose-400 ml-1 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gradient py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
            
            {/* Back to Login */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <a 
                  href="#login" 
                  onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
                  className="text-[#4cd6fe] font-semibold hover:text-white transition-colors"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
