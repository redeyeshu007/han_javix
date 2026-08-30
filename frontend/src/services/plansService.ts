import { Plan } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const plansService = {
  getPlans: (): Plan[] => getStore().plans,

  createPlan: (plan: Omit<Plan, 'id'>): Plan => {
    const db = getStore();
    const newPlan: Plan = { ...plan, id: `PLN-${String(db.plans.length + 1).padStart(3, '0')}` };
    db.plans.push(newPlan);
    saveStore(db);
    return newPlan;
  },

  updatePlan: (id: string, updated: Partial<Plan>): Plan => {
    const db = getStore();
    const idx = db.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.plans[idx] = { ...db.plans[idx], ...updated };
      saveStore(db);
      return db.plans[idx];
    }
    throw new Error('Plan not found');
  }
};
