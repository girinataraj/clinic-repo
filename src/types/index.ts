// ─── User & Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'doctor' | 'nurse' | 'patient' | 'admin';

export interface AuthUser {
  id: string;
  displayId: string;
  role: UserRole;
  name: string;
  email: string;
}

// ─── Patient ───────────────────────────────────────────────────────────────────
export type PatientStatus = 'waiting' | 'in-session' | 'completed';
export type PatientPriority = 'high' | 'medium' | 'low';

export interface Patient {
  id: string;
  displayId: string; // SAAI-2026-001
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  city?: string;
  fileNumber?: string;
  condition?: string;
  status: PatientStatus;
  priority: PatientPriority;
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
  bp: string;
  pr: number;
  spo2: number;
  temperature: number;
  ef?: number;
}

export interface Evaluation {
  id: string;
  displayId: string; // EVAL-2026-001
  patientId: string;
  status: 'draft' | 'submitted' | 'reviewed';
  vitals?: EvaluationVitals;
  diagnosis?: string;
  plan?: string;        // maps to "Treatment Detail"
  management?: string;  // maps to "Remarks"
  chiefComplaints?: string;
  associatedSymptoms?: string[];
  referredBy?: string;
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
  datetime: string; // ISO 8601
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface AppointmentsListResponse {
  data: Appointment[];
  total: number;
}

// ─── Payment Visit (future) ────────────────────────────────────────────────────
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

// ─── Package Details (future) ─────────────────────────────────────────────────
export interface PackageDetails {
  serviceType: string;
  totalVisits: number | null;
  visited: number;
  remainingVisits: number | null;
  perSessionCharge: number | null;
  packageValidUpto: string | null;
}

// ─── Payment Details (future) ─────────────────────────────────────────────────
export interface PaymentDetails {
  totalAmount: number;
  discount: number;
  paid: number;
  remainingAmount: number;
  visits: PaymentVisit[];
}
