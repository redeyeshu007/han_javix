import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Building2,
  FileText,
  CreditCard,
  CheckSquare,
  MessageSquare,
  Key,
  HeartHandshake,
  User,
  Bell
} from 'lucide-react';
import '../admin.css';

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ isOpen, onClose }) => {
  const sections = [
    {
      title: 'HOME',
      items: [
        { name: 'Dashboard', icon: Home, path: '/admin/customer-dashboard' },
      ]
    },
    {
      title: 'MY PROPERTY',
      items: [
        { name: 'My Home', icon: Building2, path: '/admin/customer-home' },
        { name: 'Property Documents', icon: FileText, path: '/admin/customer-documents' },
        { name: 'Payments', icon: CreditCard, path: '/admin/customer-payments' },
      ]
    },
    {
      title: 'INSPECTION & ISSUES',
      items: [
        { name: 'My Inspection', icon: CheckSquare, path: '/admin/customer-inspection' },
        { name: 'My Issues', icon: MessageSquare, path: '/admin/customer-issues' },
      ]
    },
    {
      title: 'HANDOVER & SUPPORT',
      items: [
        { name: 'Handover', icon: Key, path: '/admin/customer-handover' },
        { name: 'Care & Warranty', icon: HeartHandshake, path: '/admin/customer-care' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile', icon: User, path: '/admin/customer-profile' },
        { name: 'Notifications', icon: Bell, path: '/admin/customer-notifications' },
      ]
    }
  ];

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`} style={{ backgroundColor: '#0B1120', color: '#F8FAFC', borderRight: 'none' }}>
        <div className="admin-sidebar__header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/admin/customer-dashboard" className="admin-sidebar__logo" style={{ color: '#FFFFFF' }}>
            HANDOVERLY AI
          </Link>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Homeowner Portal
          </div>
        </div>
        
        <div className="admin-sidebar__content">
          {sections.map((section, index) => (
            <div key={index} style={{ marginBottom: '24px' }}>
              <div className="admin-sidebar__group-title" style={{ color: '#64748B', fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}>
                {section.title}
              </div>
              <nav className="admin-sidebar__nav">
                {section.items.map((item) => (
                  <NavLink 
                    key={item.name} 
                    to={item.path}
                    className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 1024) onClose();
                    }}
                    style={({ isActive }) => ({
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '4px',
                      transition: 'all 0.2s',
                      fontWeight: isActive ? 600 : 500
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={18} style={{ color: isActive ? '#3B82F6' : '#64748B' }} />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
          
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <Link to="/login" className="admin-sidebar__link" style={{ color: '#FCA5A5' }} onClick={() => {
              localStorage.removeItem('mock_session_id');
            }}>
              Logout
            </Link>
          </div>
        </div>
      </aside>
      
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 40, backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}
    </>
  );
};

export default CustomerSidebar;
