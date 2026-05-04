import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import { PatientHistoryUpload } from '../components/PatientHistoryUpload';
import { usePatient } from '../../hooks/usePatients';
import { useLatestEvaluation, useUpdateEvaluation } from '../../hooks/useEvaluations';
import {
  ArrowLeft,
  Edit3,
  FileText,
  Heart,
  Activity,
  CheckSquare,
  Stethoscope,
  StickyNote,
  Dumbbell,
  Save,
  ImagePlus,
} from 'lucide-react';

const funcLabels: Record<number, string> = { 0: 'Normal', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
const funcColors: Record<number, string> = { 0: '#3B3E66', 1: '#3B3E66', 2: '#262842', 3: '#262842', 4: '#17252A' };
const painColors = ['#3B3E66', '#3B3E66', '#3B3E66', '#262842', '#262842', '#262842', '#17252A', '#17252A', '#17252A', '#17252A', '#17252A'];

const tabs = ['Overview', 'Vitals', 'Diagnosis', 'Notes', 'History'];

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id ?? null;
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
  const [activeTab, setActiveTab] = useState('Overview');
  const [editMode, setEditMode] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const updateEvaluation = useUpdateEvaluation(evaluation?.id ?? '');

  const handleSaveDiagnosis = async () => {
    if (!evaluation?.id) return;
    try {
      await updateEvaluation.mutateAsync({ diagnosis });
      setEditMode(false);
    } catch { /* handled by RQ */ }
  };

  const handleSaveNotes = async () => {
    if (!evaluation?.id) return;
    try {
      await updateEvaluation.mutateAsync({ management: notes });
      setEditMode(false);
    } catch { /* handled by RQ */ }
  };

  useEffect(() => {
    if (!editMode) {
      setDiagnosis(evaluation?.diagnosis ?? '');
      setNotes(evaluation?.management ?? '');
    }
  }, [editMode, evaluation?.diagnosis, evaluation?.management]);

  const functionalEntries = useMemo(() => {
    if (!evaluation?.functionalScores) return [] as Array<{ key: string; value: number }>;
    return Object.entries(evaluation.functionalScores)
      .map(([key, value]) => {
        const numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric)) return null;
        return { key, value: numeric };
      })
      .filter((entry): entry is { key: string; value: number } => entry !== null);
  }, [evaluation?.functionalScores]);

  const painLevel = typeof evaluation?.painLevel === 'number' ? evaluation.painLevel : null;
  const symptoms = evaluation?.associatedSymptoms ?? [];
  const complaintText = evaluation?.chiefComplaints ?? '';
  const consultationName = evaluation?.createdBy?.name ?? '';
  const consultationDate = evaluation?.createdAt
    ? new Date(evaluation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const vitalsCards = [
    { icon: '💓', label: 'Blood Pressure', value: evaluation?.bp ?? '-', color: '#3B3E66' },
    { icon: '❤️', label: 'Pulse Rate', value: evaluation?.pr != null ? `${evaluation.pr} bpm` : '-', color: '#262842' },
    { icon: '🫁', label: 'SpO2', value: evaluation?.spo2 != null ? `${evaluation.spo2}%` : '-', color: '#3B3E66' },
    { icon: '🌡️', label: 'Temperature', value: evaluation?.temperature != null ? `${evaluation.temperature}°F` : '-', color: '#262842' },
    { icon: '⚡', label: 'Ejection Fraction', value: evaluation?.ef != null ? `${evaluation.ef}%` : '-', color: '#3B3E66' },
  ];
  const isLoading = patientLoading || evaluationLoading;

  if (!patientId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Invalid patient ID.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full saai-page font-sans bg-[#E8E9F1] dark:bg-slate-950">
      {/* Header */}
      <div
        className="px-6 pb-6 shrink-0 rounded-b-3xl relative overflow-hidden pt-8 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800"
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10 w-[200px] h-[200px] bg-white opacity-10" />
          
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button
            onClick={() => navigate('/doctor')}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-10 h-10 bg-white/15">
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <h1 className="text-[18px] font-bold text-white">Patient Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-10 h-10 ${editMode ? "bg-amber-400/30" : "bg-white/15"}`}>
              <Edit3 size={18} color={editMode ? '#fbbf24' : '#FEFFFF'} />
            </button>
            <button
              onClick={() => navigate(evaluation?.id ? `/doctor/report?evaluationId=${evaluation.id}` : '/doctor/report')}
              className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-10 h-10 bg-white/15">
              <FileText size={18} color="#FEFFFF" />
            </button>
          </div>
        </div>

        {/* Patient card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl relative z-10 backdrop-blur-sm bg-white/15 border border-white/20">
          <div className="rounded-2xl flex items-center justify-center shrink-0 w-14 h-14 bg-white/20 text-[24px]">
            🧑‍🦽
          </div>
          <div className="flex-1">
            <p className="text-[18px] font-bold text-white">{patient?.name ?? 'Patient'}</p>
            <p className="text-[13px] text-white/80 mt-[2px]">
              {patient?.gender ?? '-'}, {patient?.age ?? '-'} yrs · {patient?.phone ?? '-'}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-[#E8E9F1] dark:bg-slate-800 text-[#3B3E66] dark:text-slate-200 text-[11px] font-bold">
                {patient?.displayId ?? '-'}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#3B3E66] dark:bg-teal-600 text-white text-[11px] font-bold">
                Status: {patient?.status ?? '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex shrink-0 px-4 pt-4 pb-0 bg-white dark:bg-slate-900 border-b border-[#E8E9F1] dark:border-slate-800 shadow-[0_2px_8px_rgba(23,37,42,0.02)] dark:shadow-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center transition-all duration-300 text-[13px] font-semibold border-b-2 ${activeTab === tab ? "text-[#3B3E66] dark:text-teal-400 border-[#3B3E66] dark:border-teal-400" : "text-[#262842] dark:text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-4xl mx-auto w-full">
        {(patientError || evaluationError) && (
          <ApiErrorBanner error={patientError ? patientErrorObj : evaluationErrorObj} />
        )}

        {isLoading && (
          <div className="rounded-2xl p-6 text-center bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
            <p className="text-[14px] text-[#262842] dark:text-slate-400">Loading patient details...</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-4">
            {/* Condition */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                  <Stethoscope size={16} color="#3B3E66" />
                </div>
                <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Primary Condition</h3>
              </div>
              <p className="text-[15px] font-semibold text-[#3B3E66] dark:text-slate-200">{patient?.condition ?? '-'}</p>
              <p className="text-[13px] text-[#262842] dark:text-slate-400 mt-1">
                Consultation with {consultationName || '-'} on {consultationDate || '-'}
              </p>
            </div>

            {/* Symptoms */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                  <Activity size={16} color="#3B3E66" />
                </div>
                <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Reported Symptoms</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptoms.length === 0 && (
                  <span className="text-[13px] text-[#262842] dark:text-slate-400">No symptoms recorded</span>
                )}
                {symptoms.map((symptom) => (
                  <span key={symptom} className="px-3 py-1.5 rounded-xl bg-[#E8E9F1] dark:bg-slate-800 text-[#3B3E66] dark:text-slate-200 text-[13px] font-semibold border border-[#E8E9F1] dark:border-slate-700">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical History */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                  <StickyNote size={16} color="#3B3E66" />
                </div>
                <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Medical History</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(evaluation?.medicalHistory ?? []).length === 0 && (
                  <span className="text-[13px] text-[#262842] dark:text-slate-400">No medical history recorded</span>
                )}
                {(evaluation?.medicalHistory ?? []).map((history) => (
                  <span key={history} className="px-3 py-1.5 rounded-xl bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-300 text-[13px] font-semibold border border-[#E8E9F1] dark:border-slate-700">
                    {history}
                  </span>
                ))}
              </div>
            </div>

            {/* Pain level */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                    <span className="text-[16px]">🔴</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Pain Level</h3>
                </div>
                {painLevel == null ? (
                  <span className="text-[16px] font-bold text-[#262842] dark:text-slate-400">-</span>
                ) : (
                  <span className="text-[20px] font-extrabold" style={{ color: painColors[painLevel] }}>
                    {painLevel}/10
                  </span>
                )}
              </div>
              {painLevel != null && (
                <div className="flex gap-1 rounded-xl overflow-hidden">
                  {painColors.map((c, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center rounded-sm h-8" style={{ background: c, opacity: i <= painLevel ? 1 : 0.15 }}>
                      <span className="text-[10px] font-bold text-white">{i}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Functional Activities */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                  <CheckSquare size={16} color="#3B3E66" />
                </div>
                <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Functional Activities</h3>
              </div>
              <div className="flex flex-col gap-3">
                {functionalEntries.length === 0 && (
                  <span className="text-[13px] text-[#262842] dark:text-slate-400">No functional scores recorded</span>
                )}
                {functionalEntries.map(({ key, value }) => (
                  <div key={key} className="flex items-center justify-between py-1 border-b last:border-0 border-b border-[#E8E9F1] dark:border-slate-800">
                    <span className="text-[14px] font-medium text-[#262842] dark:text-slate-300 capitalize">
                      {key === 'stairs' ? 'Climbing Stairs' : key}
                    </span>
                    <span className="px-3 py-1 rounded-xl text-[12px] font-semibold" style={{ background: `${funcColors[value] ?? "#3B3E66"}15`, color: funcColors[value] ?? "#3B3E66" }}>
                      {value} - {funcLabels[value] ?? 'Recorded'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white mb-2.5">
                Chief Complaints
              </h3>
              <p className="text-[14px] text-[#262842] dark:text-slate-300 leading-relaxed">
                {complaintText || 'No chief complaints recorded'}
              </p>
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'Vitals' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                  <Heart size={16} color="#3B3E66" />
                </div>
                <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Vital Signs</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {vitalsCards.map((vital) => (
                  <div key={vital.label} className="p-4 rounded-2xl transition-transform hover:-translate-y-1 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                    <span style={{ fontSize: '24px' }}>{vital.icon}</span>
                    <p className="text-[12px] font-semibold text-[#262842] dark:text-slate-400 mt-2">{vital.label}</p>
                    <p className="text-[16px] font-bold" style={{ color: vital.color }}>{vital.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis Tab */}
        {activeTab === 'Diagnosis' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                    <Stethoscope size={16} color="#3B3E66" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Diagnosis</h3>
                </div>
                {editMode && <span className="px-2 py-1 rounded-md text-amber-600 bg-[#E8E9F1] dark:bg-slate-800 text-[11px] font-bold">✏️ Edit Mode</span>}
              </div>
              {editMode ? (
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full outline-none resize-none p-4 rounded-2xl border border-[#E8E9F1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17252A] dark:text-white text-[14px] min-h-[100px]"
                />
              ) : (
                <p className="text-[15px] font-semibold text-[#3B3E66] dark:text-slate-200 leading-relaxed">{diagnosis || 'No diagnosis recorded'}</p>
              )}
            </div>

            {/* Treatment Protocol */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white mb-4">
                Treatment Protocol
              </h3>
              {evaluation?.plan ? (
                <p className="text-[14px] text-[#262842] dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {evaluation.plan}
                </p>
              ) : (
                <p className="text-[13px] text-[#262842] dark:text-slate-400">No treatment plan recorded</p>
              )}
            </div>

            {editMode && (
              <button
                onClick={handleSaveDiagnosis}
                disabled={updateEvaluation.isPending}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-transform hover:-translate-y-1 disabled:opacity-50 bg-gradient-to-br from-[#262842] to-[#3B3E66] text-white text-[15px] font-bold shadow-[0_4px_16px_rgba(38,40,66,0.3)] dark:shadow-none">
                <Save size={18} />
                {updateEvaluation.isPending ? 'Saving…' : 'Save Diagnosis'}
              </button>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'Notes' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E8E9F1] dark:bg-slate-800">
                    <StickyNote size={16} color="#262842" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white">Doctor's Notes</h3>
                </div>
                {editMode && <span className="px-2 py-1 rounded-md text-amber-600 bg-[#E8E9F1] dark:bg-slate-800 text-[11px] font-bold">✏️ Edit Mode</span>}
              </div>
              {editMode ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full outline-none resize-none p-4 rounded-2xl border border-[#E8E9F1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17252A] dark:text-white text-[14px] min-h-[140px]"
                />
              ) : (
                <p className="text-[14px] text-[#262842] dark:text-slate-300 leading-relaxed">{notes || 'No notes recorded'}</p>
              )}
            </div>

            <div className="p-5 rounded-2xl" style={{ background: '#E8E9F1', border: '1px solid #E8E9F1' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-900">
                  <Dumbbell size={16} color="#3B3E66" />
                </div>
                <span className="text-[15px] font-bold text-[#17252A] dark:text-white">Exercise Recommendation</span>
              </div>
              <p className="text-[14px] text-[#262842] dark:text-slate-400 mb-4">
                {evaluation?.plan || 'No exercise recommendation recorded'}
              </p>
              <button
                onClick={() => id && navigate(`/doctor/patient/${id}/exercise`)}
                className="px-5 py-2.5 rounded-xl transition-colors bg-[#3B3E66] text-white text-[13px] font-semibold">
                View Exercise Plan
              </button>
            </div>

            {editMode && (
              <button
                onClick={handleSaveNotes}
                disabled={updateEvaluation.isPending}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-transform hover:-translate-y-1 disabled:opacity-50 bg-gradient-to-br from-[#262842] to-[#3B3E66] text-white text-[15px] font-bold shadow-[0_4px_16px_rgba(38,40,66,0.3)] dark:shadow-none">
                <Save size={18} />
                {updateEvaluation.isPending ? 'Saving…' : 'Save Notes'}
              </button>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'History' && patientId && (
          <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_2px_12px_rgba(23,37,42,0.04)] dark:shadow-none">
            <PatientHistoryUpload patientId={patientId} patientName={patient?.name} />
          </div>
        )}
      </div>

      <div className="md:hidden border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}