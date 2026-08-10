import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePatients, useUpdatePatient, useDeletePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import { useDebounce } from '../../hooks/useDebounce';
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
  Trash2,
  Filter,
  Pencil,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  waiting:      { label: 'Waiting',     color: '#262842', bg: '#E8E9F1', dot: '#262842' },
  'in-session': { label: 'In Session',  color: '#17252A', bg: '#E8E9F1', dot: '#3B3E66' },
  completed:    { label: 'Completed',   color: '#FEFFFF', bg: '#3B3E66', dot: '#FEFFFF' },
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
  
  // Search and status (remains inline)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Active filter states (Priority removed)
  const [therapistFilter, setTherapistFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [daysFilter, setDaysFilter] = useState<string>('all');

  // Temporary/Modal local edit states
  const [tempTherapistFilter, setTempTherapistFilter] = useState<string>('all');
  const [tempDateFilter, setTempDateFilter] = useState<string>('');
  const [tempDaysFilter, setTempDaysFilter] = useState<string>('all');

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [assignPatient, setAssignPatient] = useState<{ id: string; name: string; therapistId?: string } | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  // ── Live data from backend ─────────────────────────────────────────────────
  const { data: patientsData, isLoading, isError } = usePatients({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    therapistId: therapistFilter !== 'all' ? therapistFilter : undefined,
    date: dateFilter || undefined,
    days: daysFilter !== 'all' ? daysFilter : undefined,
    limit: 50,
  });
  const { data: therapists = [] } = useStaffUsers({ role: 'nurse' });
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const rawPatients = patientsData?.data ?? [];
  const patients = statusFilter === 'all'
    ? rawPatients.filter((p) => p.status !== 'completed')
    : rawPatients;

  const handleDeletePatient = async (id: string) => {
    try {
      await deletePatient.mutateAsync(id);
      setDeletePatientId(null);
    } catch (err) {
      console.error('Failed to delete patient:', err);
    }
  };


  const totalEvaluationsCount = patients.reduce((acc, p) => acc + (p.evaluations_count || 0), 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterModalOpen(false);
      }
    };
    if (isFilterModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterModalOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFilterModalOpen(false);
    }
  };

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
    <div className="flex flex-col h-full saai-page bg-[#E8E9F1] dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto">
        <div
          className="relative z-20 rounded-b-3xl"
          style={{
            background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)',
            color: 'white',
            boxShadow: '0 4px 24px rgba(38, 40, 66, 0.15)',
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
                      <Icon size={16} color="#E8E9F1" />
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

        <div className="max-w-6xl mx-auto px-4 pb-8" style={{ marginTop: '24px' }}>
          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-4">
            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex gap-2 flex-1 items-center">
                    <div
                      className="flex items-center gap-2 flex-1 rounded-2xl px-3 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"
                    >
                      <Search size={16} color="#262842" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search patients or conditions"
                        className="flex-1 outline-none bg-transparent py-2.5 text-[13px] text-[#17252A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setTempTherapistFilter(therapistFilter);
                        setTempDateFilter(dateFilter);
                        setTempDaysFilter(daysFilter);
                        setIsFilterModalOpen(true);
                      }}
                      className={`flex items-center justify-center p-2.5 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-all ${
                        therapistFilter !== 'all' || dateFilter !== '' || daysFilter !== 'all'
                          ? 'bg-[#3B3E66]/10 border-[#3B3E66] text-[#3B3E66] dark:text-blue-400 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-[#E8E9F1] dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                      title="Filter Records"
                      aria-label="Filter Records"
                    >
                      <Filter className="h-5 w-5" />
                    </button>
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
                        className={`rounded-xl px-3 py-2 transition-all duration-200 text-[12px] font-semibold border
                          ${statusFilter === item.key 
                            ? 'bg-[#3B3E66] text-white border-[#3B3E66]' 
                            : 'bg-white dark:bg-slate-800 text-[#262842] dark:text-slate-300 border-[#E8E9F1] dark:border-slate-700'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              <div className="flex items-center justify-between">
                <h2 className="display-font text-[18px] font-bold text-[#17252A] dark:text-white">
                  Patient list
                </h2>
                <p className="text-[12px] font-semibold text-[#262842] dark:text-slate-400">
                  {isLoading ? '…' : `${patients.length} results`}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Loading skeleton */}
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="saai-panel rounded-2xl p-4 animate-pulse bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-2xl shrink-0 bg-slate-100 dark:bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 rounded bg-slate-100 dark:bg-slate-800 w-[60%]" />
                        <div className="h-3 rounded" style={{ background: '#E8E9F1', width: '40%' }} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Error state */}
                {isError && !isLoading && (
                  <div className="col-span-2 rounded-2xl p-6 text-center bg-[#fff5f5] dark:bg-red-900/20 border border-[#fed7d7] dark:border-red-900/50">
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
                      className="saai-panel rounded-2xl p-4 saai-stagger cursor-pointer hover:ring-2 hover:ring-teal-400/40 transition-all bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700"
                      style={{ animationDelay: `${index * 70}ms` }}
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
                              <p className="display-font text-[15px] font-bold text-[#17252A] dark:text-white">
                                {patient.name}
                              </p>
                              <p className="text-[12px] text-[#262842] dark:text-slate-400 mt-[2px]">
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
                              className="rounded-lg px-2 py-1 bg-[#E8E9F1] dark:bg-slate-800 text-[#17252A] dark:text-slate-200 text-[11px] font-bold"
                            >
                              {patient.displayId}
                            </span>
                            {patient.city && (
                              <span
                                className="rounded-lg px-2 py-1 bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-300 text-[11px] font-semibold"
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

                      <div className="flex flex-wrap md:flex-nowrap gap-2 mt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient/${patient.id}`); }}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 transition-colors bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-200 text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                        >
                          <FileText size={15} />
                          View chart
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient-form?id=${patient.id}`); }}
                          className="flex items-center justify-center rounded-xl p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-900/50 shrink-0"
                          title="Edit Patient"
                        >
                          <Pencil size={15} />
                        </button>
                        {patient.status !== 'completed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`); }}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 transition-colors bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 text-[13px] font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/50 whitespace-nowrap"
                          >
                            <Stethoscope size={15} />
                            Assess
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient/${patient.id}/exercise`); }}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 transition-shadow hover:shadow-md whitespace-nowrap"
                          style={{
                            background: 'linear-gradient(135deg, #262842, #3B3E66)',
                            color: '#FEFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <ChevronRight size={15} />
                          Write Rx
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletePatientId(patient.id); }}
                          className="flex items-center justify-center rounded-xl p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors border border-rose-100 dark:border-rose-900/50 shrink-0"
                          title="Delete Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isLoading && !isError && patients.length === 0 && (
                <div className="saai-panel rounded-2xl p-6 text-center bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                  <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>
                    No patients found
                  </p>
                  <p style={{ fontSize: '12px', color: '#262842', marginTop: '6px' }}>
                    Try adjusting your search or status filters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                <p className="saai-kicker text-[#262842] dark:text-slate-400">Care insights</p>
                <p className="display-font text-[16px] font-bold text-[#17252A] dark:text-white mt-[6px]">
                  Focus today
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    'Two patients need post session notes',
                    'Review progress on gait training plans',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700 text-[12px] font-semibold text-[#17252A] dark:text-white"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="saai-panel rounded-2xl p-4 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                <p className="saai-kicker text-[#262842] dark:text-slate-400">Vitals overview</p>
                <p className="display-font text-[16px] font-bold text-[#17252A] dark:text-white mt-[6px]">
                  Session readiness
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    { label: 'In session now', value: `${stats.active} patient${stats.active !== 1 ? 's' : ''}`, color: '#3B3E66' },
                    { label: 'Waiting', value: `${stats.waiting} patient${stats.waiting !== 1 ? 's' : ''}`, color: '#262842' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"
                    >
                      <span className="text-[12px] font-semibold text-[#17252A] dark:text-white">{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 mt-auto sticky bottom-0 z-50 border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
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
          <div className="w-full max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-none border dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#17252A' }}>
                {assignPatient.therapistId ? 'Reassign' : 'Assign'} Therapist
              </h3>
              <button onClick={() => { setAssignPatient(null); setAssignTarget(null); }} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={16} color="#64748b" />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#262842', marginBottom: '12px' }}>
              Patient: <strong>{assignPatient.name}</strong>
            </p>

            {/* Current */}
            {assignPatient.therapistId && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 bg-[#E8E9F1] dark:bg-teal-900/30 border border-[#b2dfdb] dark:border-teal-900/50">
                <UserCog size={13} color="#262842" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#262842' }}>
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
                      background: isSelected ? '#E8E9F1' : '#FEFFFF',
                      border: isSelected ? '2px solid #3B3E66' : '1px solid #E8E9F1',
                      opacity: isCurrent ? 0.4 : 1,
                      cursor: isCurrent ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: '30px', height: '30px', background: isSelected ? '#3B3E66' : '#E8E9F1' }}>
                      <UserCog size={13} color={isSelected ? '#FEFFFF' : '#262842'} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }}>{t.name}</p>
                      <p style={{ fontSize: '10px', color: '#262842' }}>
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
                style={{ background: '#E8E9F1', color: '#262842' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignTarget || updatePatient.isPending}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                style={{ background: '#262842', color: '#FEFFFF' }}
              >
                {updatePatient.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
            {updatePatient.isError && <p className="text-[11px] font-semibold text-red-600 text-center mt-2">Failed to assign. Try again.</p>}
          </div>
        </div>
      )}

      {/* Patient Delete Confirmation Modal */}
      {deletePatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-none border dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-extrabold text-[#17252A] dark:text-white">Delete Patient Record</h3>
              <button onClick={() => setDeletePatientId(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to permanently delete patient <strong>{patients.find(p => p.id === deletePatientId)?.name}</strong>? This action will cascade delete all appointments, evaluations, reports, and exercise plans associated with this patient, and cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeletePatientId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-200 hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(deletePatientId)}
                disabled={deletePatient.isPending}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
              >
                {deletePatient.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
            {deletePatient.isError && <p className="text-[11px] font-semibold text-rose-600 text-center mt-2">Failed to delete patient. Try again.</p>}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm rounded-[28px] p-6 bg-white dark:bg-slate-900 shadow-2xl border border-slate-150 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-[15px] font-extrabold text-[#262842] dark:text-white">Filter Records</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Therapist Filter (Dropdown, Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Therapist
                </label>
                <select
                  value={tempTherapistFilter}
                  onChange={(e) => setTempTherapistFilter(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#3B3E66]"
                >
                  <option value="all">All Therapists</option>
                  <option value="unassigned">Unassigned Only</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter (datepicker) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={tempDateFilter}
                  onChange={(e) => {
                    setTempDateFilter(e.target.value);
                    if (e.target.value) {
                      setTempDaysFilter('all');
                    }
                  }}
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#3B3E66]"
                />
              </div>

              {/* Days Range Filter (Dropdown) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Days Range
                </label>
                <select
                  value={tempDaysFilter}
                  onChange={(e) => {
                    setTempDaysFilter(e.target.value);
                    if (e.target.value !== 'all') {
                      setTempDateFilter('');
                    }
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#3B3E66]"
                >
                  <option value="all">Any Day</option>
                  <option value="1">Today</option>
                  <option value="3">Next 3 Days</option>
                  <option value="7">Next 7 Days</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <button
                onClick={() => {
                  setTherapistFilter('all');
                  setDateFilter('');
                  setDaysFilter('all');
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              >
                Clear Filter
              </button>
              <button
                onClick={() => {
                  setTherapistFilter(tempTherapistFilter);
                  setDateFilter(tempDateFilter);
                  setDaysFilter(tempDaysFilter);
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B3E66] hover:bg-[#2F3152] active:scale-95 transition-all shadow-sm"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

