import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px',
      color: 'var(--admin-text-secondary)',
      border: '1px dashed var(--admin-border)',
      borderRadius: '12px',
      backgroundColor: '#FAFCFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px'
    }}>
      <div style={{ opacity: 0.5, marginBottom: '16px', color: 'var(--admin-navy)' }}>
        {icon}
      </div>
      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 8px 0' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', margin: '0 0 24px 0', maxWidth: '300px' }}>
        {description}
      </p>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
