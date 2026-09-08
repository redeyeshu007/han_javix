import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { projectsApi, teamApi } from '../../api/services';
import { useRole } from '../../context/RoleContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { MultiSelect } from '../../components/ui/MultiSelect';
import { PageLoading } from '../../components/LoadingState';

const roles = [
  ['PROJECT_ADMIN', 'Project Admin'],
  ['PROJECT_MANAGER', 'Project Manager'],
  ['SITE_ENGINEER', 'Site Engineer'],
  ['CRM', 'CRM'],
  ['ACCOUNTS', 'Accounts'],
  ['CONTRACTOR', 'Contractor / Vendor'],
] as const;

type Member = {
  id: string; full_name: string; email: string; phone: string; role: string;
  is_active: boolean; assigned_project_ids: string[];
};

const roleLabel = (role: string) => roles.find(([value]) => value === role)?.[1] || role;

const TeamList: React.FC = () => {
  const { activeRole } = useRole();
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'PROJECT_ADMIN', password: '',
    is_active: true, assigned_project_ids: [] as string[],
  });

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

  const requiresProjects = form.role !== 'PROJECT_ADMIN';
  const createMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (requiresProjects && !form.assigned_project_ids.length) {
      setError('Select at least one assigned project for this role.');
      return;
    }
    setSubmitting(true);
    try {
      const member = await teamApi.create({
        ...form,
        assigned_project_ids: requiresProjects ? form.assigned_project_ids : [],
      });
      setMembers((current) => [...current, member]);
      setForm({ name: '', email: '', phone: '', role: 'PROJECT_ADMIN', password: '', is_active: true, assigned_project_ids: [] });
      setOpen(false);
    } catch (requestError: any) {
      const data = requestError.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Unable to create team member.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;
  const filtered = members.filter((member) => `${member.full_name} ${member.email}`.toLowerCase().includes(search.toLowerCase()));
  const canManageTeam = activeRole === 'BUILDER_OWNER';

  return <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-8 text-[#0F172A]">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-bold">Team Directory</h1><p className="text-slate-500 mt-1">Create and manage Django-backed builder accounts.</p></div>
        {canManageTeam && <Button onClick={() => { setError(''); setOpen(true); }}><Plus size={16} /> Add Team Member</Button>}
      </div>
      {error && !open && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b"><div className="relative max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input className="w-full pl-9 p-2 border rounded-md" placeholder="Search team members" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
        <table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Member</th><th>Contact</th><th>Role</th><th>Status</th></tr></thead><tbody>
          {filtered.map((member) => <tr key={member.id} className="border-t"><td className="p-4 font-medium">{member.full_name}</td><td>{member.email}{member.phone && <div className="text-sm text-slate-500">{member.phone}</div>}</td><td>{roleLabel(member.role)}</td><td>{member.is_active ? 'Active' : 'Inactive'}</td></tr>)}
          {!filtered.length && <tr><td className="p-8 text-center text-slate-500" colSpan={4}>No team members found.</td></tr>}
        </tbody></table>
      </div>
    </div>
    <Modal title="Add Team Member" isOpen={open} onClose={() => setOpen(false)} footer={<><Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button><Button form="team-member-form" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</Button></>}>
      <form id="team-member-form" onSubmit={createMember} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="block text-sm font-medium">Name<input required className="mt-1 w-full p-2 border rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm font-medium">Email<input required type="email" className="mt-1 w-full p-2 border rounded" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="block text-sm font-medium">Phone<input className="mt-1 w-full p-2 border rounded" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="block text-sm font-medium">Role<select className="mt-1 w-full p-2 border rounded" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, assigned_project_ids: [] })}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block text-sm font-medium">Password<input required type="password" className="mt-1 w-full p-2 border rounded" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        {requiresProjects && <MultiSelect label="Assigned Projects" required options={projects.map((project) => ({ id: project.id, label: project.name }))} value={form.assigned_project_ids} onChange={(assigned_project_ids) => setForm({ ...form, assigned_project_ids })} placeholder="Select projects" emptyMessage="No projects found for this builder." />}
      </form>
    </Modal>
  </div>;
};

export default TeamList;
