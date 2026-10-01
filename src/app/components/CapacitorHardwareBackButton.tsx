import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router';

export function CapacitorHardwareBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // If we are at the root path, let the OS handle the back button (exit app)
      if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/doctor' || location.pathname === '/patient' || location.pathname === '/therapist') {
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [location, navigate]);

  return null;
}
