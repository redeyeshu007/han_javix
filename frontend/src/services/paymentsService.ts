import { Payment } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';
import { projectsService } from './projectsService';

export const paymentsService = {
  getPayments: (unitId?: string): Payment[] => {
    const list = getStore().payments;
    return unitId ? list.filter(p => p.unitId === unitId) : list;
  },

  createPayment: (payment: Omit<Payment, 'id'>): Payment => {
    const db = getStore();
    const newPayment: Payment = {
      ...payment,
      id: `PAY-${String(db.payments.length + 1).padStart(3, '0')}`
    };
    db.payments.push(newPayment);
    saveStore(db);
    return newPayment;
  },

  updatePaymentStatus: (id: string, status: Payment['status'], verifiedBy?: string): Payment => {
    const db = getStore();
    const idx = db.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.payments[idx].status = status;
      db.payments[idx].updatedAt = new Date().toISOString();
      
      if (status === 'Verified' || status === 'Cleared') {
        db.payments[idx].verifiedBy = verifiedBy;
        db.payments[idx].verifiedAt = new Date().toISOString();
      }
      
      if (status === 'Cleared') {
        db.payments[idx].clearedDate = new Date().toISOString().split('T')[0];
      }
      saveStore(db);
      
      const unitId = db.payments[idx].unitId;
      const unitPayments = db.payments.filter(p => p.unitId === unitId);
      const allCleared = unitPayments.length > 0 && unitPayments.every(p => p.status === 'Cleared');
      
      projectsService.updateUnit(unitId, { paymentCleared: allCleared });
      
      return db.payments[idx];
    }
    throw new Error('Payment not found');
  }
};
