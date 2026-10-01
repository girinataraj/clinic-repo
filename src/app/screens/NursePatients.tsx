import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePatients } from '../../hooks/usePatients';
import { useDebounce } from '../../hooks/useDebounce';
import { useStaffUsers } from '../../hooks/useStaff';

import { TreatmentDetailModal } from '../../features/patients/components/TreatmentDetailModal';
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
  UserPlus,
  Filter,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  waiting:     { label: 'Waiting',     color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30',   dot: 'bg-amber-400' },
  'in-session':{ label: 'In Session',  color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/30',     dot: 'bg-blue-500' },
  completed:   { label: 'Completed',   color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-400' },
};

const avatarPalette = [
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40',   color: 'text-cyan-800 dark:text-cyan-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/40',   color: 'text-teal-800 dark:text-teal-300' },
  { bg: 'bg-red-100 dark:bg-red-900/40',     color: 'text-red-800 dark:text-red-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/40',   color: 'text-blue-800 dark:text-blue-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-800 dark:text-violet-300' },
];

const getInitials = (name: string) =>
  name.split(' ').map((part) => part[0]).join('');

export function NursePatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Search and status (remains inline)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modal open state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Applied filter state (defaults: Therapist optional -> undefined, Date mandatory -> Last 1 Week/7 days)
  const [appliedTherapistId, setAppliedTherapistId] = useState<string | undefined>(undefined);
  const [appliedDateRange, setAppliedDateRange] = useState<string>('7');

  // Temporary/Modal local edit state
  const [tempTherapistId, setTempTherapistId] = useState<string | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<string>('7');

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  // ── Live data from backend ─────────────────────────────────────────────────
  const { data: patientsData, isLoading, isError } = usePatients({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    therapistId: appliedTherapistId,
    dateRange: appliedDateRange,
    limit: 50,
  });

  // Fetch therapist list dynamically (optional filter selection)
  const { data: therapists = [] } = useStaffUsers({ role: 'nurse' });

  const patients = patientsData?.data ?? [];

  const handlePatientClick = (patientId: string) => {
    if (isDesktop) {
      setSelectedPatientId(patientId);
    } else {
      navigate(`/nurse/patient/${patientId}/treatment`);
    }
  };

  const getIntakePath = (patient: { id: string; phone?: string | null }) => {
    const params = new URLSearchParams({ patientId: patient.id });
    if (patient.phone) {
      params.set('phone', patient.phone);
    }
    return `/nurse/intake?${params.toString()}`;
  };

  const firstName = user?.name?.split(' ')[0] || 'Therapist';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = {
    total: patientsData?.total ?? 0,
    waiting: patients.filter((p) => p.status === 'waiting').length,
    active: patients.filter((p) => p.status === 'in-session').length,
  };

  const getInitials = (name: string) => name.split(' ').map((p) => p[0]).join('');

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


  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">

        <div
          className="px-6 pt-safe-top-8 pb-12 relative z-20 shrink-0"
          style={{ background: 'linear-gradient(135deg, #0d2b27, #0f766e)' }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-teal-100/80 mb-1 uppercase tracking-wider">Therapist Station</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  Patient registry for {firstName}
                </h1>
                <p className="text-sm text-teal-100 mt-1 font-medium">
                  {today} · Assessment dashboard
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/nurse/profile')}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm shadow-sm"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Total patients', value: stats.total, color: 'text-teal-300' },
                { label: 'Waiting', value: stats.waiting, color: 'text-amber-300' },
                { label: 'Active', value: stats.active, color: 'text-blue-300' },
              ].map((s) => (
                <div key={s.label} className="py-3 px-4 rounded-2xl bg-white/10 border border-white/10 text-center">
                  <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
                  <p className="text-[10px] text-white/65 font-bold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-6" style={{ scrollbarGutter: 'stable' }}>
        <div className="px-6 max-w-5xl mx-auto w-full mt-6">


          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-5 pb-6">
            {/* LEFT: Search + Filters + List */}
            <div className="flex flex-col gap-4">
              {/* Search & Status filters */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search patients or conditions"
                      className="flex-1 outline-none bg-transparent py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setTempTherapistId(appliedTherapistId);
                      setTempDateRange(appliedDateRange);
                      setIsFilterModalOpen(true);
                    }}
                    className={`flex items-center justify-center p-2.5 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
                      appliedTherapistId || appliedDateRange !== '7'
                        ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
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
                      className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold border transition-colors ${
                        statusFilter === item.key
                          ? 'bg-teal-700 dark:bg-teal-600 text-white border-teal-700 dark:border-teal-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List heading */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">My Patients ({patients.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {isLoading ? '…' : `${patients.length} results`}
                </p>
              </div>

              {/* Patient cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Loading skeleton */}
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Error state */}
                {isError && !isLoading && (
                  <div className="col-span-2 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 text-center">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Failed to load patients</p>
                    <p className="text-xs text-red-500 dark:text-red-500 mt-1">Check your connection and try again.</p>
                  </div>
                )}

                {/* Patient cards */}
                {!isLoading && patients.map((patient, index) => {
                  const status = statusConfig[patient.status] ?? statusConfig['waiting'];
                  const avatar = avatarPalette[index % avatarPalette.length];
                  const actionLabel = patient.status === 'completed'
                    ? 'Review notes'
                    : patient.status === 'in-session'
                      ? 'Session'
                      : 'Start assessment';

                  return (
                    <div
                      key={patient.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 cursor-pointer"
                      onClick={() => handlePatientClick(patient.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handlePatientClick(patient.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 font-extrabold text-sm ${avatar.bg} ${avatar.color}`}
                        >
                          {getInitials(patient.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 pr-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{patient.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {patient.condition ?? '—'} · {patient.age} yrs · {patient.gender[0]}
                              </p>
                            </div>
                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${status.bg} ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-300 text-[11px] font-bold">
                              {patient.displayId}
                            </span>
                            <span className="rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                              {patient.phone}
                            </span>
                            {(patient as any).assignedByDoctorName && (
                              <span className="rounded-lg px-2 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 text-[11px] font-semibold border border-teal-100/50 dark:border-teal-900/50">
                                Assigned by Dr. {(patient as any).assignedByDoctorName} on {new Date((patient as any).assignedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (patient.status === 'in-session') {
                              navigate(`/nurse/session/${patient.id}`);
                            } else {
                              navigate(getIntakePath(patient));
                            }
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-colors ${
                            patient.status === 'completed'
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                              : 'text-white hover:opacity-90'
                          }`}
                          style={patient.status !== 'completed' ? { background: 'linear-gradient(135deg, #0f766e, #14b8a6)' } : {}}
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          {actionLabel}
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center rounded-xl px-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          aria-label={`Call ${patient.name} at ${patient.phone}`}
                          title={patient.phone}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isLoading && !isError && patients.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 text-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No patients found</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Try adjusting your search or status filters.</p>
                </div>
              )}
            </div>

            {/* RIGHT: Sidebar panels */}
            <div className="flex flex-col gap-4">
              {/* Shift snapshot */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Shift snapshot</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Assessment focus</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    stats.waiting > 0 ? `${stats.waiting} patient(s) waiting` : 'No patients waiting',
                    `${stats.total} total patient(s) today`,
                  ].map((alert) => (
                    <div
                      key={alert}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                      {alert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Intake checklist */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Assessment checklist</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Make sure to log</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Vitals captured', done: true },
                    { label: 'VAS scale noted', done: true },
                    { label: 'Consent verified', done: false },
                    { label: 'Exercise history updated', done: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${
                        item.done
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${item.done ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-slate-300 dark:bg-slate-500'}`} />
                      <span className={`text-xs font-semibold ${item.done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact hub */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Contact hub</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick actions</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => window.location.href = 'tel:+910444567890'}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Call front desk
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/nurse/intake')}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Schedule follow ups
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
          </div>
        </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <BottomNav role="nurse" />
      </div>

      {/* Desktop Treatment Detail Modal */}
      {selectedPatientId && (
        <TreatmentDetailModal
          patientId={selectedPatientId}
          viewerRole={user?.role ?? 'nurse'}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm rounded-[28px] p-6 bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-white">Filter Records</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Therapist Filter (Dropdown, Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Therapist (Optional)
                </label>
                <select
                  value={tempTherapistId || ''}
                  onChange={(e) => setTempTherapistId(e.target.value || undefined)}
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">All Therapists</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter (Radio Button, Mandatory) */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Date Range (Mandatory)
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Last 1 Day', value: '1' },
                    { label: 'Last 3 Days', value: '3' },
                    { label: 'Last 1 Week', value: '7' },
                  ].map((option) => {
                    const isSelected = tempDateRange === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 text-teal-800 dark:text-teal-400'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dateRange"
                          value={option.value}
                          checked={isSelected}
                          onChange={() => setTempDateRange(option.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-teal-500 bg-teal-500/10' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                          )}
                        </div>
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <button
                onClick={() => {
                  // Reset filters and fetch records
                  setAppliedTherapistId(undefined);
                  setAppliedDateRange('7');
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              >
                Clear Filter
              </button>
              <button
                onClick={() => {
                  if (!tempDateRange) {
                    alert('Date range selection is mandatory.');
                    return;
                  }
                  setAppliedTherapistId(tempTherapistId);
                  setAppliedDateRange(tempDateRange);
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-600 active:scale-95 transition-all shadow-sm"
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
