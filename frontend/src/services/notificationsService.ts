import { Notification } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const notificationsService = {
  getNotifications: (userId?: string): Notification[] => {
    const list = getStore().notifications;
    return userId ? list.filter(n => n.userId === userId) : list;
  },

  createNotification: (notif: Omit<Notification, 'id' | 'date' | 'isRead'>): Notification => {
    const db = getStore();
    const newNotif: Notification = {
      ...notif,
      id: `NOT-${String(db.notifications.length + 1).padStart(5, '0')}`,
      isRead: false,
      date: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    saveStore(db);
    return newNotif;
  },

  markNotificationRead: (id: string): void => {
    const db = getStore();
    const idx = db.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      db.notifications[idx].isRead = true;
      saveStore(db);
    }
  }
};
