import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { getStore } from '../storage/localStore';
import { useAuth } from './AuthContext';
import { AppRole } from '../utils/roleUtils';

export type UserRole = AppRole;

interface RoleContextType {
  activeRole: UserRole;
  activeBuilderId: string;
  activeProjectId: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize local store upon load
  useEffect(() => {
    getStore();
  }, []);

  const activeRole = (user?.role?.toUpperCase() as UserRole) || 'SUPER_ADMIN';
  const activeBuilderId = user?.builderId || '';
  const activeProjectId = user?.projectId || '';

  return (
    <RoleContext.Provider value={{
      activeRole,
      activeBuilderId,
      activeProjectId
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
