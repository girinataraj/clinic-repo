import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BottomNav } from '../components/BottomNav';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';

import { ApiErrorBanner } from '../components/ApiErrorBanner';
import {
  Search, Eye, Edit3, FileText, CheckCircle, ClipboardList,
  Users, ChevronRight, Dumbbell, Calendar, User, UserPlus,
  TrendingUp, Zap, Activity, BarChart2, UserCog, HeartPulse
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  waiting:      { label: 'Waiting',     color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/30', dot: 'bg-amber-500', border: 'border-amber-100 dark:border-amber-900/40' },
  'in-session': { label: 'In Session',  color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-900/30', dot: 'bg-indigo-500', border: 'border-indigo-100 dark:border-indigo-900/40' },
  completed:    { label: 'Completed',   color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-500', border: 'border-emerald-100 dark:border-emerald-900/40' },
};

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('');

export function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: activeTab !== 'all' ? activeTab : undefined,
    bookedOnly: activeTab === 'waiting' ? 'true' : undefined,
    limit: 20,
  }, true);

  const updatePatient = useUpdatePatient();

  const handleCompleteSession = async (patientId: string) => {
    try {
      await updatePatient.mutateAsync({ id: patientId, status: 'completed' });
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  };

  const patients = patientsData?.data ?? [];

  const actualName = user?.name === 'Dr. Rajesh Kumar' ? 'Dr. SV. Sathish Kumar' : (user?.name || 'Doctor');
  const firstName = actualName.replace('Dr. ', '');
  
  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inSession = patients.filter((p) => p.status === 'in-session').length;
  const completed = patients.filter((p) => p.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        
        {/* ── Mobile-First Header ── */}
        <div className="px-5 pt-10 pb-12 relative bg-gradient-to-br from-[#1e1b4b] to-[#312e81] dark:from-slate-900 dark:to-slate-800 rounded-b-[2rem] shadow-md z-10">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <HeartPulse size={140} className="text-white transform rotate-6" />
          </div>
          
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div>
              <p className="text-[12px] font-bold text-indigo-200/80 mb-1 tracking-wider uppercase">Doctor Hub</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Dr. {firstName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/doctor/profile')}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-sm overflow-hidden"
              >
                <img
                  src="/doctor.jpg"
                  alt="Doctor Profile"
                  className="w-full h-full object-cover object-[center_15%]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.setAttribute('style', 'display: block');
                  }}
                />
                <User size={20} className="text-white hidden" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="px-4 -mt-8 relative z-20 flex flex-col gap-5">
          
          {/* Quick Stats Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-indigo-900/5 border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-between">
            <div className="flex items-center justify-around flex-1 py-2">
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 dark:text-white">{patientsData?.total ?? 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{waiting}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Waiting</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{inSession}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
             <button
                onClick={() => navigate('/doctor/daily-report')}
                className="flex flex-col items-center justify-center gap-2 rounded-[20px] p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <BarChart2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200">Reports</span>
              </button>
              <button
                onClick={() => navigate('/doctor/therapists')}
                className="flex flex-col items-center justify-center gap-2 rounded-[20px] p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <UserCog size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200">Therapists</span>
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
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[13px] font-extrabold transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-900 dark:bg-indigo-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
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
                   <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200">No patients here</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  No patients match your current filter.
                </p>
              </div>
            )}

            {!isLoading && !isError && patients.map((patient) => {
              const config = statusConfig[patient.status] ?? statusConfig['waiting'];
              return (
                <div key={patient.id} className={`bg-white dark:bg-slate-900 rounded-[22px] shadow-sm overflow-hidden flex flex-col active:scale-[0.99] transition-transform border ${patient.status === 'in-session' ? 'border-indigo-500 dark:border-indigo-400 shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="p-4 flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative font-extrabold text-[15px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white">
                      {getInitials(patient.name)}
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-[2.5px] border-white dark:border-slate-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[15px] font-extrabold text-slate-900 dark:text-white truncate pr-2">{patient.name}</p>
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shrink-0 ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{patient.condition ?? '—'} · {patient.age} yrs</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          ID: {patient.displayId}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-50 dark:border-slate-800 flex divide-x divide-slate-50 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {patient.status === 'in-session' ? (
                      <button
                        onClick={() => navigate(`/doctor/session/${patient.id}`)}
                        className="flex-1 py-4 flex items-center justify-center gap-2 text-[13px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      >
                        <ClipboardList size={16} />
                        SESSION
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye size={15} />
                          VIEW
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <ClipboardList size={15} />
                          ASSESS
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <FileText size={15} />
                          REPORT
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
