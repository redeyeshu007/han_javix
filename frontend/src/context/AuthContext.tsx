import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '../types/models';
import { apiClient } from '../api/client';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapBackendToUser = (data: any): User => ({
  id: data.id,
  name: data.full_name,
  email: data.email,
  phone: data.phone || '', // backend may not have phone natively yet
  role: data.role,
  builder_company_name: data.builder_company_name,
  password: '', // Should not be accessible
  status: data.is_active ? 'Active' : 'Inactive',
  // CUSTOMER portal wiring: /accounts/me/ (and the login response) carry a
  // `unit` summary read from the real Unit.customer relationship, so
  // CustomerHome can resolve the allocated home immediately.
  projectId: data.unit?.project_id != null ? String(data.unit.project_id) : undefined,
  unitId: data.unit?.unit_id != null ? String(data.unit.unit_id) : undefined,
  unitNumber: data.unit?.unit_number || undefined,
  projectName: data.unit?.project_name || undefined,
  // PROJECT_ADMIN wiring: /accounts/me/ carries the single assigned project
  // so RoleContext.activeProjectId is always correct from the first render.
  assignedProjectId: data.assigned_project?.id != null ? String(data.assigned_project.id) : undefined,
  assignedProjectName: data.assigned_project?.name || undefined,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authVersion = useRef(0);

  const fetchCurrentUser = async (expectedAuthVersion = authVersion.current) => {
    try {
      const response = await apiClient.get('/accounts/me/');
      if (authVersion.current === expectedAuthVersion) {
        setUser(mapBackendToUser(response.data));
      }
    } catch (error) {
      if (authVersion.current === expectedAuthVersion) {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const versionAtStart = authVersion.current;
      setLoading(true);
      await fetchCurrentUser(versionAtStart);
      // Do not let the initial anonymous /me request overwrite a login that
      // completed while that request was in flight.
      if (authVersion.current === versionAtStart) {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const trimmedEmail = email.trim();
      const response = await apiClient.post('/accounts/login/', { email: trimmedEmail, password });
      
      const accessToken = response.data.access;
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
      }

      const authenticatedUser = mapBackendToUser(response.data.user);
      authVersion.current += 1;
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = 
        errorData?.non_field_errors?.[0] || 
        errorData?.detail || 
        (typeof errorData === 'string' ? errorData : null) ||
        errorData?.email?.[0] ||
        errorData?.password?.[0] ||
        error.message ||
        'Invalid email or password.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/accounts/logout/');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      authVersion.current += 1;
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
