import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
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

const AdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Redirect /admin to /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Super Admin Routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="builders" element={<BuildersList />} />
        <Route path="builders/new" element={<AddBuilder />} />
        <Route path="builders/:id" element={<BuilderDetail />} />
        <Route path="plans" element={<SubscriptionPlans />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="usage" element={<PlatformUsage />} />
        <Route path="performance" element={<SystemPerformance />} />
        <Route path="checklists" element={<Checklists />} />
        <Route path="documents" element={<Documents />} />
        <Route path="templates" element={<Templates />} />
        <Route path="support" element={<Support />} />
        
        {/* Builder Operations Routes */}
        <Route path="builder-dashboard" element={<BuilderDashboard />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="units/:id" element={<UnitDetail />} />
        <Route path="customers" element={<CustomersList />} />
        <Route path="inspections" element={<InspectionsList />} />
        <Route path="inspections/new" element={<StartInspection />} />
        <Route path="defects" element={<DefectsList />} />
        <Route path="defects/:id" element={<DefectDetail />} />
        <Route path="contractor-tasks" element={<ContractorTasks />} />
        <Route path="handover" element={<HandoverWorkspace />} />
        <Route path="care" element={<CareWorkspace />} />
        <Route path="association" element={<AssociationTransition />} />
        <Route path="team" element={<TeamList />} />
        <Route path="contractors" element={<ContractorsList />} />
        <Route path="reports" element={<Reports />} />

        {/* Customer Portal Routes */}
        <Route path="customer-dashboard" element={<CustomerDashboard />} />
        <Route path="customer-home" element={<CustomerHome />} />
        <Route path="customer-inspection" element={<CustomerInspection />} />
        <Route path="customer-issues" element={<CustomerIssues />} />
        <Route path="customer-documents" element={<CustomerDocuments />} />
        <Route path="customer-payments" element={<CustomerPayments />} />

        {/* Shared Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminApp;
