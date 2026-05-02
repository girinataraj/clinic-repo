import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { Patient, PatientsListResponse } from '../types';

export interface PatientsFilter {
  status?: string;
  priority?: string;
  search?: string;
  bookedOnly?: 'true' | 'false';
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Fetch patients list with optional filters.
 * @param params  Filter/pagination params
 * @param poll    If true, enables 10-second polling (for dashboards)
 */
export function usePatients(params?: PatientsFilter, poll = false) {
  return useQuery<PatientsListResponse>({
    queryKey: ['patients', params],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Patient[]; meta: { total: number; page: number; limit: number } }>(
        ENDPOINTS.PATIENTS.LIST,
        { params }
      );
      return {
        data: data.data,
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
      };
    },
    refetchInterval: poll ? 10_000 : false,
  });
}

/** Fetch a single patient by UUID. */
export function usePatient(id: string | null | undefined) {
  return useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Patient }>(
        ENDPOINTS.PATIENTS.DETAIL(id!)
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

/**
 * Look up a patient by phone number.
 * GET /api/patients/lookup?phone=xxx
 * Returns null when no patient found (404 is handled gracefully).
 */
export function usePatientByPhone(phone: string | null) {
  return useQuery<Patient | null>({
    queryKey: ['patient', 'phone', phone],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: Patient }>(
          ENDPOINTS.PATIENTS.LOOKUP_BY_PHONE,
          { params: { phone } }
        );
        return data.data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: Boolean(phone && phone.trim().length >= 7),
    retry: false,
    staleTime: 0,
  });
}

/** Create a new patient record (nurse/doctor/admin). */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
      phone: string;
      city?: string;
      fileNumber?: string;
      condition?: string;
    }) => {
      const { data } = await api.post<{ success: boolean; data: Patient }>(
        ENDPOINTS.PATIENTS.CREATE,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/** Update an existing patient record (doctor/nurse/admin). */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      age?: number;
      gender?: 'Male' | 'Female' | 'Other';
      phone?: string;
      city?: string;
      fileNumber?: string;
      condition?: string;
      status?: string;
      priority?: string;
    }) => {
      const { data } = await api.patch<{ success: boolean; data: Patient }>(
        ENDPOINTS.PATIENTS.UPDATE(id),
        payload
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.setQueryData(['patient', updated.id], updated);
    },
  });
}
