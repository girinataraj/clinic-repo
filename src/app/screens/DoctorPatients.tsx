import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import { TreatmentDetailModal } from '../../features/patients/components/TreatmentDetailModal';
import {
  Activity, ChevronRight, FileText, Flame, HeartPulse,
  Search, Stethoscope, Users, UserPlus, UserCog,
  RefreshCw, X, Eye
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  waiting:      { label: 'Waiting',     color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/30', dot: 'bg-amber-500', border: 'border-amber-100 dark:border-amber-900/40' },
  'in-session': { label: 'In Session',  color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-900/30', dot: 'bg-indigo-500', border: 'border-indigo-100 dark:border-indigo-900/40' },
  completed:    { label: 'Completed',   color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-500', border: 'border-emerald-100 dark:border-emerald-900/40' },
};

const avatarPalette = [
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40',   color: 'text-cyan-800 dark:text-cyan-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/40',   color: 'text-teal-800 dark:text-teal-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', color: 'text-indigo-800 dark:text-indigo-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/40',   color: 'text-blue-800 dark:text-blue-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-800 dark:text-violet-300' },
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
      navigate(`/doctor/patient/${patientId}`);
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

  const actualName = user?.name === 'Dr. Rajesh Kumar' ? 'Dr. SV. Sathish Kumar' : (user?.name || 'Doctor');
  const firstName = actualName.replace('Dr. ', '');
  const stats = {
    total: patientsData?.total ?? 0,
    active: patients.filter((p) => p.status === 'in-session').length,
    waiting: patients.filter((p) => p.status === 'waiting').length,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        
        {/* ── Mobile-First Header ── */}
        <div className="px-5 pt-10 pb-12 relative bg-gradient-to-br from-[#1e1b4b] to-[#312e81] dark:from-slate-900 dark:to-slate-800 rounded-b-[2rem] shadow-md z-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Users size={120} className="text-white transform rotate-12" />
          </div>
          
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div>
              <p className="text-[12px] font-bold text-indigo-200/80 mb-1 tracking-wider uppercase">Patient Directory</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                All Patients
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/doctor/patient-form')}
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-sm"
              >
                <UserPlus size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="px-4 -mt-8 relative z-20 flex flex-col gap-5">

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
                { key: 'in-session', label: 'Active' },
                { key: 'completed', label: 'Done' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-[12px] font-extrabold transition-all ${
                    statusFilter === item.key
                      ? 'bg-slate-900 dark:bg-indigo-500 text-white shadow-sm'
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
                <p className="text-[14px] font-bold text-red-700 dark:text-red-400">Failed to load patients</p>
                <p className="text-[12px] text-red-500 dark:text-red-500 mt-1">Check connection and try again.</p>
              </div>
            )}

            {!isLoading && !isError && patients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                   <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200">No patients found</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5">Adjust search or filters.</p>
              </div>
            )}

            {!isLoading && patients.map((patient, index) => {
              const status = statusConfig[patient.status] ?? statusConfig['waiting'];
              const avatar = avatarPalette[index % avatarPalette.length];
              const tName = getTherapistName(patient.therapistId);

              return (
                <div
                  key={patient.id}
                  className={`bg-white dark:bg-slate-900 rounded-[22px] border shadow-sm overflow-hidden flex flex-col active:scale-[0.99] transition-transform ${patient.status === 'in-session' ? 'border-indigo-500 dark:border-indigo-400 shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800'}`}
                  onClick={() => handlePatientClick(patient.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-4 flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative font-extrabold text-[15px] ${avatar.bg} ${avatar.color}`}>
                      {getInitials(patient.name)}
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-[2.5px] border-white dark:border-slate-900" />
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
                        {patient.condition ?? '—'} · {patient.age} yrs
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg border border-slate-100 dark:border-slate-700">
                          {patient.displayId}
                        </span>
                        {tName ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <Stethoscope className="w-3 h-3" />
                            {tName.split(' ')[0]}
                          </span>
                        ) : (
                           <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold rounded-lg border border-amber-100 dark:border-amber-800">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 dark:border-slate-800 flex divide-x divide-slate-50 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setAssignPatient({ id: patient.id, name: patient.name, therapistId: patient.therapistId });
                      }}
                      className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserCog size={15} />
                      ASSIGN
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`);
                      }}
                      className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[12px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <FileText size={15} />
                      ASSESS
                    </button>
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/doctor/patient/${patient.id}`);
                      }}
                      className="w-16 py-3.5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="doctor" />
      </div>

      {isDesktop && selectedPatientId && (
        <TreatmentDetailModal
          patientId={selectedPatientId}
          viewerRole={user?.role ?? 'doctor'}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {assignPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAssignPatient(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-extrabold text-slate-900 dark:text-white">Assign Therapist</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{assignPatient.name}</p>
              </div>
              <button onClick={() => setAssignPatient(null)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {therapists.map(t => (
                <button
                  key={t.id}
                  onClick={() => setAssignTarget(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${assignTarget === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${assignTarget === t.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {getInitials(t.name)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">Therapist</p>
                  </div>
                </button>
              ))}
              {therapists.length === 0 && (
                 <p className="text-center text-sm text-slate-500 py-4">No therapists found.</p>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={handleAssign}
                disabled={!assignTarget || assignTarget === assignPatient.therapistId || updatePatient.isPending}
                className="w-full py-3.5 rounded-[16px] font-bold text-[14px] bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
              >
                {updatePatient.isPending ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
