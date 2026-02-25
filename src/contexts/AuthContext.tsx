import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../config/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    if (email.includes('warehouse')) {
      setUser({
        id: '1',
        name: 'Warehouse User',
        email,
        role: 'warehouse',
      });
      return true;
    } else if (email.includes('owner')) {
      setUser({
        id: '2',
        name: 'Business Owner',
        email,
        role: 'business_owner',
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
