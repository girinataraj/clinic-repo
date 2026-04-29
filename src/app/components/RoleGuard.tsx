import { Navigate, Outlet } from 'react-router';
import { useAuth, type UserRole } from '../contexts/AuthContext';

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
 * - Not logged in → redirect to /login
 * - Wrong role → redirect to their own dashboard
 * - Correct role → render child routes
 */
export function RoleGuard({ allowed }: Props) {
  const { user } = useAuth();

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
