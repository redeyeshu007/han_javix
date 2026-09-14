import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  Settings,
  Home,
  Briefcase,
  Construction,
  AlertTriangle,
  Building,
  UserCheck,
  Key,
  HeartHandshake,
  Share2,
  FileBarChart,
  User,
  Bell,
  X
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES, AppRole } from '../../utils/roleUtils';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { activeRole, activeProjectId, activeProjectName } = useRole();

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const ns = ROLE_NAMESPACES[activeRole as AppRole] || '/admin';

  // Sections definition (same as before)
  const superAdminSections = [
    {
      title: 'Manage',
      items: [
        { name: 'Builders', icon: Building2, path: `${ns}/builders` },
        { name: 'Plans', icon: CreditCard, path: `${ns}/plans` },
        { name: 'Billing', icon: CreditCard, path: `${ns}/billing` },
      ]
    },
    {
      title: 'Standards',
      items: [
        { name: 'Checklists', icon: CheckSquare, path: `${ns}/checklists` },
      ]
    }
  ];

  const builderOwnerSections = [
    {
      title: 'Company',
      items: [
        { name: 'Dashboard', icon: Home, path: `${ns}/dashboard` },
        { name: 'Projects', icon: Briefcase, path: `${ns}/projects` },
        { name: 'Team', icon: Users, path: `${ns}/team` },
        { name: 'Contractors', icon: Construction, path: `${ns}/contractors` },
        { name: 'Customers', icon: UserCheck, path: `${ns}/customers` },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Inspections', icon: CheckSquare, path: `${ns}/inspections` },
        { name: 'Defects / Snags', icon: AlertTriangle, path: `${ns}/defects` },
        { name: 'Handover Status', icon: Key, path: `${ns}/handover` },
        { name: 'Care / Warranty', icon: HeartHandshake, path: `${ns}/care` },
        { name: 'Association', icon: Building, path: `${ns}/association` },
      ]
    },
    {
      title: 'Reports',
      items: [
        { name: 'Reports', icon: FileBarChart, path: `${ns}/reports` },
      ]
    }
  ];

  const builderSections = [
    {
      title: 'Manage',
      items: [
        { name: 'Projects', icon: Briefcase, path: `${ns}/projects` },
        { name: 'Customers', icon: UserCheck, path: `${ns}/customers` },
        { name: 'Team', icon: Users, path: `${ns}/team` },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Inspections', icon: CheckSquare, path: `${ns}/inspections` },
        { name: 'Defects', icon: FileText, path: `${ns}/defects` },
        { name: 'Handover', icon: Key, path: `${ns}/handover` },
      ]
    },
    {
      title: 'Reports',
      items: [
        { name: 'Reports', icon: FileBarChart, path: `${ns}/reports` },
      ]
    }
  ];

  const contractorSections = [
    {
      title: 'Workforce',
      items: [
        { name: 'My Tasks', icon: CheckSquare, path: `${ns}/tasks` },
        { name: 'Projects', icon: Briefcase, path: `${ns}/projects` },
      ]
    }
  ];

  const projectAdminSections = [
    {
      title: 'Project Scope',
      items: [
        { name: 'Dashboard', icon: Home, path: `${ns}/dashboard` },
        { name: 'Project Overview', icon: Briefcase, path: `${ns}/projects${activeProjectId ? `/${activeProjectId}` : ''}` },
        { name: 'Customers', icon: UserCheck, path: `${ns}/customers` },
      ]
    },
    {
      title: 'Operations',
      items: [
        { name: 'Handover Status', icon: Key, path: `${ns}/handover` },
      ]
    }
  ];

  const customerSections = [
    {
      title: 'My Home',
      items: [
        { name: 'Dashboard', icon: Home, path: `${ns}/dashboard` },
        { name: 'My Home', icon: Building2, path: `${ns}/unit` },
        { name: 'My Documents', icon: FileText, path: `${ns}/documents` },
        { name: 'My Payments', icon: CreditCard, path: `${ns}/payments` },
      ]
    },
    {
      title: 'Inspections & Issues',
      items: [
        { name: 'My Inspection', icon: CheckSquare, path: `${ns}/inspection` },
        { name: 'My Issues', icon: MessageSquare, path: `${ns}/defects` },
      ]
    },
    {
      title: 'Handover & Beyond',
      items: [
        { name: 'Handover', icon: Key, path: `${ns}/handover` },
        { name: 'Care / Warranty', icon: HeartHandshake, path: `${ns}/warranty` },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile', icon: User, path: `${ns}/settings` },
        { name: 'Notifications', icon: Bell, path: `${ns}/notifications` },
      ]
    }
  ];

  const accountsSections = [
    {
      title: 'Financial Operations',
      items: [
        { name: 'Payments', icon: CreditCard, path: `${ns}/payments` },
        { name: 'Charges', icon: FileText, path: `${ns}/charges` },
        { name: 'Payment Verification', icon: CheckSquare, path: `${ns}/verification` },
        { name: 'Financial Clearance', icon: Briefcase, path: `${ns}/clearance` },
      ]
    },
    {
      title: 'Customers',
      items: [
        { name: 'Customers', icon: UserCheck, path: `${ns}/customers` },
      ]
    }
  ];

  const siteEngineerSections = [
    {
      title: 'Technical Scope',
      items: [
        { name: 'Inspections', icon: CheckSquare, path: `${ns}/inspections` },
        { name: 'Defects', icon: FileText, path: `${ns}/defects` },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Settings', icon: Settings, path: `${ns}/settings` }
      ]
    }
  ];

  const renderDashboardPath = activeRole === 'SITE_ENGINEER' ? `${ns}/inspections` : `${ns}/dashboard`;
  
  let currentSections = superAdminSections;
  if (activeRole === 'CONTRACTOR') {
    currentSections = contractorSections;
  } else if (activeRole === 'CUSTOMER') {
    currentSections = customerSections;
  } else if (activeRole === 'ACCOUNTS') {
    currentSections = accountsSections;
  } else if (activeRole === 'PROJECT_ADMIN') {
    currentSections = projectAdminSections;
  } else if (activeRole === 'SITE_ENGINEER') {
    currentSections = siteEngineerSections;
  } else if (activeRole !== 'SUPER_ADMIN') {
    currentSections = builderSections;
  }

  return (
    <>
      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-[#0B1F33]/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-[260px] bg-[#0B1F33] text-white z-[70] flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[4px_0_24px_rgba(0,0,0,0.15)] border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5 relative">
          <div className="flex flex-col">
            <Link to={renderDashboardPath} className="font-bold text-[16px] tracking-wide text-white leading-tight" onClick={onClose}>
              HANDOVERLY <span className="text-[#3B82F6]">AI</span>
            </Link>
            {activeRole === 'ACCOUNTS' && (
              <span className="text-[11px] text-slate-400 mt-1 truncate max-w-[180px] font-medium tracking-wide">
                {activeProjectName ? `${activeProjectName} · Accounts` : 'Accounts Console'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none">
          {activeRole !== 'CONTRACTOR' && (
            <div className="mb-6">
              <div className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider mb-2 px-2">Overview</div>
              <nav className="space-y-0.5">
                <NavLink
                  to={renderDashboardPath}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${isActive ? 'bg-[#1E3A8A]/50 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <>
                      <Home size={16} className={`${isActive ? 'text-[#60A5FA]' : 'text-slate-400 group-hover:text-slate-300'} transition-colors`} />
                      <span>Dashboard</span>
                    </>
                  )}
                </NavLink>
              </nav>
            </div>
          )}

          {currentSections.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider mb-2 px-2">{section.title}</div>
              <nav className="space-y-0.5">
                {section.items.filter((item) => item.name !== 'Team' || activeRole === 'BUILDER_OWNER').map((item) => (
                  <NavLink 
                    key={item.name} 
                    to={item.path}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${isActive ? 'bg-[#1E3A8A]/50 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={16} className={`${isActive ? 'text-[#60A5FA]' : 'text-slate-400 group-hover:text-slate-300'} transition-colors`} />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}

          <div className="mt-auto pt-6 border-t border-white/5">
            <nav className="space-y-0.5">
              <NavLink 
                to={`${ns}/settings`}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${isActive ? 'bg-[#1E3A8A]/50 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <Settings size={16} className={`${isActive ? 'text-[#60A5FA]' : 'text-slate-400 group-hover:text-slate-300'} transition-colors`} />
                    <span>Settings</span>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
