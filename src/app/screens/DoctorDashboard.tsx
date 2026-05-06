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
  TrendingUp, Zap, Activity, BarChart2, UserCog
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
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showProfileMenu, setShowProfileMenu] = useState(false);



  // ── Live data from backend ─────────────────────────────────────────────────
  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: activeTab !== 'all' ? activeTab : undefined,
    bookedOnly: activeTab === 'waiting' ? 'true' : undefined,
    limit: 20,
  }, true); // ← 10s polling for live patient queue

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
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inSession = patients.filter((p) => p.status === 'in-session').length;
  const completed = patients.filter((p) => p.status === 'completed').length;

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
              onClick={() => navigate('/doctor/daily-report')}
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

          {/* Search + Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div
              className="flex items-center gap-3 px-4 flex-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Search size={18} className="text-slate-400 dark:text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients or conditions..."
                className="flex-1 outline-none bg-transparent py-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-2 p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              {[
                { key: 'all', label: `All (${patientsData?.total ?? 0})` },
                { key: 'waiting', label: `Wait (${waiting})` },
                { key: 'in-session', label: 'Active' },
                { key: 'completed', label: 'Done' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-semibold ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white dark:bg-slate-700'
                      : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {tab.label}
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
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 rounded-full w-3.5 h-3.5 bg-indigo-500 border-2 border-white dark:border-slate-800" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5">{patient.condition ?? '—'} · {patient.age} yrs</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold ${
                          patient.status === 'in-session' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 
                          patient.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                          'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          <div className={`rounded-full w-1.5 h-1.5 ${
                            patient.status === 'in-session' ? 'bg-indigo-500' : 
                            patient.status === 'completed' ? 'bg-emerald-500' : 
                            'bg-amber-500'
                          }`} />
                          {config.label}
                        </span>
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
                    {patient.status === 'in-session' ? (
                      <button
                        onClick={() => navigate(`/doctor/session/${patient.id}`)}
                        className="w-full flex items-center justify-center gap-2 py-4 transition-colors text-[13px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <ClipboardList size={16} />
                        SESSION
                      </button>
                    ) : (
                      <div className="flex divide-x divide-slate-200 dark:divide-slate-700">
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                          <ClipboardList size={16} />
                          Assess
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors text-[13px] font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <FileText size={16} />
                          Report
                        </button>
                      </div>
                    )}
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
    </div>
  );
}
