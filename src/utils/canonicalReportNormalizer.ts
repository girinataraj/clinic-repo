/**
 * Frontend Canonical Report Normalizer (Matches Backend Canonical Model 1:1)
 * Single source of truth for UI Report Preview.
 */

export interface CanonicalReport {
  hospitalInfo: {
    name: string;
    specialization: string;
    address: string;
    phone: string;
    email: string;
  } | null;

  patient: {
    id: string | null;
    displayId: string;
    name: string;
    age: number | null;
    gender: string;
    phone: string;
    city: string;
    condition: string;
    referredBy: string;
  };

  report: {
    id: string | null;
    displayId: string;
    dateTime: string;
    status: string;
    therapist: {
      id: string | null;
      name: string;
      displayId: string;
    };
  };

  vitals: {
    bp: string | null;
    pr: string | null;
    spo2: string | null;
    temperature: string | null;
    ef: string | null;
    painLevel: number | null;
  };

  chiefComplaints: string[];
  medicalHistory: string[];
  associatedSymptoms: string[];
  associatedPains: string[];
  specificProblems: Array<{ problem: string; detail: string }>;

  clinicalExamination: any;
  musclePowerRom: any;
  anthropometrics: any;
  neurological: any;
  cardio: any;

  treatmentPlan: {
    modalities: string[];
    manualTherapy: string[];
    rehabilitation: string[];
    visitsRequired: number | string | null;
    treatmentDuration: string | null;
    expectedOutcome: string | null;
    notes: string;
    exercises: any[];
  };

  exercises: any[];

  diagnosis: {
    text: string;
    list: string[];
  };

  imaging: {
    xray: string;
    mri: string;
    pft: string;
  };

  remarks: {
    clinicalFindings: string;
    therapyNotes: string;
    progressNotes: string;
    doctorRemarks: string;
    therapistRemarks: string;
    finalClinicalSummary: string;
  };
}

const parseJsonSafely = (val: any): any => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
};

const displayValue = (value: any): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(displayValue).filter(Boolean).join(', ') || null;
  if (typeof value === 'object') return Object.entries(value)
    .map(([key, item]) => {
      const text = displayValue(item);
      return text ? `${key.replace(/([A-Z])/g, ' $1')}: ${text}` : null;
    }).filter(Boolean).join(', ') || null;
  return null;
};

const SYMPTOM_MAP: Record<string, string> = {
  hang_arm: 'Difficulty hanging arm',
  pain_over: 'Pain over joint/area',
  glass_water: 'Difficulty holding a glass of water',
  numbness_over: 'Numbness over joint/area',
  pain_increased: 'Pain increased during movement',
  pain_radiating: 'Pain radiating down limb',
  weakness_sense: 'Sense of weakness in muscles',
};

const parseSpecificProblems = (rawSpecificProblems: any): Array<{ problem: string; detail: string }> => {
  if (!rawSpecificProblems) return [];
  const fsData = parseJsonSafely(rawSpecificProblems) || (typeof rawSpecificProblems === 'object' ? rawSpecificProblems : null);
  if (!fsData || typeof fsData !== 'object') return [];

  const labels: Record<number, string> = { 0: 'Normal', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
  const spLines: Array<{ problem: string; detail: string }> = [];

  Object.entries(fsData).forEach(([key, val]: [string, any]) => {
    if (val === undefined || val === null || val === '') return;
    let category = key;
    const underscoreIdx = key.indexOf('_');
    if (underscoreIdx !== -1) {
      const prefix = key.substring(0, underscoreIdx);
      const subKey = key.substring(underscoreIdx + 1);
      const labelMapped = SYMPTOM_MAP[subKey] || subKey.replace(/_/g, ' ');
      category = `${prefix} - ${labelMapped}`;
    } else {
      if (['stairs', 'walking', 'sitting', 'standing', 'dressing', 'lifting'].includes(key.toLowerCase()) && typeof val !== 'object') {
        category = key === 'stairs' ? 'Climbing Stairs' : key.replace(/([A-Z])/g, ' $1').trim();
      } else {
        category = SYMPTOM_MAP[key] || key.replace(/([A-Z])/g, ' $1').trim();
      }
    }
    category = category.charAt(0).toUpperCase() + category.slice(1);

    let details: string[] = [];
    if (typeof val === 'object') {
      if (val.enabled === false) return;
      if (Array.isArray(val.values) && val.values.length > 0) {
        details = val.values;
      } else if (val.enabled) {
        details = ['Present'];
      }
    } else if (typeof val === 'boolean' && val) {
      details = ['Present'];
    } else if (typeof val === 'string' && val.trim()) {
      details = [val.trim()];
    } else if (typeof val === 'number' || !isNaN(Number(val))) {
      const cleanVal = Number(val);
      details = [`${cleanVal} - ${labels[cleanVal] || 'Recorded'}`];
    }

    if (details.length > 0) {
      spLines.push({
        problem: category,
        detail: details.join(', '),
      });
    }
  });

  return spLines;
};
const parseNeuroData = (rawNeuro: any) => {
  if (!rawNeuro) return {};
  const data = parseJsonSafely(rawNeuro) || (typeof rawNeuro === 'object' ? rawNeuro : {});
  
  let gcs = null;
  if (data.gcs) {
    gcs = {
      eye: data.gcs.e || data.gcs.eye || null,
      verbal: data.gcs.v || data.gcs.verbal || null,
      motor: data.gcs.m || data.gcs.motor || null,
      total: data.gcs.total || null,
    };
  }

  let mmse = null;
  if (data.mmse) {
    if (typeof data.mmse === 'string' || typeof data.mmse === 'number') {
      const str = String(data.mmse).trim();
      const totalStr = str.includes('/') ? str : `${str}/30`;
      mmse = { questions: null, totalScore: totalStr, total: totalStr };
    } else if (typeof data.mmse === 'object') {
      const questions: Record<string, string | number> = {};
      let hasQ = false;
      for (let i = 1; i <= 11; i++) {
        const qKey = `q${i}`;
        if (data.mmse[qKey] !== undefined && data.mmse[qKey] !== null && data.mmse[qKey] !== '') {
          questions[qKey] = data.mmse[qKey];
          hasQ = true;
        }
      }
      if (data.mmse.questions && typeof data.mmse.questions === 'object') {
        Object.entries(data.mmse.questions).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            questions[k] = v as string | number;
            hasQ = true;
          }
        });
      }
      const rawTotal = data.mmse.totalScore ?? data.mmse.total ?? data.mmse.score ?? null;
      let totalStr: string | null = null;
      if (rawTotal !== null && rawTotal !== undefined && rawTotal !== '') {
        const s = String(rawTotal).trim();
        totalStr = s.includes('/') ? s : `${s}/30`;
      } else if (hasQ) {
        let sum = 0;
        Object.values(questions).forEach(v => {
          const num = parseInt(String(v), 10);
          if (!isNaN(num)) sum += num;
        });
        totalStr = `${Math.min(30, sum)}/30`;
      }
      mmse = {
        questions: hasQ ? questions : null,
        totalScore: totalStr,
        total: totalStr
      };
    }
  }

  const coordRaw = data.coordinationBalance || data.coordination;
  let coordination: any[] = [];
  if (typeof coordRaw === 'string') {
    coordination = [{ test: 'General', result: coordRaw }];
  } else if (coordRaw && typeof coordRaw === 'object') {
    Object.entries(coordRaw).forEach(([key, val]: [string, any]) => {
      if (val && typeof val === 'object' && (val.rt || val.lt || val.right || val.left)) {
         coordination.push({ test: key, right: val.rt || val.right || '—', left: val.lt || val.left || '—', result: `Right: ${val.rt || val.right || '—'}, Left: ${val.lt || val.left || '—'}` });
      } else if (val && typeof val === 'string') {
         coordination.push({ test: key, result: val });
      }
    });
  }

  let posture = null;
  if (typeof data.posture === 'string') {
    posture = [{ component: 'Posture', observation: data.posture }];
  } else if (data.posture && typeof data.posture === 'object') {
    posture = Object.entries(data.posture).map(([k, v]: [string, any]) => ({
      component: k.replace(/([A-Z])/g, ' $1').trim(),
      frontal: typeof v === 'object' ? displayValue(v.frontal) : null,
      sagittal: typeof v === 'object' ? displayValue(v.sagittal) : null,
      observation: typeof v === 'string' ? v : displayValue(v) || '—'
    }));
  }

  let gait = null;
  if (typeof data.gait === 'string') {
    gait = [{ component: 'Gait', observation: data.gait }];
  } else if (data.gait && typeof data.gait === 'object') {
    gait = Object.entries(data.gait).map(([k, v]) => ({ component: k.replace(/([A-Z])/g, ' $1').trim(), observation: displayValue(v) || '—' }));
  }

  return {
    gcs,
    mmse,
    sensory: data.sensory || null,
    reflexes: data.reflexes || null,
    voluntaryControl: data.voluntaryControl || null,
    coordination,
    balance: Object.entries(data.balance || {}).map(([key, value]) => ({ test: key.replace(/([A-Z])/g, ' $1').trim(), value: displayValue(value) || '—' })),
    posture,
    gait
  };
};

const parseCardioData = (rawCardio: any) => {
  if (!rawCardio) return {};
  const data = parseJsonSafely(rawCardio) || (typeof rawCardio === 'object' ? rawCardio : {});
  return {
    borgRating: data.borgRating || data.borg_rating || null,
    vo2Max: data.vo2Max || data.vo2_max || null,
    sixMinWalk: data.sixMinWalk || data.six_min_walk || null,
    rockportWalk: data.rockportWalk || data.rockport_walk || null,
    harvardStep: data.harvardStep || data.harvard_step || null,
  };
};

export const normalizeEvaluationForReport = (rawInput: any): CanonicalReport => {
  if (rawInput?.patient && rawInput?.report?.therapist && rawInput?.vitals &&
      Array.isArray(rawInput?.chiefComplaints) && rawInput?.neurological) {
    return rawInput as CanonicalReport;
  }
  const raw = rawInput?.report ? rawInput.report : (rawInput || {});

  // Hospital Metadata
  const rawMeta = raw.metadata || {};
  const rawHospital = rawMeta.hospitalInfo || raw.hospitalInfo || raw.hospital_info || null;
  const hospitalInfo = rawHospital
    ? {
        name: rawHospital.name || 'SAAI PHYSIOTHERAPY CLINIC',
        specialization: rawHospital.specialization || 'Advanced Physiotherapy & Rehabilitation Center',
        address: rawHospital.address || '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode Dt - 638012',
        phone: rawHospital.phone || '94864 05778',
        email: rawHospital.email || 'saaiphysioclinicerode@gmail.com',
      }
    : {
        name: 'SAAI PHYSIOTHERAPY CLINIC',
        specialization: 'Advanced Physiotherapy & Rehabilitation Center',
        address: '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode Dt - 638012',
        phone: '94864 05778',
        email: 'saaiphysioclinicerode@gmail.com',
      };

  // 1. Patient
  const patientInfo = raw.patientInfo || raw.patient || {};
  const patient = {
    id: raw.patient_id || raw.patientId || patientInfo.id || null,
    displayId: raw.patient_display_id || raw.patientDisplayId || patientInfo.displayId || patientInfo.display_id || '—',
    name: raw.patient_name || raw.patientName || raw.name || patientInfo.name || '—',
    age: raw.patient_age ?? raw.patientAge ?? raw.age ?? patientInfo.age ?? null,
    gender: raw.patient_gender || raw.patientGender || raw.gender || patientInfo.gender || '—',
    phone: raw.patient_phone || raw.patientPhone || raw.phone || patientInfo.phone || '—',
    city: raw.patient_city || raw.patientCity || raw.city || patientInfo.city || '—',
    condition: raw.patient_condition || raw.patientCondition || raw.condition || patientInfo.condition || '—',
    referredBy: raw.patient_referred_by || raw.patientReferredBy || raw.referred_by || raw.referredBy || patientInfo.referredBy || 'Self',
  };

  // 2. Report
  const clinician = raw.clinician || {};
  const report = {
    id: raw.id || null,
    displayId: raw.display_id || raw.displayId || (raw.id ? `EVAL-${String(raw.id).substring(0, 8)}` : '—'),
    dateTime: raw.created_at || raw.createdAt || raw.issued_at || raw.issuedAt || new Date().toISOString(),
    status: raw.status || 'draft',
    therapist: {
      id: raw.doctor_id || raw.doctorId || clinician.id || null,
      name: raw.doctor_name || raw.therapistName || raw.doctorName || clinician.name || 'Dr. SV. Sathish Kumar',
      displayId: raw.doctor_display_id || raw.therapistDisplayId || raw.doctorDisplayId || clinician.displayId || 'USR-2026-001',
    },
  };

  // 3. Vitals
  const vitalsObj = parseJsonSafely(raw.vitals || raw.vitalSigns) || (typeof (raw.vitals || raw.vitalSigns) === 'object' ? (raw.vitals || raw.vitalSigns) : {});
  const bpVal = raw.bp || raw.bloodPressure || vitalsObj.bp || vitalsObj.bloodPressure || (vitalsObj.bp_sys && vitalsObj.bp_dia ? `${vitalsObj.bp_sys}/${vitalsObj.bp_dia}` : null);
  const prVal = raw.pr || raw.pulse || raw.pulseRate || vitalsObj.pr || vitalsObj.pulse || vitalsObj.pulse_rate || vitalsObj.pulseRate || null;
  const spo2Val = raw.spo2 || raw.spO2 || vitalsObj.spo2 || vitalsObj.spO2 || null;
  const tempVal = raw.temperature || raw.temp || vitalsObj.temperature || vitalsObj.temp || null;
  const efVal = raw.ef || raw.ejectionFraction || vitalsObj.ef || vitalsObj.ejectionFraction || null;

  let painVal: number | null = null;
  if (raw.painLevel !== undefined && raw.painLevel !== null) painVal = Number(raw.painLevel);
  else if (raw.pain_level !== undefined && raw.pain_level !== null) painVal = Number(raw.pain_level);
  else if (raw.painScale !== undefined && raw.painScale !== null) painVal = Number(raw.painScale);
  else if (raw.pain !== undefined && raw.pain !== null) painVal = Number(raw.pain);
  else if (vitalsObj.painLevel !== undefined && vitalsObj.painLevel !== null) painVal = Number(vitalsObj.painLevel);

  const vitals = {
    bp: bpVal ? String(bpVal).trim() : null,
    pr: prVal ? String(prVal).trim() : null,
    spo2: spo2Val ? String(spo2Val).trim() : null,
    temperature: tempVal ? String(tempVal).trim() : null,
    ef: efVal ? String(efVal).trim() : null,
    painLevel: painVal,
  };

  // 4. Complaints & History
  const rawCC = raw.chief_complaints || raw.chiefComplaints;
  const chiefComplaints = Array.isArray(rawCC)
    ? rawCC
    : (typeof rawCC === 'string' && rawCC.trim() ? [rawCC.trim()] : []);

  const rawMH = raw.medical_history || raw.medicalHistory;
  const medicalHistory = Array.isArray(rawMH)
    ? rawMH
    : (typeof rawMH === 'string' && rawMH.trim() ? [rawMH.trim()] : []);

  const rawSym = raw.associated_symptoms || raw.associatedSymptoms;
  const associatedSymptoms = Array.isArray(rawSym)
    ? rawSym.filter((s: any) => typeof s === 'string' && !s.startsWith('Visit Type:'))
    : (typeof rawSym === 'string' && rawSym.trim() ? [rawSym.trim()] : []);

  const rawPains = raw.associated_pains || raw.associatedPains;
  const associatedPains = Array.isArray(rawPains)
    ? rawPains
    : (typeof rawPains === 'string' && rawPains.trim() ? [rawPains.trim()] : []);

  const rawSP = raw.specific_problems || raw.specificProblems || raw.functional_scores || raw.functionalScores;
  const specificProblems = parseSpecificProblems(rawSP);

  const clinicalExamination = parseJsonSafely(raw.clinical_examination || raw.clinicalExamination) || {};
  const musclePowerRom = parseJsonSafely(raw.muscle_power_rom || raw.musclePowerRom) || {};
  const anthropometrics = parseJsonSafely(raw.anthropometrics) || {};
  const neurological = parseNeuroData(raw.neuro_data || raw.neuroData);
  const cardio = parseCardioData(raw.cardio_data || raw.cardioData);

  const rawTp = raw.treatment_plan || raw.treatmentPlan;
  const tpParsed = parseJsonSafely(rawTp) || (typeof rawTp === 'object' ? rawTp : {});

  let prescribedExercises: any[] = [];
  if (Array.isArray(tpParsed.exercises) && tpParsed.exercises.length > 0) {
    prescribedExercises = tpParsed.exercises;
  } else if (Array.isArray(raw.exercise_items) && raw.exercise_items.length > 0) {
    prescribedExercises = raw.exercise_items;
  } else if (Array.isArray(raw.prescribed_exercises) && raw.prescribed_exercises.length > 0) {
    prescribedExercises = raw.prescribed_exercises;
  }

  const treatmentPlan = {
    modalities: Array.isArray(tpParsed.modalities) ? tpParsed.modalities : [],
    manualTherapy: Array.isArray(tpParsed.manualTherapy) ? tpParsed.manualTherapy : [],
    rehabilitation: Array.isArray(tpParsed.rehabilitation) ? tpParsed.rehabilitation : [],
    visitsRequired: tpParsed.visitsRequired || tpParsed.visits_required || null,
    treatmentDuration: tpParsed.treatmentDuration || tpParsed.duration || null,
    expectedOutcome: tpParsed.expectedOutcome || tpParsed.outcome || null,
    notes: tpParsed.notes || raw.plan || '',
    exercises: prescribedExercises,
  };

  const rawDiagList = raw.diagnosis_list || raw.diagnosisList;
  const diagList = Array.isArray(rawDiagList) ? rawDiagList : (typeof rawDiagList === 'string' && rawDiagList.trim() ? [rawDiagList.trim()] : []);
  const diagnosis = {
    text: raw.diagnosis || (diagList.length > 0 ? diagList.join(', ') : ''),
    list: diagList,
  };

  const imaging = {
    xray: raw.xray_findings || raw.xrayFindings || (clinicalExamination.imaging?.xray || ''),
    mri: raw.mri_findings || raw.mriFindings || (clinicalExamination.imaging?.mri || ''),
    pft: raw.pft_findings || raw.pftFindings || (clinicalExamination.imaging?.pft || ''),
  };

  const remarks = {
    clinicalFindings: raw.clinical_findings || raw.clinicalFindings || raw.examination_notes || '',
    therapyNotes: raw.therapy_notes || raw.therapyNotes || '',
    progressNotes: raw.progress_notes || raw.progressNotes || '',
    doctorRemarks: raw.doctor_remarks || raw.doctorRemarks || '',
    therapistRemarks: raw.therapist_remarks || raw.therapistRemarks || '',
    finalClinicalSummary: raw.final_clinical_summary || raw.finalClinicalSummary || raw.management || '',
  };

  return {
    hospitalInfo,
    patient,
    report,
    vitals,
    chiefComplaints,
    medicalHistory,
    associatedSymptoms,
    associatedPains,
    specificProblems,
    clinicalExamination,
    musclePowerRom,
    anthropometrics,
    neurological,
    cardio,
    treatmentPlan,
    exercises: prescribedExercises,
    diagnosis,
    imaging,
    remarks,
  };
};
