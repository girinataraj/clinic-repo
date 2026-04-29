import { Home, Calendar, FileText, User, Users, ClipboardList, BarChart2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import type { UserRole } from '../contexts/AuthContext';

interface NavItem {
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  path: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Home', Icon: Home, path: '/patient' },
    { label: 'Appointments', Icon: Calendar, path: '/patient/appointment' },
    { label: 'Records', Icon: FileText, path: '/patient/records' },
    { label: 'Profile', Icon: User, path: '/patient/profile' },
  ],
  nurse: [
    { label: 'Home', Icon: Home, path: '/nurse' },
    { label: 'Intake', Icon: ClipboardList, path: '/nurse/intake' },
    { label: 'Patients', Icon: Users, path: '/nurse/patients' },
    { label: 'Profile', Icon: User, path: '/nurse/profile' },
  ],
  doctor: [
    { label: 'Home', Icon: Home, path: '/doctor' },
    { label: 'Patients', Icon: Users, path: '/doctor/patients' },
    { label: 'Reports', Icon: BarChart2, path: '/doctor/report' },
    { label: 'Profile', Icon: User, path: '/doctor/profile' },
  ],
};

const roleAccentColor: Record<UserRole, { active: string; bg: string; pill: string }> = {
  patient: { active: '#2563eb', bg: '#eff6ff', pill: '#2563eb' },
  nurse: { active: '#0f766e', bg: '#f0fdfa', pill: '#0f766e' },
  doctor: { active: '#3AAFA9', bg: '#DEF2F1', pill: '#2B7A78' },
};

interface BottomNavProps {
  role: UserRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navConfig[role];
  const accent = roleAccentColor[role];

  return (
    <div
      className="shrink-0 flex items-center bg-white relative"
      style={{
        height: '68px',
        borderTop: '1px solid #f1f5f9',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.07)',
      }}
    >
      {items.map((item) => {
        const isDoctorPatientDetail =
          role === 'doctor' &&
          item.label === 'Patients' &&
          location.pathname.startsWith('/doctor/patient');

        const isActive =
          location.pathname === item.path ||
          (item.label === 'Profile' && location.pathname.endsWith('/profile')) ||
          isDoctorPatientDetail ||
          (item.label !== 'Profile' &&
            item.path !== '/patient' &&
            item.path !== '/nurse' &&
            item.path !== '/doctor' &&
            location.pathname.startsWith(item.path));

        const { Icon } = item;

        return (
          <button
            key={item.label}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative"
            onClick={() => navigate(item.path)}
            style={{ paddingTop: '6px' }}
          >
            {/* Active pill indicator at top */}
            {isActive && (
              <div
                className="absolute top-0 rounded-full"
                style={{ width: '32px', height: '3px', background: accent.pill, borderRadius: '0 0 4px 4px' }}
              />
            )}
            <div
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: '42px',
                height: '30px',
                background: isActive ? accent.bg : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon
                size={20}
                color={isActive ? accent.active : '#b0bec5'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? accent.active : '#94a3b8',
                letterSpacing: isActive ? '0px' : '0.2px',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}