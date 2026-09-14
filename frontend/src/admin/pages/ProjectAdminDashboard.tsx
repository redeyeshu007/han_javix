import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CheckSquare, 
  AlertCircle, 
  Key, 
  Briefcase
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useRole } from '../../context/RoleContext';
import KPIOrb from '../components/KPIOrb';

interface ProjectDashboardData {
  project_name: string;
  total_units: number;
  assigned_customers: number;
  unassigned_units: number;
  nearing_handover: number;
  handed_over: number;
  open_defects: number;
  readiness_status: {
    not_ready: number;
    inspections_in_progress: number;
    defects_pending: number;
    ready: number;
  };
}

const ProjectAdminDashboard: React.FC = () => {
  const { activeProjectId, activeProjectName } = useRole();
  const [data, setData] = useState<ProjectDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no project is assigned yet, skip the fetch entirely.
    if (!activeProjectId) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch dashboard directly using project ID from context —
        // no need to list all projects and pick [0] (crash source).
        const dashRes = await apiClient.get(`/projects/projects/${activeProjectId}/admin_dashboard/`);
        setData(dashRes.data);
      } catch (err: any) {
        console.error('Project Admin Dashboard Error:', err);
        setError(err.response?.data?.detail || err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [activeProjectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // No project assigned — show friendly message instead of crashing.
  if (!activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#F8FAFC] gap-4">
        <Briefcase size={48} className="text-slate-300" />
        <div className="text-center">
          <p className="font-semibold text-slate-700 text-lg">No Project Assigned</p>
          <p className="text-sm text-slate-400 mt-1">Contact your Builder Owner to assign a project to your account.</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#F8FAFC]">
        <AlertCircle size={48} className="mb-4 text-slate-400" />
        <p>{error || 'No data available'}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full">
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 mt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4 shadow-sm">
              <Briefcase size={14} className="text-[#3B82F6]" />
              Project Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
              {data.project_name || activeProjectName}
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-[15px] leading-relaxed">
              Monitor unit readiness, customer assignments, and handover progress for your assigned project.
            </p>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPIOrb 
            title="Total Units" 
            value={data.total_units} 
            icon={Building2} 
            colorHex="#3B82F6"
            subtitle="+0"
          />
          <KPIOrb 
            title="Assigned Customers" 
            value={data.assigned_customers} 
            icon={Users} 
            colorHex="#10B981"
            subtitle={data.unassigned_units > 0 ? `${data.unassigned_units} pending` : 'All assigned'}
          />
          <KPIOrb 
            title="Open Defects" 
            value={data.open_defects} 
            icon={AlertCircle} 
            colorHex="#F59E0B"
            subtitle="Active issues"
          />
          <KPIOrb 
            title="Handed Over" 
            value={data.handed_over} 
            icon={Key} 
            colorHex="#6366F1"
            subtitle={`${data.nearing_handover} nearing`}
          />
        </section>

        {/* Readiness Breakdown */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CheckSquare className="text-indigo-500" size={20} />
                  Handover Readiness Breakdown
                </h2>
                <p className="text-sm text-slate-500 mt-1">Real-time unit status across the project</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-slate-700">{data.readiness_status.not_ready}</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-2">Not Ready</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-blue-700">{data.readiness_status.inspections_in_progress}</span>
                <span className="text-xs font-medium text-blue-600/70 uppercase tracking-wider mt-2">Inspecting</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/50 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-amber-700">{data.readiness_status.defects_pending}</span>
                <span className="text-xs font-medium text-amber-600/70 uppercase tracking-wider mt-2">Defects Pending</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-emerald-700">{data.readiness_status.ready}</span>
                <span className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider mt-2">Ready</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProjectAdminDashboard;
