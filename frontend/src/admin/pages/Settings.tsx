import React from 'react';
import { PageHeader, AdminPanel } from '../components/AdminUI';

const Settings: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px' }}>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your admin profile and platform preferences."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <AdminPanel title="Profile Settings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '8px' }}>Name</label>
              <input type="text" className="admin-input" defaultValue="Sarah Admin" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '8px' }}>Email</label>
              <input type="email" className="admin-input" defaultValue="admin@handoverly.ai" style={inputStyle} />
            </div>
            <div>
              <button className="btn-secondary">Change Password</button>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Platform Preferences">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email Notifications</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Receive emails for new builder registrations and support tickets.</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>System Alerts</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Get notified of high-priority system events or errors.</div>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
            </div>
          </div>
        </AdminPanel>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '14px',
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default Settings;
