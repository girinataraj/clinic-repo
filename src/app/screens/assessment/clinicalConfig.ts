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


export const SPECIFIC_PROBLEMS_BY_COMPLAINT: Record<string, Array<{
  label: string;
  key: string;
  type: 'dropdown' | 'checkbox';
  options?: string[] | 'dynamic';
}>> = {
  'Neck Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['neck', 'shoulder', 'arm'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['nape of neck', 'lateral arm', 'elbow'] },
    { label: 'Unable to', key: 'glass_water', type: 'checkbox', options: ['take a glass of water'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['elbow', 'wrist'] },
    { label: 'Unable to', key: 'hang_arm', type: 'checkbox', options: ['hang the arm'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['driving', 'sleeping', 'picking objects', 'work situations'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'sleeping'] }
  ],
  'Lower Back Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['back', 'buttock', 'thigh', 'up to knee'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['side of thigh', 'back of thigh'] },
    { label: 'Burning sensation over the', key: 'burning_sensation', type: 'dropdown', options: ['upper feet', 'sole'] },
    { label: 'Difficult to', key: 'difficult_stepping', type: 'dropdown', options: ['stepping', 'walking', 'getting up from bed', 'getting up from chair'] },
    { label: 'Difficult to', key: 'difficult_sitting', type: 'dropdown', options: ['sitting', 'standing', 'walking', 'bending forward'] }
  ],
  'Shoulder Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['anterior shoulder', 'posterior shoulder', 'lateral arm', 'joint line'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['shoulder joint', 'lateral upper arm'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['upper arm', 'elbow', 'hand'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['lift arm overhead', 'reach behind back', 'comb hair', 'carry bags', 'sleep on side'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Unable to', key: 'hang_arm', type: 'checkbox', options: ['hang the arm'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['overhead reach', 'lifting weights', 'sleeping on side', 'reaching out'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'supporting the arm', 'heat therapy'] }
  ],
  'Knee Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['patella (knee cap)', 'medial joint line', 'lateral joint line', 'popliteal fossa (behind knee)'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['around knee cap', 'calf', 'shin'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['thigh', 'calf', 'shin'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['squat / kneel', 'climb stairs', 'sit cross-legged', 'walk without support', 'stand for long'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Knee', key: 'knee_giving_way', type: 'dropdown', options: ['giving way', 'locking sensation'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['stair climbing', 'squatting', 'prolonged walking', 'prolonged sitting'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'keeping leg straight', 'wearing knee brace', 'ice pack'] }
  ],
  'Elbow Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['lateral epicondyle (outer)', 'medial epicondyle (inner)', 'olecranon (tip of elbow)'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['lateral forearm', 'medial forearm', 'ring / little finger'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['upper arm', 'forearm', 'wrist'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['grip objects', 'twist forearm (wring clothes)', 'lift weights', 'straighten elbow fully'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['gripping', 'typing / mouse work', 'lifting objects', 'twisting forearm'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'wearing elbow brace', 'ice pack'] }
  ],
  'Wrist / Hand Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['wrist joint', 'thumb base', 'palm', 'finger joints'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['thumb & index finger', 'palm', 'little / ring finger'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['forearm', 'elbow'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['write', 'type / use keyboard', 'hold objects securely', 'open jars / caps', 'make a tight fist'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['typing / writing', 'gripping / squeezing', 'repetitive wrist motions'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'wearing wrist splint', 'warm water immersion'] }
  ],
  'Hip Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['groin', 'lateral hip (trochanter)', 'buttock', 'anterior thigh'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['groin', 'outer thigh', 'buttock'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['thigh', 'knee'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['walk long distances', 'climb stairs', 'sit cross-legged', 'lie on affected side', 'put full weight on leg'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['walking', 'prolonged sitting', 'climbing stairs', 'lying on hip'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'lying flat', 'unloading weight'] }
  ],
  'Ankle / Foot Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['lateral ankle (outer)', 'medial ankle (inner)', 'heel / Achilles tendon', 'sole (plantar fascia)'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['sole of foot', 'heel', 'toes'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['calf', 'shin'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['walk first thing in morning', 'walk barefoot', 'stand on toes', 'run / jump'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['first steps in morning', 'prolonged standing / walking', 'weight-bearing activities'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'wearing cushioned footwear', 'ice pack', 'elevation'] }
  ],
  'Sciatica': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['lower back', 'gluteal region', 'posterior thigh', 'calf'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['back of thigh', 'calf', 'foot'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['thigh', 'calf', 'foot / toes'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['sit for long', 'walk without pain', 'bend forward', 'lift leg straight'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['sitting', 'forward bending', 'driving', 'coughing / sneezing'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['walking', 'lying flat', 'changing positions'] }
  ],
  'Frozen Shoulder': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['shoulder joint', 'lateral arm', 'deltoid region'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['deltoid region', 'shoulder joint'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['upper arm', 'elbow'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['lift arm overhead', 'reach behind back', 'comb hair', 'sleep on affected side'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['overhead reach', 'reaching backward', 'sleeping on side', 'sudden movements'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'holding arm in sling / close', 'heat application'] }
  ],
  'Upper Back Pain': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['back', 'buttock', 'thigh', 'up to knee'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['side of thigh', 'back of thigh'] },
    { label: 'Burning sensation over the', key: 'burning_sensation', type: 'dropdown', options: ['upper feet', 'sole'] },
    { label: 'Difficult to', key: 'difficult_stepping', type: 'dropdown', options: ['stepping', 'walking', 'getting up from bed', 'getting up from chair'] },
    { label: 'Difficult to', key: 'difficult_sitting', type: 'dropdown', options: ['sitting', 'standing', 'walking', 'bending forward'] }
  ],
  'Plantar Fasciitis': [
    { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['heel base', 'medial arch of foot', 'sole'] },
    { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['heel base', 'medial arch of foot'] },
    { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['Achilles tendon', 'calf'] },
    { label: 'Unable to', key: 'unable_to', type: 'dropdown', options: ['walk first thing in morning', 'walk barefoot', 'stand for long', 'climb stairs comfortably'] },
    { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
    { label: 'Pain increased by', key: 'pain_increased', type: 'dropdown', options: ['first steps after waking / rest', 'prolonged standing / walking', 'walking barefoot'] },
    { label: 'Pain reduced by', key: 'pain_reduced', type: 'dropdown', options: ['rest', 'wearing soft / orthotic footwear', 'rolling sole on ice bottle'] }
  ]
};

export const SPECIFIC_PROBLEM_OPTIONS = [
  { label: 'Pain over the', key: 'pain_over', type: 'dropdown', options: ['neck', 'shoulder', 'arm'] },
  { label: 'Numbness over the', key: 'numbness_over', type: 'dropdown', options: ['nape of neck', 'lateral arm', 'elbow'] },
  { label: 'Unable to', key: 'glass_water', type: 'checkbox', options: ['take a glass of water'] },
  { label: 'Feeling', key: 'weakness_sense', type: 'dropdown', options: ['weakness', 'heaviness', 'prickling sense'] },
  { label: 'Pain radiating up to', key: 'pain_radiating', type: 'dropdown', options: ['elbow', 'wrist'] },
  { label: 'Unable to', key: 'hang_arm', type: 'checkbox', options: ['hang the arm'] },
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
  { label: 'VAS Scale', key: 'pain' },
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
  xrayFindings: string;
  mriFindings: string;
  pftFindings: string;
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
    xrayFindings: '',
    mriFindings: '',
    pftFindings: '',
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

// ── Cardio Exam Configuration ───────────────────────────────────────────────
export interface CardioExamData {
  borgRating: string;
  vo2Max: string;
  sixMinWalk: string;
  rockportWalk: string;
  harvardStep: string;
  exercisePrescription: {
    warmups: string;
    stretching: string;
    hiit: string;
    aerobics: string;
    strengthTraining: string;
    cooldown: string;
  };
}

export function getEmptyCardioExam(): CardioExamData {
  return {
    borgRating: '',
    vo2Max: '',
    sixMinWalk: '',
    rockportWalk: '',
    harvardStep: '',
    exercisePrescription: {
      warmups: '20',
      stretching: '5',
      hiit: '',
      aerobics: '',
      strengthTraining: '',
      cooldown: ''
    }
  };
}

export const BORG_SCALE_MAP: Record<string, string> = {
  '6': 'No Exertion',
  '7': 'Extremely Light',
  '8': 'Extremely Light - Very Light',
  '9': 'Very Light',
  '10': 'Very Light - Light',
  '11': 'Light',
  '12': 'Light - Somewhat Hard',
  '13': 'Somewhat Hard',
  '14': 'Somewhat Hard - Hard',
  '15': 'Hard',
  '16': 'Hard - Very Hard',
  '17': 'Very Hard',
  '18': 'Very Hard - Extremely Hard',
  '19': 'Extremely Hard',
  '20': 'Maximal Exertion'
};
