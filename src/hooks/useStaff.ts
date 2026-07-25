import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const ALLOWED_THERAPIST_NAMES = ['Sathish', 'Rahul', 'Yokesh', 'Dr. Sathish'];

export function useStaffUsers(params?: { role?: 'doctor' | 'nurse'; search?: string }) {
  return useQuery<StaffUser[]>({
    queryKey: ['staff-users', params],
    queryFn: async () => {
      try {
        const { data: therapistRes } = await api.get<{ success: boolean; data: any[] }>('/therapists/list');
        if (therapistRes?.success && Array.isArray(therapistRes.data)) {
          return therapistRes.data.map(t => ({
            id: t.id,
            displayId: t.id.slice(0, 8),
            role: (t.role === 'self' ? 'doctor' : 'nurse') as any,
            name: t.name,
          }));
        }
      } catch {
        // Fallback to staff endpoint
      }

      const { data } = await api.get<ApiEnvelope<StaffUser[]>>(
        ENDPOINTS.USERS.STAFF,
        { params }
      );
      const filtered = (data.data || []).filter(u => 
        ALLOWED_THERAPIST_NAMES.some(allowed => u.name.toLowerCase().includes(allowed.toLowerCase()))
      );

      const getOrderIndex = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('sathish')) return 1;
        if (lower.includes('rahul')) return 2;
        if (lower.includes('yokesh')) return 3;
        return 4;
      };

      return filtered.sort((a, b) => getOrderIndex(a.name) - getOrderIndex(b.name));
    },
  });
}

/** Create a new staff user (therapist). Doctor can only create nurse role. */
export function useCreateStaffUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: 'nurse';
    }) => {
      const { data } = await api.post<ApiEnvelope<StaffUser>>(
        ENDPOINTS.USERS.CREATE,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
    },
  });
}

/** Delete a staff user (therapist/receptionist). */
export function useDeleteStaffUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiEnvelope<any>>(`/staff/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

