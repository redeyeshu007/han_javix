import React, { useEffect, useState } from 'react';
import { Bell, User as UserIcon, Lock, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/services';
import { Input } from '../../components/ui/FormElements';

// Modern Toggle Switch Component
const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 ${
      checked ? 'bg-[#2563EB]' : 'bg-slate-200'
    }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifySystemAlerts, setNotifySystemAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

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
      setNotifySystemAlerts(user.notifySystemAlerts ?? true);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });
    try {
      await usersApi.updateUser(user.id, { name, email, notifySystemAlerts });
      refreshUser();
      setSaveMessage({ text: 'Settings successfully saved.', type: 'success' });
      setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setSaveMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
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
      setPasswordMessage('Password successfully updated.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordMessage('');
      }, 2000);
    } catch (error) {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1 relative z-0">
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#2563EB]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[800px] mx-auto w-full">
        {/* Page Header */}
        <section className="mb-8 mt-2">
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#0B1F33] tracking-tight leading-tight mb-2">
            Settings
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            Manage your admin profile and platform preferences.
          </p>
        </section>

        <div className="space-y-6">
          {/* Profile Settings Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                <UserIcon size={20} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Profile Settings</h2>
                <p className="text-[13px] text-slate-500 mt-0.5">Update your personal information</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Full Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="John Doe"
                />
                <Input 
                  label="Email Address" 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="john@example.com"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                {!showChangePassword ? (
                  <button 
                    type="button" 
                    className="inline-flex items-center text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                    onClick={() => { setShowChangePassword(true); setPasswordError(''); setPasswordMessage(''); }}
                  >
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </button>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-2">
                    <h3 className="text-[14px] font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <Lock size={16} className="text-slate-400" /> Update Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input 
                        label="New Password" 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="••••••••"
                      />
                      <Input 
                        label="Confirm Password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••"
                      />
                    </div>
                    {passwordError && <div className="text-[13px] font-medium text-red-500 mb-4">{passwordError}</div>}
                    {passwordMessage && <div className="text-[13px] font-medium text-emerald-600 mb-4 flex items-center gap-1.5"><Check size={14}/> {passwordMessage}</div>}
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[13px] font-semibold rounded-lg shadow-sm transition-colors"
                        onClick={() => { setShowChangePassword(false); setNewPassword(''); setConfirmPassword(''); }}
                        disabled={isSavingPassword}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        onClick={handleChangePassword} 
                        disabled={isSavingPassword}
                      >
                        {isSavingPassword ? 'Updating...' : 'Save Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Platform Preferences Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Platform Preferences</h2>
                <p className="text-[13px] text-slate-500 mt-0.5">Manage your notifications and alerts</p>
              </div>
            </div>

            <div className="p-0 divide-y divide-slate-100">

              <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="pr-8">
                  <div className="text-[14px] font-semibold text-[#0F172A] mb-1">System Alerts</div>
                  <div className="text-[13px] text-slate-500 leading-relaxed">Get instantly notified of high-priority system events, performance degradation, or critical errors.</div>
                </div>
                <Toggle checked={notifySystemAlerts} onChange={setNotifySystemAlerts} />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {saveMessage.text && (
              <div className={`text-[13px] font-semibold flex items-center gap-1.5 ${saveMessage.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                {saveMessage.type === 'success' && <Check size={16} />}
                {saveMessage.text}
              </div>
            )}
            <button 
              type="button" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveSettings} 
              disabled={isSaving}
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
