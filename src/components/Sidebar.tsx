import React from 'react';
import { PageTab } from '../types';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  pendingCount?: number;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount = 1,
  criticalCount = 3,
}) => {
  const logoUrl = '/logo.png';

  const navItems: { id: PageTab; label: string; icon: string; badge?: string }[] = [
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
  ];

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
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
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

      {/* Radiologist User Profile (Bottom) */}
      <div 
        className="mt-auto pt-3 border-t border-white/10 cursor-pointer"
        onClick={() => onSelectTab('profile')}
      >
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-[#12263A]/80 border border-white/5 hover:border-[#00B4DB]/30 transition-colors">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9c4DjKn7sY4fba8WMrUkKG42LwG5zK3_rqudr8XFHAc27yvr-YMimNjzt_HKumorBy2o2TuOHzNMahfY1diaZSLZkckaWJnvymYwEs5Twj5BnYbrKQdH8Oxi3AtNtET9H4oSPpUgn0kGU2jq-gdCdLtUpaVYi56E5LvcmPa5Ar-uzXigEaUxdhHTfA_vO0G_dK8pbUdrTV_MsMQK3mksGU0txtf9mVY5eLo35Lbw6rbchEglvQL8exnQeA53dpTY7WIoMJwx56Sf2"
            alt="Dr. S. Chen"
            className="w-9 h-9 rounded-full object-cover border border-[#4cd6fe]/40"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              Dr. S. Chen
            </span>
            <span className="text-[10px] text-[#bcc8ce] truncate">
              Chief Radiologist
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
