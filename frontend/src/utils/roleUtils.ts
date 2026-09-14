export type AppRole = 
  | 'SUPER_ADMIN'
  | 'BUILDER_OWNER'
  | 'PROJECT_ADMIN'
  | 'SITE_ENGINEER'
  | 'ACCOUNTS'
  | 'CONTRACTOR'
  | 'CUSTOMER'
  | 'ASSOCIATION_REPRESENTATIVE';

export const ROLE_NAMESPACES: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  BUILDER_OWNER: '/builder',
  PROJECT_ADMIN: '/project-admin',
  // Site Engineer routes live inside AdminApp served at /site-engineer
  SITE_ENGINEER: '/site-engineer',
  ACCOUNTS: '/accounts',
  CONTRACTOR: '/contractor',
  CUSTOMER: '/customer',
  ASSOCIATION_REPRESENTATIVE: '/association',
};

export const getDashboardRoute = (role: string): string => {
  const normalizedRole = role ? role.toUpperCase() : '';
  const namespace = ROLE_NAMESPACES[normalizedRole];
  if (!namespace) return '/login'; // Fallback if role is unknown
  
  if (normalizedRole === 'SITE_ENGINEER') {
    return `${namespace}/inspections`;
  }
  
  return `${namespace}/dashboard`;
};
