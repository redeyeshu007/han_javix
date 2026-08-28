import React from 'react';
import { LucideIcon, Check, Clock, X } from 'lucide-react';
import '../admin.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div>
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isUp: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend }) => (
  <div className="stat-card">
    <h3 className="stat-card__title">{title}</h3>
    <div className="stat-card__value">{value}</div>
    {trend && (
      <div className={`stat-card__trend ${trend.isUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
        {trend.isUp ? '↑' : '↓'} {trend.value}
      </div>
    )}
  </div>
);

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let type: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
  if (status === 'Active' || status === 'Resolved' || status === 'Completed' || status === 'Verified' || status === 'Cleared' || status === 'Approved') type = 'success';
  if (status === 'Pending' || status === 'Draft' || status === 'Open' || status === 'Planning' || status === 'In Progress') type = 'warning';
  if (status === 'Suspended' || status === 'Archived' || status === 'Inactive' || status === 'Rejected') type = 'error';

  // Status is never conveyed by color alone — an icon always accompanies the label.
  const Icon = type === 'success' ? Check : type === 'error' ? X : type === 'warning' ? Clock : null;

  return (
    <span className={`status-badge status-badge--${type}`}>
      {Icon && <Icon size={12} strokeWidth={2.5} style={{ marginRight: '4px', verticalAlign: '-1px' }} />}
      {status}
    </span>
  );
};

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    <Icon className="empty-state__icon" />
    <h3 className="empty-state__title">{title}</h3>
    <p className="empty-state__description">{description}</p>
    {action}
  </div>
);

interface AdminPanelProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ title, action, children }) => (
  <div className="admin-panel">
    <div className="admin-panel__header">
      <h3 className="admin-panel__title">{title}</h3>
      {action && <div>{action}</div>}
    </div>
    <div className="admin-panel__body">
      {children}
    </div>
  </div>
);
