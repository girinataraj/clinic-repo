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

/**
 * Staff/therapist directory.
 *
 * The backend now scopes this to the caller's own hierarchy: a doctor receives
 * only the therapists they supervise, a therapist only themselves. The list is
 * therefore an authorization-scoped result, not a client-side filter.
 *
 * Two previous behaviours were removed deliberately:
 *   - `params` was ignored on the primary request, so every caller asking for
 *     role='nurse' still received doctors as well, and doctors showed up as
 *     therapist candidates in assignment dropdowns.
 *   - doctor-vs-therapist was inferred from whether the name contained
 *     "sathish", and ordering was hardcoded to three staff names. Role now
 *     comes from the server.
 */
export function useStaffUsers(params?: { role?: 'doctor' | 'nurse'; search?: string }) {
  return useQuery<StaffUser[]>({
    queryKey: ['staff-users', params],
    queryFn: async () => {
      console.log('[THERAPIST_DEBUG] LIST_REFRESH_STARTED', { params });
      // The therapist directory is the scoped source for therapist pickers.
      if (!params?.role || params.role === 'nurse') {
        try {
          const { data: therapistRes } = await api.get<{ success: boolean; data: any[] }>(
            '/therapists/list',
            { params: params?.search ? { search: params.search } : undefined }
          );
          if (therapistRes?.success && Array.isArray(therapistRes.data)) {
            const list = therapistRes.data.map((t) => ({
              id: t.id,
              displayId: t.displayId || t.id.slice(0, 8),
              role: 'nurse' as const,
              name: t.name,
            }));
            console.log('[THERAPIST_DEBUG] LIST_REFRESH_SUCCESS', {
              endpoint: '/therapists/list',
              count: list.length,
              therapists: list.map((t) => ({ id: t.id, name: t.name, displayId: t.displayId })),
            });
            return list;
          }
        } catch (err: any) {
          console.error('[THERAPIST_DEBUG] LIST_REFRESH_ERROR', {
            endpoint: '/therapists/list',
            error: err?.message,
            status: err?.response?.status,
          });
          // Fall through to the staff directory below.
        }
      }

      try {
        const { data } = await api.get<ApiEnvelope<StaffUser[]>>(
          ENDPOINTS.USERS.STAFF,
          { params }
        );
        const list = data.data || [];
        console.log('[THERAPIST_DEBUG] LIST_REFRESH_SUCCESS', {
          endpoint: ENDPOINTS.USERS.STAFF,
          count: list.length,
          therapists: list.map((t) => ({ id: t.id, name: t.name, displayId: t.displayId })),
        });
        return list;
      } catch (err: any) {
        console.error('[THERAPIST_DEBUG] LIST_REFRESH_ERROR', {
          endpoint: ENDPOINTS.USERS.STAFF,
          error: err?.message,
          status: err?.response?.status,
        });
        throw err;
      }
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
      console.log('[THERAPIST_DEBUG] API_REQUEST_START', {
        endpoint: ENDPOINTS.USERS.CREATE,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        password: '[REDACTED]',
      });
      try {
        const { data } = await api.post<ApiEnvelope<StaffUser>>(
          ENDPOINTS.USERS.CREATE,
          payload
        );
        console.log('[THERAPIST_DEBUG] API_REQUEST_SUCCESS', {
          status: 201,
          therapistId: data?.data?.id,
          displayId: data?.data?.displayId,
          role: data?.data?.role,
          name: data?.data?.name,
        });
        return data.data;
      } catch (err: any) {
        console.error('[THERAPIST_DEBUG] API_REQUEST_ERROR', {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        throw err;
      }
    },
    onSuccess: () => {
      console.log('[THERAPIST_DEBUG] INVALIDATING_QUERY staff-users');
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

