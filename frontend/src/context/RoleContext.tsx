import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { initMockDb } from '../services/mockDb';
import { useAuth } from './AuthContext';

export type UserRole = 
  | 'super_admin' 
  | 'builder_admin' 
  | 'project_manager' 
  | 'site_engineer' 
  | 'crm' 
  | 'accounts' 
  | 'contractor'
  | 'customer';

interface RoleContextType {
  activeRole: UserRole;
  activeBuilderId: string;
  activeProjectId: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize mock database upon load
  useEffect(() => {
    initMockDb();
  }, []);

  const activeRole = (user?.role as UserRole) || 'super_admin';
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
