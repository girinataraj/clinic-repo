import { useMemo } from 'react';
import { ROM_CONFIG } from '../screens/assessment/clinicalConfig';
import { 
  Activity, 
  Stethoscope, 
  CheckSquare, 
  Dumbbell, 
  ClipboardList,
  Heart,
  StickyNote,
  Brain,
  Building2
} from 'lucide-react';
import { NeuroSummaryView } from './NeuroSummaryView';
import { useExercises } from '../../hooks/useExercises';

interface EvaluationSummaryReportProps {
  evaluation: any;
  isDoctorRole?: boolean;
}

// Safely format any string, number, array, or nested medical object without [object Object] errors
function formatDisplayValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'object' ? formatDisplayValue(item) : String(item)).filter(Boolean).join(', ');
  }
  if (typeof val === 'object') {
    if (val.systolic !== undefined && val.diastolic !== undefined) {
      return `${val.systolic}/${val.diastolic}${val.unit ? ` ${val.unit}` : ''}${val.status ? ` (${val.status})` : ''}`;
    }
    if (val.value !== undefined) {
      const parts = [`${val.value}${val.unit ? ` ${val.unit}` : ''}`];
      if (val.scale) parts.push(`/${val.scale}`);
      if (val.status && val.status !== 'normal') parts.push(`(${val.status})`);
      if (val.severity) parts.push(`- ${val.severity}`);
      return parts.join(' ');
    }
    if (val.complaint) {
      return `${val.complaint}${val.duration && val.duration !== 'Unknown' ? ` (${val.duration})` : ''}${val.severity ? ` - ${val.severity}` : ''}${val.onset ? ` [${val.onset}]` : ''}`;
    }
    if (val.name) {
      return `${val.name}${val.type ? ` (${val.type})` : ''}${val.status ? ` - ${val.status}` : ''}`;
    }
    if (val.condition) {
      return `${val.condition}${val.severity ? ` (${val.severity})` : ''}${val.icdCode ? ` [ICD-10: ${val.icdCode}]` : ''}`;
    }
    if (val.modality || val.fullName) {
      return `${val.fullName || val.modality}${val.frequency ? ` · ${val.frequency}` : ''}${val.duration ? ` · ${val.duration}` : ''}${val.purpose ? ` (${val.purpose})` : ''}`;
    }
    return Object.entries(val)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${typeof v === 'object' ? formatDisplayValue(v) : v}`)
      .join(' · ');
  }
  return String(val);
}

export function EvaluationSummaryReport({ evaluation, isDoctorRole = false }: EvaluationSummaryReportProps) {
  if (!evaluation) return null;

  // Unpack root payload if nested inside report key
  const rawData = evaluation.report ? evaluation.report : evaluation;

  // Metadata & Hospital Info
  const metadata = rawData.metadata;
  const hospitalInfo = metadata?.hospitalInfo;
  const patientInfo = rawData.patientInfo;
  const clinician = rawData.clinician;

  // Prescribed Exercises Hook
  const { exercises: prescribedExercises } = useExercises(
    rawData.patientId || rawData.patient_id || evaluation?.patientId || null,
    rawData.id || evaluation?.id || null
  );

  // Vital Signs
  const rawBp = rawData.bp || rawData.bloodPressure || rawData.vitalSigns?.bloodPressure;
  const bp = formatDisplayValue(rawBp);

  const rawPr = rawData.pr || rawData.pulseRate || rawData.pulse || rawData.vitalSigns?.pulse;
  const pr = formatDisplayValue(rawPr);

  const rawSpo2 = rawData.spo2 || rawData.spO2 || rawData.vitalSigns?.spO2;
  const spo2 = formatDisplayValue(rawSpo2);

  const rawTemp = rawData.temperature || rawData.temp || rawData.vitalSigns?.temperature;
  const temp = formatDisplayValue(rawTemp);

  const rawEf = rawData.ef || rawData.ejectionFraction || rawData.vitalSigns?.ejectionFraction;
  const ef = formatDisplayValue(rawEf);

  const rawPain = rawData.painScale ?? rawData.vitalSigns?.painScale ?? rawData.painLevel ?? rawData.pain_level;
  const painLevel = formatDisplayValue(rawPain);

  // Chief Complaints
  const rawComplaints = rawData.chiefComplaints || rawData.chief_complaints;
  const chiefComplaintsArray: any[] = Array.isArray(rawComplaints)
    ? rawComplaints
    : (typeof rawComplaints === 'string' ? [rawComplaints] : []);

  // Medical History
  const rawMedHist = rawData.medicalHistory || rawData.medical_history;
  const medicalHistoryList: string[] = [];
  if (Array.isArray(rawMedHist)) {
    rawMedHist.forEach(item => medicalHistoryList.push(formatDisplayValue(item)));
  } else if (typeof rawMedHist === 'object' && rawMedHist !== null) {
    if (Array.isArray(rawMedHist.conditions)) {
      rawMedHist.conditions.forEach((c: any) => medicalHistoryList.push(formatDisplayValue(c)));
    }
  }

  // Associated Symptoms & Pains
  const rawAssoc = rawData.associatedSymptoms || rawData.associated_symptoms;
  let associatedSymptomsList: string[] = [];
  let painAreasList: string[] = [];

  if (Array.isArray(rawAssoc)) {
    associatedSymptomsList = rawAssoc.map(s => formatDisplayValue(s));
  } else if (typeof rawAssoc === 'object' && rawAssoc !== null) {
    if (Array.isArray(rawAssoc.symptoms)) {
      associatedSymptomsList = rawAssoc.symptoms.map((s: any) => formatDisplayValue(s));
    }
    if (Array.isArray(rawAssoc.painAreas)) {
      painAreasList = rawAssoc.painAreas.map((p: any) => {
        if (typeof p === 'object' && p !== null) {
          const radiates = Array.isArray(p.radiatesTo) ? p.radiatesTo.join(', ') : p.radiatesTo;
          return `${p.area || ''}${radiates ? ` -> Radiates to: ${radiates}` : ''}${p.type ? ` (${p.type})` : ''}`.trim();
        }
        return formatDisplayValue(p);
      });
    }
  }

  const rawPains = rawData.associatedPains || rawData.associated_pains;
  if (Array.isArray(rawPains)) {
    rawPains.forEach(p => painAreasList.push(formatDisplayValue(p)));
  }

  // Clinical Examination
  const clinicalExamination = rawData.clinicalExamination || rawData.clinical_examination;
  const specialPhysicalTestsList: any[] = Array.isArray(clinicalExamination?.specialPhysicalTests)
    ? clinicalExamination.specialPhysicalTests
    : [];

  const testsObj = clinicalExamination?.tests;

  // Range of Motion & Muscle Power
  const rawRom = rawData.rangeOfMotion || rawData.range_of_motion || rawData.musclePowerRom || rawData.muscle_power_rom || clinicalExamination?.musclePowerRom || clinicalExamination?.muscle_power_rom;
  const legacyMusclePower = clinicalExamination?.musclePower || rawData.musclePower;

  const cleanPower = (v: any) => {
    if (v === null || v === undefined || v === '') return '—';
    const s = String(v).trim();
    if (s === '7' || s === '77') return '—';
    return s;
  };
  const cleanRom = (v: any) => {
    if (v === null || v === undefined || v === '') return '—';
    const s = String(v).trim();
    if (s === '7' || s === '77' || s === '7°' || s === '77°') return '—';
    if (s.endsWith('°')) return s;
    return `${s}°`;
  };

  const romTableRows = useMemo(() => {
    const rows: any[] = [];
    if (rawRom?.measurements && Array.isArray(rawRom.measurements)) {
      rawRom.measurements.forEach((m: any) => {
        rows.push({
          joint: m.joint,
          movement: m.movement,
          powerRt: cleanPower(m.powerRight ?? m.powerRt),
          powerLt: cleanPower(m.powerLeft ?? m.powerLt),
          romRt: cleanRom(m.romRight !== undefined ? m.romRight : m.romRt),
          romLt: cleanRom(m.romLeft !== undefined ? m.romLeft : m.romLt),
        });
      });
    } else if (rawRom && typeof rawRom === 'object') {
      ROM_CONFIG.forEach((section) => {
        section.joints.forEach((joint) => {
          joint.movements.forEach((movement) => {
            const key1 = `${joint.label}_${movement}`.replace(/\s+/g, '_');
            const key2 = `${joint.label.toLowerCase().replace(/[^a-z0-9]/g, '')}_${movement.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const key3 = `${joint.label}_${movement}`;
            const entry = rawRom[key1] || rawRom[key2] || rawRom[key3];
            if (entry && (entry.powerRt || entry.powerLt || entry.romRt || entry.romLt || entry.powerRight || entry.powerLeft || entry.romRight || entry.romLeft)) {
              const pRt = cleanPower(entry.powerRt ?? entry.powerRight);
              const pLt = cleanPower(entry.powerLt ?? entry.powerLeft);
              const rRt = cleanRom(entry.romRt !== undefined && entry.romRt !== '' ? entry.romRt : entry.romRight);
              const rLt = cleanRom(entry.romLt !== undefined && entry.romLt !== '' ? entry.romLt : entry.romLeft);
              rows.push({
                joint: joint.label,
                movement: movement,
                powerRt: pRt,
                powerLt: pLt,
                romRt: rRt,
                romLt: rLt,
              });
            }
          });
        });
      });
    }
    return rows;
  }, [rawRom]);

  // Neurological Examination
  const rawNeuro = rawData.neurologicalExamination || rawData.neurological_examination || rawData.neuroData || rawData.neuro_data;
  const neuroData = useMemo(() => {
    if (!rawNeuro || typeof rawNeuro !== 'object') return null;
    if (rawNeuro.sensoryReflexes || rawNeuro.coordinationBalance) {
      return {
        sensory: rawNeuro.sensoryReflexes,
        coordination: rawNeuro.coordinationBalance,
        reflexes: rawNeuro.sensoryReflexes,
        ...rawNeuro
      };
    }
    return rawNeuro;
  }, [rawNeuro]);

  // Functional Limitations
  const rawFunc = rawData.functionalLimitations || rawData.functional_limitations || rawData.functionalScores || rawData.functional_scores;
  const functionalLimitationsList: any[] = Array.isArray(rawFunc?.limitations)
    ? rawFunc.limitations
    : [];
  const functionalScoresObj = typeof rawFunc === 'object' && !Array.isArray(rawFunc?.limitations)
    ? (rawFunc.scores || rawFunc)
    : null;

  // Diagnoses
  const rawDiagnosis = rawData.diagnosis;
  const primaryDiagnoses: any[] = Array.isArray(rawDiagnosis?.primaryDiagnosis)
    ? rawDiagnosis.primaryDiagnosis
    : [];
  const secondaryDiagnoses: any[] = Array.isArray(rawDiagnosis?.secondaryDiagnosis)
    ? rawDiagnosis.secondaryDiagnosis
    : [];
  const diagnosisList: string[] = Array.isArray(rawData.diagnosisList || rawData.diagnosis_list)
    ? (rawData.diagnosisList || rawData.diagnosis_list)
    : [];
  const diagnosisText = typeof rawDiagnosis === 'string' ? rawDiagnosis : (rawDiagnosis?.notes || '');

  // Treatment Plan
  const rawTreatmentPlan = rawData.treatmentPlan || rawData.treatment_plan;
  const treatmentPlanModalities: any[] = Array.isArray(rawTreatmentPlan?.modalities)
    ? rawTreatmentPlan.modalities
    : [];
  const visitsRequired = rawTreatmentPlan?.visitsRequired;
  const treatmentDuration = rawTreatmentPlan?.treatmentDuration;
  const expectedOutcome = rawTreatmentPlan?.expectedOutcome;
  const planText = rawData.plan;

  // Assessment Notes & Clinician Remarks
  const assessmentNotes = rawData.assessmentNotes || rawData.assessment_notes;
  const clinicalFindings = rawData.clinicalFindings || rawData.clinical_findings;
  const therapyNotes = rawData.therapyNotes || rawData.therapy_notes;
  const progressNotes = rawData.progressNotes || rawData.progress_notes;
  const doctorRemarks = rawData.doctorRemarks || rawData.doctor_remarks;
  const therapistRemarks = rawData.therapistRemarks || rawData.therapist_remarks;
  const finalClinicalSummary = rawData.finalClinicalSummary || rawData.final_clinical_summary;

  const therapistName = clinician?.name || rawData.therapistName || rawData.doctor_name || rawData.createdBy?.name || 'Clinic Physiotherapist';
  const accentColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';

  return (
    <div className="flex flex-col gap-6 w-full text-left font-sans">
      {/* Hospital Banner (if hospital metadata present) */}
      {hospitalInfo && (
        <section className="bg-gradient-to-r from-teal-900 via-teal-800 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-teal-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-300" />
              <h3 className="text-lg font-black tracking-tight">{hospitalInfo.name}</h3>
            </div>
            {hospitalInfo.specialization && (
              <p className="text-xs text-teal-200 font-medium mt-0.5">{hospitalInfo.specialization}</p>
            )}
            {hospitalInfo.address && (
              <p className="text-[11px] text-teal-300/80 mt-1">{hospitalInfo.address} · {hospitalInfo.phone}</p>
            )}
          </div>
          {metadata && (
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-right">
              {metadata.reportId && <p className="text-xs font-black tracking-wider text-teal-100">{metadata.reportId}</p>}
              {metadata.reportDate && <p className="text-[11px] font-semibold text-teal-200">{metadata.reportDate}</p>}
            </div>
          )}
        </section>
      )}

      {/* Clinician & Patient Summary Header */}
      <section className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Conducting Clinician</span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{therapistName}</span>
            {clinician?.specialization && <span className="text-[11px] text-teal-600 dark:text-teal-400 block font-medium">{clinician.specialization}</span>}
          </div>
          {(patientInfo?.patientId || rawData.patientId) && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Patient Ref</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{patientInfo?.name || rawData.patientName || 'Patient'}</span>
              <span className="text-[11px] font-mono text-slate-500 block">{patientInfo?.patientId || rawData.patientId}</span>
            </div>
          )}
          {(patientInfo?.visitType || rawData.visitType) && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Visit Type</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{patientInfo?.visitType || rawData.visitType}</span>
            </div>
          )}
          {(patientInfo?.billAmount || rawData.billAmount) && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Bill Amount</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">₹{patientInfo?.billAmount || rawData.billAmount}</span>
            </div>
          )}
        </div>
      </section>

      {/* Vital Signs */}
      {(bp || pr || spo2 || temp || ef || painLevel) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Heart size={16} className="text-rose-500" />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Vital Signs</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-semibold">
            {bp && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Blood Pressure</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{bp}</span>
              </div>
            )}
            {pr && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Pulse Rate</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{pr}</span>
              </div>
            )}
            {spo2 && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">SpO₂</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{spo2}</span>
              </div>
            )}
            {temp && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Temperature</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{temp}</span>
              </div>
            )}
            {ef && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Ejection Fraction</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ef}</span>
              </div>
            )}
            {painLevel && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">Pain Rating</span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{painLevel}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Chief Complaints */}
      {chiefComplaintsArray.length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Heart size={16} className="text-rose-500" />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Chief Complaints</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chiefComplaintsArray.map((c: any, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-[12px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm">
                {formatDisplayValue(c)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Associated Symptoms & Pain Areas */}
      {(associatedSymptomsList.length > 0 || painAreasList.length > 0) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Activity size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Associated Symptoms & Pain Areas</span>
          </div>
          <div className="flex flex-col gap-4">
            {associatedSymptomsList.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">Symptoms</span>
                <div className="flex flex-wrap gap-2">
                  {associatedSymptomsList.map((s: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-850 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700/60 shadow-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {painAreasList.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">Pain Areas & Radiation</span>
                <div className="flex flex-wrap gap-2">
                  {painAreasList.map((p: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-850 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700/60 shadow-sm">
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
      {medicalHistoryList.length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <ClipboardList size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Medical History</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {medicalHistoryList.map((h: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-155 dark:border-slate-700 shadow-sm">
                {h}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Special Physical Tests & Clinical Exam */}
      {(specialPhysicalTestsList.length > 0 || testsObj || clinicalExamination?.examinationNotes) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Stethoscope size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Special Physical Tests & Clinical Exam</span>
          </div>
          <div className="flex flex-col gap-4 text-xs">
            {specialPhysicalTestsList.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2.5">Physical Tests</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {specialPhysicalTestsList.map((t: any, i: number) => {
                    const testName = t.testName || t.name || `Test ${i + 1}`;
                    const result = t.result || 'Not Tested';
                    const isPositive = result === 'Positive';
                    const isNegative = result === 'Negative';
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[160px] font-bold">{testName}</span>
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

            {testsObj && Object.keys(testsObj).length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2.5">Tests Recorded</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(testsObj).map(([key, value]: [string, any]) => {
                    const result = typeof value === 'object' ? (value?.result ?? 'Not Tested') : String(value);
                    const isPositive = result === 'Positive';
                    const isNegative = result === 'Negative';
                    return (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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

            {clinicalExamination?.examinationNotes && (
              <div className="mt-2 border-t border-slate-150 dark:border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1.5">Additional Clinical Notes</span>
                <p className="p-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl whitespace-pre-wrap font-medium border border-slate-150 dark:border-slate-850">{clinicalExamination.examinationNotes}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Range of Motion & Muscle Power Table */}
      {romTableRows.length > 0 ? (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Activity size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Muscle Power & Range of Motion</span>
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
      ) : legacyMusclePower && typeof legacyMusclePower === 'object' && Object.keys(legacyMusclePower).length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Activity size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Muscle Power Grades</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            {legacyMusclePower.rightUpper !== undefined && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Right Upper Limb</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{legacyMusclePower.rightUpper} / 5</span>
              </div>
            )}
            {legacyMusclePower.leftUpper !== undefined && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Left Upper Limb</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{legacyMusclePower.leftUpper} / 5</span>
              </div>
            )}
            {legacyMusclePower.rightLower !== undefined && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Right Lower Limb</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{legacyMusclePower.rightLower} / 5</span>
              </div>
            )}
            {legacyMusclePower.leftLower !== undefined && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Left Lower Limb</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{legacyMusclePower.leftLower} / 5</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Neurological Examination */}
      {neuroData && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Brain size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Neurological Examination</span>
          </div>
          <NeuroSummaryView neuroData={neuroData} />
        </section>
      )}

      {/* Functional Limitations */}
      {(functionalLimitationsList.length > 0 || (functionalScoresObj && Object.keys(functionalScoresObj).length > 0)) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <CheckSquare size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Functional Limitations & Ratings</span>
          </div>

          {functionalLimitationsList.length > 0 && (
            <div className="flex flex-col gap-3">
              {functionalLimitationsList.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400">{item.complaint || `Limitation ${idx + 1}`}</span>
                  {item.affectedActivities && item.affectedActivities.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Affected Activities</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.affectedActivities.map((act: string) => (
                          <span key={act} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">{act}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.painTriggers && item.painTriggers.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pain Triggers</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.painTriggers.map((trig: string) => (
                          <span key={trig} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 text-[11px] font-semibold">{trig}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.painReliefFactors && item.painReliefFactors.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Relief Factors</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.painReliefFactors.map((rel: string) => (
                          <span key={rel} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-[11px] font-semibold">{rel}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(item.numbness || item.radiation || item.weakness || item.burningSensation) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                      {item.numbness && <div><span className="text-[9px] text-slate-400 block font-bold">Numbness</span>{item.numbness}</div>}
                      {item.radiation && <div><span className="text-[9px] text-slate-400 block font-bold">Radiation</span>{item.radiation}</div>}
                      {item.weakness && <div><span className="text-[9px] text-slate-400 block font-bold">Weakness</span>{item.weakness}</div>}
                      {item.burningSensation && <div><span className="text-[9px] text-slate-400 block font-bold">Burning</span>{item.burningSensation}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {functionalScoresObj && (
            <div className="flex flex-col gap-2 mt-3">
              {Object.entries(functionalScoresObj).map(([key, val]: [string, any]) => {
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
          )}
        </section>
      )}

      {/* Diagnoses & ICD Codes */}
      {(primaryDiagnoses.length > 0 || secondaryDiagnoses.length > 0 || diagnosisList.length > 0 || diagnosisText) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <ClipboardList size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Diagnoses & ICD-10 Coding</span>
          </div>

          <div className="flex flex-col gap-3">
            {primaryDiagnoses.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-1.5">Primary Diagnoses</span>
                <div className="flex flex-wrap gap-2">
                  {primaryDiagnoses.map((d: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[12px] font-extrabold text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-900 flex items-center gap-2">
                      <span>{d.condition || formatDisplayValue(d)}</span>
                      {d.severity && <span className="px-1.5 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900 text-[10px] uppercase font-black">{d.severity}</span>}
                      {d.icdCode && <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">[ICD-10: {d.icdCode}]</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {secondaryDiagnoses.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-1.5">Secondary Diagnoses</span>
                <div className="flex flex-wrap gap-2">
                  {secondaryDiagnoses.map((d: any, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <span>{d.condition || formatDisplayValue(d)}</span>
                      {d.severity && <span className="text-[10px] text-slate-500 font-semibold">({d.severity})</span>}
                      {d.icdCode && <span className="text-[10px] font-mono text-slate-500 font-bold">[ICD-10: {d.icdCode}]</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {diagnosisList.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-1.5">Diagnoses Recorded</span>
                <div className="flex flex-wrap gap-2">
                  {diagnosisList.map((d: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-[12px] font-bold text-slate-750 dark:text-slate-300 border border-slate-200 dark:border-slate-850">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {diagnosisText && (
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                {diagnosisText}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Treatment Plan Details */}
      {(treatmentPlanModalities.length > 0 || visitsRequired || treatmentDuration || expectedOutcome || planText) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Dumbbell size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Treatment Plan Details</span>
          </div>

          {planText && (
            <p className="text-[13px] text-slate-800 dark:text-slate-250 leading-relaxed whitespace-pre-wrap mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-850 font-medium">
              {planText}
            </p>
          )}

          {treatmentPlanModalities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {treatmentPlanModalities.map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-700 dark:text-teal-400">{m.modality || m.fullName || formatDisplayValue(m)}</span>
                    {m.duration && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">{m.duration}</span>}
                  </div>
                  {m.fullName && m.fullName !== m.modality && <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{m.fullName}</p>}
                  {m.frequency && <p className="text-[11px] text-slate-500 font-medium">Frequency: <strong className="text-slate-700 dark:text-slate-300">{m.frequency}</strong></p>}
                  {m.purpose && <p className="text-[11px] text-slate-500 italic mt-1">{m.purpose}</p>}
                </div>
              ))}
            </div>
          )}

          {(visitsRequired || treatmentDuration || expectedOutcome) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm">
              {visitsRequired && <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Visits Required</span><span className="text-xs font-extrabold text-slate-800 dark:text-white">{visitsRequired} visits</span></div>}
              {treatmentDuration && <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Treatment Duration</span><span className="text-xs font-extrabold text-slate-800 dark:text-white">{treatmentDuration}</span></div>}
              {expectedOutcome && <div className="col-span-1 sm:col-span-3"><span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Outcome</span><span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{expectedOutcome}</span></div>}
            </div>
          )}
        </section>
      )}

      {/* Home Exercise Programme */}
      {prescribedExercises && prescribedExercises.length > 0 && (
        <section className="p-5 rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-[#F1EFE8] dark:bg-slate-900/40 border-l-[4px] border-l-[#1D9E75]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-300 dark:border-slate-800">
            <Dumbbell size={18} className="text-[#1D9E75]" />
            <span className="text-[13px] font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Home Exercise Programme
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold">
                <thead className="bg-[#1D9E75] text-white">
                  <tr>
                    <th className="px-3 py-2.5">Exercise</th>
                    <th className="px-3 py-2.5 text-center">Sets</th>
                    <th className="px-3 py-2.5 text-center">Reps</th>
                    <th className="px-3 py-2.5 text-center">Frequency</th>
                    <th className="px-3 py-2.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {prescribedExercises.map((ex, i) => (
                    <tr key={ex.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                        {i + 1}. {ex.exerciseName || ex.exercise_name}
                        {(ex.bodyPart || ex.body_part) && (
                          <span className="block text-[10px] font-normal text-teal-600 dark:text-teal-400">
                            Target: {ex.bodyPart || ex.body_part}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold">{ex.sets}</td>
                      <td className="px-3 py-2.5 text-center">{ex.reps}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-teal-700 dark:text-teal-300">{ex.frequency}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 italic">
                        {ex.description || ex.notes || 'As instructed by physical therapist.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
            <strong>General Instructions:</strong> Perform exercises as prescribed. Stop if pain increases beyond 3/10. Contact therapist if unsure about form or progression.
          </p>
        </section>
      )}

      {/* Clinician Remarks & Assessment Notes */}
      {(assessmentNotes || clinicalFindings || therapyNotes || progressNotes || doctorRemarks || therapistRemarks || finalClinicalSummary) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <StickyNote size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Clinician Remarks & Assessment Notes</span>
          </div>

          <div className="flex flex-col gap-3">
            {assessmentNotes?.clinicalImpression && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Clinical Impression</span>
                <p className="text-[12px] text-slate-800 dark:text-slate-200 font-semibold mt-1">{assessmentNotes.clinicalImpression}</p>
              </div>
            )}

            {assessmentNotes?.followUp && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-850">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Follow-up Schedule</span>
                <p className="text-[12px] text-teal-700 dark:text-teal-400 font-extrabold mt-1">{assessmentNotes.followUp}</p>
              </div>
            )}

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
                  <p className="text-[13px] text-slate-850 dark:text-slate-200 font-semibold mt-1 whitespace-pre-wrap">{formatDisplayValue(remarks.value)}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
