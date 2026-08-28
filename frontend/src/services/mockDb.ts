// Handoverly AI Centralized Mock Database
// Persists in localStorage for a fully interactive frontend prototype

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'builder_admin' | 'project_manager' | 'site_engineer' | 'crm' | 'accounts' | 'contractor' | 'customer';
  password: string;
  builderId?: string;
  projectId?: string;
  unitId?: string;
  assignedProjectIds?: string[]; // project_manager / site_engineer / crm / accounts scoping
  status: 'Active' | 'Inactive';
  notifyEmail?: boolean;
  notifySystemAlerts?: boolean;
}

export interface Contractor {
  id: string;
  builderId: string;
  companyName: string;
  contactPersonFirstName: string;
  contactPersonLastName: string;
  email: string;
  phone: string;
  trade: string;
  status: string;
  assignedProjectIds: string[]; // List of project IDs
  address?: string;
  notes?: string;
}

export interface Builder {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  brn: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Pending' | 'Suspended';
  joined: string;
}

export interface Project {
  id: string;
  builderId: string;
  name: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Suspended';
  progress: number;
  blocksCount: number;
  unitsCount: number;
}

export interface Block {
  id: string;
  builderId: string;
  projectId: string;
  name: string;
}

export interface Floor {
  id: string;
  builderId: string;
  projectId: string;
  blockId: string;
  name: string;
}

export interface Unit {
  id: string;
  builderId: string;
  projectId: string;
  blockId: string;
  floorId: string;
  name: string;
  status: 'Under Construction' | 'Ready for Inspection' | 'Defects Found' | 'Resolved' | 'Approved' | 'Handed Over';
  customerId: string | null;
  inspectionStatus: 'Pending' | 'In Progress' | 'Failed' | 'Passed';
  docsCleared: boolean;
  paymentCleared: boolean;
  defectsCleared: boolean;
  keysHandedOver: boolean;
  approvalsCleared: boolean;
  type?: string;
  areaSqFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: string;
}

export interface Inspection {
  id: string;
  builderId: string;
  projectId: string;
  unitId: string;
  inspectorId: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  date: string;
  checklistId?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  builderId: string;
  projectId: string;
  unitId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  handoverStatus: 'Awaiting Review' | 'Inspection Scheduled' | 'Accepted' | 'Complete';
}

export interface Defect {
  id: string;
  builderId: string;
  projectId: string;
  unitId: string;
  inspectionId?: string;
  title: string;
  description: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  contractorId: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  evidence: string[];
  resolutionEvidence?: string;
  timeline: { status: string; date: string; note: string }[];
}

export interface SupportTicket {
  id: string;
  builderId: string;
  requester: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Pending' | 'Resolved';
  lastUpdate: string;
  conversation: { sender: 'builder' | 'admin'; message: string; date: string }[];
}

export interface ServiceRequest {
  id: string;
  unitId: string;
  customerId: string;
  request: string;
  status: 'Request' | 'Assign' | 'Resolve' | 'Customer confirmation';
  contractorId: string | null;
  date: string;
}

export interface Document {
  id: string;
  builderId?: string;
  projectId?: string;
  unitId?: string;
  customerId?: string;
  defectId?: string;
  category: string;
  documentType: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  description?: string;
  fileData?: string; // base64 or temporary object URL
  rejectionReason?: string;
}

export interface AssociationTransition {
  builderId: string;
  step: 'Preparation' | 'Review' | 'Transfer' | 'Acceptance' | 'Complete';
  commonAreas: 'Pending' | 'In Progress' | 'Completed';
  assets: 'Pending' | 'In Progress' | 'Completed';
  contracts: 'Pending' | 'In Progress' | 'Completed';
  financials: 'Pending' | 'In Progress' | 'Completed';
  legals: 'Pending' | 'In Progress' | 'Completed';
  commitments: 'Pending' | 'In Progress' | 'Completed';
}

export interface AuditLog {
  id: string;
  builderId?: string;
  projectId?: string;
  unitId?: string;
  actor: string;
  action: string;
  details: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  date: string;
  link?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  billingCycle: 'Monthly' | 'Yearly';
  maxProjects: string;
  maxUnits: string;
  maxUsers: string;
  storageLimit: string;
  status: 'Active' | 'Inactive';
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  items: number;
  status: 'Active' | 'Draft' | 'Archived';
  updated: string;
}

export interface CommTemplate {
  id: string;
  name: string;
  type: 'Report' | 'Letter' | 'Certificate' | 'Email';
  description?: string;
  status: 'Active' | 'Draft' | 'Archived';
  updated: string;
}

export interface Payment {
  id: string;
  projectId: string;
  unitId: string;
  customerId: string;
  amount: number;
  paymentType: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  status: 'Pending Verification' | 'Verified' | 'Cleared' | 'Rejected';
  notes?: string;
  proofFileName?: string;
  proofFileData?: string;
  createdBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Keep legacy title for compatibility or map paymentType to title.
  title?: string;
  dueDate?: string;
  clearedDate?: string;
}


// Initial seed data - User Requested Controlled Test Data
const initialUsers: User[] = [
  { id: 'USR-000', name: 'Super Admin', email: 'admin@handoverly.com', phone: '', role: 'super_admin', password: 'Admin@123', status: 'Active' }
];

const initialBuilders: Builder[] = [];
const initialProjects: Project[] = [];
const initialBlocks: Block[] = [];
const initialFloors: Floor[] = [];
const initialUnits: Unit[] = [];
const initialCustomers: Customer[] = [];
const initialDefects: Defect[] = [];
const initialContractors: Contractor[] = [];
const initialSupportTickets: SupportTicket[] = [];
const initialChecklists: any[] = [];
const initialServiceRequests: ServiceRequest[] = [];
const initialDocuments: Document[] = [];
const initialTransition: AssociationTransition[] = [];

// Helper to initialize database if empty
// USING PREFIX handoverly_db TO ENSURE A CLEAN STATE FOR TESTING
const DB_KEY = 'handoverly_db_v4';

export interface Database {
  users: User[];
  builders: Builder[];
  projects: Project[];
  blocks: Block[];
  floors: Floor[];
  units: Unit[];
  customers: Customer[];
  defects: Defect[];
  contractors: Contractor[];
  supportTickets: SupportTicket[];
  checklists: ChecklistTemplate[];
  serviceRequests: ServiceRequest[];
  documents: Document[];
  transition: AssociationTransition[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  payments: Payment[];
  inspections: Inspection[];
  plans: Plan[];
  templates: CommTemplate[];
}

export const initMockDb = (): Database => {
  if (!localStorage.getItem(DB_KEY)) {
    const initialDb: Database = {
      users: initialUsers,
      builders: initialBuilders,
      projects: initialProjects,
      blocks: initialBlocks,
      floors: initialFloors,
      units: initialUnits,
      customers: initialCustomers,
      defects: initialDefects,
      contractors: initialContractors,
      supportTickets: initialSupportTickets,
      checklists: initialChecklists,
      serviceRequests: initialServiceRequests,
      documents: initialDocuments,
      transition: initialTransition,
      auditLogs: [],
      notifications: [],
      payments: [],
      inspections: [],
      plans: [],
      templates: []
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  }
  return JSON.parse(localStorage.getItem(DB_KEY)!);
};

// Backfills arrays that didn't exist in a Database shape persisted by an earlier version of this file.
const withDefaults = (db: Database): Database => ({
  ...db,
  plans: db.plans || [],
  templates: db.templates || [],
  checklists: db.checklists || []
});

const getDb = (): Database => {
  const dbStr = localStorage.getItem(DB_KEY);
  if (!dbStr) return initMockDb();
  return withDefaults(JSON.parse(dbStr));
};

const saveDb = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Database Access Methods
export const mockDb = {
  getInspections: (): Inspection[] => getDb().inspections,
  
  createInspection: (inspection: Omit<Inspection, 'id'>): Inspection => {
    const db = getDb();
    const newInspection: Inspection = {
      ...inspection,
      id: `INSP-${String(db.inspections.length + 1).padStart(3, '0')}`
    };
    db.inspections.push(newInspection);
    saveDb(db);
    return newInspection;
  },
  
  // Authentication
  getUsers: (): User[] => getDb().users,
  
  findUserByEmail: (email: string): User | undefined => {
    const list = mockDb.getUsers();
    return list.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  
  findUserById: (id: string): User | undefined => {
    const list = mockDb.getUsers();
    return list.find(u => u.id === id);
  },

  authenticateUser: (email: string, password: string): User | null => {
    const user = mockDb.findUserByEmail(email);
    if (user && user.password === password && user.status === 'Active') {
      return user;
    }
    return null;
  },

  createUser: (user: Omit<User, 'id' | 'status'>): User => {
    const db = getDb();
    
    // Duplicate email check
    if (db.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error(`User with email ${user.email} already exists`);
    }

    const newUser: User = {
      ...user,
      id: `USR-${String(db.users.length + 1).padStart(3, '0')}`,
      status: 'Active'
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  updateUser: (id: string, updated: Partial<User>): User => {
    const db = getDb();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updated };
      saveDb(db);
      return db.users[idx];
    }
    throw new Error('User not found');
  },

  // GET lists
  getBuilders: (): Builder[] => getDb().builders,
  getProjects: (builderId?: string): Project[] => {
    const list = getDb().projects;
    return builderId ? list.filter(p => p.builderId === builderId) : list;
  },
  getBlocks: (projectId?: string): Block[] => {
    const list = getDb().blocks;
    return projectId ? list.filter(b => b.projectId === projectId) : list;
  },
  getFloors: (blockId?: string): Floor[] => {
    const list = getDb().floors;
    return blockId ? list.filter(f => f.blockId === blockId) : list;
  },
  getUnits: (projectId?: string): Unit[] => {
    const list = getDb().units;
    return projectId ? list.filter(u => u.projectId === projectId) : list;
  },
  getCustomers: (builderId?: string): Customer[] => {
    const list = getDb().customers;
    return builderId ? list.filter(c => c.builderId === builderId) : list;
  },
  getDefects: (projectId?: string): Defect[] => {
    const list = getDb().defects;
    return projectId ? list.filter(d => d.projectId === projectId) : list;
  },
  getContractors: (): Contractor[] => getDb().contractors,
  getSupportTickets: (): SupportTicket[] => getDb().supportTickets,
  getChecklists: (): ChecklistTemplate[] => getDb().checklists,
  getServiceRequests: (): ServiceRequest[] => getDb().serviceRequests,
  getTransitions: (): AssociationTransition[] => getDb().transition,

  createChecklist: (checklist: Omit<ChecklistTemplate, 'id' | 'updated'>): ChecklistTemplate => {
    const db = getDb();
    const newChecklist: ChecklistTemplate = {
      ...checklist,
      id: `CHK-${String(db.checklists.length + 1).padStart(3, '0')}`,
      updated: new Date().toISOString().split('T')[0]
    };
    db.checklists.push(newChecklist);
    saveDb(db);
    return newChecklist;
  },

  updateChecklist: (id: string, updated: Partial<ChecklistTemplate>): ChecklistTemplate => {
    const db = getDb();
    const idx = db.checklists.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.checklists[idx] = { ...db.checklists[idx], ...updated, updated: new Date().toISOString().split('T')[0] };
      saveDb(db);
      return db.checklists[idx];
    }
    throw new Error('Checklist not found');
  },

  getPlans: (): Plan[] => getDb().plans,

  createPlan: (plan: Omit<Plan, 'id'>): Plan => {
    const db = getDb();
    const newPlan: Plan = { ...plan, id: `PLN-${String(db.plans.length + 1).padStart(3, '0')}` };
    db.plans.push(newPlan);
    saveDb(db);
    return newPlan;
  },

  updatePlan: (id: string, updated: Partial<Plan>): Plan => {
    const db = getDb();
    const idx = db.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.plans[idx] = { ...db.plans[idx], ...updated };
      saveDb(db);
      return db.plans[idx];
    }
    throw new Error('Plan not found');
  },

  getTemplates: (): CommTemplate[] => getDb().templates,

  createTemplate: (template: Omit<CommTemplate, 'id' | 'updated'>): CommTemplate => {
    const db = getDb();
    const newTemplate: CommTemplate = {
      ...template,
      id: `TPL-${String(db.templates.length + 1).padStart(3, '0')}`,
      updated: new Date().toISOString().split('T')[0]
    };
    db.templates.push(newTemplate);
    saveDb(db);
    return newTemplate;
  },

  updateTemplate: (id: string, updated: Partial<CommTemplate>): CommTemplate => {
    const db = getDb();
    const idx = db.templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.templates[idx] = { ...db.templates[idx], ...updated, updated: new Date().toISOString().split('T')[0] };
      saveDb(db);
      return db.templates[idx];
    }
    throw new Error('Template not found');
  },

  // CRUD Mutations (writes to localStorage)
  createContractor: (contractor: Omit<Contractor, 'id'>): Contractor => {
    const db = getDb();
    const newContractor: Contractor = {
      ...contractor,
      id: `CON-${String(db.contractors.length + 1).padStart(3, '0')}`
    };
    db.contractors.push(newContractor);
    saveDb(db);
    return newContractor;
  },

  updateContractor: (id: string, updated: Partial<Contractor>): Contractor => {
    const db = getDb();
    const idx = db.contractors.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.contractors[idx] = { ...db.contractors[idx], ...updated };
      saveDb(db);
      return db.contractors[idx];
    }
    throw new Error('Contractor not found');
  },

  createBuilder: (builder: Omit<Builder, 'id' | 'joined'>): Builder => {
    const db = getDb();
    const newBuilder: Builder = {
      ...builder,
      id: `BLD-${String(db.builders.length + 1).padStart(3, '0')}`,
      joined: new Date().toISOString().split('T')[0]
    };
    db.builders.push(newBuilder);
    saveDb(db);
    return newBuilder;
  },

  updateBuilder: (id: string, updated: Partial<Builder>): Builder => {
    const db = getDb();
    const idx = db.builders.findIndex(b => b.id === id);
    if (idx !== -1) {
      db.builders[idx] = { ...db.builders[idx], ...updated };
      saveDb(db);
      return db.builders[idx];
    }
    throw new Error('Builder not found');
  },

  createProject: (project: Omit<Project, 'id' | 'progress' | 'blocksCount' | 'unitsCount'>): Project => {
    const db = getDb();
    const newProject: Project = {
      ...project,
      id: `PRJ-${String(db.projects.length + 1).padStart(3, '0')}`,
      progress: 0,
      blocksCount: 0,
      unitsCount: 0
    };
    db.projects.push(newProject);
    saveDb(db);
    return newProject;
  },

  updateProject: (id: string, updated: Partial<Project>): Project => {
    const db = getDb();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.projects[idx] = { ...db.projects[idx], ...updated };
      saveDb(db);
      return db.projects[idx];
    }
    throw new Error('Project not found');
  },

  createBlock: (block: Omit<Block, 'id'>): Block => {
    const db = getDb();
    const newBlock: Block = {
      ...block,
      id: `BLK-${String(db.blocks.length + 1).padStart(3, '0')}`
    };
    db.blocks.push(newBlock);
    
    // Update block count on project
    const pIdx = db.projects.findIndex(p => p.id === block.projectId);
    if (pIdx !== -1) {
      db.projects[pIdx].blocksCount += 1;
    }
    saveDb(db);

    return newBlock;
  },

  createFloor: (floor: Omit<Floor, 'id'>): Floor => {
    const db = getDb();
    const newFloor: Floor = {
      ...floor,
      id: `FLR-${String(db.floors.length + 1).padStart(3, '0')}`
    };
    db.floors.push(newFloor);
    saveDb(db);
    return newFloor;
  },

  createUnit: (unit: Omit<Unit, 'id' | 'customerId' | 'inspectionStatus' | 'docsCleared' | 'paymentCleared' | 'defectsCleared' | 'keysHandedOver' | 'approvalsCleared'> & { status?: 'Under Construction' | 'Ready for Inspection' }): Unit => {
    const db = getDb();
    const newUnit: Unit = {
      ...unit,
      id: `UNIT-${String(db.units.length + 1).padStart(3, '0')}`,
      status: unit.status || 'Under Construction',
      customerId: null,
      inspectionStatus: 'Pending',
      docsCleared: false,
      paymentCleared: false,
      defectsCleared: false,
      keysHandedOver: false,
      approvalsCleared: false
    };
    db.units.push(newUnit);

    // Update units count on project
    const pIdx = db.projects.findIndex(p => p.id === unit.projectId);
    if (pIdx !== -1) {
      db.projects[pIdx].unitsCount += 1;
    }
    saveDb(db);

    return newUnit;
  },

  updateUnit: (id: string, updated: Partial<Unit>): Unit => {
    const db = getDb();
    const idx = db.units.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.units[idx] = { ...db.units[idx], ...updated };
      
      // Auto status mapping based on checklist
      const u = db.units[idx];
      if (u.docsCleared && u.paymentCleared && u.defectsCleared && u.approvalsCleared) {
        if (u.keysHandedOver) {
          u.status = 'Handed Over';
        } else {
          u.status = 'Approved';
        }
      }

      // Keep the assigned customer's handoverStatus in sync with the unit's real progress.
      if (u.customerId) {
        const cIdx = db.customers.findIndex(c => c.id === u.customerId);
        if (cIdx !== -1) {
          let handoverStatus: Customer['handoverStatus'] = 'Awaiting Review';
          if (u.status === 'Handed Over') {
            handoverStatus = 'Complete';
          } else if (u.docsCleared && u.paymentCleared && u.defectsCleared && u.approvalsCleared) {
            handoverStatus = 'Accepted';
          } else if (u.inspectionStatus === 'Passed') {
            handoverStatus = 'Inspection Scheduled';
          }
          db.customers[cIdx].handoverStatus = handoverStatus;
        }
      }

      saveDb(db);
      return db.units[idx];
    }
    throw new Error('Unit not found');
  },

  createCustomer: (customer: Omit<Customer, 'id' | 'handoverStatus'>): Customer => {
    const db = getDb();
    const newCustomer: Customer = {
      ...customer,
      id: `CST-${String(db.customers.length + 1).padStart(3, '0')}`,
      handoverStatus: 'Awaiting Review'
    };
    db.customers.push(newCustomer);
    saveDb(db);

    if (customer.unitId) {
      mockDb.updateUnit(customer.unitId, { customerId: newCustomer.id });
    }

    return newCustomer;
  },

  createDefect: (defect: Omit<Defect, 'id' | 'status' | 'timeline'>): Defect => {
    const db = getDb();
    const newDefect: Defect = {
      ...defect,
      id: `DFT-${String(db.defects.length + 1).padStart(3, '0')}`,
      status: 'Open',
      timeline: [
        { status: 'Open', date: new Date().toISOString().split('T')[0], note: 'Defect registered' }
      ]
    };
    db.defects.push(newDefect);
    saveDb(db);

    mockDb.updateUnit(defect.unitId, { 
      status: 'Defects Found', 
      inspectionStatus: 'Failed',
      defectsCleared: false 
    });

    return newDefect;
  },

  updateDefect: (id: string, status: Defect['status'], note: string, resolutionEvidence?: string, contractorId?: string): Defect => {
    const db = getDb();
    const idx = db.defects.findIndex(d => d.id === id);
    if (idx !== -1) {
      const d = db.defects[idx];
      d.status = status;
      if (resolutionEvidence) d.resolutionEvidence = resolutionEvidence;
      if (contractorId) d.contractorId = contractorId;
      d.timeline.push({
        status,
        date: new Date().toISOString().split('T')[0],
        note
      });
      saveDb(db);

      const unitId = d.unitId;
      const unitDefects = db.defects.filter(def => def.unitId === unitId);
      const openDefects = unitDefects.filter(def => def.status !== 'Closed');
      
      if (openDefects.length === 0) {
        mockDb.updateUnit(unitId, { 
          status: 'Resolved', 
          inspectionStatus: 'Passed',
          defectsCleared: true 
        });
      } else if (status === 'Resolved') {
        mockDb.updateUnit(unitId, { status: 'Resolved' });
      }

      return d;
    }
    throw new Error('Defect not found');
  },

  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'conversation'>): SupportTicket => {
    const db = getDb();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TK-${db.supportTickets.length + 1001}`,
      status: 'Open',
      lastUpdate: new Date().toISOString().split('T')[0],
      conversation: []
    };
    db.supportTickets.push(newTicket);
    saveDb(db);
    return newTicket;
  },

  addSupportMessage: (id: string, sender: 'builder' | 'admin', message: string): SupportTicket => {
    const db = getDb();
    const idx = db.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.supportTickets[idx].conversation.push({
        sender,
        message,
        date: new Date().toISOString()
      });
      db.supportTickets[idx].lastUpdate = new Date().toISOString().split('T')[0];
      saveDb(db);
      return db.supportTickets[idx];
    }
    throw new Error('Ticket not found');
  },

  updateSupportStatus: (id: string, status: SupportTicket['status']): SupportTicket => {
    const db = getDb();
    const idx = db.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.supportTickets[idx].status = status;
      db.supportTickets[idx].lastUpdate = new Date().toISOString().split('T')[0];
      saveDb(db);
      return db.supportTickets[idx];
    }
    throw new Error('Ticket not found');
  },

  createServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'contractorId' | 'date'>): ServiceRequest => {
    const db = getDb();
    const newReq: ServiceRequest = {
      ...req,
      id: `SR-${String(db.serviceRequests.length + 1).padStart(3, '0')}`,
      status: 'Request',
      contractorId: null,
      date: new Date().toISOString().split('T')[0]
    };
    db.serviceRequests.push(newReq);
    saveDb(db);
    return newReq;
  },

  updateServiceRequest: (id: string, status: ServiceRequest['status'], contractorId: string | null = null): ServiceRequest => {
    const db = getDb();
    const idx = db.serviceRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.serviceRequests[idx].status = status;
      if (contractorId) db.serviceRequests[idx].contractorId = contractorId;
      saveDb(db);
      return db.serviceRequests[idx];
    }
    throw new Error('Request not found');
  },

  updateTransitionStep: (builderId: string, step: AssociationTransition['step']): AssociationTransition => {
    const db = getDb();
    const idx = db.transition.findIndex(t => t.builderId === builderId);
    if (idx !== -1) {
      db.transition[idx].step = step;
      saveDb(db);
      return db.transition[idx];
    } else {
      const newT: AssociationTransition = {
        builderId,
        step,
        commonAreas: 'Pending',
        assets: 'Pending',
        contracts: 'Pending',
        financials: 'Pending',
        legals: 'Pending',
        commitments: 'Pending'
      };
      db.transition.push(newT);
      saveDb(db);
      return newT;
    }
  },

  updateTransitionItem: (builderId: string, field: keyof Omit<AssociationTransition, 'builderId' | 'step'>, status: 'Pending' | 'In Progress' | 'Completed'): AssociationTransition => {
    const db = getDb();
    const idx = db.transition.findIndex(t => t.builderId === builderId);
    if (idx !== -1) {
      db.transition[idx][field] = status as any;
      saveDb(db);
      return db.transition[idx];
    }
    throw new Error('Transition not found');
  },

  getDocuments: (): Document[] => getDb().documents,

  createDocument: (doc: Omit<Document, 'id'>): Document => {
    const db = getDb();
    const newDoc: Document = {
      ...doc,
      id: `DOC-${String(db.documents.length + 1).padStart(3, '0')}`
    };
    db.documents.push(newDoc);
    saveDb(db);
    return newDoc;
  },

  updateDocumentStatus: (id: string, status: Document['status'], rejectionReason?: string): Document => {
    const db = getDb();
    const idx = db.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      db.documents[idx].status = status;
      if (rejectionReason) db.documents[idx].rejectionReason = rejectionReason;
      saveDb(db);

      // Keep the unit's docsCleared/approvalsCleared flags in sync with real document state,
      // mirroring how updatePaymentStatus auto-syncs paymentCleared below.
      const unitId = db.documents[idx].unitId;
      if (unitId) {
        const unitDocs = db.documents.filter(d => d.unitId === unitId);
        const ownershipDocs = unitDocs.filter(d => d.category === 'Ownership & Identity Documents');
        const municipalDocs = unitDocs.filter(d => d.category === 'Municipal Certificate of Occupancy');
        const docsCleared = ownershipDocs.length > 0 && ownershipDocs.every(d => d.status === 'Verified');
        const approvalsCleared = municipalDocs.length > 0 && municipalDocs.every(d => d.status === 'Verified');
        mockDb.updateUnit(unitId, { docsCleared, approvalsCleared });
      }

      return db.documents[idx];
    }
    throw new Error('Document not found');
  },

  deleteDocument: (id: string): void => {
    const db = getDb();
    db.documents = db.documents.filter(d => d.id !== id);
    saveDb(db);
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => getDb().auditLogs,
  createAuditLog: (log: Omit<AuditLog, 'id' | 'date'>): AuditLog => {
    const db = getDb();
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${String(db.auditLogs.length + 1).padStart(5, '0')}`,
      date: new Date().toISOString()
    };
    db.auditLogs.push(newLog);
    saveDb(db);
    return newLog;
  },

  // Notifications
  getNotifications: (userId?: string): Notification[] => {
    const list = getDb().notifications;
    return userId ? list.filter(n => n.userId === userId) : list;
  },
  createNotification: (notif: Omit<Notification, 'id' | 'date' | 'isRead'>): Notification => {
    const db = getDb();
    const newNotif: Notification = {
      ...notif,
      id: `NOT-${String(db.notifications.length + 1).padStart(5, '0')}`,
      isRead: false,
      date: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    saveDb(db);
    return newNotif;
  },
  markNotificationRead: (id: string): void => {
    const db = getDb();
    const idx = db.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      db.notifications[idx].isRead = true;
      saveDb(db);
    }
  },

  // Payments
  getPayments: (unitId?: string): Payment[] => {
    const list = getDb().payments;
    return unitId ? list.filter(p => p.unitId === unitId) : list;
  },
  createPayment: (payment: Omit<Payment, 'id'>): Payment => {
    const db = getDb();
    const newPayment: Payment = {
      ...payment,
      id: `PAY-${String(db.payments.length + 1).padStart(3, '0')}`
    };
    db.payments.push(newPayment);
    saveDb(db);
    return newPayment;
  },
  updatePaymentStatus: (id: string, status: Payment['status'], verifiedBy?: string): Payment => {
    const db = getDb();
    const idx = db.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.payments[idx].status = status;
      db.payments[idx].updatedAt = new Date().toISOString();
      
      if (status === 'Verified' || status === 'Cleared') {
        db.payments[idx].verifiedBy = verifiedBy;
        db.payments[idx].verifiedAt = new Date().toISOString();
      }
      
      if (status === 'Cleared') {
        db.payments[idx].clearedDate = new Date().toISOString().split('T')[0];
      }
      saveDb(db);
      
      // Auto-update unit payment status if all payments for that unit are cleared
      const unitId = db.payments[idx].unitId;
      const unitPayments = db.payments.filter(p => p.unitId === unitId);
      const allCleared = unitPayments.length > 0 && unitPayments.every(p => p.status === 'Cleared');
      
      mockDb.updateUnit(unitId, { paymentCleared: allCleared });
      
      return db.payments[idx];
    }
    throw new Error('Payment not found');
  }
};

