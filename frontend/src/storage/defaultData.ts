import { 
  User, Builder, Project, Block, Floor, Unit, Customer, 
  Defect, Contractor, SupportTicket, ServiceRequest, Document, AssociationTransition,
  Database
} from '../types/models';


// Initial seed data - User Requested Controlled Test Data
const initialUsers: User[] = [];

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

export const initialDb: Database = {
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
