import { useMemo } from 'react';
import { ROM_CONFIG, formatBorgRatings, SPECIFIC_PROBLEMS_BY_COMPLAINT, SPECIFIC_PROBLEM_OPTIONS } from '../screens/assessment/clinicalConfig';
import { 
  Activity, 
  Stethoscope, 
  CheckSquare, 
  Dumbbell, 
  ClipboardList,
  Heart,
  StickyNote,
  Brain,
  Building2,
  Scale
} from 'lucide-react';
import { NeuroSummaryView } from './NeuroSummaryView';
import { useExercises } from '../../hooks/useExercises';
import { ExerciseSection } from './ExerciseSection';

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

  // Clinical Examination & Legacy Muscle Power
  const clinicalExamination = rawData.clinicalExamination || rawData.clinical_examination;
  const legacyMusclePower = clinicalExamination?.musclePower || rawData.musclePower;
  const rawSpecialTests = clinicalExamination?.specialPhysicalTests || clinicalExamination?.special_tests || clinicalExamination?.tests || rawData.specialPhysicalTests || rawData.special_tests;
  const specialPhysicalTestsList: any[] = Array.isArray(rawSpecialTests)
    ? rawSpecialTests
    : (typeof rawSpecialTests === 'object' && rawSpecialTests !== null
        ? Object.entries(rawSpecialTests).map(([k, v]: [string, any]) => ({
            name: k.replace(/([A-Z])/g, ' $1').trim(),
            testName: k.replace(/([A-Z])/g, ' $1').trim(),
            result: typeof v === 'object' ? (v?.result || v?.status || 'Not Tested') : String(v)
          }))
        : []);
  const testsObj = typeof clinicalExamination?.tests === 'object' ? clinicalExamination.tests : null;

  // Range of Motion & Muscle Power
  const rawRom = rawData.rangeOfMotion || rawData.range_of_motion || rawData.musclePowerRom || rawData.muscle_power_rom || clinicalExamination?.musclePowerRom || clinicalExamination?.muscle_power_rom;
  const cleanPower = (v: any) => (v === null || v === undefined || v === '' || v === '7' || v === '77' ? '—' : String(v).trim());
  const cleanRom = (v: any) => (v === null || v === undefined || v === '' || v === '7' || v === '77' || v === '7°' || v === '77°' ? '—' : (String(v).trim().endsWith('°') ? String(v).trim() : `${String(v).trim()}°`));

  const romTableRows = useMemo(() => {
    const rows: any[] = [];
    const addedKeys = new Set<string>();
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
            const key4 = `${joint.label} ${movement}`;
            const entry = rawRom[key1] || rawRom[key2] || rawRom[key3] || rawRom[key4];
            if (entry && (entry.powerRt || entry.powerLt || entry.romRt || entry.romLt || entry.powerRight || entry.powerLeft || entry.romRight || entry.romLeft)) {
              rows.push({
                joint: joint.label,
                movement: movement,
                powerRt: cleanPower(entry.powerRt ?? entry.powerRight),
                powerLt: cleanPower(entry.powerLt ?? entry.powerLeft),
                romRt: cleanRom(entry.romRt !== undefined && entry.romRt !== '' ? entry.romRt : entry.romRight),
                romLt: cleanRom(entry.romLt !== undefined && entry.romLt !== '' ? entry.romLt : entry.romLeft),
              });
              addedKeys.add(key1); addedKeys.add(key2); addedKeys.add(key3); addedKeys.add(key4);
            }
          });
        });
      });
      Object.entries(rawRom).forEach(([key, entry]: [string, any]) => {
        if (!addedKeys.has(key) && entry && typeof entry === 'object') {
          if (entry.powerRt || entry.powerLt || entry.romRt || entry.romLt || entry.powerRight || entry.powerLeft || entry.romRight || entry.romLeft) {
            const parts = key.split('_');
            rows.push({
              joint: parts.length > 1 ? parts.slice(0, -1).join(' ') : key,
              movement: parts.length > 1 ? parts[parts.length - 1] : '',
              powerRt: cleanPower(entry.powerRt ?? entry.powerRight),
              powerLt: cleanPower(entry.powerLt ?? entry.powerLeft),
              romRt: cleanRom(entry.romRt !== undefined && entry.romRt !== '' ? entry.romRt : entry.romRight),
              romLt: cleanRom(entry.romLt !== undefined && entry.romLt !== '' ? entry.romLt : entry.romLeft),
            });
          }
        }
      });
    }
    return rows;
  }, [rawRom]);

  // Cardio & Anthropometrics
  const rawCardio = rawData.cardioData || rawData.cardio_data || rawData.cardiorespiratoryAssessment || rawData.cardiorespiratory_assessment;
  const rawAnthro = rawData.anthropometrics || rawData.anthropometrics_data;

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

  // Separate nurse ratings and doctor specific problems
  const { nurseRatings, doctorProblems } = useMemo(() => {
    const nRatings: Array<{ key: string; value: number }> = [];
    const dProblemsMap: Record<string, Array<{ label: string; values: string[] }>> = {};

    if (functionalScoresObj) {
      Object.entries(functionalScoresObj).forEach(([key, val]: [string, any]) => {
        if (key.includes('_') || (val && typeof val === 'object' && ('enabled' in val || 'values' in val))) {
          if (val && val.enabled) {
            const parts = key.split('_');
            const complaint = parts[0];
            const problemKey = parts.slice(1).join('_');
            
            const options = SPECIFIC_PROBLEMS_BY_COMPLAINT[complaint] || SPECIFIC_PROBLEM_OPTIONS || [];
            const match = options.find((opt: any) => opt.key === problemKey);
            const label = match?.label || problemKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            
            let values: string[] = [];
            if (Array.isArray(val.values)) {
              values = val.values;
            } else if (match && Array.isArray(match.options) && match.options.length > 0) {
              values = [match.options[0]];
            } else {
              values = ['Yes'];
            }

            if (!dProblemsMap[complaint]) {
              dProblemsMap[complaint] = [];
            }
            dProblemsMap[complaint].push({ label, values });
          }
        } else {
          const value = Number(val);
          if (!isNaN(value)) {
            nRatings.push({ key, value });
          }
        }
      });
    }
    return { nurseRatings: nRatings, doctorProblems: dProblemsMap };
  }, [functionalScoresObj]);

  const hasFunctionalData = functionalLimitationsList.length > 0 || nurseRatings.length > 0 || Object.keys(doctorProblems).length > 0;

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
  const treatmentPlanExercises: any[] = Array.isArray(rawTreatmentPlan?.exercises)
    ? rawTreatmentPlan.exercises
    : Array.isArray(rawData.exercises)
    ? rawData.exercises
    : Array.isArray(rawData.treatmentExercises)
    ? rawData.treatmentExercises
    : [];
  const visitsRequired = rawTreatmentPlan?.visitsRequired;
  const treatmentDuration = rawTreatmentPlan?.treatmentDuration;
  const expectedOutcome = rawTreatmentPlan?.expectedOutcome;
  const followUpNotes = rawTreatmentPlan?.followUpNotes || rawData.followUpPlan || rawData.follow_up_plan;
  const planText = rawData.plan;

  // Assessment Notes & Clinician Remarks
  const assessmentNotes = rawData.assessmentNotes || rawData.assessment_notes;
  const clinicalFindings = rawData.clinicalFindings || rawData.clinical_findings;
  const therapyNotes = rawData.therapyNotes || rawData.therapy_notes;
  const progressNotes = rawData.progressNotes || rawData.progress_notes;
  const doctorRemarks = rawData.doctorRemarks || rawData.doctor_remarks;
  const therapistRemarks = rawData.therapistRemarks || rawData.therapist_remarks;
  const finalClinicalSummary = rawData.finalClinicalSummary || rawData.final_clinical_summary;

  const therapistName = clinician?.name || rawData.therapistName || rawData.doctor_name || rawData.createdBy?.name || 'Dr. SV. Sathish Kumar';
  const clinicianQualifications = clinician?.qualifications || 'MPT (Cardio-Resp), PGDFM, DYT, CDNT';
  const clinicName = hospitalInfo?.name || 'Saai Physiotherapy Clinic';
  const clinicAddress = hospitalInfo?.address || '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode Dt – 638012';
  const clinicPhone = hospitalInfo?.phone || '94864 05778';
  const accentColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';

  return (
    <div className="flex flex-col gap-6 w-full text-left font-sans">
      {/* Hospital Banner */}
      <section className="bg-gradient-to-r from-teal-900 via-teal-800 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-teal-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-300" />
            <h3 className="text-lg font-black tracking-tight">{clinicName}</h3>
          </div>
          <p className="text-xs text-teal-200 font-medium mt-0.5">"Getting better every day"</p>
          <p className="text-[11px] text-teal-300/80 mt-1">{clinicAddress} · Phone: {clinicPhone}</p>
        </div>
        {metadata && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-right">
            {metadata.reportId && <p className="text-xs font-black tracking-wider text-teal-100">{metadata.reportId}</p>}
            {metadata.reportDate && <p className="text-[11px] font-semibold text-teal-200">{metadata.reportDate}</p>}
          </div>
        )}
      </section>

      {/* Clinician & Patient Summary Header */}
      <section className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Conducting Clinician</span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{therapistName}</span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 block font-medium">{clinician?.specialization || clinicianQualifications}</span>
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

      {/* Anthropometrics */}
      {rawAnthro && typeof rawAnthro === 'object' && Object.values(rawAnthro).some(v => v !== null && v !== undefined && v !== '') && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Scale size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Anthropometric Profile</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-semibold">
            {rawAnthro.height && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Height</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{rawAnthro.height} cm</span>
              </div>
            )}
            {rawAnthro.weight && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Weight</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{rawAnthro.weight} kg</span>
              </div>
            )}
            {rawAnthro.bmi && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">BMI</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{rawAnthro.bmi}</span>
              </div>
            )}
            {rawAnthro.waist && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Waist</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{rawAnthro.waist} cm</span>
              </div>
            )}
            {rawAnthro.hip && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Hip</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{rawAnthro.hip} cm</span>
              </div>
            )}
            {rawAnthro.whRatio && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">W/H Ratio</span>
                <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{rawAnthro.whRatio}</span>
              </div>
            )}
            {rawAnthro.excessWeight && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Excess Weight</span>
                <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">{rawAnthro.excessWeight} kg</span>
              </div>
            )}
            {rawAnthro.excessCalorie && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Excess Calorie</span>
                <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{rawAnthro.excessCalorie} kcal</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cardiorespiratory Assessment */}
      {rawCardio && typeof rawCardio === 'object' && (rawCardio.borgRating || rawCardio.vo2Max || rawCardio.sixMinWalk || rawCardio.rockportWalk || rawCardio.harvardStep || (rawCardio.exercisePrescription && Object.values(rawCardio.exercisePrescription).some(Boolean))) && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Heart size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Cardiorespiratory Assessment</span>
          </div>

          {rawCardio.borgRating && (
            <div className="mb-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Borg Rating (Perceived Exertion):</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                {formatBorgRatings(rawCardio.borgRating)}
              </span>
            </div>
          )}

          {(rawCardio.vo2Max || rawCardio.sixMinWalk || rawCardio.rockportWalk || rawCardio.harvardStep) && (
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-semibold">
                <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-slate-700 dark:text-slate-300">Cardio Test</th>
                    <th className="px-3 py-2 text-slate-700 dark:text-slate-300">Result / Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rawCardio.vo2Max && (
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">VO2 Max</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-900 dark:text-white">{rawCardio.vo2Max}</td>
                    </tr>
                  )}
                  {rawCardio.sixMinWalk && (
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">6 Min Walk Test</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-900 dark:text-white">{rawCardio.sixMinWalk}</td>
                    </tr>
                  )}
                  {rawCardio.rockportWalk && (
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">Rockport Walk Test</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-900 dark:text-white">{rawCardio.rockportWalk}</td>
                    </tr>
                  )}
                  {rawCardio.harvardStep && (
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">Harvard Step Test</td>
                      <td className="px-3 py-2.5 font-extrabold text-slate-900 dark:text-white">{rawCardio.harvardStep}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {rawCardio.exercisePrescription && Object.values(rawCardio.exercisePrescription).some(Boolean) && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">Exercise Prescription</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(rawCardio.exercisePrescription).map(([name, val]: [string, any]) => {
                  if (!val) return null;
                  return (
                    <div key={name} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 capitalize block font-bold">{name.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-100">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Functional Limitations */}
      {hasFunctionalData && (
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

          {nurseRatings.length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {nurseRatings.map(({ key, value }) => {
                const labels: Record<number, string> = { 0: 'No Difficulty', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
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

          {Object.keys(doctorProblems).length > 0 && (
            <div className="flex flex-col gap-3 mt-3">
              {Object.entries(doctorProblems).map(([complaint, problems]) => (
                <div key={complaint} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                  <h4 className="text-[12px] font-black text-indigo-700 dark:text-indigo-400 mb-2 border-b pb-1.5 border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                    {complaint} Details
                  </h4>
                  <div className="flex flex-col gap-2">
                    {problems.map((p, idx) => (
                      <div key={idx} className="text-xs flex flex-col sm:flex-row sm:items-start gap-1">
                        <span className="font-extrabold text-slate-400 dark:text-slate-500 min-w-[150px] uppercase text-[10px] tracking-wider pt-0.5">{p.label}:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.values.map((val, vidx) => (
                            <span key={vidx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

          {(visitsRequired || treatmentDuration || expectedOutcome || followUpNotes) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 shadow-sm">
              {visitsRequired && <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Follow Up Visits Required</span><span className="text-xs font-extrabold text-teal-700 dark:text-teal-400">{visitsRequired} days / visits</span></div>}
              {treatmentDuration && <div><span className="text-[10px] text-slate-400 font-bold uppercase block">Treatment Duration</span><span className="text-xs font-extrabold text-slate-800 dark:text-white">{treatmentDuration}</span></div>}
              {expectedOutcome && <div className="col-span-1 sm:col-span-3"><span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Outcome</span><span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{expectedOutcome}</span></div>}
              {followUpNotes && (
                <div className="col-span-1 sm:col-span-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Follow Up Notes & Instructions</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800 whitespace-pre-wrap">
                    {followUpNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Prescribed Exercises & Home Programme */}
      {treatmentPlanExercises.length > 0 && (
        <section className="bg-slate-50/40 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Dumbbell size={16} className={accentColor} />
            <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Prescribed Exercises & Home Programme ({treatmentPlanExercises.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {treatmentPlanExercises.map((ex: any, idx: number) => {
              const name = ex.exerciseName || ex.exercise_name || ex.name || 'Exercise';
              const cat = ex.category || ex.bodyPart || ex.body_part || 'General';
              const setsVal = ex.sets !== undefined && ex.sets !== null && ex.sets !== '' ? ex.sets : '—';
              const repsVal = ex.reps || ex.repetitions || '—';
              const holdVal = ex.holdTime || ex.hold_time || '';
              const freqVal = ex.frequency || '';
              const durVal = ex.duration || '';
              const inst = ex.notes || ex.instructions || ex.description || '';
              const attachments = ex.attachments || [];

              return (
                <div key={ex.id || idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                        {cat}
                      </span>
                    </div>

                    {/* Meta Fields Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-bold">
                      <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-center">
                        <span className="text-[9px] uppercase block text-slate-400 font-bold">Sets</span>
                        {setsVal}
                      </div>
                      <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-center">
                        <span className="text-[9px] uppercase block text-slate-400 font-bold">Reps</span>
                        {repsVal}
                      </div>
                      {holdVal && (
                        <div className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-center">
                          <span className="text-[9px] uppercase block text-slate-400 font-bold">Hold Time</span>
                          {holdVal}
                        </div>
                      )}
                      {freqVal && (
                        <div className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg text-center">
                          <span className="text-[9px] uppercase block text-slate-400 font-bold">Frequency</span>
                          {freqVal}
                        </div>
                      )}
                      {durVal && (
                        <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-center">
                          <span className="text-[9px] uppercase block text-slate-400 font-bold">Duration</span>
                          {durVal}
                        </div>
                      )}
                    </div>

                    {inst && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-2.5 bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        &quot;{inst}&quot;
                      </p>
                    )}
                  </div>

                  {attachments.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Attached Exercise PDFs & Files ({attachments.length}):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {attachments.map((att: any) => (
                          <a
                            key={att.id || att.name}
                            href={att.dataUrl}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-[11px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors"
                          >
                            📎 {att.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
