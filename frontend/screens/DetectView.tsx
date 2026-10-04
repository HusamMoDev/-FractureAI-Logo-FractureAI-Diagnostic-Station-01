import React, { useState } from 'react';
import { ScanRecord, PageTab } from '../types';
import { supabase } from '../lib/supabase';
import DiagnosisModal from './DiagnosisModal';

interface DetectViewProps {
  scan: ScanRecord;
  onNavigateTab: (tab: PageTab) => void;
  onOpenReport: () => void;
  onToggleMeasurementTool: () => void;
  onToggleAngleTool: () => void;
  isMeasurementActive: boolean;
  isAngleActive: boolean;
}

type AnalysisState =
  | 'pending'
  | 'running'
  | 'validated'
  | 'error';

export const DetectView: React.FC<DetectViewProps> = ({
  scan,
  onNavigateTab,
  onOpenReport,
  onToggleMeasurementTool,
  onToggleAngleTool,
  isMeasurementActive,
  isAngleActive,
}) => {
  const [viewSegment, setViewSegment] = useState<
    'bone' | 'soft' | 'metal'
  >('bone');

  const [showHeatmap, setShowHeatmap] =
    useState<boolean>(false);

  const [zoomLevel, setZoomLevel] =
    useState<number>(1);

  const [showDiagnosisModal, setShowDiagnosisModal] =
    useState(false);

  const [analysisState, setAnalysisState] =
    useState<AnalysisState>(
      scan.status === 'Pending'
        ? 'pending'
        : 'validated'
    );

  const [analysisMessage, setAnalysisMessage] =
    useState<string>(
      scan.status === 'Pending'
        ? 'The X-Ray is waiting for AI analysis.'
        : 'AI validation completed.'
    );

  const [analysisError, setAnalysisError] =
    useState<string>('');

  const [validationData, setValidationData] =
    useState<{
      imageId?: string;
      filename?: string;
      storagePath?: string;
      nextStage?: string;
    } | null>(null);

  const filterStyle =
    viewSegment === 'bone'
      ? 'grayscale contrast-125 brightness-90'
      : viewSegment === 'soft'
      ? 'grayscale contrast-150 brightness-110 saturate-150'
      : 'grayscale contrast-200 brightness-75';

  const handleZoomIn = () =>
    setZoomLevel((prev) =>
      Math.min(prev + 0.25, 2.5)
    );

  const handleZoomOut = () =>
    setZoomLevel((prev) =>
      Math.max(prev - 0.25, 0.75)
    );

  const handleResetZoom = () =>
    setZoomLevel(1);

  /**
   * Run the currently available AI pipeline stage.
   *
   * At this stage the Edge Function validates:
   * - authenticated user
   * - image ownership
   * - clinic access
   * - storage file
   * - file size
   *
   * YOLO-OBB execution is intentionally NOT performed yet
   * because the model weights are not connected.
   */
  const handleRunAIAnalysis = async () => {
    try {
      setAnalysisState('running');
      setAnalysisError('');
      setAnalysisMessage(
        'Validating the X-Ray and preparing it for AI analysis...'
      );

      /*
       * The ScanRecord id is the Case ID in the current
       * application mapping.
       *
       * Find the most recent X-Ray belonging to this case.
       */
      const {
        data: image,
        error: imageLookupError,
      } = await supabase
        .from('images_xray')
        .select(`
          id,
          id_case,
          filename_original,
          path_storage,
          status_inference,
          at_created
        `)
        .eq('id_case', scan.id)
        .order('at_created', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (imageLookupError) {
        throw new Error(
          `Could not find the X-Ray image: ${imageLookupError.message}`
        );
      }

      if (!image) {
        throw new Error(
          'No X-Ray image was found for this case.'
        );
      }

      if (image.status_inference !== 'queued') {
        throw new Error(
          `This X-Ray cannot be processed because its current status is "${image.status_inference}".`
        );
      }

      /*
       * Call the deployed Supabase Edge Function.
       */
      const {
        data,
        error: functionError,
      } = await supabase.functions.invoke(
        'inference-run',
        {
          body: {
            id_image_xray: image.id,
          },
        }
      );

      if (functionError) {
        throw new Error(
          functionError.message ||
            'The AI inference function failed.'
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            'The AI inference request was not successful.'
        );
      }

      /*
       * The current Edge Function is validation-only.
       * It does NOT execute YOLO-OBB yet.
       */
      setValidationData({
        imageId: data.image?.id,
        filename:
          data.image?.filename_original,
        storagePath:
          data.image?.storage_path,
        nextStage:
          data.nextStage ||
          data.next_stage,
      });

      setAnalysisState('validated');

      setAnalysisMessage(
        data.message ||
          'X-Ray validation succeeded. The image is ready for YOLO-OBB inference.'
      );
    } catch (error) {
      console.error(
        'Run AI analysis error:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error while starting AI analysis.';

      setAnalysisState('error');
      setAnalysisError(message);
      setAnalysisMessage(
        'The AI analysis could not be started.'
      );
    }
  };

  const isPending =
    analysisState === 'pending';

  const isRunning =
    analysisState === 'running';

  const isValidated =
    analysisState === 'validated';

  const hasError =
    analysisState === 'error';

  return (
    <>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4 pb-8">

        {/* =========================================================
            IMAGE VIEWER
        ========================================================== */}
        <div className="flex-[3] glass-panel rounded-xl flex flex-col relative overflow-hidden min-h-[500px]">

          {/* Viewer Toolbar */}
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-black/30">

            {/* Segmented Control */}
            <div className="flex bg-[#0D1626] p-1 rounded-lg border border-white/5">

              <button
                onClick={() =>
                  setViewSegment('bone')
                }
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewSegment === 'bone'
                    ? 'bg-[#007c98]/30 text-[#4cd6fe] font-semibold border border-[#00B4DB]/40'
                    : 'text-[#bcc8ce] hover:text-white'
                }`}
              >
                Bone
              </button>

              <button
                onClick={() =>
                  setViewSegment('soft')
                }
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewSegment === 'soft'
                    ? 'bg-[#007c98]/30 text-[#4cd6fe] font-semibold border border-[#00B4DB]/40'
                    : 'text-[#bcc8ce] hover:text-white'
                }`}
              >
                Soft Tissue
              </button>

              <button
                onClick={() =>
                  setViewSegment('metal')
                }
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewSegment === 'metal'
                    ? 'bg-[#007c98]/30 text-[#4cd6fe] font-semibold border border-[#00B4DB]/40'
                    : 'text-[#bcc8ce] hover:text-white'
                }`}
              >
                Metal
              </button>

            </div>

            {/* Tools */}
            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  setShowHeatmap(
                    !showHeatmap
                  )
                }
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  showHeatmap
                    ? 'text-[#4cd6fe] bg-[#00B4DB]/20 border-[#00B4DB]/40 shadow-[0_0_10px_rgba(0,180,219,0.2)]'
                    : 'text-[#bcc8ce] border-transparent hover:bg-white/5'
                }`}
                title="Toggle Heatmap"
              >
                <span className="material-symbols-outlined text-[18px]">
                  texture
                </span>

                <span className="hidden sm:inline">
                  Heatmap
                </span>
              </button>

              <div className="w-px h-4 bg-white/10 mx-1"></div>

              <button
                onClick={
                  onToggleMeasurementTool
                }
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isMeasurementActive
                    ? 'text-[#4cd6fe] bg-[#00B4DB]/20 border-[#00B4DB]/40'
                    : 'text-[#bcc8ce] border-transparent hover:bg-white/5'
                }`}
                title="Caliper Measurement"
              >
                <span className="material-symbols-outlined text-[18px]">
                  straighten
                </span>

                <span className="hidden sm:inline">
                  Caliper
                </span>
              </button>

              <button
                onClick={
                  onToggleAngleTool
                }
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isAngleActive
                    ? 'text-[#4cd6fe] bg-[#00B4DB]/20 border-[#00B4DB]/40'
                    : 'text-[#bcc8ce] border-transparent hover:bg-white/5'
                }`}
                title="Angle Measurement"
              >
                <span className="material-symbols-outlined text-[18px]">
                  square_foot
                </span>

                <span className="hidden sm:inline">
                  Angle
                </span>
              </button>

              <div className="w-px h-4 bg-white/10 mx-1"></div>

              <button
                onClick={() =>
                  onNavigateTab('explain')
                }
                className="p-1.5 rounded-md text-[#bcc8ce] hover:text-[#4cd6fe] hover:bg-white/5 transition-colors flex items-center gap-1 text-xs"
                title="AI Explanation"
              >
                <span className="material-symbols-outlined text-[18px]">
                  description
                </span>

                <span className="hidden xl:inline">
                  Explain
                </span>
              </button>

            </div>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 relative bg-[#060F14] flex items-center justify-center overflow-hidden p-4">

            {/* Main X-Ray Image */}
            <div
              className="relative max-h-full max-w-full aspect-[3/4] p-2 flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >

              <img
                src={scan.imageUrl}
                alt={scan.region}
                className={`max-h-[460px] object-contain ${filterStyle} z-10 relative rounded-sm shadow-2xl`}
              />

              {/* Heatmap
                  Only show the visualization when we actually have
                  AI output. Never show a fake AI heatmap while pending.
              */}
              {showHeatmap &&
                isValidated &&
                scan.confidence !== null &&
                scan.confidence !== undefined && (
                  <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50 z-20 flex items-center justify-center">
                    <div
                      className="w-1/3 h-1/3 rounded-full"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,0,0,0.85) 0%, rgba(255,165,0,0.6) 45%, rgba(0,180,219,0) 80%)',
                        filter:
                          'blur(20px)',
                        transform:
                          'translate(10%, -10%)',
                      }}
                    ></div>
                  </div>
                )}

              {/* Real OBB Detection Box only */}
              {isValidated &&
                scan.obbBox && (
                  <div
                    className="absolute z-30 obb-box rounded-sm ai-glow flex flex-col justify-end p-1"
                    style={{
                      top:
                        scan.obbBox.top,
                      left:
                        scan.obbBox.left,
                      width:
                        scan.obbBox.width,
                      height:
                        scan.obbBox.height,
                      transform: `rotate(${
                        scan.obbBox.rotation ||
                        '0deg'
                      })`,
                    }}
                  >
                    <div className="bg-[#00b4db] text-[#003543] text-[10px] font-bold px-1.5 py-0.5 rounded-sm w-max absolute -top-5 -left-0.5 whitespace-nowrap shadow-md border border-[#00B4DB]">
                      {scan.obbBox.label}
                    </div>
                  </div>
                )}

            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-[#12263A]/90 backdrop-blur-md p-1.5 rounded-lg border border-white/10 z-40 shadow-xl">

              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-white/10 text-[#bcc8ce] hover:text-white transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-lg">
                  add
                </span>
              </button>

              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-white/10 text-[#bcc8ce] hover:text-white transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-lg">
                  remove
                </span>
              </button>

              <div className="w-full h-px bg-white/10 my-0.5"></div>

              <button
                onClick={handleResetZoom}
                className="p-1 rounded hover:bg-white/10 text-[#bcc8ce] hover:text-white transition-colors"
                title="Reset Zoom"
              >
                <span className="material-symbols-outlined text-lg">
                  zoom_out_map
                </span>
              </button>

            </div>

            {/* Patient Metadata */}
            <div className="absolute top-4 left-4 text-[#bcc8ce] font-mono text-[11px] leading-relaxed z-30 pointer-events-none opacity-80 bg-black/40 backdrop-blur-sm p-2 rounded border border-white/5">

              <p className="font-bold text-white">
                Pt: {scan.patientName}
              </p>

              <p>
                Age: {scan.patientAge || scan.dob}
              </p>

              <p>
                MRN: {scan.mrn}
              </p>

              <p>
                Date: {scan.date}
              </p>

              <p>
                Modality: {scan.modality}
              </p>

              <p>
                Region: {scan.region}
              </p>

            </div>
          </div>
        </div>

        {/* =========================================================
            AI ANALYSIS SIDEBAR
        ========================================================== */}
        <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col gap-4">

          <div className="glass-panel rounded-xl flex-1 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/30 flex items-center justify-between">

              <h2 className="text-base font-semibold text-white flex items-center gap-2">

                <span className="material-symbols-outlined text-[#00B4DB] text-[20px]">
                  psychology
                </span>

                <span>
                  AI Analysis
                </span>

              </h2>

              <div
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                  isRunning
                    ? 'bg-[#f59e0b] text-[#2b1600]'
                    : isValidated
                    ? 'bg-[#00b4db] text-[#003543]'
                    : hasError
                    ? 'bg-[#ef4444] text-white'
                    : 'bg-[#475569] text-white'
                }`}
              >

                <span className="w-1.5 h-1.5 rounded-full bg-current block"></span>

                <span>
                  {isRunning
                    ? 'Running'
                    : isValidated
                    ? 'Validated'
                    : hasError
                    ? 'Error'
                    : 'Pending'}
                </span>

              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-5 custom-scrollbar">

              {/* Status */}
              <div>

                <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                  Analysis Status
                </p>

                <div className="bg-[#0D1626] border border-white/10 rounded-lg p-3">

                  <div className="flex items-center gap-2 mb-2">

                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isRunning
                          ? 'text-[#f59e0b]'
                          : isValidated
                          ? 'text-[#4cd6fe]'
                          : hasError
                          ? 'text-[#ef4444]'
                          : 'text-[#facc15]'
                      }`}
                    >
                      {isRunning
                        ? 'progress_activity'
                        : isValidated
                        ? 'verified'
                        : hasError
                        ? 'error'
                        : 'schedule'}
                    </span>

                    <h3 className="text-sm font-semibold text-white">
                      {isRunning
                        ? 'AI validation in progress'
                        : isValidated
                        ? 'X-Ray validated'
                        : hasError
                        ? 'Analysis error'
                        : 'Analysis pending'}
                    </h3>

                  </div>

                  <p className="text-xs text-[#bcc8ce] leading-relaxed">
                    {analysisMessage}
                  </p>

                </div>
              </div>

              {/* Primary Detection */}
              <div>

                <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                  Primary Detection
                </p>

                <div className="bg-[#0D1626] border border-white/10 rounded-lg p-3">

                  {scan.confidence !== null &&
                  scan.confidence !== undefined &&
                  scan.primaryFinding &&
                  scan.primaryFinding !== 'Analysis pending' ? (
                    <>
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
                          style={{
                            width: `${Math.min(
                              scan.confidence,
                              100
                            )}%`,
                          }}
                        ></div>

                      </div>

                      {scan.findingsList?.length > 0 && (
                        <p className="text-xs text-[#bcc8ce] leading-relaxed">
                          {scan.findingsList[0]}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between">

                      <span className="text-sm text-[#bcc8ce]">
                        No AI detection yet
                      </span>

                      <span className="text-xs font-semibold text-[#facc15]">
                        Pending
                      </span>

                    </div>
                  )}

                </div>
              </div>

              {/* Secondary Finding */}
              {scan.secondaryFinding &&
                scan.secondaryFinding !==
                  'Analysis pending' &&
                scan.confidence !== null &&
                scan.confidence !== undefined && (
                  <div>

                    <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                      Secondary Findings
                    </p>

                    <div className="bg-[#0D1626] border border-white/10 rounded-lg p-3">

                      <div className="flex justify-between items-start mb-1.5">

                        <h3 className="text-xs font-medium text-[#4cd6fe]">
                          {scan.secondaryFinding}
                        </h3>

                        {scan.secondaryConfidence !==
                          undefined &&
                          scan.secondaryConfidence !==
                            null && (
                            <span className="text-xs text-[#bcc8ce]">
                              {scan.secondaryConfidence}%
                            </span>
                          )}

                      </div>

                      {scan.secondaryConfidence !==
                        undefined &&
                        scan.secondaryConfidence !==
                          null && (
                          <div className="w-full bg-[#2d363b] rounded-full h-1 mb-1 overflow-hidden">

                            <div
                              className="bg-[#4cd6fe] h-1 rounded-full"
                              style={{
                                width: `${Math.min(
                                  scan.secondaryConfidence,
                                  100
                                )}%`,
                              }}
                            ></div>

                          </div>
                        )}

                    </div>
                  </div>
                )}

              {/* Recommendation */}
              <div>

                <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                  AI Recommendation
                </p>

                <div className="bg-[#0D1626] border border-[#00B4DB]/30 rounded-lg p-3">

                  <p className="text-xs text-[#dae4eb] leading-relaxed">

                    {isValidated
                      ? 'The X-Ray passed validation and is ready for the YOLO-OBB inference stage. No diagnostic result has been generated yet.'
                      : 'AI analysis is pending. No diagnostic recommendation has been generated.'}

                  </p>

                </div>
              </div>

              {/* Validation Information */}
              {isValidated &&
                validationData && (
                  <div className="border-t border-white/5 pt-3">

                    <p className="text-xs font-semibold text-[#bcc8ce] mb-1.5 uppercase tracking-wider">
                      Validation Details
                    </p>

                    <div className="space-y-1 text-[11px] text-[#bcc8ce]/80 font-mono bg-[#0D1626] p-2 rounded border border-white/5">

                      {validationData.filename && (
                        <div className="flex justify-between gap-3">
                          <span>
                            File:
                          </span>

                          <span className="text-white truncate">
                            {validationData.filename}
                          </span>
                        </div>
                      )}

                      {validationData.imageId && (
                        <div className="flex justify-between gap-3">
                          <span>
                            Image ID:
                          </span>

                          <span className="text-white truncate">
                            {validationData.imageId}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>
                          Next Stage:
                        </span>

                        <span className="text-[#4cd6fe]">
                          {validationData.nextStage ||
                            'YOLO-OBB inference'}
                        </span>
                      </div>

                    </div>
                  </div>
                )}

              {/* Error */}
              {hasError && (
                <div className="bg-[#3b1111] border border-[#ef4444]/40 rounded-lg p-3">

                  <div className="flex items-start gap-2">

                    <span className="material-symbols-outlined text-[#ef4444] text-[18px]">
                      error
                    </span>

                    <p className="text-xs text-[#fecaca] leading-relaxed">
                      {analysisError}
                    </p>

                  </div>

                </div>
              )}

              {/* Technical Parameters */}
              <div className="border-t border-white/5 pt-3">

                <details className="group">

                  <summary className="text-xs text-[#bcc8ce] cursor-pointer flex items-center justify-between list-none font-medium hover:text-white">

                    <span>
                      Technical Parameters
                    </span>

                    <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">
                      expand_more
                    </span>

                  </summary>

                  <div className="mt-2 space-y-1 text-[11px] text-[#bcc8ce]/80 font-mono bg-[#0D1626] p-2 rounded border border-white/5">

                    <div className="flex justify-between">
                      <span>
                        Model:
                      </span>

                      <span className="text-white">
                        Not connected
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>
                        Inference:
                      </span>

                      <span className="text-white">
                        Validation only
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>
                        YOLO-OBB:
                      </span>

                      <span className="text-[#facc15]">
                        Waiting for model
                      </span>
                    </div>

                  </div>
                </details>
              </div>

            </div>

            {/* =====================================================
                ACTION AREA
            ====================================================== */}
            <div className="p-4 border-t border-white/5 bg-black/30 space-y-2">

              <button
                onClick={handleRunAIAnalysis}
                disabled={isRunning}
                className={`w-full font-semibold py-2.5 rounded-lg text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isRunning
                    ? 'bg-[#334155] text-[#94a3b8] cursor-not-allowed'
                    : 'btn-gradient hover:brightness-110 active:scale-95'
                }`}
              >

                <span className="material-symbols-outlined text-[18px]">
                  {isRunning
                    ? 'progress_activity'
                    : 'neurology'}
                </span>

                <span>
                  {isRunning
                    ? 'Validating X-Ray...'
                    : isValidated
                    ? 'Run Validation Again'
                    : 'Run AI Analysis'}
                </span>

              </button>

              <button
                onClick={() =>
                  onNavigateTab('explain')
                }
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#dae4eb] font-semibold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
              >

                <span className="material-symbols-outlined text-[18px]">
                  description
                </span>

                <span>
                  Open AI Explanation
                </span>

              </button>

              <button
                onClick={() =>
                  setShowDiagnosisModal(true)
                }
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#dae4eb] font-semibold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2"
              >

                <span className="material-symbols-outlined text-[18px]">
                  article
                </span>

                <span>
                  Medical Report
                </span>

              </button>

            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          DOCTOR DIAGNOSIS MODAL
      ========================================================== */}
      {showDiagnosisModal && (
        <DiagnosisModal
          caseId={scan.id}
          onClose={() =>
            setShowDiagnosisModal(false)
          }
          onSaved={() => {
            setShowDiagnosisModal(false);
            onOpenReport();
          }}
        />
      )}
    </>
  );
};