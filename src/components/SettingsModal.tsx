import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [aiConfidenceCutoff, setAiConfidenceCutoff] = useState<number>(75);
  const [enableHeatmaps, setEnableHeatmaps] = useState<boolean>(true);
  const [radiologistName, setRadiologistName] = useState('Dr. S. Chen');
  const [pacsHost, setPacsHost] = useState('pacs.hospital-net.internal:104');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-bg border border-[#00B4DB]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00B4DB]">settings</span>
            <h3 className="text-base font-bold text-white">Diagnostic Station Configuration</h3>
          </div>
          <button onClick={onClose} className="text-[#bcc8ce] hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs text-[#dae4eb]">
          {/* AI Thresholds */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider text-[10px]">
              AI DETECTION SENSITIVITY
            </h4>
            <div className="bg-[#0D1626] p-3 rounded-lg border border-white/10 space-y-2">
              <div className="flex justify-between">
                <span>Minimum Confidence Cutoff:</span>
                <span className="font-bold text-white">{aiConfidenceCutoff}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={aiConfidenceCutoff}
                onChange={(e) => setAiConfidenceCutoff(Number(e.target.value))}
                className="w-full accent-[#00B4DB]"
              />
              <p className="text-[10px] text-[#bcc8ce]">
                Scans below {aiConfidenceCutoff}% confidence will trigger manual review flags in the pipeline.
              </p>
            </div>
          </div>

          {/* Radiologist Profile */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider text-[10px]">
              ATTENDING RADIOLOGIST PROFILE
            </h4>
            <div className="bg-[#0D1626] p-3 rounded-lg border border-white/10 space-y-2">
              <div>
                <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                  Full Name & Credentials
                </label>
                <input
                  type="text"
                  value={radiologistName}
                  onChange={(e) => setRadiologistName(e.target.value)}
                  className="w-full bg-[#12263A] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-[#00B4DB]"
                />
              </div>
            </div>
          </div>

          {/* PACS DICOM Integration */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#4cd6fe] uppercase tracking-wider text-[10px]">
              PACS / DICOM SERVER CONFIGURATION
            </h4>
            <div className="bg-[#0D1626] p-3 rounded-lg border border-white/10 space-y-2">
              <div>
                <label className="block text-[10px] text-[#bcc8ce] uppercase mb-1">
                  DICOM Listener Host & Port
                </label>
                <input
                  type="text"
                  value={pacsHost}
                  onChange={(e) => setPacsHost(e.target.value)}
                  className="w-full bg-[#12263A] border border-white/10 rounded p-2 text-white focus:outline-none focus:border-[#00B4DB]"
                />
              </div>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded text-xs text-center border border-emerald-500/30">
            Settings saved successfully!
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-xs text-[#bcc8ce] hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-gradient px-5 py-2 rounded-lg font-semibold text-xs shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
