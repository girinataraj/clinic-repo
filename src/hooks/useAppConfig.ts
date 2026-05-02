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
