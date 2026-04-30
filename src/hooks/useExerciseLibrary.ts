  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExerciseTemplate {
  id: string;
  createdBy: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sets: number | null;
  reps: number | null;
  duration: string | null;
  instructions: string | null;
  videoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientExerciseAssignment {
  id: string;
  patientId: string;
  templateId: string;
  assignedBy: string;
  notes: string | null;
  orderIndex: number;
  isActive: boolean;
  assignedAt: string;
  // Joined from template
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sets: number | null;
  reps: number | null;
  duration: string | null;
  instructions: string | null;
  videoUrl: string | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: { total: number };
}

// ── Master Exercise Library ───────────────────────────────────────────────────

/** List all active exercise templates (master library). */
export function useExerciseTemplates(filters?: { search?: string; category?: string; difficulty?: string }) {
  return useQuery<ExerciseTemplate[]>({
    queryKey: ['exerciseTemplates', filters],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<ExerciseTemplate[]>>(
        ENDPOINTS.EXERCISE_LIBRARY.LIST,
        { params: filters }
      );
      return data.data;
    },
    staleTime: 30_000,
  });
}

/** Create a new exercise template (doctor only). */
export function useCreateExerciseTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      category: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      sets?: number;
      reps?: number;
      duration?: string;
      instructions?: string;
      videoUrl?: string;
    }) => {
      const { data } = await api.post<ApiEnvelope<ExerciseTemplate>>(
        ENDPOINTS.EXERCISE_LIBRARY.CREATE,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseTemplates'] });
    },
  });
}

/** Update an existing exercise template (doctor only). */
export function useUpdateExerciseTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ExerciseTemplate>) => {
      const { data } = await api.put<ApiEnvelope<ExerciseTemplate>>(
        ENDPOINTS.EXERCISE_LIBRARY.UPDATE(id),
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseTemplates'] });
    },
  });
}

/** Soft-delete an exercise template (doctor only). */
export function useDeleteExerciseTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(ENDPOINTS.EXERCISE_LIBRARY.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseTemplates'] });
    },
  });
}

// ── Patient Exercise Assignments ──────────────────────────────────────────────

/** Get all exercises assigned to a specific patient. */
export function usePatientAssignments(patientId: string | null | undefined) {
  return useQuery<PatientExerciseAssignment[]>({
    queryKey: ['patientAssignments', patientId],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<PatientExerciseAssignment[]>>(
        ENDPOINTS.EXERCISE_LIBRARY.PATIENT_ASSIGNMENTS(patientId!)
      );
      return data.data;
    },
    enabled: Boolean(patientId),
    staleTime: 15_000,
  });
}

/** Assign one or more templates to a patient (upserts — safe to call repeatedly). */
export function useAssignExercisesToPatient(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { templateIds: string[]; notes?: string }) => {
      const { data } = await api.post<ApiEnvelope<PatientExerciseAssignment[]>>(
        ENDPOINTS.EXERCISE_LIBRARY.PATIENT_ASSIGNMENTS(patientId),
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAssignments', patientId] });
    },
  });
}

/** Remove a single template assignment from a patient. */
export function useRemoveExerciseAssignment(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      await api.delete(ENDPOINTS.EXERCISE_LIBRARY.REMOVE_ASSIGNMENT(patientId, templateId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAssignments', patientId] });
    },
  });
}
