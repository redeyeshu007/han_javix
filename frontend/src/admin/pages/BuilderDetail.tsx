import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { PageHeader, StatusBadge, StatCard, AdminPanel } from '../components/AdminUI';
import { buildersMock } from '../data/adminMockData';

const BuilderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const builder = buildersMock.find(b => b.id === id);
  
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
            <button className="btn-secondary">
              Edit
            </button>
            {builder.status === 'Suspended' ? (
              <button className="btn-primary">
                <Play size={16} /> Activate
              </button>
            ) : (
              <button className="btn-danger">
                <Pause size={16} /> Suspend Account
              </button>
            )}
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="PROJECTS" value={builder.projects} />
        <StatCard title="UNITS" value={builder.projects * 45} />
        <StatCard title="USERS" value={builder.projects * 3 + 2} />
        <StatCard title="HANDOVER PROGRESS" value={`${Math.floor(Math.random() * 100)}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <AdminPanel title="Company Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Registered Address</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>123 Corporate Blvd, Suite 400<br/>Metropolis, NY 10001</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Main Contact</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{builder.contact}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>contact@{builder.name.toLowerCase().replace(/ /g, '')}.com</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Business Registration</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>BRN-982347100</div>
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
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Last Activity</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>2 hours ago</div>
            </div>
          </div>
        </AdminPanel>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <AdminPanel title="Project Summary">
            {builder.projects === 0 ? (
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
                  {[...Array(Math.min(builder.projects, 5))].map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 500, color: 'var(--color-navy)' }}>{builder.name} Tower {i+1}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: 'var(--color-text)' }}>{120 + (i * 45)}</td>
                      <td style={{ padding: '12px' }}><StatusBadge status="Active" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
};

export default BuilderDetail;
