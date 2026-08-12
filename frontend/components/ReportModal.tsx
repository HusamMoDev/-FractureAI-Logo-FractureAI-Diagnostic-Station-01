import React, { useState, useEffect } from 'react';
import { ScanRecord } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: ScanRecord;
  onUpdateScan: (scan: ScanRecord) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  scan,
  onUpdateScan,
}) => {
  const [editedAge, setEditedAge] = useState<string>(scan.patientAge?.toString() || '');

  useEffect(() => {
    if (isOpen) {
      setEditedAge(scan.patientAge?.toString() || '');
    }
  }, [isOpen, scan]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const isAgeValid = editedAge.trim() !== '' && Number(editedAge) >= 0 && Number(editedAge) <= 120;
    if (!isAgeValid) return;
    
    // Update frontend state by creating a new updated scan and propagating it to global state
    const updatedScan = {
      ...scan,
      patientAge: Number(editedAge)
    };
    onUpdateScan(updatedScan);

    // TODO: Persist updated patient age through the backend when API is available.
    // Example: 
    // PUT /api/v1/reports/:id
    // body: JSON.stringify({ patientAge: scan.patientAge })

    onClose();
  };

  const isAgeValid = editedAge.trim() !== '' && Number(editedAge) >= 0 && Number(editedAge) <= 120;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="print-modal bg-white text-black rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 print:p-0 print:shadow-none font-sans relative my-8">
        {/* Printable Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black print:hidden"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Report Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              FractureAI Diagnostic Workstation
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase">
              Official Clinical Radiologic Diagnostic Report
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-900">STUDY ID: {scan.id}</p>
            <p className="text-slate-500">Date: {scan.date} {scan.time}</p>
          </div>
        </div>

        {/* Patient Demographics Table */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">PATIENT NAME:</span>
            <span className="font-bold text-slate-900">{scan.patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">MRN:</span>
            <span className="font-mono text-slate-900">{scan.mrn}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">AGE / GENDER:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="120"
                value={editedAge}
                onChange={(e) => setEditedAge(e.target.value)}
                className={`w-14 px-1 py-0.5 border ${
                  !isAgeValid ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300'
                } rounded bg-white text-slate-900 font-bold focus:outline-none focus:border-sky-500 print:border-none print:bg-transparent print:p-0 print:w-auto`}
              />
              <span className="text-slate-900">({scan.gender})</span>
            </div>
            {!isAgeValid && (
              <p className="text-[10px] text-red-500 mt-1 print:hidden">Valid age (0-120) required.</p>
            )}
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">MODALITY / REGION:</span>
            <span className="text-slate-900">{scan.modality} - {scan.region}</span>
          </div>
        </div>

        {/* Diagnostic Findings */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-1">
              CLINICAL INDICATION
            </h3>
            <p>{scan.indication}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-1">
              EXAMINATION TECHNIQUE
            </h3>
            <p>{scan.technique}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-1 flex justify-between items-center">
              <span>RADIOLOGIC FINDINGS</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                AI CONFIDENCE: {scan.confidence}%
              </span>
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {scan.findingsList.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-1">
              IMPRESSION
            </h3>
            <div className="bg-slate-100 p-3 rounded font-medium whitespace-pre-line border border-slate-200">
              {scan.impression}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-1">
              AI RECOMMENDATION & NEXT STEPS
            </h3>
            <p className="text-slate-700 italic">{scan.recommendation}</p>
          </div>
        </div>

        {/* Radiologist Signature */}
        <div className="pt-6 border-t border-slate-300 flex justify-between items-end text-xs">
          <div>
            <p className="text-slate-500">Electronically Validated & Signed By:</p>
            <p className="font-bold text-slate-900 text-sm">{scan.radiologist || 'Dr. S. Chen, MD'}</p>
            <p className="text-slate-500">Chief Attending Radiologist</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400 max-w-xs leading-tight">
              Notice: AI diagnostic output is intended to assist medical professionals and must be validated by a licensed radiologist.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={!isAgeValid}
            className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-lg text-xs hover:bg-emerald-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Report
          </button>
          <button
            onClick={handlePrint}
            className="bg-sky-600 text-white font-bold px-5 py-2 rounded-lg text-xs hover:bg-sky-700 transition-colors shadow"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};
