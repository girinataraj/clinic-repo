import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

export interface PatientExercise {
  id: string;
  patientId: string;
  assessmentId?: string;
  exerciseName: string;
  exercise_name?: string;
  sets: number;
  reps: string;
  frequency: string;
  description?: string;
  bodyPart?: string;
  body_part?: string;
  difficultyLevel?: 'Easy' | 'Moderate' | 'Hard';
  difficulty_level?: 'Easy' | 'Moderate' | 'Hard';
  notes?: string;
  videoUrl?: string;
  video_url?: string;
  images?: string[];
  orderSequence: number;
  order_sequence?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function useExercises(patientId: string | null, assessmentId?: string | null) {
  const queryClient = useQueryClient();

  const queryKey = ['patient-exercises', patientId, assessmentId];

  // List exercises
  const exercisesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (!patientId) return [];
      const res = await api.get(ENDPOINTS.PATIENT_EXERCISES.LIST(patientId, assessmentId || undefined));
      const list = res.data?.data?.exercises ?? res.data?.exercises ?? [];
      return (list as PatientExercise[]).sort((a, b) => (a.orderSequence ?? a.order_sequence ?? 0) - (b.orderSequence ?? b.order_sequence ?? 0));
    },
    enabled: Boolean(patientId),
  });

  // Create exercise
  const createMutation = useMutation({
    mutationFn: async (payload: Partial<PatientExercise>) => {
      if (!patientId) throw new Error('Patient ID is required');
      const res = await api.post(ENDPOINTS.PATIENT_EXERCISES.CREATE(patientId), {
        ...payload,
        assessment_id: assessmentId,
      });
      return res.data?.data?.exercise ?? res.data?.exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update exercise
  const updateMutation = useMutation({
    mutationFn: async ({ exerciseId, payload }: { exerciseId: string; payload: Partial<PatientExercise> }) => {
      if (!patientId) throw new Error('Patient ID is required');
      const res = await api.put(ENDPOINTS.PATIENT_EXERCISES.UPDATE(patientId, exerciseId), payload);
      return res.data?.data?.exercise ?? res.data?.exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete exercise
  const deleteMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!patientId) throw new Error('Patient ID is required');
      await api.delete(ENDPOINTS.PATIENT_EXERCISES.DELETE(patientId, exerciseId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Duplicate exercise
  const duplicateMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!patientId) throw new Error('Patient ID is required');
      const res = await api.post(ENDPOINTS.PATIENT_EXERCISES.DUPLICATE(patientId, exerciseId));
      return res.data?.data?.exercise ?? res.data?.exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Reorder exercises
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order_sequence: number }[]) => {
      if (!patientId) throw new Error('Patient ID is required');
      await api.put(ENDPOINTS.PATIENT_EXERCISES.REORDER(patientId), { exercises: items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    exercises: exercisesQuery.data ?? [],
    isLoading: exercisesQuery.isLoading,
    error: exercisesQuery.error,
    refetch: exercisesQuery.refetch,
    createExercise: createMutation.mutateAsync,
    updateExercise: updateMutation.mutateAsync,
    deleteExercise: deleteMutation.mutateAsync,
    duplicateExercise: duplicateMutation.mutateAsync,
    reorderExercises: reorderMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending,
  };
}
