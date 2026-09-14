import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil } from 'lucide-react';
import { projectsApi, teamApi } from '../../api/services';
import { useRole } from '../../context/RoleContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { PageLoading } from '../../components/LoadingState';
import { CredentialSuccessCard } from '../../components/CredentialSuccessCard';

const roles = [
  ['PROJECT_ADMIN', 'Project Admin'],
  ['SITE_ENGINEER', 'Site Engineer'],
  ['ACCOUNTS', 'Accounts'],
  ['CONTRACTOR', 'Contractor / Vendor'],
] as const;

type Member = {
  id: string; full_name: string; email: string; phone: string; role: string;
  is_active: boolean; assigned_project_ids: string[]; trade?: string;
};

const roleLabel = (role: string) => roles.find(([value]) => value === role)?.[1] || role;

const emptyForm = {
  name: '', email: '', phone: '', role: 'PROJECT_ADMIN', password: '',
  is_active: true, trade: '', assigned_project_ids: [] as string[],
};

const TeamList: React.FC = () => {
  const { activeRole } = useRole();
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [trades, setTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [tradesOpen, setTradesOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [successCredentials, setSuccessCredentials] = useState<{
    name: string;
    role: string;
    email: string;
    password?: string;
    assignedProjects?: string[];
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [team, builderProjects] = await Promise.all([teamApi.list(), projectsApi.getProjects()]);
      setMembers(team);
      setProjects(builderProjects.map((project: any) => ({ id: String(project.id), name: project.name })));
    } catch {
      setError('Unable to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Refresh builder-scoped trade suggestions whenever the member modal opens.
  useEffect(() => {
    if (!open) return;
    teamApi.getTrades().then(setTrades).catch(() => setTrades([]));
  }, [open]);

  const openCreate = () => {
    setError('');
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (member: Member) => {
    setError('');
    setEditing(member);
    setForm({
      name: member.full_name, email: member.email, phone: member.phone || '',
      role: member.role, password: '', is_active: member.is_active,
      trade: member.trade || '',
      assigned_project_ids: (member.assigned_project_ids || []).map(String),
    });
    setOpen(true);
  };

  const isCompanyWide = ['SUPER_ADMIN', 'BUILDER_OWNER', 'ACCOUNTS'].includes(form.role);
  const requiresProjects = !isCompanyWide;
  const isProjectAdmin = form.role === 'PROJECT_ADMIN';
  const isContractor = form.role === 'CONTRACTOR';
  const typedTrade = form.trade.trim().toLowerCase();
  const tradeSuggestions = trades
    .filter((trade) => trade.toLowerCase() !== typedTrade)
    .filter((trade) => trade.toLowerCase().includes(typedTrade));

  const submitMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || (!editing && !form.password)) {
      setError(editing ? 'Name and email are required.' : 'Name, email, and password are required.');
      return;
    }
    if (requiresProjects && !form.assigned_project_ids.length) {
      setError('Select at least one assigned project for this role.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone,
        role: form.role, is_active: form.is_active,
        assigned_project_ids: requiresProjects ? form.assigned_project_ids : [],
      };
      if (isContractor) payload.trade = form.trade.trim();
      if (form.password) payload.password = form.password;
      const saved = editing ? await teamApi.update(editing.id, payload) : await teamApi.create(payload);
      setMembers((current) => editing
        ? current.map((member) => (String(member.id) === String(saved.id) ? { ...member, ...saved } : member))
        : [...current, saved]);
        
      if (!editing) {
        const assignedProjectNames = projects
          .filter(p => payload.assigned_project_ids.includes(String(p.id)))
          .map(p => p.name);
          
        setSuccessCredentials({
          name: saved.full_name || saved.name || payload.name,
          role: roleLabel(payload.role),
          email: payload.email,
          password: payload.password,
          assignedProjects: assignedProjectNames
        });
      }

      setForm(emptyForm);
      setOpen(false);
    } catch (requestError: any) {
      const data = requestError.response?.data;
      if (typeof data === 'object' && data.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else {
        setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : `Unable to ${editing ? 'update' : 'create'} team member.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;
  const filtered = members.filter((member) => `${member.full_name} ${member.email}`.toLowerCase().includes(search.toLowerCase()));
  const canManageTeam = activeRole === 'BUILDER_OWNER';

  return <div className="min-h-screen p-4 md:p-8 text-[#0F172A] bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Team Directory</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Create and manage your builder accounts and staff access.</p>
        </div>
        {canManageTeam && (
          <Button onClick={openCreate} className="shadow-lg shadow-blue-500/20 rounded-full px-6 py-2.5 font-medium transition-all hover:-translate-y-0.5">
            <Plus size={18} className="mr-2" /> Add Team Member
          </Button>
        )}
      </div>

      {error && !open && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
          {error}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100/60 bg-white/40">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input 
              className="w-full pl-11 p-2.5 bg-white/60 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none" 
              placeholder="Search team members by name or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100/60">
            <tr>
              <th className="p-5">Member</th>
              <th className="p-5">Contact</th>
              <th className="p-5">Role & Access</th>
              <th className="p-5">Status</th>
              {canManageTeam && <th className="p-5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {filtered.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/40 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
                      {member.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-slate-800">{member.full_name}</div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="text-sm font-medium text-slate-700">{member.email}</div>
                  {member.phone && <div className="text-xs text-slate-500 mt-1">{member.phone}</div>}
                </td>
                <td className="p-5">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                      {roleLabel(member.role)}
                    </span>
                    {member.assigned_project_ids && member.assigned_project_ids.length > 0 ? (
                      <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {projects.find(p => String(p.id) === String(member.assigned_project_ids[0]))?.name || 'Assigned'}
                        {member.assigned_project_ids.length > 1 && (
                          <span className="text-slate-400">+{member.assigned_project_ids.length - 1} more</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {member.role === 'PROJECT_ADMIN' || member.role === 'SUPER_ADMIN' || ['BUILDER_OWNER', 'ACCOUNTS'].includes(member.role) ? 'All Projects' : 'None'}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-5">
                  {member.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> Inactive
                    </span>
                  )}
                </td>
                {canManageTeam && (
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => openEdit(member)} 
                      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="p-12 text-center" colSpan={canManageTeam ? 5 : 4}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                    <Search size={24} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">No team members found</h3>
                  <p className="text-xs text-slate-500 mt-1">Adjust your search or add a new team member.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    <Modal title={editing ? 'Edit Team Member' : 'Add Team Member'} isOpen={open} onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button><Button form="team-member-form" type="submit" disabled={submitting}>{submitting ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save changes' : 'Create account')}</Button></>}>
      <form id="team-member-form" onSubmit={submitMember} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="block text-sm font-medium">Name<input required className="mt-1 w-full p-2 border rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm font-medium">Email<input required type="email" className="mt-1 w-full p-2 border rounded" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="block text-sm font-medium">Phone<input className="mt-1 w-full p-2 border rounded" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="block text-sm font-medium">Role<select className="mt-1 w-full p-2 border rounded" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, assigned_project_ids: [], trade: '' })}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {isContractor && <label className="relative block text-sm font-medium">Trade / Specialization<input className="mt-1 w-full p-2 border rounded" value={form.trade} placeholder="Select or type" autoComplete="off" onFocus={() => setTradesOpen(true)} onBlur={() => setTradesOpen(false)} onChange={(e) => setForm({ ...form, trade: e.target.value })} />{isContractor && tradesOpen && tradeSuggestions.length > 0 && <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">{tradeSuggestions.map((trade) => <div key={trade} className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50" onMouseDown={(e) => { e.preventDefault(); setForm({ ...form, trade }); setTradesOpen(false); }}>{trade}</div>)}</div>}</label>}
        <label className="block text-sm font-medium">Password<input required={!editing} type="password" className="mt-1 w-full p-2 border rounded" placeholder={editing ? 'Leave blank to keep current password' : ''} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        {requiresProjects && isProjectAdmin && (
          <label className="block text-sm font-medium">
            Assigned Project
            <select
              className="mt-1 w-full p-2 border rounded bg-white"
              value={form.assigned_project_ids[0] || ''}
              onChange={(e) => setForm({ ...form, assigned_project_ids: e.target.value ? [e.target.value] : [] })}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </label>
        )}
        {requiresProjects && !isProjectAdmin && (
          <MultiSelect label="Assigned Projects" required options={projects.map((project) => ({ id: project.id, label: project.name }))} value={form.assigned_project_ids} onChange={(assigned_project_ids) => setForm({ ...form, assigned_project_ids })} placeholder="Select projects" emptyMessage="No projects found for this builder." />
        )}
      </form>
    </Modal>
    {successCredentials && (
      <CredentialSuccessCard
        {...successCredentials}
        onClose={() => setSuccessCredentials(null)}
      />
    )}
  </div>;
};

export default TeamList;
