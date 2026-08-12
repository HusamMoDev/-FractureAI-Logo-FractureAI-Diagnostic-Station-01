import React, { useState, useEffect } from 'react';
import { ScanRecord, Modality } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCreated: (newScan: ScanRecord) => void;
}

type UploadStatus = 'idle' | 'processing' | 'completed' | 'error';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onScanCreated,
}) => {
  const [patientName, setPatientName] = useState('Al-Hassan, Omar');
  const [patientAge, setPatientAge] = useState<string>('35');
  const [modality] = useState<Modality>('X-Ray');
  const [region, setRegion] = useState('Right Wrist');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [completedRecord, setCompletedRecord] = useState<ScanRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUploadStatus('idle');
      setProcessingProgress(0);
      setProcessingStep(0);
      setAnalysisError(null);
      setCompletedRecord(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const samplePresets = [
    {
      title: 'Wrist Colles Fracture',
      region: 'Right Wrist',
      modality: 'X-Ray' as Modality,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBqsiKgMivdu9rdC4-1A_DbnboSniZzPuRHcNiZGlbyyGv2H-_1O6mlwGiu48V2gbH9ZTjv7b73O4gJ-5MgOLPvF87VmMjzTuu-wFw0LEDclhCBo2lE9YO6blMnS63VJITH0gxXJUBWHJwBzA-C1pOY9u4wiUp-f2qcsECDhumMT-UvXo50CGU2RWu_MzYjeKLyXoTiZiie1Pugz38kZxwCWGzaEfRGB4yPdOPfETvaYRpnrzX24P3AnmpaQ5Xs-4iP20601oSMUwQ',
    },
    {
      title: 'Forearm Transverse Fracture',
      region: 'Left Forearm',
      modality: 'X-Ray' as Modality,
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBnpGHUHKZVpWevgfrN1E8bHJIkD4J5-pkYDTDeNza2vVvz2tM-1wEp0YV6N7phwyauik3YCb3T_hMWJFz1Vk6kHoQ3pVTdM0rBgwtnLzOjNLScbj-vkXiPUkvJne7-4DfveyaqrepMPBcpIK0z_JC5SftXIkuvN1zH2A4MkfL649mr4LnFtrjw5YZ0gb5rQE6DKeTHsUifPPmGWPTr2lbMc-hlKE1bCTfHGrOLqimEW0QHNAV5DsIsVK807JL3IY4KmqYjqHUJpZm',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAnalysis = () => {
    setUploadStatus('processing');
    setAnalysisError(null);
    setProcessingProgress(0);
    setProcessingStep(0);

    const activeImageUrl = uploadedBase64 || selectedPresetImage;

    // Data payload for future Backend API
    const analysisPayload = {
      patientName,
      patientAge: Number(patientAge),
      modality,
      xrayImage: activeImageUrl
    };
    console.log("Simulating API request with payload:", analysisPayload);

    // TODO: Replace simulated analysis with real AI inference API.
    // Example:
    // POST /api/v1/analysis
    // await fetch('/api/v1/analysis', { method: 'POST', body: JSON.stringify(analysisPayload), ... })

    const totalDuration = 4000; // 4 seconds total
    const intervalTime = 50; // Update frequently for smooth progress bar
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      
      setProcessingProgress(progress);

      if (progress < 25) {
        setProcessingStep(0);
      } else if (progress < 50) {
        setProcessingStep(1);
      } else if (progress < 75) {
        setProcessingStep(2);
      } else if (progress < 100) {
        setProcessingStep(3);
      }

      if (progress >= 100) {
        clearInterval(timer);
        setProcessingStep(4);
        
        // Generate mock record for the rest of the application to function correctly
        const fallbackRecord: ScanRecord = {
          id: `PX-${Math.floor(1000 + Math.random() * 9000)}-FX`,
          patientName,
          patientAge: Number(patientAge),
          dob: '1987-06-15',
          mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
          gender: 'Male',
          date: new Date().toISOString().split('T')[0],
          time: 'Now',
          modality,
          region,
          status: 'Critical',
          confidence: 97.8,
          imageUrl: activeImageUrl,
          primaryFinding: 'Acute Cortical Fracture',
          secondaryFinding: 'Soft Tissue Swelling',
          secondaryConfidence: 85.0,
          recommendation: 'Immediate orthopedic consultation and splinting recommended.',
          indication: 'Acute localized pain and deformity post-fall.',
          technique: `${modality} 2-view standard acquisition.`,
          findingsList: [
            'Cortical disruption with minor angulation.',
            'No displaced intra-articular extension appreciated.',
            'Associated soft tissue edema.'
          ],
          impression: '1. Acute cortical fracture.\n2. Moderate soft tissue edema.',
          radiologist: 'Dr. S. Chen',
          obbBox: {
            top: '35%',
            left: '40%',
            width: '22%',
            height: '25%',
            label: 'Fracture (97.8%)',
          },
        };
        
        setCompletedRecord(fallbackRecord);
        setUploadStatus('completed');
      }
    }, intervalTime);
  };

  const renderContent = () => {
    const activeImageUrl = uploadedBase64 || selectedPresetImage;

    if (uploadStatus === 'processing') {
      const steps = [
        'Image uploaded',
        'Preparing image...',
        'AI model analyzing...',
        'Detecting abnormalities...',
        'Finalizing analysis...'
      ];

      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-8 px-4">
          <div className="relative w-56 h-56 rounded-xl overflow-hidden border border-[#00B4DB]/30 shadow-[0_0_15px_rgba(0,180,219,0.15)] bg-black/50">
            <img src={activeImageUrl} alt="Processing" className="w-full h-full object-contain grayscale opacity-60" />
            <div className="absolute inset-0 bg-[#00B4DB]/10"></div>
            {/* Scanning Line Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#4cd6fe] shadow-[0_0_12px_3px_#4cd6fe] animate-scan-line"></div>
          </div>

          <div className="w-full max-w-sm space-y-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-sm font-bold text-[#4cd6fe]">
                  {steps[Math.min(processingStep + 1, 4)]}
                </h4>
                <span className="text-xs font-mono text-[#bcc8ce]">{processingProgress}%</span>
              </div>

              <div className="w-full h-2 bg-[#0D1626] rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#007c98] to-[#00B4DB] transition-all duration-75 ease-out"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3 mt-4 text-xs bg-[#0D1626]/50 p-4 rounded-xl border border-white/5">
              {steps.map((step, idx) => {
                let isCompleted = idx <= processingStep;
                let isActive = idx === processingStep + 1;
                
                if (processingStep === 4) {
                   isCompleted = true;
                   isActive = false;
                }

                return (
                  <div key={idx} className="flex items-center gap-3">
                     {isCompleted ? (
                       <span className="material-symbols-outlined text-[#00B4DB] text-[16px]">check_circle</span>
                     ) : isActive ? (
                       <span className="material-symbols-outlined text-[#4cd6fe] text-[16px] animate-spin">progress_activity</span>
                     ) : (
                       <span className="material-symbols-outlined text-[#bcc8ce]/30 text-[16px]">radio_button_unchecked</span>
                     )}
                     <span className={isCompleted ? 'text-[#bcc8ce]' : isActive ? 'text-white font-medium glow-text' : 'text-[#bcc8ce]/40'}>
                       {step}
                     </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (uploadStatus === 'completed') {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Analysis Complete</h3>
            <p className="text-sm text-[#bcc8ce]">
              The X-Ray image has been processed successfully.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                if (completedRecord) {
                  onScanCreated(completedRecord);
                  onClose();
                }
              }}
              className="btn-gradient px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span>View Results</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      );
    }

    if (uploadStatus === 'error') {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <span className="material-symbols-outlined text-5xl text-red-400">error</span>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
            <p className="text-sm text-[#bcc8ce]">
              {analysisError || 'Something went wrong while processing the image.'}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setUploadStatus('idle')}
              className="px-6 py-2.5 rounded-lg font-bold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    // Default 'idle' form view
    const isAgeValid = patientAge.trim() !== '' && Number(patientAge) >= 0 && Number(patientAge) <= 120;
    const isFormValid = patientName.trim() !== '' && isAgeValid && (uploadedBase64 || selectedPresetImage);

    return (
      <div className="space-y-4 text-xs text-[#dae4eb]">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
              Patient Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className={`w-full bg-[#0D1626] border ${!patientName.trim() ? 'border-red-500/50' : 'border-white/10'} rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB]`}
              placeholder="e.g. Hussam Mohamed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
              Patient Age <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              className={`w-full bg-[#0D1626] border ${
                patientAge.trim() !== '' && !isAgeValid
                  ? 'border-red-500 focus:border-red-500'
                  : !patientAge.trim() 
                  ? 'border-red-500/50 focus:border-red-500/50'
                  : 'border-white/10 focus:border-[#00B4DB]'
              } rounded-lg p-2 text-white focus:outline-none`}
              placeholder="e.g. 25"
            />
            {patientAge.trim() !== '' && !isAgeValid && (
              <p className="text-[10px] text-red-400 mt-1">Age must be between 0 and 120.</p>
            )}
            {patientAge.trim() === '' && (
              <p className="text-[10px] text-red-400 mt-1">Patient Age is required.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
            Modality
          </label>
          <div className="w-full bg-[#0D1626] border border-white/10 rounded-lg p-2 text-white/70 cursor-not-allowed">
            {modality}
          </div>
        </div>

        {/* Image Selection Tabs */}
        <div>
          <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1.5">
            Select X-Ray Image
          </label>

          {(uploadedBase64 || selectedPresetImage) ? (
            <div className="relative border border-[#00B4DB]/30 rounded-xl overflow-hidden bg-[#0D1626] flex items-center p-3 gap-4 shadow-[0_0_15px_rgba(0,180,219,0.1)]">
              <img 
                src={(uploadedBase64 || selectedPresetImage) as string} 
                alt="Selected X-Ray" 
                className="w-16 h-16 object-cover rounded-lg border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">
                  {uploadedBase64 ? 'custom-scan.png' : 'preset-scan.jpg'}
                </p>
                <p className="text-xs text-[#00B4DB] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">radiology</span>
                  X-Ray Format
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadedBase64(null);
                  setSelectedPresetImage(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove Image"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ) : (
            <>
              {/* Sample Presets */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {samplePresets.map((preset) => (
                  <div
                    key={preset.title}
                    onClick={() => {
                      setSelectedPresetImage(preset.url);
                      setRegion(preset.region);
                      setUploadedBase64(null);
                    }}
                    className="p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-all border-white/10 hover:border-[#00B4DB]/50 bg-[#0D1626] group"
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-10 h-10 object-cover rounded grayscale group-hover:grayscale-0 transition-all"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate text-[11px] group-hover:text-[#4cd6fe]">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-[#bcc8ce]">{preset.region}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drag & Drop File Input */}
              <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#00B4DB]/60 transition-colors bg-[#0D1626]/50">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, application/dicom"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="scan-file-input"
                />
                <label
                  htmlFor="scan-file-input"
                  className="cursor-pointer flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-2xl text-[#00B4DB]">
                    cloud_upload
                  </span>
                  <span className="font-medium text-white">
                    Click to Upload Custom X-Ray
                  </span>
                  <span className="text-[10px] text-[#bcc8ce]">
                    Supports PNG, JPG, JPEG, WebP, or DICOM exports
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#bcc8ce] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={simulateAnalysis}
            disabled={!isFormValid}
            className="btn-gradient px-5 py-2 rounded-lg font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze with Best AI
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="card-bg border border-[#00B4DB]/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00B4DB]">
              {uploadStatus === 'processing' ? 'memory' : uploadStatus === 'completed' ? 'verified' : 'upload_file'}
            </span>
            <h3 className="text-base font-bold text-white">
              {uploadStatus === 'processing' ? 'Analyzing X-Ray' : uploadStatus === 'completed' ? 'Ready' : 'Upload Scan for AI Analysis'}
            </h3>
          </div>
          {uploadStatus !== 'processing' && (
            <button onClick={onClose} className="text-[#bcc8ce] hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};
