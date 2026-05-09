import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

export interface Treatment {
  id: string;
  category: string;
  treatmentName: string;
  charge: number;
}

type ApiEnvelope<T> = { success: boolean; data: T };

export function useTreatments() {
  return useQuery<Treatment[]>({
    queryKey: ['treatments'],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Treatment[]>>(ENDPOINTS.TREATMENTS.LIST);
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // treatments rarely change, cache 10 min
  });
}
