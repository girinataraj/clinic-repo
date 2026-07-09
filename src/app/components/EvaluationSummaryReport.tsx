import React, { useMemo } from 'react';
import { ROM_CONFIG } from '../screens/assessment/clinicalConfig';
import { 
  Activity, 
  Scale, 
  Stethoscope, 
  CheckSquare, 
  Dumbbell, 
  FileText, 
  ClipboardList,
  Heart,
  StickyNote
} from 'lucide-react';

interface EvaluationSummaryReportProps {
  evaluation: any;
  isDoctorRole?: boolean;
}

export function EvaluationSummaryReport({ evaluation, isDoctorRole = false }: EvaluationSummaryReportProps) {
  if (!evaluation) return null;

  // Casing & field normalization
  const bp = evaluation.bp || evaluation.bloodPressure;
  const pr = evaluation.pr || evaluation.pulseRate;
  const spo2 = evaluation.spo2;
  const temp = evaluation.temperature;
  const ef = evaluation.ef;
  const painLevel = evaluation.painLevel !== undefined ? evaluation.painLevel : evaluation.pain_level;
  
  const chiefComplaints = evaluation.chiefComplaints || evaluation.chief_complaints;
  const associatedSymptoms = evaluation.associatedSymptoms || evaluation.associated_symptoms || [];
  const associatedPains = evaluation.associatedPains || evaluation.associated_pains || [];
  const medicalHistory = evaluation.medicalHistory || evaluation.medical_history || [];
  const diagnosis = evaluation.diagnosis;
  const diagnosisList = evaluation.diagnosisList || evaluation.diagnosis_list || [];
  const plan = evaluation.plan;
  const treatmentPlan = evaluation.treatmentPlan || evaluation.treatment_plan;
  const management = evaluation.management;
  const musclePowerRom = evaluation.musclePowerRom || evaluation.muscle_power_rom;
  const anthropometrics = evaluation.anthropometrics;
  const clinicalExamination = evaluation.clinicalExamination || evaluation.clinical_examination;

  // Casing of remarks / history fields
  const familyHistory = evaluation.familyHistory || evaluation.family_history;
  const lifestyleHistory = evaluation.lifestyleHistory || evaluation.lifestyle_history;
  const allergies = evaluation.allergies;
  const currentMedications = evaluation.currentMedications || evaluation.current_medications;
  const previousMedications = evaluation.previousMedications || evaluation.previous_medications;
  const labReports = evaluation.labReports || evaluation.lab_reports;
  const radiologyReports = evaluation.radiologyReports || evaluation.radiology_reports;
  const prescriptions = evaluation.prescriptions;
  const procedures = evaluation.procedures;
  const followUpPlan = evaluation.followUpPlan || evaluation.follow_up_plan;
  const mentalStatusExamination = evaluation.mentalStatusExamination || evaluation.mental_status_examination;
  const clinicalFindings = evaluation.clinicalFindings || evaluation.clinical_findings;
  const therapyNotes = evaluation.therapyNotes || evaluation.therapy_notes;
  const progressNotes = evaluation.progressNotes || evaluation.progress_notes;
  const doctorRemarks = evaluation.doctorRemarks || evaluation.doctor_remarks;
  const therapistRemarks = evaluation.therapistRemarks || evaluation.therapist_remarks;
  const finalClinicalSummary = evaluation.finalClinicalSummary || evaluation.final_clinical_summary;

  const functionalScores = evaluation.functionalScores || evaluation.functional_scores || {};

  // Accent styles matching role
  const accentColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';
  const badgeColor = isDoctorRole ? 'bg-[#262842] text-white' : 'bg-teal-700 text-white';

  // Helper to parse ROM values safely
  const getRomValue = (romObj: any, joint: string, movement: string) => {
    if (!romObj) return null;
    const key1 = `${joint}_${movement}`.replace(/\s+/g, '_');
    const key2 = `${joint.toLowerCase().replace(/[^a-z0-9]/g, '')}_${movement.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    return romObj[key1] || romObj[key2] || null;
  };

  // Construct ROM Table Rows dynamically
  const romTableRows = useMemo(() => {
    if (!musclePowerRom) return [];
    const rows: any[] = [];
    ROM_CONFIG.forEach((section) => {
      section.joints.forEach((joint) => {
        joint.movements.forEach((movement) => {
          const entry = getRomValue(musclePowerRom, joint.label, movement);
          if (entry && (entry.powerRt || entry.powerLt || entry.romRt || entry.romLt)) {
            rows.push({
              joint: joint.label,
              movement: movement,
              powerRt: entry.powerRt || '—',
              powerLt: entry.powerLt || '—',
              romRt: entry.romRt ? `${entry.romRt}°` : '—',
              romLt: entry.romLt ? `${entry.romLt}°` : '—',
            });
          }
        });
      });
    });
    return rows;
  }, [musclePowerRom]);

  const hasClinicalExam = useMemo(() => {
    if (!clinicalExamination) return false;
    const hasTests = clinicalExamination.tests && Object.keys(clinicalExamination.tests).length > 0;
    const hasImaging = clinicalExamination.imaging && Object.keys(clinicalExamination.imaging).length > 0;
    const hasNotes = !!clinicalExamination.examinationNotes;
    return hasTests || hasImaging || hasNotes;
  }, [clinicalExamination]);

  let therapistName = evaluation.therapistName || evaluation.doctor_name || evaluation.createdBy?.name || '—';
  if (therapistName.toLowerCase().includes('self')) {
    therapistName = evaluation.doctor_name || evaluation.createdBy?.name || '—';
    if (therapistName.toLowerCase().includes('self') || therapistName === '—') {
      therapistName = 'Clinic Physiotherapist';
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left">

      {/* Therapist & Visit Information */}
      <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Conducting Therapist</span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{therapistName}</span>
          </div>
          {evaluation.visitType && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Visit Type</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{evaluation.visitType}</span>
            </div>
          )}
          {evaluation.referredBy && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Referred By</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{evaluation.referredBy}</span>
            </div>
          )}
        </div>
      </section>

      {/* Vital Signs */}
      {(bp || pr || spo2 || temp || ef) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Heart size={16} className="text-rose-500" />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Vital Signs</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-semibold">
            {bp && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Blood Pressure</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{bp}</span>
              </div>
            )}
            {pr && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Pulse Rate</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{pr} bpm</span>
              </div>
            )}
            {spo2 && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">SpO₂</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{spo2}%</span>
              </div>
            )}
            {temp && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Temperature</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{temp}°F</span>
              </div>
            )}
            {ef && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Ejection Fraction</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ef}%</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Chief Complaints & Pain Level */}
      {(chiefComplaints || (painLevel !== undefined && painLevel !== null)) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Heart size={16} className="text-rose-500" />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Complaints & Pain Scale</span>
          </div>
          <div className="flex flex-col gap-4 text-xs font-semibold">
            {chiefComplaints && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Chief Complaints</span>
                <p className="p-3 bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-300 rounded-xl leading-relaxed whitespace-pre-wrap font-semibold border border-slate-150 dark:border-slate-850">
                  {chiefComplaints}
                </p>
              </div>
            )}
            {painLevel !== undefined && painLevel !== null && (
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Pain Scale Rating</span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{painLevel}/10</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Associated Symptoms & Pains */}
      {(associatedSymptoms.length > 0 || associatedPains.length > 0) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Activity size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Associated Symptoms & Pains</span>
          </div>
          <div className="flex flex-col gap-4">
            {associatedSymptoms.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2">Symptoms</span>
                <div className="flex flex-wrap gap-2">
                  {associatedSymptoms.map((s: string) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-850 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700/60 shadow-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {associatedPains.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2">Pain Areas</span>
                <div className="flex flex-wrap gap-2">
                  {associatedPains.map((p: string) => (
                    <span key={p} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-850 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700/60 shadow-sm">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Medical History */}
      {medicalHistory && medicalHistory.length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <ClipboardList size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Medical History</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {medicalHistory.map((h: string) => (
              <span key={h} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-155 dark:border-slate-700 shadow-sm">
                {h}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Clinical Examination (Tests & Imaging) */}
      {hasClinicalExam && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Stethoscope size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Clinical Examination</span>
          </div>
          <div className="flex flex-col gap-4 text-xs">
            {clinicalExamination.tests && Object.keys(clinicalExamination.tests).length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2.5">Special Physical Tests</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(clinicalExamination.tests).map(([key, value]: [string, any]) => {
                    const result = value?.result ?? 'Not Tested';
                    const isPositive = result === 'Positive';
                    const isNegative = result === 'Negative';
                    return (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px] font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isPositive ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' : 
                          isNegative ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>{result}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {clinicalExamination.imaging && Object.keys(clinicalExamination.imaging).length > 0 && (
              <div className="mt-2 border-t border-slate-150 dark:border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2.5">Imaging Reports (X-Ray & MRI)</span>
                <div className="flex flex-col gap-2">
                  {Object.entries(clinicalExamination.imaging).map(([region, findings]: [string, any]) => {
                    if (!findings.xray?.trim() && !findings.mri?.trim()) return null;
                    return (
                      <div key={region} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-1.5 shadow-sm">
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase">{region} Imaging</span>
                        {findings.xray?.trim() && <p className="text-slate-700 dark:text-slate-300 font-semibold"><strong className="text-slate-400 uppercase text-[9px] block">X-Ray Findings:</strong> {findings.xray}</p>}
                        {findings.mri?.trim() && <p className="text-slate-700 dark:text-slate-300 font-semibold"><strong className="text-slate-400 uppercase text-[9px] block">MRI Findings:</strong> {findings.mri}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {clinicalExamination.examinationNotes && (
              <div className="mt-2 border-t border-slate-150 dark:border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-1.5">Additional Physical Notes</span>
                <p className="p-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl whitespace-pre-wrap font-medium border border-slate-150 dark:border-slate-850">{clinicalExamination.examinationNotes}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Range of Motion & Muscle Power Table */}
      {romTableRows.length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Activity size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Muscle Power & ROM</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold">
                <thead className="bg-slate-50 dark:bg-slate-850">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300">Joint</th>
                    <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300">Movement</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">Power Rt</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">Power Lt</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">ROM Rt</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">ROM Lt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {romTableRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="px-3 py-2.5 font-bold text-slate-850 dark:text-white">{row.joint}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-extrabold">{row.movement}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.powerRt}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.powerLt}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.romRt}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.romLt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Functional Limitations (Functional Scores) */}
      {functionalScores && Object.keys(functionalScores).length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <CheckSquare size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Functional Limitations</span>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(functionalScores).map(([key, val]: [string, any]) => {
              const value = typeof val === 'object' ? val.score : Number(val);
              if (isNaN(value)) return null;
              
              const labels: Record<number, string> = { 0: 'Normal', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
              const colors: Record<number, string> = { 
                0: 'text-green-600 bg-green-50 border-green-150 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900', 
                1: 'text-yellow-600 bg-yellow-50 border-yellow-150 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900', 
                2: 'text-orange-600 bg-orange-50 border-orange-150 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900', 
                3: 'text-red-500 bg-red-50 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900', 
                4: 'text-red-700 bg-red-100 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' 
              };
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-150 dark:border-slate-800/60 font-semibold text-xs">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 capitalize">{key === 'stairs' ? 'Climbing Stairs' : key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${colors[value] || 'text-slate-600 bg-slate-50 border-slate-150'}`}>{value} - {labels[value] || 'Recorded'}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Diagnosis Notes & Diagnosis List */}
      {(diagnosis || diagnosisList.length > 0) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <ClipboardList size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Diagnosis Details</span>
          </div>
          <div className="flex flex-col gap-3">
            {diagnosis && (
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                {diagnosis}
              </p>
            )}
            {diagnosisList.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-1.5">Selected Diagnoses</span>
                <div className="flex flex-wrap gap-2">
                  {diagnosisList.map((d: string) => (
                    <span key={d} className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-[12px] font-bold text-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-850">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Treatment Plan */}
      {(plan || treatmentPlan) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Dumbbell size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Treatment Plan Details</span>
          </div>
          {plan && (
            <p className="text-[13px] text-slate-800 dark:text-slate-250 leading-relaxed whitespace-pre-wrap mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-850 font-medium">
              {plan}
            </p>
          )}
          
          {treatmentPlan && (
            <div className="grid grid-cols-1 gap-3">
              {treatmentPlan.modalities?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Modalities</p>
                  <div className="flex flex-wrap gap-2">
                    {treatmentPlan.modalities.map((m: string) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[12px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {treatmentPlan.manualTherapy?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Manual Therapy</p>
                  <div className="flex flex-wrap gap-2">
                    {treatmentPlan.manualTherapy.map((m: string) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[12px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {treatmentPlan.rehabilitation?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rehabilitation</p>
                  <div className="flex flex-wrap gap-2">
                    {treatmentPlan.rehabilitation.map((m: string) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[12px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {treatmentPlan.visitsRequired && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm">
                  <span className="text-[13px] font-bold text-slate-500">Total Visits Required</span>
                  <span className="text-[15px] font-black text-slate-800 dark:text-white">{treatmentPlan.visitsRequired}</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Clinician Remarks & Summary */}
      {(clinicalFindings || therapyNotes || progressNotes || doctorRemarks || therapistRemarks || finalClinicalSummary) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <StickyNote size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Clinician Remarks & Summary</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Clinical Findings', value: clinicalFindings },
              { label: 'Therapy Session Notes', value: therapyNotes },
              { label: 'Progression Track Notes', value: progressNotes },
              { label: 'Doctor Remarks', value: doctorRemarks },
              { label: 'Therapist Remarks', value: therapistRemarks },
              { label: 'Final Clinical Summary', value: finalClinicalSummary }
            ].map(remarks => {
              if (!remarks.value) return null;
              return (
                <div key={remarks.label} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">{remarks.label}</span>
                  <p className="text-[13px] text-slate-850 dark:text-slate-200 font-semibold mt-1 whitespace-pre-wrap">{remarks.value}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
