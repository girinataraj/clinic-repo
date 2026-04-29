/**
 * Thin re-export so features can import useAuth from a consistent path
 * without depending on the legacy context location.
 */
export { useAuth } from '../../app/contexts/AuthContext';
export type { AuthUser, UserRole } from '../../app/contexts/AuthContext';
