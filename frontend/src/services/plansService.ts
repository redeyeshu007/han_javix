import { Plan } from '../types/models';
import { apiClient } from '../api/client';

const mapBackendToPlan = (data: any): Plan => ({
  id: data.id,
  name: data.name,
  description: data.description,
  price: data.price,
  billingCycle: data.billing_cycle,
  maxProjects: data.max_projects?.toString() || '0',
  maxUnits: data.max_units?.toString() || '0',
  maxUsers: data.max_users?.toString() || '0',
  storageLimit: data.features?.storageLimit || '0',
  status: data.status,
});

const mapPlanToBackend = (plan: Partial<Plan>): any => ({
  name: plan.name,
  description: plan.description,
  price: plan.price,
  billing_cycle: plan.billingCycle,
  max_projects: parseInt(plan.maxProjects || '0', 10),
  max_units: parseInt(plan.maxUnits || '0', 10),
  max_users: parseInt(plan.maxUsers || '0', 10),
  features: { storageLimit: plan.storageLimit },
  status: plan.status,
});

export const plansService = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await apiClient.get('/platform-admin/plans/');
    return response.data.map(mapBackendToPlan);
  },

  createPlan: async (plan: Omit<Plan, 'id'>): Promise<Plan> => {
    const response = await apiClient.post('/platform-admin/plans/', mapPlanToBackend(plan));
    return mapBackendToPlan(response.data);
  },

  updatePlan: async (id: string, updated: Partial<Plan>): Promise<Plan> => {
    const response = await apiClient.patch(`/platform-admin/plans/${id}/`, mapPlanToBackend(updated));
    return mapBackendToPlan(response.data);
  },

  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/platform-admin/plans/${id}/`);
  }
};
