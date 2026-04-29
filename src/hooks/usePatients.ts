import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { Patient, PatientsListResponse } from '../types';

interface PatientsFilter {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function usePatients(params?: PatientsFilter) {
  return useQuery<PatientsListResponse>({
    queryKey: ['patients', params],
    queryFn: async () => {
      const { data } = await api.get<PatientsListResponse>(ENDPOINTS.PATIENTS.LIST, {
        params,
      });
      return data;
    },
  });
}

export function usePatient(id: string | null | undefined) {
  return useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get<Patient>(ENDPOINTS.PATIENTS.DETAIL(id!));
      return data;
    },
    enabled: Boolean(id),
  });
}
