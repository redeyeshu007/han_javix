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

export const usersApi = {
  getUsers: () => mockApiCall(() => usersService.getUsers()),
  createUser: (data: Omit<User, 'id' | 'status'>) => mockApiCall(() => usersService.createUser(data)),
  updateUser: (id: string, data: Partial<User>) => mockApiCall(() => usersService.updateUser(id, data)),
};

export const buildersApi = {
  getBuilders: () => mockApiCall(() => buildersService.getBuilders()),
  createBuilder: (data: Omit<Builder, 'id' | 'joined'>) => mockApiCall(() => buildersService.createBuilder(data)),
  updateBuilder: (id: string, data: Partial<Builder>) => mockApiCall(() => buildersService.updateBuilder(id, data)),
};

export const projectsApi = {
  getProjects: (builderId?: string) => mockApiCall(() => projectsService.getProjects(builderId)),
  createProject: (data: Omit<Project, 'id' | 'progress' | 'blocksCount' | 'unitsCount'>) => mockApiCall(() => projectsService.createProject(data)),
  updateProject: (id: string, data: Partial<Project>) => mockApiCall(() => projectsService.updateProject(id, data)),
};

export const unitsApi = {
  getBlocks: (projectId?: string) => mockApiCall(() => projectsService.getBlocks(projectId)),
  createBlock: (data: Omit<Block, 'id'>) => mockApiCall(() => projectsService.createBlock(data)),
  getFloors: (blockId?: string) => mockApiCall(() => projectsService.getFloors(blockId)),
  createFloor: (data: Omit<Floor, 'id'>) => mockApiCall(() => projectsService.createFloor(data)),
  getUnits: (projectId?: string) => mockApiCall(() => projectsService.getUnits(projectId)),
  createUnit: (data: Omit<Unit, 'id' | 'customerId' | 'inspectionStatus' | 'docsCleared' | 'paymentCleared' | 'defectsCleared' | 'keysHandedOver' | 'approvalsCleared'> & { status?: 'Under Construction' | 'Ready for Inspection' }) => mockApiCall(() => projectsService.createUnit(data)),
  updateUnit: (id: string, data: Partial<Unit>) => mockApiCall(() => projectsService.updateUnit(id, data)),
};

export const inspectionsApi = {
  getInspections: () => mockApiCall(() => inspectionsService.getInspections()),
  createInspection: (data: Omit<Inspection, 'id'>) => mockApiCall(() => inspectionsService.createInspection(data)),
};

export const customersApi = {
  getCustomers: (builderId?: string) => mockApiCall(() => customersService.getCustomers(builderId)),
  createCustomer: (data: Omit<Customer, 'id' | 'handoverStatus'>) => mockApiCall(() => customersService.createCustomer(data)),
  createCustomerWithAccount: (data: Omit<Customer, 'id' | 'handoverStatus'> & { password?: string }) => mockApiCall(() => {
    const customer = customersService.createCustomer(data);
    usersService.createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'customer',
      password: data.password || 'Customer@123',
      builderId: data.builderId,
      projectId: data.projectId,
      unitId: data.unitId
    });
    return customer;
  })
};

export const dashboardApi = {
  getStats: () => mockApiCall(() => ({
    stats: {
      activeBuilders: buildersService.getBuilders().length,
      activeProjects: projectsService.getProjects().length,
      unitsInHandover: projectsService.getUnits().filter(u => u.status === 'Handed Over' || u.status === 'Approved').length,
      openSupport: supportTicketsService.getSupportTickets().filter(t => t.status !== 'Resolved').length
    },
    recentActivity: audSvc.getAuditLogs().slice(0, 5).map(log => ({
      title: log.action,
      description: log.details,
      time: log.date
    }))
  })),
};

export const defectsApi = {
  getDefects: (projectId?: string) => mockApiCall(() => defectsService.getDefects(projectId)),
  createDefect: (data: Omit<Defect, 'id' | 'status' | 'timeline'>) => mockApiCall(() => defectsService.createDefect(data)),
  updateDefect: (id: string, status: Defect['status'], note: string, resolutionEvidence?: string, contractorId?: string) => mockApiCall(() => defectsService.updateDefect(id, status, note, resolutionEvidence, contractorId)),
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
  getChecklists: () => mockApiCall(() => checklistsService.getChecklists()),
  createChecklist: (data: Omit<ChecklistTemplate, 'id' | 'updated'>) => mockApiCall(() => checklistsService.createChecklist(data)),
  updateChecklist: (id: string, data: Partial<ChecklistTemplate>) => mockApiCall(() => checklistsService.updateChecklist(id, data)),
};

export const plansApi = {
  getPlans: () => mockApiCall(() => plansService.getPlans()),
  createPlan: (data: Omit<Plan, 'id'>) => mockApiCall(() => plansService.createPlan(data)),
  updatePlan: (id: string, data: Partial<Plan>) => mockApiCall(() => plansService.updatePlan(id, data)),
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
