import { Customer } from '../types/models';
import { getStore, saveStore } from '../storage/localStore';
import { projectsService } from './projectsService';

export const customersService = {
  getCustomers: (builderId?: string): Customer[] => {
    const list = getStore().customers;
    return builderId ? list.filter(c => c.builderId === builderId) : list;
  },

  createCustomer: (customer: Omit<Customer, 'id' | 'handoverStatus'>): Customer => {
    const db = getStore();
    const newCustomer: Customer = {
      ...customer,
      id: `CST-${String(db.customers.length + 1).padStart(3, '0')}`,
      handoverStatus: 'Awaiting Review'
    };
    db.customers.push(newCustomer);
    saveStore(db);

    if (customer.unitId) {
      projectsService.updateUnit(customer.unitId, { customerId: newCustomer.id });
    }

    return newCustomer;
  }
};
