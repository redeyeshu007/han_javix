import { AssociationTransition } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const transitionsService = {
  getTransitions: (): AssociationTransition[] => getStore().transition,

  updateTransitionStep: (builderId: string, step: AssociationTransition['step']): AssociationTransition => {
    const db = getStore();
    const idx = db.transition.findIndex(t => t.builderId === builderId);
    if (idx !== -1) {
      db.transition[idx].step = step;
      saveStore(db);
      return db.transition[idx];
    } else {
      const newT: AssociationTransition = {
        builderId,
        step,
        commonAreas: 'Pending',
        assets: 'Pending',
        contracts: 'Pending',
        financials: 'Pending',
        legals: 'Pending',
        commitments: 'Pending'
      };
      db.transition.push(newT);
      saveStore(db);
      return newT;
    }
  },

  updateTransitionItem: (builderId: string, field: keyof Omit<AssociationTransition, 'builderId' | 'step'>, status: 'Pending' | 'In Progress' | 'Completed'): AssociationTransition => {
    const db = getStore();
    const idx = db.transition.findIndex(t => t.builderId === builderId);
    if (idx !== -1) {
      db.transition[idx][field] = status as any;
      saveStore(db);
      return db.transition[idx];
    }
    throw new Error('Transition not found');
  }
};
