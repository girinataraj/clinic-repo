// ── Muscle Power & ROM configuration ──────────────────────────────────────────
export interface RomJoint {
  label: string;
  movements: string[];
}

export interface RomSection {
  label: string;
  joints: RomJoint[];
}

export const ROM_CONFIG: RomSection[] = [
  {
    label: 'Upper Limb',
    joints: [
      { label: 'Shoulder', movements: ['Flexion', 'Extension', 'Abduction', 'Adduction'] },
      { label: 'Elbow', movements: ['Flexion', 'Extension'] },
      { label: 'Forearm', movements: ['Supination', 'Pronation'] },
      { label: 'Wrist', movements: ['Flexion', 'Extension'] },
    ],
  },
  {
    label: 'Lower Limb',
    joints: [
      { label: 'Hip', movements: ['Flexion', 'Extension', 'Abduction', 'Adduction'] },
      { label: 'Knee', movements: ['Flexion', 'Extension'] },
      { label: 'Ankle', movements: ['Dorsi Flexion', 'Plantar Flexion', 'Inversion', 'Eversion', 'EHL'] },
    ],
  },
];

// ── Chief Complaints & Associated Symptoms ────────────────────────────────────


export const SPECIFIC_PROBLEM_OPTIONS = [
  { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: 'dynamic' },
  { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['nape of neck', 'lateral arm', 'elbow'] },
  { label: 'Unable to take a glass of water', key: 'glass_water', type: 'checkbox' },
  { label: 'Feeling weakness / heaviness / prickling sense', key: 'weakness_sense', type: 'checkbox' },
  { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['elbow', 'wrist'] },
  { label: 'Unable to hang the arm', key: 'hang_arm', type: 'checkbox' },
  { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['driving', 'sleeping', 'picking objects', 'work situations'] },
  { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'sleeping'] }
];



// ── Functional Activities ─────────────────────────────────────────────────────
export const FUNCTIONAL_ACTIVITIES = [
  { label: 'Walking', key: 'walking' },
  { label: 'Climbing Stairs', key: 'stairs' },
  { label: 'Sitting', key: 'sitting' },
  { label: 'Standing', key: 'standing' },
  { label: 'Dressing', key: 'dressing' },
  { label: 'Lifting Objects', key: 'lifting' },
];

export const RATING_LABELS = ['No Difficulty', 'Mild', 'Moderate', 'Severe', 'Unable'];

// ── Assessment Form Steps ─────────────────────────────────────────────────────
export const ASSESSMENT_STEPS = [
  { label: 'Patient', key: 'patient' },
  { label: 'Vitals', key: 'vitals' },
  { label: 'History', key: 'history' },
  { label: 'Complaints', key: 'complaints' },
  { label: 'Pain Scale', key: 'pain' },
  { label: 'Examination', key: 'examination' },
  { label: 'Diagnosis', key: 'diagnosis' },
  { label: 'Treatment', key: 'treatment' },
  { label: 'Review & Pay', key: 'review' },
];

// ── ROM data structure ────────────────────────────────────────────────────────
export type RomEntry = {
  powerRt?: string;
  powerLt?: string;
  romRt?: string;
  romLt?: string;
};

export type RomData = Record<string, RomEntry>; // key: "Shoulder_Flexion"

export function getRomKey(joint: string, movement: string) {
  return `${joint}_${movement}`.replace(/\s+/g, '_');
}

// ── Anthropometrics ───────────────────────────────────────────────────────────
export interface Anthropometrics {
  height: string;    // cm
  weight: string;    // kg
  bmi: string;       // auto-calculated
  excessWeight: string;
  excessCalorie: string;
  duration: string;
  waist: string;     // cm
  hip: string;       // cm
  whRatio: string;   // auto-calculated
}

export function calcBMI(heightCm: string, weightKg: string): string {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w || h <= 0) return '';
  const bmi = w / ((h / 100) ** 2);
  return bmi.toFixed(1);
}

export function calcWHRatio(waist: string, hip: string): string {
  const w = parseFloat(waist);
  const h = parseFloat(hip);
  if (!w || !h || h <= 0) return '';
  return (w / h).toFixed(2);
}

// ── Treatment Plan Options ────────────────────────────────────────────────────



export interface TreatmentPlanData {
  modalities: string[];
  manualTherapy: string[];
  rehabilitation: string[];
  visitsRequired: string;           // stored as string for input control; parsed to number on save
  frequencyGapDays: string;         // same approach
  suggestedStartDate: string;       // ISO date string or ''
  notes: string;
}

export function getEmptyTreatmentPlan(): TreatmentPlanData {
  return {
    modalities: [],
    manualTherapy: [],
    rehabilitation: [],
    visitsRequired: '',
    frequencyGapDays: '',
    suggestedStartDate: '',
    notes: '',
  };
}

/** Count how many treatment items have been selected across all groups */
export function getTreatmentSelectionCount(tp: TreatmentPlanData): number {
  return tp.modalities.length + tp.manualTherapy.length + tp.rehabilitation.length;
}



// ── Follow-up Session Data ────────────────────────────────────────────────────

export type FollowUpMode = 'same_as_today' | 'assigned_exercise' | 'others';

export interface FollowUpSessionData {
  followUpModes: FollowUpMode[];
  otherTreatments: string[];        // custom/selected items from "Others" mode
}

export function getEmptyFollowUp(): FollowUpSessionData {
  return {
    followUpModes: [],
    otherTreatments: [],
  };
}

// ── Diagnosis Options ─────────────────────────────────────────────────────────

export function getSortedDiagnoses(chiefComplaints: string[], diagnosisOptions: string[], relevanceMap: Record<string, number[]>): string[] {
  if (chiefComplaints.length === 0) return diagnosisOptions;

  const relevantIndices = new Set<number>();
  for (const cc of chiefComplaints) {
    const indices = relevanceMap[cc];
    if (indices) indices.forEach(i => relevantIndices.add(i));
  }

  if (relevantIndices.size === 0) return diagnosisOptions;

  const relevant: string[] = [];
  const rest: string[] = [];
  diagnosisOptions.forEach((d, i) => {
    if (relevantIndices.has(i)) relevant.push(d);
    else rest.push(d);
  });

  return [...relevant, ...rest];
}

// ── Clinical Examination — complaint-driven tests ─────────────────────────────

export type TestResult = 'Positive' | 'Negative' | 'Not Tested';

export interface ClinicalTestDef {
  name: string;
}

export interface RegionTestGroup {
  region: string;                // display label, e.g. "Neck"
  complaint: string;             // matched against CHIEF_COMPLAINT_OPTIONS value
  tests: ClinicalTestDef[];
}



/** Per-test result keyed by "Region_TestName" */
export interface ClinicalExamEntry {
  result: TestResult;
}

/** Per-region imaging findings */
export interface ImagingFindings {
  xray: string;
  mri: string;
}

/** Complete clinical examination data shape */
export interface ClinicalExamData {
  tests: Record<string, ClinicalExamEntry>;    // key: "Neck_Spurling Test"
  imaging: Record<string, ImagingFindings>;     // key: region name e.g. "Neck"
}

export function getClinicalTestKey(region: string, testName: string): string {
  return `${region}_${testName}`;
}

export function getEmptyClinicalExam(): ClinicalExamData {
  return { tests: {}, imaging: {} };
}
