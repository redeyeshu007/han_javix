import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { PageHeader, StatusBadge, StatCard, AdminPanel } from '../components/AdminUI';
import { buildersApi, projectsApi, usersApi, unitsApi } from '../../api/services';
import { Builder, Project } from '../../services/mockDb';
import { PageLoading } from '../../components/LoadingState';

const BuilderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [loading, setLoading] = useState(true);
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unitCount, setUnitCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', address: '' });

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [builders, projectList, units, users] = await Promise.all([
        buildersApi.getBuilders(),
        projectsApi.getProjects(id),
        unitsApi.getUnits(),
        usersApi.getUsers()
      ]);
      const found = builders.find((b: Builder) => b.id === id) || null;
      setBuilder(found);
      setProjects(projectList);
      setUnitCount(units.filter((u: any) => projectList.some((p: Project) => p.id === u.projectId)).length);
      setUserCount(users.filter((u: any) => u.builderId === id).length);
      if (found) {
        setForm({ name: found.name, contact: found.contact, email: found.email, phone: found.phone, address: found.address });
      }
    } catch (error) {
      console.error('Failed to load builder', error);
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
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Builder not found</h2>
        <button className="btn-secondary" onClick={() => navigate('/admin/builders')} style={{ marginTop: '20px' }}>
          Back to Builders
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          className="btn-secondary"
          onClick={() => navigate('/admin/builders')}
          style={{ padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} />
          Back to Builders
        </button>
      </div>

      <PageHeader
        title={builder.name}
        subtitle="Builder Profile"
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            {builder.status === 'Suspended' ? (
              <button className="btn-primary" onClick={handleToggleStatus} disabled={isSubmitting}>
                <Play size={16} /> Activate
              </button>
            ) : (
              <button className="btn-danger" onClick={handleToggleStatus} disabled={isSubmitting}>
                <Pause size={16} /> Suspend Account
              </button>
            )}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="PROJECTS" value={projects.length} />
        <StatCard title="UNITS" value={unitCount} />
        <StatCard title="USERS" value={userCount} />
        <StatCard title="ACCOUNT STATUS" value={builder.status} />
      </div>

      {isEditing ? (
        <AdminPanel title="Edit Company Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Company Name</label>
              <input className="admin-form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Main Contact</label>
              <input className="admin-form-input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Email</label>
              <input className="admin-form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Phone</label>
              <input className="admin-form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Address</label>
              <input className="admin-form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setIsEditing(false); navigate(`/admin/builders/${builder.id}`, { replace: true }); }} disabled={isSubmitting}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </AdminPanel>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <AdminPanel title="Company Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Registered Address</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{builder.address}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Main Contact</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{builder.contact}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{builder.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Business Registration</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{builder.brn}</div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Platform Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Subscription</div>
              <div style={{ fontSize: '14px', color: 'var(--color-navy)', fontWeight: 600 }}>{builder.plan}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Account Status</div>
              <div><StatusBadge status={builder.status} /></div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Created Date</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{builder.joined}</div>
            </div>
          </div>
        </AdminPanel>

        <div style={{ gridColumn: '1 / -1' }}>
          <AdminPanel title="Project Summary">
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                No projects added yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Project Name</th>
                    <th style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Units</th>
                    <th style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 500, color: 'var(--color-navy)' }}>{p.name}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: 'var(--color-text)' }}>{p.unitsCount}</td>
                      <td style={{ padding: '12px' }}><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminPanel>
        </div>
      </div>
      )}
      <style>{`
        .admin-form-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--admin-border, #E2E8F0);
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default BuilderDetail;
