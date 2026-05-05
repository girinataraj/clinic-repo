import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

export interface DailyReportTherapist {
  therapistId: string;
  therapistName: string;
  evaluationCount: number;
  patientCount: number;
  revenue: number;
}

export interface DailyReportData {
  therapists: DailyReportTherapist[];
  totals: {
    revenue: number;
    patientCount: number;
    evaluationCount: number;
  };
}

/**
 * Fetch server-side aggregated daily report for a given date.
 * @param date  ISO date string (YYYY-MM-DD)
 */
export function useDailyReport(date: string) {
  return useQuery<DailyReportData>({
    queryKey: ['daily-report', date],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: DailyReportData }>(
        ENDPOINTS.REPORTS.DAILY,
        { params: { date } }
      );
      return data.data;
    },
    enabled: Boolean(date),
    staleTime: 30_000, // Fresh for 30 seconds
  });
}
