import { Database } from '../types/models';
import { initialDb } from './defaultData';

const DB_KEY = 'handoverly_db_v4';

// Backfills arrays that didn't exist in a Database shape persisted by an earlier version
const withDefaults = (db: Database): Database => ({
  ...db,
  plans: db.plans || [],
  templates: db.templates || [],
  checklists: db.checklists || []
});

export const getStore = (): Database => {
  const dbStr = localStorage.getItem(DB_KEY);
  if (!dbStr) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  return withDefaults(JSON.parse(dbStr));
};

export const saveStore = (db: Database): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};
