import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { getDashboardRoute } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const { activeRole } = useRole();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--admin-bg)' }}>
        <div style={{ color: 'var(--admin-text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = activeRole;

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    // If we don't know the role at all, redirect to login to clear state
    if (!currentRole) {
      return <Navigate to="/login" replace />;
    }
    
    // Otherwise redirect to their proper dashboard
    const correctDashboard = getDashboardRoute(currentRole);
    return <Navigate to={correctDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
