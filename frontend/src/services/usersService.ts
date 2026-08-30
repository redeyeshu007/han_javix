import { User } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';

export const usersService = {
  getUsers: (): User[] => getStore().users,

  findUserByEmail: (email: string): User | undefined => {
    const list = usersService.getUsers();
    return list.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById: (id: string): User | undefined => {
    const list = usersService.getUsers();
    return list.find(u => u.id === id);
  },

  authenticateUser: (email: string, password: string): User | null => {
    const user = usersService.findUserByEmail(email);
    if (user && user.password === password && user.status === 'Active') {
      return user;
    }
    return null;
  },

  createUser: (user: Omit<User, 'id' | 'status'>): User => {
    const db = getStore();

    if (db.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error(`User with email ${user.email} already exists`);
    }

    const newUser: User = {
      ...user,
      id: `USR-${String(db.users.length + 1).padStart(3, '0')}`,
      status: 'Active'
    };
    db.users.push(newUser);
    saveStore(db);
    return newUser;
  },

  updateUser: (id: string, updated: Partial<User>): User => {
    const db = getStore();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updated };
      saveStore(db);
      return db.users[idx];
    }
    throw new Error('User not found');
  }
};
