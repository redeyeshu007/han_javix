import { Document } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';
import { projectsService } from './projectsService';

export const documentsService = {
  getDocuments: (): Document[] => getStore().documents,

  createDocument: (doc: Omit<Document, 'id'>): Document => {
    const db = getStore();
    const newDoc: Document = {
      ...doc,
      id: `DOC-${String(db.documents.length + 1).padStart(3, '0')}`
    };
    db.documents.push(newDoc);
    saveStore(db);
    return newDoc;
  },

  updateDocumentStatus: (id: string, status: Document['status'], rejectionReason?: string): Document => {
    const db = getStore();
    const idx = db.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      db.documents[idx].status = status;
      if (rejectionReason) db.documents[idx].rejectionReason = rejectionReason;
      saveStore(db);

      const unitId = db.documents[idx].unitId;
      if (unitId) {
        const unitDocs = db.documents.filter(d => d.unitId === unitId);
        const ownershipDocs = unitDocs.filter(d => d.category === 'Ownership & Identity Documents');
        const municipalDocs = unitDocs.filter(d => d.category === 'Municipal Certificate of Occupancy');
        const docsCleared = ownershipDocs.length > 0 && ownershipDocs.every(d => d.status === 'Verified');
        const approvalsCleared = municipalDocs.length > 0 && municipalDocs.every(d => d.status === 'Verified');
        projectsService.updateUnit(unitId, { docsCleared, approvalsCleared });
      }

      return db.documents[idx];
    }
    throw new Error('Document not found');
  },

  deleteDocument: (id: string): void => {
    const db = getStore();
    db.documents = db.documents.filter(d => d.id !== id);
    saveStore(db);
  }
};
