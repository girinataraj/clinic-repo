import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

type ApiEnvelope<T> = { success: boolean; data: T };

export interface RoleConfig {
  value: 'patient' | 'nurse' | 'doctor' | 'admin';
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
  bg?: string;
  border?: string;
  gradient?: string;
}

export interface FeatureConfig {
  icon?: string;
  text: string;
  color?: string;
}

export interface FunctionalActivityConfig {
  label: string;
  key: string;
}

export interface AppConfigScopes {
  login: {
    brand?: {
      name?: string;
      subtitle?: string;
      headline?: string;
      description?: string;
      mobileTrustText?: string;
      copyright?: string;
    };
    roles?: RoleConfig[];
    features?: FeatureConfig[];
  };
  appointment: {
    timeSlots?: string[];
    reasons?: string[];
    calendar?: {
      dayLabels?: string[];
      monthNames?: string[];
    };
  };
  intake: {
    symptoms?: string[];
    functionalActivities?: FunctionalActivityConfig[];
    ratingLabels?: string[];
    functionalRatingColors?: string[];
    steps?: { label: string; icon?: string }[];
    painScale?: {
      colors?: string[];
      textColors?: string[];
    };
  };
  clinic: {
    contact?: {
      phone?: string;
      email?: string;
    };
  };
  navigation: {
    [key: string]: unknown;
  };
  clinical: {
    chief_complaints?: string[];
    associated_symptoms?: string[];
    medical_history?: string[];
    diagnoses?: string[];
    complaint_diagnosis_relevance?: Record<string, number[]>;
    clinical_test_map?: any[];
  };
}

export function useAppConfigScope<TScope extends keyof AppConfigScopes>(scope: TScope) {
  return useQuery<AppConfigScopes[TScope]>({
    queryKey: ['app-config', scope],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<AppConfigScopes[TScope]>>(
        ENDPOINTS.CONFIG.SCOPE(scope)
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Helper hook to specifically fetch and parse the clinical configuration.
 * Maps backend keys to frontend camelCase variables.
 */
export function useClinicalConfig() {
  const { data, isLoading, error } = useAppConfigScope('clinical');

  return {
    chiefComplaints: data?.chief_complaints || [],
    associatedSymptoms: data?.associated_symptoms || [],
    medicalHistory: data?.medical_history || [],
    diagnoses: data?.diagnoses || [],
    complaintDiagnosisRelevance: data?.complaint_diagnosis_relevance || {},
    clinicalTestMap: data?.clinical_test_map || [],
    isLoading,
    error,
  };
}
