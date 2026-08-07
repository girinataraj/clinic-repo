import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BottomNav } from '../components/BottomNav';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import { useDebounce } from '../../hooks/useDebounce';

import { ApiErrorBanner } from '../components/ApiErrorBanner';
import {
  Search, Eye, Edit3, FileText, CheckCircle, ClipboardList,
  Users, ChevronRight, Dumbbell, Calendar, User, UserPlus,
  TrendingUp, Zap, Activity, BarChart2, UserCog, Filter, X
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  waiting:      { label: 'Waiting',     color: 'text-slate-800 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-800 dark:bg-slate-300', border: 'border-slate-100 dark:border-slate-800' },
  'in-session': { label: 'In Session',  color: 'text-indigo-900 dark:text-indigo-100', bg: 'bg-indigo-100 dark:bg-indigo-900/40', dot: 'bg-indigo-900 dark:bg-indigo-300', border: 'border-indigo-100 dark:border-indigo-900/40' },
  completed:    { label: 'Completed',   color: 'text-emerald-50 dark:text-emerald-100', bg: 'bg-emerald-700 dark:bg-emerald-900', dot: 'bg-emerald-50 dark:bg-emerald-300', border: 'border-emerald-700 dark:border-emerald-900' },
};

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('');

export function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Search and active filter ('in-session' | 'all')
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'in-session' | 'all' | string>('in-session');

  // Filter Modal states (Priority removed)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [therapistFilter, setTherapistFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [daysFilter, setDaysFilter] = useState<string>('all');

  // Local/Temporary Modal edit states
  const [tempTherapistFilter, setTempTherapistFilter] = useState<string>('all');
  const [tempDateFilter, setTempDateFilter] = useState<string>('');
  const [tempDaysFilter, setTempDaysFilter] = useState<string>('all');

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  // ── Live data from backend ─────────────────────────────────────────────────
  const { data: patientsData, isLoading, isError } = usePatients({
    search: debouncedSearch.trim() || undefined,
    therapistId: therapistFilter !== 'all' ? therapistFilter : undefined,
    date: dateFilter || undefined,
    days: daysFilter !== 'all' ? daysFilter : undefined,
    limit: 50,
  }, true); // ← 10s polling for live patient queue

  const { data: therapists = [] } = useStaffUsers({ role: 'nurse' });
  const updatePatient = useUpdatePatient();

  const handleCompleteSession = async (patientId: string) => {
    try {
      await updatePatient.mutateAsync({ id: patientId, status: 'completed' });
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  };

  const rawPatients = patientsData?.data ?? [];
  // If 'in-session' selected: show only patients who have NOT been assessed yet ('waiting')
  // If 'all' selected: show all patients
  const patients = activeTab === 'in-session'
    ? rawPatients.filter(p => p.status === 'waiting')
    : rawPatients;

  const actualName = user?.name || 'Doctor';
  const firstName = actualName.replace('Dr. ', '');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inSession = patients.filter((p) => p.status === 'in-session').length;
  const completed = patients.filter((p) => p.status === 'completed').length;

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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="relative z-20 rounded-b-3xl bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-lg shadow-slate-900/10">
          <div className="absolute inset-0 overflow-hidden rounded-b-3xl pointer-events-none">
            <div className="absolute -right-16 -top-16 rounded-full opacity-10 bg-white/10 w-[200px] h-[200px]" />
            <div className="absolute right-10 top-20 rounded-full opacity-20 bg-white/20 w-[80px] h-[80px]" />
          </div>
          <div className="px-6 pb-12 pt-8 relative z-30">

          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[13px] text-white font-medium tracking-[0.5px] uppercase">
                  {today}
                </p>
                <h1 className="text-[26px] font-bold text-white mt-1 tracking-tight">
                  {actualName} 👋
                </h1>
                <p className="text-sm text-white/80 mt-0.5 font-normal">
                  Sports Physiotherapist · SAAI Clinic
                </p>
              </div>
              <div className="flex items-center gap-3 relative z-50">
                {/* Profile Button */}
                <div className="relative">
                  <button
                    onClick={() => navigate('/doctor/profile')}
                    className="flex items-center justify-center rounded-2xl transition-all duration-300 relative w-12 h-12 bg-white/15 hover:bg-white/20 border border-white/20 overflow-hidden">
                    <img
                      src="/doctor.jpg"
                      alt="Doctor Profile"
                      className="w-full h-full rounded-2xl object-cover object-[center_15%]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.setAttribute('style', 'display: block');
                      }}
                    />
                    <User size={22} className="text-white hidden" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="px-5 pb-8 max-w-6xl mx-auto w-full mt-6">
          {/* Stats */}
          <div className="flex gap-4 mb-6">
            {[
              { label: "Today's Patients", value: patientsData?.total ?? 0, icon: Users },
              { label: 'In Session', value: inSession, icon: Zap },
              { label: 'Completed', value: completed, icon: CheckCircle },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex-1 rounded-2xl p-4 flex flex-col items-center justify-center transition-transform hover:-translate-y-1 duration-300 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1.5 text-center">{s.label}</span>
                </div>
              );
            })}
          </div>



          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => navigate('/doctor/revenue')}
              className="flex items-center gap-3 p-4 rounded-2xl transition-shadow hover:shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700">
                <BarChart2 size={18} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Daily Reports</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Revenue & stats by date</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/doctor/therapists')}
              className="flex items-center gap-3 p-4 rounded-2xl transition-shadow hover:shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700">
                <UserCog size={18} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Therapists</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Assign & manage</p>
              </div>
            </button>
          </div>

          {/* Search Bar & Timeframe Filters */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-sm mb-6 space-y-3">
            <div className="flex gap-2 items-center">
              <div
                className="flex items-center gap-3 px-4 flex-1 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <Search size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patients by name, display ID, or phone..."
                  className="flex-1 outline-none bg-transparent py-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <button
                onClick={() => {
                  setTempTherapistFilter(therapistFilter);
                  setTempDateFilter(dateFilter);
                  setTempDaysFilter(daysFilter);
                  setIsFilterModalOpen(true);
                }}
                className={`flex items-center justify-center p-3 border rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-all ${
                  therapistFilter !== 'all' || dateFilter !== '' || daysFilter !== 'all'
                    ? 'bg-slate-900/10 dark:bg-slate-700/30 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
                title="Filter Records"
                aria-label="Filter Records"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle Chips: In Session & All */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { key: 'in-session', label: 'In Session' },
                { key: 'all', label: 'All' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setActiveTab(opt.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeTab === opt.key
                      ? 'bg-slate-900 text-white dark:bg-slate-700 border-slate-900 dark:border-slate-700 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Queue</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {isLoading ? '…' : `${patients.length} patients`}
            </span>
          </div>

          {/* Patient Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Loading skeleton */}
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded bg-slate-100 dark:bg-slate-700 w-3/5" />
                    <div className="h-3 rounded bg-slate-100 dark:bg-slate-700 w-2/5" />
                  </div>
                </div>
              </div>
            ))}

            {/* Error state */}
            {!isLoading && isError && (
              <div className="col-span-full">
                <ApiErrorBanner error={isError} onRetry={() => window.location.reload()} />
              </div>
            )}

            {!isLoading && !isError && patients.length === 0 && (
              <div className="col-span-full text-center py-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <Users className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No patients found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters</p>
              </div>
            )}

            {!isLoading && !isError && patients.map((patient, index) => {
              const config = statusConfig[patient.status] ?? statusConfig['waiting'];
              return (
                <div
                  key={patient.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-slate-800 shadow-sm border ${patient.status === 'in-session' ? 'border-indigo-500 dark:border-indigo-400' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  {/* Patient header */}
                  <div className="flex items-center gap-4 p-5 pb-4">
                    <div className="rounded-2xl flex items-center justify-center shrink-0 relative w-14 h-14 bg-slate-100 dark:bg-slate-700">
                      <span className="text-lg font-bold text-slate-800 dark:text-white">{getInitials(patient.name)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5">{patient.condition ?? '—'} · {patient.age} yrs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex gap-3 px-5 pb-5">
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
                        <span className="text-sm">🆔</span>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">ID</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{patient.displayId}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm">
                        <span className="text-sm">📞</span>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Phone</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{patient.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex divide-x divide-slate-200 dark:divide-slate-700">
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Eye size={15} />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        <ClipboardList size={15} />
                        Assess
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!isLoading && patients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl shadow-sm mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center rounded-full mb-4 w-16 h-16 bg-slate-100 dark:bg-slate-700">
                <Users size={32} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">No patients found</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden shrink-0 mt-auto sticky bottom-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <BottomNav role="doctor" />
      </div>

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
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-205 outline-none focus:ring-1 focus:ring-[#3B3E66]"
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
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-205 outline-none focus:ring-1 focus:ring-[#3B3E66]"
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
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-855 dark:text-slate-205 outline-none focus:ring-1 focus:ring-[#3B3E66]"
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
