import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { setAccessToken } from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';
import { queryClient } from '../../services/queryClient';

export type UserRole = 'patient' | 'nurse' | 'doctor' | 'admin';

export interface AuthUser {
  id: string;
  displayId: string;
  name: string;
  email: string;
  role: UserRole;
  patient_id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  /** True while the initial session restore is in progress — gates route rendering */
  isInitializing: boolean;
  isLoading: boolean;
  loginError: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // ← blocks render until session checked
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Restore session on mount via refresh-token cookie ─────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            validateStatus: (status) => status < 500 // prevent throwing on 401
          }
        );
        
        if (response.status === 200 && response.data?.success) {
          setAccessToken(response.data.data.accessToken);
          setUser(response.data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Network errors or 500s
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      // Patients authenticate with phone; staff with email
      const isPhone = role === 'patient';
      const body = isPhone
        ? { phone: identifier, password, role }
        : { email: identifier, password, role };

      const { data } = await api.post<{
        success: boolean;
        data: { accessToken: string; user: AuthUser };
      }>(ENDPOINTS.AUTH.LOGIN, body);

      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setLoginError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // ignore logout API errors; clear local state regardless
    } finally {
      setAccessToken(null);
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isInitializing, isLoading, loginError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
