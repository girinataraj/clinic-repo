import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'patient' | 'nurse' | 'doctor';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  id: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const roleNames: Record<UserRole, string> = {
  patient: 'Priya Sharma',
  nurse: 'Kavya Reddy',
  doctor: 'Dr. Rajesh Kumar',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string, role: UserRole) => {
    setUser({
      name: roleNames[role],
      email: email || `${role}@saai.com`,
      role,
      id: `${role}-001`,
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
