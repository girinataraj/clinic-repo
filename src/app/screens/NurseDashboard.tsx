import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';

import { ApiErrorBanner } from '../components/ApiErrorBanner';
import {
  ClipboardList, Clock, CheckCircle, ChevronRight,
  UserPlus, User, Zap, Search, LogIn, LogOut,
  Activity, Plus
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

  // ── Live data from backend ─────────────────────────────────────────────────
  // Therapist (nurse) sees only their assigned patients
  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: filter !== 'all' ? filter : undefined,
    bookedOnly: filter === 'waiting' ? 'true' : undefined,
    therapistId: user?.id,
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
  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inProgress = patients.filter((p) => p.status === 'in-session').length;
  const done = patients.filter((p) => p.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">

        {/* ── Mobile-First Header ── */}
        <div className="px-5 pt-10 pb-12 relative bg-gradient-to-br from-teal-800 to-teal-600 dark:from-slate-900 dark:to-slate-800 rounded-b-[2rem] shadow-md z-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Activity size={120} className="text-white transform rotate-12" />
          </div>
          
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div>
              <p className="text-[12px] font-bold text-teal-100/80 mb-1 tracking-wider uppercase">Therapist Hub</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Hello, {firstName}
              </h1>
            </div>
            <button
              onClick={() => navigate('/nurse/profile')}
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-sm"
            >
              <User size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="px-4 -mt-8 relative z-20 flex flex-col gap-5">
          
          {/* Quick Actions & Stats Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-teal-900/5 border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-between">
            <div className="flex items-center justify-around flex-1 py-2">
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 dark:text-white">{waiting}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Waiting</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-teal-600 dark:text-teal-400">{inProgress}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{done}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Done</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             <button
                onClick={() => navigate('/nurse/patient-form')}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 shadow-md shadow-teal-600/20 text-white font-extrabold text-[14px] transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
              >
                <Plus size={18} />
                New Patient
              </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="flex-1 outline-none bg-transparent text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Scrollable Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 no-scrollbar">
            {[
              { key: 'all', label: `All (${patientsData?.total ?? 0})` },
              { key: 'waiting', label: 'Waiting' },
              { key: 'in-session', label: 'Active' },
              { key: 'completed', label: 'Done' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[13px] font-extrabold transition-all ${
                  filter === f.key
                    ? 'bg-slate-900 dark:bg-teal-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white">Patient Queue</h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {isLoading ? '…' : `${patients.length} listed`}
            </span>
          </div>

          {/* Patient Cards */}
          <div className="flex flex-col gap-3">
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && isError && (
              <ApiErrorBanner error={isError} onRetry={() => window.location.reload()} />
            )}

            {!isLoading && !isError && patients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                   <User className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200">No patients here</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  You've cleared the queue, or they don't match your search filter.
                </p>
              </div>
            )}

            {!isLoading && !isError && patients.map((patient) => {
              const config = statusConfig[patient.status] ?? statusConfig['waiting'];
              const av = avatarColors[patient.gender] ?? avatarColors['Other'];
              return (
                <div key={patient.id} className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col active:scale-[0.99] transition-transform">
                  <div className="p-4 flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative font-extrabold text-[15px] ${av.bg} ${av.darkBg} ${av.color} ${av.darkColor}`}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-[2.5px] border-white dark:border-slate-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[15px] font-extrabold text-slate-900 dark:text-white truncate pr-2">{patient.name}</p>
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shrink-0 ${config.lightBg} ${config.lightColor} ${config.darkBg} ${config.darkColor}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{patient.condition ?? '—'} · {patient.age} yrs</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {patient.displayId}
                        </span>
                        {patient.visitType && (
                          <span className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                            {patient.visitType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {patient.status !== 'completed' && (
                    <div className="border-t border-slate-50 dark:border-slate-800 flex divide-x divide-slate-50 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      {patient.status === 'waiting' && !patient.checkInTime && (
                        <button
                          onClick={() => handleCheckIn(patient.id)}
                          disabled={updatePatient.isPending}
                          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <LogIn size={15} />
                          CHECK IN
                        </button>
                      )}
                      {patient.status === 'waiting' && (
                        <button
                          onClick={() => navigate(`/nurse/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                        >
                          <ClipboardList size={15} />
                          ASSESS
                        </button>
                      )}
                      {patient.status === 'in-session' && (
                        <button
                          onClick={() => navigate(`/nurse/session/${patient.id}`)}
                          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[13px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <ClipboardList size={16} />
                          SESSION
                          <ChevronRight size={14} strokeWidth={3} className="ml-1" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}