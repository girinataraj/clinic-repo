import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { AppointmentsListResponse } from '../types';

/** Fetch all appointments for a patient sorted by datetime ascending. */
export function usePatientAppointments(patientId: string | null | undefined) {
  return useQuery<AppointmentsListResponse>({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async () => {
      const { data } = await api.get<AppointmentsListResponse>(
        ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId!)
      );
      return data;
    },
    enabled: Boolean(patientId),
  });
}
