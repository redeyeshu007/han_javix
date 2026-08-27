import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: BadgeVariant; 
  className?: string; 
}> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let variant: BadgeVariant = 'neutral';
  const s = status.toLowerCase();
  
  if (['active', 'completed', 'resolved', 'closed', 'passed', 'cleared', 'verified', 'accepted', 'approved', 'handed over'].includes(s)) variant = 'success';
  else if (['pending', 'in progress', 'assigned', 'scheduled', 'under review', 'request'].includes(s)) variant = 'warning';
  else if (['failed', 'suspended', 'rejected', 'defects found'].includes(s)) variant = 'danger';
  else if (['open', 'reinspection', 'customer confirmation'].includes(s)) variant = 'info';

  return <Badge variant={variant}>{status}</Badge>;
};
