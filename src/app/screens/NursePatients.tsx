import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePatients } from '../../hooks/usePatients';

import { TreatmentDetailModal } from '../../features/patients/components/TreatmentDetailModal';
import {
  AlertTriangle, CalendarClock, ChevronRight, ClipboardList,
  Clock, Loader2, Phone, Plus, Search, ShieldCheck,
  User, UserPlus, Filter
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  waiting:     { label: 'Waiting',     color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-900/30',   dot: 'bg-amber-500', border: 'border-amber-100 dark:border-amber-900/40' },
  'in-session':{ label: 'In Session',  color: 'text-teal-700 dark:text-teal-300',     bg: 'bg-teal-50 dark:bg-teal-900/30',     dot: 'bg-teal-500', border: 'border-teal-100 dark:border-teal-900/40' },
  completed:   { label: 'Completed',   color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-500', border: 'border-emerald-100 dark:border-emerald-900/40' },
};

const avatarPalette = [
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40',   color: 'text-cyan-800 dark:text-cyan-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/40',   color: 'text-teal-800 dark:text-teal-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', color: 'text-indigo-800 dark:text-indigo-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/40',   color: 'text-blue-800 dark:text-blue-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-800 dark:text-violet-300' },
];

const getInitials = (name: string) => name.split(' ').map((part) => part[0]).join('');

export function NursePatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    therapistId: user?.id,
    limit: 50,
  });

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
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  const stats = {
    total: patientsData?.total ?? 0,
    waiting: patients.filter((p) => p.status === 'waiting').length,
    active: patients.filter((p) => p.status === 'in-session').length,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        
        {/* ── Mobile-First Header ── */}
        <div className="px-5 pt-10 pb-12 relative bg-gradient-to-br from-teal-800 to-teal-600 dark:from-slate-900 dark:to-slate-800 rounded-b-[2rem] shadow-md z-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <UserPlus size={120} className="text-white transform rotate-12" />
          </div>
          
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div>
              <p className="text-[12px] font-bold text-teal-100/80 mb-1 tracking-wider uppercase">Patient Roster</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Your Patients
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/nurse/profile')}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-sm"
              >
                <User size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="px-4 -mt-8 relative z-20 flex flex-col gap-5">

          {/* Start New Actions */}
          <div className="flex gap-3">
             <button
                onClick={() => navigate('/nurse/intake')}
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-[20px] p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                  <ClipboardList size={22} className="text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200">Start Assessment</span>
              </button>
              <button
                onClick={() => navigate('/nurse/patient-form')}
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-[20px] p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserPlus size={22} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200">Add Patient</span>
              </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patients..."
                className="flex-1 outline-none bg-transparent text-[14px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="flex overflow-x-auto gap-2 no-scrollbar">
              {[
                { key: 'all', label: `All (${stats.total})` },
                { key: 'waiting', label: 'Waiting' },
                { key: 'in-session', label: 'In session' },
                { key: 'completed', label: 'Done' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-[12px] font-extrabold transition-all ${
                    statusFilter === item.key
                      ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Patient List Heading */}
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white">Active Queue</h3>
             <span className="text-[11px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg">
               {isLoading ? '…' : `${patients.length} listed`}
             </span>
          </div>

          {/* Patient Cards */}
          <div className="flex flex-col gap-3 pb-6">
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 shadow-sm p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}

            {isError && !isLoading && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-[22px] border border-red-100 dark:border-red-900/50 p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-[14px] font-bold text-red-700 dark:text-red-400">Failed to load patients</p>
                <p className="text-[12px] text-red-500 dark:text-red-500 mt-1">Check connection and try again.</p>
              </div>
            )}

            {!isLoading && !isError && patients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                   <User className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200">No patients found</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5">Adjust search or filters.</p>
              </div>
            )}

            {!isLoading && patients.map((patient, index) => {
              const status = statusConfig[patient.status] ?? statusConfig['waiting'];
              const avatar = avatarPalette[index % avatarPalette.length];
              const actionLabel = patient.status === 'completed'
                ? 'Review Notes'
                : patient.status === 'in-session'
                  ? 'Active Session'
                  : 'Start Assessment';

              return (
                <div
                  key={patient.id}
                  className={`bg-white dark:bg-slate-900 rounded-[22px] border shadow-sm overflow-hidden flex flex-col active:scale-[0.99] transition-transform ${patient.status === 'in-session' ? 'border-teal-500 dark:border-teal-400 shadow-teal-500/10' : 'border-slate-100 dark:border-slate-800'}`}
                  onClick={() => handlePatientClick(patient.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-4 flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative font-extrabold text-[15px] ${avatar.bg} ${avatar.color}`}>
                      {getInitials(patient.name)}
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-teal-500 border-[2.5px] border-white dark:border-slate-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[15px] font-extrabold text-slate-900 dark:text-white truncate pr-2">{patient.name}</p>
                        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shrink-0 ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {patient.condition ?? '—'} · {patient.age} yrs · {patient.gender[0]}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg border border-slate-100 dark:border-slate-700">
                          {patient.displayId}
                        </span>
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-100 dark:border-slate-700">
                          {patient.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 dark:border-slate-800 flex divide-x divide-slate-50 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (patient.status === 'in-session') {
                          navigate(`/nurse/session/${patient.id}`);
                        } else {
                          navigate(getIntakePath(patient));
                        }
                      }}
                      className={`flex-1 py-4 flex items-center justify-center gap-2 text-[12px] font-extrabold transition-colors ${
                        patient.status === 'completed'
                          ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                      }`}
                    >
                      <ClipboardList size={16} />
                      {actionLabel}
                    </button>
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         window.location.href = `tel:${patient.phone}`;
                      }}
                      className="w-16 py-4 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={patient.phone}
                    >
                      <Phone size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="nurse" />
      </div>

      {isDesktop && selectedPatientId && (
        <TreatmentDetailModal
          patientId={selectedPatientId}
          viewerRole={user?.role ?? 'nurse'}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
}
