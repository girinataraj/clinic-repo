import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import {
  Calendar, FileText, Activity, Bell, ChevronRight,
  Clock, CheckCircle, Dumbbell, TrendingUp, User,
  Zap, Heart,
} from 'lucide-react';

const upcomingAppointments = [
  {
    id: 1, doctor: 'Dr. Rajesh Kumar', specialization: 'Sports Physiotherapy',
    date: 'Tomorrow', time: '10:00 AM', status: 'confirmed',
    initials: 'RK', color: '#2563eb', bg: '#eff6ff',
  },
  {
    id: 2, doctor: 'Dr. Priya Nair', specialization: 'Orthopedic Rehab',
    date: 'May 3', time: '2:30 PM', status: 'pending',
    initials: 'PN', color: '#7c3aed', bg: '#f5f3ff',
  },
];

const reports = [
  { id: 1, title: 'Knee Assessment Report', date: 'Jan 20, 2025', type: 'Assessment', color: '#2563eb', bg: '#eff6ff' },
  { id: 2, title: 'Back Pain Evaluation', date: 'Dec 15, 2024', type: 'Evaluation', color: '#7c3aed', bg: '#f5f3ff' },
  { id: 3, title: 'Post-op Rehab Plan', date: 'Nov 28, 2024', type: 'Treatment', color: '#0f766e', bg: '#f0fdfa' },
];

const exercises = [
  { id: 1, name: 'Quad Stretch', reps: '3 × 15', done: true },
  { id: 2, name: 'Hip Bridges', reps: '3 × 12', done: true },
  { id: 3, name: 'Calf Raises', reps: '2 × 20', done: false },
];

const quickActions = [
  { label: 'Exercises', icon: Dumbbell, path: '/patient/exercise', color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Records', icon: FileText, path: '/patient/records', color: '#0f766e', bg: '#f0fdfa' },
  { label: 'Profile', icon: User, path: '/patient/profile', color: '#f97316', bg: '#fff7ed' },
];

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col h-full" style={{ background: '#f0f4ff' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Gradient Header */}
        <div
          className="px-5 pb-10 relative overflow-hidden shrink-0"
          style={{
            background: 'linear-gradient(150deg, #0f172a 0%, #1e3a8a 45%, #2563eb 80%, #38bdf8 100%)',
            paddingTop: '20px',
          }}
        >
          <div className="absolute -right-10 -top-10 rounded-full opacity-10"
            style={{ width: '120px', height: '120px', background: 'white' }} />
          <div className="absolute right-8 top-16 rounded-full opacity-10"
            style={{ width: '60px', height: '60px', background: '#7c3aed' }} />

          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{today}</p>
                <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginTop: '2px', letterSpacing: '-0.5px' }}>
                  Hi, {firstName}! 👋
                </h1>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '1px' }}>
                  Your recovery is on track
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    className="flex items-center justify-center rounded-2xl"
                    style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <Bell size={19} color="white" />
                  </button>
                  <div className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                    style={{ width: '16px', height: '16px', background: '#ef4444', fontSize: '9px', color: 'white', fontWeight: 800 }}>
                    3
                  </div>
                </div>
                <button
                  onClick={() => navigate('/patient/profile')}
                  className="flex items-center justify-center rounded-2xl overflow-hidden"
                  style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <User size={19} color="white" />
                </button>
              </div>
            </div>

            {/* Recovery progress card */}
            <div
              className="p-4 rounded-2xl mb-5"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart size={15} color="#f87171" fill="#f87171" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Recovery Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={13} color="#4ade80" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>Week 6 of 12</span>
                </div>
              </div>
              <div className="rounded-full mb-2" style={{ height: '8px', background: 'rgba(255,255,255,0.2)' }}>
                <div className="rounded-full h-full" style={{ width: '50%', background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>50% · Steady improvement noted by Dr. Rajesh</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-2">
              {[
                { label: 'Appointments', value: '2', icon: Calendar, color: '#93c5fd' },
                { label: 'Reports', value: '5', icon: FileText, color: '#6ee7b7' },
                { label: 'Exercises', value: '3', icon: Activity, color: '#fcd34d' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex-1 flex flex-col items-center py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Icon size={17} color={stat.color} strokeWidth={2.5} />
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'white', lineHeight: 1.2, marginTop: '3px' }}>
                      {stat.value}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2 max-w-5xl mx-auto w-full" style={{ marginTop: '-16px' }}>
          {/* Quick Actions */}
          <div className="flex gap-3 mb-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex-1 flex flex-col items-center py-3 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, #ffffff 0%, ${action.bg} 100%)`,
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div className="flex items-center justify-center rounded-xl mb-1.5"
                    style={{ width: '40px', height: '40px', background: action.bg }}>
                    <Icon size={18} color={action.color} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 max-w-5xl mx-auto w-full">
          {/* Book Appointment CTA */}
          <button
            onClick={() => navigate('/patient/appointment')}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 10px 28px rgba(16,185,129,0.35)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl flex items-center justify-center"
                style={{ width: '46px', height: '46px', background: 'rgba(255,255,255,0.2)' }}>
                <Calendar size={22} color="white" />
              </div>
              <div className="text-left">
                <p style={{ fontSize: '16px', fontWeight: 900, color: 'white', letterSpacing: '-0.2px' }}>Book Appointment</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Find & schedule a specialist</p>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-xl"
              style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.2)' }}>
              <ChevronRight size={18} color="white" strokeWidth={2.5} />
            </div>
          </button>

          {/* Two-column layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT column */}
            <div className="flex flex-col gap-4">
              {/* Upcoming Appointments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Upcoming Appointments</h3>
                  <button style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>See All</button>
                </div>
                <div className="flex flex-col gap-3">
                  {upcomingAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: `1px solid ${appt.status === 'confirmed' ? '#dcfce7' : '#f1f5f9'}` }}
                    >
                      <div className="flex items-center justify-center rounded-2xl shrink-0"
                        style={{ width: '48px', height: '48px', background: appt.bg }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: appt.color }}>{appt.initials}</span>
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{appt.doctor}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>{appt.specialization}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: '#f8fafc' }}>
                            <Calendar size={10} color="#64748b" />
                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>{appt.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: '#f8fafc' }}>
                            <Clock size={10} color="#64748b" />
                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>{appt.time}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-2.5 py-1 rounded-full"
                        style={{
                          background: appt.status === 'confirmed' ? '#ecfdf5' : '#fefce8',
                          color: appt.status === 'confirmed' ? '#059669' : '#d97706',
                          fontSize: '10px', fontWeight: 800,
                        }}
                      >
                        {appt.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reports */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Recent Reports</h3>
                  <button style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>See All</button>
                </div>
                <div className="flex flex-col gap-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center gap-3 p-3.5 rounded-2xl"
                      style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}
                    >
                      <div className="flex items-center justify-center rounded-xl shrink-0"
                        style={{ width: '42px', height: '42px', background: report.bg }}>
                        <FileText size={18} color={report.color} />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{report.title}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>{report.date}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl" style={{ background: report.bg, color: report.color, fontSize: '10px', fontWeight: 800 }}>
                        {report.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT column */}
            <div className="flex flex-col gap-4">
              {/* Exercise Plan */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Today's Exercises</h3>
                  <button
                    onClick={() => navigate('/patient/exercise')}
                    style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}
                  >
                    View Plan
                  </button>
                </div>
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center rounded-xl"
                        style={{ width: '34px', height: '34px', background: '#f5f3ff' }}>
                        <Dumbbell size={17} color="#7c3aed" />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Active Recovery Plan</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>Knee rehabilitation · Week 6</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: '#ecfdf5' }}>
                      <Zap size={11} color="#10b981" fill="#10b981" />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>2/3</span>
                    </div>
                  </div>
                  <div className="rounded-full mb-4" style={{ height: '6px', background: '#f1f5f9' }}>
                    <div className="rounded-full h-full" style={{ width: '67%', background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }} />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {exercises.map((ex) => (
                      <div key={ex.id} className="flex items-center gap-3">
                        <div
                          className="rounded-full flex items-center justify-center shrink-0"
                          style={{
                            width: '24px', height: '24px',
                            background: ex.done ? '#ecfdf5' : 'white',
                            border: `2px solid ${ex.done ? '#10b981' : '#e2e8f0'}`,
                          }}
                        >
                          {ex.done && <CheckCircle size={14} color="#10b981" />}
                        </div>
                        <span style={{ fontSize: '13px', color: ex.done ? '#94a3b8' : '#0f172a', fontWeight: ex.done ? 500 : 700, textDecoration: ex.done ? 'line-through' : 'none', flex: 1 }}>
                          {ex.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg" style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', fontWeight: 600 }}>
                          {ex.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Health tip card */}
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', border: '1px solid #c7d2fe' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={16} color="#2563eb" fill="#2563eb" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>DAILY TIP</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', lineHeight: 1.6 }}>
                  Stay consistent with your exercise plan. Even on low-energy days, light movement accelerates recovery significantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
