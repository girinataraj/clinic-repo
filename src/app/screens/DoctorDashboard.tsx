import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { usePatients } from '../../hooks/usePatients';
import { ApiErrorBanner } from '../components/ApiErrorBanner';
import {
  Search, Bell, Eye, Edit3, FileText, CheckCircle, ClipboardList,
  Users, ChevronRight, Dumbbell, Calendar, User, UserPlus,
  TrendingUp, Zap, Activity
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  waiting:      { label: 'Waiting',     color: '#2B7A78', bg: '#DEF2F1', dot: '#2B7A78', border: '#DEF2F1' },
  'in-session': { label: 'In Session',  color: '#17252A', bg: '#DEF2F1', dot: '#3AAFA9', border: '#DEF2F1' },
  completed:    { label: 'Completed',   color: '#FEFFFF', bg: '#3AAFA9', dot: '#FEFFFF', border: '#3AAFA9' },
};

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('');

export function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ── Live data from backend ─────────────────────────────────────────────────
  const { data: patientsData, isLoading, isError } = usePatients({
    search: search.trim() || undefined,
    status: activeTab !== 'all' ? activeTab : undefined,
    limit: 20,
  }, true); // ← 10s polling for live patient queue

  const patients = patientsData?.data ?? [];

  const actualName = user?.name === 'Dr. Rajesh Kumar' ? 'Dr. SV. Sathish Kumar' : (user?.name || 'Doctor');
  const firstName = actualName.replace('Dr. ', '');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

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
          <div className="absolute -right-16 -top-16 rounded-full opacity-10 pointer-events-none"
            style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          <div className="absolute right-10 top-20 rounded-full opacity-20 pointer-events-none"
            style={{ width: '80px', height: '80px', background: '#FEFFFF' }} />

          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p style={{ fontSize: '13px', color: '#FEFFFF', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {today}
                </p>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#FEFFFF', marginTop: '4px', letterSpacing: '-0.5px' }}>
                  {actualName} 👋
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(254, 255, 255, 0.8)', marginTop: '2px', fontWeight: 400 }}>
                  Sports Physiotherapist · SAAI Clinic
                </p>
              </div>
              <div className="flex items-center gap-3 relative z-50">
                {/* Notification Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      if (window.innerWidth >= 768) {
                        navigate('/doctor/notifications');
                      } else {
                        setShowNotifications(!showNotifications);
                        setShowProfileMenu(false);
                      }
                    }}
                    className="flex items-center justify-center rounded-2xl transition-all duration-300 relative z-50"
                    style={{ width: '48px', height: '48px', background: 'rgba(254, 255, 255, 0.15)', border: '1px solid rgba(254, 255, 255, 0.2)' }}>
                    <Bell size={22} color="#FEFFFF" />
                  </button>
                  <div className="absolute -top-1 -right-1 rounded-full flex items-center justify-center pointer-events-none"
                    style={{ width: '18px', height: '18px', background: '#17252A', fontSize: '10px', color: '#FEFFFF', fontWeight: 700, border: '2px solid #3AAFA9' }}>
                    4
                  </div>
                  
                  {/* Only show notifications dropdown on mobile */}
                  {showNotifications && (
                    <div className="md:hidden absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden text-left">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                          <p className="text-xs font-semibold text-slate-800">New patient assigned</p>
                          <p className="text-[10px] text-slate-500 mt-1">2 mins ago</p>
                        </div>
                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                          <p className="text-xs font-semibold text-slate-800">System maintenance at midnight</p>
                          <p className="text-[10px] text-slate-500 mt-1">1 hour ago</p>
                        </div>
                      </div>
                      <div className="p-3 text-center border-t border-slate-100">
                        <button className="text-xs font-bold text-teal-600 hover:text-teal-700">Mark all as read</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Button */}
                <div className="relative">
                  <button
                    onClick={() => navigate('/doctor/profile')}
                    className="flex items-center justify-center rounded-2xl transition-all duration-300 relative z-50"
                    style={{ width: '48px', height: '48px', background: 'rgba(254, 255, 255, 0.15)', border: '1px solid rgba(254, 255, 255, 0.2)' }}>
                    <img
                      src="/doctor.jpg"
                      alt="Doctor Profile"
                      style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover', objectPosition: 'center 15%' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.setAttribute('style', 'display: block');
                      }}
                    />
                    <User size={22} color="#FEFFFF" style={{ display: 'none' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-6xl mx-auto w-full" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
          {/* Stats */}
          <div className="flex gap-4 mb-6">
            {[
              { label: "Today's Patients", value: patientsData?.total ?? 0, icon: Users },
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => navigate('/doctor/patient-form')}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 group text-left"
              style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}
            >
              <div className="rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={{ width: '48px', height: '48px', background: '#DEF2F1' }}>
                <UserPlus size={22} color="#3AAFA9" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#17252A' }}>Add Patient</p>
                <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>Register new</p>
              </div>
              <ChevronRight size={16} color="#3AAFA9" className="transition-transform group-hover:translate-x-1" />
            </button>
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
                { key: 'all', label: `All (${patientsData?.total ?? 0})` },
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
              {isLoading ? '…' : `${patients.length} patients`}
            </span>
          </div>

          {/* Patient Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Loading skeleton */}
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl" style={{ background: '#DEF2F1' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded" style={{ background: '#DEF2F1', width: '60%' }} />
                    <div className="h-3 rounded" style={{ background: '#DEF2F1', width: '40%' }} />
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
              <div className="col-span-full text-center py-10 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <Users className="w-10 h-10 mx-auto mb-3" style={{ color: '#DEF2F1' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>No patients found</p>
                <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '4px' }}>Try adjusting your search or filters</p>
              </div>
            )}

            {!isLoading && !isError && patients.map((patient, index) => {
              const config = statusConfig[patient.status] ?? statusConfig['waiting'];
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
                      style={{ width: '56px', height: '56px', background: '#DEF2F1' }}>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#2B7A78' }}>{getInitials(patient.name)}</span>
                      {patient.status === 'in-session' && (
                        <div className="absolute -top-1 -right-1 rounded-full"
                          style={{ width: '14px', height: '14px', background: '#3AAFA9', border: '2px solid #FEFFFF' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>{patient.name}</p>
                          <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '2px' }}>{patient.condition ?? '—'} · {patient.age} yrs</p>
                        </div>
                        <span className="px-3 py-1 rounded-full flex items-center gap-1.5"
                          style={{ background: config.bg, color: config.color, fontSize: '12px', fontWeight: 600 }}>
                          <div className="rounded-full" style={{ width: '6px', height: '6px', background: config.dot }} />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex gap-3 px-5 pb-5">
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                        <span style={{ fontSize: '14px' }}>🆔</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600, marginBottom: '2px' }}>ID</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{patient.displayId}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                        <span style={{ fontSize: '14px' }}>📞</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600, marginBottom: '2px' }}>Phone</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{patient.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
                    {patient.status === 'in-session' ? (
                      <button
                        onClick={() => navigate(`/doctor/patient/${patient.id}/treatment`)}
                        className="w-full flex items-center justify-center gap-2 py-4 transition-colors"
                        style={{ color: '#FEFFFF', fontSize: '13px', fontWeight: 700, background: '#2B7A78' }}
                      >
                        <CheckCircle size={16} />
                        COMPLETE SESSION
                      </button>
                    ) : (
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
                          onClick={() => navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors"
                          style={{ color: '#3AAFA9', fontSize: '13px', fontWeight: 600, borderRight: '1px solid #DEF2F1' }}
                        >
                          <ClipboardList size={16} />
                          Intake
                        </button>
                        <button
                          onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-4 transition-colors"
                          style={{ color: '#17252A', fontSize: '13px', fontWeight: 600 }}
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
