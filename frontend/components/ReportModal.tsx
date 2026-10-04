import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScanRecord } from '../types';
import { supabase } from '../lib/supabase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanRecord;
  onUpdateScan: (scan: ScanRecord) => void;
}

type ReportStatus = 'draft' | 'finalized';

interface ReportData {
  id: string;
  status: ReportStatus;
  report_findings: string;
  report_impression: string;
  report_recommendations: string;
  doctor_notes: string | null;
  verified_by_doctor: boolean;
  verified_by: string | null;
  at_verified: string | null;
  by_created?: string | null;
}

interface CaseClinicalData {
  summary_clinical: string | null;
  id_patient: string;
  part_body: string | null;
  patient: {
    birth_of_date: string | null;
    sex: string | null;
  } | null;
}

interface PredictionData {
  id: string;
  id_image_xray: string;
  status: 'succeeded' | 'failed';
  detected_fracture: boolean;
  confidence_overall: number | null;
  response_raw: unknown;
  message_error: string | null;
  ms_processing: number | null;
  at_created: string;
}

interface PredictionBox {
  id: string;
  id_prediction: string;
  id_type_fracture: string | null;
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  confidence: number;
  label: string | null;
  at_created: string;
}

interface FinalDiagnosisData {
  id: string;
  case_id: string;
  primary_prediction_id: string | null;
  final_verdict:
    | 'confirmed_fracture'
    | 'no_fracture'
    | 'uncertain';
  fracture_type: string | null;
  severity: string | null;
  clinical_notes: string | null;
  recommended_action: string | null;
  diagnosed_by: string;
  at_created: string;
  finalized_at: string | null;
  verified_by: string | null;
  at_updated: string;
}

const calculateAge = (birthDate: string | null) => {
  if (!birthDate) return null;

  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

const formatDiagnosisStatus = (
  status: FinalDiagnosisData['final_verdict'],
) => {
  switch (status) {
    case 'confirmed_fracture':
      return 'Confirmed Fracture';

    case 'no_fracture':
      return 'No Fracture';

    case 'uncertain':
      return 'Uncertain';

    default:
      return status;
  }
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  scan,
  onUpdateScan,
}) => {
  /*
   * REPORT MODAL SCROLL
   *
   * Keeps the report positioned at the top
   * whenever the modal is opened.
   */
  const reportModalRef =
    useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [caseData, setCaseData] =
    useState<CaseClinicalData | null>(null);

  const [existingReport, setExistingReport] =
    useState<ReportData | null>(null);

  const [finalDiagnosis, setFinalDiagnosis] =
    useState<FinalDiagnosisData | null>(null);

  /*
   * REAL AI DATA
   *
   * images_xray
   *     ↓
   * predictions_ai
   *     ↓
   * boxes_prediction
   *
   * No fake AI result is created.
   */
  const [prediction, setPrediction] =
    useState<PredictionData | null>(null);

  const [predictionBoxes, setPredictionBoxes] =
    useState<PredictionBox[]>([]);

  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendations, setRecommendations] =
    useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  const [reportStatus, setReportStatus] =
    useState<ReportStatus>('draft');

  const age = useMemo(() => {
    if (caseData?.patient?.birth_of_date) {
      return calculateAge(
        caseData.patient.birth_of_date,
      );
    }

    return scan.patientAge ?? null;
  }, [caseData, scan.patientAge]);

  /*
   * Prediction confidence is stored as 0..1.
   * UI displays it as 0..100.
   */
  const confidence =
    prediction?.confidence_overall !== null &&
    prediction?.confidence_overall !== undefined
      ? prediction.confidence_overall * 100
      : typeof scan.confidence === 'number' &&
          scan.confidence > 0
        ? scan.confidence
        : null;

  const hasAiPrediction =
    prediction !== null;

  const hasAiResult =
    prediction?.status === 'succeeded';

  const aiDetectedFracture =
    prediction?.status === 'succeeded' &&
    prediction.detected_fracture === true;

  const aiNoFracture =
    prediction?.status === 'succeeded' &&
    prediction.detected_fracture === false;

  const aiFailed =
    prediction?.status === 'failed';

  const reportIsFinalized =
    reportStatus === 'finalized';

  /*
   * Always start the report from the top.
   *
   * This prevents the report header from appearing
   * cropped after reopening or finalizing the report.
   */
  useEffect(() => {
    if (!isOpen) return;

    const resetReportScroll = () => {
      if (reportModalRef.current) {
        reportModalRef.current.scrollTo({
          top: 0,
          behavior: 'auto',
        });
      }

      window.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    };

    resetReportScroll();

    const frame = requestAnimationFrame(() => {
      resetReportScroll();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  /*
   * Load report data.
   */
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadReportData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      setPrediction(null);
      setPredictionBoxes([]);
      setFinalDiagnosis(null);

      try {
        /*
         * 1. Case + patient
         */
        const {
          data: caseResult,
          error: caseError,
        } = await supabase
          .from('cases')
          .select(`
            id,
            id_patient,
            part_body,
            summary_clinical,
            patients (
              birth_of_date,
              sex
            )
          `)
          .eq('id', scan.id)
          .single();

        if (caseError) {
          throw new Error(
            `Could not load case data: ${caseError.message}`,
          );
        }

        if (cancelled) return;

        const patient =
          Array.isArray(caseResult.patients)
            ? caseResult.patients[0] ?? null
            : caseResult.patients ?? null;

        setCaseData({
          summary_clinical:
            caseResult.summary_clinical ?? null,
          id_patient: caseResult.id_patient,
          part_body: caseResult.part_body ?? null,
          patient,
        });

        /*
         * 2. Existing clinical report
         */
        const {
          data: reportResult,
          error: reportError,
        } = await supabase
          .from('clinical_reports')
          .select(`
            id,
            status,
            report_findings,
            report_impression,
            report_recommendations,
            doctor_notes,
            verified_by_doctor,
            verified_by,
            at_verified,
            by_created
          `)
          .eq('id_case', scan.id)
          .maybeSingle();

        if (
          reportError &&
          reportError.code !== 'PGRST116'
        ) {
          throw new Error(
            `Could not load clinical report: ${reportError.message}`,
          );
        }

        if (cancelled) return;

        if (reportResult) {
          const report =
            reportResult as ReportData;

          setExistingReport(report);
          setReportStatus(report.status);

          setFindings(
            report.report_findings ?? '',
          );

          setImpression(
            report.report_impression ?? '',
          );

          setRecommendations(
            report.report_recommendations ?? '',
          );

          setDoctorNotes(
            report.doctor_notes ?? '',
          );
        } else {
          setExistingReport(null);
          setReportStatus('draft');
          setFindings('');
          setImpression('');
          setRecommendations('');
          setDoctorNotes('');
        }

        /*
         * 3. Load FINAL DOCTOR DIAGNOSIS
         *
         * This comes from:
         * diagnoses
         *
         * No fake diagnosis is created.
         */
        const {
          data: diagnosisResult,
          error: diagnosisError,
        } = await supabase
          .from('diagnoses')
          .select(`
            id,
            case_id,
            primary_prediction_id,
            final_verdict,
            fracture_type,
            severity,
            clinical_notes,
            recommended_action,
            diagnosed_by,
            at_created,
            finalized_at,
            verified_by,
            at_updated
          `)
          .eq('case_id', scan.id)
          .not('finalized_at', 'is', null)
          .order('finalized_at', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (diagnosisError) {
          throw new Error(
            `Could not load final diagnosis: ${diagnosisError.message}`,
          );
        }

        if (cancelled) return;

        if (diagnosisResult) {
          setFinalDiagnosis(
            diagnosisResult as FinalDiagnosisData,
          );
        } else {
          setFinalDiagnosis(null);
        }

        /*
         * 4. Find latest X-Ray
         */
        const {
          data: imageResult,
          error: imageError,
        } = await supabase
          .from('images_xray')
          .select(`
            id,
            status_inference,
            at_created
          `)
          .eq('id_case', scan.id)
          .order('at_created', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (imageError) {
          throw new Error(
            `Could not load X-Ray metadata: ${imageError.message}`,
          );
        }

        if (cancelled) return;

        if (!imageResult) {
          setPrediction(null);
          setPredictionBoxes([]);
          return;
        }

        /*
         * 5. Real AI prediction
         */
        const {
          data: predictionResult,
          error: predictionError,
        } = await supabase
          .from('predictions_ai')
          .select(`
            id,
            id_image_xray,
            status,
            detected_fracture,
            confidence_overall,
            response_raw,
            message_error,
            ms_processing,
            at_created
          `)
          .eq('id_image_xray', imageResult.id)
          .order('at_created', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (predictionError) {
          throw new Error(
            `Could not load AI prediction: ${predictionError.message}`,
          );
        }

        if (cancelled) return;

        if (!predictionResult) {
          setPrediction(null);
          setPredictionBoxes([]);
        } else {
          const realPrediction =
            predictionResult as PredictionData;

          setPrediction(realPrediction);

          /*
           * 6. Real AI bounding boxes
           */
          const {
            data: boxesResult,
            error: boxesError,
          } = await supabase
            .from('boxes_prediction')
            .select(`
              id,
              id_prediction,
              id_type_fracture,
              min_x,
              min_y,
              max_x,
              max_y,
              confidence,
              label,
              at_created
            `)
            .eq(
              'id_prediction',
              realPrediction.id,
            )
            .order('confidence', {
              ascending: false,
            });

          if (boxesError) {
            throw new Error(
              `Could not load AI bounding boxes: ${boxesError.message}`,
            );
          }

          if (cancelled) return;

          setPredictionBoxes(
            (boxesResult ?? []) as PredictionBox[],
          );
        }
      } catch (error) {
        if (cancelled) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load report data.',
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadReportData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, scan.id]);

  if (!isOpen) return null;

  /*
   * SAVE DRAFT
   */
  const handleSaveDraft = async () => {
    if (reportIsFinalized) {
      setErrorMessage(
        'This report is already finalized and cannot be edited.',
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
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

      const aiSummary = prediction
        ? {
            prediction_id: prediction.id,
            status: prediction.status,
            detected_fracture:
              prediction.detected_fracture,
            confidence_overall:
              prediction.confidence_overall,
            boxes_count:
              predictionBoxes.length,
            processing_ms:
              prediction.ms_processing,
            prediction_created_at:
              prediction.at_created,
          }
        : null;

      const payload = {
        id_case: scan.id,
        by_created:
          existingReport?.by_created ?? user.id,
        status: 'draft' as const,
        report_findings: findings,
        report_impression: impression,
        report_recommendations:
          recommendations,
        doctor_notes:
          doctorNotes.trim() || null,
        verified_by_doctor:
          existingReport?.verified_by_doctor ??
          false,
        verified_by:
          existingReport?.verified_by ?? null,
        at_verified:
          existingReport?.at_verified ?? null,
        ai_summary: aiSummary,
        raw_image_path:
          existingReport
            ? undefined
            : null,
        annotated_image_path: null,
        gradcam_image_path: null,
        pdf_report_path: null,
      };

      let savedReport: ReportData | null = null;

      if (existingReport) {
        const {
          data,
          error,
        } = await supabase
          .from('clinical_reports')
          .update({
            report_findings:
              payload.report_findings,
            report_impression:
              payload.report_impression,
            report_recommendations:
              payload.report_recommendations,
            doctor_notes:
              payload.doctor_notes,
            ai_summary:
              payload.ai_summary,
            at_updated:
              new Date().toISOString(),
          })
          .eq('id', existingReport.id)
          .select(`
            id,
            status,
            report_findings,
            report_impression,
            report_recommendations,
            doctor_notes,
            verified_by_doctor,
            verified_by,
            at_verified,
            by_created
          `)
          .single();

        if (error) {
          throw new Error(
            `Could not update report: ${error.message}`,
          );
        }

        savedReport = data as ReportData;
      } else {
        const {
          data,
          error,
        } = await supabase
          .from('clinical_reports')
          .insert(payload)
          .select(`
            id,
            status,
            report_findings,
            report_impression,
            report_recommendations,
            doctor_notes,
            verified_by_doctor,
            verified_by,
            at_verified,
            by_created
          `)
          .single();

        if (error) {
          throw new Error(
            `Could not save report: ${error.message}`,
          );
        }

        savedReport = data as ReportData;
      }

      if (savedReport) {
        setExistingReport(savedReport);
        setReportStatus(savedReport.status);
      }

      const updatedScan: ScanRecord = {
        ...scan,

        indication:
          caseData?.summary_clinical ??
          scan.indication,

        impression:
          savedReport?.report_impression ??
          scan.impression,

        recommendation:
          savedReport?.report_recommendations ??
          scan.recommendation,

        findingsList: savedReport?.report_findings
          ? savedReport.report_findings
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : scan.findingsList,

        confidence:
          prediction?.confidence_overall !== null &&
          prediction?.confidence_overall !== undefined
            ? prediction.confidence_overall * 100
            : null,

        status:
          prediction?.status === 'succeeded'
            ? prediction.detected_fracture
              ? 'Critical'
              : 'Normal'
            : 'Pending',

        primaryFinding:
          prediction?.status === 'succeeded'
            ? prediction.detected_fracture
              ? predictionBoxes[0]?.label ||
                'Fracture Detected'
              : 'No Fracture Detected'
            : 'AI analysis pending',
      };

      onUpdateScan(updatedScan);

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not save the report.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * FINALIZE REPORT
   *
   * Requires:
   * 1. Existing draft report
   * 2. Final doctor diagnosis
   * 3. Doctor/Admin role
   *
   * The database RPC performs the actual authorization.
   */
  const handleFinalizeReport = async () => {
    if (!existingReport) {
      setErrorMessage(
        'Please save the report as a draft before finalizing it.',
      );
      return;
    }

    if (reportIsFinalized) {
      setErrorMessage(
        'This report is already finalized.',
      );
      return;
    }

    if (!finalDiagnosis) {
      setErrorMessage(
        'A finalized doctor diagnosis is required before finalizing the report.',
      );
      return;
    }

    setIsFinalizing(true);
    setErrorMessage('');

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        'clinical_report_finalize',
        {
          p_report_id: existingReport.id,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(
          'The report could not be finalized.',
        );
      }

      const finalizedReport =
        data as ReportData;

      setExistingReport(finalizedReport);
      setReportStatus('finalized');

      onUpdateScan({
        ...scan,
        impression:
          finalizedReport.report_impression ||
          scan.impression,
        recommendation:
          finalizedReport.report_recommendations ||
          scan.recommendation,
        findingsList:
          finalizedReport.report_findings
            ? finalizedReport.report_findings
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean)
            : scan.findingsList,
        confidence:
          prediction?.confidence_overall !== null &&
          prediction?.confidence_overall !== undefined
            ? prediction.confidence_overall * 100
            : null,
        status:
          prediction?.status === 'succeeded'
            ? prediction.detected_fracture
              ? 'Critical'
              : 'Normal'
            : 'Pending',
        primaryFinding:
          prediction?.status === 'succeeded'
            ? prediction.detected_fracture
              ? predictionBoxes[0]?.label ||
                'Fracture Detected'
              : 'No Fracture Detected'
            : 'AI analysis pending',
      });

      /*
       * Keep the finalized report visible briefly
       * so the user can see the successful state.
       */
      setTimeout(() => {
        onClose();
      }, 900);

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not finalize the report.',
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={reportModalRef}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto"
    >
      <div className="print-modal bg-white text-slate-900 rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden my-6">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-sky-600 uppercase">
                FractureAI
              </p>

              <h1 className="text-xl font-bold tracking-tight mt-1">
                Clinical Radiology Report
              </h1>

              <p className="text-xs text-slate-500 mt-1">
                AI-assisted diagnostic workstation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <p className="font-semibold">
                  CASE
                </p>

                <p className="font-mono text-slate-500">
                  {scan.id}
                </p>
              </div>

              <button
                onClick={onClose}
                disabled={isSaving || isFinalizing}
                className="text-slate-400 hover:text-slate-900 print:hidden disabled:opacity-50"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading clinical report data...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Reading the case, diagnosis, and AI records from Supabase.
            </p>
          </div>
        ) : (
          <>
            {/* PATIENT / STUDY HEADER */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
              <div className="bg-slate-50 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Patient
                </p>

                <p className="font-bold text-sm mt-1">
                  {scan.patientName}
                </p>
              </div>

              <div className="bg-slate-50 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  MRN
                </p>

                <p className="font-mono text-sm mt-1">
                  {scan.mrn}
                </p>
              </div>

              <div className="bg-slate-50 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Age / Sex
                </p>

                <p className="font-semibold text-sm mt-1">
                  {age !== null
                    ? `${age} years`
                    : 'Not available'}
                  {' / '}
                  {caseData?.patient?.sex ||
                    scan.gender ||
                    'Not available'}
                </p>
              </div>

              <div className="bg-slate-50 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Study
                </p>

                <p className="font-semibold text-sm mt-1">
                  {scan.modality} ·{' '}
                  {caseData?.part_body ||
                    scan.region ||
                    'Not specified'}
                </p>
              </div>
            </div>

            {/* MAIN TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* LEFT */}
              <section className="p-6 border-b lg:border-b-0 lg:border-r border-slate-200">

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold">
                      Visual Evidence
                    </h2>

                    <p className="text-[11px] text-slate-400">
                      Original X-Ray and AI visualization
                    </p>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500">
                    X-RAY
                  </span>
                </div>

                {/* ORIGINAL IMAGE */}
                <div className="relative bg-slate-950 rounded-xl overflow-hidden min-h-[280px] flex items-center justify-center">
                  {scan.imageUrl ? (
                    <div className="relative inline-block max-w-full">
                      <img
                        src={scan.imageUrl}
                        alt="Original X-Ray"
                        className="max-h-[430px] max-w-full object-contain block"
                      />

                      {scan.obbBox && (
                        <div
                          className="absolute border-2 border-red-500 pointer-events-none"
                          style={{
                            top: scan.obbBox.top,
                            left: scan.obbBox.left,
                            width: scan.obbBox.width,
                            height: scan.obbBox.height,
                          }}
                        >
                          <span className="absolute -top-5 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                            {scan.obbBox.label}
                          </span>
                        </div>
                      )}

                      {hasAiResult &&
                        aiDetectedFracture &&
                        predictionBoxes.map((box) => (
                          <div
                            key={box.id}
                            className="absolute border-2 border-red-500 pointer-events-none"
                            style={{
                              left: `${box.min_x * 100}%`,
                              top: `${box.min_y * 100}%`,
                              width: `${Math.max(
                                0,
                                box.max_x - box.min_x,
                              ) * 100}%`,
                              height: `${Math.max(
                                0,
                                box.max_y - box.min_y,
                              ) * 100}%`,
                            }}
                          >
                            <span className="absolute -top-5 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                              {box.label ||
                                'Fracture'}{' '}
                              ·{' '}
                              {(
                                box.confidence * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <span className="material-symbols-outlined text-4xl text-slate-700">
                        image_not_supported
                      </span>

                      <p className="text-xs text-slate-400 mt-2">
                        X-Ray image is not available.
                      </p>
                    </div>
                  )}
                </div>

                {/* AI DETECTIONS */}
                {hasAiResult &&
                  aiDetectedFracture &&
                  predictionBoxes.length > 0 && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-bold text-red-700">
                        Detected Fractures
                      </p>

                      <p className="text-[10px] text-red-500 mt-1">
                        {predictionBoxes.length}{' '}
                        detection
                        {predictionBoxes.length === 1
                          ? ''
                          : 's'} returned by the AI model
                      </p>

                      <div className="space-y-2 mt-3">
                        {predictionBoxes.map(
                          (box, index) => (
                            <div
                              key={box.id}
                              className="flex items-center justify-between rounded-lg bg-white border border-red-100 px-3 py-2"
                            >
                              <div>
                                <p className="text-[11px] font-bold text-slate-700">
                                  Detection {index + 1}
                                </p>

                                <p className="text-[10px] text-slate-500">
                                  {box.label ||
                                    'Fracture'}
                                </p>
                              </div>

                              <p className="text-[11px] font-bold text-red-600">
                                {(
                                  box.confidence * 100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* NO FRACTURE */}
                {hasAiResult &&
                  aiNoFracture && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">
                          check_circle
                        </span>

                        <div>
                          <p className="text-xs font-bold text-emerald-700">
                            No Fracture Detected
                          </p>

                          <p className="text-[10px] text-emerald-600 mt-1">
                            The AI model returned a real
                            negative fracture result.
                          </p>
                        </div>
                      </div>

                      {prediction?.confidence_overall !==
                        null &&
                        prediction?.confidence_overall !==
                          undefined && (
                          <p className="text-[10px] text-emerald-600 mt-3">
                            Overall confidence:{' '}
                            {(
                              prediction.confidence_overall *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        )}
                    </div>
                  )}

                {/* AI FAILED */}
                {aiFailed && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-bold text-red-700">
                      AI Analysis Failed
                    </p>

                    <p className="text-[10px] text-red-600 mt-1">
                      {prediction?.message_error ||
                        'The AI inference failed.'}
                    </p>
                  </div>
                )}

                {/* GRAD CAM */}
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">
                      local_fire_department
                    </span>

                    <div>
                      <p className="text-xs font-bold">
                        Grad-CAM Explainability
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Model explainability visualization
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-24 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <p className="text-[11px] text-slate-400">
                      Grad-CAM is not available yet.
                    </p>
                  </div>
                </div>
              </section>

              {/* RIGHT */}
              <section className="p-6">

                {/* REPORT STATUS */}
                <div className="rounded-xl border border-slate-200 p-4 mb-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Report Status
                      </p>

                      <p className="text-sm font-bold mt-1">
                        {reportIsFinalized
                          ? 'Finalized & Verified'
                          : 'Draft'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        reportIsFinalized
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {reportIsFinalized
                        ? 'FINALIZED'
                        : 'DRAFT'}
                    </span>
                  </div>

                  {reportIsFinalized &&
                    existingReport?.verified_by && (
                      <p className="text-[10px] text-emerald-600 mt-3">
                        Verified by authorized doctor/administrator.
                      </p>
                    )}
                </div>

                {/* FINAL DIAGNOSIS */}
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 mb-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-sky-600 uppercase">
                        Final Clinical Diagnosis
                      </p>

                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {finalDiagnosis
                          ? formatDiagnosisStatus(
                              finalDiagnosis.final_verdict,
                            )
                          : 'No finalized diagnosis'}
                      </p>
                    </div>

                    {finalDiagnosis && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-sky-700 border border-sky-200">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  {finalDiagnosis ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Fracture Type
                        </p>

                        <p className="text-xs font-semibold mt-1 text-slate-700">
                          {finalDiagnosis.fracture_type ||
                            'Not specified'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Severity
                        </p>

                        <p className="text-xs font-semibold mt-1 text-slate-700">
                          {finalDiagnosis.severity ||
                            'Not specified'}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Clinical Notes
                        </p>

                        <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                          {finalDiagnosis.clinical_notes ||
                            'No clinical notes were entered.'}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Recommended Action
                        </p>

                        <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                          {finalDiagnosis.recommended_action ||
                            'No recommended action was entered.'}
                        </p>
                      </div>

                      {finalDiagnosis.finalized_at && (
                        <div className="sm:col-span-2">
                          <p className="text-[10px] text-slate-400">
                            Finalized:{' '}
                            {new Date(
                              finalDiagnosis.finalized_at,
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-3">
                      A finalized doctor diagnosis must exist before the clinical report can be finalized.
                    </p>
                  )}
                </div>

                {/* AI STATUS */}
                <div className="rounded-xl border border-slate-200 p-4 mb-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        AI Analysis
                      </p>

                      <p className="text-sm font-bold mt-1">
                        {!hasAiPrediction
                          ? 'Analysis Pending'
                          : aiFailed
                            ? 'AI Analysis Failed'
                            : aiDetectedFracture
                              ? 'Fracture Detected'
                              : aiNoFracture
                                ? 'No Fracture Detected'
                                : 'Analysis Pending'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        aiDetectedFracture
                          ? 'bg-red-100 text-red-700'
                          : aiNoFracture
                            ? 'bg-emerald-100 text-emerald-700'
                            : aiFailed
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {!hasAiPrediction
                        ? 'PENDING'
                        : aiFailed
                          ? 'FAILED'
                          : aiDetectedFracture
                            ? 'FRACTURE'
                            : aiNoFracture
                              ? 'NO FRACTURE'
                              : 'PENDING'}
                    </span>
                  </div>

                  {confidence !== null && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">
                          Confidence
                        </span>

                        <span className="font-bold">
                          {confidence.toFixed(1)}%
                        </span>
                      </div>

                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                confidence,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!hasAiPrediction && (
                    <p className="text-[10px] text-slate-400 mt-3">
                      No prediction has been stored for this
                      X-Ray yet. The system will remain in
                      Pending state until real inference
                      completes.
                    </p>
                  )}

                  {aiFailed &&
                    prediction?.message_error && (
                      <p className="text-[10px] text-red-600 mt-3">
                        {prediction.message_error}
                      </p>
                    )}
                </div>

                {/* CLINICAL INDICATION */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Clinical Indication
                  </label>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed">
                    {caseData?.summary_clinical ||
                      'No clinical indication has been recorded.'}
                  </div>
                </div>

                {/* FINDINGS */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Findings
                  </label>

                  <textarea
                    value={findings}
                    disabled={reportIsFinalized}
                    onChange={(e) =>
                      setFindings(e.target.value)
                    }
                    placeholder={
                      aiDetectedFracture
                        ? 'Review or enter the clinical findings related to the detected fracture...'
                        : aiNoFracture
                          ? 'Review or enter the clinical findings for this no-fracture study...'
                          : 'AI findings will appear here after real inference. The clinician may enter findings manually.'
                    }
                    className="w-full min-h-[120px] rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* IMPRESSION */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Impression
                  </label>

                  <textarea
                    value={impression}
                    disabled={reportIsFinalized}
                    onChange={(e) =>
                      setImpression(e.target.value)
                    }
                    placeholder="Enter the final clinical impression..."
                    className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* RECOMMENDATIONS */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Clinical Action & Follow-up
                  </label>

                  <textarea
                    value={recommendations}
                    disabled={reportIsFinalized}
                    onChange={(e) =>
                      setRecommendations(
                        e.target.value,
                      )
                    }
                    placeholder="Enter recommendations or follow-up instructions..."
                    className="w-full min-h-[90px] rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* DOCTOR NOTES */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Doctor Review Notes
                  </label>

                  <textarea
                    value={doctorNotes}
                    disabled={reportIsFinalized}
                    onChange={(e) =>
                      setDoctorNotes(
                        e.target.value,
                      )
                    }
                    placeholder="Optional notes for the reviewing physician..."
                    className="w-full min-h-[70px] rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </section>
            </div>

            {/* VALIDATION STATUS */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Clinical Validation
                  </p>

                  <p className="text-xs font-semibold mt-1">
                    {reportIsFinalized
                      ? 'Verified by doctor / administrator'
                      : finalDiagnosis
                        ? 'Diagnosis verified — report pending final approval'
                        : 'Pending doctor review'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400">
                    Report status
                  </p>

                  <p className="text-xs font-bold uppercase">
                    {reportStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {errorMessage && (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-wrap justify-end gap-3 p-6 border-t border-slate-200 print:hidden">

              <button
                onClick={onClose}
                disabled={isSaving || isFinalizing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                Close
              </button>

              {!reportIsFinalized && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving || isFinalizing}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving
                      ? 'Saving...'
                      : 'Save Draft'}
                  </button>

                  <button
                    onClick={handleFinalizeReport}
                    disabled={
                      isSaving ||
                      isFinalizing ||
                      !existingReport ||
                      !finalDiagnosis
                    }
                    className="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {isFinalizing
                        ? 'progress_activity'
                        : 'verified'}
                    </span>

                    {isFinalizing
                      ? 'Finalizing...'
                      : 'Finalize & Verify Report'}
                  </button>
                </>
              )}

              <button
                onClick={handlePrint}
                disabled={isSaving || isFinalizing}
                className="px-5 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 disabled:opacity-50"
              >
                Print / Save as PDF
              </button>
            </div>

            {/* DISCLAIMER */}
            <div className="px-6 pb-6 text-[10px] text-slate-400 leading-relaxed">
              AI-generated information is intended to assist qualified
              medical professionals. Final clinical interpretation and
              validation remain the responsibility of the authorized
              reviewing physician.
            </div>
          </>
        )}
      </div>
    </div>
  );
};