import { Builder, Project, Block, Floor, Unit, Customer, Defect, ServiceRequest, SupportTicket, AssociationTransition, AuditLog, Notification, Payment, Inspection, User, ChecklistTemplate, Plan, CommTemplate } from '../types/models';
import { mockApiCall } from './client';

// Import from granular services
import { usersService } from '../services/usersService';
import { buildersService } from '../services/buildersService';
import { projectsService } from '../services/projectsService';
import { inspectionsService } from '../services/inspectionsService';
import { customersService } from '../services/customersService';
import { defectsService } from '../services/defectsService';
import { contractorsService } from '../services/contractorsService';
import { checklistsService } from '../services/checklistsService';
import { plansService } from '../services/plansService';
import { templatesService } from '../services/templatesService';
import { supportTicketsService } from '../services/supportTicketsService';
import { serviceRequestsService } from '../services/serviceRequestsService';
import { transitionsService } from '../services/transitionsService';
import { documentsService as docSvc } from '../services/documentsService';
import { auditService as audSvc } from '../services/auditService';
import { notificationsService as notifSvc } from '../services/notificationsService';
import { paymentsService } from '../services/paymentsService';

import { apiClient } from './client';

export const usersApi = {
  getUsers: () => mockApiCall(() => usersService.getUsers()),
  createUser: (data: Omit<User, 'id' | 'status'>) => mockApiCall(() => usersService.createUser(data)),
  updateUser: async (id: string, data: Partial<User>) => {
    const response = await apiClient.patch('/accounts/me/', data);
    return response.data;
  },
};

export const teamApi = {
  list: async () => (await apiClient.get('/accounts/team/')).data,
  create: async (data: {
    name: string; email: string; phone: string; role: string; password: string;
    is_active: boolean; assigned_project_ids: string[];
  }) => (await apiClient.post('/accounts/team/', data)).data,
};

export const buildersApi = {
  getBuilders: () => buildersService.getBuilders(),
  createBuilder: (data: any) => buildersService.createBuilder(data),
  updateBuilder: (id: string, data: Partial<Builder>) => buildersService.updateBuilder(id, data),
  approveBuilder: (id: string) => buildersService.approveBuilder(id),
  suspendBuilder: (id: string) => buildersService.suspendBuilder(id),
  rejectBuilder: (id: string) => buildersService.rejectBuilder(id),
};

export const projectsApi = {
  getProjects: async (builderId?: string) => {
    const url = builderId ? `/projects/projects/?builder=${builderId}` : '/projects/projects/';
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },
  createProject: async (data: any) => {
    const response = await apiClient.post('/projects/projects/', data);
    return response.data;
  },
  updateProject: async (id: string, data: any) => {
    const response = await apiClient.patch(`/projects/projects/${id}/`, data);
    return response.data;
  },
};

export const unitsApi = {
  getBlocks: async (projectId?: string) => {
    const url = projectId ? `/projects/blocks/?project=${projectId}` : '/projects/blocks/';
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },
  createBlock: async (data: Omit<Block, 'id'>) => {
    const response = await apiClient.post('/projects/blocks/', data);
    return response.data;
  },
  getFloors: async (blockId?: string) => {
    const url = blockId ? `/projects/floors/?block=${blockId}` : '/projects/floors/';
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },
  createFloor: async (data: Omit<Floor, 'id'>) => {
    const response = await apiClient.post('/projects/floors/', data);
    return response.data;
  },
  getUnits: async (projectId?: string) => {
    const url = projectId ? `/projects/units/?floor__block__project=${projectId}` : '/projects/units/';
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },
  getUnit: async (id: string | number) => {
    const response = await apiClient.get(`/projects/units/${id}/`);
    return response.data;
  },
  createUnit: async (data: any) => {
    const response = await apiClient.post('/projects/units/', data);
    return response.data;
  },
  updateUnit: async (id: string, data: Partial<Unit>) => {
    const response = await apiClient.patch(`/projects/units/${id}/`, data);
    return response.data;
  },
};

export const inspectionsApi = {
  getInspections: async () => {
    const response = await apiClient.get('/inspections/inspections/');
    return response.data.results || response.data;
  },
  createInspection: async (data: Omit<Inspection, 'id'>) => {
    const response = await apiClient.post('/inspections/inspections/', data);
    return response.data;
  },
};

export const customersApi = {
  getCustomers: async (builderId?: string) => {
    // Customers are currently stored as users with CUSTOMER role
    const response = await apiClient.get('/accounts/team/');
    const team = response.data.results || response.data;
    return team.filter((user: any) => user.role === 'CUSTOMER');
  },
  createCustomer: async (data: any) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'CUSTOMER',
      password: data.password || 'Customer@123',
      is_active: true,
      assigned_project_ids: data.projectId ? [data.projectId] : []
    };
    const response = await apiClient.post('/accounts/team/', payload);
    return response.data;
  },
  createCustomerWithAccount: async (data: any) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'CUSTOMER',
      password: data.password || 'Customer@123',
      is_active: true,
      assigned_project_ids: data.projectId ? [data.projectId] : []
    };
    const response = await apiClient.post('/accounts/team/', payload);
    return response.data;
  }
};

export const dashboardApi = {
  getStats: async () => {
    const builders = await buildersService.getBuilders();
    return {
      stats: {
        activeBuilders: builders.length,
        activeProjects: projectsService.getProjects().length,
        unitsInHandover: projectsService.getUnits().filter(u => u.status === 'Handed Over' || u.status === 'Approved').length,
        openSupport: supportTicketsService.getSupportTickets().filter(t => t.status !== 'Resolved').length
      },
      recentActivity: audSvc.getAuditLogs().slice(0, 5).map(log => ({
        title: log.action,
        description: log.details,
        time: log.date
      }))
    };
  }
};

export const defectsApi = {
  getDefects: async (projectId?: string) => {
    // If projectId is provided, we should filter by it if backend supports it, else get all
    const response = await apiClient.get('/inspections/defects/');
    return response.data.results || response.data;
  },
  createDefect: async (data: any) => {
    const response = await apiClient.post('/inspections/defects/', data);
    return response.data;
  },
  updateDefect: async (id: string, status: Defect['status'], note: string, resolutionEvidence?: string, contractorId?: string) => {
    const payload: any = { status };
    if (contractorId) payload.assigned_contractor = contractorId;
    const response = await apiClient.patch(`/inspections/defects/${id}/`, payload);
    return response.data;
  },
};

export const contractorsApi = {
  getContractors: (assignedProjectIds?: string[]) => mockApiCall(() => {
    const list = contractorsService.getContractors();
    return assignedProjectIds ? list.filter(c => c.assignedProjectIds.some(id => assignedProjectIds.includes(id))) : list;
  }),
  updateContractor: (id: string, data: Partial<any>) => mockApiCall(() => contractorsService.updateContractor(id, data)),
  createContractorWithAccount: (data: any & { password?: string }) => mockApiCall(() => {
    if (usersService.findUserByEmail(data.email)) {
      throw new Error(`User with email ${data.email} already exists`);
    }
    const contractor = contractorsService.createContractor({
      builderId: data.builderId,
      companyName: data.companyName,
      contactPersonFirstName: data.contactPersonFirstName,
      contactPersonLastName: data.contactPersonLastName,
      email: data.email,
      phone: data.phone,
      trade: data.trade,
      status: data.status,
      assignedProjectIds: data.assignedProjectIds,
      address: data.address,
      notes: data.notes
    });
    usersService.createUser({
      name: `${data.contactPersonFirstName} ${data.contactPersonLastName}`,
      email: data.email,
      phone: data.phone,
      role: 'contractor',
      password: data.password || 'Contractor@1234',
      builderId: data.builderId,
      assignedProjectIds: data.assignedProjectIds
    });
    return contractor;
  })
};

export const checklistsApi = {
  getChecklists: () => checklistsService.getChecklists(),
  createChecklist: (data: Omit<ChecklistTemplate, 'id' | 'updated' | 'items'>) => checklistsService.createChecklist(data),
  updateChecklist: (id: string, data: Partial<ChecklistTemplate>) => checklistsService.updateChecklist(id, data),
  deleteChecklist: (id: string) => checklistsService.deleteChecklist(id),
};

export const plansApi = {
  getPlans: () => plansService.getPlans(),
  createPlan: (data: Omit<Plan, 'id'>) => plansService.createPlan(data),
  updatePlan: (id: string, data: Partial<Plan>) => plansService.updatePlan(id, data),
  deletePlan: (id: string) => plansService.deletePlan(id),
};

export const templatesApi = {
  getTemplates: () => mockApiCall(() => templatesService.getTemplates()),
  createTemplate: (data: Omit<CommTemplate, 'id' | 'updated'>) => mockApiCall(() => templatesService.createTemplate(data)),
  updateTemplate: (id: string, data: Partial<CommTemplate>) => mockApiCall(() => templatesService.updateTemplate(id, data)),
};

export const supportApi = {
  getTickets: () => mockApiCall(() => supportTicketsService.getSupportTickets()),
  createTicket: (data: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'conversation'>) => mockApiCall(() => supportTicketsService.createSupportTicket(data)),
  addMessage: (id: string, sender: 'builder' | 'admin', message: string) => mockApiCall(() => supportTicketsService.addSupportMessage(id, sender, message)),
  updateStatus: (id: string, status: SupportTicket['status']) => mockApiCall(() => supportTicketsService.updateSupportStatus(id, status)),
};

export const serviceRequestsApi = {
  getRequests: () => mockApiCall(() => serviceRequestsService.getServiceRequests()),
  createRequest: (data: Omit<ServiceRequest, 'id' | 'status' | 'contractorId' | 'date'>) => mockApiCall(() => serviceRequestsService.createServiceRequest(data)),
  updateRequest: (id: string, status: ServiceRequest['status'], contractorId?: string | null) => mockApiCall(() => serviceRequestsService.updateServiceRequest(id, status, contractorId)),
};

export const associationApi = {
  getTransitions: () => mockApiCall(() => transitionsService.getTransitions()),
  updateStep: (builderId: string, step: AssociationTransition['step']) => mockApiCall(() => transitionsService.updateTransitionStep(builderId, step)),
  updateItem: (builderId: string, field: keyof Omit<AssociationTransition, 'builderId' | 'step'>, status: 'Pending' | 'In Progress' | 'Completed') => mockApiCall(() => transitionsService.updateTransitionItem(builderId, field, status)),
};

export const documentService = {
  getDocuments: () => mockApiCall(() => docSvc.getDocuments()),
  
  getCustomerDocuments: (customerId: string) => mockApiCall(() => {
    return docSvc.getDocuments().filter(d => d.customerId === customerId);
  }),
  
  getUnitDocuments: (unitId: string) => mockApiCall(() => {
    return docSvc.getDocuments().filter(d => d.unitId === unitId);
  }),
  
  getDefectEvidence: (defectId: string) => mockApiCall(() => {
    return docSvc.getDocuments().filter(d => d.defectId === defectId);
  }),
  
  uploadDocument: (data: Omit<Parameters<typeof docSvc.createDocument>[0], 'id'>) => mockApiCall(() => docSvc.createDocument(data)),
  
  verifyDocument: (id: string) => mockApiCall(() => docSvc.updateDocumentStatus(id, 'Verified')),
  
  rejectDocument: (id: string, reason: string) => mockApiCall(() => docSvc.updateDocumentStatus(id, 'Rejected', reason)),
  
  deleteDocument: (id: string) => mockApiCall(() => docSvc.deleteDocument(id)),
};

export const auditService = {
  getAuditLogs: () => mockApiCall(() => audSvc.getAuditLogs()),
  createAuditLog: (data: Omit<AuditLog, 'id' | 'date'>) => mockApiCall(() => audSvc.createAuditLog(data)),
};

export const notificationService = {
  getNotifications: (userId?: string) => mockApiCall(() => notifSvc.getNotifications(userId)),
  createNotification: (data: Omit<Notification, 'id' | 'date' | 'isRead'>) => mockApiCall(() => notifSvc.createNotification(data)),
  markAsRead: (id: string) => mockApiCall(() => notifSvc.markNotificationRead(id)),
};

export const paymentService = {
  getPayments: (unitId?: string) => mockApiCall(() => paymentsService.getPayments(unitId)),
  createPayment: (data: Omit<Payment, 'id'>) => mockApiCall(() => paymentsService.createPayment(data)),
  updatePaymentStatus: (id: string, status: Payment['status'], verifiedBy?: string) => mockApiCall(() => paymentsService.updatePaymentStatus(id, status, verifiedBy)),
};
