import React, { useEffect, useState } from 'react';
import { PageTab, ScanRecord } from '../types';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentScan?: ScanRecord;
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  onOpenUpload: () => void;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
}

interface UserProfile {
  name_full: string;
  role: string;
  specialty: string | null;
  path_avatar: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentScan,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onOpenUpload,
  lang,
  onToggleLang,
}) => {
  const logoUrl = '/logo.png';

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name_full, role, specialty, path_avatar')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Header profile error:', profileError);
          return;
        }

        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load header profile:', error);
      }
    };

    loadProfile();
  }, []);

  return (
    <header className="bg-[#0b1519]/90 backdrop-blur-md w-full h-16 border-b border-white/5 fixed top-0 right-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-6">

      {/* Mobile Brand */}
      <div className="flex items-center md:hidden gap-2">
        <img
          src={logoUrl}
          alt="FractureAI Logo"
          className="w-7 h-7 object-contain"
        />

        <span className="font-bold text-[#4cd6fe] text-base">
          FractureAI Pro
        </span>
      </div>

      {/* Search Input & Study ID Badge */}
      <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-4">
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bcc8ce] text-[20px]">
            search
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Patient ID, Scans..."
            className="w-full bg-[#0D1626] border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-[#dae4eb] placeholder-[#bcc8ce]/60 focus:outline-none focus:border-[#00B4DB] focus:ring-1 focus:ring-[#00B4DB] transition-all"
          />
        </div>

        {currentScan &&
          (activeTab === 'detect' ||
            activeTab === 'explain' ||
            activeTab === 'analyze') && (
            <div className="hidden lg:flex items-center gap-2 bg-[#007c98]/20 border border-[#00B4DB]/40 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#00B4DB] animate-pulse"></span>

              <span className="text-xs font-semibold text-[#4cd6fe]">
                Study: {currentScan.id}
              </span>
            </div>
          )}
      </div>

      {/* Action Controls & Notifications */}
      <div className="flex items-center gap-3">

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-1 text-xs font-medium rounded-full border border-white/10 hover:border-[#00B4DB]/50 text-[#bcc8ce] hover:text-white transition-colors flex items-center gap-1"
          title="Toggle Language / اللغة"
        >
          <span className="material-symbols-outlined text-sm">
            translate
          </span>

          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Upload Scan Quick Action */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center gap-1.5 btn-gradient px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm">
            add_circle
          </span>

          <span>Upload Scan</span>
        </button>

        {/* Notification Bell */}
        <button className="text-[#bcc8ce] hover:text-[#4cd6fe] p-1.5 rounded-lg hover:bg-white/5 transition-all relative">
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>

          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="text-[#bcc8ce] hover:text-[#4cd6fe] p-1.5 rounded-lg hover:bg-white/5 transition-all"
          title="Station Settings"
        >
          <span className="material-symbols-outlined text-[22px]">
            settings
          </span>
        </button>

        {/* Real User Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[#2d363b] border border-white/20 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#00B4DB]/50 transition-colors"
          onClick={() => onSelectTab('profile')}
        >
          {userProfile?.path_avatar ? (
            <img
              src={userProfile.path_avatar}
              alt={userProfile.name_full}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-[#4cd6fe] text-[20px]">
              person
            </span>
          )}
        </div>
      </div>
    </header>
  );
};