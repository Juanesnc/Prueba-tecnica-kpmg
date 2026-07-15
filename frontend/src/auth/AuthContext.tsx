import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser } from '../types';
import { api } from '../api/client';
import { getUser, saveSession, clearSession } from './storage';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
    saveSession(res.token, res.user);
    setUser(res.user);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin', login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
