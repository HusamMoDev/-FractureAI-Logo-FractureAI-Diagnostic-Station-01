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
  return (
    <div className="space-y-6 pb-12">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-bg rounded-xl p-6 flex items-center gap-4 hover:border-[#00B4DB]/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-[#172126] flex items-center justify-center text-[#4cd6fe]">
            <span className="material-symbols-outlined text-2xl">medical_information</span>
          </div>
          <div>
            <p className="text-sm text-[#bcc8ce]">Total Scans Today</p>
            <h3 className="text-2xl font-semibold text-white mt-0.5">1,248</h3>
          </div>
        </div>

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
            <p className="text-sm text-[#bcc8ce]">Fractures Detected</p>
            <h3 className="text-2xl font-semibold text-white mt-0.5">142</h3>
          </div>
        </div>

        <div className="card-bg rounded-xl p-6 flex items-center gap-4 hover:border-[#00B4DB]/50 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-[#172126] flex items-center justify-center text-[#78d2f1]">
            <span className="material-symbols-outlined text-2xl">troubleshoot</span>
          </div>
          <div>
            <p className="text-sm text-[#bcc8ce]">Analysis Accuracy</p>
            <h3 className="text-2xl font-semibold text-white mt-0.5">99.2%</h3>
          </div>
        </div>
      </div>

      {/* Main Work Area Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
        {/* Left Column: Recent Scans Pipeline */}
        <div className="lg:col-span-8 card-bg rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#172126]/40">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00B4DB]">view_list</span>
              <span>Recent Scans Pipeline</span>
            </h2>
            <button
              onClick={() => onNavigateTab('database')}
              className="text-xs text-[#4cd6fe] hover:text-[#00B4DB] flex items-center gap-1 font-medium transition-colors"
            >
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="flex-1 overflow-x-auto p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#bcc8ce] text-xs font-semibold uppercase tracking-wider">
                  <th className="p-3">Patient ID</th>
                  <th className="p-3">Modality</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">AI Status</th>
                  <th className="p-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 5).map((scan) => {
                  const isCritical = scan.status === 'Critical';
                  const isPending = scan.status === 'Pending';
                  return (
                    <tr
                      key={scan.id}
                      onClick={() => {
                        onSelectScan(scan);
                        onNavigateTab('detect');
                      }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 font-mono text-xs font-semibold text-white group-hover:text-[#4cd6fe]">
                        {scan.id}
                      </td>
                      <td className="p-3 text-xs text-[#bcc8ce]">{scan.modality}</td>
                      <td className="p-3 text-xs text-white">{scan.region}</td>
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
                        {scan.confidence !== null ? `${scan.confidence}%` : 'Calculating...'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: AI Performance Chart & Quick Action */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Chart Card */}
          <div className="card-bg rounded-xl p-5 flex-1 flex flex-col border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4DB]/10 rounded-full blur-3xl pointer-events-none"></div>
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00B4DB]">bar_chart</span>
              <span>Detection Confidence</span>
            </h2>

            {/* Bars Visualization */}
            <div className="flex-1 w-full flex items-end justify-between gap-2 pt-8 pb-4 border-b border-white/10 relative">
              {/* Grid lines */}
              <div className="absolute top-0 left-0 w-full border-b border-white/5 h-1/4"></div>
              <div className="absolute top-1/4 left-0 w-full border-b border-white/5 h-1/4"></div>
              <div className="absolute top-2/4 left-0 w-full border-b border-white/5 h-1/4"></div>
              <div className="absolute top-3/4 left-0 w-full border-b border-white/5 h-1/4"></div>

              {/* Bars */}
              <div className="w-full bg-[#00B4DB]/20 rounded-t-sm h-[40%] relative hover:bg-[#00B4DB]/40 transition-colors group">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#bcc8ce]">
                  8am
                </div>
              </div>
              <div className="w-full bg-[#00B4DB]/30 rounded-t-sm h-[55%] relative hover:bg-[#00B4DB]/50 transition-colors"></div>
              <div className="w-full bg-[#00B4DB]/40 rounded-t-sm h-[80%] relative hover:bg-[#00B4DB]/60 transition-colors ai-glow z-10">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#4cd6fe] font-bold">
                  98%
                </div>
              </div>
              <div className="w-full bg-[#00B4DB]/20 rounded-t-sm h-[65%] relative hover:bg-[#00B4DB]/40 transition-colors"></div>
              <div className="w-full bg-[#00B4DB]/10 rounded-t-sm h-[45%] relative hover:bg-[#00B4DB]/30 transition-colors"></div>
              <div className="w-full bg-[#00B4DB]/30 rounded-t-sm h-[70%] relative hover:bg-[#00B4DB]/50 transition-colors"></div>
              <div className="w-full bg-[#00B4DB]/50 rounded-t-sm h-[90%] relative hover:bg-[#00B4DB]/70 transition-colors ai-glow z-10">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#4cd6fe] font-bold">
                  99%
                </div>
              </div>
              <div className="w-full bg-[#00B4DB]/20 rounded-t-sm h-[60%] relative hover:bg-[#00B4DB]/40 transition-colors">
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#bcc8ce]">
                  Now
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs">
              <span className="text-[#bcc8ce]">Model: v4.2.1-Clinical</span>
              <span className="inline-flex items-center gap-1 text-[#4cd6fe] font-medium">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +2.4% Today
              </span>
            </div>
          </div>

          {/* Quick Action: Manual Override Queue */}
          <div
            onClick={() => onNavigateTab('database')}
            className="card-bg rounded-xl p-4 border border-white/10 hover:border-[#00B4DB]/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#222b31] flex items-center justify-center group-hover:bg-[#00B4DB]/20 transition-colors text-white group-hover:text-[#00B4DB]">
                  <span className="material-symbols-outlined">add_to_queue</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white group-hover:text-[#4cd6fe] transition-colors">
                    Manual Override Queue
                  </h3>
                  <p className="text-xs text-[#bcc8ce]">3 scans require review</p>
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
