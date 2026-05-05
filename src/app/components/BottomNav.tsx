import { useNavigate, useLocation } from 'react-router';
import type { UserRole } from '../contexts/AuthContext';
import { Home, Calendar, FileText, User, Users, ClipboardList, BarChart2, UserCog, Activity } from 'lucide-react';

interface NavItem {
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  path: string;
}

const navConfig: Record<string, NavItem[]> = {
  patient: [
    { label: 'Home', Icon: Home, path: '/patient' },
    { label: 'Booking', Icon: Calendar, path: '/patient/appointment' },
    { label: 'Records', Icon: FileText, path: '/patient/records' },
    { label: 'Profile', Icon: User, path: '/patient/profile' },
  ],
  nurse: [
    { label: 'Home', Icon: Home, path: '/nurse' },
    { label: 'Intake', Icon: ClipboardList, path: '/nurse/intake' },
    { label: 'Patients', Icon: Users, path: '/nurse/patients' },
    { label: 'Exercises', Icon: Activity, path: '/nurse/exercise' },
    { label: 'Profile', Icon: User, path: '/nurse/profile' },
  ],
  doctor: [
    { label: 'Home', Icon: Home, path: '/doctor' },
    { label: 'Patients', Icon: Users, path: '/doctor/patients' },
    { label: 'Therapists', Icon: UserCog, path: '/doctor/therapists' },
    { label: 'Intake', Icon: ClipboardList, path: '/doctor/intake' },
    { label: 'Profile', Icon: User, path: '/doctor/profile' },
  ],
};

const roleAccentColor: Record<string, { active: string; bg: string; darkBg: string; pill: string }> = {
  patient: { active: '#2563eb', bg: '#eff6ff', darkBg: 'rgba(37,99,235,0.2)', pill: '#2563eb' },
  nurse: { active: '#0f766e', bg: '#f0fdfa', darkBg: 'rgba(15,118,110,0.2)', pill: '#0f766e' },
  doctor: { active: '#4338ca', bg: '#eef2ff', darkBg: 'rgba(67,56,202,0.2)', pill: '#4338ca' },
};

interface BottomNavProps {
  role: UserRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navConfig[role] ?? [];
  const accent = roleAccentColor[role] ?? roleAccentColor.patient;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] w-full flex items-center bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-8px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.2)] pb-[env(safe-area-inset-bottom)]"
      style={{ height: 'calc(68px + env(safe-area-inset-bottom))' }}
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
            className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative pt-1.5 group"
            onClick={() => navigate(item.path)}
          >
            {/* Active pill indicator at top */}
            {isActive && (
              <div
                className="absolute top-0 rounded-b-md"
                style={{ width: '32px', height: '3px', background: accent.pill }}
              />
            )}
            <div
              className="flex items-center justify-center rounded-xl transition-all duration-150"
              style={{ width: '42px', height: '30px', background: isActive ? accent.bg : 'transparent' }}
            >
              <Icon
                size={20}
                color={isActive ? accent.active : '#b0bec5'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] ${isActive ? 'font-extrabold' : 'font-medium text-slate-400 dark:text-slate-500'}`}
              style={{ color: isActive ? accent.active : undefined, letterSpacing: isActive ? '0px' : '0.2px' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}