import { SupportTicket } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const supportTicketsService = {
  getSupportTickets: (): SupportTicket[] => getStore().supportTickets,

  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'conversation'>): SupportTicket => {
    const db = getStore();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TK-${db.supportTickets.length + 1001}`,
      status: 'Open',
      lastUpdate: new Date().toISOString().split('T')[0],
      conversation: []
    };
    db.supportTickets.push(newTicket);
    saveStore(db);
    return newTicket;
  },

  addSupportMessage: (id: string, sender: 'builder' | 'admin', message: string): SupportTicket => {
    const db = getStore();
    const idx = db.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.supportTickets[idx].conversation.push({
        sender,
        message,
        date: new Date().toISOString()
      });
      db.supportTickets[idx].lastUpdate = new Date().toISOString().split('T')[0];
      saveStore(db);
      return db.supportTickets[idx];
    }
    throw new Error('Ticket not found');
  },

  updateSupportStatus: (id: string, status: SupportTicket['status']): SupportTicket => {
    const db = getStore();
    const idx = db.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.supportTickets[idx].status = status;
      db.supportTickets[idx].lastUpdate = new Date().toISOString().split('T')[0];
      saveStore(db);
      return db.supportTickets[idx];
    }
    throw new Error('Ticket not found');
  }
};
