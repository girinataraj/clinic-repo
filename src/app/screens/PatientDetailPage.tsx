import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import { usePatient } from '../../hooks/usePatients';
import { useLatestEvaluation } from '../../hooks/useEvaluations';
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
} from 'lucide-react';

const funcLabels: Record<number, string> = { 0: 'Normal', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
const funcColors: Record<number, string> = { 0: '#3AAFA9', 1: '#3AAFA9', 2: '#2B7A78', 3: '#2B7A78', 4: '#17252A' };
const painColors = ['#3AAFA9', '#3AAFA9', '#3AAFA9', '#2B7A78', '#2B7A78', '#2B7A78', '#17252A', '#17252A', '#17252A', '#17252A', '#17252A'];

const tabs = ['Overview', 'Vitals', 'Diagnosis', 'Notes'];

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
    { icon: '💓', label: 'Blood Pressure', value: evaluation?.bp ?? '-', color: '#3AAFA9' },
    { icon: '❤️', label: 'Pulse Rate', value: evaluation?.pr != null ? `${evaluation.pr} bpm` : '-', color: '#2B7A78' },
    { icon: '🫁', label: 'SpO2', value: evaluation?.spo2 != null ? `${evaluation.spo2}%` : '-', color: '#3AAFA9' },
    { icon: '🌡️', label: 'Temperature', value: evaluation?.temperature != null ? `${evaluation.temperature}°F` : '-', color: '#2B7A78' },
    { icon: '⚡', label: 'Ejection Fraction', value: evaluation?.ef != null ? `${evaluation.ef}%` : '-', color: '#3AAFA9' },
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
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      {/* Header */}
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
            onClick={() => navigate('/doctor')}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
            style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}>Patient Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
              style={{ width: '40px', height: '40px', background: editMode ? 'rgba(251,191,36,0.3)' : 'rgba(254,255,255,0.15)' }}>
              <Edit3 size={18} color={editMode ? '#fbbf24' : '#FEFFFF'} />
            </button>
            <button
              onClick={() => navigate(evaluation?.id ? `/doctor/report?evaluationId=${evaluation.id}` : '/doctor/report')}
              className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
              style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
              <FileText size={18} color="#FEFFFF" />
            </button>
          </div>
        </div>

        {/* Patient card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl relative z-10 backdrop-blur-sm"
          style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
          <div className="rounded-2xl flex items-center justify-center shrink-0"
            style={{ width: '56px', height: '56px', background: 'rgba(254,255,255,0.2)', fontSize: '24px' }}>
            🧑‍🦽
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}>{patient?.name ?? 'Patient'}</p>
            <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)', marginTop: '2px' }}>
              {patient?.gender ?? '-'}, {patient?.age ?? '-'} yrs · {patient?.phone ?? '-'}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 rounded-full"
                style={{ background: '#DEF2F1', color: '#3AAFA9', fontSize: '11px', fontWeight: 700 }}>
                {patient?.displayId ?? '-'}
              </span>
              <span className="px-3 py-1 rounded-full"
                style={{ background: '#3AAFA9', color: '#FEFFFF', fontSize: '11px', fontWeight: 700 }}>
                Status: {patient?.status ?? '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex shrink-0 px-4 pt-4 pb-0" style={{ background: '#FEFFFF', borderBottom: '1px solid #DEF2F1', boxShadow: '0 2px 8px rgba(23,37,42,0.02)' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-center transition-all duration-300"
            style={{
              fontSize: '13px', fontWeight: 600,
              color: activeTab === tab ? '#3AAFA9' : '#2B7A78',
              borderBottom: `2px solid ${activeTab === tab ? '#3AAFA9' : 'transparent'}`,
            }}
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
          <div className="rounded-2xl p-6 text-center" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
            <p style={{ fontSize: '14px', color: '#2B7A78' }}>Loading patient details...</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="flex flex-col gap-4">
            {/* Condition */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                  <Stethoscope size={16} color="#3AAFA9" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Primary Condition</h3>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#3AAFA9' }}>{patient?.condition ?? '-'}</p>
              <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '4px' }}>
                Consultation with {consultationName || '-'} on {consultationDate || '-'}
              </p>
            </div>

            {/* Symptoms */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                  <Activity size={16} color="#3AAFA9" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Reported Symptoms</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptoms.length === 0 && (
                  <span style={{ fontSize: '13px', color: '#2B7A78' }}>No symptoms recorded</span>
                )}
                {symptoms.map((symptom) => (
                  <span key={symptom} className="px-3 py-1.5 rounded-xl"
                    style={{ background: '#DEF2F1', color: '#3AAFA9', fontSize: '13px', fontWeight: 600, border: '1px solid #DEF2F1' }}>
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Pain level */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                    <span style={{ fontSize: '16px' }}>🔴</span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Pain Level</h3>
                </div>
                {painLevel == null ? (
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#2B7A78' }}>-</span>
                ) : (
                  <span style={{ fontSize: '20px', fontWeight: 800, color: painColors[painLevel] }}>
                    {painLevel}/10
                  </span>
                )}
              </div>
              {painLevel != null && (
                <div className="flex gap-1 rounded-xl overflow-hidden">
                  {painColors.map((c, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center rounded-sm"
                      style={{ height: '32px', background: c, opacity: i <= painLevel ? 1 : 0.15 }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#FEFFFF' }}>{i}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Functional Activities */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                  <CheckSquare size={16} color="#3AAFA9" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Functional Activities</h3>
              </div>
              <div className="flex flex-col gap-3">
                {functionalEntries.length === 0 && (
                  <span style={{ fontSize: '13px', color: '#2B7A78' }}>No functional scores recorded</span>
                )}
                {functionalEntries.map(({ key, value }) => (
                  <div key={key} className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: '#DEF2F1' }}>
                    <span style={{ fontSize: '14px', color: '#2B7A78', fontWeight: 500, textTransform: 'capitalize' }}>
                      {key === 'stairs' ? 'Climbing Stairs' : key}
                    </span>
                    <span className="px-3 py-1 rounded-xl"
                      style={{ background: `${funcColors[value] ?? '#3AAFA9'}15`, color: funcColors[value] ?? '#3AAFA9', fontSize: '12px', fontWeight: 600 }}>
                      {value} - {funcLabels[value] ?? 'Recorded'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '10px' }}>
                Chief Complaints
              </h3>
              <p style={{ fontSize: '14px', color: '#2B7A78', lineHeight: 1.6 }}>
                {complaintText || 'No chief complaints recorded'}
              </p>
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'Vitals' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                  <Heart size={16} color="#3AAFA9" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Vital Signs</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {vitalsCards.map((vital) => (
                  <div key={vital.label} className="p-4 rounded-2xl transition-transform hover:-translate-y-1"
                    style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                    <span style={{ fontSize: '24px' }}>{vital.icon}</span>
                    <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600, marginTop: '8px' }}>{vital.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: vital.color }}>{vital.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis Tab */}
        {activeTab === 'Diagnosis' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                    <Stethoscope size={16} color="#3AAFA9" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Diagnosis</h3>
                </div>
                {editMode && <span className="px-2 py-1 rounded-md text-amber-600" style={{ background: '#DEF2F1', fontSize: '11px', fontWeight: 700 }}>✏️ Edit Mode</span>}
              </div>
              {editMode ? (
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full outline-none resize-none"
                  style={{ padding: '16px', borderRadius: '16px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px', minHeight: '100px' }}
                />
              ) : (
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#3AAFA9', lineHeight: 1.6 }}>{diagnosis || 'No diagnosis recorded'}</p>
              )}
            </div>

            {/* Treatment Protocol */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '16px' }}>
                Treatment Protocol
              </h3>
              {evaluation?.plan ? (
                <p style={{ fontSize: '14px', color: '#2B7A78', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {evaluation.plan}
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: '#2B7A78' }}>No treatment plan recorded</p>
              )}
            </div>

            {editMode && (
              <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-transform hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)', color: '#FEFFFF', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba(43, 122, 120, 0.3)' }}>
                <Save size={18} />
                Save Diagnosis
              </button>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'Notes' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                    <StickyNote size={16} color="#2B7A78" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Doctor's Notes</h3>
                </div>
                {editMode && <span className="px-2 py-1 rounded-md text-amber-600" style={{ background: '#DEF2F1', fontSize: '11px', fontWeight: 700 }}>✏️ Edit Mode</span>}
              </div>
              {editMode ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full outline-none resize-none"
                  style={{ padding: '16px', borderRadius: '16px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px', minHeight: '140px' }}
                />
              ) : (
                <p style={{ fontSize: '14px', color: '#2B7A78', lineHeight: 1.7 }}>{notes || 'No notes recorded'}</p>
              )}
            </div>

            <div className="p-5 rounded-2xl" style={{ background: '#DEF2F1', border: '1px solid #DEF2F1' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#FEFFFF' }}>
                  <Dumbbell size={16} color="#3AAFA9" />
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Exercise Recommendation</span>
              </div>
              <p style={{ fontSize: '14px', color: '#2B7A78', marginBottom: '16px' }}>
                {evaluation?.plan || 'No exercise recommendation recorded'}
              </p>
              <button
                onClick={() => id && navigate(`/doctor/patient/${id}/exercise`)}
                className="px-5 py-2.5 rounded-xl transition-colors"
                style={{ background: '#3AAFA9', color: '#FEFFFF', fontSize: '13px', fontWeight: 600 }}>
                View Exercise Plan
              </button>
            </div>

            {editMode && (
              <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-transform hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)', color: '#FEFFFF', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba(43, 122, 120, 0.3)' }}>
                <Save size={18} />
                Save Notes
              </button>
            )}
          </div>
        )}
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}