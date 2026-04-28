import { createBrowserRouter } from 'react-router';
import { WebLayout } from './components/WebLayout';
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
import { PatientDetailPage } from './screens/PatientDetailPage';
import { ExercisePrescription } from './screens/ExercisePrescription';
import { ReportGeneration } from './screens/ReportGeneration';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // Public routes — no sidebar
      { index: true, Component: LoginScreen },
      { path: 'login', Component: LoginScreen },

      // Authenticated routes — wrapped with WebLayout (sidebar)
      {
        Component: WebLayout,
        children: [
          // Patient routes
          { path: 'patient', Component: PatientDashboard },
          { path: 'patient/appointment', Component: AppointmentBooking },
          { path: 'patient/exercise', Component: ExercisePrescription },
          { path: 'patient/records', Component: PatientRecords },
          { path: 'patient/profile', Component: PatientProfile },

          // Nurse routes
          { path: 'nurse', Component: NurseDashboard },
          { path: 'nurse/intake', Component: NurseIntakeForm },
          { path: 'nurse/patients', Component: NursePatients },
          { path: 'nurse/profile', Component: NurseProfile },

          // Doctor routes
          { path: 'doctor', Component: DoctorDashboard },
          { path: 'doctor/patients', Component: DoctorPatients },
          { path: 'doctor/patient/:id', Component: PatientDetailPage },
          { path: 'doctor/exercise', Component: ExercisePrescription },
          { path: 'doctor/report', Component: ReportGeneration },
          { path: 'doctor/profile', Component: DoctorProfile },
        ],
      },

      // Fallback
      { path: '*', Component: LoginScreen },
    ],
  },
]);
