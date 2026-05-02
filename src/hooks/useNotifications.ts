import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

type ApiEnvelope<T> = { success: boolean; data: T; meta?: { total: number; page: number; limit: number } };

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications(params?: { patientId?: string; limit?: number }) {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<AppNotification[]>>(
        ENDPOINTS.NOTIFICATIONS.LIST,
        { params }
      );
      return data.data;
    },
  });
}

export function useUnreadNotificationCount(params?: { patientId?: string }) {
  return useQuery<number>({
    queryKey: ['notifications', 'unread-count', params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<{ count: number }>>(
        ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
        { params }
      );
      return data.data.count;
    },
    refetchInterval: 60_000, // Poll every minute
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
