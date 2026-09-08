import { ChecklistTemplate } from '../types/models';
import { apiClient } from '../api/client';

const mapBackendToChecklist = (data: any): ChecklistTemplate => ({
  id: data.id,
  name: data.name,
  description: data.description,
  category: data.category,
  items: data.items ? data.items.length : 0,
  status: data.status,
  updated: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : '',
});

const mapChecklistToBackend = (checklist: Partial<ChecklistTemplate>): any => ({
  name: checklist.name,
  description: checklist.description,
  category: checklist.category,
  status: checklist.status,
});

export const checklistsService = {
  getChecklists: async (): Promise<ChecklistTemplate[]> => {
    const response = await apiClient.get('/platform-admin/checklists/');
    return response.data.map(mapBackendToChecklist);
  },

  createChecklist: async (checklist: Omit<ChecklistTemplate, 'id' | 'updated' | 'items'>): Promise<ChecklistTemplate> => {
    const response = await apiClient.post('/platform-admin/checklists/', mapChecklistToBackend(checklist));
    return mapBackendToChecklist(response.data);
  },

  updateChecklist: async (id: string, updated: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> => {
    const response = await apiClient.patch(`/platform-admin/checklists/${id}/`, mapChecklistToBackend(updated));
    return mapBackendToChecklist(response.data);
  },

  deleteChecklist: async (id: string): Promise<void> => {
    await apiClient.delete(`/platform-admin/checklists/${id}/`);
  }
};
