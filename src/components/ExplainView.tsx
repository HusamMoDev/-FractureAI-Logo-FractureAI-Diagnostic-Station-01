import React, { useState } from 'react';
import { ScanRecord } from '../types';

interface ExplainViewProps {
  scan: ScanRecord;
  onOpenReportPrint: () => void;
}

export const ExplainView: React.FC<ExplainViewProps> = ({ scan, onOpenReportPrint }) => {
  const [visMode, setVisMode] = useState<'original' | 'heatmap' | 'contours'>('heatmap');
  const [copiedShare, setCopiedShare] = useState(false);

  const signatureUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAN-gT-L1xCUATOXHbl8A7bkFELywkc9FYbeEvjDrdn-fIUTDIjAIgcxvhN2LNKYXl1kesxoNbBV2bje4_XpS66yhSMRcENv_659Y18UoCohY04PFzj4EeysPU6C5s9nj4siFVooTuEHGt33zdAobHv3viy3pI1Fk63Mq1nSk6EAKzmKK63o_pIFj7ZXu9_-4cwggob67cmUCkJAS612V1g7D5-Ireb1KpD7B9w2qBL5ad3fVflhsmwtNo_VHGaSnpqd0Xw787ytMkB';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-semibold text-[#4cd6fe] bg-[#00B4DB]/10 px-2.5 py-0.5 rounded border border-[#00B4DB]/20">
              STUDY: {scan.id}
            </span>
            <span className="text-xs text-[#bcc8ce]">Generated: Today, {scan.time}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            AI Explanation & Final Report
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenReportPrint}
            className="btn-ghost px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#00B4DB]/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print</span>
          </button>

          <button
            onClick={handleShare}
            className="btn-ghost px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#00B4DB]/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>{copiedShare ? 'Copied Link!' : 'Share with Patient'}</span>
          </button>

          <button
            onClick={onOpenReportPrint}
            className="btn-gradient px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(0,180,219,0.3)] hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: AI Visualization (Master View - 7 cols) */}
        <div className="col-span-12 xl:col-span-7 flex flex-col gap-6">
          <div className="card-bg p-5 flex flex-col h-full rounded-2xl border border-[#00B4DB]/40 shadow-[0_0_20px_rgba(0,180,219,0.15)] relative overflow-hidden">
            <div className="flex flex-wrap justify-between items-center mb-4 border-b border-white/10 pb-3 gap-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00B4DB]">
                  visibility
                </span>
                <span>Diagnostic Visualization</span>
              </h3>

              <div className="flex bg-[#222b31] rounded-full p-1 border border-white/5">
                <button
                  onClick={() => setVisMode('original')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    visMode === 'original'
                      ? 'bg-[#2d363b] text-white shadow'
                      : 'text-[#bcc8ce] hover:text-white'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setVisMode('heatmap')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    visMode === 'heatmap'
                      ? 'bg-[#00B4DB]/20 text-[#4cd6fe] border border-[#00B4DB]/40 shadow'
                      : 'text-[#bcc8ce] hover:text-white'
                  }`}
                >
                  AI Heatmap
                </button>
                <button
                  onClick={() => setVisMode('contours')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    visMode === 'contours'
                      ? 'bg-[#2d363b] text-white shadow'
                      : 'text-[#bcc8ce] hover:text-white'
                  }`}
                >
                  Contours
                </button>
              </div>
            </div>

            {/* Image Viewer Canvas */}
            <div className="relative w-full flex-1 bg-[#060F14] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden min-h-[420px] p-2">
              <img
                src={scan.imageUrl}
                alt={scan.region}
                className={`max-h-[380px] object-contain rounded ${
                  visMode === 'contours'
                    ? 'grayscale contrast-200 invert'
                    : 'grayscale contrast-125'
                }`}
              />

              {/* Heatmap Overlay */}
              {visMode === 'heatmap' && (
                <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60 z-20 flex items-center justify-center">
                  <div
                    className="w-44 h-44 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.6) 45%, rgba(0,180,219,0) 80%)',
                      filter: 'blur(22px)',
                      transform: 'translate(10%, -5%)',
                    }}
                  ></div>
                </div>
              )}

              {/* Bounding Box & Priority Badge */}
              <div
                className="absolute z-30 obb-box rounded-md pointer-events-none flex items-center justify-center"
                style={{
                  top: scan.obbBox?.top || '35%',
                  left: scan.obbBox?.left || '45%',
                  width: scan.obbBox?.width || '130px',
                  height: scan.obbBox?.height || '90px',
                }}
              >
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#00B4DB] rounded-full flex items-center justify-center shadow-[0_0_12px_#00b4db]">
                  <span className="material-symbols-outlined text-xs text-[#003543] font-bold">
                    priority_high
                  </span>
                </div>
              </div>

              {/* Floating Analysis Chip (Bottom Left) */}
              <div className="absolute bottom-4 left-4 bg-[#172126]/90 backdrop-blur-md border border-white/10 rounded-lg p-3 flex items-center gap-3 shadow-lg z-40">
                <div className="w-3 h-3 rounded-full bg-[#00B4DB] animate-pulse"></div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#bcc8ce] tracking-wider">
                    Primary Detection
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {scan.primaryFinding}
                  </p>
                </div>
                <div className="ml-2 pl-3 border-l border-white/10">
                  <span className="text-base font-bold text-[#4cd6fe]">
                    {scan.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Patient Data & Report (Detail View - 5 cols) */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-6">
          {/* Patient Info Card */}
          <div className="card-bg p-4 rounded-xl">
            <h3 className="text-xs font-semibold text-[#bcc8ce] mb-3 border-b border-white/10 pb-2 uppercase tracking-wider">
              PATIENT DEMOGRAPHICS
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <p className="text-[10px] text-[#bcc8ce]/70 uppercase">NAME</p>
                <p className="font-semibold text-white">{scan.patientName}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#bcc8ce]/70 uppercase">MRN</p>
                <p className="font-mono font-medium text-white">{scan.mrn}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#bcc8ce]/70 uppercase">DOB / AGE</p>
                <p className="text-white">{scan.dob}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#bcc8ce]/70 uppercase">GENDER</p>
                <p className="text-white">{scan.gender}</p>
              </div>
            </div>
          </div>

          {/* Formal Radiologic Report Card */}
          <div className="card-bg p-5 rounded-2xl flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4DB]/5 rounded-bl-full pointer-events-none"></div>

            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00B4DB]">
                  article
                </span>
                <span>Formal Radiologic Report</span>
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold uppercase tracking-wider">
                AI ASSISTED
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-[#dae4eb] custom-scrollbar">
              <section>
                <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider mb-1">
                  INDICATION
                </h4>
                <p className="leading-relaxed text-[#dae4eb]/90">{scan.indication}</p>
              </section>

              <section>
                <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider mb-1">
                  TECHNIQUE
                </h4>
                <p className="leading-relaxed text-[#dae4eb]/90">{scan.technique}</p>
              </section>

              <section>
                <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <span>FINDINGS</span>
                  <span className="bg-[#00B4DB] text-[#003543] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                    AI FLAGGED
                  </span>
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-[#dae4eb]/90 leading-relaxed">
                  {scan.findingsList.map((item, idx) => (
                    <li key={idx}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.replace(
                            /(Bones:|Soft Tissues:)/g,
                            '<strong class="text-[#b6ebff]">$1</strong>'
                          ),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider mb-1">
                  IMPRESSION
                </h4>
                <div className="bg-[#172126] p-3 rounded-lg border border-white/5 font-medium whitespace-pre-line leading-relaxed">
                  {scan.impression}
                </div>
              </section>
            </div>

            {/* Radiologist Digital Signature Area */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
              <div>
                <p className="text-[#bcc8ce]">Electronically Signed By:</p>
                <p className="font-bold text-[#4cd6fe] text-sm">
                  {scan.radiologist || 'Dr. S. Chen, MD'}
                </p>
                <p className="text-[10px] text-[#bcc8ce]">
                  Attending Radiologist • 14:45 EST
                </p>
              </div>
              <div className="opacity-80">
                <img
                  src={signatureUrl}
                  alt="Radiologist Signature"
                  className="h-9 object-contain mix-blend-screen"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
