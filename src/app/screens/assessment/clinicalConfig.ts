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
export const CHIEF_COMPLAINT_OPTIONS = [
  'Breathlessness (SOB)',
  'Cough With Expectoration',
  'Cough Without Expectoration',
  'Chest Pain',
  'Noisy Breathing – Wheezing',
  'Noisy Breathing – Stridor',
];

export const ASSOCIATED_SYMPTOM_OPTIONS = [
  'Haemoptysis',
  'Hoarseness',
  'Voice Change',
  'Dizziness',
  'Headache',
  'Altered Sensorium',
  'Ankle Swelling',
  'Cyanosis',
  'Excessive Sweating',
  'Nausea',
  'Vomiting',
  'Weight Loss',
  'Fatigue',
  'Weakness',
  'Exercise Intolerance',
  'Altered Sleep Pattern',
];

// ── Medical History Options ───────────────────────────────────────────────────
export const MEDICAL_HISTORY_OPTIONS = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Previous Surgery',
  'Allergies',
  'Asthma / COPD',
  'Thyroid Disorder',
  'Neurological Condition',
  'Renal Disorder',
  'Liver Disorder',
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
  { label: 'Complaints', key: 'complaints' },
  { label: 'Pain & Function', key: 'pain' },
  { label: 'Power & ROM', key: 'rom' },
  { label: 'Anthropometrics', key: 'anthropometrics' },
  { label: 'History', key: 'history' },
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
