import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import {
  Search, Eye, Pencil, ClipboardList, CheckCircle,
  Users, User, UserPlus, Zap, Filter, X, Clock, LogIn, LogOut, FileText
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  waiting:      { label: 'Waiting',     color: 'text-teal-900 dark:text-teal-100', bg: 'bg-teal-100 dark:bg-teal-900/40', dot: 'bg-teal-700 dark:bg-teal-300' },
  'in-session': { label: 'In Session',  color: 'text-blue-900 dark:text-blue-100',   bg: 'bg-blue-100 dark:bg-blue-900/40',   dot: 'bg-blue-600 dark:bg-blue-300' },
  completed:    { label: 'Completed',   color: 'text-emerald-900 dark:text-emerald-100', bg: 'bg-emerald-100 dark:bg-emerald-900/40', dot: 'bg-emerald-600 dark:bg-emerald-300' },
};

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('');

export function NurseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [todaySubTab, setTodaySubTab] = useState<'todays_all' | 'todays_in_session' | 'todays_completed'>('todays_all');
  const [allSubTab, setAllSubTab] = useState<'all_total' | 'all_in_session' | 'all_completed'>('all_total');

  // Filter Modal states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('');
  // pastDaysFilter: backward-looking "Last N days" window ('' = no filter)
  const [pastDaysFilter, setPastDaysFilter] = useState<string>('');

  // Temporary Modal edit states
  const [tempDateFilter, setTempDateFilter] = useState<string>('');
  const [tempPastDaysFilter, setTempPastDaysFilter] = useState<string>('');

  // ── Live data from backend ─────────────────────────────────────────────────
  // Therapist (nurse role) sees patients assigned to them (filtered by backend query)
  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    date: dateFilter || undefined,
    // pastDays = backward-looking "Last N days" (NurseDashboard semantics)
    pastDays: pastDaysFilter || undefined,
    limit: 50,
  }, true); // 10s polling for live queue updates

  const updatePatient = useUpdatePatient();

  const rawPatients = patientsData?.data ?? [];

  const isToday = (dateStr?: string | null) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  };

  // ── Today's Patients ──
  const todaysPatients = useMemo(() => {
    return rawPatients.filter(p => isToday(p.createdAt) || isToday(p.lastSession) || isToday(p.checkInTime));
  }, [rawPatients]);

  const todaysInSession = useMemo(() => {
    return todaysPatients.filter(p => p.status === 'in-session' || p.status === 'waiting');
  }, [todaysPatients]);

  const todaysCompleted = useMemo(() => {
    return todaysPatients.filter(p => p.status === 'completed');
  }, [todaysPatients]);

  // ── All Patients till today ──
  const allInSession = useMemo(() => {
    return rawPatients.filter(p => p.status === 'in-session' || p.status === 'waiting');
  }, [rawPatients]);

  const allCompleted = useMemo(() => {
    return rawPatients.filter(p => p.status === 'completed');
  }, [rawPatients]);

  const patients = useMemo(() => {
    if (viewMode === 'today') {
      if (todaySubTab === 'todays_in_session') return todaysInSession;
      if (todaySubTab === 'todays_completed') return todaysCompleted;
      return todaysPatients;
    } else {
      if (allSubTab === 'all_in_session') return allInSession;
      if (allSubTab === 'all_completed') return allCompleted;
      return rawPatients;
    }
  }, [viewMode, todaySubTab, allSubTab, rawPatients, todaysPatients, todaysInSession, todaysCompleted, allInSession, allCompleted]);

  const firstName = user?.name?.split(' ')[0] || 'Therapist';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

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

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
        {/* Header */}
        <div className="relative z-20 rounded-b-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 dark:from-slate-900 dark:to-slate-800 shadow-lg shadow-teal-900/10">
          <div className="absolute inset-0 overflow-hidden rounded-b-3xl pointer-events-none">
            <div className="absolute -right-16 -top-16 rounded-full opacity-10 bg-white/10 w-[200px] h-[200px]" />
            <div className="absolute right-10 top-20 rounded-full opacity-20 bg-white/20 w-[80px] h-[80px]" />
          </div>
          <div className="px-4 pb-4 pt-safe-top-4 md:px-6 md:pb-6 md:pt-5 relative z-30 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] text-teal-100/90 font-medium tracking-[0.5px] uppercase">
                  {today}
                </p>
                <h1 className="text-[20px] md:text-[26px] font-extrabold text-white mt-1 tracking-tight">
                  Hello, {firstName}! 👋
                </h1>
                <p className="text-xs md:text-sm text-teal-100/80 mt-0.5 font-normal">
                  Therapist Dashboard · SAAI Clinic
                </p>
              </div>
              <div className="flex items-center gap-3 relative z-50">
                <button
                  onClick={() => navigate('/nurse/profile')}
                  className="flex items-center justify-center rounded-2xl transition-all duration-300 w-12 h-12 bg-white/15 hover:bg-white/20 border border-white/20 text-white"
                  title="Profile Settings"
                >
                  <User size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-6xl mx-auto w-full mt-6">
          {/* Stats Cards */}
          <div className="flex gap-4 mb-6">
            {viewMode === 'today' ? (
              [
                { key: 'todays_all', label: "Today's Patients", value: todaysPatients.length, icon: Users },
                { key: 'todays_in_session', label: 'In Session', value: todaysInSession.length, icon: Zap },
                { key: 'todays_completed', label: 'Completed', value: todaysCompleted.length, icon: CheckCircle },
              ].map((s) => {
                const isSelected = todaySubTab === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setTodaySubTab(s.key as any)}
                    className={`flex-1 rounded-2xl py-5 px-4 flex flex-col items-center justify-center transition-all duration-300 border text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-slate-800 border-2 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1.5">{s.value}</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</span>
                  </button>
                );
              })
            ) : (
              [
                { key: 'all_total', label: "Total Patients", value: rawPatients.length, icon: Users },
                { key: 'all_in_session', label: 'In Session', value: allInSession.length, icon: Zap },
                { key: 'all_completed', label: 'Completed', value: allCompleted.length, icon: CheckCircle },
              ].map((s) => {
                const isSelected = allSubTab === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setAllSubTab(s.key as any)}
                    className={`flex-1 rounded-2xl py-5 px-4 flex flex-col items-center justify-center transition-all duration-300 border text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-slate-800 border-2 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1.5">{s.value}</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => navigate('/nurse/patient-form')}
              className="flex items-center gap-3.5 p-4 rounded-2xl transition-all hover:shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <UserPlus size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Register Patient</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Add new patient record</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/nurse/patient-history')}
              className="flex items-center gap-3.5 p-4 rounded-2xl transition-all hover:shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ClipboardList size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">Patient History</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Search & past reports</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/nurse/profile')}
              className="flex items-center gap-3.5 p-4 rounded-2xl transition-all hover:shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <User size={18} />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">My Profile</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Account settings</p>
              </div>
            </button>
          </div>

          {/* Search Bar & View Controls */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-sm mb-6 space-y-3">
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-3 px-4 flex-1 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                <Search size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID, phone..."
                  className="flex-1 w-full min-w-0 outline-none bg-transparent py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <button
                onClick={() => {
                  setTempDateFilter(dateFilter);
                  setTempPastDaysFilter(pastDaysFilter);
                  setIsFilterModalOpen(true);
                }}
                className={`flex items-center justify-center p-3 border rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
                  dateFilter !== '' || pastDaysFilter !== ''
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'bg-slate-50/80 dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
                title="Filter Records"
                aria-label="Filter Records"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* View Mode Toggle: Today vs All */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { key: 'today', label: 'Today' },
                { key: 'all', label: 'All' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setViewMode(opt.key as any)}
                  className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all border ${
                    viewMode === opt.key
                      ? 'bg-[#111625] text-white dark:bg-slate-700 border-[#111625] dark:border-slate-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
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

            {!isLoading && !isError && patients.map((patient) => {
              const statusCfg = statusConfig[patient.status] ?? statusConfig['waiting'];
              return (
                <div
                  key={patient.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-slate-800 shadow-sm border ${patient.status === 'in-session' ? 'border-teal-500 dark:border-teal-400' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  {/* Patient header */}
                  <div className="flex items-center gap-4 p-5 pb-4">
                    <div className="rounded-2xl flex items-center justify-center shrink-0 relative w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                      <span className="text-lg font-bold">{getInitials(patient.name)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-bold text-slate-900 dark:text-white">{patient.name}</p>
                            {patient.therapistName ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                                Therapist: {patient.therapistName}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                Assigned to You
                              </span>
                            )}
                          </div>
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
                        onClick={() => navigate(`/nurse/patient/${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Eye size={15} />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/nurse/patient-form?id=${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors text-[13px] font-semibold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/nurse/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors text-[13px] font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40"
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
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsFilterModalOpen(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-5">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filter Patients</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Specific Date
                </label>
                <input
                  type="date"
                  value={tempDateFilter}
                  onChange={(e) => {
                    setTempDateFilter(e.target.value);
                    if (e.target.value) setTempPastDaysFilter('');
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Timeframe
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full min-w-0">
                  {[
                    { key: '', label: 'All Time' },
                    { key: '1', label: 'Last 24h' },
                    { key: '7', label: 'Last 7 Days' },
                  ].map((opt) => (
                    <button
                      key={opt.key || 'all'}
                      onClick={() => {
                        setTempPastDaysFilter(opt.key);
                        if (opt.key) setTempDateFilter('');
                      }}
                      className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold border transition-all text-center truncate ${
                        tempPastDaysFilter === opt.key
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => {
                  setTempDateFilter('');
                  setTempPastDaysFilter('');
                  setDateFilter('');
                  setPastDaysFilter('');
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setDateFilter(tempDateFilter);
                  setPastDaysFilter(tempPastDaysFilter);
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}