import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { UserRole } from '../types';

type ApiEnvelope<T> = { success: boolean; data: T; meta?: { total: number; page: number; limit: number } };

export interface StaffUser {
  id: string;
  displayId: string;
  role: Extract<UserRole, 'doctor' | 'nurse'>;
  name: string;
}

export function useStaffUsers(params?: { role?: 'doctor' | 'nurse'; search?: string }) {
  return useQuery<StaffUser[]>({
    queryKey: ['staff-users', params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<StaffUser[]>>(
        ENDPOINTS.USERS.STAFF,
        { params }
      );
      return data.data;
    },
  });
}
