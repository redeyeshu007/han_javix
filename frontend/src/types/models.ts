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

