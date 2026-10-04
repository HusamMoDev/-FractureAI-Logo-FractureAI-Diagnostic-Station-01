import React, { useMemo, useState } from 'react';
import { ScanRecord, FractureType, PageTab } from '../types';

interface DatabaseViewProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onNavigateTab: (tab: PageTab) => void;
  onOpenUpload: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  scans,
  onSelectScan,
  onNavigateTab,
  onOpenUpload,
}) => {
  const [dateFilter, setDateFilter] = useState('All Records');
  const [selectedTypes, setSelectedTypes] = useState<FractureType[]>([]);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fractureTypes: FractureType[] = [
    'Transverse',
    'Comminuted',
    'Spiral',
    'Hairline',
    'Colles',
    'No Fracture Detected',
  ];

  const toggleType = (type: FractureType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(
        selectedTypes.filter((t) => t !== type)
      );
    } else {
      setSelectedTypes([
        ...selectedTypes,
        type,
      ]);
    }
  };

  const handleReset = () => {
    setDateFilter('All Records');
    setSelectedTypes([]);
    setMinConfidence(0);
    setSearchQuery('');
  };

  const filteredScans = useMemo(() => {
    const now = new Date();

    return scans.filter((scan) => {
      /* ---------------- Search ---------------- */

      const query =
        searchQuery.trim().toLowerCase();

      if (query) {
        const searchableText = [
          scan.id,
          scan.patientName,
          scan.mrn,
          scan.region,
          scan.primaryFinding,
          scan.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      /* ---------------- Confidence ---------------- */

      if (
        scan.confidence !== null &&
        scan.confidence < minConfidence
      ) {
        return false;
      }

      /*
       * Pending cases have no real AI confidence.
       * They are hidden when a minimum confidence
       * greater than 0 is selected.
       */
      if (
        minConfidence > 0 &&
        scan.confidence === null
      ) {
        return false;
      }

      /* ---------------- Date ---------------- */

      if (dateFilter !== 'All Records') {
        const scanDate = new Date(scan.date);

        if (!Number.isNaN(scanDate.getTime())) {
          const diffMs =
            now.getTime() -
            scanDate.getTime();

          const diffDays =
            diffMs /
            (1000 * 60 * 60 * 24);

          if (
            dateFilter === 'Last 7 Days' &&
            (diffDays < 0 ||
              diffDays > 7)
          ) {
            return false;
          }

          if (
            dateFilter === 'Last 30 Days' &&
            (diffDays < 0 ||
              diffDays > 30)
          ) {
            return false;
          }

          if (
            dateFilter === 'Last 3 Months' &&
            (diffDays < 0 ||
              diffDays > 90)
          ) {
            return false;
          }
        }
      }

      /* ---------------- Fracture Type ---------------- */

      if (selectedTypes.length > 0) {
        const finding =
          scan.primaryFinding.toLowerCase();

        const matchesType =
          selectedTypes.some((type) => {
            if (
              type ===
              'No Fracture Detected'
            ) {
              return (
                scan.status === 'Normal' ||
                finding.includes(
                  'no fracture'
                ) ||
                finding.includes(
                  'no abnormality'
                )
              );
            }

            return finding.includes(
              type.toLowerCase()
            );
          });

        if (!matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [
    scans,
    searchQuery,
    minConfidence,
    dateFilter,
    selectedTypes,
  ]);

  /*
   * Open the selected case in Case Details.
   *
   * Case Details is now the central page for
   * reviewing a complete medical case before
   * entering Detect / Explain / Report.
   */
  const handleOpenCase = (
    scan: ScanRecord
  ) => {
    onSelectScan(scan);
    onNavigateTab('case-details');
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Page Header */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Patient Database
          </h2>

          <p className="text-xs md:text-sm text-[#bcc8ce] mt-1">
            Comprehensive overview of all diagnostic imaging records and AI analyses.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="btn-gradient px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-lg">
            add_circle
          </span>

          <span>
            Upload New Scan
          </span>
        </button>

      </div>

      {/* Search */}

      <div className="card-bg p-4 rounded-2xl border border-white/10">

        <div className="relative">

          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bcc8ce]">
            search
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            placeholder="Search by Patient Name, MRN, Case ID, region..."
            className="w-full bg-[#0D1626] border border-white/10 rounded-lg py-2.5 pl-11 pr-4 text-xs text-white placeholder:text-[#68777d] focus:outline-none focus:border-[#00B4DB]"
          />

        </div>

      </div>

      {/* Bento Layout */}

      <div className="grid grid-cols-12 gap-6">

        {/* Filter Sidebar */}

        <aside className="col-span-12 lg:col-span-3">

          <div className="card-bg p-5 rounded-2xl sticky top-20 border border-white/10 space-y-5">

            <div className="flex items-center gap-2 pb-3 border-b border-white/10">

              <span className="material-symbols-outlined text-[#00B4DB]">
                filter_list
              </span>

              <h3 className="text-sm font-semibold text-white">
                Advanced Filters
              </h3>

            </div>

            {/* Scan Date */}

            <div>

              <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase tracking-wider mb-2">
                SCAN DATE
              </label>

              <select
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
                className="w-full bg-[#0D1626] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#00B4DB]"
              >
                <option>
                  All Records
                </option>

                <option>
                  Last 7 Days
                </option>

                <option>
                  Last 30 Days
                </option>

                <option>
                  Last 3 Months
                </option>
              </select>

            </div>

            {/* Fracture Type */}

            <div>

              <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase tracking-wider mb-2">
                FRACTURE TYPE DETECTED
              </label>

              <div className="space-y-2 text-xs text-[#dae4eb]">

                {fractureTypes.map(
                  (type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 cursor-pointer hover:text-white"
                    >

                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(
                          type
                        )}
                        onChange={() =>
                          toggleType(type)
                        }
                        className="rounded bg-[#0D1626] border-white/20 text-[#00B4DB] focus:ring-[#00B4DB]"
                      />

                      <span>
                        {type}
                      </span>

                    </label>
                  )
                )}

              </div>

            </div>

            {/* Confidence */}

            <div>

              <div className="flex justify-between items-center mb-1">

                <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase tracking-wider">
                  AI CONFIDENCE LEVEL
                </label>

                <span className="text-xs font-bold text-[#4cd6fe]">
                  &gt;= {minConfidence}%
                </span>

              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={minConfidence}
                onChange={(e) =>
                  setMinConfidence(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full h-1 bg-[#2d363b] rounded-lg appearance-none cursor-pointer accent-[#00B4DB]"
              />

              <div className="flex justify-between text-[10px] text-[#bcc8ce] mt-1">

                <span>
                  0%
                </span>

                <span>
                  100%
                </span>

              </div>

            </div>

            {/* Reset */}

            <button
              onClick={handleReset}
              className="w-full btn-ghost py-2 rounded-lg text-xs font-medium hover:bg-[#00B4DB]/10 transition-colors"
            >
              Reset Filters
            </button>

          </div>

        </aside>

        {/* Patient Records */}

        <div className="col-span-12 lg:col-span-9">

          <div className="card-bg rounded-2xl overflow-hidden border border-white/10">

            {/* Table Header */}

            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-white/10 bg-[#172126]/40 text-[10px] font-semibold text-[#bcc8ce] uppercase tracking-wider">

              <div className="col-span-3">
                PATIENT ID / NAME
              </div>

              <div className="col-span-2">
                SCAN DATE
              </div>

              <div className="col-span-3">
                PRIMARY FINDING
              </div>

              <div className="col-span-2">
                AI CONFIDENCE
              </div>

              <div className="col-span-2 text-right">
                ACTIONS
              </div>

            </div>

            {/* Table Rows */}

            <div className="divide-y divide-white/5">

              {filteredScans.length > 0 ? (

                filteredScans.map(
                  (s) => {

                    const isNormal =
                      s.primaryFinding.includes(
                        'No Abnormality'
                      ) ||
                      s.primaryFinding.includes(
                        'No Fracture'
                      ) ||
                      s.status ===
                        'Normal';

                    const isCritical =
                      s.status ===
                      'Critical';

                    const isPending =
                      s.status ===
                        'Pending' ||
                      s.confidence ===
                        null;

                    return (
                      <div
                        key={s.id}
                        onClick={() =>
                          handleOpenCase(
                            s
                          )
                        }
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 items-center hover:bg-white/5 transition-colors cursor-pointer group"
                      >

                        {/* Patient */}

                        <div className="sm:col-span-3">

                          <p className="font-semibold text-xs text-white group-hover:text-[#4cd6fe] font-mono">
                            {s.id}
                          </p>

                          <p className="text-xs text-[#bcc8ce]">
                            {s.patientName ||
                              'Unknown Patient'}
                          </p>

                          <p className="text-[10px] text-[#68777d] mt-0.5">
                            MRN:{' '}
                            {s.mrn ||
                              '--'}
                          </p>

                        </div>

                        {/* Date */}

                        <div className="sm:col-span-2 text-xs">

                          <p className="text-white">
                            {s.date}
                          </p>

                          <p className="text-[10px] text-[#bcc8ce]">
                            {s.time}
                          </p>

                        </div>

                        {/* Finding */}

                        <div className="sm:col-span-3 flex items-center gap-2 text-xs">

                          {isCritical ? (

                            <span className="material-symbols-outlined text-[#ffb4ab] text-[18px]">
                              warning
                            </span>

                          ) : isNormal ? (

                            <span className="material-symbols-outlined text-[#869398] text-[18px]">
                              check_circle
                            </span>

                          ) : isPending ? (

                            <span className="material-symbols-outlined text-[#f5c451] text-[18px]">
                              schedule
                            </span>

                          ) : (

                            <span className="material-symbols-outlined text-[#4cd6fe] text-[18px]">
                              info
                            </span>

                          )}

                          <span className="text-white font-medium">
                            {s.primaryFinding ||
                              'Analysis pending'}
                          </span>

                        </div>

                        {/* Confidence */}

                        <div className="sm:col-span-2 flex items-center gap-2">

                          <span className="text-xs font-bold text-[#4cd6fe]">

                            {s.confidence !==
                            null
                              ? `${s.confidence}%`
                              : '--'}

                          </span>

                          {s.confidence !==
                            null && (

                            <div className="h-1.5 w-16 bg-[#2d363b] rounded-full overflow-hidden hidden md:block">

                              <div
                                className="h-full bg-[#00B4DB]"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      s.confidence,
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          )}

                        </div>

                        {/* Action */}

                        <div className="sm:col-span-2 text-right">

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              handleOpenCase(
                                s
                              );
                            }}
                            className="btn-ghost px-3 py-1 rounded-md text-xs font-medium opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Review
                          </button>

                        </div>

                      </div>
                    );
                  }
                )

              ) : (

                <div className="px-5 py-12 text-center">

                  <span className="material-symbols-outlined text-4xl text-[#68777d]">
                    search_off
                  </span>

                  <p className="text-sm text-white mt-3">
                    No records found
                  </p>

                  <p className="text-xs text-[#bcc8ce] mt-1">
                    Try changing your search or filters.
                  </p>

                </div>

              )}

            </div>

            {/* Footer */}

            <div className="px-5 py-3.5 border-t border-white/10 flex items-center justify-between text-xs text-[#bcc8ce]">

              <span>
                Showing{' '}
                {filteredScans.length}{' '}
                of {scans.length}{' '}
                real records
              </span>

              <span className="text-[#68777d]">
                No additional records are assumed.
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};