import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import { WebLayout } from './components/WebLayout';
import { RoleGuard } from './components/RoleGuard';
import { LoginScreen } from './screens/LoginScreen';
import { PatientDashboard } from './screens/PatientDashboard';
import { PatientProfile } from './screens/PatientProfile';
import { PatientRecords } from './screens/PatientRecords';
import { AppointmentBooking } from './screens/AppointmentBooking';
import { TherapistAssessmentForm } from './screens/assessment/TherapistAssessmentForm';
import { DoctorAssessmentForm } from './screens/assessment/DoctorAssessmentForm';
import { NurseDashboard } from './screens/NurseDashboard';
import { NursePatients } from './screens/NursePatients';
import { NurseProfile } from './screens/NurseProfile';
import { DoctorDashboard } from './screens/DoctorDashboard';
import { DoctorPatients } from './screens/DoctorPatients';
import { DoctorProfile } from './screens/DoctorProfile';
import { DoctorRevenue } from './screens/DoctorRevenue';
import { PatientDetailPage } from './screens/PatientDetailPage';
import { ExercisePrescription } from './screens/ExercisePrescription';
import { ExerciseLibrary } from './screens/ExerciseLibrary';
import { ReportGeneration } from './screens/ReportGeneration';
import { TreatmentDetailPage } from '../features/patients/pages/TreatmentDetailPage';
import { SessionPage } from './screens/SessionPage';
import { PatientHistorySearch } from './screens/PatientHistorySearch';

import { PatientForm } from './screens/PatientForm';
import { TherapistHierarchy } from './screens/TherapistHierarchy';
import { TherapistDetailPage } from './screens/TherapistDetailPage';
import { DailyReportPage } from './screens/DailyReportPage';
import { ManageStaff } from './screens/ManageStaff';

// ── Session Loader: waits for auth initialization before routing ─────────────
function SessionLoader({ children }: { children: React.ReactNode }) {
  const { isInitializing } = useAuth();
  
  // While checking session, show a simple spinner
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // ── Public routes ─────────────────────────────────────────────────
      { index: true, Component: LoginScreen },
      { path: 'login', Component: LoginScreen },

      // ── Authenticated routes — wrapped with WebLayout (sidebar) ──────
      {
        Component: WebLayout,
        children: [
          // Patient routes — role: patient
          {
            element: <RoleGuard allowed={['patient']} />,
            children: [
              { path: 'patient', Component: PatientDashboard },
              { path: 'patient/appointment', Component: AppointmentBooking },
              { path: 'patient/exercise', Component: ExercisePrescription },
              { path: 'patient/records', Component: PatientRecords },
              { path: 'patient/profile', Component: PatientProfile },

            ],
          },

          // Nurse routes — role: nurse
          {
            element: <RoleGuard allowed={['nurse']} />,
            children: [
              { path: 'nurse', Component: NurseDashboard },
              { path: 'nurse/intake', Component: TherapistAssessmentForm },
              { path: 'nurse/patients', Component: NursePatients },
              { path: 'nurse/patient-form', Component: PatientForm },
              { path: 'nurse/patient/:id', Component: PatientDetailPage },
              { path: 'nurse/patient/:patientId/exercise', Component: ExercisePrescription },
              { path: 'nurse/session/:patientId', Component: SessionPage },
              { path: 'nurse/exercise', Component: ExercisePrescription },
              { path: 'nurse/exercise-library', Component: ExerciseLibrary },
              { path: 'nurse/report', Component: ReportGeneration },
              { path: 'nurse/patient-history', Component: PatientHistorySearch },
              { path: 'nurse/profile', Component: NurseProfile },

              { path: 'nurse/patient/:patientId/treatment', Component: TreatmentDetailPage },
            ],
          },

          // Doctor routes — role: doctor
          {
            element: <RoleGuard allowed={['doctor', 'admin']} />,
            children: [
              { path: 'doctor', Component: DoctorDashboard },
              { path: 'doctor/patients', Component: DoctorPatients },
              { path: 'doctor/therapists', Component: TherapistHierarchy },
              { path: 'doctor/staff', Component: ManageStaff },
              { path: 'doctor/therapist/:id', Component: TherapistDetailPage },
              { path: 'doctor/patient-form', Component: PatientForm },
              { path: 'doctor/intake', Component: DoctorAssessmentForm },
              { path: 'doctor/patient/:id', Component: PatientDetailPage },
              { path: 'doctor/patient/:patientId/treatment', Component: TreatmentDetailPage },
              { path: 'doctor/patient/:patientId/exercise', Component: ExercisePrescription },
              { path: 'doctor/session/:patientId', Component: SessionPage },
              { path: 'doctor/exercise', Component: ExercisePrescription },
              { path: 'doctor/exercise-library', Component: ExerciseLibrary },
              { path: 'doctor/report', Component: ReportGeneration },
              { path: 'doctor/daily-report', Component: DailyReportPage },
              { path: 'doctor/revenue', Component: DoctorRevenue },
              { path: 'doctor/patient-history', Component: PatientHistorySearch },
              { path: 'doctor/profile', Component: DoctorProfile },

            ],
          },
        ],
      },

// ── Fallback → login (wrapped in SessionLoader) ─────────────────────
      { 
        path: '*', 
        element: (
          <SessionLoader>
            <Navigate to="/login" replace />
          </SessionLoader>
        ) 
      },
    ],
  },
]);
