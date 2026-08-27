import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, setAccessToken } from '../api';

import { User, mockDb } from '../services/mockDb';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by checking mock_session_id
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const mockSessionId = localStorage.getItem('mock_session_id');
        if (mockSessionId) {
          const foundUser = mockDb.findUserById(mockSessionId);
          if (foundUser && foundUser.status === 'Active') {
            setUser(foundUser);
          } else {
            localStorage.removeItem('mock_session_id');
            setUser(null);
          }
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const authenticatedUser = mockDb.authenticateUser(email, password);
    if (authenticatedUser) {
      localStorage.setItem('mock_session_id', authenticatedUser.id);
      setUser(authenticatedUser);
      return authenticatedUser;
    } else {
      throw new Error('Invalid email or password.');
    }
  };

  const logout = async () => {
    localStorage.removeItem('mock_session_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
