import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

type ApiEnvelope<T> = { success: boolean; data: T };

export interface UserProfile {
  id: string;
  displayId: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  specialization?: string;
  experience?: string;
  createdAt?: string;
}

/** Fetch authenticated user's profile from GET /api/users/me */
export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<UserProfile>>(
        ENDPOINTS.USERS.ME
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/** Update the authenticated user's own profile (name, email) */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name?: string; email?: string }) => {
      const { data } = await api.patch<ApiEnvelope<UserProfile>>(
        ENDPOINTS.USERS.UPDATE_ME,
        payload
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile', 'me'], updated);
    },
  });
}
