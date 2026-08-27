import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';

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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--admin-bg)' }}>
        <h1 style={{ color: 'var(--admin-navy)', marginBottom: '8px' }}>Unauthorized Area</h1>
        <p style={{ color: 'var(--admin-text-secondary)', marginBottom: '24px' }}>
          Your current role <strong>({currentRole})</strong> does not have access to this page.
        </p>
        <button 
          className="btn-primary" 
          onClick={() => {
            let dashboardRoute = '/admin/dashboard';
            switch (currentRole) {
              case 'super_admin': dashboardRoute = '/admin/dashboard'; break;
              case 'builder_admin': dashboardRoute = '/admin/builder-dashboard'; break;
              case 'project_manager': dashboardRoute = '/admin/projects'; break;
              case 'site_engineer': dashboardRoute = '/admin/inspections'; break;
              case 'crm': dashboardRoute = '/admin/customers'; break;
              case 'accounts': dashboardRoute = '/admin/accounts'; break;
              case 'contractor': dashboardRoute = '/admin/contractor-tasks'; break;
              case 'customer': dashboardRoute = '/admin/customer-dashboard'; break;
              default: dashboardRoute = '/admin/dashboard';
            }
            window.location.href = dashboardRoute;
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
