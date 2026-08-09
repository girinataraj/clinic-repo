import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import { EvaluationSummaryReport } from '../components/EvaluationSummaryReport';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { usePatient } from '../../hooks/usePatients';
import { useAuth } from '../contexts/AuthContext';
import { useLatestEvaluation } from '../../hooks/useEvaluations';
import { Loader2 } from 'lucide-react';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id ?? null;
  const { user } = useAuth();
  
  const {
    data: patient,
    isLoading: patientLoading,
    isError: patientError,
    error: patientErrorObj,
  } = usePatient(patientId);

  const {
    data: evaluation,
    isLoading: evaluationLoading,
    isError: evaluationError,
    error: evaluationErrorObj,
  } = useLatestEvaluation(patientId);

  const isLoading = patientLoading || evaluationLoading;

  const evaluationData = useMemo(() => {
    if (!evaluation && !patient) return null;
    const baseEval = evaluation || {};
    return {
      ...baseEval,
      patient: {
        name: patient?.name,
        displayId: patient?.displayId || patient?.display_id,
        age: patient?.age,
        gender: patient?.gender,
        phone: patient?.phone,
        condition: patient?.condition,
        status: patient?.status || 'submitted',
      },
      name: patient?.name || baseEval.name,
      phone: patient?.phone || baseEval.phone,
      age: patient?.age || baseEval.age,
      gender: patient?.gender || baseEval.gender,
      displayId: patient?.displayId || patient?.display_id || baseEval.displayId,
    };
  }, [evaluation, patient]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {(patientError || evaluationError) && (
          <div className="max-w-4xl mx-auto mb-4">
            <ApiErrorBanner error={patientError ? patientErrorObj : evaluationErrorObj} />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <Loader2 size={36} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Loading Physiotherapy Assessment Report...</p>
          </div>
        )}

        {!isLoading && evaluationData && (
          <ErrorBoundary fallbackMessage="Could not display assessment report.">
            <EvaluationSummaryReport 
              evaluation={evaluationData} 
              isDoctorRole={user?.role === 'doctor' || user?.role === 'admin'}
              onBack={() => navigate(`/${user?.role || 'doctor'}`)}
            />
          </ErrorBoundary>
        )}
      </div>

      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role={user?.role === 'nurse' ? 'nurse' : 'doctor'} />
      </div>
    </div>
  );
}