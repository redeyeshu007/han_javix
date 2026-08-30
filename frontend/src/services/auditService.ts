import { AuditLog } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const auditService = {
  getAuditLogs: (): AuditLog[] => getStore().auditLogs,

  createAuditLog: (log: Omit<AuditLog, 'id' | 'date'>): AuditLog => {
    const db = getStore();
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${String(db.auditLogs.length + 1).padStart(5, '0')}`,
      date: new Date().toISOString()
    };
    db.auditLogs.push(newLog);
    saveStore(db);
    return newLog;
  }
};
