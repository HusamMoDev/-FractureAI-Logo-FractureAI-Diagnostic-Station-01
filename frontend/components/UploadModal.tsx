import React, { useEffect, useState } from 'react';
import { ScanRecord, Modality } from '../types';
import { supabase } from '../lib/supabase';
import { runInference } from '../services/inference';

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
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientSex, setPatientSex] = useState<string>('');
  const [modality, setModality] = useState<Modality | ''>('');
  const [region, setRegion] = useState('');

  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [completedRecord, setCompletedRecord] = useState<ScanRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPatientName('');
      setPatientAge('');
      setPatientSex('');
      setModality('');
      setRegion('');
       setUploadedBase64(null);
      setSelectedFile(null);

      setUploadStatus('idle');
      setProcessingProgress(0);
      setProcessingStep(0);
      setAnalysisError(null);
      setCompletedRecord(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setUploadedBase64(null);

    const isImagePreviewable =
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/webp';

    if (isImagePreviewable) {
      const reader = new FileReader();

      reader.onload = () => {
        setUploadedBase64(reader.result as string);
      };

      reader.readAsDataURL(file);
    } else {
      setUploadedBase64(null);
    }
  };

  const calculateSha256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const generateMrn = () => {
    const randomPart = Math.floor(
      100000 + Math.random() * 900000,
    );

    return `MRN-${randomPart}`;
  };

  const generateStoragePath = (
    userId: string,
    caseId: string,
    fileName: string,
  ) => {
    const safeFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');

    return `${userId}/${caseId}/${Date.now()}-${safeFileName}`;
  };

  const createPendingScanRecord = (
  caseId: string,
  mrn: string,
  imageUrl: string,
): ScanRecord => {
  return {
    id: caseId,
    patientName,
    patientAge: Number(patientAge),
    dob: '',
    mrn,
    gender: patientSex,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    modality: modality as Modality,
    region,
    status: 'Pending',
    confidence: null,
    imageUrl,
    primaryFinding: 'Analysis pending',
    secondaryFinding: '',
    secondaryConfidence: 0,
    recommendation: 'AI analysis is pending.',
    indication: '',
    technique: `${modality} acquisition.`,
    findingsList: [],
    impression: 'AI analysis is pending.',
    radiologist: '',
    obbBox: undefined,
  };
};

  const simulateProgress = (
    progress: number,
    step: number,
  ) => {
    setProcessingProgress(progress);
    setProcessingStep(step);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setAnalysisError('Please select an X-Ray image.');
      setUploadStatus('error');
      return;
    }

    if (!patientName.trim()) {
      setAnalysisError('Patient Name is required.');
      setUploadStatus('error');
      return;
    }

    if (patientAge.trim() === '' || Number(patientAge) < 0 || Number(patientAge) > 120) {
      setAnalysisError('Patient Age must be between 0 and 120.');
      setUploadStatus('error');
      return;
    }

    if (!patientSex) {
      setAnalysisError('Sex is required.');
      setUploadStatus('error');
      return;
    }

    if (!region.trim()) {
      setAnalysisError('Region is required.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('processing');
    setAnalysisError(null);
    setProcessingProgress(0);
    setProcessingStep(0);

    try {
      // ---------------------------------------------------------
      // 1. Get authenticated user
      // ---------------------------------------------------------
      simulateProgress(10, 0);

      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          'No authenticated user. Please sign in again.',
        );
      }

      // ---------------------------------------------------------
      // 2. Get user's clinic
      // ---------------------------------------------------------
      simulateProgress(15, 0);

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id_clinic')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(
          `Could not load user profile: ${profileError.message}`,
        );
      }

      if (!profile?.id_clinic) {
        throw new Error(
          'Your account is not linked to a clinic.',
        );
      }

      // ---------------------------------------------------------
      // 3. Find existing patient or create a new patient
      //
      // Patient identity is now handled by the database RPC.
      // The upload form does NOT collect DOB and does not use a fake/default age.
      // The RPC reuses an existing patient in the same clinic when
      // normalized name + sex match; otherwise it creates a patient
      // with a unique MRN.
      // ---------------------------------------------------------
      simulateProgress(25, 1);

      const {
        data: patient,
        error: patientError,
      } = await supabase.rpc('patient_find_or_create', {
        p_name_full: patientName.trim(),
        p_age: Number(patientAge),
        p_sex: patientSex,
      });

      if (patientError || !patient) {
        throw new Error(
          `Could not find or create patient: ${
            patientError?.message || 'Unknown error'
          }`,
        );
      }

      const mrn = patient.number_record_medical as string;

      // ---------------------------------------------------------
      // 4. Create Case using case_create RPC
      //
      // case_create arguments:
      // p_id_patient uuid
      // p_part_body text
      // p_priority text
      // p_summary text
      // ---------------------------------------------------------
      simulateProgress(40, 1);

     const { data: caseId, error: caseError } = await supabase.rpc('case_create', {
  id_patient_p: patient.id,
  part_body_p: region.trim(),
  priority_p: 'normal',
  summary_p: `X-Ray examination for ${patientName.trim()}.`,
});

      if (caseError || !caseId) {
        throw new Error(
          `Could not create case: ${
            caseError?.message || 'No case ID returned.'
          }`,
        );
      }

      // ---------------------------------------------------------
      // 5. Calculate file hash
      // ---------------------------------------------------------
      simulateProgress(50, 1);

      const sha256 = await calculateSha256(selectedFile);

      // ---------------------------------------------------------
      // 6. Upload actual X-Ray to Supabase Storage
      // ---------------------------------------------------------
      simulateProgress(60, 2);

      const bucketName = 'images-xray';

      const storagePath = generateStoragePath(
        user.id,
        caseId,
        selectedFile.name,
      );

      const {
        error: storageError,
      } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, selectedFile, {
          contentType:
            selectedFile.type || 'application/octet-stream',
          upsert: false,
        });

      if (storageError) {
        throw new Error(
          `X-Ray upload failed: ${storageError.message}`,
        );
      }

      // ---------------------------------------------------------
      // 7. Create images_xray metadata record
      // ---------------------------------------------------------
      simulateProgress(72, 2);

      const {
        data: imageRecord,
        error: imageRecordError,
      } = await supabase
        .from('images_xray')
        .insert({
          by_uploaded: user.id,
          id_case: caseId,
          bucket_storage: bucketName,
          path_storage: storagePath,
          filename_original: selectedFile.name,
          type_mime:
            selectedFile.type || 'application/octet-stream',
          bytes_size_file: selectedFile.size,
          sha256,
          status_inference: 'queued',
        })
        .select(
          `
          id,
          id_case,
          filename_original,
          type_mime,
          bytes_size_file,
          status_inference
          `,
        )
        .single();

      if (imageRecordError || !imageRecord) {
        // If database metadata creation fails after Storage upload,
        // remove the uploaded object so we do not leave an orphan file.
        await supabase.storage
          .from(bucketName)
          .remove([storagePath]);

        throw new Error(
          `Could not create X-Ray metadata: ${
            imageRecordError?.message || 'Unknown error'
          }`,
        );
      }

      // ---------------------------------------------------------
      // 8. Run inference validation / AI pipeline
      // ---------------------------------------------------------
      simulateProgress(82, 3);

      const inferenceResult = await runInference(
        imageRecord.id,
      );

      // ---------------------------------------------------------
      // 9. Create signed URL for immediate UI display
      // ---------------------------------------------------------
      simulateProgress(92, 4);

      let imageUrl = uploadedBase64 || '';

      const {
        data: signedUrlData,
        error: signedUrlError,
      } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, 60 * 60);

      if (signedUrlError) {
        console.warn(
          'Could not create signed URL:',
          signedUrlError,
        );
      } else if (signedUrlData?.signedUrl) {
        imageUrl = signedUrlData.signedUrl;
      }

      // ---------------------------------------------------------
      // 10. Create UI record
      //
      // IMPORTANT:
      // No fake AI result is created here.
      // ---------------------------------------------------------
      simulateProgress(100, 4);

      const pendingRecord = createPendingScanRecord(
        caseId,
        mrn,
        imageUrl,
      );

      setCompletedRecord(pendingRecord);

      console.log(
        'Real upload/inference validation completed:',
        {
          patientId: patient.id,
          caseId,
          imageId: imageRecord.id,
          inference: inferenceResult,
        },
      );

      setUploadStatus('completed');
    } catch (error) {
      console.error(
        'Real X-Ray upload/inference workflow failed:',
        error,
      );

      setAnalysisError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while processing the X-Ray.',
      );

      setUploadStatus('error');
    }
  };

  const renderContent = () => {
    const activeImageUrl = uploadedBase64;

    if (uploadStatus === 'processing') {
      const steps = [
        'Patient and case prepared',
        'Preparing X-Ray...',
        'Uploading X-Ray...',
        'Sending to AI service...',
        'Finalizing...',
      ];

      return (
        <div className="py-8 flex flex-col items-center justify-center space-y-8 px-4">
          <div className="relative w-56 h-56 rounded-xl overflow-hidden border border-[#00B4DB]/30 shadow-[0_0_15px_rgba(0,180,219,0.15)] bg-black/50">
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt="Processing"
                className="w-full h-full object-contain grayscale opacity-60"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#bcc8ce]">
                X-Ray
              </div>
            )}

            <div className="absolute inset-0 bg-[#00B4DB]/10"></div>

            <div className="absolute top-0 left-0 w-full h-1 bg-[#4cd6fe] shadow-[0_0_12px_3px_#4cd6fe] animate-scan-line"></div>
          </div>

          <div className="w-full max-w-sm space-y-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-sm font-bold text-[#4cd6fe]">
                  {steps[Math.min(processingStep, 4)]}
                </h4>

                <span className="text-xs font-mono text-[#bcc8ce]">
                  {processingProgress}%
                </span>
              </div>

              <div className="w-full h-2 bg-[#0D1626] rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#007c98] to-[#00B4DB] transition-all duration-75 ease-out"
                  style={{
                    width: `${processingProgress}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 mt-4 text-xs bg-[#0D1626]/50 p-4 rounded-xl border border-white/5">
              {steps.map((step, idx) => {
                const isCompleted =
                  idx < processingStep ||
                  (processingStep === 4 && idx === 4);

                const isActive =
                  idx === processingStep &&
                  processingStep < 5;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3"
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[#00B4DB] text-[16px]">
                        check_circle
                      </span>
                    ) : isActive ? (
                      <span className="material-symbols-outlined text-[#4cd6fe] text-[16px] animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[#bcc8ce]/30 text-[16px]">
                        radio_button_unchecked
                      </span>
                    )}

                    <span
                      className={
                        isCompleted
                          ? 'text-[#bcc8ce]'
                          : isActive
                            ? 'text-white font-medium glow-text'
                            : 'text-[#bcc8ce]/40'
                      }
                    >
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
            <span className="material-symbols-outlined text-5xl text-emerald-400">
              check_circle
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Upload Complete
            </h3>

            <p className="text-sm text-[#bcc8ce]">
              The X-Ray image was uploaded successfully and is
              waiting for AI analysis.
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

              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      );
    }

    if (uploadStatus === 'error') {
      return (
        <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <span className="material-symbols-outlined text-5xl text-red-400">
              error
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Upload Failed
            </h3>

            <p className="text-sm text-[#bcc8ce]">
              {analysisError ||
                'Something went wrong while processing the image.'}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setUploadStatus('idle');
                setAnalysisError(null);
              }}
              className="px-6 py-2.5 rounded-lg font-bold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>

              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    const isAgeValid =
      patientAge.trim() !== '' &&
      Number(patientAge) >= 0 &&
      Number(patientAge) <= 120;

    const isFormValid =
      patientName.trim() !== '' &&
      isAgeValid &&
      patientSex !== '' &&
      modality.trim() !== '' &&
      region.trim() !== '' &&
      !!selectedFile;

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
              className={`w-full bg-[#0D1626] border ${
                !patientName.trim()
                  ? 'border-red-500/50'
                  : 'border-white/10'
              } rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB]`}
              placeholder="Patient name"
            />

            {!patientName.trim() && (
              <p className="text-[10px] text-red-400 mt-1">
                Patient Name is required.
              </p>
            )}
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
              <p className="text-[10px] text-red-400 mt-1">
                Age must be between 0 and 120.
              </p>
            )}

            {patientAge.trim() === '' && (
              <p className="text-[10px] text-red-400 mt-1">
                Patient Age is required.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
              Sex <span className="text-red-400">*</span>
            </label>

            <select
              value={patientSex}
              onChange={(e) => setPatientSex(e.target.value)}
              className={`w-full bg-[#0D1626] border ${
                !patientSex
                  ? 'border-red-500/50'
                  : 'border-white/10'
              } rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB] appearance-none`}
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {!patientSex && (
              <p className="text-[10px] text-red-400 mt-1">
                Sex is required.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
              Modality <span className="text-red-400">*</span>
            </label>

            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as Modality | '')}
              className="w-full bg-[#0D1626] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB] appearance-none"
            >
              <option value="">Select modality</option>
              <option value="X-Ray">X-Ray</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
            Region <span className="text-red-400">*</span>
          </label>

          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={`w-full bg-[#0D1626] border ${
              !region.trim()
                ? 'border-red-500/50'
                : 'border-white/10'
            } rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB]`}
            placeholder="e.g. Left Femur"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
              Modality{' '}
              <span className="text-red-400">*</span>
            </label>

            <select
              value={modality}
              onChange={(e) =>
                setModality(e.target.value as Modality | '')
              }
              className="w-full bg-[#0D1626] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB] appearance-none"
            >
              <option value="">Select modality</option>
              <option value="X-Ray">X-Ray</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1">
              Region{' '}
              <span className="text-red-400">*</span>
            </label>

            <input
              type="text"
              value={region}
              onChange={(e) =>
                setRegion(e.target.value)
              }
              className={`w-full bg-[#0D1626] border ${
                !region.trim()
                  ? 'border-red-500/50'
                  : 'border-white/10'
              } rounded-lg p-2 text-white focus:outline-none focus:border-[#00B4DB]`}
              placeholder="e.g. Left Femur"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#bcc8ce] uppercase mb-1.5">
            Select X-Ray Image
          </label>

          {(uploadedBase64 || selectedFile) ? (
            <div className="relative border border-[#00B4DB]/30 rounded-xl overflow-hidden bg-[#0D1626] flex items-center p-3 gap-4 shadow-[0_0_15px_rgba(0,180,219,0.1)]">
              {uploadedBase64 ? (
                <img
                  src={uploadedBase64}
                  alt="Selected X-Ray"
                  className="w-16 h-16 object-cover rounded-lg border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-white/10 flex items-center justify-center text-[#00B4DB]">
                  <span className="material-symbols-outlined">
                    radiology
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">
                  {selectedFile?.name || 'Selected X-Ray'}
                </p>

                <p className="text-xs text-[#00B4DB] font-medium flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">
                    radiology
                  </span>

                  X-Ray Format
                </p>
              </div>

              <button
                onClick={() => {
                  setUploadedBase64(null);
                             setSelectedFile(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove Image"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
              </button>
            </div>
          ) : (
            <>
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
            onClick={handleAnalyze}
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
              {uploadStatus === 'processing'
                ? 'memory'
                : uploadStatus === 'completed'
                  ? 'verified'
                  : 'upload_file'}
            </span>

            <h3 className="text-base font-bold text-white">
              {uploadStatus === 'processing'
                ? 'Analyzing X-Ray'
                : uploadStatus === 'completed'
                  ? 'Ready'
                  : 'Upload Scan for AI Analysis'}
            </h3>
          </div>

          {uploadStatus !== 'processing' && (
            <button
              onClick={onClose}
              className="text-[#bcc8ce] hover:text-white"
            >
              <span className="material-symbols-outlined">
                close
              </span>
            </button>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};