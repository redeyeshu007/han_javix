export type AppRole = 
  | 'SUPER_ADMIN'
  | 'BUILDER_OWNER'
  | 'PROJECT_ADMIN'
  | 'PROJECT_MANAGER'
  | 'SITE_ENGINEER'
  | 'CRM'
  | 'ACCOUNTS'
  | 'CONTRACTOR'
  | 'CUSTOMER'
  | 'ASSOCIATION_REPRESENTATIVE';

export const ROLE_NAMESPACES: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  BUILDER_OWNER: '/builder',
  PROJECT_ADMIN: '/project-admin',
  PROJECT_MANAGER: '/project-manager',
  SITE_ENGINEER: '/site-engineer',
  CRM: '/crm',
  ACCOUNTS: '/accounts',
  CONTRACTOR: '/contractor',
  CUSTOMER: '/customer',
  ASSOCIATION_REPRESENTATIVE: '/association',
};

export const getDashboardRoute = (role: string): string => {
  const normalizedRole = role ? role.toUpperCase() : '';
  const namespace = ROLE_NAMESPACES[normalizedRole];
  if (!namespace) return '/login'; // Fallback if role is unknown
  return `${namespace}/dashboard`;
};
