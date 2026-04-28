import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import {
  Search, Bell, Eye, Edit3, FileText, CheckCircle,
  Users, ChevronRight, Dumbbell, Calendar, User,
  TrendingUp, Zap,
} from 'lucide-react';

const patients = [
  { id: 1, name: 'Rahul Verma', age: 45, condition: 'Knee Injury (ACL)', time: '09:00 AM', status: 'in-session', bp: '120/80', pain: 6, initials: 'RV' },
  { id: 2, name: 'Anita Patel', age: 28, condition: 'Rotator Cuff Tear', time: '09:30 AM', status: 'waiting', bp: '118/75', pain: 4, initials: 'AP' },
  { id: 3, name: 'Suresh Kumar', age: 55, condition: 'Post-Stroke Rehab', time: '10:00 AM', status: 'completed', bp: '130/88', pain: 3, initials: 'SK' },
  { id: 4, name: 'Meera Joshi', age: 38, condition: 'L4-L5 Disc Herniation', time: '10:30 AM', status: 'waiting', bp: '122/82', pain: 7, initials: 'MJ' },
  { id: 5, name: 'Vikram Rao', age: 62, condition: 'Hip Replacement Rehab', time: '11:00 AM', status: 'completed', bp: '135/90', pain: 2, initials: 'VR' },
];

const statusConfig = {
  waiting: { label: 'Waiting', color: '#d97706', bg: '#fefce8', dot: '#f59e0b', border: '#fde68a' },
  'in-session': { label: 'In Session', color: '#2563eb', bg: '#eff6ff', dot: '#2563eb', border: '#bfdbfe' },
  completed: { label: 'Completed', color: '#059669', bg: '#ecfdf5', dot: '#10b981', border: '#a7f3d0' },
};

const painColors: Record<number, string> = {
  1: '#22c55e', 2: '#22c55e', 3: '#84cc16', 4: '#facc15',
  5: '#fb923c', 6: '#f97316', 7: '#ef4444', 8: '#dc2626', 9: '#b91c1c', 10: '#7f1d1d',
};

const avatarBgs = ['#eff6ff', '#f5f3ff', '#fdf4ff', '#ecfdf5', '#fff7ed'];
const avatarColorsList = ['#2563eb', '#7c3aed', '#9333ea', '#059669', '#ea580c'];

export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const firstName = (user?.name || 'Dr. Rajesh Kumar').replace('Dr. ', '');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || p.status === activeTab;
    return matchSearch && matchTab;
  });

  const waiting = patients.filter((p) => p.status === 'waiting').length;
  const inSession = patients.filter((p) => p.status === 'in-session').length;
  const completed = patients.filter((p) => p.status === 'completed').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#f5f3ff' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="px-5 pb-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(150deg, #0d0b25 0%, #1e1b4b 40%, #4338ca 75%, #6366f1 100%)',
            paddingTop: '20px',
          }}
        >
          <div className="absolute -right-10 -top-10 rounded-full opacity-10"
            style={{ width: '130px', height: '130px', background: 'white' }} />
          <div className="absolute right-14 top-16 rounded-full opacity-10"
            style={{ width: '60px', height: '60px', background: '#818cf8' }} />

          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{today}</p>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginTop: '2px', letterSpacing: '-0.4px' }}>
                  Dr. {firstName.split(' ')[0]} 👋
                </h1>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>
                  Sports Physiotherapist · SAAI Clinic
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
                    4
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/profile')}
                  className="flex items-center justify-center rounded-2xl"
                  style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <User size={19} color="white" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              {[
                { label: "Today's Pts", value: patients.length, icon: Users, color: '#a5b4fc' },
                { label: 'In Session', value: inSession, icon: Zap, color: '#60a5fa' },
                { label: 'Completed', value: completed, icon: CheckCircle, color: '#6ee7b7' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex-1 flex flex-col items-center py-3.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Icon size={16} color={s.color} />
                    <span style={{ fontSize: '24px', fontWeight: 900, color: 'white', lineHeight: 1.2, marginTop: '3px' }}>{s.value}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textAlign: 'center' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 max-w-6xl mx-auto w-full" style={{ marginTop: '-16px' }}>
          {/* Quick Actions */}
          <div className="flex gap-3 mt-[30px] mb-[16px]">
            <button
              onClick={() => navigate('/doctor/exercise')}
              className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-4"
              style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <div className="rounded-2xl flex items-center justify-center shrink-0"
                style={{ width: '42px', height: '42px', background: '#f5f3ff' }}>
                <Dumbbell size={20} color="#7c3aed" />
              </div>
              <div className="text-left flex-1">
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Exercise Rx</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Prescribe plan</p>
              </div>
              <ChevronRight size={12} color="#cbd5e1" />
            </button>
            <button
              onClick={() => navigate('/doctor/report')}
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <div className="rounded-2xl flex items-center justify-center shrink-0"
                style={{ width: '42px', height: '42px', background: '#eff6ff' }}>
                <FileText size={20} color="#2563eb" />
              </div>
              <div className="text-left flex-1">
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Reports</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Generate PDF</p>
              </div>
              <ChevronRight size={12} color="#cbd5e1" />
            </button>
            <button
              onClick={() => navigate('/doctor/profile')}
              className="hidden md:flex flex-1 items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
            >
              <div className="rounded-2xl flex items-center justify-center shrink-0"
                style={{ width: '42px', height: '42px', background: '#eef2ff' }}>
                <Calendar size={20} color="#4338ca" />
              </div>
              <div className="text-left flex-1">
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Schedule</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>View today</p>
              </div>
              <ChevronRight size={12} color="#cbd5e1" />
            </button>
          </div>

          {/* Recovery insight banner */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe' }}
          >
            <div className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '42px', height: '42px', background: '#4338ca' }}>
              <TrendingUp size={20} color="white" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#4338ca', fontWeight: 700 }}>TODAY'S INSIGHT</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>3 patients showing good recovery progress</p>
            </div>
            <ChevronRight size={16} color="#4338ca" />
          </div>

          {/* Search + Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div
              className="flex items-center gap-2 px-4"
              style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <Search size={17} color="#94a3b8" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients or conditions..."
                className="flex-1 outline-none bg-transparent"
                style={{ padding: '12px 0', fontSize: '13px', color: '#1e293b' }}
              />
            </div>

            <div className="flex gap-2">
              {[
                { key: 'all', label: `All (${patients.length})` },
                { key: 'waiting', label: `Wait (${waiting})` },
                { key: 'in-session', label: 'Active' },
                { key: 'completed', label: 'Done' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-2 rounded-xl"
                  style={{
                    fontSize: '11px', fontWeight: 700,
                    background: activeTab === tab.key ? '#4338ca' : 'white',
                    color: activeTab === tab.key ? 'white' : '#64748b',
                    border: `1.5px solid ${activeTab === tab.key ? '#4338ca' : '#e2e8f0'}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Patient Queue</h3>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{filtered.length} patients</span>
          </div>

          {/* Patient Cards — 2-column grid on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((patient, index) => {
              const config = statusConfig[patient.status as keyof typeof statusConfig];
              const painColor = painColors[patient.pain] || '#94a3b8';
              const avatarBg = avatarBgs[index % avatarBgs.length];
              const avatarColor = avatarColorsList[index % avatarColorsList.length];
              return (
                <div
                  key={patient.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'white',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                    border: `1px solid ${patient.status === 'in-session' ? '#bfdbfe' : '#f1f5f9'}`,
                  }}
                >
                  {/* Patient header */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="rounded-2xl flex items-center justify-center shrink-0 relative"
                      style={{ width: '48px', height: '48px', background: avatarBg }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: avatarColor }}>{patient.initials}</span>
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 rounded-full"
                          style={{ width: '12px', height: '12px', background: '#2563eb', border: '2px solid white' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{patient.name}</p>
                        <span className="px-2.5 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: config.bg, color: config.color, fontSize: '10px', fontWeight: 700 }}>
                          <div className="rounded-full" style={{ width: '5px', height: '5px', background: config.dot }} />
                          {config.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{patient.condition} · {patient.age} yrs</p>
                    </div>
                  </div>

                  {/* Vitals row */}
                  <div className="flex gap-2 px-4 pb-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '12px' }}>💓</span>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>BP</p>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>{patient.bp}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '12px' }}>⏰</span>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Slot</p>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>{patient.time}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: `${painColor}10`, border: `1px solid ${painColor}25` }}>
                      <span style={{ fontSize: '12px' }}>🔴</span>
                      <div>
                        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Pain</p>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: painColor }}>{patient.pain}/10</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '1px solid #f8fafc' }}>
                    <div className="flex gap-0">
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3"
                        style={{
                          color: '#2563eb', fontSize: '12px', fontWeight: 700,
                          borderRight: '1px solid #f8fafc', background: '#f8fbff',
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3"
                        style={{
                          color: '#7c3aed', fontSize: '12px', fontWeight: 700,
                          borderRight: '1px solid #f8fafc', background: '#fdfbff',
                        }}
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate('/doctor/report')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3"
                        style={{ color: '#059669', fontSize: '12px', fontWeight: 700, background: '#f8fffe' }}
                      >
                        <FileText size={14} />
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-10">
              <div className="flex items-center justify-center rounded-2xl mb-3"
                style={{ width: '56px', height: '56px', background: '#eef2ff' }}>
                <Users size={24} color="#4338ca" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>No patients found</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
