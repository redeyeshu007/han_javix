import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, ChevronDown, User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMenuClick }) => {
  const { logout } = useAuth();
  const { activeRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Profile Mapping
  const roleMetadata: Record<string, { label: string; sub: string; avatar: string }> = {
    super_admin: { label: 'Admin', sub: 'Handoverly Super Admin', avatar: 'SA' },
    builder_admin: { label: 'Builder Admin', sub: 'Green Valley Admin', avatar: 'BA' },
    project_manager: { label: 'Alex PM', sub: 'Project Manager', avatar: 'PM' },
    site_engineer: { label: 'John Inspector', sub: 'Site Inspector', avatar: 'SI' },
    crm: { label: 'Sarah Connor', sub: 'CRM / Customer Team', avatar: 'CR' },
    accounts: { label: 'David Accountant', sub: 'Accounts Team', avatar: 'AC' },
    contractor: { label: 'Apex Plumbing', sub: 'Contractor Partner', avatar: 'CO' },
  };

  const meta = roleMetadata[activeRole] || { label: 'User', sub: 'Member', avatar: 'US' };

  // Page title mapping based on route path
  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('builder-dashboard') || path.endsWith('dashboard')) return 'Dashboard';
    if (path.includes('builders/new')) return 'Onboard Builder';
    if (path.includes('builders/')) return 'Builder details';
    if (path.includes('builders')) return 'Builders Directory';
    if (path.includes('projects/')) return 'Project Details';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('plans')) return 'Subscription Plans';
    if (path.includes('accounts')) return 'Accounts';
    if (path.includes('checklists')) return 'Checklist Library';
    if (path.includes('documents')) return 'Document Categories';
    if (path.includes('templates')) return 'Templates';
    if (path.includes('support')) return 'Support Inbox';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('customers')) return 'Customers';
    if (path.includes('inspections')) return 'Inspections';
    if (path.includes('defects')) return 'Defects';
    if (path.includes('handover')) return 'Handover Readiness';
    if (path.includes('care')) return 'Care & Warranty';
    if (path.includes('association')) return 'Association Transition';
    if (path.includes('team')) return 'Team Directory';
    if (path.includes('reports')) return 'Performance Reports';
    if (path.includes('contractor-tasks')) return 'My Tasks';
    return 'Control Center';
  };

  return (
    <div className="admin-topbar">
      
      {/* LEFT: Menu & Title */}
      <div className="admin-topbar__left">
        <button className="topbar-btn" onClick={onMenuClick} aria-label="Toggle Menu">
          <Menu size={20} />
        </button>
        <h2 className="admin-topbar__title">{getPageTitle()}</h2>
      </div>

      {/* CENTER: Search */}
      <div className="admin-topbar__center">
        <div className="admin-topbar__search">
          <Search size={20} color="#718096" />
          <input type="text" placeholder="Search Handoverly..." />
          <div className="admin-topbar__search-shortcut">Ctrl K</div>
        </div>
      </div>

      {/* RIGHT: Notifications, Profile, Logout */}
      <div className="admin-topbar__right">
        
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button 
            className="topbar-btn topbar-btn--notification"
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
          >
            <Bell size={20} />
            <div className="topbar-btn__indicator" />
          </button>

          {showNotificationDropdown && (
            <div className="topbar-dropdown" style={{ right: 0, width: '300px' }}>
              <div className="topbar-dropdown__header">
                <h4 className="topbar-dropdown__header-title">Notifications</h4>
                <p className="topbar-dropdown__header-subtitle">3 new notifications</p>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <a href="#" className="notification-item">
                  <span className="notification-item__title">Inspection assigned: Unit A-101</span>
                  <span className="notification-item__time">2 minutes ago</span>
                </a>
                <a href="#" className="notification-item">
                  <span className="notification-item__title">Defect resolved: DFT-001 by Apex Plumbing</span>
                  <span className="notification-item__time">15 minutes ago</span>
                </a>
                <a href="#" className="notification-item">
                  <span className="notification-item__title">Support request update received</span>
                  <span className="notification-item__time">1 hour ago</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="topbar-divider" />

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            className="topbar-profile"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationDropdown(false);
            }}
          >
            <div className="topbar-profile__text">
              <span className="topbar-profile__name">{meta.label}</span>
              <span className="topbar-profile__role">{meta.sub}</span>
            </div>
            <div className="topbar-profile__avatar">{meta.avatar}</div>
            <ChevronDown size={14} className="topbar-profile__arrow" />
          </div>

          {showProfileDropdown && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown__header" style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="topbar-profile__avatar" style={{ width: '48px', height: '48px' }}>{meta.avatar}</div>
                <div>
                  <h4 className="topbar-dropdown__header-title">{meta.label}</h4>
                  <p className="topbar-dropdown__header-subtitle">{activeRole === 'super_admin' ? 'admin@handoverly.com' : 'staff@greenvalley.com'}</p>
                </div>
              </div>
              
              <button className="topbar-dropdown__item">
                <User size={16} color="#718096" /> Profile
              </button>
              <button className="topbar-dropdown__item">
                <Shield size={16} color="#718096" /> Security
              </button>
              <button className="topbar-dropdown__item" onClick={() => navigate('/admin/settings')}>
                <Settings size={16} color="#718096" /> Settings
              </button>
              
              <div className="topbar-dropdown__divider" />
              
              <button className="topbar-dropdown__item" onClick={handleLogout}>
                <LogOut size={16} color="#718096" /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Logout (Far Right) */}
        <button className="topbar-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </button>

      </div>
    </div>
  );
};

export default AdminTopbar;
