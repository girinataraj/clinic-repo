import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type {
  Evaluation,
  EvaluationsListResponse,
  UpdateEvaluationPayload,
} from '../types';

const MOCK_EVALUATION: Evaluation = {
  id: 'eval-1',
  displayId: 'EVAL-2026-001',
  patientId: '1',
  status: 'reviewed',
  diagnosis: 'Lumbar Spondylosis',
  plan: 'IFC, Core Strengthening',
  management: 'Weekly follow up',
  referredBy: 'Dr. John Doe',
  createdBy: { id: 'nurse-1', name: 'Kavya Reddy', role: 'nurse' },
  updatedBy: { id: 'doctor-1', name: 'Dr. Rajesh Kumar', role: 'doctor' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Fetch the most-recent evaluation for a given patient. */
export function useLatestEvaluation(patientId: string | null | undefined) {
  return useQuery<Evaluation | null>({
    queryKey: ['evaluations', 'latest', patientId],
    queryFn: async () => {
      // MOCK DATA
      return { ...MOCK_EVALUATION, patientId: patientId! };
      
      // REAL API
      // const { data } = await api.get<EvaluationsListResponse>(
      //   ENDPOINTS.EVALUATIONS.LATEST_BY_PATIENT(patientId!)
      // );
      // return data.data[0] ?? null;
    },
    enabled: Boolean(patientId),
  });
}

/** Fetch a single evaluation by its own ID. */
export function useEvaluation(id: string | null | undefined) {
  return useQuery<Evaluation>({
    queryKey: ['evaluation', id],
    queryFn: async () => {
      // MOCK DATA
      return MOCK_EVALUATION;

      // REAL API
      // const { data } = await api.get<Evaluation>(ENDPOINTS.EVALUATIONS.DETAIL(id!));
      // return data;
    },
    enabled: Boolean(id),
  });
}

/** Patch an evaluation (only editable fields: diagnosis, plan, management). */
export function useUpdateEvaluation(evaluationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEvaluationPayload) => {
      // MOCK DATA
      return { ...MOCK_EVALUATION, ...payload };

      // REAL API
      // const { data } = await api.put<Evaluation>(
      //   ENDPOINTS.EVALUATIONS.UPDATE(evaluationId),
      //   payload
      // );
      // return data;
    },
    onSuccess: (updated) => {
      // Keep cache consistent
      queryClient.setQueryData(['evaluation', evaluationId], updated);
      queryClient.invalidateQueries({
        queryKey: ['evaluations', 'latest', updated.patientId],
      });
    },
  });
}
