import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

type ApiEnvelope<T> = { success: boolean; data: T; meta?: { total: number; page: number; limit: number } };

export interface RevenueVisit {
  id: string;
  patientId: string;
  patientName: string;
  therapistId?: string | null;
  therapistName: string;
  amount: number;
  date: string;
  mode: string;
  visitType?: string | null;
}

export function useRevenueVisits(params?: { from?: string; to?: string; limit?: number }) {
  return useQuery<RevenueVisit[]>({
    queryKey: ['revenue-visits', params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<RevenueVisit[]>>(
        ENDPOINTS.REVENUE.LIST,
        { params }
      );
      return data.data;
    },
  });
}
