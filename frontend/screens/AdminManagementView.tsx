import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type PendingUser = {
  id: string;
  name_full: string | null;
  role: string | null;
  specialty: string | null;
  phone: string | null;
  number_license: string | null;
  active_is: boolean;
  id_clinic: string | null;
  at_created: string;
};

type Clinic = {
  id: string;
  name: string;
  city: string | null;
  active_is: boolean;
};

const AdminManagementView: React.FC = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinics, setSelectedClinics] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in.');
      }

      const [
        pendingUsersResult,
        clinicsResult,
      ] = await Promise.all([
        supabase.rpc('admin_get_pending_users'),
        supabase.rpc('admin_get_clinics'),
      ]);

      if (pendingUsersResult.error) {
        throw pendingUsersResult.error;
      }

      if (clinicsResult.error) {
        throw clinicsResult.error;
      }

      setUsers(
        (pendingUsersResult.data || []) as PendingUser[]
      );

      setClinics(
        (clinicsResult.data || []) as Clinic[]
      );
    } catch (err: any) {
      console.error(
        'Admin management error:',
        err
      );

      setError(
        err?.message ||
          'Failed to load administrator data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const approveUser = async (
    userId: string
  ) => {
    const clinicId =
      selectedClinics[userId];

    if (!clinicId) {
      setError(
        'Please select a clinic before approving the user.'
      );
      return;
    }

    setApprovingId(userId);
    setError('');
    setMessage('');

    try {
      const { error: approveError } =
        await supabase.rpc(
          'admin_approve_user',
          {
            target_user_id: userId,
            target_clinic_id: clinicId,
          }
        );

      if (approveError) {
        throw approveError;
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== userId
        )
      );

      setSelectedClinics((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });

      setMessage(
        'User approved and clinic assigned successfully.'
      );
    } catch (err: any) {
      console.error(
        'Approve user error:',
        err
      );

      setError(
        err?.message ||
          'Failed to approve the user.'
      );
    } finally {
      setApprovingId(null);
    }
  };

  const formatDate = (
    date: string
  ) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date';
    }

    return parsedDate.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-[#07111f] p-6 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="mb-2 text-sm font-medium text-cyan-400">
                ADMINISTRATION
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Review new accounts, assign a clinic,
                and approve access.
              </p>
            </div>

            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-5">
            <p className="text-sm text-slate-400">
              Pending Approval
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-5">
            <p className="text-sm text-slate-400">
              Active Clinics
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {clinics.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1728] p-5">
            <p className="text-sm text-slate-400">
              Access Control
            </p>

            <p className="mt-2 text-sm font-semibold text-emerald-400">
              Administrator Only
            </p>
          </div>

        </div>

        {/* Pending Users */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b1728]">

          <div className="border-b border-slate-800 px-6 py-5">

            <h2 className="text-lg font-semibold">
              Pending User Accounts
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              These accounts are waiting for administrator approval.
            </p>

          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-400">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                ✓
              </div>

              <h3 className="text-lg font-semibold text-white">
                No pending users
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-400">
                There are currently no user accounts waiting for approval.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-6 transition hover:bg-white/[0.02]"
                >

                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                    {/* User Information */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-lg font-bold text-cyan-400">
                          {(user.name_full || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-semibold text-white">
                            {user.name_full ||
                              'Unnamed User'}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            Registered{' '}
                            {formatDate(
                              user.at_created
                            )}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">

                            <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
                              Pending
                            </span>

                            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                              {user.role ||
                                'technician'}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">

                        <div>
                          <p className="text-xs text-slate-500">
                            Specialty
                          </p>

                          <p className="mt-1 text-slate-300">
                            {user.specialty ||
                              'Not provided'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            License Number
                          </p>

                          <p className="mt-1 text-slate-300">
                            {user.number_license ||
                              'Not provided'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Phone
                          </p>

                          <p className="mt-1 text-slate-300">
                            {user.phone ||
                              'Not provided'}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Clinic Assignment */}
                    <div className="w-full xl:max-w-sm">

                      <label className="mb-2 block text-xs font-medium text-slate-400">
                        Assign Clinic
                      </label>

                      <select
                        value={
                          selectedClinics[
                            user.id
                          ] || ''
                        }
                        onChange={(event) =>
                          setSelectedClinics(
                            (current) => ({
                              ...current,
                              [user.id]:
                                event.target.value,
                            })
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-[#07111f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                      >

                        <option value="">
                          Select a clinic...
                        </option>

                        {clinics.map(
                          (clinic) => (
                            <option
                              key={clinic.id}
                              value={clinic.id}
                            >
                              {clinic.name}
                              {clinic.city
                                ? ` — ${clinic.city}`
                                : ''}
                            </option>
                          )
                        )}

                      </select>

                      <button
                        onClick={() =>
                          void approveUser(
                            user.id
                          )
                        }
                        disabled={
                          approvingId ===
                            user.id ||
                          !selectedClinics[
                            user.id
                          ]
                        }
                        className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {approvingId ===
                        user.id
                          ? 'Approving...'
                          : 'Approve & Assign Clinic'}
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminManagementView;