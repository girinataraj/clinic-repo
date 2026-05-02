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
  Easy: { bg: '#DEF2F1', color: '#2B7A78', border: '#DEF2F1' },
  Medium: { bg: '#FEFFFF', color: '#3AAFA9', border: '#DEF2F1' },
  Hard: { bg: '#17252A', color: '#FEFFFF', border: '#17252A' },
};

const categoryColors: Record<string, string> = {
  Strengthening: '#3AAFA9',
  Flexibility: '#2B7A78',
  Balance: '#17252A',
  Core: '#3AAFA9',
  Cardio: '#2B7A78',
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
  const patientId = user?.id ?? null;

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
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      <div
        className="px-6 pb-6 shrink-0 rounded-b-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
          paddingTop: '32px',
          boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
        }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10"
          style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
            style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <div className="text-center">
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}>Exercise Prescription</h1>
            <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)' }}>
              {activePlan ? activePlan.title : 'No active plan'}
            </p>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div className="flex gap-3 relative z-10">
          {[
            { label: 'Exercises', value: exercises.length },
            { label: 'Sets Total', value: exercises.reduce((a, e) => a + parseInt(e.sets || '0'), 0) },
            { label: 'Plans', value: plans.length },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-3 rounded-2xl backdrop-blur-sm"
              style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#FEFFFF' }}>{isLoading ? '…' : s.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.8)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-4xl mx-auto w-full">
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl" style={{ background: '#DEF2F1' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded" style={{ background: '#DEF2F1', width: '60%' }} />
                    <div className="h-3 rounded" style={{ background: '#DEF2F1', width: '40%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && exercises.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
            <Dumbbell size={40} color="#DEF2F1" className="mx-auto mb-3" />
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>No exercises yet</p>
            <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '4px' }}>
              Your doctor will prescribe exercises for you.
            </p>
          </div>
        )}

        {!isLoading && exercises.length > 0 && (
          <div className="flex flex-col gap-4">
            {exercises.map((exercise) => {
              const isExpanded = expandedId === exercise.id;
              const diffColors = difficultyColors[exercise.difficulty] ?? difficultyColors.Easy;
              const catColor = categoryColors[exercise.category] || '#3AAFA9';
              return (
                <div key={exercise.id} className="rounded-2xl overflow-hidden"
                  style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex items-center justify-center rounded-2xl shrink-0"
                      style={{ width: '48px', height: '48px', background: `${catColor}15` }}>
                      <Dumbbell size={20} color={catColor} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>{exercise.name}</p>
                        <span className="px-2 py-0.5 rounded-md" style={{ background: diffColors.bg, color: diffColors.color, fontSize: '10px', fontWeight: 700, border: `1px solid ${diffColors.border}` }}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {exercise.sets && exercise.reps && (
                          <div className="flex items-center gap-1.5">
                            <Repeat size={12} color="#2B7A78" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2B7A78' }}>{exercise.sets} × {exercise.reps} reps</span>
                          </div>
                        )}
                        {exercise.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} color="#2B7A78" />
                            <span style={{ fontSize: '12px', color: '#2B7A78' }}>{exercise.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : exercise.id)} className="flex items-center justify-center rounded-xl transition-colors hover:bg-sky-100" style={{ width: '36px', height: '36px', background: '#DEF2F1' }}>
                      {isExpanded ? <ChevronUp size={16} color="#2B7A78" /> : <ChevronDown size={16} color="#2B7A78" />}
                    </button>
                  </div>

                  {isExpanded && exercise.instructions && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: '#DEF2F1' }}>
                      <div className="mt-4 flex items-start gap-3 p-4 rounded-xl" style={{ background: '#DEF2F1', border: '1px solid #DEF2F1' }}>
                        <Info size={16} color="#2B7A78" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', color: '#17252A', lineHeight: 1.6 }}>{exercise.instructions}</p>
                      </div>
                      <div className="mt-3">
                        <span className="px-3 py-1.5 rounded-lg" style={{ background: `${catColor}15`, color: catColor, fontSize: '12px', fontWeight: 600 }}>{exercise.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="patient" />
      </div>
    </div>
  );
}

function DoctorExerciseAssignments() {
  const navigate = useNavigate();
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
      navigate(`/doctor/patient/${queryPatientId}/exercise`, { replace: true });
    }
  }, [routePatientId, queryPatientId, navigate]);

  useEffect(() => {
    setSelectedTemplateIds([]);
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

  const assignMutation = useAssignExercisesToPatient(selectedPatientId ?? '');
  const removeMutation = useRemoveExerciseAssignment(selectedPatientId ?? '');

  const assignedTemplateIds = useMemo(() => {
    return new Set((assignments ?? []).map((assignment) => assignment.templateId));
  }, [assignments]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    navigate(`/doctor/patient/${id}/exercise`);
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
    if (selectedTemplateIds.length === 0) {
      setAssignError('Select at least one exercise template.');
      return;
    }

    try {
      await assignMutation.mutateAsync({ templateIds: selectedTemplateIds });
      setSelectedTemplateIds([]);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to assign exercises.';
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
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-8 pb-6 border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Exercise assignments</h1>
                  <p className="text-sm text-slate-500">Select a patient and assign exercises from the library.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate('/doctor/exercise-library')}>
                  Manage library
                </Button>
                <Button onClick={handleAssign} disabled={assignMutation.isPending}>
                  {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Assign selected
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-5">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Select patient</CardTitle>
                  <CardDescription>Choose a patient before assigning exercises.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={patientSearch}
                      onChange={(event) => setPatientSearch(event.target.value)}
                      placeholder="Search patients"
                      className="pl-9"
                    />
                  </div>

                  {selectedPatientId && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      {selectedPatientLoading ? (
                        <div className="text-xs text-slate-500">Loading patient details...</div>
                      ) : selectedPatient ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">{selectedPatient.name}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPatientId(null);
                                navigate('/doctor/exercise');
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500">
                            {selectedPatient.displayId} · {selectedPatient.phone}
                          </p>
                          {selectedPatient.condition && (
                            <p className="text-xs text-slate-500">{selectedPatient.condition}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">Patient not found.</div>
                      )}
                    </div>
                  )}

                  {patientsError && <ApiErrorBanner error={patientsErrorObj} />}

                  {patientsLoading && (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {!patientsLoading && !patientsError && patientList.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                              <p className="text-xs text-slate-500">
                                {patient.displayId} · {patient.phone}
                              </p>
                            </div>
                            {selectedPatientId === patient.id ? (
                              <Badge variant="secondary">Selected</Badge>
                            ) : (
                              <User className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Assigned exercises</CardTitle>
                  <CardDescription>Current plan for the selected patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!selectedPatientId && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                      Select a patient to view assignments.
                    </div>
                  )}

                  {selectedPatientId && assignmentsError && (
                    <ApiErrorBanner error={assignmentsErrorObj} />
                  )}

                  {selectedPatientId && assignmentsLoading && (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {selectedPatientId && !assignmentsLoading && !assignmentsError && (assignments ?? []).length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                      No assigned exercises yet.
                    </div>
                  )}

                  {selectedPatientId && !assignmentsLoading && !assignmentsError && (assignments ?? []).length > 0 && (
                    <div className="space-y-3">
                      {(assignments ?? []).map((assignment) => (
                        <div key={assignment.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{assignment.name}</p>
                              <p className="text-xs text-slate-500">
                                {assignment.category} · {assignment.difficulty}
                              </p>
                              {(assignment.sets || assignment.reps || assignment.duration) && (
                                <p className="text-xs text-slate-500">
                                  {assignment.sets && assignment.reps
                                    ? `${assignment.sets} sets x ${assignment.reps} reps`
                                    : assignment.duration ?? ''}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemove(assignment.templateId)}
                              disabled={removeMutation.isPending}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Exercise templates</CardTitle>
                  <CardDescription>Pick templates and assign them to the patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.6fr_0.5fr]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                      {assignError}
                    </div>
                  )}

                  {templatesLoading && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-28 rounded-lg bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {!templatesLoading && !templatesError && templateList.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
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
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => toggleTemplate(template.id, checked === true)}
                                disabled={isAssigned}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                                  {isAssigned && <Badge variant="secondary">Assigned</Badge>}
                                </div>
                                <p className="text-xs text-slate-500">
                                  {template.category} · {template.difficulty}
                                </p>
                                {(template.sets || template.reps || template.duration) && (
                                  <p className="text-xs text-slate-500">
                                    {template.sets && template.reps
                                      ? `${template.sets} sets x ${template.reps} reps`
                                      : template.duration ?? ''}
                                  </p>
                                )}
                                {template.instructions && (
                                  <p className="text-xs text-slate-500">
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

      <div className="md:hidden border-t border-slate-200 bg-white">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}