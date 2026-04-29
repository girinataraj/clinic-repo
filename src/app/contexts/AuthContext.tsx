import React, { createContext, useContext, useState } from 'react';
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
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginError: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const { data } = await api.post<{
        success: boolean;
        data: { accessToken: string; user: AuthUser };
      }>(ENDPOINTS.AUTH.LOGIN, { email, password, role });

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
      // Clear ALL cached React Query data to prevent stale data leaking
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
