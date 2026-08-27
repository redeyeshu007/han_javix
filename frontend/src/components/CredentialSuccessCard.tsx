import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';

interface CredentialSuccessCardProps {
  name: string;
  role: string;
  email: string;
  password?: string;
  onClose: () => void;
}

export const CredentialSuccessCard: React.FC<CredentialSuccessCardProps> = ({ name, role, email, password, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'all' | null>(null);

  const handleCopy = (type: 'email' | 'password' | 'all') => {
    let textToCopy = '';
    
    if (type === 'email') {
      textToCopy = email;
    } else if (type === 'password' && password) {
      textToCopy = password;
    } else if (type === 'all' && password) {
      textToCopy = `Handoverly Account\n\nName: ${name}\nRole: ${role}\nEmail: ${email}\nPassword: ${password}`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(7, 26, 51, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: '#16A34A' }}>
          <CheckCircle2 size={24} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--admin-navy)' }}>Account Created Successfully</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>User</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-navy)' }}>{name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>Role</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-navy)' }}>{role}</div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>Email</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--admin-navy)', fontFamily: 'monospace' }}>{email}</span>
              <button 
                type="button"
                onClick={() => handleCopy('email')}
                style={{ background: 'none', border: 'none', color: copiedField === 'email' ? '#16A34A' : 'var(--admin-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
              >
                {copiedField === 'email' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>

          {password && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>Password</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--admin-navy)', fontFamily: 'monospace', minWidth: '120px' }}>
                    {showPassword ? password : '••••••••••••••'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => handleCopy('password')}
                  style={{ background: 'none', border: 'none', color: copiedField === 'password' ? '#16A34A' : 'var(--admin-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
                >
                  {copiedField === 'password' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {password && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => handleCopy('all')}
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {copiedField === 'all' ? (
                <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} /> Credentials Copied</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Copy size={16} /> Copy All Credentials</span>
              )}
            </button>
          </div>
        )}

        <div style={{ backgroundColor: '#FFFBEB', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.5' }}>
            <strong>Save these credentials securely.</strong><br />
            The password will not be shown again after leaving this screen.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '10px 32px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
