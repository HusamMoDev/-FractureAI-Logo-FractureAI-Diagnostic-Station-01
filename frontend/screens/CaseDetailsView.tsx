import React from 'react';
import { ScanRecord, PageTab } from '../types';

interface CaseDetailsViewProps {
  scan: ScanRecord;
  onNavigateTab: (tab: PageTab) => void;
  onBack: () => void;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({
  scan,
  onNavigateTab,
  onBack,
}) => {
  const isPending =
    scan.status === 'Pending' ||
    scan.confidence === null;

  const isCritical = scan.status === 'Critical';

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-ghost p-2 rounded-lg hover:bg-white/5"
            title="Back to Database"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#4cd6fe] font-semibold">
              Case Details
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {scan.patientName || 'Unknown Patient'}
            </h2>

            <p className="text-xs text-[#bcc8ce] mt-1 font-mono">
              Case ID: {scan.id}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateTab('detect')}
            className="btn-gradient px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              image_search
            </span>
            Open Detection
          </button>

          <button
            onClick={() => onNavigateTab('report')}
            className="btn-ghost px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              description
            </span>
            Report
          </button>
        </div>
      </div>

      {/* Patient + Case Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Patient Information */}
        <section className="card-bg rounded-2xl border border-white/10 p-5">

          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#00B4DB]">
              person
            </span>

            <h3 className="text-sm font-semibold text-white">
              Patient Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <InfoItem
              label="Patient Name"
              value={scan.patientName || '--'}
            />

            <InfoItem
              label="MRN"
              value={scan.mrn || '--'}
            />

            <InfoItem
              label="Gender"
              value={scan.gender || '--'}
            />

            <InfoItem
              label="Date of Birth"
              value={scan.dob || '--'}
            />

          </div>
        </section>

        {/* Case Information */}
        <section className="card-bg rounded-2xl border border-white/10 p-5">

          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#00B4DB]">
              medical_information
            </span>

            <h3 className="text-sm font-semibold text-white">
              Case Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <InfoItem
              label="Case ID"
              value={scan.id}
            />

            <InfoItem
              label="Body Region"
              value={scan.region || '--'}
            />

            <InfoItem
              label="Scan Date"
              value={scan.date || '--'}
            />

            <InfoItem
              label="Scan Time"
              value={scan.time || '--'}
            />

            <InfoItem
              label="Modality"
              value={scan.modality}
            />

            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#68777d]">
                Status
              </p>

              <span
                className={`inline-flex mt-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  isPending
                    ? 'bg-yellow-500/10 text-yellow-300'
                    : isCritical
                      ? 'bg-red-500/10 text-red-300'
                      : 'bg-emerald-500/10 text-emerald-300'
                }`}
              >
                {scan.status}
              </span>
            </div>

          </div>
        </section>
      </div>

      {/* X-Ray + AI Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* X-Ray Viewer */}
        <section className="xl:col-span-2 card-bg rounded-2xl border border-white/10 overflow-hidden">

          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00B4DB]">
                radiology
              </span>

              <h3 className="text-sm font-semibold text-white">
                X-Ray Image
              </h3>
            </div>

            <span className="text-[10px] text-[#68777d]">
              {scan.modality}
            </span>
          </div>

          <div className="relative min-h-[420px] bg-black/30 flex items-center justify-center p-5">

            {scan.imageUrl ? (
              <div className="relative max-w-full max-h-[520px]">

                <img
                  src={scan.imageUrl}
                  alt={`X-Ray for ${scan.patientName}`}
                  className="max-h-[520px] max-w-full object-contain rounded-lg"
                />

                {/* Future YOLO-OBB */}
                {scan.obbBox && (
                  <div
                    className="absolute border-2 border-red-400 pointer-events-none"
                    style={{
                      top: scan.obbBox.top,
                      left: scan.obbBox.left,
                      width: scan.obbBox.width,
                      height: scan.obbBox.height,
                      transform: `rotate(${scan.obbBox.rotation || '0deg'})`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] px-2 py-1 rounded">
                      {scan.obbBox.label}
                    </span>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center">

                <span className="material-symbols-outlined text-5xl text-[#68777d]">
                  image_not_supported
                </span>

                <p className="text-sm text-white mt-3">
                  X-Ray image unavailable
                </p>

                <p className="text-xs text-[#68777d] mt-1">
                  No image URL is currently available.
                </p>

              </div>
            )}

          </div>

          <div className="px-5 py-3 border-t border-white/10 text-xs text-[#bcc8ce]">
            <span className="text-[#68777d]">
              Indication:
            </span>{' '}
            {scan.indication || 'Not specified'}
          </div>
        </section>

        {/* AI Analysis */}
        <section className="card-bg rounded-2xl border border-white/10 p-5">

          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#00B4DB]">
              neurology
            </span>

            <h3 className="text-sm font-semibold text-white">
              AI Analysis
            </h3>
          </div>

          {isPending ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-300">
                  schedule
                </span>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Analysis Pending
                  </p>

                  <p className="text-xs text-[#bcc8ce] mt-1">
                    The X-Ray is waiting for AI analysis.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">

                <AnalysisRow
                  label="Fracture Detection"
                  value="Pending"
                />

                <AnalysisRow
                  label="Confidence"
                  value="--"
                />

                <AnalysisRow
                  label="OBB Detection"
                  value="Pending"
                />

              </div>
            </div>
          ) : (
            <div className="space-y-4">

              <div
                className={`rounded-xl p-4 border ${
                  isCritical
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5'
                }`}
              >

                <p className="text-[10px] uppercase tracking-wider text-[#68777d]">
                  Primary Finding
                </p>

                <p className="text-lg font-semibold text-white mt-1">
                  {scan.primaryFinding}
                </p>

              </div>

              <AnalysisRow
                label="Confidence"
                value={
                  scan.confidence !== null
                    ? `${scan.confidence.toFixed(1)}%`
                    : '--'
                }
              />

              <AnalysisRow
                label="OBB Detection"
                value={
                  scan.obbBox
                    ? 'Detected'
                    : 'Not available'
                }
              />

              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#68777d]">
                  Recommendation
                </p>

                <p className="text-xs text-[#dae4eb] mt-1 leading-relaxed">
                  {scan.recommendation || '--'}
                </p>
              </div>

            </div>
          )}

        </section>
      </div>

      {/* Findings / Impression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <section className="card-bg rounded-2xl border border-white/10 p-5">

          <h3 className="text-sm font-semibold text-white mb-4">
            Findings
          </h3>

          {scan.findingsList.length > 0 ? (
            <ul className="space-y-2">
              {scan.findingsList.map((finding, index) => (
                <li
                  key={`${finding}-${index}`}
                  className="text-xs text-[#dae4eb] flex gap-2"
                >
                  <span className="text-[#00B4DB]">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#68777d]">
              No additional findings are available.
            </p>
          )}

        </section>

        <section className="card-bg rounded-2xl border border-white/10 p-5">

          <h3 className="text-sm font-semibold text-white mb-4">
            Impression
          </h3>

          <p className="text-xs text-[#dae4eb] leading-relaxed">
            {scan.impression || 'No impression available.'}
          </p>

        </section>
      </div>

      {/* Analysis Tools */}
      <section className="card-bg rounded-2xl border border-white/10 p-5">

        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-[#00B4DB]">
            construction
          </span>

          <h3 className="text-sm font-semibold text-white">
            Analysis Tools
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <ToolButton
            icon="image_search"
            label="Detect"
            onClick={() => onNavigateTab('detect')}
          />

          <ToolButton
            icon="psychology"
            label="Explain"
            onClick={() => onNavigateTab('explain')}
          />

          <ToolButton
            icon="monitor_heart"
            label="Heatmap"
            onClick={() => onNavigateTab('heatmap')}
          />

          <ToolButton
            icon="description"
            label="Report"
            onClick={() => onNavigateTab('report')}
          />

        </div>
      </section>

    </div>
  );
};

/* ---------------- Helper Components ---------------- */

const InfoItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-[#68777d]">
      {label}
    </p>

    <p className="text-xs text-white mt-1 break-words">
      {value}
    </p>
  </div>
);

const AnalysisRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
    <span className="text-xs text-[#bcc8ce]">
      {label}
    </span>

    <span className="text-xs font-semibold text-white text-right">
      {value}
    </span>
  </div>
);

const ToolButton: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="btn-ghost rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#00B4DB]/10 transition-colors"
  >
    <span className="material-symbols-outlined text-[#4cd6fe]">
      {icon}
    </span>

    <span className="text-xs font-medium text-white">
      {label}
    </span>
  </button>
);