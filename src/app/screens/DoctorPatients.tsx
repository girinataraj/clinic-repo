import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import { TreatmentDetailModal } from '../../features/patients/components/TreatmentDetailModal';
import {
  Activity,
  ChevronRight,
  FileText,
  Flame,
  HeartPulse,
  Search,
  Stethoscope,
  Users,
  UserPlus,
  UserCog,
  RefreshCw,
  X,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  waiting:      { label: 'Waiting',     color: '#2B7A78', bg: '#DEF2F1', dot: '#2B7A78' },
  'in-session': { label: 'In Session',  color: '#17252A', bg: '#DEF2F1', dot: '#3AAFA9' },
  completed:    { label: 'Completed',   color: '#FEFFFF', bg: '#3AAFA9', dot: '#FEFFFF' },
};

const avatarPalette = [
  { bg: '#E0F2F1', color: '#004D40' },
  { bg: '#E3F2FD', color: '#0D47A1' },
  { bg: '#F3E5F5', color: '#4A148C' },
  { bg: '#FFF3E0', color: '#E65100' },
  { bg: '#F1F8E9', color: '#1B5E20' },
];

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('');

export function DoctorPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [assignPatient, setAssignPatient] = useState<{ id: string; name: string; therapistId?: string } | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);

  // ── Live data from backend ─────────────────────────────────────────────────
  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 50,
  });
  const { data: therapists = [] } = useStaffUsers({ role: 'nurse' });
  const updatePatient = useUpdatePatient();

  const patients = patientsData?.data ?? [];

  const handlePatientClick = (patientId: string) => {
    if (isDesktop) {
      setSelectedPatientId(patientId);
    } else {
      navigate(`/doctor/patient/${patientId}/treatment`);
    }
  };

  const handleAssign = async () => {
    if (!assignPatient || !assignTarget) return;
    try {
      await updatePatient.mutateAsync({ id: assignPatient.id, therapistId: assignTarget });
      setAssignPatient(null);
      setAssignTarget(null);
    } catch { /* handled by RQ */ }
  };

  const getTherapistName = (therapistId?: string) => {
    if (!therapistId) return null;
    return therapists.find((t) => t.id === therapistId)?.name ?? null;
  };

  const firstName = (user?.name || 'Doctor').replace('Dr. ', '').split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const stats = {
    total: patientsData?.total ?? 0,
    active: patients.filter((p) => p.status === 'in-session').length,
    waiting: patients.filter((p) => p.status === 'waiting').length,
  };


  return (
    <div className="flex flex-col h-full saai-page" style={{ backgroundColor: '#DEF2F1' }}>
      <div className="flex-1 overflow-y-auto">
        <div
          className="relative overflow-hidden rounded-b-3xl"
          style={{
            background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
            color: 'white',
            boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
          }}
        >

          <div className="max-w-6xl mx-auto px-5 pt-6 pb-10 saai-fade-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="saai-kicker" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Doctor Console
                </p>
                <h1
                  className="display-font"
                  style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginTop: '6px' }}
                >
                  Patient care board for Dr. {firstName}
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
                  {today} - Sports physiotherapy
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/doctor/patient-form')}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(254,255,255,0.12)',
                    color: '#FEFFFF',
                    fontWeight: 700,
                    border: '1px solid rgba(254,255,255,0.2)',
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{ width: '34px', height: '34px', background: 'rgba(254,255,255,0.2)' }}
                  >
                    <UserPlus size={18} />
                  </div>
                  Add patient
                </button>
                <button
                  onClick={() => navigate('/doctor/exercise')}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(254,255,255,0.12)',
                    color: '#FEFFFF',
                    fontWeight: 700,
                    border: '1px solid rgba(254,255,255,0.2)',
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{ width: '34px', height: '34px', background: 'rgba(254,255,255,0.2)' }}
                  >
                    <Stethoscope size={18} />
                  </div>
                  Create exercise plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Total patients', value: stats.total, icon: Users },
                { label: 'In session', value: stats.active, icon: Activity },
                { label: 'Waiting', value: stats.waiting, icon: HeartPulse },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(254,255,255,0.12)', border: '1px solid rgba(254,255,255,0.12)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} color="#DEF2F1" />
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(254,255,255,0.7)' }}>{card.label}</p>
                    </div>
                    <p className="display-font" style={{ fontSize: '24px', fontWeight: 700, color: '#FEFFFF', marginTop: '6px' }}>
                      {card.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8" style={{ marginTop: '-18px' }}>
          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-4">
            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div
                    className="flex items-center gap-2 flex-1 rounded-2xl px-3"
                    style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                  >
                    <Search size={16} color="#2B7A78" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search patients or conditions"
                      className="flex-1 outline-none bg-transparent"
                      style={{ padding: '10px 0', fontSize: '13px', color: '#17252A' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {([
                      { key: 'all', label: 'All' },
                      { key: 'waiting', label: 'Waiting' },
                      { key: 'in-session', label: 'In session' },
                      { key: 'completed', label: 'Completed' },
                    ] as const).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setStatusFilter(item.key)}
                        className="rounded-xl px-3 py-2 transition-all duration-200"
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          background: statusFilter === item.key ? '#3AAFA9' : '#FEFFFF',
                          color: statusFilter === item.key ? '#FEFFFF' : '#2B7A78',
                          border: `1px solid ${statusFilter === item.key ? '#3AAFA9' : '#DEF2F1'}`,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="display-font" style={{ fontSize: '18px', fontWeight: 700, color: '#17252A' }}>
                  Patient list
                </h2>
                <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600 }}>
                  {isLoading ? '…' : `${patients.length} results`}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Loading skeleton */}
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="saai-panel rounded-2xl p-4 animate-pulse" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-2xl shrink-0" style={{ background: '#DEF2F1' }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 rounded" style={{ background: '#DEF2F1', width: '60%' }} />
                        <div className="h-3 rounded" style={{ background: '#DEF2F1', width: '40%' }} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Error state */}
                {isError && !isLoading && (
                  <div className="col-span-2 rounded-2xl p-6 text-center" style={{ background: '#fff5f5', border: '1px solid #fed7d7' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#c53030' }}>Failed to load patients</p>
                    <p style={{ fontSize: '12px', color: '#e53e3e', marginTop: '6px' }}>Check your connection and try again.</p>
                  </div>
                )}

                {/* Patient cards */}
                {!isLoading && patients.map((patient, index) => {
                  const status = statusConfig[patient.status] ?? statusConfig['waiting'];
                  const avatar = avatarPalette[index % avatarPalette.length];

                  return (
                    <div
                      key={patient.id}
                      className="saai-panel rounded-2xl p-4 saai-stagger cursor-pointer hover:ring-2 hover:ring-teal-400/40 transition-all"
                      style={{ animationDelay: `${index * 70}ms`, background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                      onClick={() => handlePatientClick(patient.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handlePatientClick(patient.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center rounded-2xl shrink-0"
                          style={{ width: '48px', height: '48px', background: avatar.bg, color: avatar.color, fontWeight: 800 }}
                        >
                          {getInitials(patient.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="display-font" style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>
                                {patient.name}
                              </p>
                              <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>
                                {patient.condition ?? '—'} · {patient.age} yrs
                              </p>
                            </div>
                            <span
                              className="flex items-center gap-1 rounded-full px-2 py-0.5"
                              style={{ background: status.bg, color: status.color, fontSize: '10px', fontWeight: 700 }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: status.dot }} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span
                              className="rounded-lg px-2 py-1"
                              style={{ background: '#DEF2F1', color: '#17252A', fontSize: '11px', fontWeight: 700 }}
                            >
                              {patient.displayId}
                            </span>
                            {patient.city && (
                              <span
                                className="rounded-lg px-2 py-1"
                                style={{ background: '#DEF2F1', color: '#2B7A78', fontSize: '11px', fontWeight: 600 }}
                              >
                                {patient.city}
                              </span>
                            )}
                            {/* Therapist badge */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setAssignPatient({ id: patient.id, name: patient.name, therapistId: patient.therapistId }); setAssignTarget(null); }}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:opacity-80"
                              style={{
                                background: patient.therapistId ? '#e0f2fe' : '#fef3c7',
                                color: patient.therapistId ? '#0369a1' : '#92400e',
                                fontSize: '11px',
                                fontWeight: 600,
                                border: `1px solid ${patient.therapistId ? '#bae6fd' : '#fde68a'}`,
                              }}
                            >
                              <UserCog size={11} />
                              {getTherapistName(patient.therapistId) ?? 'Unassigned'}
                              <RefreshCw size={9} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-colors"
                          style={{
                            background: '#DEF2F1',
                            color: '#2B7A78',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <FileText size={16} />
                          View chart
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}/exercise`)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-shadow hover:shadow-md"
                          style={{
                            background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
                            color: '#FEFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <ChevronRight size={16} />
                          Write Rx
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isLoading && !isError && patients.length === 0 && (
                <div className="saai-panel rounded-2xl p-6 text-center" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                  <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>
                    No patients found
                  </p>
                  <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '6px' }}>
                    Try adjusting your search or status filters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <p className="saai-kicker" style={{ color: '#2B7A78' }}>Care insights</p>
                <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A', marginTop: '6px' }}>
                  Focus today
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    'Two patients need post session notes',
                    'Review progress on gait training plans',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl px-3 py-2"
                      style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', fontSize: '12px', fontWeight: 600, color: '#17252A' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="saai-panel rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <p className="saai-kicker" style={{ color: '#2B7A78' }}>Vitals overview</p>
                <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A', marginTop: '6px' }}>
                  Session readiness
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    { label: 'In session now', value: `${stats.active} patient${stats.active !== 1 ? 's' : ''}`, color: '#3AAFA9' },
                    { label: 'Waiting', value: `${stats.waiting} patient${stats.waiting !== 1 ? 's' : ''}`, color: '#2B7A78' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>

      {/* Desktop Treatment Detail Modal */}
      {selectedPatientId && (
        <TreatmentDetailModal
          patientId={selectedPatientId}
          viewerRole={user?.role ?? 'doctor'}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {/* Therapist Assignment Modal */}
      {assignPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl p-5" style={{ background: '#FEFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#17252A' }}>
                {assignPatient.therapistId ? 'Reassign' : 'Assign'} Therapist
              </h3>
              <button onClick={() => { setAssignPatient(null); setAssignTarget(null); }} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={16} color="#64748b" />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#2B7A78', marginBottom: '12px' }}>
              Patient: <strong>{assignPatient.name}</strong>
            </p>

            {/* Current */}
            {assignPatient.therapistId && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: '#DEF2F1', border: '1px solid #b2dfdb' }}>
                <UserCog size={13} color="#2B7A78" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#2B7A78' }}>
                  Current: {getTherapistName(assignPatient.therapistId) ?? 'Unknown'}
                </span>
              </div>
            )}

            {/* Therapist list */}
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto mb-4">
              {therapists.length === 0 && (
                <p className="text-center py-4 text-[11px] text-slate-400 font-semibold">No therapists found.</p>
              )}
              {therapists.map((t) => {
                const isCurrent = assignPatient.therapistId === t.id;
                const isSelected = assignTarget === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => !isCurrent && setAssignTarget(t.id)}
                    disabled={isCurrent}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors"
                    style={{
                      background: isSelected ? '#DEF2F1' : '#FEFFFF',
                      border: isSelected ? '2px solid #3AAFA9' : '1px solid #DEF2F1',
                      opacity: isCurrent ? 0.4 : 1,
                      cursor: isCurrent ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: '30px', height: '30px', background: isSelected ? '#3AAFA9' : '#DEF2F1' }}>
                      <UserCog size={13} color={isSelected ? '#FEFFFF' : '#2B7A78'} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }}>{t.name}</p>
                      <p style={{ fontSize: '10px', color: '#2B7A78' }}>
                        {isCurrent ? 'Currently assigned' : t.displayId}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => { setAssignPatient(null); setAssignTarget(null); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: '#DEF2F1', color: '#2B7A78' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignTarget || updatePatient.isPending}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                style={{ background: '#2B7A78', color: '#FEFFFF' }}
              >
                {updatePatient.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
            {updatePatient.isError && <p className="text-[11px] font-semibold text-red-600 text-center mt-2">Failed to assign. Try again.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
