import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B' }}>
      <Icon size={48} color="#CBD5E1" style={{ margin: '0 auto 16px auto', display: 'block' }} />
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>{title}</h3>
      <p style={{ margin: '8px 0 24px 0', fontSize: '14px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
