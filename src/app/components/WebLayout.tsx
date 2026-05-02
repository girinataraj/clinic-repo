import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SideNav } from './SideNav';

export function WebLayout() {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !user) {
      navigate('/login');
    }
  }, [user, isInitializing, navigate]);

  if (isInitializing || !user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar — desktop/tablet only */}
      <SideNav />

      {/* Main content area */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
