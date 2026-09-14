import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Building2, Mail, Phone, MapPin, Calendar, CreditCard, Edit2 } from 'lucide-react';
import { buildersApi, projectsApi, usersApi, unitsApi } from '../../api/services';
import { Builder, Project } from '../../types';
import { PageLoading } from '../../components/LoadingState';

// Helper component for status badges
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isSuspended = status === 'Suspended';
  const isPending = status === 'Pending';
  const isPlanning = status === 'Planning';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider
      ${isSuspended ? 'bg-red-50 text-red-700 border-red-200' 
      : isPending || isPlanning ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
    `}>
      {isSuspended && <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>}
      {(isPending || isPlanning) && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
      {!isSuspended && !isPending && !isPlanning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {status}
    </span>
  );
};

const BuilderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [loading, setLoading] = useState(true);
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', address: '' });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const details = await buildersApi.getBuilderDetails(id);
      setBuilder(details.builder);
      setUsage(details.usage);
      setLimits(details.limits);
      setProjects(details.projects || []);
      
      if (details.builder) {
        setForm({ 
          name: details.builder.name, 
          contact: details.builder.contact, 
          email: details.builder.email, 
          phone: details.builder.phone, 
          address: details.builder.address 
        });
      }
    } catch (error) {
      console.error('Failed to load builder details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  const handleToggleStatus = async () => {
    if (!builder) return;
    const newStatus = builder.status === 'Suspended' ? 'Active' : 'Suspended';
    setIsSubmitting(true);
    try {
      await buildersApi.updateBuilder(builder.id, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Failed to update builder status', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!builder) return;
    setIsSubmitting(true);
    try {
      await buildersApi.updateBuilder(builder.id, form);
      await fetchData();
      setIsEditing(false);
      navigate(`/admin/builders/${builder.id}`, { replace: true });
    } catch (error) {
      console.error('Failed to update builder', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

  if (!builder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] text-slate-500">
        <h2 className="text-xl font-bold text-[#0F172A] mb-4">Builder not found</h2>
        <button 
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-sm font-medium transition-colors"
          onClick={() => navigate('/admin/builders')}
        >
          Back to Builders
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1 relative z-0">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#2563EB]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* Navigation */}
        <button
          onClick={() => navigate('/admin/builders')}
          className="inline-flex items-center text-[13px] font-semibold text-slate-500 hover:text-[#0F172A] transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to Builders
        </button>

        {/* Page Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[28px] lg:text-[32px] font-bold text-[#0B1F33] tracking-tight leading-tight">
                {builder.name}
              </h1>
              <StatusBadge status={builder.status} />
            </div>
            <p className="text-[14px] text-slate-500 font-medium flex items-center gap-2">
              <Building2 size={16} /> Builder Profile • Joined {builder.joined}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-[#0F172A] text-[13px] font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Edit2 size={16} className="mr-2 text-slate-400" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {builder.status === 'Suspended' ? (
              <button 
                onClick={handleToggleStatus} disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Play size={16} className="mr-2" /> Activate Account
              </button>
            ) : (
              <button 
                onClick={handleToggleStatus} disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[13px] font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Pause size={16} className="mr-2" /> Suspend Account
              </button>
            )}
          </div>
        </section>

        {/* KPI Banner */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 mb-8 overflow-hidden">
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Projects</div>
            <div className="text-[28px] font-bold text-[#0F172A] leading-none">
              {usage?.projects || 0}
              {limits?.max_projects && <span className="text-sm text-slate-400 font-normal ml-1">/ {limits.max_projects}</span>}
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Units</div>
            <div className="text-[28px] font-bold text-[#0F172A] leading-none">
              {usage?.units || 0}
              {limits?.max_units && <span className="text-sm text-slate-400 font-normal ml-1">/ {limits.max_units}</span>}
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Users</div>
            <div className="text-[28px] font-bold text-[#0F172A] leading-none">
              {usage?.active_users || 0}
              {limits?.max_users && <span className="text-sm text-slate-400 font-normal ml-1">/ {limits.max_users}</span>}
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Storage Used</div>
            <div className="text-[28px] font-bold text-[#0F172A] leading-none">
              {usage?.storage_used_gb || 0} <span className="text-sm text-slate-500 font-medium">GB</span>
              {limits?.storage_limit_gb && <span className="text-sm text-slate-400 font-normal ml-1">/ {limits.storage_limit_gb}</span>}
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center bg-slate-50/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Plan</div>
            <div className="text-[18px] font-bold text-[#2563EB] flex items-center gap-2 mt-1">
              <CreditCard size={18} />
              {builder.plan || 'Free'}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 max-w-3xl">
            <h3 className="text-[16px] font-bold text-[#0F172A] mb-6 border-b border-slate-100 pb-4">Edit Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                <input 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors shadow-sm" 
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Contact</label>
                <input 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors shadow-sm" 
                  value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                <input 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors shadow-sm" 
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors shadow-sm" 
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                <input 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors shadow-sm" 
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} 
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
              <button 
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[13px] font-semibold rounded-lg shadow-sm transition-colors" 
                onClick={() => { setIsEditing(false); navigate(`/admin/builders/${builder.id}`, { replace: true }); }} 
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors" 
                onClick={handleSaveEdit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-6">Company Information</h3>
              <div className="space-y-6 flex-1">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Registered Address</div>
                    <div className="text-[14px] text-[#0F172A] font-medium leading-relaxed">{builder.address}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Business Registration</div>
                    <div className="text-[14px] text-[#0F172A] font-medium">{builder.brn}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-6">Contact Details</h3>
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</div>
                      <div className="text-[14px] text-[#0F172A] font-medium truncate">{builder.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</div>
                      <div className="text-[14px] text-[#0F172A] font-medium">{builder.phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Contact</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-[10px] font-bold">
                      {builder.contact.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-semibold text-[#0F172A]">{builder.contact}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Summary Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-12">
          <div className="p-5 border-b border-slate-200 bg-white">
            <h3 className="text-[16px] font-bold text-[#0F172A]">Project Summary</h3>
          </div>
          
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Building2 className="w-10 h-10 mb-3 opacity-40" />
              <p className="font-medium text-[#0F172A]">No projects found</p>
              <p className="text-sm mt-1">This builder hasn't added any projects yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3">Project Name</th>
                    <th className="px-5 py-3">Units</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#0F172A] text-[13px]">{p.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[12px] border border-slate-200">
                          {p.unitsCount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BuilderDetail;
