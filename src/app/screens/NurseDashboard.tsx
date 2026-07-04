import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';

import { ApiErrorBanner } from '../components/ApiErrorBanner';
import {
  ClipboardList, Clock, CheckCircle, ChevronRight,
  UserPlus, User, Zap, Search, LogIn, LogOut,
} from 'lucide-react';
import { useState } from 'react';

const statusConfig: Record<string, { label: string; lightColor: string; lightBg: string; darkColor: string; darkBg: string; dot: string }> = {
  waiting:      { label: 'Waiting',     lightColor: 'text-amber-700',   lightBg: 'bg-amber-50',   darkColor: 'dark:text-amber-300',   darkBg: 'dark:bg-amber-900/30',   dot: 'bg-amber-400' },
  'in-session': { label: 'In Session',  lightColor: 'text-blue-700',    lightBg: 'bg-blue-50',    darkColor: 'dark:text-blue-300',    darkBg: 'dark:bg-blue-900/30',    dot: 'bg-blue-500' },
  completed:    { label: 'Completed',   lightColor: 'text-emerald-700', lightBg: 'bg-emerald-50', darkColor: 'dark:text-emerald-300', darkBg: 'dark:bg-emerald-900/30', dot: 'bg-emerald-400' },
};

const avatarColors: Record<string, { bg: string; darkBg: string; color: string; darkColor: string }> = {
  Male:   { bg: 'bg-blue-100',   darkBg: 'dark:bg-blue-900/40',   color: 'text-blue-700',   darkColor: 'dark:text-blue-300' },
  Female: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/40', color: 'text-purple-700', darkColor: 'dark:text-purple-300' },
  Other:  { bg: 'bg-teal-100',   darkBg: 'dark:bg-teal-900/40',   color: 'text-teal-700',   darkColor: 'dark:text-teal-300' },
};

export function NurseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [showProfileMenu, setShowProfileMenu] = useState(false);



  // ── Live data from backend ─────────────────────────────────────────────────
  // Therapist (nurse) sees all patients (same as doctor module)
  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: filter !== 'all' ? filter : undefined,
    bookedOnly: filter === 'waiting' ? 'true' : undefined,
    limit: 20,
  }, true); // ← 10s polling for live patient queue

  const updatePatient = useUpdatePatient();

  const handleCheckIn = async (patientId: string) => {
    if (inProgress >= 2) {
      alert('Therapist capacity exceeded! You cannot have more than 2 active patients at a time.');
      return;
    }
    try {
      await updatePatient.mutateAsync({ id: patientId, status: 'in-session', checkInTime: new Date().toISOString() });
    } catch (err) {
      console.error('Failed to check in', err);
    }
  };

  const patients = patientsData?.data ?? [];

  const firstName = user?.name?.split(' ')[0] || 'Therapist';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inProgress = patients.filter((p) => p.status === 'in-session').length;
  const done = patients.filter((p) => p.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">


        {/* ── Header ── */}
        <div
          className="px-6 pt-8 pb-12 relative z-20 bg-gradient-to-br from-teal-900 to-teal-600 dark:from-slate-900 dark:to-slate-800 shrink-0"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-200/70 mb-1">{today}</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Morning, {firstName}! 👋
                </h1>
                <p className="text-sm text-teal-100/80 mt-1">Physiotherapy Unit B · Morning Shift</p>
              </div>
              <div className="flex items-center gap-2 relative z-50">
                {/* Profile Button */}

                {/* Profile Button */}
                <div className="relative">
                  <button 
                    onClick={() => navigate('/nurse/profile')}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
                    <User className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Waiting', value: waiting, color: 'text-amber-300' },
                { label: 'In Progress', value: inProgress, color: 'text-blue-300' },
                { label: 'Completed', value: done, color: 'text-emerald-300' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl py-3 px-4 text-center">
                  <p className={`text-2xl font-black leading-none ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-white/60 font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-6" style={{ scrollbarGutter: 'stable' }}>
        <div className="px-6 max-w-5xl mx-auto w-full mt-6 space-y-5">

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {/* New Intake */}
            <button
              onClick={() => navigate('/nurse/intake')}
              className="flex items-center gap-3 p-4 rounded-2xl text-left group bg-gradient-to-br from-teal-800 to-teal-500 dark:from-teal-900 dark:to-teal-700 shadow-lg shadow-teal-900/20 dark:shadow-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-white">New Intake</p>
                <p className="text-xs text-white/70 mt-0.5">Start patient form</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />
            </button>

            {/* Add Patient */}
            <button
              onClick={() => navigate('/nurse/patient-form')}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Add Patient</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register new patient</p>
              </div>
            </button>
          </div>

          {/* Status chips */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{waiting} waiting</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <Zap className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{inProgress} active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{done} done</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients or conditions..."
              className="flex-1 outline-none bg-transparent py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'all', label: `All (${patientsData?.total ?? 0})` },
              { key: 'waiting', label: 'Waiting' },
              { key: 'in-session', label: 'Active' },
              { key: 'completed', label: 'Done' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`py-2 rounded-xl text-[11px] font-bold border transition-colors ${
                  filter === f.key
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Patient Queue heading */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Patient Queue · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{isLoading ? '…' : `${patients.length} shown`}</span>
          </div>

          {/* Patient cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
            {/* Loading skeleton */}
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
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
            {!isLoading && isError && (
              <div className="col-span-full">
                <ApiErrorBanner error={isError} onRetry={() => window.location.reload()} />
              </div>
            )}

            {!isLoading && !isError && patients.length === 0 && (
              <div className="col-span-full text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No patients found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}

            {!isLoading && !isError && patients.map((patient) => {
              const config = statusConfig[patient.status] ?? statusConfig['waiting'];
              const av = avatarColors[patient.gender] ?? avatarColors['Other'];
              return (
                <div key={patient.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative font-extrabold text-sm ${av.bg} ${av.darkBg} ${av.color} ${av.darkColor}`}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{patient.name}</p>
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${config.lightBg} ${config.lightColor} ${config.darkBg} ${config.darkColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{patient.condition ?? '—'} · Age {patient.age}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">{patient.displayId}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                          {patient.phone}
                        </span>
                        {patient.visitType && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-[10px] text-teal-700 dark:text-teal-400 font-bold">
                            {patient.visitType}
                          </span>
                        )}
                      </div>
                      {/* Check-in / Check-out times */}
                      {(patient.checkInTime || patient.checkOutTime) && (
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                          {patient.checkInTime && (
                            <span className="flex items-center gap-0.5">
                              <LogIn className="w-2.5 h-2.5" /> In: {new Date(patient.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {patient.checkOutTime && (
                            <span className="flex items-center gap-0.5">
                              <LogOut className="w-2.5 h-2.5" /> Out: {new Date(patient.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {patient.status !== 'completed' && (
                    <div className="border-t border-slate-100 dark:border-slate-700 flex">
                      {patient.status === 'waiting' && !patient.checkInTime && (
                        <button
                          onClick={() => handleCheckIn(patient.id)}
                          disabled={updatePatient.isPending}
                          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 border-r border-slate-100 dark:border-slate-700"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          CHECK IN
                        </button>
                      )}
                      {patient.status === 'waiting' && (
                        <button
                          onClick={() => navigate(`/nurse/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          Start Intake
                          <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      )}
                      {patient.status === 'in-session' && (
                        <button
                          onClick={() => navigate(`/nurse/session/${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-colors bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          SESSION
                          <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isLoading && patients.length === 0 && (
            <div className="flex flex-col items-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-3 bg-teal-50 dark:bg-teal-900/30">
                <UserPlus className="w-6 h-6 text-teal-500" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No patients found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
        </div>

      <div className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}