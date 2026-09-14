// Handoverly AI Centralized Mock Database
// Persists in localStorage for a fully interactive frontend prototype

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'BUILDER_OWNER' | 'PROJECT_ADMIN' | 'SITE_ENGINEER' | 'ACCOUNTS' | 'CONTRACTOR' | 'CUSTOMER' | 'ASSOCIATION_REPRESENTATIVE';
  password: string;
  builderId?: string;
  builder_company_name?: string;
  projectId?: string;         // CUSTOMER portal: unit's project id
  unitId?: string;            // CUSTOMER portal: allocated unit id
  unitNumber?: string;
  projectName?: string;       // CUSTOMER portal: project name
  assignedProjectId?: string;   // PROJECT_ADMIN: the single assigned project id
  assignedProjectName?: string; // PROJECT_ADMIN: the single assigned project name
  assignedProjectIds?: string[]; // site_engineer / accounts scoping
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
  plan: string;
  subscription_plan_id?: string;
  project_count?: number;
  status: 'Pending' | 'Active' | 'Suspended';
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
  /** Writable backend FK field name (DRF UnitSerializer accepts `floor`, not `floorId`). */
  floor?: string;
  /** Writable backend model field names (UnitSerializer, fields='__all__'). */
  unit_number?: string;
  unit_type?: string;
  area_sqft?: number;
  area?: string;
  project_name?: string;
  block_name?: string;
  floor_name?: string;
  price?: number;
  sale_value?: number;
  name: string;
  /** projects.Unit.UNIT_STATUS_CHOICES slug (e.g. 'not_started', 'handed_over'). */
  status: string;
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

  /** Workspace-only display names (from unit.block.name / unit.floor.name). */
  blockName?: string;
  floorName?: string;
}

export interface UnitWorkspace {
  unit: Unit;
  project: { id: string; name: string } | null;
  customer: { id: string; name: string; email: string; phone: string } | null;
  counts: {
    open_defects: number; critical_defects: number; documents: number;
    inspections: number; pending_payments: number;
  };
  lists: {
    inspections: any[];
    defects: any[];
    documents: any[];
    payments: any[];
  };
}

export interface Inspection {
  id: string;
  builderId: string;
  projectId: string;
  unitId: string;
  inspectorId: string;
  /** inspections.UnitInspection.STATUS_CHOICES slug ('not_started' | 'in_progress' | 'completed'). */
  status: string;
  date: string;
  checklistId?: string;
  notes?: string;
  results?: any[];
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
  /** Units allocated via Unit.customer — served by TeamMemberSerializer. */
  allocated_units?: { id: number | string; unit_number: string; project_name: string; floor_name: string; block_name: string }[];
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
  /** Display label derived from the backend priority slug. */
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  contractorId: string;
  /** inspections.Defect.STATUS_CHOICES slug (e.g. 'open', 'resolved'). */
  status: string;
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
  /** documents.Document.STATUS_CHOICES slug (e.g. 'APPROVED', 'REJECTED'). */
  status: string;
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
  /** handovers.PaymentClearance.STATUS_CHOICES slug (e.g. 'PENDING_PAYMENT', 'CLEARED'). */
  status: string;
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

