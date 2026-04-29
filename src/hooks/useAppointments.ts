import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { AppointmentsListResponse } from '../types';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: '1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rajesh Kumar',
    datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'completed',
    reason: 'Initial Consultation',
  },
  {
    id: 'apt-2',
    patientId: '1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rajesh Kumar',
    datetime: new Date().toISOString(), // today
    status: 'completed',
    reason: 'Follow up',
  },
];

/** Fetch all appointments for a patient sorted by datetime ascending. */
export function usePatientAppointments(patientId: string | null | undefined) {
  return useQuery<AppointmentsListResponse>({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async () => {
      // MOCK DATA
      return {
        data: MOCK_APPOINTMENTS.map(a => ({ ...a, patientId: patientId! })),
        total: MOCK_APPOINTMENTS.length,
      };

      // REAL API
      // const { data } = await api.get<AppointmentsListResponse>(
      //   ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId!)
      // );
      // return data;
    },
    enabled: Boolean(patientId),
  });
}
