import { Builder } from '../types/models';
import { apiClient } from '../api/client';

const mapBackendToBuilder = (data: any): Builder => {
  return {
    id: data.id,
    name: data.company_name,
    contact: data.contact_name,
    email: data.email,
    phone: data.contact_number,
    address: data.registered_address || '',
    brn: data.registration_number || '',
    plan: data.subscription_plan_details?.name || 'Starter',
    status: data.status === 'ACTIVE' ? 'Active' : (data.status === 'PENDING_REVIEW' ? 'Pending' : (data.status === 'SUSPENDED' ? 'Suspended' : 'Pending')),
    joined: data.joined_at ? new Date(data.joined_at).toISOString().split('T')[0] : ''
  };
};

const mapBuilderToBackend = (builder: Partial<Builder>): any => {
  return {
    company_name: builder.name,
    contact_name: builder.contact,
    email: builder.email,
    contact_number: builder.phone,
    registered_address: builder.address,
    registration_number: builder.brn,
    subscription_plan: builder.subscription_plan_id,
    status: builder.status === 'Active' ? 'ACTIVE' : builder.status === 'Suspended' ? 'SUSPENDED' : builder.status === 'Pending' ? 'PENDING_REVIEW' : undefined,
  };
};

export const buildersService = {
  getBuilders: async (): Promise<Builder[]> => {
    const response = await apiClient.get('/builders/companies/');
    return response.data.map(mapBackendToBuilder);
  },

  createBuilder: async (builder: Omit<Builder, 'id' | 'joined'> & { adminEmail?: string, adminPassword?: string, adminName?: string, adminPhone?: string }): Promise<Builder> => {
    const payload = mapBuilderToBackend(builder);
    if (builder.adminEmail) payload.admin_email = builder.adminEmail;
    if (builder.adminPassword) payload.admin_password = builder.adminPassword;
    if (builder.adminName) payload.admin_name = builder.adminName;
    if (builder.adminPhone) payload.admin_phone = builder.adminPhone;
    
    const response = await apiClient.post('/builders/companies/', payload);
    return mapBackendToBuilder(response.data);
  },

  updateBuilder: async (id: string, updated: Partial<Builder>): Promise<Builder> => {
    const response = await apiClient.patch(`/builders/companies/${id}/`, mapBuilderToBackend(updated));
    return mapBackendToBuilder(response.data);
  },

  approveBuilder: async (id: string): Promise<void> => {
    await apiClient.post(`/builders/companies/${id}/approve/`);
  },

  suspendBuilder: async (id: string): Promise<void> => {
    await apiClient.post(`/builders/companies/${id}/suspend/`);
  },

  rejectBuilder: async (id: string): Promise<void> => {
    await apiClient.post(`/builders/companies/${id}/reject/`);
  }
};
