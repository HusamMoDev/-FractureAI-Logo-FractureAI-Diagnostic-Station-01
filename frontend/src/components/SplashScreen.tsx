import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const logoUrl = '/logo.png';

  useEffect(() => {
    // 1. Text fades in after a short delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 400);

    // 2. Loader fades in after text
    const loaderTimer = setTimeout(() => {
      setShowLoader(true);
    }, 1000);

    // 3. Start fading out the entire screen
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    // 4. Trigger onComplete to unmount
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2700); // 500ms for fade out transition

    return () => {
      clearTimeout(textTimer);
      clearTimeout(loaderTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#020617] medical-net-bg flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#00B4DB]/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with subtle entrance scale/fade */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden bg-white/5 flex items-center justify-center border border-[#00B4DB]/30 shadow-[0_0_30px_rgba(0,180,219,0.2)] mb-8 animate-[logoEntrance_1s_ease-out_forwards]">
          <img src={logoUrl} alt="FractureAI Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>

        {/* Text Section with staggered fade in */}
        <div 
          className={`text-center flex flex-col items-center transition-all duration-700 ease-out transform ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#4cd6fe] tracking-tight mb-3 drop-shadow-[0_0_10px_rgba(76,214,254,0.4)]">
            FractureAI
          </h1>
          <p className="text-sm md:text-base text-[#bcc8ce] tracking-[0.3em] font-semibold uppercase">
            Diagnostic Station 01
          </p>
        </div>

        {/* Minimal Loader */}
        <div 
          className={`absolute -bottom-24 transition-opacity duration-700 ease-in-out ${
            showLoader ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-3 text-[#00B4DB]/70">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs font-medium tracking-wider uppercase">Initializing System</span>
          </div>
        </div>
      </div>
      
      {/* Custom Keyframes for Logo */}
      <style>{`
        @keyframes logoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[logoEntrance_1s_ease-out_forwards\\] {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};
