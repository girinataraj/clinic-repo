import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import {
  Search, Bell, Eye, Edit3, FileText, CheckCircle,
  Users, ChevronRight, Dumbbell, Calendar, User,
  TrendingUp, Zap, Activity
} from 'lucide-react';

const patients = [
  { id: 1, name: 'Rahul Verma', age: 45, condition: 'Knee Injury (ACL)', time: '09:00 AM', status: 'in-session', bp: '120/80', pain: 6, initials: 'RV' },
  { id: 2, name: 'Anita Patel', age: 28, condition: 'Rotator Cuff Tear', time: '09:30 AM', status: 'waiting', bp: '118/75', pain: 4, initials: 'AP' },
  { id: 3, name: 'Suresh Kumar', age: 55, condition: 'Post-Stroke Rehab', time: '10:00 AM', status: 'completed', bp: '130/88', pain: 3, initials: 'SK' },
  { id: 4, name: 'Meera Joshi', age: 38, condition: 'L4-L5 Disc Herniation', time: '10:30 AM', status: 'waiting', bp: '122/82', pain: 7, initials: 'MJ' },
  { id: 5, name: 'Vikram Rao', age: 62, condition: 'Hip Replacement Rehab', time: '11:00 AM', status: 'completed', bp: '135/90', pain: 2, initials: 'VR' },
];

const statusConfig = {
  waiting: { label: 'Waiting', color: '#2B7A78', bg: '#DEF2F1', dot: '#2B7A78', border: '#DEF2F1' },
  'in-session': { label: 'In Session', color: '#17252A', bg: '#DEF2F1', dot: '#3AAFA9', border: '#DEF2F1' },
  completed: { label: 'Completed', color: '#FEFFFF', bg: '#3AAFA9', dot: '#FEFFFF', border: '#3AAFA9' },
};

const painColors: Record<number, string> = {
  1: '#3AAFA9', 2: '#3AAFA9', 3: '#3AAFA9', 4: '#2B7A78',
  5: '#2B7A78', 6: '#2B7A78', 7: '#17252A', 8: '#17252A', 9: '#17252A', 10: '#17252A',
};

const avatarBgs = ['#DEF2F1', '#DEF2F1', '#DEF2F1', '#DEF2F1', '#DEF2F1'];
const avatarColorsList = ['#2B7A78', '#2B7A78', '#2B7A78', '#2B7A78', '#2B7A78'];

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
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 pb-12 relative overflow-hidden rounded-b-3xl"
          style={{
            background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
            paddingTop: '32px',
            boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
          }}
        >
          <div className="absolute -right-16 -top-16 rounded-full opacity-10"
            style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          <div className="absolute right-10 top-20 rounded-full opacity-20"
            style={{ width: '80px', height: '80px', background: '#FEFFFF' }} />

          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p style={{ fontSize: '13px', color: '#FEFFFF', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {today}
                </p>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#FEFFFF', marginTop: '4px', letterSpacing: '-0.5px' }}>
                  Dr. {firstName.split(' ')[0]} 👋
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(254, 255, 255, 0.8)', marginTop: '2px', fontWeight: 400 }}>
                  Sports Physiotherapist · SAAI Clinic
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button className="flex items-center justify-center rounded-2xl transition-all duration-300"
                    style={{ width: '48px', height: '48px', background: 'rgba(254, 255, 255, 0.15)', border: '1px solid rgba(254, 255, 255, 0.2)' }}>
                    <Bell size={22} color="#FEFFFF" />
                  </button>
                  <div className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
                    style={{ width: '18px', height: '18px', background: '#17252A', fontSize: '10px', color: '#FEFFFF', fontWeight: 700, border: '2px solid #3AAFA9' }}>
                    4
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/profile')}
                  className="flex items-center justify-center rounded-2xl transition-all duration-300"
                  style={{ width: '48px', height: '48px', background: 'rgba(254, 255, 255, 0.15)', border: '1px solid rgba(254, 255, 255, 0.2)' }}>
                  <User size={22} color="#FEFFFF" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-6xl mx-auto w-full" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
          {/* Stats */}
          <div className="flex gap-4 mb-6">
            {[
              { label: "Today's Patients", value: patients.length, icon: Users },
              { label: 'In Session', value: inSession, icon: Zap },
              { label: 'Completed', value: completed, icon: CheckCircle },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex-1 rounded-2xl p-4 flex flex-col items-center justify-center transition-transform hover:-translate-y-1 duration-300"
                  style={{ background: '#FEFFFF', boxShadow: '0 8px 24px rgba(23, 37, 42, 0.08)', border: '1px solid #DEF2F1' }}>
                  <div className="rounded-xl flex items-center justify-center mb-2" style={{ width: '40px', height: '40px', background: '#DEF2F1' }}>
                    <Icon size={20} color="#3AAFA9" />
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#17252A', lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500, marginTop: '6px', textAlign: 'center' }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => navigate('/doctor/exercise')}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 group text-left"
              style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={{ width: '48px', height: '48px', background: '#DEF2F1' }}>
                <Dumbbell size={22} color="#3AAFA9" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#17252A' }}>Exercise Rx</p>
                <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>Prescribe plan</p>
              </div>
              <ChevronRight size={16} color="#3AAFA9" className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/doctor/report')}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 group text-left"
              style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={{ width: '48px', height: '48px', background: '#DEF2F1' }}>
                <FileText size={22} color="#3AAFA9" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#17252A' }}>Reports</p>
                <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>Generate PDF</p>
              </div>
              <ChevronRight size={16} color="#3AAFA9" className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/doctor/profile')}
              className="hidden md:flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 group text-left"
              style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={{ width: '48px', height: '48px', background: '#DEF2F1' }}>
                <Calendar size={22} color="#3AAFA9" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#17252A' }}>Schedule</p>
                <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>View today</p>
              </div>
              <ChevronRight size={16} color="#3AAFA9" className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Recovery insight banner */}
          <div
            className="flex items-center gap-4 p-5 rounded-2xl mb-8"
            style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}
          >
            <div className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: '48px', height: '48px', background: '#2B7A78', boxShadow: '0 4px 12px rgba(43,122,120,0.3)' }}>
              <Activity size={24} color="#FEFFFF" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#3AAFA9', fontWeight: 600, letterSpacing: '0.5px' }}>TODAY'S INSIGHT</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#17252A', marginTop: '2px' }}>3 patients showing excellent recovery progress</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
              <ChevronRight size={18} color="#2B7A78" />
            </div>
          </div>

          {/* Search + Tabs */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div
              className="flex items-center gap-3 px-4 flex-1 rounded-2xl"
              style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 2px 8px rgba(23,37,42,0.02)' }}
            >
              <Search size={18} color="#2B7A78" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients or conditions..."
                className="flex-1 outline-none bg-transparent"
                style={{ padding: '14px 0', fontSize: '14px', color: '#17252A' }}
              />
            </div>

            <div className="flex gap-2 p-1 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 2px 8px rgba(23,37,42,0.02)' }}>
              {[
                { key: 'all', label: `All (${patients.length})` },
                { key: 'waiting', label: `Wait (${waiting})` },
                { key: 'in-session', label: 'Active' },
                { key: 'completed', label: 'Done' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="px-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    fontSize: '13px', fontWeight: 600,
                    background: activeTab === tab.key ? '#2B7A78' : 'transparent',
                    color: activeTab === tab.key ? '#FEFFFF' : '#2B7A78',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#17252A' }}>Patient Queue</h3>
            <span className="px-3 py-1 rounded-full" style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600, background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
              {filtered.length} patients
            </span>
          </div>

          {/* Patient Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((patient, index) => {
              const config = statusConfig[patient.status as keyof typeof statusConfig];
              const painColor = painColors[patient.pain] || '#3AAFA9';
              const avatarBg = avatarBgs[index % avatarBgs.length];
              const avatarColor = avatarColorsList[index % avatarColorsList.length];
              return (
                <div
                  key={patient.id}
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: '#FEFFFF',
                    boxShadow: '0 4px 20px rgba(23, 37, 42, 0.04)',
                    border: `1px solid ${patient.status === 'in-session' ? '#3AAFA9' : '#DEF2F1'}`,
                  }}
                >
                  {/* Patient header */}
                  <div className="flex items-center gap-4 p-5 pb-4">
                    <div className="rounded-2xl flex items-center justify-center shrink-0 relative"
                      style={{ width: '56px', height: '56px', background: avatarBg }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: avatarColor }}>{patient.initials}</span>
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 rounded-full"
                          style={{ width: '14px', height: '14px', background: '#3AAFA9', border: '2px solid #FEFFFF' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>{patient.name}</p>
                          <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '2px' }}>{patient.condition} · {patient.age} yrs</p>
                        </div>
                        <span className="px-3 py-1 rounded-full flex items-center gap-1.5"
                          style={{ background: config.bg, color: config.color, fontSize: '12px', fontWeight: 600 }}>
                          <div className="rounded-full" style={{ width: '6px', height: '6px', background: config.dot }} />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals row */}
                  <div className="flex gap-3 px-5 pb-5">
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                        <span style={{ fontSize: '14px' }}>💓</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600, marginBottom: '2px' }}>BP</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{patient.bp}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                        <span style={{ fontSize: '14px' }}>⏰</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600, marginBottom: '2px' }}>Slot</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{patient.time}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                        <span style={{ fontSize: '14px' }}>🔴</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600, marginBottom: '2px' }}>Pain</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: painColor }}>{patient.pain}/10</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
                    <div className="flex divide-x divide-slate-100" style={{ borderTop: '1px solid #DEF2F1' }}>
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors"
                        style={{ color: '#2B7A78', fontSize: '13px', fontWeight: 600, borderRight: '1px solid #DEF2F1' }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors"
                        style={{ color: '#3AAFA9', fontSize: '13px', fontWeight: 600, borderRight: '1px solid #DEF2F1' }}
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => navigate('/doctor/report')}
                        className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors"
                        style={{ color: '#17252A', fontSize: '13px', fontWeight: 600 }}
                      >
                        <FileText size={16} />
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl shadow-sm mt-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
              <div className="flex items-center justify-center rounded-full mb-4"
                style={{ width: '72px', height: '72px', background: '#DEF2F1' }}>
                <Users size={32} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#17252A' }}>No patients found</p>
              <p style={{ fontSize: '14px', color: '#2B7A78', marginTop: '6px' }}>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
