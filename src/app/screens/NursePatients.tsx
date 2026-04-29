import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TreatmentDetailModal } from '../../features/patients/components/TreatmentDetailModal';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';

type PatientStatus = 'waiting' | 'in-progress' | 'done';
type PatientPriority = 'high' | 'medium' | 'low';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'M' | 'F';
  condition: string;
  slot: string;
  status: PatientStatus;
  priority: PatientPriority;
  token: string;
  lastVisit: string;
  phone: string;
  nextStep: string;
}

const patients: Patient[] = [
  {
    id: 101, name: 'Rahul Verma', age: 45, gender: 'M',
    condition: 'ACL Knee Rehab', slot: '09:00 AM', status: 'waiting',
    priority: 'high', token: 'T-01', lastVisit: 'Apr 22',
    phone: '+91 90000 21034', nextStep: 'Gait training',
  },
  {
    id: 102, name: 'Anita Patel', age: 28, gender: 'F',
    condition: 'Shoulder Impingement', slot: '09:30 AM', status: 'in-progress',
    priority: 'medium', token: 'T-02', lastVisit: 'Apr 24',
    phone: '+91 90000 44218', nextStep: 'ROM assessment',
  },
  {
    id: 103, name: 'Suresh Kumar', age: 55, gender: 'M',
    condition: 'Post Stroke Rehab', slot: '10:00 AM', status: 'done',
    priority: 'low', token: 'T-03', lastVisit: 'Apr 26',
    phone: '+91 90000 11357', nextStep: 'Vitals update',
  },
  {
    id: 104, name: 'Meera Joshi', age: 38, gender: 'F',
    condition: 'Lower Back Pain', slot: '10:30 AM', status: 'waiting',
    priority: 'high', token: 'T-04', lastVisit: 'Apr 21',
    phone: '+91 90000 88429', nextStep: 'Pain intake',
  },
  {
    id: 105, name: 'Vikram Rao', age: 62, gender: 'M',
    condition: 'Hip Replacement Rehab', slot: '11:00 AM', status: 'waiting',
    priority: 'medium', token: 'T-05', lastVisit: 'Apr 19',
    phone: '+91 90000 77204', nextStep: 'Mobility check',
  },
  {
    id: 106, name: 'Fatima Khan', age: 31, gender: 'F',
    condition: 'Ankle Sprain', slot: '11:30 AM', status: 'in-progress',
    priority: 'low', token: 'T-06', lastVisit: 'Apr 25',
    phone: '+91 90000 31948', nextStep: 'Balance review',
  },
  {
    id: 107, name: 'Ajay Nair', age: 50, gender: 'M',
    condition: 'Frozen Shoulder', slot: '12:00 PM', status: 'waiting',
    priority: 'medium', token: 'T-07', lastVisit: 'Apr 18',
    phone: '+91 90000 55133', nextStep: 'Heat prep',
  },
  {
    id: 108, name: 'Neha Iyer', age: 42, gender: 'F',
    condition: 'Cervical Spondylosis', slot: '12:30 PM', status: 'done',
    priority: 'low', token: 'T-08', lastVisit: 'Apr 26',
    phone: '+91 90000 22471', nextStep: 'Discharge notes',
  },
];

const statusConfig: Record<PatientStatus, { label: string; color: string; bg: string; dot: string }> = {
  waiting: { label: 'Waiting', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', dot: 'bg-amber-400' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', dot: 'bg-blue-500' },
  done: { label: 'Completed', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-400' },
};

const priorityConfig: Record<PatientPriority, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  medium: { label: 'Medium', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  low: { label: 'Low', color: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
};

const avatarPalette = [
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40', color: 'text-cyan-800 dark:text-cyan-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/40', color: 'text-teal-800 dark:text-teal-300' },
  { bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-800 dark:text-red-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/40', color: 'text-blue-800 dark:text-blue-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-800 dark:text-violet-300' },
];

const intakeChecklist = [
  { label: 'Vitals captured', done: true },
  { label: 'Pain scale noted', done: true },
  { label: 'Consent verified', done: false },
  { label: 'Exercise history updated', done: false },
];

const priorityAlerts = [
  '2 patients need vitals refresh',
  '1 high priority intake pending',
  'Next slot starts in 18 minutes',
];

const getInitials = (name: string) =>
  name.split(' ').map((part) => part[0]).join('');

export function NursePatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PatientPriority>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handlePatientClick = (patientId: string | number) => {
    const id = String(patientId);
    if (isDesktop) {
      setSelectedPatientId(id);
    } else {
      navigate(`/nurse/patient/${id}/treatment`);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Nurse';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = {
    total: patients.length,
    waiting: patients.filter((p) => p.status === 'waiting').length,
    active: patients.filter((p) => p.status === 'in-progress').length,
    highPriority: patients.filter((p) => p.priority === 'high').length,
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return patients.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.condition.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
        {/* Header */}
        <div
          className="px-6 pt-8 pb-12 relative overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg, #0d2b27, #0f766e)' }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-teal-100/80 mb-1 uppercase tracking-wider">Nurse Station</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  Patient registry for {firstName}
                </h1>
                <p className="text-sm text-teal-100 mt-1 font-medium">
                  {today} · Unit B intake dashboard
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button className="relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-red-400">
                    2
                  </span>
                </button>
                <button
                  onClick={() => navigate('/nurse/profile')}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm shadow-sm"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Total patients', value: stats.total, color: 'text-teal-300' },
                { label: 'Waiting', value: stats.waiting, color: 'text-amber-300' },
                { label: 'Active', value: stats.active, color: 'text-blue-300' },
                { label: 'High priority', value: stats.highPriority, color: 'text-red-300' },
              ].map((s) => (
                <div key={s.label} className="py-3 px-4 rounded-2xl bg-white/10 border border-white/10 text-center">
                  <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
                  <p className="text-[10px] text-white/65 font-bold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 max-w-5xl mx-auto w-full -mt-6 relative z-10">
          {/* Start new intake CTA */}
          <div className="mb-5">
            <button
              onClick={() => navigate('/nurse/intake')}
              className="flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg shadow-teal-600/20 group w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: 'white', fontWeight: 700 }}
            >
              <div className="flex items-center justify-center rounded-xl bg-white/20 w-8 h-8">
                <Plus className="w-4 h-4" />
              </div>
              Start new intake
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-5 pb-6">
            {/* LEFT: Search + Filters + List */}
            <div className="flex flex-col gap-4">
              {/* Search & Status filters */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search patients or conditions"
                    className="flex-1 outline-none bg-transparent py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-2">
                  {([
                    { key: 'all', label: 'All' },
                    { key: 'waiting', label: 'Waiting' },
                    { key: 'in-progress', label: 'Active' },
                    { key: 'done', label: 'Done' },
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
                <div className="flex gap-2">
                  {([
                    { key: 'all', label: 'All priorities' },
                    { key: 'high', label: 'High priority' },
                    { key: 'medium', label: 'Medium priority' },
                    { key: 'low', label: 'Low priority' },
                  ] as const).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setPriorityFilter(item.key)}
                      className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold border transition-colors ${
                        priorityFilter === item.key
                          ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List heading */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Patient list</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{filtered.length} results</p>
              </div>

              {/* Patient cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filtered.map((patient, index) => {
                  const status = statusConfig[patient.status];
                  const priority = priorityConfig[patient.priority];
                  const avatar = avatarPalette[index % avatarPalette.length];
                  const actionLabel = patient.status === 'done'
                    ? 'Review notes'
                    : patient.status === 'in-progress'
                      ? 'Continue intake'
                      : 'Start intake';

                  return (
                    <div
                      key={patient.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 cursor-pointer hover:ring-2 hover:ring-teal-400/40 dark:hover:ring-teal-500/40 transition-all"
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
                                {patient.condition} · {patient.age} yrs · {patient.gender}
                              </p>
                            </div>
                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${status.bg} ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-300 text-[11px] font-bold">
                              Slot {patient.slot}
                            </span>
                            <span className="rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                              Token {patient.token}
                            </span>
                            <span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${priority.bg} ${priority.color}`}>
                              {priority.label} priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">Next step</p>
                          <p className="text-xs text-slate-900 dark:text-white font-bold">{patient.nextStep}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <CalendarClock className="w-3 h-3" />
                          Last visit {patient.lastVisit}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/nurse/intake'); }}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-colors ${
                            patient.status === 'done'
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                              : 'text-white hover:opacity-90'
                          }`}
                          style={patient.status !== 'done' ? { background: 'linear-gradient(135deg, #0f766e, #14b8a6)' } : {}}
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

              {filtered.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 text-center">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">No patients found</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Try adjusting your search, status, or priority filters.</p>
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
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Intake focus</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex flex-col gap-2">
                  {priorityAlerts.map((alert, index) => (
                    <div
                      key={alert}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                        index === 1
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-slate-800 dark:text-amber-100'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${index === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400'}`} />
                      {alert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Intake checklist */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Intake checklist</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Make sure to log</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="flex flex-col gap-2">
                  {intakeChecklist.map((item) => (
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
                  <button className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Call front desk
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Schedule follow ups
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
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
    </div>
  );
}
