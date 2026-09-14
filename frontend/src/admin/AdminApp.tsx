import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import CustomerLayout from './CustomerLayout';
import { useRole } from '../context/RoleContext';

import Dashboard from './pages/Dashboard';
import BuildersList from './pages/BuildersList';
import BuilderDetail from './pages/BuilderDetail';
import AddBuilder from './pages/AddBuilder';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SubscriptionBilling from './pages/SubscriptionBilling';
import Settings from './pages/Settings';
import Checklists from './pages/Checklists';

import BuilderDashboard from './pages/BuilderDashboard';
import AccountsDashboard from './pages/AccountsDashboard';
import AccountsPayments from './pages/AccountsPayments';
import AccountsFinancialClearance from './pages/AccountsFinancialClearance';
import AccountsCharges from './pages/AccountsCharges';
import AccountsVerification from './pages/AccountsVerification';
import AccountsCustomers from './pages/AccountsCustomers';
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
import ProjectAdminDashboard from './pages/ProjectAdminDashboard';


import ProjectAccessGuard from '../components/ProjectAccessGuard';

const AdminApp: React.FC = () => {
  const { activeRole } = useRole();

  if (activeRole === 'SUPER_ADMIN') {
    return (
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="builders" element={<BuildersList />} />
          <Route path="builders/new" element={<AddBuilder />} />
          <Route path="builders/:id" element={<BuilderDetail />} />
          <Route path="plans" element={<SubscriptionPlans />} />
          <Route path="billing" element={<SubscriptionBilling />} />
          <Route path="checklists" element={<Checklists />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    );
  }

  if (activeRole === 'CUSTOMER') {
    return (
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="unit" element={<CustomerHome />} />
          <Route path="inspection" element={<CustomerInspection />} />
          <Route path="defects" element={<CustomerIssues />} />
          <Route path="documents" element={<CustomerDocuments />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="handover" element={<CustomerHandover />} />
          <Route path="warranty" element={<CustomerCare />} />
          <Route path="settings" element={<CustomerProfile />} />
          <Route path="notifications" element={<CustomerNotifications />} />
        </Route>
      </Routes>
    );
  }

  if (activeRole === 'CONTRACTOR') {
    return (
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ContractorTasks />} />
          <Route path="tasks" element={<ContractorTasks />} />
          <Route path="defects" element={<DefectsList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    );
  }

  if (activeRole === 'ACCOUNTS') {
    return (
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AccountsDashboard />} />
          <Route path="payments" element={<AccountsPayments />} />
          <Route path="charges" element={<AccountsCharges />} />
          <Route path="verification" element={<AccountsVerification />} />
          <Route path="clearance" element={<AccountsFinancialClearance />} />
          <Route path="customers" element={<AccountsCustomers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    );
  }

  if (activeRole === 'SITE_ENGINEER') {
    return (
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="inspections" replace />} />
          <Route path="inspections" element={<InspectionsList />} />
          <Route path="inspections/new" element={<StartInspection />} />
          <Route path="inspections/:inspectionId" element={<StartInspection />} />
          <Route path="defects" element={<DefectsList />} />
          <Route path="defects/:id" element={<DefectDetail />} />
          {/* View Unit: read-only unit detail. UnitDetail is role-aware and hides edit actions for SITE_ENGINEER */}
          <Route path="units/:id" element={<UnitDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    );
  }

  // BUILDER_OWNER, PROJECT_ADMIN, ASSOCIATION_REPRESENTATIVE
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={activeRole === 'PROJECT_ADMIN' ? <ProjectAdminDashboard /> : <BuilderDashboard />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:id" element={<ProjectAccessGuard type="project"><ProjectDetail /></ProjectAccessGuard>} />
        <Route path="units/:id" element={<ProjectAccessGuard type="unit"><UnitDetail /></ProjectAccessGuard>} />
        <Route path="customers" element={<CustomersList />} />
        <Route path="inspections" element={<InspectionsList />} />
        <Route path="inspections/new" element={<StartInspection />} />
        <Route path="inspections/:inspectionId" element={<StartInspection />} />
        <Route path="defects" element={<DefectsList />} />
        <Route path="defects/:id" element={<DefectDetail />} />
        <Route path="handover" element={<HandoverWorkspace />} />
        <Route path="care" element={<CareWorkspace />} />
        <Route path="association" element={<AssociationTransition />} />
        <Route path="team" element={activeRole === 'BUILDER_OWNER' ? <TeamList /> : <Navigate to="dashboard" replace />} />
        <Route path="contractors" element={<ContractorsList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
