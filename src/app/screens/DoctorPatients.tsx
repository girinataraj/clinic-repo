import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { TreatmentDetailModal } from '../../features/patients/components/TreatmentDetailModal';
import {
  Activity,
  ChevronRight,
  FileText,
  Flame,
  HeartPulse,
  Search,
  Stethoscope,
  Users,
} from 'lucide-react';

type PatientStatus = 'waiting' | 'in-session' | 'completed';
type PatientPriority = 'high' | 'medium' | 'low';

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  slot: string;
  status: PatientStatus;
  priority: PatientPriority;
  pain: number;
  progress: number;
  plan: string;
  lastNote: string;
  bp: string;
}

const patients: Patient[] = [
  {
    id: 201,
    name: 'Anita Patel',
    age: 28,
    condition: 'Rotator Cuff Tear',
    slot: '09:30 AM',
    status: 'in-session',
    priority: 'high',
    pain: 4,
    progress: 62,
    plan: 'Isometrics and ROM',
    lastNote: 'ROM improving, mild swelling',
    bp: '118/75',
  },
  {
    id: 202,
    name: 'Rahul Verma',
    age: 45,
    condition: 'ACL Rehab',
    slot: '10:00 AM',
    status: 'waiting',
    priority: 'medium',
    pain: 6,
    progress: 48,
    plan: 'Strength and gait work',
    lastNote: 'Needs quad activation focus',
    bp: '120/80',
  },
  {
    id: 203,
    name: 'Suresh Kumar',
    age: 55,
    condition: 'Post Stroke Rehab',
    slot: '10:30 AM',
    status: 'completed',
    priority: 'low',
    pain: 2,
    progress: 74,
    plan: 'Balance drills',
    lastNote: 'Stable, improved confidence',
    bp: '130/88',
  },
  {
    id: 204,
    name: 'Meera Joshi',
    age: 38,
    condition: 'L4-L5 Disc Herniation',
    slot: '11:00 AM',
    status: 'waiting',
    priority: 'high',
    pain: 7,
    progress: 36,
    plan: 'Core activation',
    lastNote: 'Pain spikes on flexion',
    bp: '122/82',
  },
  {
    id: 205,
    name: 'Vikram Rao',
    age: 62,
    condition: 'Hip Replacement Rehab',
    slot: '11:30 AM',
    status: 'completed',
    priority: 'medium',
    pain: 3,
    progress: 69,
    plan: 'Stair training',
    lastNote: 'Improved gait symmetry',
    bp: '135/90',
  },
  {
    id: 206,
    name: 'Neha Iyer',
    age: 42,
    condition: 'Cervical Spondylosis',
    slot: '12:00 PM',
    status: 'in-session',
    priority: 'medium',
    pain: 5,
    progress: 58,
    plan: 'Mobility and traction',
    lastNote: 'Reduced stiffness',
    bp: '116/72',
  },
];

const statusConfig: Record<PatientStatus, { label: string; color: string; bg: string; dot: string }>
  = {
    waiting: { label: 'Waiting', color: '#2B7A78', bg: '#DEF2F1', dot: '#2B7A78' },
    'in-session': { label: 'In Session', color: '#17252A', bg: '#DEF2F1', dot: '#3AAFA9' },
    completed: { label: 'Completed', color: '#FEFFFF', bg: '#3AAFA9', dot: '#FEFFFF' },
  };

const priorityConfig: Record<PatientPriority, { label: string; color: string; bg: string }>
  = {
    high: { label: 'High', color: '#FEFFFF', bg: '#17252A' },
    medium: { label: 'Medium', color: '#17252A', bg: '#3AAFA9' },
    low: { label: 'Low', color: '#2B7A78', bg: '#DEF2F1' },
  };

const avatarPalette = [
  { bg: '#DEF2F1', color: '#2B7A78' },
  { bg: '#DEF2F1', color: '#2B7A78' },
  { bg: '#DEF2F1', color: '#2B7A78' },
  { bg: '#DEF2F1', color: '#2B7A78' },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

const getPainColor = (pain: number) => {
  if (pain <= 3) return '#3AAFA9';
  if (pain <= 6) return '#2B7A78';
  return '#17252A';
};

export function DoctorPatients() {
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
      navigate(`/doctor/patient/${id}/treatment`);
    }
  };

  const firstName = (user?.name || 'Dr. Rajesh Kumar').replace('Dr. ', '').split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const stats = {
    total: patients.length,
    active: patients.filter((p) => p.status === 'in-session').length,
    waiting: patients.filter((p) => p.status === 'waiting').length,
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
    <div className="flex flex-col h-full saai-page" style={{ backgroundColor: '#DEF2F1' }}>
      <div className="flex-1 overflow-y-auto">
        <div
          className="relative overflow-hidden rounded-b-3xl"
          style={{
            background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
            color: 'white',
            boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
          }}
        >

          <div className="max-w-6xl mx-auto px-5 pt-6 pb-10 saai-fade-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="saai-kicker" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Doctor Console
                </p>
                <h1
                  className="display-font"
                  style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginTop: '6px' }}
                >
                  Patient care board for Dr. {firstName}
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>
                  {today} - Sports physiotherapy
                </p>
              </div>
              <button
                onClick={() => navigate('/doctor/exercise')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(254,255,255,0.12)',
                  color: '#FEFFFF',
                  fontWeight: 700,
                  border: '1px solid rgba(254,255,255,0.2)',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: '34px', height: '34px', background: 'rgba(254,255,255,0.2)' }}
                >
                  <Stethoscope size={18} />
                </div>
                Create exercise plan
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Total patients', value: stats.total, icon: Users },
                { label: 'In session', value: stats.active, icon: Activity },
                { label: 'Waiting', value: stats.waiting, icon: HeartPulse },
                { label: 'High priority', value: stats.highPriority, icon: Flame },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(254,255,255,0.12)', border: '1px solid rgba(254,255,255,0.12)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} color="#DEF2F1" />
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(254,255,255,0.7)' }}>{card.label}</p>
                    </div>
                    <p className="display-font" style={{ fontSize: '24px', fontWeight: 700, color: '#FEFFFF', marginTop: '6px' }}>
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
              <div className="saai-panel rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div
                    className="flex items-center gap-2 flex-1 rounded-2xl px-3"
                    style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                  >
                    <Search size={16} color="#2B7A78" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search patients or conditions"
                      className="flex-1 outline-none bg-transparent"
                      style={{ padding: '10px 0', fontSize: '13px', color: '#17252A' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {([
                      { key: 'all', label: 'All' },
                      { key: 'waiting', label: 'Waiting' },
                      { key: 'in-session', label: 'In session' },
                      { key: 'completed', label: 'Completed' },
                    ] as const).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setStatusFilter(item.key)}
                        className="rounded-xl px-3 py-2 transition-all duration-200"
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          background: statusFilter === item.key ? '#3AAFA9' : '#FEFFFF',
                          color: statusFilter === item.key ? '#FEFFFF' : '#2B7A78',
                          border: `1px solid ${statusFilter === item.key ? '#3AAFA9' : '#DEF2F1'}`,
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
                        background: priorityFilter === item.key ? '#2B7A78' : '#FEFFFF',
                        color: priorityFilter === item.key ? '#FEFFFF' : '#2B7A78',
                        border: `1px solid ${priorityFilter === item.key ? '#2B7A78' : '#DEF2F1'}`,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="display-font" style={{ fontSize: '18px', fontWeight: 700, color: '#17252A' }}>
                  Patient list
                </h2>
                <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600 }}>
                  {filtered.length} results
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filtered.map((patient, index) => {
                  const status = statusConfig[patient.status];
                  const priority = priorityConfig[patient.priority];
                  const avatar = avatarPalette[index % avatarPalette.length];
                  const painColor = getPainColor(patient.pain);

                  return (
                    <div
                      key={patient.id}
                      className="saai-panel rounded-2xl p-4 saai-stagger cursor-pointer hover:ring-2 hover:ring-teal-400/40 transition-all"
                      style={{ animationDelay: `${index * 70}ms`, background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                      onClick={() => handlePatientClick(patient.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handlePatientClick(patient.id)}
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
                              <p className="display-font" style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>
                                {patient.name}
                              </p>
                              <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>
                                {patient.condition} · {patient.age} yrs
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
                              style={{ background: '#DEF2F1', color: '#17252A', fontSize: '11px', fontWeight: 700 }}
                            >
                              Slot {patient.slot}
                            </span>
                            <span
                              className="rounded-lg px-2 py-1"
                              style={{ background: priority.bg, color: priority.color, fontSize: '11px', fontWeight: 700 }}
                            >
                              {priority.label} priority
                            </span>
                            <span
                              className="rounded-lg px-2 py-1"
                              style={{ background: '#DEF2F1', color: '#2B7A78', fontSize: '11px', fontWeight: 600 }}
                            >
                              BP {patient.bp}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 700 }}>Recovery progress</p>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#17252A' }}>
                            {patient.progress}%
                          </span>
                        </div>
                        <div
                          className="mt-2 h-2 rounded-full"
                          style={{ background: '#DEF2F1' }}
                        >
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${patient.progress}%`, background: '#3AAFA9' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 700 }}>Plan focus</p>
                          <p style={{ fontSize: '12px', color: '#17252A', fontWeight: 700 }}>{patient.plan}</p>
                          <p style={{ fontSize: '11px', color: '#2B7A78', marginTop: '4px' }}>{patient.lastNote}</p>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: painColor }}>
                          <Flame size={16} />
                          <span style={{ fontSize: '12px', fontWeight: 700 }}>Pain {patient.pain}/10</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-colors"
                          style={{
                            background: '#DEF2F1',
                            color: '#2B7A78',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <FileText size={16} />
                          View chart
                        </button>
                        <button
                          onClick={() => navigate('/doctor/exercise')}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-shadow hover:shadow-md"
                          style={{
                            background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
                            color: '#FEFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <ChevronRight size={16} />
                          Write Rx
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="saai-panel rounded-2xl p-6 text-center" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                  <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>
                    No patients found
                  </p>
                  <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '6px' }}>
                    Try adjusting your search, status, or priority filters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="saai-panel rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <p className="saai-kicker" style={{ color: '#2B7A78' }}>Care insights</p>
                <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A', marginTop: '6px' }}>
                  Focus today
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    'Two patients need post session notes',
                    'High priority intake in the next hour',
                    'Review progress on gait training plans',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl px-3 py-2"
                      style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', fontSize: '12px', fontWeight: 600, color: '#17252A' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="saai-panel rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <p className="saai-kicker" style={{ color: '#2B7A78' }}>Vitals overview</p>
                <p className="display-font" style={{ fontSize: '16px', fontWeight: 700, color: '#17252A', marginTop: '6px' }}>
                  Session readiness
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    { label: 'Stable vitals', value: '5 patients', color: '#3AAFA9' },
                    { label: 'Needs review', value: '1 patient', color: '#2B7A78' },
                    { label: 'Pending notes', value: '2 patients', color: '#17252A' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>

      {/* Desktop Treatment Detail Modal */}
      {selectedPatientId && (
        <TreatmentDetailModal
          patientId={selectedPatientId}
          viewerRole={user?.role ?? 'doctor'}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
}
