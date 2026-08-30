import { CommTemplate } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const templatesService = {
  getTemplates: (): CommTemplate[] => getStore().templates,

  createTemplate: (template: Omit<CommTemplate, 'id' | 'updated'>): CommTemplate => {
    const db = getStore();
    const newTemplate: CommTemplate = {
      ...template,
      id: `TPL-${String(db.templates.length + 1).padStart(3, '0')}`,
      updated: new Date().toISOString().split('T')[0]
    };
    db.templates.push(newTemplate);
    saveStore(db);
    return newTemplate;
  },

  updateTemplate: (id: string, updated: Partial<CommTemplate>): CommTemplate => {
    const db = getStore();
    const idx = db.templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.templates[idx] = { ...db.templates[idx], ...updated, updated: new Date().toISOString().split('T')[0] };
      saveStore(db);
      return db.templates[idx];
    }
    throw new Error('Template not found');
  }
};
