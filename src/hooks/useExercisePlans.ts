import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';
import type { ExercisePlan, ExercisePlansListResponse } from '../types';

type ApiEnvelope<T> = { success: boolean; data: T; meta?: { total: number } };

/** Fetch all exercise plans for a patient. */
export function useExercisePlans(patientId: string | null | undefined) {
  return useQuery<ExercisePlansListResponse>({
    queryKey: ['exercise-plans', patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<ExercisePlan[]>>(
        ENDPOINTS.PATIENTS.EXERCISE_PLANS(patientId!)
      );
      return {
        data: data.data,
        total: data.meta?.total ?? data.data.length,
      };
    },
    enabled: Boolean(patientId),
  });
}

/** Fetch a single exercise plan with its items. */
export function useExercisePlan(planId: string | null | undefined) {
  return useQuery<ExercisePlan>({
    queryKey: ['exercise-plan', planId],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<ExercisePlan>>(
        ENDPOINTS.EXERCISE_PLANS.DETAIL(planId!)
      );
      return data.data;
    },
    enabled: Boolean(planId),
  });
}

/** Create a new exercise plan for a patient. */
export function useCreateExercisePlan(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; notes?: string; items?: unknown[] }) => {
      const { data } = await api.post<ApiEnvelope<ExercisePlan>>(
        ENDPOINTS.PATIENTS.EXERCISE_PLANS(patientId),
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-plans', patientId] });
    },
  });
}

/** Update an existing exercise plan. */
export function useUpdateExercisePlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<ExercisePlan>) => {
      const { data } = await api.put<ApiEnvelope<ExercisePlan>>(
        ENDPOINTS.EXERCISE_PLANS.UPDATE(planId),
        payload
      );
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['exercise-plan', planId], updated);
      queryClient.invalidateQueries({ queryKey: ['exercise-plans', updated.patientId] });
    },
  });
}

/** Delete an exercise plan. */
export function useDeleteExercisePlan(planId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(ENDPOINTS.EXERCISE_PLANS.DELETE(planId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-plans', patientId] });
    },
  });
}
