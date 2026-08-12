import React, { useState } from 'react';
import { Loader2, AlertCircle, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/AuthService';

interface ForgotPasswordPageProps {
  onNavigate: (view: 'login') => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});

  const logoUrl = '/logo.png';

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setErrors({ general: err.message || 'An error occurred. Please try again.' });
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
                    <h3 className="text-sm font-semibold text-white">Secure Recovery</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Identity verification required</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Password reset links expire after 30 minutes for security purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-[#0F172A]/40 backdrop-blur-sm relative flex flex-col justify-center">
          
          <button 
            onClick={() => onNavigate('login')}
            className="absolute top-8 left-8 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>

          <div className="max-w-md mx-auto w-full mt-6">
            
            {!isSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-slate-400 text-sm mb-8">Enter your email address and we'll send you instructions to reset your password.</p>
                
                {errors.general && (
                  <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <span className="text-sm">{errors.general}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-gradient py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  We've sent password reset instructions to <br/>
                  <span className="font-semibold text-white">{email}</span>
                </p>
                
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full btn-ghost py-3.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Return to Login
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
