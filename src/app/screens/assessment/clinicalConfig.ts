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
  'NECK', 'SHOULDER', 'ARM', 'ELBOW', 'WRIST',
  'UPPER BACK', 'LOWER BACK', 'HIP', 'GLUTEALS', 'THIGH',
  'KNEE', 'ANKLE', 'FOOT', 'Another'
];

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

// ── Diagnosis Options ─────────────────────────────────────────────────────────

export const DIAGNOSIS_OPTIONS: string[] = [
  'Cervical spondylosis',
  'Cervical disc disease',
  'Cervical facet joint arthritis',
  'Cervical root radiculopathy',
  'Trapezitis',
  'Rhomboids trigger',
  'Shoulder impingement syndrome',
  'Post traumatic shoulder',
  'Sub-acromial bursitis',
  'Sub-deltoid bursitis',
  'Supraspinatus tendinitis',
  'Rotator cuff tendinitis',
  'Tennis elbow',
  "Golfer's elbow",
  'Carpal tunnel syndrome',
  'Trigger finger',
  "De Quervain's disease",
  'Mechanical back pain',
  'Sacroiliac syndrome / strain',
  'Piriformis syndrome',
  'Quadratus lumborum syndrome',
  'Lumbar spondylosis',
  'Lumbar disc disease',
  'Lumbar radiculopathy (sciatica)',
  'Lumbar canal stenosis',
  'IT band syndrome',
  'Hip osteoarthritis',
  'Osteoarthritis (knee)',
  'Ligament injuries – ACL / PCL / meniscal / LCL / MCL',
  'Patellofemoral arthritis',
  'Ankle sprain',
  'Plantar fasciitis',
  'Metatarsalgia',
];

/**
 * Maps a Chief Complaint keyword to relevant diagnosis indices (0-based)
 * within DIAGNOSIS_OPTIONS. Used to sort related diagnoses to the top.
 */
export const COMPLAINT_DIAGNOSIS_RELEVANCE: Record<string, number[]> = {
  'NECK':        [0, 1, 2, 3, 4, 5],
  'SHOULDER':    [6, 7, 8, 9, 10, 11],
  'ELBOW':       [12, 13],
  'WRIST':       [14, 15, 16],
  'UPPER BACK':  [4, 5],
  'LOWER BACK':  [17, 18, 19, 20, 21, 22, 23, 24],
  'HIP':         [19, 25, 26],
  'GLUTEALS':    [19, 18],
  'THIGH':       [25],
  'KNEE':        [27, 28, 29],
  'ANKLE':       [30],
  'FOOT':        [31, 32],
};

/**
 * Returns diagnosis options sorted so that complaint-relevant items appear first.
 */
export function getSortedDiagnoses(chiefComplaints: string[]): string[] {
  if (chiefComplaints.length === 0) return DIAGNOSIS_OPTIONS;

  const relevantIndices = new Set<number>();
  for (const cc of chiefComplaints) {
    const indices = COMPLAINT_DIAGNOSIS_RELEVANCE[cc];
    if (indices) indices.forEach(i => relevantIndices.add(i));
  }

  if (relevantIndices.size === 0) return DIAGNOSIS_OPTIONS;

  const relevant: string[] = [];
  const rest: string[] = [];
  DIAGNOSIS_OPTIONS.forEach((d, i) => {
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

/**
 * Mapping from Chief Complaint → clinical tests.
 * When a complaint is selected, the corresponding tests become visible.
 */
export const CLINICAL_TEST_MAP: RegionTestGroup[] = [
  {
    region: 'Neck',
    complaint: 'NECK',
    tests: [
      { name: 'Spurling Test' },
    ],
  },
  {
    region: 'Shoulder',
    complaint: 'SHOULDER',
    tests: [
      { name: 'Neer Impingement Test' },
      { name: 'Empty Can Test' },
      { name: 'Full Can Test' },
      { name: 'Crank Test' },
      { name: 'Cross-over Test' },
    ],
  },
  {
    region: 'Elbow',
    complaint: 'ELBOW',
    tests: [
      { name: 'Cozen Test' },
      { name: 'Reverse Cozen Test' },
    ],
  },
  {
    region: 'Wrist',
    complaint: 'WRIST',
    tests: [
      { name: "Phalen's Test" },
      { name: "Finkelstein's Test" },
    ],
  },
  {
    region: 'Hip',
    complaint: 'HIP',
    tests: [
      { name: 'SLR (Straight Leg Raise)' },
      { name: 'FABER' },
      { name: 'FADDIR' },
    ],
  },
  {
    region: 'Knee',
    complaint: 'KNEE',
    tests: [
      { name: 'Anterior Drawer Test' },
      { name: 'Posterior Drawer Test' },
      { name: "McMurray's Test" },
    ],
  },
];

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
