import { Builder } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const buildersService = {
  getBuilders: (): Builder[] => getStore().builders,

  createBuilder: (builder: Omit<Builder, 'id' | 'joined'>): Builder => {
    const db = getStore();
    const newBuilder: Builder = {
      ...builder,
      id: `BLD-${String(db.builders.length + 1).padStart(3, '0')}`,
      joined: new Date().toISOString().split('T')[0]
    };
    db.builders.push(newBuilder);
    saveStore(db);
    return newBuilder;
  },

  updateBuilder: (id: string, updated: Partial<Builder>): Builder => {
    const db = getStore();
    const idx = db.builders.findIndex(b => b.id === id);
    if (idx !== -1) {
      db.builders[idx] = { ...db.builders[idx], ...updated };
      saveStore(db);
      return db.builders[idx];
    }
    throw new Error('Builder not found');
  }
};
