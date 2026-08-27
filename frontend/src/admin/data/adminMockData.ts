export interface BuilderCompany {
  id: string;
  name: string;
  contact: string;
  projects: number;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Pending' | 'Suspended';
  joined: string;
}

export const buildersMock: BuilderCompany[] = [];

export const platformActivityMock = [
  { month: 'Jan', activeBuilders: 0, newProjects: 0 },
  { month: 'Feb', activeBuilders: 0, newProjects: 0 },
  { month: 'Mar', activeBuilders: 0, newProjects: 0 },
  { month: 'Apr', activeBuilders: 0, newProjects: 0 },
  { month: 'May', activeBuilders: 0, newProjects: 0 },
];

export const recentActivityMock: any[] = [];

export const dashboardStatsMock = {
  activeBuilders: 0,
  activeProjects: 0,
  unitsInHandover: 0,
  openSupport: 0
};

export const plansMock: any[] = [];

export const accountsMock: any[] = [];

export const checklistsMock: any[] = [];

export const documentsMock: any[] = [];

export const templatesMock: any[] = [];

export const supportMock: any[] = [];

export const needsAttentionMock: any[] = [];
