import { Defect } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';
import { projectsService } from './projectsService';

export const defectsService = {
  getDefects: (projectId?: string): Defect[] => {
    const list = getStore().defects;
    return projectId ? list.filter(d => d.projectId === projectId) : list;
  },

  createDefect: (defect: Omit<Defect, 'id' | 'status' | 'timeline'>): Defect => {
    const db = getStore();
    const newDefect: Defect = {
      ...defect,
      id: `DFT-${String(db.defects.length + 1).padStart(3, '0')}`,
      status: 'Open',
      timeline: [
        { status: 'Open', date: new Date().toISOString().split('T')[0], note: 'Defect registered' }
      ]
    };
    db.defects.push(newDefect);
    saveStore(db);

    projectsService.updateUnit(defect.unitId, { 
      status: 'Defects Found', 
      inspectionStatus: 'Failed',
      defectsCleared: false 
    });

    return newDefect;
  },

  updateDefect: (id: string, status: Defect['status'], note: string, resolutionEvidence?: string, contractorId?: string): Defect => {
    const db = getStore();
    const idx = db.defects.findIndex(d => d.id === id);
    if (idx !== -1) {
      const d = db.defects[idx];
      d.status = status;
      if (resolutionEvidence) d.resolutionEvidence = resolutionEvidence;
      if (contractorId) d.contractorId = contractorId;
      d.timeline.push({
        status,
        date: new Date().toISOString().split('T')[0],
        note
      });
      saveStore(db);

      const unitId = d.unitId;
      const unitDefects = db.defects.filter(def => def.unitId === unitId);
      const openDefects = unitDefects.filter(def => def.status !== 'Closed');
      
      if (openDefects.length === 0) {
        projectsService.updateUnit(unitId, { 
          status: 'Resolved', 
          inspectionStatus: 'Passed',
          defectsCleared: true 
        });
      } else if (status === 'Resolved') {
        projectsService.updateUnit(unitId, { status: 'Resolved' });
      }

      return d;
    }
    throw new Error('Defect not found');
  }
};
