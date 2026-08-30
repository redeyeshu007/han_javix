import { Contractor } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const contractorsService = {
  getContractors: (): Contractor[] => getStore().contractors,

  createContractor: (contractor: Omit<Contractor, 'id'>): Contractor => {
    const db = getStore();
    const newContractor: Contractor = {
      ...contractor,
      id: `CON-${String(db.contractors.length + 1).padStart(3, '0')}`
    };
    db.contractors.push(newContractor);
    saveStore(db);
    return newContractor;
  },

  updateContractor: (id: string, updated: Partial<Contractor>): Contractor => {
    const db = getStore();
    const idx = db.contractors.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.contractors[idx] = { ...db.contractors[idx], ...updated };
      saveStore(db);
      return db.contractors[idx];
    }
    throw new Error('Contractor not found');
  }
};
