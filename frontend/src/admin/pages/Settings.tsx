import React, { useEffect, useState } from 'react';
import { PageHeader, AdminPanel } from '../components/AdminUI';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/services';

const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySystemAlerts, setNotifySystemAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setNotifyEmail(user.notifyEmail ?? true);
      setNotifySystemAlerts(user.notifySystemAlerts ?? true);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await usersApi.updateUser(user.id, { name, email, notifyEmail, notifySystemAlerts });
      refreshUser();
      setSaveMessage('Settings saved.');
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setPasswordError('');
    setPasswordMessage('');
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await usersApi.updateUser(user.id, { password: newPassword });
      setPasswordMessage('Password updated.');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

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
              <input type="text" className="admin-input" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '8px' }}>Email</label>
              <input type="email" className="admin-input" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <button type="button" className="btn-secondary" onClick={() => { setShowChangePassword(!showChangePassword); setPasswordError(''); setPasswordMessage(''); }}>
                Change Password
              </button>
            </div>

            {showChangePassword && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '8px' }}>New Password</label>
                  <input type="password" className="admin-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '8px' }}>Confirm New Password</label>
                  <input type="password" className="admin-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
                </div>
                {passwordError && <div style={{ color: '#DC2626', fontSize: '13px' }}>{passwordError}</div>}
                <div>
                  <button type="button" className="btn-primary" onClick={handleChangePassword} disabled={isSavingPassword}>
                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
            {passwordMessage && <div style={{ color: '#059669', fontSize: '13px' }}>{passwordMessage}</div>}
          </div>
        </AdminPanel>

        <AdminPanel title="Platform Preferences">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email Notifications</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Receive emails for new builder registrations and support tickets.</div>
              </div>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={e => setNotifyEmail(e.target.checked)}
                aria-label="Toggle email notifications"
                style={{ width: '20px', height: '20px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>System Alerts</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Get notified of high-priority system events or errors.</div>
              </div>
              <input
                type="checkbox"
                checked={notifySystemAlerts}
                onChange={e => setNotifySystemAlerts(e.target.checked)}
                aria-label="Toggle system alert notifications"
                style={{ width: '20px', height: '20px' }}
              />
            </div>
          </div>
        </AdminPanel>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          {saveMessage && <span style={{ fontSize: '13px', color: saveMessage.startsWith('Failed') ? '#DC2626' : '#059669' }}>{saveMessage}</span>}
          <button type="button" className="btn-primary" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
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
