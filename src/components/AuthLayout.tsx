import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';

interface AuthLayoutProps {
  onLoginSuccess: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onLoginSuccess }) => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot_password'>('login');

  const handleNavigate = (view: 'login' | 'register' | 'forgot_password') => {
    setCurrentView(view);
  };

  if (currentView === 'register') {
    return (
      <RegisterPage 
        onRegisterSuccess={() => {
          // You could automatically log them in, or redirect to login.
          // For now, let's just trigger login success on register.
          onLoginSuccess();
        }}
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentView === 'forgot_password') {
    return (
      <ForgotPasswordPage 
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <LoginPage 
      onLoginSuccess={onLoginSuccess} 
      onNavigate={handleNavigate}
    />
  );
};
