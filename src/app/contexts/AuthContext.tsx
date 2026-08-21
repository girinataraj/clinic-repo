import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { setAccessToken, setRefreshToken, getRefreshToken, initTokenStorage } from '../../services/api';
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
  login: (identifier: string, password: string, role?: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // ← blocks render until session checked
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Restore session on mount via refresh-token cookie or Preferences ───────
  useEffect(() => {
    const restoreSession = async () => {
      console.log('[Auth] AUTH_INIT_START');
      try {
        const refreshToken = await initTokenStorage();
        if (refreshToken) {
          console.log('[Auth] AUTH_STORAGE_FOUND');
        }

        // No refresh token available at all — skip the API call entirely.
        // The cookie (withCredentials) may still carry one, so only bail
        // when persistent storage is also empty.
        if (!refreshToken) {
          console.debug('[Auth] No refresh token in storage — skipping restore');
          setUser(null);
          setIsInitializing(false);
          return;
        }

        console.debug('[Auth] Attempting session restore…');
        const response = await axios.post<{
          success: boolean;
          data: { accessToken: string; refreshToken?: string; user: AuthUser };
        }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );
        
        if (response.status === 200 && response.data?.success) {
          const { accessToken, refreshToken: newRefreshToken, user: restoredUser } = response.data.data;
          setAccessToken(accessToken);
          setUser(restoredUser);
          // ── Save the rotated refresh token so the next reload works ──
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          console.log('[Auth] AUTH_RESTORE_SUCCESS for', restoredUser?.role, restoredUser?.name);
        } else {
          console.warn('[Auth] Refresh responded but not successful', response.status);
          setUser(null);
        }
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
        console.warn('[Auth] AUTH_RESTORE_FAILED', { status, msg });
        setUser(null);
        // Only clear the stored token if the server explicitly rejected it (401).
        // For network errors / 500s, keep the token so the next reload can retry.
        if (status === 401) {
          setRefreshToken(null);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier: string, password: string, role?: UserRole): Promise<AuthUser> => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const trimmed = identifier.trim();
      const body: Record<string, any> = { password: password.trim() };
      if (trimmed.includes('@')) {
        body.email = trimmed;
      } else {
        body.phone = trimmed;
        body.email = trimmed;
      }
      if (role) {
        body.role = role;
      }

      const { data } = await api.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string; user: AuthUser };
      }>(ENDPOINTS.AUTH.LOGIN, body);

      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      setUser(data.data.user);
      return data.data.user;
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
    console.log('[Auth] LOGOUT');
    try {
      const refreshToken = getRefreshToken();
      await api.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch {
      // ignore logout API errors; clear local state regardless
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
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
