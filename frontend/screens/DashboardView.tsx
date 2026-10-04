import React from 'react';
import { ScanRecord, PageTab } from '../types';

interface DashboardViewProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onNavigateTab: (tab: PageTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scans,
  onSelectScan,
  onNavigateTab,
}) => {
  // ============================================
  // Dashboard statistics from real ScanRecord data
  // ============================================

  const today = new Date().toISOString().split('T')[0];

  const scansToday = scans.filter((scan) => scan.date === today).length;

  const criticalScans = scans.filter(
    (scan) => scan.status === 'Critical'
  ).length;

  const pendingScans = scans.filter(
    (scan) =>
      scan.status === 'Pending' ||
      scan.primaryFinding.toLowerCase().includes('pending')
  ).length;

  const analyzedScans = scans.filter(
    (scan) =>
      scan.status !== 'Pending' &&
      !scan.primaryFinding.toLowerCase().includes('pending')
  );

  const confidenceValues = analyzedScans
    .map((scan) => scan.confidence)
    .filter(
      (confidence): confidence is number =>
        typeof confidence === 'number' && confidence > 0
    );

  const averageConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum, value) => sum + value, 0) /
        confidenceValues.length
      : null;

  // ============================================
  // Chart data
  // ============================================

  const chartScans = scans
    .filter(
      (scan) =>
        typeof scan.confidence === 'number' &&
        scan.confidence > 0
    )
    .slice(0, 8)
    .reverse();

  const chartValues =
    chartScans.length > 0
      ? chartScans.map((scan) => ({
          value: Math.max(5, Math.min(100, scan.confidence)),
          label: `${Math.round(scan.confidence)}%`,
        }))
      : [];

  return (
    <div className="space-y-6 pb-12">

      {/* ============================================
          Top Stats Cards
      ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Scans Today */}
        <div className="card-bg rounded-xl p-6 flex items-center gap-4 hover:border-[#00B4DB]/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-[#172126] flex items-center justify-center text-[#4cd6fe]">
            <span className="material-symbols-outlined text-2xl">
              medical_information
            </span>
          </div>

          <div>
            <p className="text-sm text-[#bcc8ce]">
              Total Scans Today
            </p>

            <h3 className="text-2xl font-semibold text-white mt-0.5">
              {scansToday}
            </h3>
          </div>
        </div>

        {/* Fractures Detected */}
        <div className="card-bg rounded-xl p-6 flex items-center gap-4 ai-glow hover:border-[#00B4DB]/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-[#00b4db]/20 flex items-center justify-center text-[#4cd6fe]">
            <span
              className="material-symbols-outlined text-2xl text-[#00B4DB]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
          </div>

          <div>
            <p className="text-sm text-[#bcc8ce]">
              Fractures Detected
            </p>

            <h3 className="text-2xl font-semibold text-white mt-0.5">
              {criticalScans}
            </h3>
          </div>
        </div>

        {/* Analysis Accuracy */}
        <div className="card-bg rounded-xl p-6 flex items-center gap-4 hover:border-[#00B4DB]/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-[#172126] flex items-center justify-center text-[#78d2f1]">
            <span className="material-symbols-outlined text-2xl">
              troubleshoot
            </span>
          </div>

          <div>
            <p className="text-sm text-[#bcc8ce]">
              Analysis Accuracy
            </p>

            <h3 className="text-2xl font-semibold text-white mt-0.5">
              {averageConfidence !== null
                ? `${averageConfidence.toFixed(1)}%`
                : '—'}
            </h3>
          </div>
        </div>
      </div>

      {/* ============================================
          Main Work Area
      ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">

        {/* ============================================
            Recent Scans Pipeline
        ============================================ */}
        <div className="lg:col-span-8 card-bg rounded-xl flex flex-col overflow-hidden">

          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#172126]/40">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00B4DB]">
                view_list
              </span>

              <span>Recent Scans Pipeline</span>
            </h2>

            <button
              onClick={() => onNavigateTab('database')}
              className="text-xs text-[#4cd6fe] hover:text-[#00B4DB] flex items-center gap-1 font-medium transition-colors"
            >
              View All

              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-x-auto p-2">

            {scans.length === 0 ? (
              <div className="h-full min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-600">
                    medical_information
                  </span>

                  <p className="mt-3 text-sm text-[#bcc8ce]">
                    No scans available
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Cases from Supabase will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="border-b border-white/5 text-[#bcc8ce] text-xs font-semibold uppercase tracking-wider">

                    <th className="p-3">
                      Patient ID
                    </th>

                    <th className="p-3">
                      Modality
                    </th>

                    <th className="p-3">
                      Region
                    </th>

                    <th className="p-3">
                      AI Status
                    </th>

                    <th className="p-3">
                      Confidence
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {scans.slice(0, 5).map((scan) => {

                    const isCritical =
                      scan.status === 'Critical';

                    const isPending =
                      scan.status === 'Pending' ||
                      scan.primaryFinding
                        .toLowerCase()
                        .includes('pending');

                    return (
                      <tr
                        key={scan.id}
                        onClick={() => {
                          onSelectScan(scan);
                          onNavigateTab('detect');
                        }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                      >

                        {/* Patient MRN instead of Case UUID */}
                        <td className="p-3 font-mono text-xs font-semibold text-white group-hover:text-[#4cd6fe]">
                          {scan.mrn || scan.patientName || scan.id}
                        </td>

                        <td className="p-3 text-xs text-[#bcc8ce]">
                          {scan.modality}
                        </td>

                        <td className="p-3 text-xs text-white">
                          {scan.region}
                        </td>

                        <td className="p-3">

                          {isCritical ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00B4DB]/20 text-[#00B4DB] text-xs font-semibold border border-[#00B4DB]/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4DB] animate-pulse"></span>
                              Critical
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#9da5ba]/20 text-[#bec6dd] text-xs font-semibold border border-[#bec6dd]/30">
                              Pending

                              <span className="material-symbols-outlined text-[12px] animate-spin">
                                sync
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded bg-[#172126] text-[#bcc8ce] text-xs font-semibold border border-white/10">
                              Analyzed
                            </span>
                          )}

                        </td>

                        <td className="p-3 text-xs font-semibold text-white group-hover:text-[#4cd6fe] transition-colors">

                          {typeof scan.confidence === 'number' &&
                          scan.confidence > 0
                            ? `${scan.confidence.toFixed(1)}%`
                            : '—'}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            )}

          </div>
        </div>

        {/* ============================================
            Right Column
        ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* ============================================
              Detection Confidence Chart
          ============================================ */}
          <div className="card-bg rounded-xl p-5 flex-1 flex flex-col border border-white/10 relative overflow-hidden">

            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4DB]/10 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00B4DB]">
                bar_chart
              </span>

              <span>Detection Confidence</span>
            </h2>

            {/* Chart */}
            <div className="flex-1 w-full flex items-end justify-between gap-2 pt-8 pb-4 border-b border-white/10 relative">

              {/* Grid lines */}
              <div className="absolute top-0 left-0 w-full border-b border-white/5"></div>
              <div className="absolute top-1/4 left-0 w-full border-b border-white/5"></div>
              <div className="absolute top-2/4 left-0 w-full border-b border-white/5"></div>
              <div className="absolute top-3/4 left-0 w-full border-b border-white/5"></div>

              {chartValues.length > 0 ? (
                chartValues.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="w-full bg-[#00B4DB]/30 rounded-t-sm relative hover:bg-[#00B4DB]/50 transition-colors"
                    style={{
                      height: `${item.value}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#4cd6fe] font-bold whitespace-nowrap">
                      {item.label}
                    </div>

                    {index === chartValues.length - 1 && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#bcc8ce]">
                        Now
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-600">
                      bar_chart
                    </span>

                    <p className="mt-2 text-xs text-[#bcc8ce]">
                      No AI confidence data yet
                    </p>
                  </div>
                </div>
              )}

            </div>

            <div className="mt-4 flex justify-between items-center text-xs">

              <span className="text-[#bcc8ce]">
                Model: —
              </span>

              <span className="inline-flex items-center gap-1 text-[#4cd6fe] font-medium">
                {confidenceValues.length > 0
                  ? `${confidenceValues.length} analyzed`
                  : 'Awaiting AI'}
              </span>

            </div>
          </div>

          {/* ============================================
              Manual Override Queue
          ============================================ */}
          <div
            onClick={() => onNavigateTab('database')}
            className="card-bg rounded-xl p-4 border border-white/10 hover:border-[#00B4DB]/40 transition-all cursor-pointer group"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-[#222b31] flex items-center justify-center group-hover:bg-[#00B4DB]/20 transition-colors text-white group-hover:text-[#00B4DB]">
                  <span className="material-symbols-outlined">
                    add_to_queue
                  </span>
                </div>

                <div>

                  <h3 className="text-sm font-medium text-white group-hover:text-[#4cd6fe] transition-colors">
                    Manual Override Queue
                  </h3>

                  <p className="text-xs text-[#bcc8ce]">
                    {pendingScans} {pendingScans === 1 ? 'scan' : 'scans'} require review
                  </p>

                </div>

              </div>

              <span className="material-symbols-outlined text-[#bcc8ce] group-hover:text-[#4cd6fe] transition-colors">
                chevron_right
              </span>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};