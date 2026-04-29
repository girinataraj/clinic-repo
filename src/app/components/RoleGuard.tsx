import { Navigate, Outlet } from 'react-router';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
  /** Roles allowed to access child routes */
  allowed: UserRole[];
}

const dashboardByRole: Record<UserRole, string> = {
  doctor: '/doctor',
  nurse: '/nurse',
  patient: '/patient',
  admin: '/doctor',
};

/**
 * Route guard that enforces role-based access.
 * - isInitializing → show spinner (session restore in progress)
 * - Not logged in  → redirect to /login
 * - Wrong role     → redirect to their own dashboard
 * - Correct role   → render child routes
 */
export function RoleGuard({ allowed }: Props) {
  const { user, isInitializing } = useAuth();

  // Session restore in flight — don't redirect yet
  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Restoring session…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to correct dashboard
  if (!allowed.includes(user.role)) {
    return <Navigate to={dashboardByRole[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}
