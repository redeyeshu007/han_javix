import { ServiceRequest } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const serviceRequestsService = {
  getServiceRequests: (): ServiceRequest[] => getStore().serviceRequests,

  createServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'contractorId' | 'date'>): ServiceRequest => {
    const db = getStore();
    const newReq: ServiceRequest = {
      ...req,
      id: `SR-${String(db.serviceRequests.length + 1).padStart(3, '0')}`,
      status: 'Request',
      contractorId: null,
      date: new Date().toISOString().split('T')[0]
    };
    db.serviceRequests.push(newReq);
    saveStore(db);
    return newReq;
  },

  updateServiceRequest: (id: string, status: ServiceRequest['status'], contractorId: string | null = null): ServiceRequest => {
    const db = getStore();
    const idx = db.serviceRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.serviceRequests[idx].status = status;
      if (contractorId) db.serviceRequests[idx].contractorId = contractorId;
      saveStore(db);
      return db.serviceRequests[idx];
    }
    throw new Error('Request not found');
  }
};
