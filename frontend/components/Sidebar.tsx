import React, { useEffect, useState } from 'react';
import { PageTab } from '../types';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  pendingCount?: number;
  criticalCount?: number;
}

interface UserProfile {
  name_full: string;
  role: string;
  specialty: string | null;
  path_avatar: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount = 1,
  criticalCount = 3,
}) => {
  const logoUrl = '/logo.png';

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setProfileLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name_full, role, specialty, path_avatar')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Sidebar profile error:', profileError);
          setProfileLoading(false);
          return;
        }

        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load sidebar profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const navItems: {
    id: PageTab;
    label: string;
    icon: string;
    badge?: string;
  }[] = [
    { id: 'upload', label: 'Upload', icon: 'upload_file' },
    { id: 'detect', label: 'Detect', icon: 'biotech' },
    { id: 'analyze', label: 'Analyze', icon: 'query_stats' },
    { id: 'explain', label: 'Explain', icon: 'description' },
    { id: 'heatmap', label: 'Heatmap', icon: 'texture' },
    { id: 'measurement', label: 'Measurement', icon: 'straighten' },
    { id: 'angle', label: 'Angle', icon: 'square_foot' },
    { id: 'report', label: 'Report', icon: 'assignment' },
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'profile', label: 'My Profile', icon: 'person' },

    ...(userProfile?.role === 'admin'
      ? [
          {
            id: 'admin-management' as PageTab,
            label: 'Admin Management',
            icon: 'admin_panel_settings',
          },
        ]
      : []),
  ];

  const roleLabel =
    userProfile?.role === 'technician'
      ? 'X-ray Technologist'
      : userProfile?.role
        ? userProfile.role
        : 'User';

  return (
    <nav className="h-screen w-64 flex-shrink-0 border-r border-white/10 bg-[#172126]/80 backdrop-blur-xl shadow-xl fixed left-0 top-0 flex flex-col p-4 z-40 hidden md:flex">
      
      {/* Brand Header */}
      <div
        onClick={() => onSelectTab('dashboard')}
        className="flex items-center gap-3 mb-6 px-2 mt-2 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#00B4DB]/50 transition-colors">
          <img
            src={logoUrl}
            alt="FractureAI Logo"
            className="w-8 h-8 object-contain"
          />
        </div>

        <div>
          <h1 className="font-bold text-[#4cd6fe] tracking-tight text-[20px] leading-tight flex items-center gap-1.5">
            FractureAI
          </h1>

          <p className="text-[10px] text-[#bcc8ce] tracking-wider font-semibold uppercase">
            Diagnostic Station 01
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#4cd6fe] font-bold bg-[#007c98]/20 border border-[#00B4DB]/30 shadow-[0_0_12px_rgba(0,180,219,0.15)]'
                  : 'text-[#bcc8ce] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1"
                      : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </div>

              {item.id === 'detect' && criticalCount > 0 && (
                <span className="text-[10px] bg-[#00B4DB]/20 text-[#4cd6fe] border border-[#00B4DB]/40 px-1.5 py-0.5 rounded-full font-semibold">
                  {criticalCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Real User Profile */}
      <div
        className="mt-auto pt-3 border-t border-white/10 cursor-pointer"
        onClick={() => onSelectTab('profile')}
      >
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-[#12263A]/80 border border-white/5 hover:border-[#00B4DB]/30 transition-colors">

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#4cd6fe]/40 flex-shrink-0 bg-[#0D1626] flex items-center justify-center">
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

          {/* User Information */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              {profileLoading
                ? 'Loading...'
                : userProfile?.name_full || 'User'}
            </span>

            <span className="text-[10px] text-[#bcc8ce] truncate">
              {profileLoading ? 'Loading...' : roleLabel}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};