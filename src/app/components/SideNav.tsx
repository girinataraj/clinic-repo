import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import {
  Home, Calendar, FileText, User, Users, ClipboardList, BarChart2,
  Activity, LogOut, Sparkles, ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
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
  accent: string;
  accentBg: string;
  label: string;
  border: string;
}> = {
  patient: {
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    accent: '#2563eb',
    accentBg: '#eff6ff',
    label: 'Patient Portal',
    border: '#bfdbfe',
  },
  nurse: {
    gradient: 'linear-gradient(135deg, #134e4a, #0f766e)',
    accent: '#0f766e',
    accentBg: '#f0fdfa',
    label: 'Nurse Station',
    border: '#99f6e4',
  },
  doctor: {
    gradient: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
    accent: '#4338ca',
    accentBg: '#eef2ff',
    label: 'Doctor Console',
    border: '#c7d2fe',
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
      className="hidden md:flex flex-col h-screen shrink-0"
      style={{
        width: '240px',
        background: 'white',
        borderRight: '1px solid #f1f5f9',
        boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid #f1f5f9' }}
      >
        <div
          className="flex items-center justify-center relative shrink-0"
          style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: rc.gradient,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Activity size={20} color="white" strokeWidth={2.5} />
          <div
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
            style={{ width: '14px', height: '14px', background: '#10b981', border: '2px solid white' }}
          >
            <Sparkles size={7} color="white" />
          </div>
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
            SAAI Physio
          </p>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px' }}>
            {rc.label}
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-1">
        <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: '10px', marginBottom: '8px' }}>
          Navigation
        </p>
        {items.map((item) => {
          const active = isActive(item);
          const { Icon } = item;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 w-full text-left transition-all"
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: active ? rc.accentBg : 'transparent',
                border: `1px solid ${active ? rc.border : 'transparent'}`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{
                  width: '34px', height: '34px',
                  background: active ? rc.accent : '#f1f5f9',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={17} color={active ? 'white' : '#64748b'} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: active ? 800 : 600,
                color: active ? rc.accent : '#475569',
                flex: 1,
              }}>
                {item.label}
              </span>
              {active && <ChevronRight size={14} color={rc.accent} />}
            </button>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-2"
          style={{ background: rc.accentBg, border: `1px solid ${rc.border}` }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: '36px', height: '36px', background: rc.gradient }}
          >
            <User size={17} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
              {role} · SAAI Clinic
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
        <p style={{ textAlign: 'center', fontSize: '9px', color: '#cbd5e1', marginTop: '10px', fontWeight: 600 }}>
          SAAI Physiotherapy v2.0
        </p>
      </div>
    </div>
  );
}
