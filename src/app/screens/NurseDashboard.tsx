import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import {
  Search,
  Bell,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  UserPlus,
  Users,
  User,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const patients = [
  { id: 1, name: 'Rahul Verma', age: 45, condition: 'Knee Injury', time: '09:00 AM', status: 'waiting', token: 'T-01', gender: 'M' },
  { id: 2, name: 'Anita Patel', age: 28, condition: 'Shoulder Pain', time: '09:30 AM', status: 'in-progress', token: 'T-02', gender: 'F' },
  { id: 3, name: 'Suresh Kumar', age: 55, condition: 'Post-Stroke Rehab', time: '10:00 AM', status: 'done', token: 'T-03', gender: 'M' },
  { id: 4, name: 'Meera Joshi', age: 38, condition: 'Lower Back Pain', time: '10:30 AM', status: 'waiting', token: 'T-04', gender: 'F' },
  { id: 5, name: 'Vikram Rao', age: 62, condition: 'Hip Replacement', time: '11:00 AM', status: 'waiting', token: 'T-05', gender: 'M' },
];

const statusConfig = {
  waiting: { label: 'Waiting', color: '#d97706', bg: '#fefce8', border: '#fde68a', dot: '#f59e0b', icon: Clock },
  'in-progress': { label: 'In Progress', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '#2563eb', icon: AlertCircle },
  done: { label: 'Done', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981', icon: CheckCircle },
};

const avatarColors: Record<string, { bg: string; color: string }> = {
  M: { bg: '#eff6ff', color: '#2563eb' },
  F: { bg: '#fdf4ff', color: '#9333ea' },
};

export function NurseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const firstName = user?.name?.split(' ')[0] || 'Nurse';

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inProgress = patients.filter((p) => p.status === 'in-progress').length;
  const done = patients.filter((p) => p.status === 'done').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#f0fdf9' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="px-5 pb-10 relative overflow-hidden shrink-0"
          style={{
            background: 'linear-gradient(150deg, #0d2b27 0%, #134e4a 40%, #0f766e 75%, #14b8a6 100%)',
            paddingTop: '20px',
          }}
        >
          <div className="absolute -right-10 -top-10 rounded-full opacity-10"
            style={{ width: '130px', height: '130px', background: 'white' }} />
          <div className="absolute right-14 top-16 rounded-full opacity-10"
            style={{ width: '60px', height: '60px', background: '#34d399' }} />

          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginTop: '2px', letterSpacing: '-0.4px' }}>
                Morning, {firstName}! 👋
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>
                Physiotherapy Unit B · Morning Shift
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="flex items-center justify-center rounded-2xl"
                  style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Bell size={19} color="white" />
                </button>
                <div className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                  style={{ width: '16px', height: '16px', background: '#ef4444', fontSize: '9px', color: 'white', fontWeight: 800 }}>
                  2
                </div>
              </div>
              <button
                onClick={() => navigate('/nurse/profile')}
                className="flex items-center justify-center rounded-2xl"
                style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <User size={19} color="white" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-2">
            {[
              { label: 'Waiting', value: waiting, color: '#fcd34d', bg: 'rgba(251,191,36,0.15)' },
              { label: 'In Progress', value: inProgress, color: '#93c5fd', bg: 'rgba(96,165,250,0.15)' },
              { label: 'Completed', value: done, color: '#6ee7b7', bg: 'rgba(52,211,153,0.15)' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 text-center py-3.5 rounded-2xl"
                style={{ background: s.bg, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p style={{ fontSize: '26px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginTop: '3px' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pt-4 pb-2 max-w-6xl mx-auto w-full" style={{ marginTop: '-16px' }}>
          {/* Quick Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => navigate('/nurse/intake')}
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #0f6a60 0%, #129685 55%, #1bb5a4 100%)',
                boxShadow: '0 10px 26px rgba(15, 118, 110, 0.28)',
              }}
            >
              <div className="rounded-2xl flex items-center justify-center shrink-0"
                style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.2)' }}>
                <UserPlus size={20} color="white" />
              </div>
              <div className="text-left flex-1">
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>New Intake</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Start patient form</p>
              </div>
              <div className="flex items-center justify-center rounded-xl"
                style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.2)' }}>
                <ChevronRight size={16} color="white" strokeWidth={2.5} />
              </div>
            </button>
            <button
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
                border: '1.5px solid #c7f3e8',
                boxShadow: '0 6px 16px rgba(15, 118, 110, 0.08)',
                minWidth: '100px',
              }}
            >
              <div className="rounded-2xl flex items-center justify-center shrink-0"
                style={{ width: '42px', height: '42px', background: '#e6fffa' }}>
                <Users size={20} color="#0f766e" />
              </div>
              <div className="text-left">
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>All</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Patients</p>
              </div>
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 max-w-6xl mx-auto w-full">
          {/* Quick stat chips */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <div className="rounded-full" style={{ width: '8px', height: '8px', background: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{waiting} waiting</span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <Zap size={13} color="#2563eb" fill="#2563eb" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{inProgress} active</span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <CheckCircle size={13} color="#10b981" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{done} done</span>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-4 mb-4"
            style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <Search size={17} color="#94a3b8" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients or conditions..."
              className="flex-1 outline-none bg-transparent"
              style={{ padding: '12px 0', fontSize: '14px', color: '#1e293b' }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { key: 'all', label: `All (${patients.length})` },
              { key: 'waiting', label: 'Waiting' },
              { key: 'in-progress', label: 'Active' },
              { key: 'done', label: 'Done' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex-1 py-2 rounded-xl"
                style={{
                  fontSize: '11px', fontWeight: 700,
                  background: filter === f.key ? '#0f766e' : 'white',
                  color: filter === f.key ? 'white' : '#64748b',
                  border: `1.5px solid ${filter === f.key ? '#0f766e' : '#e2e8f0'}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Section heading */}
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Patient Queue · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{filtered.length} shown</span>
          </div>

          {/* Patient list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((patient) => {
              const config = statusConfig[patient.status as keyof typeof statusConfig];
              const av = avatarColors[patient.gender];
              return (
                <div
                  key={patient.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'white',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                    border: `1px solid ${patient.status === 'in-progress' ? '#bfdbfe' : '#f1f5f9'}`,
                  }}
                >
                  <div className="flex items-center gap-3 p-4">
                    {/* Avatar */}
                    <div className="rounded-2xl flex items-center justify-center shrink-0 relative"
                      style={{ width: '48px', height: '48px', background: av.bg }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: av.color }}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                      {patient.status === 'in-progress' && (
                        <div className="absolute -top-1 -right-1 rounded-full"
                          style={{ width: '12px', height: '12px', background: '#2563eb', border: '2px solid white' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{patient.name}</p>
                        <span className="px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: config.bg, color: config.color, fontSize: '10px', fontWeight: 700 }}>
                          <div className="rounded-full" style={{ width: '5px', height: '5px', background: config.dot }} />
                          {config.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        {patient.condition} · Age {patient.age}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg" style={{ background: '#f8fafc' }}>
                          <Clock size={10} color="#94a3b8" />
                          <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>{patient.time}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg"
                          style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, background: '#f8fafc' }}>
                          {patient.token}
                        </span>
                      </div>
                    </div>
                  </div>
                  {patient.status !== 'done' && (
                    <div style={{ borderTop: '1px solid #f8fafc' }}>
                      <button
                        onClick={() => navigate('/nurse/intake')}
                        className="w-full flex items-center justify-center gap-2 py-3"
                        style={{
                          background: patient.status === 'in-progress'
                            ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                            : 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                          color: patient.status === 'in-progress' ? '#2563eb' : '#0f766e',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        <ClipboardList size={15} />
                        {patient.status === 'in-progress' ? 'Continue Intake Form' : 'Start Intake Form'}
                        <ChevronRight size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-10">
              <div className="flex items-center justify-center rounded-2xl mb-3"
                style={{ width: '56px', height: '56px', background: '#f0fdfa' }}>
                <Users size={24} color="#14b8a6" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>No patients found</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}