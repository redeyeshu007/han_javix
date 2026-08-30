import { ChecklistTemplate } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const checklistsService = {
  getChecklists: (): ChecklistTemplate[] => getStore().checklists,

  createChecklist: (checklist: Omit<ChecklistTemplate, 'id' | 'updated'>): ChecklistTemplate => {
    const db = getStore();
    const newChecklist: ChecklistTemplate = {
      ...checklist,
      id: `CHK-${String(db.checklists.length + 1).padStart(3, '0')}`,
      updated: new Date().toISOString().split('T')[0]
    };
    db.checklists.push(newChecklist);
    saveStore(db);
    return newChecklist;
  },

  updateChecklist: (id: string, updated: Partial<ChecklistTemplate>): ChecklistTemplate => {
    const db = getStore();
    const idx = db.checklists.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.checklists[idx] = { ...db.checklists[idx], ...updated, updated: new Date().toISOString().split('T')[0] };
      saveStore(db);
      return db.checklists[idx];
    }
    throw new Error('Checklist not found');
  }
};
