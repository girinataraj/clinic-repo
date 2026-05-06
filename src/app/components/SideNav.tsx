import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Home, Calendar, FileText, User, Users, ClipboardList, BarChart2,
  Activity, LogOut, Sparkles, ChevronRight, IndianRupee, UserCog,
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
    { label: 'Exercises', Icon: Activity, path: '/nurse/exercise' },
    { label: 'Profile', Icon: User, path: '/nurse/profile' },
  ],
  doctor: [
    { label: 'Dashboard', Icon: Home, path: '/doctor' },
    { label: 'Patients', Icon: Users, path: '/doctor/patients' },
    { label: 'Therapists', Icon: UserCog, path: '/doctor/therapists' },
    { label: 'Intake Form', Icon: ClipboardList, path: '/doctor/intake' },
    { label: 'Reports', Icon: BarChart2, path: '/doctor/report' },
    { label: 'Revenue', Icon: IndianRupee, path: '/doctor/revenue' },
    { label: 'Profile', Icon: User, path: '/doctor/profile' },
  ],
  admin: [],
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
    gradient: 'linear-gradient(135deg, #0d2b27, #0f766e)',
    activeBg: 'bg-indigo-50 dark:bg-teal-900/30',
    activeBorder: 'border-teal-200 dark:border-teal-800/50',
    activeText: 'text-indigo-950 dark:text-teal-400',
    iconColor: '#0f766e',
    label: 'Therapist Station',
  },
  doctor: {
    gradient: 'linear-gradient(135deg, #262842, #3B3E66)',
    activeBg: 'bg-[#E8E9F1] dark:bg-teal-900/30',
    activeBorder: 'border-[#E8E9F1] dark:border-teal-800/50',
    activeText: 'text-[#262842] dark:text-teal-400',
    iconColor: '#262842',
    label: 'Doctor Console',
  },
  admin: {
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    activeBg: 'bg-blue-50 dark:bg-blue-900/30',
    activeBorder: 'border-blue-200 dark:border-blue-800/50',
    activeText: 'text-blue-600 dark:text-blue-400',
    iconColor: '#2563eb',
    label: 'Admin',
  },
};

export function SideNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;
  const items = navConfig[role] ?? [];
  const rc = roleConfig[role] ?? roleConfig.patient;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item: NavItem) => {
    if (item.label === 'Profile') return location.pathname.endsWith('/profile');
    if (item.label === 'Dashboard') return location.pathname === item.path;
    if (item.label === 'Patients' && role === 'doctor') {
      return location.pathname === '/doctor/patients' || location.pathname.startsWith('/doctor/patient');
    }
    return location.pathname.startsWith(item.path) && item.path !== `/${role}`;
  };

  return (
    <div
      className="hidden md:flex flex-col h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800"
      style={{ width: '240px', boxShadow: '2px 0 16px rgba(0,0,0,0.04)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div
          className="flex items-center justify-center relative shrink-0"
          style={{ width: '40px', height: '40px', borderRadius: '12px', background: rc.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <Activity size={20} color="#FEFFFF" strokeWidth={2.5} />
          <div
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
            style={{ width: '14px', height: '14px', background: '#10b981', border: '2px solid white' }}
          >
            <Sparkles size={7} color="#FEFFFF" />
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">SAAI Physio</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">{rc.label}</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 pl-2.5 mb-2">
          Navigation
        </p>
        {items.map((item) => {
          const active = isActive(item);
          const { Icon } = item;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full text-left transition-all rounded-xl px-3 py-2.5 border ${active
                  ? `${rc.activeBg} ${rc.activeBorder}`
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
            >
              <div
                className={`flex items-center justify-center rounded-xl shrink-0 transition-all ${!active ? 'bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                style={{ width: '34px', height: '34px', background: active ? rc.iconColor : undefined }}
              >
                <Icon size={17} color={active ? '#FEFFFF' : '#64748b'} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={`flex-1 text-sm ${active ? `font-extrabold ${rc.activeText}` : 'font-semibold text-slate-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
              {active && <span className={rc.activeText}><ChevronRight size={14} /></span>}
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between px-2 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Theme</p>
          <ThemeToggle />
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-xl mb-2 border ${rc.activeBg} ${rc.activeBorder}`}>
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: '36px', height: '36px', background: rc.gradient }}
          >
            <User size={17} color="#FEFFFF" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
              {user.name === 'Dr. Rajesh Kumar' ? 'Dr. SV. Sathish Kumar' : user.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold capitalize">
              {role === 'nurse' ? 'therapist' : role} · SAAI Clinic
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
        <p className="text-center text-[9px] text-slate-300 dark:text-slate-700 mt-2.5 font-semibold">
          SAAI Physiotherapy v2.0
        </p>
      </div>
    </div>
  );
}