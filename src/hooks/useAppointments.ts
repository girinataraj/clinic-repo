import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { Appointment, AppointmentsListResponse } from '../types';

type ApiEnvelope<T> = { success: boolean; data: T; meta?: { total: number; page: number; limit: number } };

interface AppointmentsFilter {
  patientId?: string;
  doctorId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/** Fetch appointments with optional filters. */
export function useAppointments(params?: AppointmentsFilter) {
  return useQuery<AppointmentsListResponse>({
    queryKey: ['appointments', params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Appointment[]>>(
        ENDPOINTS.APPOINTMENTS.LIST,
        { params }
      );
      return {
        data: data.data,
        total: data.meta?.total ?? data.data.length,
      };
    },
  });
}

/** Fetch all appointments for a specific patient, sorted by datetime ascending. */
export function usePatientAppointments(patientId: string | null | undefined) {
  return useQuery<AppointmentsListResponse>({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Appointment[]>>(
        ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId!)
      );
      return {
        data: data.data,
        total: data.meta?.total ?? data.data.length,
      };
    },
    enabled: Boolean(patientId),
  });
}

/** Create a new appointment. */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      patientId: string;
      doctorId?: string;
      datetime: string;
      reason?: string;
      notes?: string;
    }) => {
      const { data } = await api.post<ApiEnvelope<Appointment>>(
        ENDPOINTS.APPOINTMENTS.CREATE,
        payload
      );
      return data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient', created.patientId] });
    },
  });
}

/** Update an existing appointment (status, datetime, notes). */
export function useUpdateAppointment(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Pick<Appointment, 'status' | 'datetime' | 'notes'>>) => {
      const { data } = await api.patch<ApiEnvelope<Appointment>>(
        ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId),
        payload
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['appointment', appointmentId], updated);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient', updated.patientId] });
    },
  });
}
