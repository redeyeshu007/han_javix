import { mockDb, Builder, Project, Block, Floor, Unit, Customer, Defect, ServiceRequest, SupportTicket, AssociationTransition, AuditLog, Notification, Payment, Inspection } from '../services/mockDb';
import { mockApiCall } from './client';

export const buildersApi = {
  getBuilders: () => mockApiCall(() => mockDb.getBuilders()),
  createBuilder: (data: Omit<Builder, 'id' | 'joined'>) => mockApiCall(() => mockDb.createBuilder(data)),
  updateBuilder: (id: string, data: Partial<Builder>) => mockApiCall(() => mockDb.updateBuilder(id, data)),
};

export const projectsApi = {
  getProjects: (builderId?: string) => mockApiCall(() => mockDb.getProjects(builderId)),
  createProject: (data: Omit<Project, 'id' | 'progress' | 'blocksCount' | 'unitsCount'>) => mockApiCall(() => mockDb.createProject(data)),
  updateProject: (id: string, data: Partial<Project>) => mockApiCall(() => mockDb.updateProject(id, data)),
};

export const unitsApi = {
  getBlocks: (projectId?: string) => mockApiCall(() => mockDb.getBlocks(projectId)),
  createBlock: (data: Omit<Block, 'id'>) => mockApiCall(() => mockDb.createBlock(data)),
  getFloors: (blockId?: string) => mockApiCall(() => mockDb.getFloors(blockId)),
  createFloor: (data: Omit<Floor, 'id'>) => mockApiCall(() => mockDb.createFloor(data)),
  getUnits: (projectId?: string) => mockApiCall(() => mockDb.getUnits(projectId)),
  createUnit: (data: Omit<Unit, 'id' | 'status' | 'customerId' | 'inspectionStatus' | 'docsCleared' | 'paymentCleared' | 'defectsCleared' | 'keysHandedOver' | 'approvalsCleared'>) => mockApiCall(() => mockDb.createUnit(data)),
  updateUnit: (id: string, data: Partial<Unit>) => mockApiCall(() => mockDb.updateUnit(id, data)),
};

export const inspectionsApi = {
  getInspections: () => mockApiCall(() => mockDb.getInspections()),
  createInspection: (data: Omit<Inspection, 'id'>) => mockApiCall(() => mockDb.createInspection(data)),
};

export const customersApi = {
  getCustomers: (builderId?: string) => mockApiCall(() => mockDb.getCustomers(builderId)),
  createCustomer: (data: Omit<Customer, 'id' | 'handoverStatus'>) => mockApiCall(() => mockDb.createCustomer(data)),
  createCustomerWithAccount: (data: Omit<Customer, 'id' | 'handoverStatus'> & { password?: string }) => mockApiCall(() => {
    const customer = mockDb.createCustomer(data);
    mockDb.createUser({
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
      activeBuilders: mockDb.getBuilders().length,
      activeProjects: mockDb.getProjects().length,
      unitsInHandover: mockDb.getUnits().filter(u => u.status === 'Handed Over' || u.status === 'Approved').length,
      openSupport: mockDb.getSupportTickets().filter(t => t.status !== 'Resolved').length
    },
    recentActivity: mockDb.getAuditLogs().slice(0, 5).map(log => ({
      title: log.action,
      description: log.details,
      time: log.date
    }))
  })),
};

export const defectsApi = {
  getDefects: (projectId?: string) => mockApiCall(() => mockDb.getDefects(projectId)),
  createDefect: (data: Omit<Defect, 'id' | 'status' | 'timeline'>) => mockApiCall(() => mockDb.createDefect(data)),
  updateDefect: (id: string, status: Defect['status'], note: string, resolutionEvidence?: string) => mockApiCall(() => mockDb.updateDefect(id, status, note, resolutionEvidence)),
};

export const contractorsApi = {
  getContractors: () => mockApiCall(() => mockDb.getContractors()),
  updateContractor: (id: string, data: Partial<any>) => mockApiCall(() => mockDb.updateContractor(id, data)),
  createContractorWithAccount: (data: any & { password?: string }) => mockApiCall(() => {
    const contractor = mockDb.createContractor({
      builderId: data.builderId,
      companyName: data.companyName,
      contactPersonFirstName: data.contactPersonFirstName,
      contactPersonLastName: data.contactPersonLastName,
      email: data.email,
      phone: data.phone,
      trade: data.trade,
      status: data.status,
      assignedProjects: data.assignedProjects,
      address: data.address,
      notes: data.notes
    });
    mockDb.createUser({
      name: `${data.contactPersonFirstName} ${data.contactPersonLastName}`,
      email: data.email,
      phone: data.phone,
      role: 'contractor',
      password: data.password || 'Contractor@1234',
      builderId: data.builderId
    });
    return contractor;
  })
};

export const checklistsApi = {
  getChecklists: () => mockApiCall(() => mockDb.getChecklists()),
};

export const supportApi = {
  getTickets: () => mockApiCall(() => mockDb.getSupportTickets()),
  createTicket: (data: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'conversation'>) => mockApiCall(() => mockDb.createSupportTicket(data)),
  addMessage: (id: string, sender: 'builder' | 'admin', message: string) => mockApiCall(() => mockDb.addSupportMessage(id, sender, message)),
  updateStatus: (id: string, status: SupportTicket['status']) => mockApiCall(() => mockDb.updateSupportStatus(id, status)),
};

export const serviceRequestsApi = {
  getRequests: () => mockApiCall(() => mockDb.getServiceRequests()),
  createRequest: (data: Omit<ServiceRequest, 'id' | 'status' | 'contractorId' | 'date'>) => mockApiCall(() => mockDb.createServiceRequest(data)),
  updateRequest: (id: string, status: ServiceRequest['status'], contractorId?: string | null) => mockApiCall(() => mockDb.updateServiceRequest(id, status, contractorId)),
};

export const associationApi = {
  getTransitions: () => mockApiCall(() => mockDb.getTransitions()),
  updateStep: (builderId: string, step: AssociationTransition['step']) => mockApiCall(() => mockDb.updateTransitionStep(builderId, step)),
  updateItem: (builderId: string, field: keyof Omit<AssociationTransition, 'builderId' | 'step'>, status: 'Pending' | 'In Progress' | 'Completed') => mockApiCall(() => mockDb.updateTransitionItem(builderId, field, status)),
};

export const documentService = {
  getDocuments: () => mockApiCall(() => mockDb.getDocuments()),
  
  getCustomerDocuments: (customerId: string) => mockApiCall(() => {
    return mockDb.getDocuments().filter(d => d.customerId === customerId);
  }),
  
  getUnitDocuments: (unitId: string) => mockApiCall(() => {
    return mockDb.getDocuments().filter(d => d.unitId === unitId);
  }),
  
  getDefectEvidence: (defectId: string) => mockApiCall(() => {
    return mockDb.getDocuments().filter(d => d.defectId === defectId);
  }),
  
  uploadDocument: (data: Omit<Parameters<typeof mockDb.createDocument>[0], 'id'>) => mockApiCall(() => mockDb.createDocument(data)),
  
  verifyDocument: (id: string) => mockApiCall(() => mockDb.updateDocumentStatus(id, 'Verified')),
  
  rejectDocument: (id: string, reason: string) => mockApiCall(() => mockDb.updateDocumentStatus(id, 'Rejected', reason)),
  
  deleteDocument: (id: string) => mockApiCall(() => mockDb.deleteDocument(id)),
};

export const auditService = {
  getAuditLogs: () => mockApiCall(() => mockDb.getAuditLogs()),
  createAuditLog: (data: Omit<AuditLog, 'id' | 'date'>) => mockApiCall(() => mockDb.createAuditLog(data)),
};

export const notificationService = {
  getNotifications: (userId?: string) => mockApiCall(() => mockDb.getNotifications(userId)),
  createNotification: (data: Omit<Notification, 'id' | 'date' | 'isRead'>) => mockApiCall(() => mockDb.createNotification(data)),
  markAsRead: (id: string) => mockApiCall(() => mockDb.markNotificationRead(id)),
};

export const paymentService = {
  getPayments: (unitId?: string) => mockApiCall(() => mockDb.getPayments(unitId)),
  createPayment: (data: Omit<Payment, 'id'>) => mockApiCall(() => mockDb.createPayment(data)),
  updatePaymentStatus: (id: string, status: Payment['status']) => mockApiCall(() => mockDb.updatePaymentStatus(id, status)),
};
