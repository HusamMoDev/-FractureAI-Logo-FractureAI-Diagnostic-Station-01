import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  onLogout: () => void;
}

interface UserProfile {
  name_full: string;
  role: string;
  specialty: string | null;
  path_avatar: string | null;
  email: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setLoading(true);
        setProfileError(null);

        // 1. Get the currently authenticated Supabase user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error('No authenticated user found.');
        }

        // 2. Get the user's profile from public.profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name_full, role, specialty, path_avatar')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // 3. Combine Auth email with profile information
        setCurrentUser({
          name_full: profile.name_full,
          role: profile.role,
          specialty: profile.specialty,
          path_avatar: profile.path_avatar,
          email: user.email || '',
        });
      } catch (error) {
        console.error('Failed to load current user profile:', error);
        setProfileError('Unable to load your profile information.');
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 pb-12 max-w-3xl mx-auto">
        <div className="card-bg rounded-xl p-8 flex flex-col items-center justify-center border border-white/10 text-center">
          <span className="material-symbols-outlined text-4xl text-[#00B4DB] animate-spin">
            progress_activity
          </span>
          <p className="text-[#bcc8ce] text-sm mt-4">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError || !currentUser) {
    return (
      <div className="space-y-6 pb-12 max-w-3xl mx-auto">
        <div className="card-bg rounded-xl p-8 border border-red-500/20 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400">
            error
          </span>

          <p className="text-red-300 text-sm mt-4">
            {profileError || 'Profile information is unavailable.'}
          </p>
        </div>
      </div>
    );
  }

  // Convert role into a readable display format
  const displayRole =
    currentUser.role.charAt(0).toUpperCase() +
    currentUser.role.slice(1);

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header Area */}
      <div className="card-bg rounded-xl p-8 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B4DB]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4cd6fe]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-24 h-24 rounded-full bg-[#172126] border-2 border-[#00B4DB]/40 overflow-hidden mb-4 z-10 shadow-[0_0_20px_rgba(0,180,219,0.2)]">
          {currentUser.path_avatar ? (
            <img
              src={currentUser.path_avatar}
              alt={currentUser.name_full}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#4cd6fe]">
              <span className="material-symbols-outlined text-4xl">
                person
              </span>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-white z-10">
          {currentUser.name_full}
        </h2>

        <p className="text-[#bcc8ce] text-sm z-10">
          {currentUser.specialty || displayRole}
        </p>

        <p className="text-[#00B4DB] text-xs font-mono mt-2 z-10 bg-[#00B4DB]/10 px-3 py-1 rounded-full border border-[#00B4DB]/20">
          {currentUser.email || 'No email available'}
        </p>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-bg rounded-xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-[#4cd6fe] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              badge
            </span>
            Personal Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                Full Name
              </label>

              <div className="bg-[#0D1626] border border-white/5 rounded-lg p-3 text-sm text-white">
                {currentUser.name_full}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                Email Address
              </label>

              <div className="bg-[#0D1626] border border-white/5 rounded-lg p-3 text-sm text-white">
                {currentUser.email || 'No email available'}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                Specialty
              </label>

              <div className="bg-[#0D1626] border border-white/5 rounded-lg p-3 text-sm text-white">
                {currentUser.specialty || 'Not specified'}
              </div>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-6 border border-white/10">
          <h3 className="text-sm font-semibold text-[#4cd6fe] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              verified_user
            </span>
            Security
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                Account Role
              </label>

              <div className="bg-[#0D1626] border border-white/5 rounded-lg p-3 text-sm text-white flex items-center justify-between">
                <span>{displayRole}</span>

                <span className="material-symbols-outlined text-[#00B4DB] text-[18px]">
                  shield
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                Session Status
              </label>

              <div className="bg-[#0D1626] border border-white/5 rounded-lg p-3 text-sm text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active and Secured
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all font-semibold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">
            logout
          </span>
          Logout
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-bg border border-red-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined">logout</span>
                <h3 className="text-base font-bold text-white">
                  Confirm Logout
                </h3>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-[#bcc8ce] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-[#bcc8ce]">
              Are you sure you want to log out of your session? You will need
              to sign in again to access the diagnostic station.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#bcc8ce] hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmLogout}
                className="px-5 py-2 rounded-lg font-semibold text-xs bg-red-500/80 text-white hover:bg-red-500 shadow-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;