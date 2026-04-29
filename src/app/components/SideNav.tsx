import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Home, Calendar, FileText, User, Users, ClipboardList, BarChart2,
  Activity, LogOut, Sparkles, ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string }>;
  path: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Dashboard', Icon: Home, path: '/patient' },
    { label: 'Appointments', Icon: Calendar, path: '/patient/appointment' },
    { label: 'Records', Icon: FileText, path: '/patient/records' },
    { label: 'Profile', Icon: User, path: '/patient/profile' },
  ],
  nurse: [
    { label: 'Dashboard', Icon: Home, path: '/nurse' },
    { label: 'Intake Form', Icon: ClipboardList, path: '/nurse/intake' },
    { label: 'Patients', Icon: Users, path: '/nurse/patients' },
    { label: 'Profile', Icon: User, path: '/nurse/profile' },
  ],
  doctor: [
    { label: 'Dashboard', Icon: Home, path: '/doctor' },
    { label: 'Patients', Icon: Users, path: '/doctor/patients' },
    { label: 'Reports', Icon: BarChart2, path: '/doctor/report' },
    { label: 'Profile', Icon: User, path: '/doctor/profile' },
  ],
};

const roleConfig: Record<UserRole, {
  gradient: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  iconColor: string;
  label: string;
}> = {
  patient: {
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    activeBg: 'bg-blue-50 dark:bg-blue-900/30',
    activeBorder: 'border-blue-200 dark:border-blue-800/50',
    activeText: 'text-blue-600 dark:text-blue-400',
    iconColor: '#2563eb',
    label: 'Patient Portal',
  },
  nurse: {
    gradient: 'linear-gradient(135deg, #134e4a, #0f766e)',
    activeBg: 'bg-teal-50 dark:bg-teal-900/30',
    activeBorder: 'border-teal-200 dark:border-teal-800/50',
    activeText: 'text-teal-700 dark:text-teal-400',
    iconColor: '#0f766e',
    label: 'Nurse Station',
  },
  doctor: {
<<<<<<< HEAD
    gradient: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
    activeBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    activeBorder: 'border-indigo-200 dark:border-indigo-800/50',
    activeText: 'text-indigo-700 dark:text-indigo-400',
    iconColor: '#4338ca',
    label: 'Doctor Console',
=======
    gradient: 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
    accent: '#3AAFA9',
    accentBg: '#2B7A78',
    label: 'Doctor Console',
    border: '#2B7A78',
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
  },
};

export function SideNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;
  const items = navConfig[role];
  const rc = roleConfig[role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item: NavItem) => {
    if (item.label === 'Profile') return location.pathname.endsWith('/profile');
    if (item.label === 'Dashboard') {
      return location.pathname === item.path;
    }
    if (item.label === 'Patients' && role === 'doctor') {
      return location.pathname === '/doctor/patients' || location.pathname.startsWith('/doctor/patient');
    }
    return location.pathname.startsWith(item.path) && item.path !== `/${role}`;
  };

  return (
    <div
<<<<<<< HEAD
      className="hidden md:flex flex-col h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800"
      style={{ width: '240px', boxShadow: '2px 0 16px rgba(0,0,0,0.04)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
=======
      className="hidden md:flex flex-col h-screen shrink-0"
      style={{
        width: '240px',
        background: role === 'doctor' ? '#17252A' : 'white',
        borderRight: role === 'doctor' ? 'none' : '1px solid #f1f5f9',
        boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: role === 'doctor' ? '1px solid rgba(254, 255, 255, 0.1)' : '1px solid #f1f5f9' }}
      >
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
        <div
          className="flex items-center justify-center relative shrink-0"
          style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: rc.gradient,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Activity size={20} color="#FEFFFF" strokeWidth={2.5} />
          <div
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
            style={{ width: '14px', height: '14px', background: role === 'doctor' ? '#3AAFA9' : '#10b981', border: `2px solid ${role === 'doctor' ? '#17252A' : 'white'}` }}
          >
            <Sparkles size={7} color="#FEFFFF" />
          </div>
        </div>
        <div>
<<<<<<< HEAD
          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">SAAI Physio</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">{rc.label}</p>
=======
          <p style={{ fontSize: '14px', fontWeight: 900, color: role === 'doctor' ? '#FEFFFF' : '#0f172a', letterSpacing: '-0.3px' }}>
            SAAI Physio
          </p>
          <p style={{ fontSize: '10px', color: role === 'doctor' ? '#DEF2F1' : '#94a3b8', fontWeight: 600, letterSpacing: '0.3px' }}>
            {rc.label}
          </p>
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1">
<<<<<<< HEAD
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 pl-2.5 mb-2">
=======
        <p style={{ fontSize: '10px', fontWeight: 800, color: role === 'doctor' ? 'rgba(222, 242, 241, 0.6)' : '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: '10px', marginBottom: '8px' }}>
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
          Navigation
        </p>
        {items.map((item) => {
          const active = isActive(item);
          const { Icon } = item;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
<<<<<<< HEAD
              className={`flex items-center gap-3 w-full text-left transition-all rounded-xl px-3 py-2.5 border ${
                active
                  ? `${rc.activeBg} ${rc.activeBorder}`
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
=======
              className="flex items-center gap-3 w-full text-left transition-all hover:bg-black/10"
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: active ? rc.accentBg : 'transparent',
                border: `1px solid ${active ? rc.border : 'transparent'}`,
              }}
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
            >
              <div
                className={`flex items-center justify-center rounded-xl shrink-0 transition-all ${
                  !active ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
                style={{
                  width: '34px', height: '34px',
<<<<<<< HEAD
                  background: active ? rc.iconColor : undefined,
=======
                  background: active ? rc.accent : (role === 'doctor' ? 'rgba(254, 255, 255, 0.05)' : '#f1f5f9'),
                  transition: 'all 0.15s ease',
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
                }}
              >
                <Icon size={17} color={active ? '#FEFFFF' : (role === 'doctor' ? '#FEFFFF' : '#64748b')} strokeWidth={active ? 2.5 : 1.8} />
              </div>
<<<<<<< HEAD
              <span className={`flex-1 text-sm ${active ? `font-extrabold ${rc.activeText}` : 'font-semibold text-slate-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
              {active && <span className={rc.activeText}><ChevronRight size={14} /></span>}
=======
              <span style={{
                fontSize: '13px',
                fontWeight: active ? 800 : 600,
                color: active ? '#FEFFFF' : (role === 'doctor' ? '#FEFFFF' : '#475569'),
                flex: 1,
              }}>
                {item.label}
              </span>
              {active && <ChevronRight size={14} color="#FEFFFF" />}
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
<<<<<<< HEAD
      <div className="border-t border-slate-100 dark:border-slate-800 p-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between px-2 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Theme</p>
          <ThemeToggle />
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-xl mb-2 border ${rc.activeBg} ${rc.activeBorder}`}
=======
      <div style={{ borderTop: role === 'doctor' ? '1px solid rgba(254, 255, 255, 0.1)' : '1px solid #f1f5f9', padding: '12px' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-2"
          style={{ background: role === 'doctor' ? 'rgba(254, 255, 255, 0.05)' : rc.accentBg, border: `1px solid ${role === 'doctor' ? 'rgba(254, 255, 255, 0.1)' : rc.border}` }}
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: '36px', height: '36px', background: rc.gradient }}
          >
            <User size={17} color="#FEFFFF" />
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< HEAD
            <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold capitalize">{role} · SAAI Clinic</p>
=======
            <p style={{ fontSize: '12px', fontWeight: 800, color: role === 'doctor' ? '#FEFFFF' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </p>
            <p style={{ fontSize: '10px', color: role === 'doctor' ? '#DEF2F1' : '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
              {role} · SAAI Clinic
            </p>
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
          </div>
        </div>
        <button
          onClick={handleLogout}
<<<<<<< HEAD
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
=======
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
          style={{
            background: role === 'doctor' ? 'rgba(254, 255, 255, 0.05)' : '#fef2f2',
            border: `1px solid ${role === 'doctor' ? 'rgba(254, 255, 255, 0.1)' : '#fecaca'}`,
            color: role === 'doctor' ? '#FEFFFF' : '#dc2626',
            fontSize: '13px',
            fontWeight: 700,
          }}
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
        >
          <LogOut size={15} color={role === 'doctor' ? '#FEFFFF' : '#dc2626'} />
          Sign Out
        </button>
<<<<<<< HEAD
        <p className="text-center text-[9px] text-slate-300 dark:text-slate-700 mt-2.5 font-semibold">
=======
        <p style={{ textAlign: 'center', fontSize: '9px', color: role === 'doctor' ? 'rgba(222, 242, 241, 0.5)' : '#cbd5e1', marginTop: '10px', fontWeight: 600 }}>
>>>>>>> e0b4024f29a552ab11e9644763e40f2acdd085a5
          SAAI Physiotherapy v2.0
        </p>
      </div>
    </div>
  );
}
