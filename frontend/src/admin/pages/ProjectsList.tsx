import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Play, Pause, Plus, Search, AlertCircle, Briefcase, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { projectsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { Input, Select } from '../../components/ui/FormElements';
import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES } from '../../utils/roleUtils';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-slate-50 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-600';
  let displayStatus = status;

  if (status === 'active') {
    bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-600';
    displayStatus = 'Active';
  } else if (status === 'draft') {
    bgColor = 'bg-slate-50 text-slate-700 border-slate-200';
    dotColor = 'bg-slate-400';
    displayStatus = 'Draft';
  } else if (status === 'nearing_completion') {
    bgColor = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-600';
    displayStatus = 'Nearing Completion';
  } else if (status === 'completed') {
    bgColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    dotColor = 'bg-indigo-600';
    displayStatus = 'Completed';
  } else if (status === 'archived') {
    bgColor = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-600';
    displayStatus = 'Archived';
  } else {
    // Default fallback for other statuses
    bgColor = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
    displayStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${bgColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mr-1.5`}></span>
      {displayStatus}
    </span>
  );
};

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, activeProjectId } = useRole();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('apartment');
  const [newProjectTypeOther, setNewProjectTypeOther] = useState('');
  const [newStatus, setNewStatus] = useState('active');
  const [newRera, setNewRera] = useState('');
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const projects = await projectsApi.getProjects();
      setData(projects);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole === 'PROJECT_ADMIN' && activeProjectId) {
      navigate(`${ROLE_NAMESPACES['PROJECT_ADMIN']}/projects/${activeProjectId}`, { replace: true });
      return;
    }
    fetchData();
  }, [activeRole, activeProjectId, navigate]);

  if (activeRole === 'PROJECT_ADMIN') {
    if (activeProjectId) {
      return <PageLoading />;
    }
    return (
      <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
          <Briefcase size={40} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-2">No Project Assigned</h2>
          <p className="text-[14px] text-slate-500">
            You have not been assigned to manage any project yet. Please contact the Builder Owner or Super Admin to assign you to a project.
          </p>
        </div>
      </div>
    );
  }

  const handleAction = async (project: any, action: 'view' | 'edit' | 'archive') => {
    const ns = ROLE_NAMESPACES[activeRole as any] || '/builder';
    if (action === 'view') {
      navigate(`${ns}/projects/${project.id}`);
    } else if (action === 'edit') {
      navigate(`${ns}/projects/${project.id}?edit=true`);
    } else if (action === 'archive') {
      try {
        await projectsApi.updateProject(project.id, { status: 'archived' });
        fetchData();
      } catch (err) {
        console.error('Failed to archive project', err);
      }
    }
  };

  const handleCreateProject = async () => {
    const newErrors: any = {};
    if (!newProjectName.trim()) newErrors.newProjectName = 'Required';
    if (newProjectType === 'other' && !newProjectTypeOther.trim()) {
      newErrors.newProjectTypeOther = 'Please specify the custom project type';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsSubmitting(true);
    try {
      await projectsApi.createProject({
        name: newProjectName,
        project_type: newProjectType,
        project_type_other: newProjectType === 'other' ? newProjectTypeOther : undefined,
        status: newStatus,
        rera_number: newRera,
        address: 'TBD'
      });
      setNewProjectName('');
      setNewProjectTypeOther('');
      setNewRera('');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.rera_number && p.rera_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Projects
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Manage your developments and property assets.
            </p>
          </div>
          <div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus size={16} className="mr-1.5" strokeWidth={2.5} />
              Add Project
            </button>
          </div>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Header/Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects by name or RERA..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Project Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">RERA No.</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map(record => {
                  let items: DropdownItem[] = [
                    { key: '1', label: 'View Details', icon: <Eye size={14} />, onClick: () => handleAction(record, 'view') }
                  ];

                  items.push(
                    { key: '2', label: 'Edit Project', icon: <Edit2 size={14} />, onClick: () => handleAction(record, 'edit') },
                    { key: 'div', label: '', divider: true },
                    { key: '3', label: 'Archive', icon: <Pause size={14} />, danger: true, onClick: () => handleAction(record, 'archive') }
                  );

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Building size={16} />
                          </div>
                          <div className="font-semibold text-[#0F172A] text-[13px]">{record.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px] capitalize">
                        {record.project_type === 'other' && record.project_type_other
                          ? record.project_type_other
                          : record.project_type.replace('_', ' ')}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px]">
                        {record.rera_number || '-'}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Dropdown items={items} />
                      </td>
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Briefcase className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No projects found</p>
                        <p className="text-sm mt-1">Get started by creating a new project.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Modal
        title="Create New Project"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateProject} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-2">
          <Input 
            label="Project Name" 
            required 
            error={errors.newProjectName} 
            value={newProjectName} 
            onChange={e => setNewProjectName(e.target.value)} 
            placeholder="e.g. Skyline Towers" 
          />
          <Input 
            label="RERA Number" 
            value={newRera} 
            onChange={e => setNewRera(e.target.value)} 
            placeholder="e.g. RERA-12345" 
          />
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Project Type" 
              value={newProjectType} 
              onChange={e => setNewProjectType(e.target.value)}
              options={[
                { value: 'apartment', label: 'Apartment' },
                { value: 'villa', label: 'Villa' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'mixed_use', label: 'Mixed Use' },
                { value: 'other', label: 'Other' }
              ]}
            />
            {newProjectType === 'other' && (
              <Input 
                label="Custom Project Type" 
                required 
                error={errors.newProjectTypeOther} 
                value={newProjectTypeOther} 
                onChange={e => setNewProjectTypeOther(e.target.value)} 
                placeholder="e.g. Shopping Mall" 
              />
            )}
            <Select 
              label="Initial Status" 
              value={newStatus} 
              onChange={e => setNewStatus(e.target.value)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' }
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsList;
