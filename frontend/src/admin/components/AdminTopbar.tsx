import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationsApi } from '../../api/services';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
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

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const [count, notifs] = await Promise.all([
        notificationsApi.getUnreadCount(),
        notificationsApi.getNotifications()
      ]);
      setUnreadCount(count);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await notificationsApi.markAsRead(notif.id);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    // Navigate logic based on notification type
  };

  // ... Profile Mapping ...
  const roleMetadata: Record<string, { label: string; sub: string; avatar: string }> = {
    SUPER_ADMIN: { label: 'Admin', sub: 'Handoverly Super Admin', avatar: 'SA' },
    BUILDER_OWNER: { label: 'Builder Admin', sub: 'Green Valley Admin', avatar: 'BA' },
    SITE_ENGINEER: { label: 'John Inspector', sub: 'Site Inspector', avatar: 'SI' },
    ACCOUNTS: { label: 'David Accountant', sub: 'Accounts Team', avatar: 'AC' },
    CONTRACTOR: { label: 'Apex Plumbing', sub: 'Contractor Partner', avatar: 'CO' },
    CUSTOMER: { label: 'Property Owner', sub: 'Resident', avatar: 'PO' },
  };

  // Clone meta to avoid mutating the shared object
  const meta = { ...(roleMetadata[activeRole] || { label: 'User', sub: 'Member', avatar: 'US' }) };

  if (user) {
    // Determine if the user has a real display name (not just their email)
    const hasRealName = user.name && user.name !== user.email;

    if (activeRole === 'SUPER_ADMIN') {
      meta.label = hasRealName ? user.name : 'Handoverly Super Admin';
      meta.sub = user.email || 'admin@handoverly.com';
    } else {
      if (hasRealName) {
        meta.label = user.name;
      }
      if (user.builder_company_name) {
        meta.sub = user.builder_company_name;
      }
    }

    if (hasRealName) {
      const parts = user.name.split(' ');
      meta.avatar = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    }
  }

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
    if (path.includes('billing')) return 'Subscription Billing';

    if (path.includes('accounts-dashboard')) return 'Accounts Dashboard';
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
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={showNotificationDropdown}
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && <div className="topbar-btn__indicator" />}
          </button>

          {showNotificationDropdown && (
            <div className="topbar-dropdown" style={{ right: 0, width: '300px' }}>
              <div className="topbar-dropdown__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 className="topbar-dropdown__header-title">Notifications</h4>
                  <p className="topbar-dropdown__header-subtitle">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800">
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <button 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`notification-item w-full text-left ${!notif.is_read ? 'bg-blue-50' : ''}`}
                    >
                      <span className={`notification-item__title ${!notif.is_read ? 'font-semibold text-blue-900' : ''}`}>
                        {notif.message}
                      </span>
                      <span className="notification-item__time">
                        {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </button>
                  ))
                )}
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
                  <p className="topbar-dropdown__header-subtitle">{user?.email || 'staff@handoverly.com'}</p>
                </div>
              </div>
              

              <button className="topbar-dropdown__item" onClick={() => navigate(`/${activeRole === 'SUPER_ADMIN' ? 'admin' : activeRole.toLowerCase().replace('_', '-')}/settings`)}>
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
