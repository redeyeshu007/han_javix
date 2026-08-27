import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  Users, 
  CheckSquare, 
  FileText, 
  LayoutTemplate, 
  MessageSquare, 
  Settings,
  Home,
  Briefcase,
  UserCheck,
  Key,
  HeartHandshake,
  Share2,
  FileBarChart
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import '../admin.css';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { activeRole } = useRole();

  // 1. Super Admin Nav
  const superAdminSections = [
    {
      title: 'Manage',
      items: [
        { name: 'Builders', icon: Building2, path: '/admin/builders' },
        { name: 'Accounts', icon: Users, path: '/admin/accounts' },
        { name: 'Plans', icon: CreditCard, path: '/admin/plans' },
      ]
    },
    {
      title: 'Standards',
      items: [
        { name: 'Checklists', icon: CheckSquare, path: '/admin/checklists' },
        { name: 'Documents', icon: FileText, path: '/admin/documents' },
        { name: 'Templates', icon: LayoutTemplate, path: '/admin/templates' },
      ]
    }
  ];

  // 2. Builder Roles Nav (except contractor)
  const builderSections = [
    {
      title: 'Operations',
      items: [
        { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
        { name: 'Customers', icon: UserCheck, path: '/admin/customers' },
        { name: 'Contractors', icon: Users, path: '/admin/contractors' },
        { name: 'Inspections', icon: CheckSquare, path: '/admin/inspections' },
        { name: 'Defects', icon: FileText, path: '/admin/defects' },
      ]
    },
    {
      title: 'Handover & Beyond',
      items: [
        { name: 'Handover Workspace', icon: Key, path: '/admin/handover' },
        { name: 'Care / Warranty', icon: HeartHandshake, path: '/admin/care' },
        { name: 'Association', icon: Share2, path: '/admin/association' },
      ]
    },
    {
      title: 'Analytics & Management',
      items: [
        { name: 'Team', icon: Users, path: '/admin/team' },
        { name: 'Reports', icon: FileBarChart, path: '/admin/reports' },
      ]
    }
  ];

  // 3. Contractor Nav
  const contractorSections = [
    {
      title: 'Workforce',
      items: [
        { name: 'My Tasks', icon: CheckSquare, path: '/admin/contractor-tasks' },
        { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
      ]
    }
  ];

  // 4. Customer Nav
  const customerSections = [
    {
      title: 'My Home',
      items: [
        { name: 'Dashboard', icon: Home, path: '/admin/customer-dashboard' },
        { name: 'My Home', icon: Building2, path: '/admin/customer-home' },
        { name: 'My Documents', icon: FileText, path: '/admin/customer-documents' },
        { name: 'My Payments', icon: CreditCard, path: '/admin/customer-payments' },
      ]
    },
    {
      title: 'Inspections & Issues',
      items: [
        { name: 'My Inspection', icon: CheckSquare, path: '/admin/customer-inspection' },
        { name: 'My Issues', icon: MessageSquare, path: '/admin/customer-issues' },
      ]
    }
  ];

  // Determine current links to render
  const renderDashboardPath = activeRole === 'super_admin' ? '/admin/dashboard' : activeRole === 'customer' ? '/admin/customer-dashboard' : '/admin/builder-dashboard';
  
  let currentSections = superAdminSections;
  if (activeRole === 'contractor') {
    currentSections = contractorSections;
  } else if (activeRole === 'customer') {
    currentSections = customerSections;
  } else if (activeRole !== 'super_admin') {
    currentSections = builderSections;
  }

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__header">
          <Link to={renderDashboardPath} className="admin-sidebar__logo">
            HANDOVERLY AI
          </Link>
        </div>
        
        <div className="admin-sidebar__content">
          <nav className="admin-sidebar__nav" style={{ marginBottom: '24px' }}>
            {activeRole !== 'contractor' && (
              <NavLink 
                to={renderDashboardPath}
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 1024) onClose();
                }}
              >
                <Home size={18} />
                Home
              </NavLink>
            )}
          </nav>

          {currentSections.map((section, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div className="admin-sidebar__group-title">{section.title}</div>
              <nav className="admin-sidebar__nav">
                {section.items.map((item) => (
                  <NavLink 
                    key={item.name} 
                    to={item.path}
                    className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 1024) onClose();
                    }}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}

          <div style={{ marginTop: 'auto' }}>
            <nav className="admin-sidebar__nav">
              {activeRole === 'super_admin' && (
                <NavLink 
                  to="/admin/support"
                  className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (window.innerWidth <= 1024) onClose();
                  }}
                >
                  <MessageSquare size={18} />
                  Support
                </NavLink>
              )}
              <NavLink 
                to="/admin/settings"
                className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 1024) onClose();
                }}
              >
                <Settings size={18} />
                Settings
              </NavLink>
            </nav>
          </div>
        </div>
      </aside>
      
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 40 }}
          onClick={onClose}
        />
      )}
    </>
  );
};

export default AdminSidebar;
