import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../config/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  getAuthHeaders: () => Record<string, string>; // Add this
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Save email to localStorage for persistence
    localStorage.setItem('userEmail', email);
    
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
    localStorage.removeItem('userEmail'); // Clear on logout
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  // Helper to get auth headers for API requests
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const email = user?.email || localStorage.getItem('userEmail') || '';
    return {
      'Content-Type': 'application/json',
      'X-User-Email': email, // Send email in header
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasRole, getAuthHeaders }}>
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