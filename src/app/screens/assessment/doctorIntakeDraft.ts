import type {
  RomData,
  Anthropometrics,
  ClinicalExamData,
  TreatmentPlanData,
  CardioExamData,
} from './clinicalConfig';

export interface DoctorIntakeDraftData {
  step: number;
  phoneInput: string;
  phoneToFetch: string;
  lookupDone: boolean;
  showNewPatientForm: boolean;
  newPatient: { name: string; age: string; gender: 'Male' | 'Female' | 'Other'; referredBy: string; condition: string };
  selectedTherapistId: string;
  resolvedPatientId: string;
  patientInfo: { name: string; age: string; phone: string; gender: 'Male' | 'Female' | 'Other'; address: string; condition: string[]; referredBy?: string };
  vitals: { bp_sys: string; bp_dia: string; pr: string; spo2: string; temp: string; ef: string };
  chiefComplaints: string[];
  complaintsText: string;
  specificProblems: Record<string, any>;
  associatedSymptoms: string[];
  selectedMedicalHistory: string[];
  otherMedicalHistory: string;
  showOtherMedicalHistory: boolean;
  painLevel: number;
  examinationNotes: string;
  diagnosisNotes: string;
  selectedDiagnoses: string[];
  treatmentNotes: string;
  treatmentPlanData: TreatmentPlanData;
  funcRatings: Record<string, number>;
  romData: RomData;
  anthropometrics: Anthropometrics;
  clinicalExamData: ClinicalExamData;
  paymentMode: 'Cash' | 'UPI' | '';
  billAmount: number | null;
  billAmountInput: string;
  isManualBillEdit: boolean;
  visitType: 'Clinic' | 'Home Visit' | 'IP' | 'Day Care';
  neuroData: any;
  cardioData: CardioExamData;
}

/**
 * In-memory-only draft of a single in-progress doctor intake session. Not
 * written to localStorage/Preferences/IndexedDB/filesystem — it lives only in
 * this JS module's memory and is lost on a full app reload, which is
 * intentional: it exists solely to survive a route unmount/remount within the
 * same running app session (e.g. the Android back gesture), not to persist
 * clinical data long-term.
 *
 * The caller (DoctorAssessmentForm) is responsible for choosing a key that
 * uniquely identifies "this specific intake session": the patient's id/phone
 * when known, or React Router's location.key for a fresh walk-in with no
 * patient identity yet — see the comment above the draftKey declaration there
 * for why a fixed key is unsafe.
 *
 * Only one slot is kept: opening intake under a different key simply doesn't
 * match the stored one, so the old draft is never restored, and the next
 * autosave for the new session naturally replaces it.
 */
let slot: { key: string; data: DoctorIntakeDraftData } | null = null;

export function loadDoctorIntakeDraft(key: string): DoctorIntakeDraftData | null {
  return slot && slot.key === key ? slot.data : null;
}

export function saveDoctorIntakeDraft(key: string, data: DoctorIntakeDraftData): void {
  slot = { key, data };
}

export function clearDoctorIntakeDraft(): void {
  slot = null;
}
