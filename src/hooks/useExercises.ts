import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

export interface PatientExercise {
  id: string;
  patientId: string;
  patient_id?: string;
  assessmentId?: string;
  assessment_id?: string;
  exerciseLibraryId?: string;
  exercise_library_id?: string;
  exerciseName: string;
  exercise_name?: string;
  category?: string;
  description?: string;
  frequency: string;
  sets: number;
  repetitions?: string;
  reps: string;
  holdTime?: string;
  hold_time?: string;
  duration?: string;
  notes?: string;
  status?: string;
  bodyPart?: string;
  body_part?: string;
  difficultyLevel?: 'Easy' | 'Moderate' | 'Hard';
  difficulty_level?: 'Easy' | 'Moderate' | 'Hard';
  videoUrl?: string;
  video_url?: string;
  images?: string[];
  orderSequence?: number;
  order_sequence?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function useExercises(patientId: string | null, assessmentId?: string | null) {
  const queryClient = useQueryClient();
  const effectivePatientId = patientId || 'draft-session-patient';
  const [localDraftExercises, setLocalDraftExercises] = useState<PatientExercise[]>([]);

  const queryKey = ['patient-exercises', effectivePatientId, assessmentId || null];
  const genericKey = ['patient-exercises', effectivePatientId];

  // List exercises
  const exercisesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const res = await api.get(ENDPOINTS.PATIENT_EXERCISES.LIST(effectivePatientId, assessmentId || undefined));
        const list = res.data?.data?.exercises ?? res.data?.exercises ?? res.data?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          return (list as PatientExercise[]).sort(
            (a, b) => (a.orderSequence ?? a.order_sequence ?? 0) - (b.orderSequence ?? b.order_sequence ?? 0)
          );
        }
      } catch (err) {
        console.warn('API load fallback to local draft exercises:', err);
      }
      return localDraftExercises;
    },
    enabled: true,
  });

  // Create single exercise
  const createMutation = useMutation({
    mutationFn: async (payload: Partial<PatientExercise>) => {
      const newId = `ex-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newExercise: PatientExercise = {
        id: newId,
        patientId: effectivePatientId,
        patient_id: effectivePatientId,
        assessmentId: assessmentId || undefined,
        assessment_id: assessmentId || undefined,
        exerciseName: payload.exercise_name || payload.exerciseName || 'Exercise',
        exercise_name: payload.exercise_name || payload.exerciseName || 'Exercise',
        category: payload.category || payload.body_part || payload.bodyPart || 'General',
        description: payload.description || '',
        frequency: payload.frequency || 'Once daily',
        sets: payload.sets || 3,
        repetitions: payload.repetitions || payload.reps || '10-15',
        reps: payload.reps || payload.repetitions || '10-15',
        holdTime: payload.hold_time || payload.holdTime || '',
        hold_time: payload.hold_time || payload.holdTime || '',
        duration: payload.duration || '',
        notes: payload.notes || '',
        status: payload.status || 'Active',
        bodyPart: payload.body_part || payload.bodyPart || payload.category || 'General',
        body_part: payload.body_part || payload.bodyPart || payload.category || 'General',
        difficultyLevel: payload.difficulty_level || payload.difficultyLevel || 'Moderate',
        difficulty_level: payload.difficulty_level || payload.difficultyLevel || 'Moderate',
        videoUrl: payload.video_url || payload.videoUrl || '',
        video_url: payload.video_url || payload.videoUrl || '',
        images: payload.images || [],
        orderSequence: (exercisesQuery.data?.length || 0) + 1,
        order_sequence: (exercisesQuery.data?.length || 0) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const res = await api.post(ENDPOINTS.PATIENT_EXERCISES.CREATE(effectivePatientId), {
          ...payload,
          assessment_id: assessmentId,
        });
        const serverItem = res.data?.data?.exercise ?? res.data?.exercise ?? res.data?.data;
        if (serverItem) return serverItem;
      } catch (err) {
        console.warn('API save failed, using local state persistence:', err);
      }
      return newExercise;
    },
    onSuccess: (newExercise) => {
      setLocalDraftExercises(prev => [...prev.filter(e => e.id !== newExercise.id), newExercise]);
      queryClient.setQueryData(queryKey, (old: PatientExercise[] | undefined) => {
        const current = old ? [...old] : [];
        return [...current.filter(e => e.id !== newExercise.id), newExercise];
      });
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Batch import exercises
  const importBatchMutation = useMutation({
    mutationFn: async (items: Partial<PatientExercise>[]) => {
      const generatedList: PatientExercise[] = items.map((item, idx) => ({
        id: `ex-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        patientId: effectivePatientId,
        patient_id: effectivePatientId,
        assessmentId: assessmentId || undefined,
        assessment_id: assessmentId || undefined,
        exerciseName: item.exercise_name || item.exerciseName || 'Exercise',
        exercise_name: item.exercise_name || item.exerciseName || 'Exercise',
        category: item.category || item.body_part || item.bodyPart || 'General',
        description: item.description || '',
        frequency: item.frequency || 'Once daily',
        sets: item.sets || 3,
        repetitions: item.repetitions || item.reps || '10-15',
        reps: item.reps || item.repetitions || '10-15',
        holdTime: item.hold_time || item.holdTime || '',
        hold_time: item.hold_time || item.holdTime || '',
        duration: item.duration || '',
        notes: item.notes || '',
        status: item.status || 'Active',
        bodyPart: item.body_part || item.bodyPart || item.category || 'General',
        body_part: item.body_part || item.bodyPart || item.category || 'General',
        difficultyLevel: item.difficulty_level || item.difficultyLevel || 'Moderate',
        difficulty_level: item.difficulty_level || item.difficultyLevel || 'Moderate',
        videoUrl: item.video_url || item.videoUrl || '',
        video_url: item.video_url || item.videoUrl || '',
        images: item.images || [],
        orderSequence: (exercisesQuery.data?.length || 0) + idx + 1,
        order_sequence: (exercisesQuery.data?.length || 0) + idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      try {
        const res = await api.post(ENDPOINTS.PATIENT_EXERCISES.CREATE(effectivePatientId), {
          items: items.map(item => ({ ...item, assessment_id: assessmentId })),
        });
        const serverList = res.data?.data?.exercises ?? res.data?.exercises ?? res.data?.data;
        if (Array.isArray(serverList) && serverList.length > 0) return serverList;
      } catch (err) {
        console.warn('API batch import failed, using local state persistence:', err);
      }
      return generatedList;
    },
    onSuccess: (importedList) => {
      if (Array.isArray(importedList)) {
        setLocalDraftExercises(prev => {
          const current = [...prev];
          const existingIds = new Set(current.map(c => c.id));
          importedList.forEach(item => {
            if (!existingIds.has(item.id)) current.push(item);
          });
          return current;
        });

        queryClient.setQueryData(queryKey, (old: PatientExercise[] | undefined) => {
          const current = old ? [...old] : [];
          const existingIds = new Set(current.map(c => c.id));
          importedList.forEach(item => {
            if (!existingIds.has(item.id)) current.push(item);
          });
          return current;
        });
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update exercise
  const updateMutation = useMutation({
    mutationFn: async ({ exerciseId, payload }: { exerciseId: string; payload: Partial<PatientExercise> }) => {
      try {
        await api.put(ENDPOINTS.PATIENT_EXERCISES.UPDATE(effectivePatientId, exerciseId), payload);
      } catch (err) {
        console.warn('API update failed, updating local state:', err);
      }
      return { exerciseId, payload };
    },
    onSuccess: ({ exerciseId, payload }) => {
      const updateFn = (list: PatientExercise[]) =>
        list.map(ex => (ex.id === exerciseId ? { ...ex, ...payload } : ex));
      setLocalDraftExercises(updateFn);
      queryClient.setQueryData(queryKey, (old: PatientExercise[] | undefined) => updateFn(old || []));
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete exercise
  const deleteMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      try {
        await api.delete(ENDPOINTS.PATIENT_EXERCISES.DELETE(effectivePatientId, exerciseId));
      } catch (err) {
        console.warn('API delete failed, removing from local state:', err);
      }
      return exerciseId;
    },
    onSuccess: (exerciseId) => {
      setLocalDraftExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      queryClient.setQueryData(queryKey, (old: PatientExercise[] | undefined) => (old || []).filter(ex => ex.id !== exerciseId));
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Duplicate exercise
  const duplicateMutation = useMutation({
    mutationFn: async (exerciseId: string) => {
      const target = (exercisesQuery.data || localDraftExercises).find(e => e.id === exerciseId);
      if (target) {
        const copyItem = {
          ...target,
          id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          exerciseName: `${target.exerciseName || target.exercise_name} (Copy)`,
          exercise_name: `${target.exerciseName || target.exercise_name} (Copy)`,
        };
        try {
          const res = await api.post(ENDPOINTS.PATIENT_EXERCISES.DUPLICATE(effectivePatientId, exerciseId));
          const serverCopy = res.data?.data?.exercise ?? res.data?.exercise;
          if (serverCopy) return serverCopy;
        } catch (err) {
          console.warn('API duplicate failed, using local copy:', err);
        }
        return copyItem;
      }
    },
    onSuccess: (copiedExercise) => {
      if (copiedExercise) {
        setLocalDraftExercises(prev => [...prev, copiedExercise]);
        queryClient.setQueryData(queryKey, (old: PatientExercise[] | undefined) => [...(old || []), copiedExercise]);
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  // Reorder exercises
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order_sequence: number }[]) => {
      try {
        await api.put(ENDPOINTS.PATIENT_EXERCISES.REORDER(effectivePatientId), { exercises: items });
      } catch (err) {
        console.warn('API reorder failed:', err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const mergedExercises = exercisesQuery.data && exercisesQuery.data.length > 0
    ? exercisesQuery.data
    : localDraftExercises;

  return {
    exercises: mergedExercises,
    isLoading: exercisesQuery.isLoading && localDraftExercises.length === 0,
    isError: false,
    error: null,
    refetch: exercisesQuery.refetch,

    createExercise: createMutation.mutateAsync,
    importBatchExercises: importBatchMutation.mutateAsync,
    updateExercise: updateMutation.mutateAsync,
    deleteExercise: deleteMutation.mutateAsync,
    duplicateExercise: duplicateMutation.mutateAsync,
    reorderExercises: reorderMutation.mutateAsync,

    isSaving: createMutation.isPending || updateMutation.isPending || importBatchMutation.isPending,
  };
}
