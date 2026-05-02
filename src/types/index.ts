// ─── User & Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'doctor' | 'nurse' | 'patient' | 'admin';

export interface AuthUser {
  id: string;
  displayId: string;
  role: UserRole;
  name: string;
  email: string;
  patient_id?: string;
}

// ─── Patient ───────────────────────────────────────────────────────────────────
export type PatientStatus = 'waiting' | 'in-session' | 'completed';
export type PatientPriority = 'high' | 'medium' | 'low';

export interface Patient {
  id: string;
  displayId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  city?: string;
  fileNumber?: string;
  condition?: string;
  status: PatientStatus;
  priority: PatientPriority;
  therapistId?: string;
  therapistName?: string;
  createdAt: string;
}

export interface PatientsListResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
}

// ─── Evaluation / Intake ───────────────────────────────────────────────────────
export interface EvaluationCreatedBy {
  id: string;
  name: string;
  role: UserRole;
}

export interface EvaluationVitals {
  bp?: string;
  pr?: number;
  spo2?: number;
  temperature?: number;
  ef?: number;
  painLevel?: number;
}

export interface Evaluation {
  id: string;
  displayId: string;
  patientId: string;
  status: 'draft' | 'submitted' | 'reviewed';
  // Vitals (flat on the evaluation record)
  bp?: string;
  pr?: number;
  spo2?: number;
  temperature?: number;
  ef?: number;
  painLevel?: number;
  functionalScores?: Record<string, unknown>;
  // Clinical text
  diagnosis?: string;
  plan?: string;
  management?: string;
  chiefComplaints?: string;
  associatedSymptoms?: string[];
  medicalHistory?: string[];
  referredBy?: string;
  paymentMode?: string;
  billAmount?: number;
  // Meta
  createdBy: EvaluationCreatedBy;
  updatedBy?: EvaluationCreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationsListResponse {
  data: Evaluation[];
  total: number;
}

export interface UpdateEvaluationPayload {
  diagnosis?: string;
  plan?: string;
  management?: string;
  bp?: string;
  pr?: number;
  spo2?: number;
  temperature?: number;
  ef?: number;
  painLevel?: number;
  chiefComplaints?: string;
  associatedSymptoms?: string[];
  medicalHistory?: string[];
  referredBy?: string;
}

export interface CreateEvaluationPayload {
  patientId: string;
  vitals?: {
    bp?: string;
    pr?: number;
    spo2?: number;
    temperature?: number;
    ef?: number;
  };
  painLevel?: number;
  diagnosis?: string;
  plan?: string;
  management?: string;
  chiefComplaints?: string;
  associatedSymptoms?: string[];
  medicalHistory?: string[];
  referredBy?: string;
  status?: 'draft' | 'submitted';
  paymentMode?: string;
  billAmount?: number;
}

// ─── Appointment ───────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  datetime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt?: string;
}

export interface AppointmentsListResponse {
  data: Appointment[];
  total: number;
}

// ─── Exercise Plans ────────────────────────────────────────────────────────────
export interface ExerciseItem {
  id: string;
  planId: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: string;
  instructions?: string;
  category?: string;
  difficulty?: string;
  orderIndex: number;
}

export interface ExercisePlan {
  id: string;
  patientId: string;
  createdBy: string;
  title: string;
  notes?: string;
  status: string;
  items?: ExerciseItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ExercisePlansListResponse {
  data: ExercisePlan[];
  total: number;
}

// ─── Payment Visit (future — schema exists, no API yet) ───────────────────────
export interface PaymentVisit {
  visitNo: number;
  visitDate: string;
  totalAmount: number;
  discount: number;
  paidAmount: number;
  mode: string;
  entryBy: string;
  remarks?: string;
  paidAt: string;
}

// ─── Package Details (future — schema exists, no API yet) ─────────────────────
export interface PackageDetails {
  serviceType: string;
  totalVisits: number | null;
  visited: number;
  remainingVisits: number | null;
  perSessionCharge: number | null;
  packageValidUpto: string | null;
}

// ─── Payment Details (future — schema exists, no API yet) ─────────────────────
export interface PaymentDetails {
  totalAmount: number;
  discount: number;
  paid: number;
  remainingAmount: number;
  visits: PaymentVisit[];
}
