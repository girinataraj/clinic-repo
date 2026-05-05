import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import { useExercisePlans } from '../../hooks/useExercisePlans';
import {
  useExerciseTemplates,
  usePatientAssignments,
  useAssignExercisesToPatient,
  useRemoveExerciseAssignment,
} from '../../hooks/useExerciseLibrary';
import { usePatients, usePatient } from '../../hooks/usePatients';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import type { ExerciseItem } from '../../types';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Info,
  Loader2,
  Repeat,
  Save,
  Search,
  User,
} from 'lucide-react';

const difficulties = ['Easy', 'Medium', 'Hard'] as const;

const difficultyColors = {
  Easy: { bg: 'bg-slate-100 dark:bg-slate-800', color: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  Medium: { bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50' },
  Hard: { bg: 'bg-rose-50 dark:bg-rose-900/30', color: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/50' },
};

const categoryColors: Record<string, { bg: string, color: string }> = {
  Strengthening: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' },
  Flexibility: { bg: 'bg-teal-50 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' },
  Balance: { bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
  Core: { bg: 'bg-rose-50 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' },
  Cardio: { bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
};

interface LocalExercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  duration: string;
  instructions: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function ExercisePrescription() {
  const location = useLocation();
  const isPatientView = location.pathname.startsWith('/patient');

  return isPatientView ? <PatientExercisePlanView /> : <DoctorExerciseAssignments />;
}

function PatientExercisePlanView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientId = user?.patient_id ?? null;

  const { data: plansData, isLoading } = useExercisePlans(patientId ?? null);
  const plans = plansData?.data ?? [];
  const activePlan = plans[0];

  const backendExercises: LocalExercise[] = (activePlan?.items ?? []).map((item: ExerciseItem) => ({
    id: item.id,
    name: item.name,
    sets: String(item.sets ?? ''),
    reps: String(item.reps ?? ''),
    duration: item.duration ?? '',
    instructions: item.instructions ?? '',
    category: item.category ?? 'Strengthening',
    difficulty: (item.difficulty as 'Easy' | 'Medium' | 'Hard') ?? 'Easy',
  }));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const exercises = backendExercises;

  return (
    <div className="flex flex-col h-full font-sans bg-[#E8E9F1] dark:bg-slate-950">
      <div className="px-6 pb-6 pt-8 shrink-0 rounded-b-3xl relative overflow-hidden bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none">
        <div className="absolute -right-16 -top-16 rounded-full opacity-10 bg-white w-[200px] h-[200px]" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-10 h-10 bg-white/15"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-[18px] font-bold text-white">Exercise Prescription</h1>
            <p className="text-[13px] text-white/80">
              {activePlan ? activePlan.title : 'No active plan'}
            </p>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex gap-3 relative z-10">
          {[
            { label: 'Exercises', value: exercises.length },
            { label: 'Sets Total', value: exercises.reduce((a, e) => a + parseInt(e.sets || '0'), 0) },
            { label: 'Plans', value: plans.length },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-3 rounded-2xl backdrop-blur-sm bg-white/15 border border-white/20">
              <p className="text-[20px] font-extrabold text-white">{isLoading ? '…' : s.value}</p>
              <p className="text-[12px] text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-4xl mx-auto w-full">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8E9F1] dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded bg-[#E8E9F1] dark:bg-slate-700 w-[60%]" />
                    <div className="h-3 rounded bg-[#E8E9F1] dark:bg-slate-700 w-[40%]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && exercises.length === 0 && (
          <div className="rounded-2xl p-8 text-center bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700">
            <Dumbbell size={40} className="mx-auto mb-3 text-[#E8E9F1] dark:text-slate-600" />
            <p className="text-[16px] font-bold text-[#17252A] dark:text-white">No exercises yet</p>
            <p className="text-[13px] text-[#262842] dark:text-slate-400 mt-1">
              Your doctor will prescribe exercises for you.
            </p>
          </div>
        )}

        {!isLoading && exercises.length > 0 && (
          <div className="flex flex-col gap-4">
            {exercises.map((exercise) => {
              const isExpanded = expandedId === exercise.id;
              const diffColors = difficultyColors[exercise.difficulty] ?? difficultyColors.Easy;
              const catColor = categoryColors[exercise.category] || categoryColors.Strengthening;
              return (
                <div key={exercise.id} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`flex items-center justify-center rounded-2xl shrink-0 w-12 h-12 ${catColor.bg}`}>
                      <Dumbbell size={20} className={catColor.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[15px] font-bold text-[#17252A] dark:text-white">{exercise.name}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColors.bg} ${diffColors.color} ${diffColors.border}`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {exercise.sets && exercise.reps && (
                          <div className="flex items-center gap-1.5">
                            <Repeat size={12} className="text-[#262842] dark:text-slate-400" />
                            <span className="text-[12px] font-semibold text-[#262842] dark:text-slate-300">{exercise.sets} × {exercise.reps} reps</span>
                          </div>
                        )}
                        {exercise.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[#262842] dark:text-slate-400" />
                            <span className="text-[12px] text-[#262842] dark:text-slate-300">{exercise.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : exercise.id)} className="flex items-center justify-center rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 w-9 h-9 bg-[#E8E9F1] dark:bg-slate-800">
                      {isExpanded ? <ChevronUp size={16} className="text-[#262842] dark:text-slate-300" /> : <ChevronDown size={16} className="text-[#262842] dark:text-slate-300" />}
                    </button>
                  </div>

                  {isExpanded && exercise.instructions && (
                    <div className="px-5 pb-5 border-t border-[#E8E9F1] dark:border-slate-700">
                      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-[#E8E9F1] dark:bg-slate-800/50 border border-[#E8E9F1] dark:border-slate-700">
                        <Info size={16} className="text-[#262842] dark:text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[13px] text-[#17252A] dark:text-slate-300 leading-relaxed">{exercise.instructions}</p>
                      </div>
                      <div className="mt-3">
                        <span className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold ${catColor.bg} ${catColor.color}`}>{exercise.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="md:hidden border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}

function DoctorExerciseAssignments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAssign = user?.role === 'nurse' || user?.role === 'doctor'; // Both therapists and doctors can assign exercises
  const rolePrefix = user?.role === 'nurse' ? '/nurse' : '/doctor';
  const { patientId: routePatientId } = useParams<{ patientId?: string }>();
  const [searchParams] = useSearchParams();
  const queryPatientId = searchParams.get('patientId') ?? undefined;
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(routePatientId ?? queryPatientId ?? null);
  const [patientSearch, setPatientSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateDifficulty, setTemplateDifficulty] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    if (routePatientId) {
      setSelectedPatientId(routePatientId);
    }
  }, [routePatientId]);

  useEffect(() => {
    if (!routePatientId && queryPatientId) {
      navigate(`${rolePrefix}/patient/${queryPatientId}/exercise`, { replace: true });
    }
  }, [routePatientId, queryPatientId, navigate, rolePrefix]);

  useEffect(() => {
    setAssignError(null);
  }, [selectedPatientId]);



  const patientFilters = useMemo(
    () => ({
      search: patientSearch.trim() || undefined,
      limit: 10,
    }),
    [patientSearch]
  );

  const templateFilters = useMemo(
    () => ({
      search: templateSearch.trim() || undefined,
      category: templateCategory.trim() || undefined,
      difficulty: templateDifficulty || undefined,
    }),
    [templateSearch, templateCategory, templateDifficulty]
  );

  const {
    data: patientsData,
    isLoading: patientsLoading,
    isError: patientsError,
    error: patientsErrorObj,
  } = usePatients(patientFilters);

  const {
    data: selectedPatient,
    isLoading: selectedPatientLoading,
  } = usePatient(selectedPatientId);

  const {
    data: templates,
    isLoading: templatesLoading,
    isError: templatesError,
    error: templatesErrorObj,
  } = useExerciseTemplates(templateFilters);

  const {
    data: assignments,
    isLoading: assignmentsLoading,
    isError: assignmentsError,
    error: assignmentsErrorObj,
  } = usePatientAssignments(selectedPatientId);

  // Sync selected checkboxes with current assignments whenever they load/change
  useEffect(() => {
    if (assignments) {
      setSelectedTemplateIds(assignments.map((a) => a.templateId));
    } else {
      setSelectedTemplateIds([]);
    }
  }, [assignments]);

  const assignMutation = useAssignExercisesToPatient(selectedPatientId ?? '');
  const removeMutation = useRemoveExerciseAssignment(selectedPatientId ?? '');

  const assignedTemplateIds = useMemo(() => {
    return new Set((assignments ?? []).map((assignment) => assignment.templateId));
  }, [assignments]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    navigate(`${rolePrefix}/patient/${id}/exercise`);
  };

  const toggleTemplate = (id: string, checked: boolean) => {
    setSelectedTemplateIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((value) => value !== id);
    });
  };

  const handleAssign = async () => {
    setAssignError(null);
    if (!selectedPatientId) {
      setAssignError('Select a patient before assigning exercises.');
      return;
    }

    try {
      // Find newly selected templates to assign
      const toAssign = selectedTemplateIds.filter((id) => !assignedTemplateIds.has(id));
      // Find previously assigned templates that were unchecked — need to remove
      const toRemove = [...assignedTemplateIds].filter((id) => !selectedTemplateIds.includes(id));

      if (toAssign.length === 0 && toRemove.length === 0) {
        setAssignError('No changes to save.');
        return;
      }

      // Remove unchecked assignments
      for (const templateId of toRemove) {
        await removeMutation.mutateAsync(templateId);
      }

      // Assign newly checked templates
      if (toAssign.length > 0) {
        await assignMutation.mutateAsync({ templateIds: toAssign });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to save exercise assignments.';
      setAssignError(message);
    }
  };

  const handleRemove = async (templateId: string) => {
    if (!selectedPatientId) return;
    try {
      await removeMutation.mutateAsync(templateId);
    } catch {
      // Errors are reflected by query refreshes.
    }
  };

  const templateList = templates ?? [];
  const patientList = patientsData?.data ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto">
        <div 
          className="px-6 pt-8 pb-8 relative overflow-hidden shrink-0 shadow-md"
          style={{ background: user?.role === 'nurse' ? 'linear-gradient(135deg, #0d2b27, #0f766e)' : 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)', color: 'white' }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-10 h-10 bg-white/10 border border-white/20"
                >
                  <ArrowLeft size={20} className="text-white" />
                </button>
                <div>
                  <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-0.5">
                    {user?.role === 'nurse' ? 'Therapist Station' : 'Doctor Console'}
                  </p>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">Exercise assignments</h1>
                  <p className="text-sm text-white/80 mt-0.5">Select a patient and assign exercises from the library.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                  onClick={() => navigate(user?.role === 'doctor' ? '/doctor/exercise-library' : '/nurse/exercise-library')}
                >
                  {canAssign ? 'Manage library' : 'View library'}
                </Button>
                {canAssign && (
                  <Button 
                    className="bg-white text-slate-900 hover:bg-slate-100"
                    onClick={handleAssign} 
                    disabled={assignMutation.isPending || removeMutation.isPending}
                  >
                    {(assignMutation.isPending || removeMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin text-slate-900" /> : <Save className="h-4 w-4 mr-2" />}
                    Save assignments
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-5">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Select patient</CardTitle>
                  <CardDescription>Choose a patient before assigning exercises.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <Input
                      value={patientSearch}
                      onChange={(event) => setPatientSearch(event.target.value)}
                      placeholder="Search patients"
                      className="pl-9"
                    />
                  </div>

                  {selectedPatientId && (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                      {selectedPatientLoading ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Loading patient details...</div>
                      ) : selectedPatient ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedPatient.name}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPatientId(null);
                                navigate(`${rolePrefix}/exercise`);
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                            {selectedPatient.displayId} · {selectedPatient.phone}
                          </p>
                          {selectedPatient.condition && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{selectedPatient.condition}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Patient not found.</div>
                      )}
                    </div>
                  )}

                  {patientsError && <ApiErrorBanner error={patientsErrorObj} />}

                  {patientsLoading && (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {!patientsLoading && !patientsError && patientList.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      No patients found.
                    </div>
                  )}

                  {!patientsLoading && !patientsError && patientList.length > 0 && (
                    <div className="space-y-2">
                      {patientList.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handleSelectPatient(patient.id)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-left hover:border-slate-300 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{patient.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                {patient.displayId} · {patient.phone}
                              </p>
                            </div>
                            {selectedPatientId === patient.id ? (
                              <Badge variant="secondary">Selected</Badge>
                            ) : (
                              <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Assigned exercises</CardTitle>
                  <CardDescription>Current plan for the selected patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!selectedPatientId && (
                    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      Select a patient to view assignments.
                    </div>
                  )}

                  {selectedPatientId && assignmentsError && (
                    <ApiErrorBanner error={assignmentsErrorObj} />
                  )}

                  {selectedPatientId && assignmentsLoading && (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {selectedPatientId && !assignmentsLoading && !assignmentsError && (assignments ?? []).length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      No assigned exercises yet.
                    </div>
                  )}

                  {selectedPatientId && !assignmentsLoading && !assignmentsError && (assignments ?? []).length > 0 && (
                    <div className="space-y-3">
                      {(assignments ?? []).map((assignment) => (
                        <div key={assignment.id} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{assignment.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                {assignment.category} · {assignment.difficulty}
                              </p>
                              {(assignment.sets || assignment.reps || assignment.duration) && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                  {assignment.sets && assignment.reps
                                    ? `${assignment.sets} sets x ${assignment.reps} reps`
                                    : assignment.duration ?? ''}
                                </p>
                              )}
                            </div>
                            {canAssign && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemove(assignment.templateId)}
                                disabled={removeMutation.isPending}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Exercise templates</CardTitle>
                  <CardDescription>Pick templates and assign them to the patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.6fr_0.5fr]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <Input
                        value={templateSearch}
                        onChange={(event) => setTemplateSearch(event.target.value)}
                        placeholder="Search templates"
                        className="pl-9"
                      />
                    </div>
                    <Input
                      value={templateCategory}
                      onChange={(event) => setTemplateCategory(event.target.value)}
                      placeholder="Category"
                    />
                    <Select value={templateDifficulty} onValueChange={setTemplateDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {templatesError && <ApiErrorBanner error={templatesErrorObj} />}

                  {assignError && (
                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-xs font-semibold text-red-700 dark:text-red-400">
                      {assignError}
                    </div>
                  )}

                  {templatesLoading && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {!templatesLoading && !templatesError && templateList.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      No templates match the current filters.
                    </div>
                  )}

                  {!templatesLoading && !templatesError && templateList.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {templateList.map((template) => {
                        const isAssigned = assignedTemplateIds.has(template.id);
                        const isChecked = selectedTemplateIds.includes(template.id);
                        return (
                          <div
                            key={template.id}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => toggleTemplate(template.id, checked === true)}
                                disabled={!canAssign}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.name}</p>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                  {template.category} · {template.difficulty}
                                </p>
                                {(template.sets || template.reps || template.duration) && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                    {template.sets && template.reps
                                      ? `${template.sets} sets x ${template.reps} reps`
                                      : template.duration ?? ''}
                                  </p>
                                )}
                                {template.instructions && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                    {template.instructions.length > 90
                                      ? `${template.instructions.slice(0, 90)}...`
                                      : template.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role={user?.role === 'nurse' ? 'nurse' : 'doctor'} />
      </div>
    </div>
  );
}
