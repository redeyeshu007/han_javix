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
  status: 'Active' | 'Inactive';
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
  assignedProjects: string[]; // List of project IDs
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
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Reinspection' | 'Closed';
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
  status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
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

export interface Payment {
  id: string;
  unitId: string;
  customerId: string;
  title: string;
  amount: number;
  status: 'Pending' | 'Partially Cleared' | 'Cleared' | 'On Hold';
  dueDate: string;
  clearedDate?: string;
}


// Initial seed data - User Requested Controlled Test Data
const initialUsers: User[] = [
  { id: 'USR-000', name: 'Super Admin', email: 'admin@handoverly.com', phone: '', role: 'super_admin', password: 'Admin@123', status: 'Active' },
];

const initialBuilders: Builder[] = [
  { id: 'TEST-BLD-001', name: 'Handoverly Test Builders', contact: 'Test Builder Admin', email: 'admin@testbuilders.com', phone: '+1 (555) 000-0001', address: '1 Test Avenue', brn: 'BRN-TEST-1', plan: 'Enterprise', status: 'Active', joined: '2026-01-01' }
];

const initialProjects: Project[] = [
  { id: 'TEST-PRJ-001', builderId: 'TEST-BLD-001', name: 'Handoverly Heights', status: 'Active', progress: 50, blocksCount: 1, unitsCount: 20 }
];

const initialBlocks: Block[] = [
  { id: 'TEST-BLK-001', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', name: 'Tower 1' }
];

const initialFloors: Floor[] = [
  { id: 'TEST-FLR-G', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', name: 'Ground Floor' },
  { id: 'TEST-FLR-1', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', name: 'Floor 1' },
  { id: 'TEST-FLR-2', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', name: 'Floor 2' },
  { id: 'TEST-FLR-3', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', name: 'Floor 3' },
  { id: 'TEST-FLR-4', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', name: 'Floor 4' }
];

const initialUnits: Unit[] = [
  // Ground Floor
  { id: 'TEST-UNIT-G01', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-G', name: 'G-01', status: 'Defects Found', customerId: 'TEST-CST-001', inspectionStatus: 'Failed', docsCleared: true, paymentCleared: true, defectsCleared: false, keysHandedOver: true, approvalsCleared: true },
  { id: 'TEST-UNIT-G02', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-G', name: 'G-02', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-G03', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-G', name: 'G-03', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-G04', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-G', name: 'G-04', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  // Floor 1
  { id: 'TEST-UNIT-101', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-1', name: '101', status: 'Approved', customerId: 'TEST-CST-002', inspectionStatus: 'Passed', docsCleared: true, paymentCleared: true, defectsCleared: true, keysHandedOver: true, approvalsCleared: true },
  { id: 'TEST-UNIT-102', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-1', name: '102', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-103', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-1', name: '103', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-104', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-1', name: '104', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  // Floor 2
  { id: 'TEST-UNIT-201', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-2', name: '201', status: 'Approved', customerId: 'TEST-CST-003', inspectionStatus: 'Passed', docsCleared: false, paymentCleared: true, defectsCleared: true, keysHandedOver: true, approvalsCleared: true },
  { id: 'TEST-UNIT-202', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-2', name: '202', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-203', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-2', name: '203', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-204', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-2', name: '204', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  // Floor 3
  { id: 'TEST-UNIT-301', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-3', name: '301', status: 'Ready for Inspection', customerId: 'TEST-CST-004', inspectionStatus: 'Pending', docsCleared: true, paymentCleared: true, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-302', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-3', name: '302', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-303', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-3', name: '303', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-304', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-3', name: '304', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  // Floor 4
  { id: 'TEST-UNIT-401', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-4', name: '401', status: 'Defects Found', customerId: 'TEST-CST-005', inspectionStatus: 'Failed', docsCleared: true, paymentCleared: true, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-402', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-4', name: '402', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-403', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-4', name: '403', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
  { id: 'TEST-UNIT-404', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', blockId: 'TEST-BLK-001', floorId: 'TEST-FLR-4', name: '404', status: 'Under Construction', customerId: null, inspectionStatus: 'Pending', docsCleared: false, paymentCleared: false, defectsCleared: false, keysHandedOver: false, approvalsCleared: false },
];

const initialCustomers: Customer[] = [
  { id: 'TEST-CST-001', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', unitId: 'TEST-UNIT-G01', name: 'Arun Kumar', email: 'arun@example.com', phone: '+91 9876543210', status: 'Active', handoverStatus: 'Inspection Scheduled' },
  { id: 'TEST-CST-002', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', unitId: 'TEST-UNIT-101', name: 'Priya Kumar', email: 'priya@example.com', phone: '+91 9876543211', status: 'Active', handoverStatus: 'Inspection Scheduled' },
  { id: 'TEST-CST-003', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', unitId: 'TEST-UNIT-201', name: 'David Raj', email: 'david@example.com', phone: '+91 9876543212', status: 'Active', handoverStatus: 'Awaiting Review' },
  { id: 'TEST-CST-004', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', unitId: 'TEST-UNIT-301', name: 'Sarah Joseph', email: 'sarah@example.com', phone: '+91 9876543213', status: 'Active', handoverStatus: 'Awaiting Review' },
  { id: 'TEST-CST-005', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001', unitId: 'TEST-UNIT-401', name: 'Michael John', email: 'michael@example.com', phone: '+91 9876543214', status: 'Active', handoverStatus: 'Awaiting Review' },
];

const initialDefects: Defect[] = [
  {
    id: 'DEF-TEST-001', unitId: 'TEST-UNIT-G01', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001',
    title: 'Socket not functioning', description: 'Electrical socket in living room has no power.',
    location: 'Living Room', severity: 'Medium', contractorId: 'CON-001', status: 'Open', evidence: [],
    timeline: [{ status: 'Open', date: '2026-08-27', note: 'Created by Test Site Engineer' }]
  },
  {
    id: 'DEF-TEST-002', unitId: 'TEST-UNIT-101', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001',
    title: 'Water leakage below wash basin', description: 'Minor leak from p-trap.',
    location: 'Master Bath', severity: 'High', contractorId: 'CON-001', status: 'Assigned', evidence: [],
    timeline: [{ status: 'Open', date: '2026-08-27', note: 'Created' }, { status: 'Assigned', date: '2026-08-27', note: 'Assigned to CON-001' }]
  },
  {
    id: 'DEF-TEST-003', unitId: 'TEST-UNIT-201', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001',
    title: 'Wall surface crack', description: 'Hairline crack near window.',
    location: 'Bedroom 1', severity: 'Low', contractorId: 'CON-001', status: 'In Progress', evidence: [],
    timeline: [{ status: 'Open', date: '2026-08-27', note: 'Created' }, { status: 'In Progress', date: '2026-08-27', note: 'Work started' }]
  },
  {
    id: 'DEF-TEST-004', unitId: 'TEST-UNIT-301', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001',
    title: 'Balcony door alignment issue', description: 'Door scraping against frame.',
    location: 'Balcony', severity: 'Medium', contractorId: 'CON-001', status: 'Resolved', evidence: [],
    timeline: [{ status: 'Open', date: '2026-08-27', note: 'Created' }, { status: 'Resolved', date: '2026-08-27', note: 'Realigned hinges' }]
  },
  {
    id: 'DEF-TEST-005', unitId: 'TEST-UNIT-401', builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001',
    title: 'Tile finishing incomplete', description: 'Grout missing in some areas.',
    location: 'Kitchen', severity: 'Low', contractorId: 'CON-001', status: 'Reinspection', evidence: [],
    timeline: [{ status: 'Open', date: '2026-08-27', note: 'Created' }, { status: 'Reinspection', date: '2026-08-27', note: 'Ready for check' }]
  },
];

const initialContractors: Contractor[] = [
  { 
    id: 'CON-001', 
    builderId: 'TEST-BLD-001', 
    companyName: 'Test Contractor', 
    contactPersonFirstName: 'Test',
    contactPersonLastName: 'Contractor',
    email: 'testcontractor@example.com', 
    phone: '+1 (555) 111-2222',
    trade: 'General',
    status: 'Active',
    assignedProjects: ['TEST-PRJ-001']
  }
];

const initialSupportTickets: SupportTicket[] = [];

const initialChecklists = [
  { id: 'CHK-001', name: 'Standard Handover Checklist', category: 'General', items: ['Electrical Socket condition', 'Plumbing Water pressure', 'Civil Wall condition', 'Doors alignment'], status: 'Active', updated: '2026-08-27' }
];

const initialServiceRequests: ServiceRequest[] = [];

const initialDocuments: Document[] = [
  {
    id: 'DOC-001',
    builderId: 'TEST-BLD-001',
    projectId: 'TEST-PRJ-001',
    unitId: 'TEST-UNIT-G01',
    customerId: 'TEST-CST-001',
    category: 'Legal',
    documentType: 'Sale Agreement',
    name: 'Sale Agreement',
    fileName: 'Sale_Agreement_G01.pdf',
    fileType: 'application/pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Builder Admin',
    uploadedAt: '2026-08-20',
    status: 'Verified',
  },
  {
    id: 'DOC-002',
    builderId: 'TEST-BLD-001',
    projectId: 'TEST-PRJ-001',
    unitId: 'TEST-UNIT-G01',
    customerId: 'TEST-CST-001',
    category: 'Financial',
    documentType: 'Payment Receipt',
    name: 'Payment Receipt (Installment 1)',
    fileName: 'Payment_Receipt_1.pdf',
    fileType: 'application/pdf',
    fileSize: '1.1 MB',
    uploadedBy: 'Accounts',
    uploadedAt: '2026-08-25',
    status: 'Verified',
  }
];

const initialTransition: AssociationTransition[] = [
  { builderId: 'TEST-BLD-001', step: 'Preparation', commonAreas: 'Pending', assets: 'Pending', contracts: 'Pending', financials: 'Pending', legals: 'Pending', commitments: 'Pending' }
];

// Helper to initialize database if empty
// USING PREFIX handoverly_db TO ENSURE A CLEAN STATE FOR TESTING
const DB_KEY = 'handoverly_db';

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
  checklists: any[];
  serviceRequests: ServiceRequest[];
  documents: Document[];
  transition: AssociationTransition[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  payments: Payment[];
  inspections: Inspection[];
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
      payments: [
        {
          id: 'PAY-001',
          unitId: 'TEST-UNIT-G01',
          customerId: 'TEST-CST-001',
          title: 'Booking Advance',
          amount: 50000,
          status: 'Cleared',
          dueDate: '2026-08-01',
          clearedDate: '2026-08-02'
        },
        {
          id: 'PAY-002',
          unitId: 'TEST-UNIT-G01',
          customerId: 'TEST-CST-001',
          title: 'Installment 1',
          amount: 150000,
          status: 'Pending',
          dueDate: '2026-09-01'
        }
      ],
      inspections: []
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  }
  return JSON.parse(localStorage.getItem(DB_KEY)!);
};

const getDb = (): Database => {
  const dbStr = localStorage.getItem(DB_KEY);
  if (!dbStr) return initMockDb();
  return JSON.parse(dbStr);
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
  getChecklists: (): any[] => getDb().checklists,
  getServiceRequests: (): ServiceRequest[] => getDb().serviceRequests,
  getTransitions: (): AssociationTransition[] => getDb().transition,

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

  createUnit: (unit: Omit<Unit, 'id' | 'status' | 'customerId' | 'inspectionStatus' | 'docsCleared' | 'paymentCleared' | 'defectsCleared' | 'keysHandedOver' | 'approvalsCleared'>): Unit => {
    const db = getDb();
    const newUnit: Unit = {
      ...unit,
      id: `UNIT-${String(db.units.length + 1).padStart(3, '0')}`,
      status: 'Under Construction',
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

  updateDefect: (id: string, status: Defect['status'], note: string, resolutionEvidence?: string): Defect => {
    const db = getDb();
    const idx = db.defects.findIndex(d => d.id === id);
    if (idx !== -1) {
      const d = db.defects[idx];
      d.status = status;
      if (resolutionEvidence) d.resolutionEvidence = resolutionEvidence;
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
  updatePaymentStatus: (id: string, status: Payment['status']): Payment => {
    const db = getDb();
    const idx = db.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.payments[idx].status = status;
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

