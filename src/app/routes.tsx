import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import { WebLayout } from './components/WebLayout';
import { RoleGuard } from './components/RoleGuard';
import { LoginScreen } from './screens/LoginScreen';
import { PatientDashboard } from './screens/PatientDashboard';
import { PatientProfile } from './screens/PatientProfile';
import { PatientRecords } from './screens/PatientRecords';
import { AppointmentBooking } from './screens/AppointmentBooking';
import { NurseIntakeForm } from './screens/NurseIntakeForm';
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
import { NotificationPage } from './screens/NotificationPage';
import { PatientForm } from './screens/PatientForm';
import { TherapistHierarchy } from './screens/TherapistHierarchy';

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
              { path: 'patient/notifications', Component: NotificationPage },
            ],
          },

          // Nurse routes — role: nurse
          {
            element: <RoleGuard allowed={['nurse']} />,
            children: [
              { path: 'nurse', Component: NurseDashboard },
              { path: 'nurse/intake', Component: NurseIntakeForm },
              { path: 'nurse/patients', Component: NursePatients },
              { path: 'nurse/patient-form', Component: PatientForm },
              { path: 'nurse/profile', Component: NurseProfile },
              { path: 'nurse/notifications', Component: NotificationPage },
              { path: 'nurse/patient/:patientId/treatment', Component: TreatmentDetailPage },
            ],
          },

          // Doctor routes — role: doctor
          {
            element: <RoleGuard allowed={['doctor']} />,
            children: [
              { path: 'doctor', Component: DoctorDashboard },
              { path: 'doctor/patients', Component: DoctorPatients },
              { path: 'doctor/therapists', Component: TherapistHierarchy },
              { path: 'doctor/patient-form', Component: PatientForm },
              { path: 'doctor/intake', Component: NurseIntakeForm },
              { path: 'doctor/patient/:id', Component: PatientDetailPage },
              { path: 'doctor/patient/:patientId/treatment', Component: TreatmentDetailPage },
              { path: 'doctor/patient/:patientId/exercise', Component: ExercisePrescription },
              { path: 'doctor/exercise', Component: ExercisePrescription },
              { path: 'doctor/exercise-library', Component: ExerciseLibrary },
              { path: 'doctor/report', Component: ReportGeneration },
              { path: 'doctor/revenue', Component: DoctorRevenue },
              { path: 'doctor/profile', Component: DoctorProfile },
              { path: 'doctor/notifications', Component: NotificationPage },
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
