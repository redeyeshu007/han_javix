import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { getStore } from '../storage/localStore';
import { useAuth } from './AuthContext';
import { AppRole } from '../utils/roleUtils';

export type UserRole = AppRole;

interface RoleContextType {
  activeRole: UserRole;
  activeBuilderId: string;
  activeProjectId: string;
  activeProjectName: string;
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
  
  // PROJECT_ADMIN uses assignedProjectId (their single assigned project).
  // CUSTOMER uses projectId (the project their unit belongs to).
  // All other roles: empty string.
  const activeProjectId = user?.assignedProjectId || user?.projectId || '';
  const activeProjectName = user?.assignedProjectName || user?.projectName || '';

  return (
    <RoleContext.Provider value={{
      activeRole,
      activeBuilderId,
      activeProjectId,
      activeProjectName,
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
