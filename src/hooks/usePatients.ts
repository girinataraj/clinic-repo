import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { Patient, PatientsListResponse } from '../types';

export interface PatientsFilter {
  status?: string;
  priority?: string;
  search?: string;
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
    refetchInterval: poll ? 10_000 : false,  // 10s polling for live queue
  });
}

/** Fetch a single patient by ID. */
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
