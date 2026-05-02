import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type {
  Evaluation,
  EvaluationsListResponse,
  UpdateEvaluationPayload,
  CreateEvaluationPayload,
} from '../types';

type ApiEnvelope<T> = { success: boolean; data: T; meta?: { total: number; page: number; limit: number } };

/** Fetch the most-recent evaluation for a given patient (sorted desc, limit 1). */
export function useLatestEvaluation(patientId: string | null | undefined) {
  return useQuery<Evaluation | null>({
    queryKey: ['evaluations', 'latest', patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Evaluation[]>>(
        ENDPOINTS.EVALUATIONS.LATEST_BY_PATIENT(patientId!)
      );
      return data.data[0] ?? null;
    },
    enabled: Boolean(patientId),
  });
}

/** Fetch all evaluations (filterable by patientId, status). */
export function useEvaluations(params?: { patientId?: string; status?: string; page?: number; limit?: number }) {
  return useQuery<EvaluationsListResponse>({
    queryKey: ['evaluations', params],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Evaluation[]>>(
        ENDPOINTS.EVALUATIONS.LIST,
        { params }
      );
      return {
        data: data.data,
        total: data.meta?.total ?? data.data.length,
      };
    },
    enabled: Boolean(params?.patientId),
  });
}

/** Fetch a single evaluation by its own ID. */
export function useEvaluation(id: string | null | undefined) {
  return useQuery<Evaluation>({
    queryKey: ['evaluation', id],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Evaluation>>(
        ENDPOINTS.EVALUATIONS.DETAIL(id!)
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

/** Create a new evaluation / intake record. */
export function useCreateEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEvaluationPayload) => {
      const { data } = await api.post<ApiEnvelope<Evaluation>>(
        ENDPOINTS.EVALUATIONS.CREATE,
        payload
      );
      return data.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['evaluations', 'latest', created.patientId] });
    },
  });
}

/** Update editable fields of an evaluation (diagnosis, plan, management). */
export function useUpdateEvaluation(evaluationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEvaluationPayload) => {
      const { data } = await api.put<ApiEnvelope<Evaluation>>(
        ENDPOINTS.EVALUATIONS.UPDATE(evaluationId),
        payload
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['evaluation', evaluationId], updated);
      queryClient.invalidateQueries({
        queryKey: ['evaluations', 'latest', updated.patientId],
      });
    },
  });
}
