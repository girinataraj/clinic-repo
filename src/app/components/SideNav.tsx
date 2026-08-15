import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Home, Calendar, FileText, User, Users, ClipboardList,
  Activity, LogOut, ChevronRight, IndianRupee, FileSearch, RefreshCw,
  UserPlus, UserCheck, Menu
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
    { label: 'New Intake', Icon: ClipboardList, path: '/nurse/intake' },
    { label: 'Add Patient', Icon: UserPlus, path: '/nurse/patient-form' },
    { label: 'Follow Ups', Icon: RefreshCw, path: '/nurse/follow-up' },
    { label: 'Patient History', Icon: FileSearch, path: '/nurse/patient-history' },
    { label: 'Profile', Icon: User, path: '/nurse/profile' },
  ],
  doctor: [
    { label: 'Dashboard', Icon: Home, path: '/doctor' },
    { label: 'Add Patient', Icon: UserPlus, path: '/doctor/patient-form' },
    { label: 'Assign Patient', Icon: UserCheck, path: '/doctor/assign-patient' },
    { label: 'Intake Form', Icon: ClipboardList, path: '/doctor/intake' },
    { label: 'Follow Ups', Icon: RefreshCw, path: '/doctor/follow-up' },
    { label: 'Patient History', Icon: FileSearch, path: '/doctor/patient-history' },
    { label: 'Revenue', Icon: IndianRupee, path: '/doctor/revenue' },
    { label: 'Therapists', Icon: Users, path: '/doctor/therapists' },
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
  const [isMinimized, setIsMinimized] = useState(false);

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
      onDoubleClick={() => setIsMinimized(!isMinimized)}
      className="hidden md:flex flex-col h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 relative"
      style={{ width: isMinimized ? '76px' : '240px', boxShadow: '2px 0 16px rgba(0,0,0,0.04)', userSelect: 'none' }}
    >
      {/* Logo */}
      <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3 px-5'} py-5 border-b border-slate-100 dark:border-slate-800`}>
        {isMinimized ? (
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Menu size={24} className="text-slate-700 dark:text-slate-300" />
          </button>
        ) : (
          <>
            <div
              className="shrink-0 overflow-hidden"
              style={{ width: '42px', height: '42px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
            >
              <img
                src="/SAAI-logo.png"
                alt="SAAI Physiotherapy Clinic"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">SAAI Physio</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">{rc.label}</p>
            </div>
          </>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1">
        {!isMinimized && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 pl-2.5 mb-2">
            Navigation
          </p>
        )}
        {items.map((item) => {
          const active = isActive(item);
          const { Icon } = item;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              title={isMinimized ? item.label : undefined}
              className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'} w-full text-left transition-all rounded-xl px-3 py-2.5 border ${active
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
              {!isMinimized && (
                <>
                  <span className={`flex-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis ${active ? `font-extrabold ${rc.activeText}` : 'font-semibold text-slate-500 dark:text-slate-400'}`}>
                    {item.label}
                  </span>
                  {active && <span className={rc.activeText}><ChevronRight size={14} /></span>}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 flex flex-col items-center">
        {/* Theme toggle — Hidden for therapists and patients, only available on Profile */}
        {role === 'admin' && !isMinimized && (
          <div className="flex items-center justify-between px-2 mb-3 w-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Theme</p>
            <ThemeToggle />
          </div>
        )}

        <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'} w-full p-3 rounded-xl mb-2 border ${rc.activeBg} ${rc.activeBorder}`}>
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: '36px', height: '36px', background: rc.gradient }}
            title={isMinimized ? user.name : undefined}
          >
            <User size={17} color="#FEFFFF" />
          </div>
          {!isMinimized && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold capitalize truncate">
                {role === 'nurse' ? 'therapist' : role} · SAAI Clinic
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={isMinimized ? 'Sign Out' : undefined}
          className={`w-full flex items-center justify-center ${isMinimized ? '' : 'gap-2'} py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors`}
        >
          <LogOut size={15} />
          {!isMinimized && <span>Sign Out</span>}
        </button>
        {!isMinimized && (
          <p className="text-center text-[9px] text-slate-300 dark:text-slate-700 mt-2.5 font-semibold">
            SAAI Physiotherapy v2.0
          </p>
        )}
      </div>
    </div>
  );
}