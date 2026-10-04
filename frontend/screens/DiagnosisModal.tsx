import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface DiagnosisModalProps {
  caseId: string;
  primaryPredictionId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

const DiagnosisModal: React.FC<DiagnosisModalProps> = ({
  caseId,
  primaryPredictionId = null,
  onClose,
  onSaved,
}) => {
  const [diagnosisStatus, setDiagnosisStatus] = useState<
    'confirmed_fracture' | 'no_fracture' | 'uncertain'
  >('uncertain');

  const [fractureType, setFractureType] = useState('');
  const [severity, setSeverity] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [recommendedAction, setRecommendedAction] =
    useState('');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] =
    useState('');

  const handleSaveDiagnosis = async () => {
    if (!caseId) {
      setErrorMessage('Case ID is missing.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { data, error } = await supabase.rpc(
        'diagnosis_case_finalize',
        {
          p_case_id: caseId,
          p_diagnosis_status: diagnosisStatus,
          p_fracture_type:
            fractureType.trim() || null,
          p_clinical_notes:
            clinicalNotes.trim() || null,
          p_severity:
            severity.trim() || null,
          p_recommended_action:
            recommendedAction.trim() || null,
          p_primary_prediction_id:
            primaryPredictionId || null,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(
          'The diagnosis was not saved.'
        );
      }

      setSuccessMessage(
        'Diagnosis finalized successfully.'
      );

      if (onSaved) {
        onSaved();
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.error(
        'Save diagnosis error:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save diagnosis.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Final Diagnosis
            </h2>

            <p className="text-xs text-[#94a3b8] mt-1">
              Doctor / Administrator verification
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#bcc8ce] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>

        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Case ID */}
          <div>
            <label className="block text-xs font-semibold text-[#bcc8ce] mb-2">
              Case ID
            </label>

            <div className="bg-[#0D1626] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-[#dae4eb] font-mono break-all">
              {caseId}
            </div>
          </div>

          {/* Diagnosis Status */}
          <div>
            <label className="block text-xs font-semibold text-[#bcc8ce] mb-2">
              Diagnosis Status
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  setDiagnosisStatus(
                    'confirmed_fracture'
                  )
                }
                className={`rounded-lg border px-3 py-3 text-xs font-semibold transition-colors ${
                  diagnosisStatus ===
                  'confirmed_fracture'
                    ? 'bg-red-500/20 border-red-400/60 text-red-300'
                    : 'bg-white/5 border-white/10 text-[#bcc8ce] hover:bg-white/10'
                }`}
              >
                Confirmed Fracture
              </button>

              <button
                type="button"
                onClick={() =>
                  setDiagnosisStatus(
                    'no_fracture'
                  )
                }
                className={`rounded-lg border px-3 py-3 text-xs font-semibold transition-colors ${
                  diagnosisStatus ===
                  'no_fracture'
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-[#bcc8ce] hover:bg-white/10'
                }`}
              >
                No Fracture
              </button>

              <button
                type="button"
                onClick={() =>
                  setDiagnosisStatus(
                    'uncertain'
                  )
                }
                className={`rounded-lg border px-3 py-3 text-xs font-semibold transition-colors ${
                  diagnosisStatus === 'uncertain'
                    ? 'bg-yellow-500/20 border-yellow-400/60 text-yellow-300'
                    : 'bg-white/5 border-white/10 text-[#bcc8ce] hover:bg-white/10'
                }`}
              >
                Uncertain
              </button>

            </div>
          </div>

          {/* Fracture Type */}
          <div>
            <label className="block text-xs font-semibold text-[#bcc8ce] mb-2">
              Fracture Type
            </label>

            <select
              value={fractureType}
              onChange={(e) =>
                setFractureType(e.target.value)
              }
              className="w-full bg-[#0D1626] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00B4DB]/60"
            >
              <option value="">
                Select fracture type
              </option>

              <option value="Transverse">
                Transverse
              </option>

              <option value="Comminuted">
                Comminuted
              </option>

              <option value="Spiral">
                Spiral
              </option>

              <option value="Hairline">
                Hairline
              </option>

              <option value="Colles">
                Colles
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-semibold text-[#bcc8ce] mb-2">
              Severity
            </label>

            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value)
              }
              className="w-full bg-[#0D1626] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00B4DB]/60"
            >
              <option value="">
                Select severity
              </option>

              <option value="mild">
                Mild
              </option>

              <option value="moderate">
                Moderate
              </option>

              <option value="severe">
                Severe
              </option>
            </select>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#bcc8ce] mb-2">
              Clinical Notes
            </label>

            <textarea
              value={clinicalNotes}
              onChange={(e) =>
                setClinicalNotes(e.target.value)
              }
              rows={4}
              placeholder="Enter clinical notes..."
              className="w-full resize-none bg-[#0D1626] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#64748b] outline-none focus:border-[#00B4DB]/60"
            />
          </div>

          {/* Recommended Action */}
          <div>
            <label className="block text-xs font-semibold text-[#bcc8ce] mb-2">
              Recommended Action
            </label>

            <textarea
              value={recommendedAction}
              onChange={(e) =>
                setRecommendedAction(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Enter recommended clinical action..."
              className="w-full resize-none bg-[#0D1626] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#64748b] outline-none focus:border-[#00B4DB]/60"
            />
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/40 rounded-lg p-3">

              <span className="material-symbols-outlined text-red-400 text-[18px]">
                error
              </span>

              <p className="text-xs text-red-200 leading-relaxed">
                {errorMessage}
              </p>

            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-400/40 rounded-lg p-3">

              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                check_circle
              </span>

              <p className="text-xs text-emerald-200 leading-relaxed">
                {successMessage}
              </p>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-white/10 bg-black/30">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[#dae4eb] font-semibold py-2.5 rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveDiagnosis}
            disabled={saving}
            className={`flex-1 font-semibold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 ${
              saving
                ? 'bg-[#334155] text-[#94a3b8] cursor-not-allowed'
                : 'btn-gradient hover:brightness-110 active:scale-95'
            }`}
          >

            <span className="material-symbols-outlined text-[18px]">
              {saving
                ? 'progress_activity'
                : 'verified'}
            </span>

            {saving
              ? 'Saving Diagnosis...'
              : 'Finalize Diagnosis'}

          </button>

        </div>

      </div>
    </div>
  );
};

export default DiagnosisModal;