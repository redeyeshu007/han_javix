import React from 'react';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CustomerHeaderProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ onMenuClick, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="admin-topbar" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 32px' }}>
      <div className="admin-topbar__left">
        <button className="admin-topbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={24} color="#64748B" />
        </button>
        
        {pageTitle && (
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {pageTitle}
          </h2>
        )}
      </div>

      <div className="admin-topbar__right" style={{ gap: '24px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
          <input 
            type="text" 
            placeholder="Search documents or requests..." 
            style={{ 
              padding: '8px 16px 8px 36px', 
              borderRadius: '9999px', 
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '13px',
              width: '240px',
              outline: 'none'
            }} 
          />
        </div>

        <button className="admin-topbar__icon-btn" style={{ position: 'relative', backgroundColor: '#F8FAFC' }} aria-label="Notifications">
          <Bell size={20} color="#64748B" />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: '50%' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px', borderRadius: '40px', border: '1px solid #E2E8F0', paddingRight: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
            {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{user?.name || 'Customer'}</span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Homeowner</span>
          </div>
          <div className="dropdown">
            <ChevronDown size={16} color="#64748B" style={{ marginLeft: '4px' }} />
            <div className="dropdown-menu">
              <button onClick={() => navigate('/admin/customer-profile')}>Profile Settings</button>
              <button onClick={handleLogout} style={{ color: '#EF4444' }}>Logout</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .dropdown { position: relative; }
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          width: 160px;
          z-index: 50;
        }
        .dropdown:hover .dropdown-menu {
          display: flex;
          flex-direction: column;
        }
        .dropdown-menu button {
          padding: 12px 16px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
        }
        .dropdown-menu button:hover {
          background-color: #F8FAFC;
        }
      `}</style>
    </header>
  );
};

export default CustomerHeader;
