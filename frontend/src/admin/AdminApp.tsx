import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import CustomerLayout from './CustomerLayout';
import Dashboard from './pages/Dashboard';
import BuildersList from './pages/BuildersList';
import BuilderDetail from './pages/BuilderDetail';
import AddBuilder from './pages/AddBuilder';
import SubscriptionPlans from './pages/SubscriptionPlans';
import Accounts from './pages/Accounts';
import PlatformUsage from './pages/PlatformUsage';
import SystemPerformance from './pages/SystemPerformance';
import Checklists from './pages/Checklists';
import Documents from './pages/Documents';
import Templates from './pages/Templates';
import Support from './pages/Support';
import Settings from './pages/Settings';

// New Builder Roles & Workflows Pages
import BuilderDashboard from './pages/BuilderDashboard';
import AccountsDashboard from './pages/AccountsDashboard';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import UnitDetail from './pages/UnitDetail';
import CustomersList from './pages/CustomersList';
import InspectionsList from './pages/InspectionsList';
import StartInspection from './pages/StartInspection';
import DefectsList from './pages/DefectsList';
import DefectDetail from './pages/DefectDetail';
import ContractorTasks from './pages/ContractorTasks';
import HandoverWorkspace from './pages/HandoverWorkspace';
import CareWorkspace from './pages/CareWorkspace';
import AssociationTransition from './pages/AssociationTransition';
import TeamList from './pages/TeamList';
import ContractorsList from './pages/ContractorsList';
import Reports from './pages/Reports';

// Customer Portal Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerHome from './pages/CustomerHome';
import CustomerInspection from './pages/CustomerInspection';
import CustomerIssues from './pages/CustomerIssues';
import CustomerDocuments from './pages/CustomerDocuments';
import CustomerPayments from './pages/CustomerPayments';
import CustomerHandover from './pages/CustomerHandover';
import CustomerCare from './pages/CustomerCare';
import CustomerProfile from './pages/CustomerProfile';
import CustomerNotifications from './pages/CustomerNotifications';

import ProjectAccessGuard from '../components/ProjectAccessGuard';
import ProtectedRoute from '../components/ProtectedRoute';

// Role groups mirroring what each role actually sees in AdminSidebar — a route
// not reachable from a role's nav should not be reachable by typing its URL either.
const SUPER_ADMIN = ['super_admin'];
const BUILDER_STAFF = ['builder_admin', 'project_manager', 'site_engineer', 'crm'];
const BUILDER_STAFF_AND_MORE = ['builder_admin', 'project_manager', 'site_engineer', 'crm', 'accounts', 'contractor'];
const ACCOUNTS_ONLY = ['accounts'];
const CONTRACTOR_ONLY = ['contractor'];

const guard = (roles: string[], element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
);

const AdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Redirect /admin to /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Super Admin Routes */}
        <Route path="dashboard" element={guard(SUPER_ADMIN, <Dashboard />)} />
        <Route path="builders" element={guard(SUPER_ADMIN, <BuildersList />)} />
        <Route path="builders/new" element={guard(SUPER_ADMIN, <AddBuilder />)} />
        <Route path="builders/:id" element={guard(SUPER_ADMIN, <BuilderDetail />)} />
        <Route path="plans" element={guard(SUPER_ADMIN, <SubscriptionPlans />)} />
        <Route path="accounts" element={guard(SUPER_ADMIN, <Accounts />)} />
        <Route path="usage" element={guard(SUPER_ADMIN, <PlatformUsage />)} />
        <Route path="performance" element={guard(SUPER_ADMIN, <SystemPerformance />)} />
        <Route path="checklists" element={guard(SUPER_ADMIN, <Checklists />)} />
        <Route path="documents" element={guard(SUPER_ADMIN, <Documents />)} />
        <Route path="templates" element={guard(SUPER_ADMIN, <Templates />)} />
        <Route path="support" element={guard(SUPER_ADMIN, <Support />)} />

        {/* Builder Operations Routes */}
        <Route path="builder-dashboard" element={guard(BUILDER_STAFF, <BuilderDashboard />)} />
        <Route path="accounts-dashboard" element={guard(ACCOUNTS_ONLY, <AccountsDashboard />)} />
        <Route path="projects" element={guard(BUILDER_STAFF_AND_MORE, <ProjectsList />)} />
        <Route path="projects/:id" element={guard(BUILDER_STAFF_AND_MORE, <ProjectAccessGuard type="project"><ProjectDetail /></ProjectAccessGuard>)} />
        <Route path="units/:id" element={guard(BUILDER_STAFF_AND_MORE, <ProjectAccessGuard type="unit"><UnitDetail /></ProjectAccessGuard>)} />
        <Route path="customers" element={guard([...BUILDER_STAFF, 'accounts'], <CustomersList />)} />
        <Route path="inspections" element={guard(BUILDER_STAFF, <InspectionsList />)} />
        <Route path="inspections/new" element={guard(BUILDER_STAFF, <StartInspection />)} />
        <Route path="defects" element={guard(BUILDER_STAFF, <DefectsList />)} />
        <Route path="defects/:id" element={guard(BUILDER_STAFF, <DefectDetail />)} />
        <Route path="contractor-tasks" element={guard(CONTRACTOR_ONLY, <ContractorTasks />)} />
        <Route path="handover" element={guard(BUILDER_STAFF, <HandoverWorkspace />)} />
        <Route path="care" element={guard(BUILDER_STAFF, <CareWorkspace />)} />
        <Route path="association" element={guard(BUILDER_STAFF, <AssociationTransition />)} />
        <Route path="team" element={guard(BUILDER_STAFF, <TeamList />)} />
        <Route path="contractors" element={guard(BUILDER_STAFF, <ContractorsList />)} />
        <Route path="reports" element={guard(BUILDER_STAFF, <Reports />)} />

        {/* Shared Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Customer Routes Wrapped in CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="customer-dashboard" element={<CustomerDashboard />} />
        <Route path="customer-home" element={<CustomerHome />} />
        <Route path="customer-inspection" element={<CustomerInspection />} />
        <Route path="customer-issues" element={<CustomerIssues />} />
        <Route path="customer-documents" element={<CustomerDocuments />} />
        <Route path="customer-payments" element={<CustomerPayments />} />
        <Route path="customer-handover" element={<CustomerHandover />} />
        <Route path="customer-care" element={<CustomerCare />} />
        <Route path="customer-profile" element={<CustomerProfile />} />
        <Route path="customer-notifications" element={<CustomerNotifications />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
