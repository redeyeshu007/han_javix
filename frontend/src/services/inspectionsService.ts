import { Inspection } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const inspectionsService = {
  getInspections: (): Inspection[] => getStore().inspections,

  createInspection: (inspection: Omit<Inspection, 'id'>): Inspection => {
    const db = getStore();
    const newInspection: Inspection = {
      ...inspection,
      id: `INSP-${String(db.inspections.length + 1).padStart(3, '0')}`
    };
    db.inspections.push(newInspection);
    saveStore(db);
    return newInspection;
  }
};
