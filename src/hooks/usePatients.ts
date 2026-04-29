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

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    displayId: 'SAAI-2026-001',
    name: 'Rahul Verma',
    age: 45,
    gender: 'Male',
    phone: '+91 9876543210',
    city: 'Erode',
    fileNumber: 'FILE-001',
    condition: 'Post-op Knee',
    status: 'waiting',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    displayId: 'SAAI-2026-002',
    name: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    phone: '+91 9876543211',
    city: 'Chennai',
    condition: 'Lower Back Pain',
    status: 'in-session',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
];

export function usePatients(params?: PatientsFilter) {
  return useQuery<PatientsListResponse>({
    queryKey: ['patients', params],
    queryFn: async () => {
      // MOCK DATA
      return {
        data: MOCK_PATIENTS,
        total: MOCK_PATIENTS.length,
        page: 1,
        limit: 10,
      };
      
      // REAL API
      // const { data } = await api.get<PatientsListResponse>(ENDPOINTS.PATIENTS.LIST, { params });
      // return data;
    },
  });
}

export function usePatient(id: string | null | undefined) {
  return useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      // MOCK DATA
      const patient = MOCK_PATIENTS.find(p => p.id === id) || MOCK_PATIENTS[0];
      return patient;

      // REAL API
      // const { data } = await api.get<Patient>(ENDPOINTS.PATIENTS.DETAIL(id!));
      // return data;
    },
    enabled: Boolean(id),
  });
}
