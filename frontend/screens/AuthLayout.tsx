import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ShieldCheck, X, Sun, Moon } from 'lucide-react';

interface AuthLayoutProps {
  onLoginSuccess: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  onLoginSuccess,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);

  const handleNavigate = (view: 'login' | 'register' | 'forgot_password') => {
    setCurrentView(view);
  };

  const handleRegisterSuccess = (noticeMessage?: string) => {
    setRegistrationNotice(
      noticeMessage ||
        'Account created successfully. Your account is pending administrator approval before you can sign in.'
    );
    setCurrentView('login');
  };

  const themeToggleButton = onToggleTheme ? (
    <button
      type="button"
      onClick={onToggleTheme}
      className="fixed top-5 right-5 z-50 px-3 py-1.5 rounded-full border border-white/15 bg-[#0D1626]/80 backdrop-blur-md text-xs font-semibold text-[#bcc8ce] hover:text-white hover:border-[#00B4DB]/60 shadow-lg transition-all flex items-center gap-1.5"
      title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={15} className="text-amber-400" />
          <span>Day Mode</span>
        </>
      ) : (
        <>
          <Moon size={15} className="text-sky-600" />
          <span>Night Mode</span>
        </>
      )}
    </button>
  ) : null;

  if (currentView === 'register') {
    return (
      <div className="relative">
        {themeToggleButton}
        <RegisterPage 
          onRegisterSuccess={handleRegisterSuccess}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  if (currentView === 'forgot_password') {
    return (
      <div className="relative">
        {themeToggleButton}
        <ForgotPasswordPage 
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {themeToggleButton}
      {registrationNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] animate-in fade-in slide-in-from-top-4">
          <div className="p-4 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="shrink-0 mt-0.5 text-emerald-400" />
              <div className="text-sm">
                <span className="font-semibold block text-emerald-200">Registration Submitted</span>
                <span className="text-slate-300 text-xs mt-0.5 block">{registrationNotice}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRegistrationNotice(null)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Dismiss notice"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <LoginPage 
        onLoginSuccess={onLoginSuccess} 
        onNavigate={(view) => {
          setRegistrationNotice(null);
          handleNavigate(view);
        }}
      />
    </div>
  );
};
