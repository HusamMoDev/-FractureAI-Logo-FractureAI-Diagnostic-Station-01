import React, { useState } from 'react';
import { ScanRecord, PageTab } from '../types';

interface DetectViewProps {
  scan: ScanRecord;
  onNavigateTab: (tab: PageTab) => void;
  onOpenReport: () => void;
  onToggleMeasurementTool: () => void;
  onToggleAngleTool: () => void;
  isMeasurementActive: boolean;
  isAngleActive: boolean;
}

export const DetectView: React.FC<DetectViewProps> = ({
  scan,
  onNavigateTab,
  onOpenReport,
  onToggleMeasurementTool,
  onToggleAngleTool,
  isMeasurementActive,
  isAngleActive,
}) => {
  const [viewSegment, setViewSegment] = useState<'bone' | 'soft' | 'metal'>('bone');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSecondOpinionModal, setShowSecondOpinionModal] = useState<boolean>(false);
  const [secondOpinionSuccess, setSecondOpinionSuccess] = useState<boolean>(false);

  // Filters based on segmented view
  const filterStyle =
    viewSegment === 'bone'
      ? 'grayscale contrast-125 brightness-90'
      : viewSegment === 'soft'
      ? 'grayscale contrast-150 brightness-110 saturate-150'
      : 'grayscale contrast-200 brightness-75';

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4 pb-8">
      {/* MASTER: Image Viewer Canvas (75%) */}
      <div className="flex-[3] glass-panel rounded-xl flex flex-col relative overflow-hidden min-h-[500px]">
        {/* Viewer Toolbar */}
        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-black/30">
          {/* Segmented Control for Views */}
          <div className="flex bg-[#0D1626] p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setViewSegment('bone')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewSegment === 'bone'
                  ? 'bg-[#007c98]/30 text-[#4cd6fe] font-semibold border border-[#00B4DB]/40'
                  : 'text-[#bcc8ce] hover:text-white'
              }`}
            >
              Bone
            </button>
            <button
              onClick={() => setViewSegment('soft')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewSegment === 'soft'
                  ? 'bg-[#007c98]/30 text-[#4cd6fe] font-semibold border border-[#00B4DB]/40'
                  : 'text-[#bcc8ce] hover:text-white'
              }`}
            >
              Soft Tissue
            </button>
            <button
              onClick={() => setViewSegment('metal')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewSegment === 'metal'
                  ? 'bg-[#007c98]/30 text-[#4cd6fe] font-semibold border border-[#00B4DB]/40'
                  : 'text-[#bcc8ce] hover:text-white'
              }`}
            >
              Metal
            </button>
          </div>

          {/* Tools Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                showHeatmap
                  ? 'text-[#4cd6fe] bg-[#00B4DB]/20 border-[#00B4DB]/40 shadow-[0_0_10px_rgba(0,180,219,0.2)]'
                  : 'text-[#bcc8ce] border-transparent hover:bg-white/5'
              }`}
              title="Toggle Heatmap"
            >
              <span className="material-symbols-outlined text-[18px]">texture</span>
              <span className="hidden sm:inline">Heatmap</span>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1"></div>

            <button
              onClick={onToggleMeasurementTool}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                isMeasurementActive
                  ? 'text-[#4cd6fe] bg-[#00B4DB]/20 border-[#00B4DB]/40'
                  : 'text-[#bcc8ce] border-transparent hover:bg-white/5'
              }`}
              title="Caliper Measurement"
            >
              <span className="material-symbols-outlined text-[18px]">straighten</span>
              <span className="hidden sm:inline">Caliper</span>
            </button>

            <button
              onClick={onToggleAngleTool}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                isAngleActive
                  ? 'text-[#4cd6fe] bg-[#00B4DB]/20 border-[#00B4DB]/40'
                  : 'text-[#bcc8ce] border-transparent hover:bg-white/5'
              }`}
              title="Angle Measurement"
            >
              <span className="material-symbols-outlined text-[18px]">square_foot</span>
              <span className="hidden sm:inline">Angle</span>
            </button>

            <div className="w-px h-4 bg-white/10 mx-1"></div>

            <button
              onClick={() => onNavigateTab('explain')}
              className="p-1.5 rounded-md text-[#bcc8ce] hover:text-[#4cd6fe] hover:bg-white/5 transition-colors flex items-center gap-1 text-xs"
              title="AI Explanation"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span className="hidden xl:inline">Explain</span>
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 relative bg-[#060F14] flex items-center justify-center overflow-hidden p-4">
          {/* Main X-Ray Image */}
          <div
            className="relative max-h-full max-w-full aspect-[3/4] p-2 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={scan.imageUrl}
              alt={scan.region}
              className={`max-h-[460px] object-contain ${filterStyle} z-10 relative rounded-sm shadow-2xl`}
            />

            {/* Heatmap Overlay */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50 z-20 flex items-center justify-center">
                <div
                  className="w-1/3 h-1/3 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.6) 45%, rgba(0,180,219,0) 80%)',
                    filter: 'blur(20px)',
                    transform: 'translate(10%, -10%)',
                  }}
                ></div>
              </div>
            )}

            {/* OBB Bounding Detection Box */}
            <div
              className="absolute z-30 obb-box rounded-sm ai-glow flex flex-col justify-end p-1"
              style={{
                top: scan.obbBox?.top || '35%',
                left: scan.obbBox?.left || '40%',
                width: scan.obbBox?.width || '22%',
                height: scan.obbBox?.height || '25%',
                transform: `rotate(${scan.obbBox?.rotation || '0deg'})`,
              }}
            >
              <div className="bg-[#00b4db] text-[#003543] text-[10px] font-bold px-1.5 py-0.5 rounded-sm w-max absolute -top-5 -left-0.5 whitespace-nowrap shadow-md border border-[#00B4DB]">
                {scan.obbBox?.label || `${scan.primaryFinding} (${scan.confidence}%)`}
              </div>
            </div>
          </div>

          {/* Zoom/Pan Floating Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-[#12263A]/90 backdrop-blur-md p-1.5 rounded-lg border border-white/10 z-40 shadow-xl">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-white/10 text-[#bcc8ce] hover:text-white transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-lg">add</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-white/10 text-[#bcc8ce] hover:text-white transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-lg">remove</span>
            </button>
            <div className="w-full h-px bg-white/10 my-0.5"></div>
            <button
              onClick={handleResetZoom}
              className="p-1 rounded hover:bg-white/10 text-[#bcc8ce] hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <span className="material-symbols-outlined text-lg">zoom_out_map</span>
            </button>
          </div>

          {/* Patient Metadata Overlay (Top-Left) */}
          <div className="absolute top-4 left-4 text-[#bcc8ce] font-mono text-[11px] leading-relaxed z-30 pointer-events-none opacity-80 bg-black/40 backdrop-blur-sm p-2 rounded border border-white/5">
            <p className="font-bold text-white">Pt: {scan.patientName}</p>
            <p>Age: {scan.patientAge || scan.dob}</p>
            <p>MRN: {scan.mrn}</p>
            <p>Date: {scan.date}</p>
            <p>Modality: {scan.modality}</p>
            <p>Region: {scan.region}</p>
          </div>
        </div>
      </div>

      {/* DETAIL: AI Analysis Sidebar (25%) */}
      <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col gap-4">
        {/* AI Results Card */}
        <div className="glass-panel rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-black/30 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00B4DB] text-[20px]">
                psychology
              </span>
              <span>AI Analysis</span>
            </h2>
            <div className="bg-[#00b4db] text-[#003543] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ai-chip-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
              <span>Complete</span>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-5 custom-scrollbar">
            {/* Primary Finding */}
            <div>
              <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                Primary Detection
              </p>
              <div className="bg-[#0D1626] border border-[#ffb4ab]/40 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-[#ffb4ab]">
                    {scan.primaryFinding}
                  </h3>
                  <span className="text-sm font-bold text-white">
                    {scan.confidence}%
                  </span>
                </div>
                <div className="w-full bg-[#2d363b] rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="bg-[#ffb4ab] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${scan.confidence || 95}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#bcc8ce] leading-relaxed">
                  {scan.findingsList[0] || 'Complete fracture break with cortical disruption.'}
                </p>
              </div>
            </div>

            {/* Secondary Finding */}
            {scan.secondaryFinding && (
              <div>
                <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                  Secondary Findings
                </p>
                <div className="bg-[#0D1626] border border-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-xs font-medium text-[#4cd6fe]">
                      {scan.secondaryFinding}
                    </h3>
                    <span className="text-xs text-[#bcc8ce]">
                      {scan.secondaryConfidence || 82}%
                    </span>
                  </div>
                  <div className="w-full bg-[#2d363b] rounded-full h-1 mb-1 overflow-hidden">
                    <div
                      className="bg-[#4cd6fe] h-1 rounded-full"
                      style={{ width: `${scan.secondaryConfidence || 82}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Clinical AI Recommendation */}
            <div>
              <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                AI Recommendation
              </p>
              <div className="bg-[#0D1626] border border-[#00B4DB]/30 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#00B4DB]/10 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-xs text-[#dae4eb] leading-relaxed relative z-10">
                  {scan.recommendation}
                </p>
              </div>
            </div>

            {/* Technical Details Collapsible */}
            <div className="border-t border-white/5 pt-3">
              <details className="group">
                <summary className="text-xs text-[#bcc8ce] cursor-pointer flex items-center justify-between list-none font-medium hover:text-white">
                  <span>Technical Parameters</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="mt-2 space-y-1 text-[11px] text-[#bcc8ce]/80 font-mono bg-[#0D1626] p-2 rounded border border-white/5">
                  <div className="flex justify-between">
                    <span>Model Version:</span>
                    <span className="text-white">v4.2.1-Ortho</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Time:</span>
                    <span className="text-white">0.84s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Image Quality:</span>
                    <span className="text-[#4cd6fe]">Optimal (92)</span>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-4 border-t border-white/5 bg-black/30 space-y-2">
            <button
              onClick={() => onNavigateTab('explain')}
              className="w-full btn-gradient font-semibold py-2.5 rounded-lg text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                description
              </span>
              <span>Generate Medical Report</span>
            </button>

            <button
              onClick={() => setShowSecondOpinionModal(true)}
              className="w-full bg-transparent border border-[#00B4DB]/50 text-[#4cd6fe] font-medium text-xs py-2 rounded-lg hover:bg-[#00B4DB]/10 active:scale-95 transition-all"
            >
              Request Second Opinion
            </button>
          </div>
        </div>
      </div>

      {/* Second Opinion Modal */}
      {showSecondOpinionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12263A] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00B4DB]">
                  verified_user
                </span>
                <span>Request Senior Radiology Review</span>
              </h3>
              <button
                onClick={() => {
                  setShowSecondOpinionModal(false);
                  setSecondOpinionSuccess(false);
                }}
                className="text-[#bcc8ce] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {secondOpinionSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#00B4DB]/20 text-[#00B4DB] mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <h4 className="text-sm font-bold text-white">Review Requested</h4>
                <p className="text-xs text-[#bcc8ce]">
                  Case {scan.id} has been escalated to Chief Orthopedic Specialist Dr.
                  S. Chen for secondary audit.
                </p>
                <button
                  onClick={() => {
                    setShowSecondOpinionModal(false);
                    setSecondOpinionSuccess(false);
                  }}
                  className="btn-gradient px-4 py-2 rounded-lg text-xs font-semibold mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#bcc8ce]">
                  Submit this study to the Senior Radiologist queue for secondary verification and AI alignment audit.
                </p>

                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Clinical Review Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter notes or specific areas of concern..."
                    className="w-full bg-[#0D1626] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-[#bcc8ce]/50 focus:outline-none focus:border-[#00B4DB]"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowSecondOpinionModal(false)}
                    className="px-3 py-1.5 text-xs text-[#bcc8ce] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setSecondOpinionSuccess(true)}
                    className="btn-gradient px-4 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Confirm Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
