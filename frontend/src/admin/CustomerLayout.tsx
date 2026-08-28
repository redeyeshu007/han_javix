import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const CustomerLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Route guarding for non-customers
  if (user?.role !== 'customer') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="admin-main">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
