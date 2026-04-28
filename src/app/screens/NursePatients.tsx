import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  Phone,
  Plus,
  Search,
  ShieldCheck,
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
    id: 101,
    name: 'Rahul Verma',
    age: 45,
    gender: 'M',
    condition: 'ACL Knee Rehab',
    slot: '09:00 AM',
    status: 'waiting',
    priority: 'high',
    token: 'T-01',
    lastVisit: 'Apr 22',
    phone: '+91 90000 21034',
    nextStep: 'Gait training',
  },
  {
    id: 102,
    name: 'Anita Patel',
    age: 28,
    gender: 'F',
    condition: 'Shoulder Impingement',
    slot: '09:30 AM',
    status: 'in-progress',
    priority: 'medium',
    token: 'T-02',
    lastVisit: 'Apr 24',
    phone: '+91 90000 44218',
    nextStep: 'ROM assessment',
  },
  {
    id: 103,
    name: 'Suresh Kumar',
    age: 55,
    gender: 'M',
    condition: 'Post Stroke Rehab',
    slot: '10:00 AM',
    status: 'done',
    priority: 'low',
    token: 'T-03',
    lastVisit: 'Apr 26',
    phone: '+91 90000 11357',
    nextStep: 'Vitals update',
  },
  {
    id: 104,
    name: 'Meera Joshi',
    age: 38,
    gender: 'F',
    condition: 'Lower Back Pain',
    slot: '10:30 AM',
    status: 'waiting',
    priority: 'high',
    token: 'T-04',
    lastVisit: 'Apr 21',
    phone: '+91 90000 88429',
    nextStep: 'Pain intake',
  },
  {
    id: 105,
    name: 'Vikram Rao',
    age: 62,
    gender: 'M',
    condition: 'Hip Replacement Rehab',
    slot: '11:00 AM',
    status: 'waiting',
    priority: 'medium',
    token: 'T-05',
    lastVisit: 'Apr 19',
    phone: '+91 90000 77204',
    nextStep: 'Mobility check',
  },
  {
    id: 106,
    name: 'Fatima Khan',
    age: 31,
    gender: 'F',
    condition: 'Ankle Sprain',
    slot: '11:30 AM',
    status: 'in-progress',
    priority: 'low',
    token: 'T-06',
    lastVisit: 'Apr 25',
    phone: '+91 90000 31948',
    nextStep: 'Balance review',
  },
  {
    id: 107,
    name: 'Ajay Nair',
    age: 50,
    gender: 'M',
    condition: 'Frozen Shoulder',
    slot: '12:00 PM',
    status: 'waiting',
    priority: 'medium',
    token: 'T-07',
    lastVisit: 'Apr 18',
    phone: '+91 90000 55133',
    nextStep: 'Heat prep',
  },
  {
    id: 108,
    name: 'Neha Iyer',
    age: 42,
    gender: 'F',
    condition: 'Cervical Spondylosis',
    slot: '12:30 PM',
    status: 'done',
    priority: 'low',
    token: 'T-08',
    lastVisit: 'Apr 26',
    phone: '+91 90000 22471',
    nextStep: 'Discharge notes',
  },
];

const statusConfig: Record<PatientStatus, { label: string; color: string; bg: string; border: string; dot: string }>
  = {
    waiting: {
      label: 'Waiting',
      color: '#b45309',
      bg: '#fef9c3',
      border: '#fde68a',
      dot: '#f59e0b',
    },
    'in-progress': {
      label: 'In Progress',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      dot: '#2563eb',
    },
    done: {
      label: 'Completed',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      dot: '#10b981',
    },
  };

const priorityConfig: Record<PatientPriority, { label: string; color: string; bg: string }>
  = {
    high: { label: 'High', color: '#b91c1c', bg: '#fee2e2' },
    medium: { label: 'Medium', color: '#a16207', bg: '#fef3c7' },
    low: { label: 'Low', color: '#0f766e', bg: '#ccfbf1' },
  };

const avatarPalette = [
  { bg: '#ecfeff', color: '#0e7490' },
  { bg: '#f0fdfa', color: '#0f766e' },
  { bg: '#fef2f2', color: '#b91c1c' },
  { bg: '#eff6ff', color: '#1d4ed8' },
  { bg: '#f5f3ff', color: '#7c3aed' },
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
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

export function NursePatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PatientPriority>('all');

  const firstName = user?.name?.split(' ')[0] || 'Nurse';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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
    <div className="flex flex-col h-full saai-page">
      <div className="flex-1 overflow-y-auto">
        <div className="relative overflow-hidden">
          <div
            className="absolute -right-16 -top-12 rounded-full opacity-20"
            style={{ width: '180px', height: '180px', background: '#ccfbf1' }}
          />
          <div
            className="absolute left-12 top-16 rounded-full opacity-20"
            style={{ width: '90px', height: '90px', background: '#99f6e4' }}
          />

          <div className="max-w-6xl mx-auto px-5 pt-6 pb-10 saai-fade-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="saai-kicker">Nurse Station</p>
                <h1
                  className="display-font"
                  style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}
                >
                  Patient registry for {firstName}
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                  {today} - Unit B intake dashboard
                </p>
              </div>
              <button
                onClick={() => navigate('/nurse/intake')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 10px 24px rgba(15, 118, 110, 0.35)',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.2)' }}
                >
                  <Plus size={18} />
                </div>
                Start new intake
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Total patients', value: stats.total, icon: CalendarClock, color: '#0f766e' },
                { label: 'Waiting', value: stats.waiting, icon: Clock, color: '#b45309' },
                { label: 'Active', value: stats.active, icon: ClipboardList, color: '#2563eb' },
                { label: 'High priority', value: stats.highPriority, icon: AlertTriangle, color: '#b91c1c' },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="saai-panel rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={16} color={card.color} />
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{card.label}</p>
                    </div>
                    <p className="display-font" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                      {card.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8" style={{ marginTop: '-18px' }}>
          <div className="grid grid-cols-1 xl:grid-cols-[2fr,1fr] gap-4">
            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div
                    className="flex items-center gap-2 flex-1 rounded-2xl px-3"
                    style={{ background: 'white', border: '1px solid #e2e8f0' }}
                  >
                    <Search size={16} color="#94a3b8" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search patients or conditions"
                      className="flex-1 outline-none bg-transparent"
                      style={{ padding: '10px 0', fontSize: '13px', color: '#0f172a' }}
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
                        className="rounded-xl px-3 py-2"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: statusFilter === item.key ? '#0f766e' : '#f8fafc',
                          color: statusFilter === item.key ? 'white' : '#64748b',
                          border: `1px solid ${statusFilter === item.key ? '#0f766e' : '#e2e8f0'}`,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  {([
                    { key: 'all', label: 'All priorities' },
                    { key: 'high', label: 'High priority' },
                    { key: 'medium', label: 'Medium priority' },
                    { key: 'low', label: 'Low priority' },
                  ] as const).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setPriorityFilter(item.key)}
                      className="rounded-xl px-3 py-2 flex-1"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: priorityFilter === item.key ? '#0f172a' : 'white',
                        color: priorityFilter === item.key ? 'white' : '#64748b',
                        border: `1px solid ${priorityFilter === item.key ? '#0f172a' : '#e2e8f0'}`,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="display-font" style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Patient list
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  {filtered.length} results
                </p>
              </div>

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
                      className="saai-panel rounded-2xl p-4 saai-stagger"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center rounded-2xl shrink-0"
                          style={{ width: '48px', height: '48px', background: avatar.bg, color: avatar.color, fontWeight: 800 }}
                        >
                          {getInitials(patient.name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="display-font" style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                                {patient.name}
                              </p>
                              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                {patient.condition} · {patient.age} yrs · {patient.gender}
                              </p>
                            </div>
                            <span
                              className="flex items-center gap-1 rounded-full px-2 py-0.5"
                              style={{ background: status.bg, color: status.color, fontSize: '10px', fontWeight: 700 }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: status.dot }} />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span
                              className="rounded-lg px-2 py-1"
                              style={{ background: '#f8fafc', color: '#0f172a', fontSize: '11px', fontWeight: 700 }}
                            >
                              Slot {patient.slot}
                            </span>
                            <span
                              className="rounded-lg px-2 py-1"
                              style={{ background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: 600 }}
                            >
                              Token {patient.token}
                            </span>
                            <span
                              className="rounded-lg px-2 py-1"
                              style={{ background: priority.bg, color: priority.color, fontSize: '11px', fontWeight: 700 }}
                            >
                              {priority.label} priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Next step</p>
                          <p style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>{patient.nextStep}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                          <CalendarClock size={12} />
                          Last visit {patient.lastVisit}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate('/nurse/intake')}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2"
                          style={{
                            background: patient.status === 'done' ? '#f1f5f9' : 'linear-gradient(135deg, #0f766e, #14b8a6)',
                            color: patient.status === 'done' ? '#0f172a' : 'white',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <ClipboardList size={14} />
                          {actionLabel}
                        </button>
                        <button
                          className="flex items-center justify-center rounded-xl px-3"
                          style={{ border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px', fontWeight: 700 }}
                          aria-label={`Call ${patient.name} at ${patient.phone}`}
                          title={patient.phone}
                        >
                          <Phone size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="saai-panel rounded-2xl p-6 text-center">
                  <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    No patients found
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    Try adjusting your search, status, or priority filters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="saai-kicker">Shift snapshot</p>
                    <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                      Intake focus
                    </p>
                  </div>
                  <ShieldCheck size={18} color="#0f766e" />
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {priorityAlerts.map((alert, index) => (
                    <div
                      key={alert}
                      className="flex items-center gap-2 rounded-xl px-3 py-2"
                      style={{
                        background: index === 1 ? '#fef3c7' : '#f8fafc',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      <AlertTriangle size={14} color={index === 1 ? '#b45309' : '#0f766e'} />
                      {alert}
                    </div>
                  ))}
                </div>
              </div>

              <div className="saai-panel rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="saai-kicker">Intake checklist</p>
                    <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                      Make sure to log
                    </p>
                  </div>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {intakeChecklist.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-xl px-3 py-2"
                      style={{
                        background: item.done ? '#ecfdf5' : '#f8fafc',
                        border: `1px solid ${item.done ? '#a7f3d0' : '#e2e8f0'}`,
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{ width: '8px', height: '8px', background: item.done ? '#10b981' : '#94a3b8' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="saai-panel rounded-2xl p-4">
                <p className="saai-kicker">Contact hub</p>
                <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  Quick actions
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                  >
                    Call front desk
                    <Phone size={14} />
                  </button>
                  <button
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                  >
                    Schedule follow ups
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}
