import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const PageLoading: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px',
      color: 'var(--admin-text-secondary)',
      height: '100%',
      minHeight: '400px'
    }}>
      <Loader2 className="animate-spin" size={32} style={{ marginBottom: '16px', color: 'var(--admin-accent)' }} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
    </div>
  );
};

export const TableLoading: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ 
          height: '60px', 
          backgroundColor: '#F3F4F6', 
          borderRadius: '8px',
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export const ButtonLoading: React.FC<{ label: string }> = ({ label }) => {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Loader2 className="animate-spin" size={16} />
      {label}
    </span>
  );
};
