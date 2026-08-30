import { Project, Block, Floor, Unit } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const projectsService = {
  getProjects: (builderId?: string): Project[] => {
    const list = getStore().projects;
    return builderId ? list.filter(p => p.builderId === builderId) : list;
  },

  getBlocks: (projectId?: string): Block[] => {
    const list = getStore().blocks;
    return projectId ? list.filter(b => b.projectId === projectId) : list;
  },

  getFloors: (blockId?: string): Floor[] => {
    const list = getStore().floors;
    return blockId ? list.filter(f => f.blockId === blockId) : list;
  },

  getUnits: (projectId?: string): Unit[] => {
    const list = getStore().units;
    return projectId ? list.filter(u => u.projectId === projectId) : list;
  },

  createProject: (project: Omit<Project, 'id' | 'progress' | 'blocksCount' | 'unitsCount'>): Project => {
    const db = getStore();
    const newProject: Project = {
      ...project,
      id: `PRJ-${String(db.projects.length + 1).padStart(3, '0')}`,
      progress: 0,
      blocksCount: 0,
      unitsCount: 0
    };
    db.projects.push(newProject);
    saveStore(db);
    return newProject;
  },

  updateProject: (id: string, updated: Partial<Project>): Project => {
    const db = getStore();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.projects[idx] = { ...db.projects[idx], ...updated };
      saveStore(db);
      return db.projects[idx];
    }
    throw new Error('Project not found');
  },

  createBlock: (block: Omit<Block, 'id'>): Block => {
    const db = getStore();
    const newBlock: Block = {
      ...block,
      id: `BLK-${String(db.blocks.length + 1).padStart(3, '0')}`
    };
    db.blocks.push(newBlock);
    
    // Update block count on project
    const pIdx = db.projects.findIndex(p => p.id === block.projectId);
    if (pIdx !== -1) {
      db.projects[pIdx].blocksCount += 1;
    }
    saveStore(db);

    return newBlock;
  },

  createFloor: (floor: Omit<Floor, 'id'>): Floor => {
    const db = getStore();
    const newFloor: Floor = {
      ...floor,
      id: `FLR-${String(db.floors.length + 1).padStart(3, '0')}`
    };
    db.floors.push(newFloor);
    saveStore(db);
    return newFloor;
  },

  createUnit: (unit: Omit<Unit, 'id' | 'customerId' | 'inspectionStatus' | 'docsCleared' | 'paymentCleared' | 'defectsCleared' | 'keysHandedOver' | 'approvalsCleared'> & { status?: 'Under Construction' | 'Ready for Inspection' }): Unit => {
    const db = getStore();
    const newUnit: Unit = {
      ...unit,
      id: `UNIT-${String(db.units.length + 1).padStart(3, '0')}`,
      status: unit.status || 'Under Construction',
      customerId: null,
      inspectionStatus: 'Pending',
      docsCleared: false,
      paymentCleared: false,
      defectsCleared: false,
      keysHandedOver: false,
      approvalsCleared: false
    };
    db.units.push(newUnit);

    // Update units count on project
    const pIdx = db.projects.findIndex(p => p.id === unit.projectId);
    if (pIdx !== -1) {
      db.projects[pIdx].unitsCount += 1;
    }
    saveStore(db);

    return newUnit;
  },

  updateUnit: (id: string, updated: Partial<Unit>): Unit => {
    const db = getStore();
    const idx = db.units.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.units[idx] = { ...db.units[idx], ...updated };

      const u = db.units[idx];
      if (u.status === 'Under Construction' || u.status === 'Ready for Inspection') {
         // Auto-calculate handover readiness if not already handed over
         if (u.docsCleared && u.paymentCleared && u.defectsCleared && u.approvalsCleared) {
            u.status = 'Approved';
         }
      }

      // Keep the assigned customer's handoverStatus in sync with the unit's real progress.
      if (u.customerId) {
        const cIdx = db.customers.findIndex(c => c.id === u.customerId);
        if (cIdx !== -1) {
          let handoverStatus: 'Awaiting Review' | 'Inspection Scheduled' | 'Accepted' | 'Complete' = 'Awaiting Review';
          if (u.status === 'Handed Over') {
            handoverStatus = 'Complete';
          } else if (u.docsCleared && u.paymentCleared && u.defectsCleared && u.approvalsCleared) {
            handoverStatus = 'Accepted';
          } else if (u.inspectionStatus === 'Passed') {
            handoverStatus = 'Inspection Scheduled';
          }
          db.customers[cIdx].handoverStatus = handoverStatus;
        }
      }

      saveStore(db);
      return db.units[idx];
    }
    throw new Error('Unit not found');
  }
};
