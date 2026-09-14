import { Builder, Project, Block, Floor, Unit, Customer, Defect, ServiceRequest, SupportTicket, AssociationTransition, AuditLog, Notification, Payment, Inspection, User, ChecklistTemplate, Plan, CommTemplate } from '../types/models';
import { apiClient } from './client';
import {
  normalizeUnit, normalizeDocument, normalizePayment, normalizeDefect,
  normalizeCharge, normalizePaymentRecord,
  normalizeServiceRequest, normalizeInspection, normalizeHandoverRecord,
  normalizeList, buildDefectDescription, buildPaymentRemarks, dataUrlToFile,
} from './normalize';
import { sharedPromise, invalidateShared } from './sharedFetch';
import { toBackendStatus } from '../utils/statusMap';

/** Apply a row mapper to a list/page response at the service boundary. */
const mapped = <T>(data: any, mapRow: (row: any) => T): T[] => normalizeList(data, mapRow);

/**
 * Aggregate payload of GET /projects/units/{id}/workspace/ — the ONE request
 * that replaces the old unit-page waterfall. Every list is normalized through
 * the same Phase-1 mappers the filtered endpoints use, so consumers see
 * identical shapes.
 */
export interface UnitWorkspace {
  unit: Unit;
  project: { id: string; name: string } | null;
  customer: { id: string; name: string; email: string; phone: string } | null;
  counts: {
    open_defects: number; critical_defects: number; documents: number;
    payments: number; service_requests: number;
  } | null;
  latestInspection: Inspection | null;
  defects: Defect[];
  documents: any[];
  payments: any[];
  serviceRequests: ServiceRequest[];
  handoverRecord: any | null;
  readiness: any | null;
}

const WORKSPACE_KEY = (id: string | number) => `unit-workspace:${id}`;

/**
 * Response of POST /projects/units/{id}/assign-customer|unassign-customer/ —
 * the updated UnitSerializer row plus the customer block the endpoint acted
 * on. `unit` goes through the same normalizeUnit pipeline as every other unit
 * payload so consumers see one shape.
 */
export interface CustomerAllocationResponse {
  unit: Unit;
  customer: { id: string; name: string; email: string; phone: string } | null;
  accountCreated: boolean;
  releasedCustomerId: string | null;
}

/**
 * GET /accounts/team/ shared across all consumers of a unit open (contractor
 * dropdown for defects, customer modals, …). At most one request per TTL
 * window instead of one per consumer.
 */
export const fetchTeamShared = (): Promise<any[]> => sharedPromise('accounts:team', async () => {
  const response = await apiClient.get('/accounts/team/');
  return response.data.results || response.data;
});

export const usersApi = {
  getUsers: async () => (await apiClient.get('/accounts/team/')).data,
  createUser: async (data: any) => (await apiClient.post('/accounts/team/', data)).data,
  updateUser: async (id: string, data: Partial<User>) => {
    const response = await apiClient.patch('/accounts/me/', data);
    return response.data;
  },
};

export const teamApi = {
  list: async () => {
    const response = await apiClient.get('/accounts/team/');
    return response.data.results || response.data;
  },
  create: async (data: {
    name: string; email: string; phone: string; role: string; password: string;
    is_active: boolean; assigned_project_ids: string[]; trade?: string;
  }) => {
    const response = await apiClient.post('/accounts/team/', data);
    return response.data;
  },
  update: async (id: string, data: {
    name?: string; email?: string; phone?: string; role?: string; password?: string;
    is_active?: boolean; assigned_project_ids?: string[]; trade?: string;
  }) => {
    const response = await apiClient.patch(`/accounts/team/${id}/`, data);
    return response.data;
  },
  getTrades: async () => {
    const response = await apiClient.get('/accounts/team/trades/');
    return response.data as string[];
  },
};

// Normalizes the backend BuilderCompany response to the frontend Builder type.
// Backend uses snake_case model field names; frontend Builder type uses shorthand names.
export const mapBuilderFromBackend = (b: any): Builder => ({
  id: String(b.id),
  name: b.company_name || b.name || '',
  contact: b.contact_name || b.contact || '',
  email: b.email || '',
  phone: b.contact_number || b.phone || '',
  address: b.registered_address || b.address || '',
  brn: b.registration_number || b.brn || '',
  plan: b.subscription_plan_details?.name || b.plan || '',
  subscription_plan_id: String(b.subscription_plan || b.subscription_plan_id || ''),
  project_count: b.project_count ?? 0,
  // Backend status values: ACTIVE, PENDING_REVIEW, SUSPENDED, REJECTED
  // Frontend expects: Active, Pending, Suspended
  status: (() => {
    const s = (b.status || '').toUpperCase();
    if (s === 'ACTIVE') return 'Active';
    if (s === 'SUSPENDED') return 'Suspended';
    if (s === 'PENDING_REVIEW' || s === 'PENDING') return 'Pending';
    if (s === 'REJECTED') return 'Suspended'; // map rejected to suspended badge
    return b.status || 'Pending';
  })(),
  joined: b.joined_at || b.created_at || b.joined || '',
});

export const buildersApi = {
  getBuilders: async (params?: { search?: string; status?: string }): Promise<Builder[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const url = '/builders/companies/' + (query.toString() ? `?${query.toString()}` : '');
    const response = await apiClient.get(url);
    const raw: any[] = response.data.results || response.data;
    return raw.map(mapBuilderFromBackend);
  },
  createBuilder: async (data: any): Promise<Builder> => {
    const response = await apiClient.post('/builders/companies/', data);
    return mapBuilderFromBackend(response.data);
  },
  getBuilder: async (id: string): Promise<Builder> => {
    const response = await apiClient.get(`/builders/companies/${id}/`);
    return mapBuilderFromBackend(response.data);
  },
  updateBuilder: async (id: string, data: any) => {
    // Map any frontend field names back to backend names if needed
    const backendData: any = { ...data };
    if (data.name !== undefined) { backendData.company_name = data.name; delete backendData.name; }
    if (data.contact !== undefined) { backendData.contact_name = data.contact; delete backendData.contact; }
    if (data.phone !== undefined) { backendData.contact_number = data.phone; delete backendData.phone; }
    if (data.address !== undefined) { backendData.registered_address = data.address; delete backendData.address; }
    if (data.brn !== undefined) { backendData.registration_number = data.brn; delete backendData.brn; }
    if (data.status !== undefined) {
      // Map frontend status → backend status
      const sMap: Record<string, string> = { Active: 'ACTIVE', Pending: 'PENDING_REVIEW', Suspended: 'SUSPENDED' };
      backendData.status = sMap[data.status] || data.status;
    }
    const response = await apiClient.patch(`/builders/companies/${id}/`, backendData);
    return mapBuilderFromBackend(response.data);
  },
  approveBuilder: async (id: string) => {
    const response = await apiClient.post(`/builders/companies/${id}/approve/`);
    return response.data;
  },
  suspendBuilder: async (id: string) => {
    const response = await apiClient.post(`/builders/companies/${id}/suspend/`);
    return response.data;
  },
  activateBuilder: async (id: string) => {
    const response = await apiClient.post(`/builders/companies/${id}/activate/`);
    return response.data;
  },
  rejectBuilder: async (id: string) => {
    const response = await apiClient.post(`/builders/companies/${id}/reject/`);
    return response.data;
  },
  /**
   * Single-request aggregate for the Builder Details page.
   * Returns builder, subscription, billing, real usage counts, plan limits,
   * and the project list with per-project unit counts.
   * Replaces the old 4-call waterfall.
   */
  getBuilderDetails: async (id: string) => {
    const response = await apiClient.get(`/builders/companies/${id}/details/`);
    const data = response.data;
    if (data.builder) {
      data.builder = mapBuilderFromBackend(data.builder);
    }
    return data;
  },
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
    return mapped(response.data, normalizeUnit);
  },
  getProjectUnitsLite: async () => {
    const response = await apiClient.get('/projects/units/');
    const raw = response.data.results || response.data;
    return raw.map((u: any) => ({
      id: String(u.id),
      name: u.unit_number || `Unit ${u.id}`,
      customer: u.customer ? { name: u.customer.name || 'No Customer' } : undefined
    }));
  },
  getUnit: async (id: string | number) => {
    const response = await apiClient.get(`/projects/units/${id}/`);
    return normalizeUnit(response.data);
  },
  /**
   * Aggregate workspace for the unit page: unit + project + customer + counts
   * + all domain slices + server-computed readiness in ONE request. Shared
   * with the access guard (and StrictMode's double-invoke) via a short-TTL
   * in-memory promise; pass refresh=true after a mutation to bypass the cache.
   */
  getWorkspace: async (id: string | number, refresh = false): Promise<UnitWorkspace> => {
    const key = WORKSPACE_KEY(id);
    if (refresh) invalidateShared(key);
    return sharedPromise(key, async () => {
      const response = await apiClient.get(`/projects/units/${id}/workspace/`);
      const d = response.data || {};
      // Re-attach the flat FK ids so normalizeUnit() produces exactly the
      // shape a plain GET /projects/units/{id}/ produces (the page's unit
      // consumers are unchanged), plus the workspace-only block/floor names.
      const rawUnit: any = { ...(d.unit || {}) };
      rawUnit.floor = d.unit?.floor?.id;
      rawUnit.block_id = d.unit?.block?.id;
      rawUnit.project_id = d.unit?.project?.id;
      rawUnit.customer = d.unit?.customer?.id ?? null;
      const unit = normalizeUnit(rawUnit);
      unit.blockName = d.unit?.block?.name;
      unit.floorName = d.unit?.floor?.name;
      return {
        unit: unit as Unit,
        project: d.unit?.project ? { id: String(d.unit.project.id), name: d.unit.project.name } : null,
        customer: d.unit?.customer ? {
          id: String(d.unit.customer.id),
          name: d.unit.customer.name || d.unit.customer.email || '',
          email: d.unit.customer.email || '',
          phone: d.unit.customer.phone || '',
        } : null,
        counts: d.counts ?? null,
        latestInspection: d.latest_inspection ? normalizeInspection(d.latest_inspection) : null,
        // Full inspection history (includes results per inspection)
        inspections: (d.inspections || []).map((insp: any) => ({
          ...normalizeInspection(insp),
          results: (insp.results || []).map((r: any) => ({
            id: r.id,
            result: r.result,
            remarks: r.remarks || '',
            snapshot_item_text: r.snapshot_item_text || r.checklist_item_text || '',
            snapshot_category: r.snapshot_category || r.checklist_item_category || '',
            checklist_item_text: r.checklist_item_text || r.snapshot_item_text || '',
            checklist_item_category: r.checklist_item_category || r.snapshot_category || '',
          })),
        })),
        defects: normalizeList(d.defects || [], normalizeDefect),
        documents: normalizeList(d.documents || [], normalizeDocument),
        payments: normalizeList(d.payments || [], normalizePayment),
        serviceRequests: normalizeList(d.service_requests || [], normalizeServiceRequest),
        handoverRecord: d.handover_record ? normalizeHandoverRecord(d.handover_record) : null,
        readiness: d.readiness ?? null,
      };
    });
  },
  createUnit: async (data: any) => {
    const response = await apiClient.post('/projects/units/', data);
    return response.data;
  },
  updateUnit: async (id: string, data: Partial<Unit>) => {
    const response = await apiClient.patch(`/projects/units/${id}/`, data);
    return response.data;
  },
  /**
   * Atomic customer allocation on the backend: LINKS an existing same-company
   * CUSTOMER account when the email matches, otherwise CREATES one, then sets
   * Unit.customer — one transaction, real validation errors surfaced verbatim.
   * Password is optional: the endpoint decides create-vs-link (create requires
   * it, link does not).
   */
  assignCustomer: async (
    unitId: string | number,
    payload: {
      name?: string; email: string; phone?: string; password?: string;
      customer_id?: string | number; is_active?: boolean;
    }
  ): Promise<CustomerAllocationResponse> => {
    const response = await apiClient.post(`/projects/units/${unitId}/assign-customer/`, payload);
    const d = response.data || {};
    return {
      unit: normalizeUnit(d.unit ?? d),
      customer: d.customer ? {
        id: String(d.customer.id),
        name: d.customer.name || d.customer.email || '',
        email: d.customer.email || '',
        phone: d.customer.phone || '',
      } : null,
      accountCreated: Boolean(d.account_created),
      releasedCustomerId: null,
    };
  },
  /** Releases Unit.customer; the customer account itself is kept. */
  unassignCustomer: async (unitId: string | number): Promise<CustomerAllocationResponse> => {
    const response = await apiClient.post(`/projects/units/${unitId}/unassign-customer/`);
    const d = response.data || {};
    return {
      unit: normalizeUnit(d.unit ?? d),
      customer: null,
      accountCreated: false,
      releasedCustomerId: d.released_customer_id != null ? String(d.released_customer_id) : null,
    };
  },
};

export const inspectionsApi = {
  getInspections: async () => {
    const response = await apiClient.get('/inspections/inspections/');
    console.log("SITE ENGINEER INSPECTIONS API:", response);
    console.log("RAW INSPECTION DATA:", response.data);
    const normalizedData = mapped(response.data, normalizeInspection);
    console.log("NORMALIZED INSPECTIONS:", normalizedData);
    return normalizedData;
  },
  createInspection: async (data: any) => {
    // UnitInspection writable fields: unit, inspection_type, status,
    // scheduled_date. inspected_by is set server-side from request.user.
    // Notes are not a backend field and pass/fail is expressed through defect
    // rows, so neither is sent.
    const payload: any = {
      unit: data.unit || data.unitId,
      inspection_type: toBackendStatus('inspectionType', data.inspection_type || data.inspectionType || 'Internal'),
      status: toBackendStatus('inspection', data.status || 'Scheduled'),
    };
    if (data.scheduled_date || data.scheduledDate) payload.scheduled_date = data.scheduled_date || data.scheduledDate;
    if (data.results_input) payload.results_input = data.results_input;
    const response = await apiClient.post('/inspections/inspections/', payload);
    return normalizeInspection(response.data);
  },
  updateInspection: async (id: string, data: any) => {
    const payload: any = {};
    if (data.status) payload.status = toBackendStatus('inspection', data.status);
    if (data.results_input) payload.results_input = data.results_input;
    const response = await apiClient.patch(`/inspections/inspections/${id}/`, payload);
    return normalizeInspection(response.data);
  },
  createInspectionResult: async (data: any) => {
    const response = await apiClient.post('/inspections/inspection-results/', data);
    return response.data;
  },
};

export const customersApi = {
  getCustomers: async (builderId?: string) => {
    const response = await apiClient.get('/accounts/team/');
    const team = response.data.results || response.data;
    return team
      .filter((user: any) => user.role === 'CUSTOMER')
      .map((user: any) => ({ ...user, name: user.name || user.full_name || '' }));
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
    try {
      const response = await apiClient.get('/platform-admin/dashboard/');
      return response.data;
    } catch {
      return {
        stats: { activeBuilders: 0, activeProjects: 0, unitsInHandover: 0, openSupport: 0 },
        recentActivity: []
      };
    }
  }
};

export const defectsApi = {
  getDefects: async (projectId?: string, unitId?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.set('unit__floor__block__project', projectId);
    if (unitId) params.set('unit', unitId);
    const query = params.toString();
    const url = query ? `/inspections/defects/?${query}` : '/inspections/defects/';
    const response = await apiClient.get(url);
    return mapped(response.data, normalizeDefect);
  },
  createDefect: async (data: any) => {
    if (data instanceof FormData) {
      const response = await apiClient.post('/inspections/defects/', data);
      return normalizeDefect(response.data);
    }
    // Defect writable fields: unit, inspection_result, category, description,
    // photo, video, priority, status, assigned_contractor. The Defect model has
    // no title/location/project columns — title+location are embedded into
    // `description` (parsed back out by normalizeDefect) and reported_by is set
    // server-side from request.user.
    const unitId = data.unit || data.unitId;
    const title = data.title || '';
    const location = data.location || '';
    let description = data.description || '';
    if (title || location) {
      description = buildDefectDescription(title || description.split('\n')[0] || 'Defect', location, title || location ? description : '');
    }
    const payload: any = {
      unit: unitId,
      description,
      priority: toBackendStatus('defectPriority', data.severity || data.priority || 'medium'),
    };
    const status = data.status ? toBackendStatus('defect', data.status) : undefined;
    if (status) payload.status = status;
    const contractorId = data.contractorId || data.assigned_contractor;
    if (contractorId) payload.assigned_contractor = contractorId;
    const inspectionResultId = data.inspection_result || data.inspectionResultId || data.inspectionId;
    if (inspectionResultId) payload.inspection_result = inspectionResultId;
    if (data.photo) payload.photo = data.photo;
    if (data.video) payload.video = data.video;
    const response = await apiClient.post('/inspections/defects/', payload);
    return normalizeDefect(response.data);
  },
  updateDefect: async (id: string, status: Defect['status'], note: string, resolutionEvidence?: string | File, contractorId?: string, reopenReason?: string) => {
    const backendStatus = toBackendStatus('defect', status as string);
    let payload: any;
    if (resolutionEvidence instanceof File) {
      const formData = new FormData();
      formData.append('status', backendStatus);
      if (contractorId) formData.append('assigned_contractor', contractorId);
      formData.append('resolution_evidence', resolutionEvidence);
      if (reopenReason) formData.append('reopen_reason', reopenReason);
      payload = formData;
    } else {
      payload = { status: backendStatus };
      if (contractorId) payload.assigned_contractor = contractorId;
      if (reopenReason) payload.reopen_reason = reopenReason;
    }
    const response = await apiClient.patch(`/inspections/defects/${id}/`, payload);
    return normalizeDefect(response.data);
  },
};

export const contractorsApi = {
  getContractors: async (assignedProjectIds?: string[]) => {
    const response = await apiClient.get('/accounts/team/');
    const team = response.data.results || response.data;
    let list = team.filter((user: any) => user.role === 'CONTRACTOR');
    if (assignedProjectIds && assignedProjectIds.length > 0) {
      list = list.filter((c: any) => c.assigned_projects && c.assigned_projects.some((p: any) => assignedProjectIds.includes(p.toString())));
    }
    return list;
  },
  updateContractor: async (id: string, data: Partial<any>) => {
    const response = await apiClient.patch(`/accounts/team/${id}/`, data);
    return response.data;
  },
  createContractorWithAccount: async (data: any & { password?: string }) => {
    const payload = {
      name: `${data.contactPersonFirstName || ''} ${data.contactPersonLastName || ''}`.trim() || data.companyName,
      email: data.email,
      phone: data.phone,
      role: 'CONTRACTOR',
      password: data.password || 'Contractor@1234',
      is_active: true,
      assigned_project_ids: data.assignedProjectIds || []
    };
    const response = await apiClient.post('/accounts/team/', payload);
    return response.data;
  }
};

export const checklistsApi = {
  /**
   * Returns ALL checklists — for the Super Admin Checklists management page.
   * Requires Super Admin role.
   */
  getChecklists: async () => {
    const response = await apiClient.get('/platform-admin/checklists/');
    const data = response.data.results || response.data;
    return data.map((item: any) => ({
      ...item,
      updated: item.updated_at
        ? new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Unknown',
    }));
  },
  /**
   * Returns only Active checklists — accessible to all authenticated users.
   * Used by StartInspection.tsx and any builder-side checklist selector.
   */
  getActiveChecklists: async () => {
    const response = await apiClient.get('/platform-admin/checklists/active/');
    const data = response.data.results || response.data;
    return data.map((item: any) => ({
      ...item,
      updated: item.updated_at
        ? new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Unknown',
    }));
  },
  createChecklist: async (data: Omit<ChecklistTemplate, 'id' | 'updated' | 'items'>) => {
    const response = await apiClient.post('/platform-admin/checklists/', data);
    return response.data;
  },
  updateChecklist: async (id: string, data: Partial<ChecklistTemplate>) => {
    const response = await apiClient.patch(`/platform-admin/checklists/${id}/`, data);
    return response.data;
  },
  deleteChecklist: async (id: string) => {
    await apiClient.delete(`/platform-admin/checklists/${id}/`);
  },
};

export const notificationsApi = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications/notifications/');
    return response.data.results || response.data;
  },
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/notifications/unread_count/');
    return response.data.unread_count;
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/notifications/${id}/`, { is_read: true });
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/notifications/mark_all_read/');
    return response.data;
  }
};





/**
 * Centralized INR currency formatter for Handoverly AI.
 * Use this everywhere a subscription price needs to be displayed.
 * Example: formatINR(25000) → "₹25,000"
 * Example: formatINR(250000, 'Yearly') → "₹2,50,000/year"
 */
export const formatINR = (amount: number | string, billingCycle?: string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
  if (!billingCycle) return formatted;
  const suffix = billingCycle === 'Yearly' ? '/year' : '/month';
  return `${formatted}${suffix}`;
};

/** Map frontend Plan camelCase fields → backend snake_case for create/update payloads. */
const planToBackend = (data: Partial<any>): Record<string, any> => {
  const out: Record<string, any> = {};
  if (data.name !== undefined) out.name = data.name;
  if (data.description !== undefined) out.description = data.description;
  if (data.price !== undefined) out.price = data.price;
  // Both camelCase (frontend) and snake_case (raw backend) accepted:
  if (data.billingCycle !== undefined) out.billing_cycle = data.billingCycle;
  if (data.billing_cycle !== undefined) out.billing_cycle = data.billing_cycle;
  if (data.maxProjects !== undefined) out.max_projects = data.maxProjects;
  if (data.max_projects !== undefined) out.max_projects = data.max_projects;
  if (data.maxUnits !== undefined) out.max_units = data.maxUnits;
  if (data.max_units !== undefined) out.max_units = data.max_units;
  if (data.maxUsers !== undefined) out.max_users = data.maxUsers;
  if (data.max_users !== undefined) out.max_users = data.max_users;
  if (data.storageLimit !== undefined) out.features = { ...out.features, storage_gb: data.storageLimit };
  if (data.status !== undefined) out.status = data.status;
  if (data.features !== undefined) out.features = data.features;
  return out;
};

/** Map a backend plan row → frontend Plan shape (snake_case → camelCase). */
const planFromBackend = (row: any): Plan => ({
  id: String(row.id),
  name: row.name || '',
  description: row.description || '',
  price: row.price != null ? String(row.price) : '',
  billingCycle: row.billing_cycle || 'Monthly',
  maxProjects: row.max_projects != null ? String(row.max_projects) : '',
  maxUnits: row.max_units != null ? String(row.max_units) : '',
  maxUsers: row.max_users != null ? String(row.max_users) : '',
  storageLimit: row.features?.storage_gb != null ? String(row.features.storage_gb) : '',
  status: row.status || 'Active',
});

export const plansApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await apiClient.get('/platform-admin/plans/');
    const raw: any[] = response.data.results || response.data;
    return raw.map(planFromBackend);
  },
  createPlan: async (data: Omit<Plan, 'id'>): Promise<Plan> => {
    const response = await apiClient.post('/platform-admin/plans/', planToBackend(data));
    return planFromBackend(response.data);
  },
  updatePlan: async (id: string, data: Partial<Plan>): Promise<Plan> => {
    const response = await apiClient.patch(`/platform-admin/plans/${id}/`, planToBackend(data));
    return planFromBackend(response.data);
  },
  deletePlan: async (id: string) => {
    await apiClient.delete(`/platform-admin/plans/${id}/`);
  },
};

export const templatesApi = {
  getTemplates: async () => [],
  createTemplate: async (data: any) => ({ ...data, id: Date.now().toString() }),
  updateTemplate: async (id: string, data: any) => ({ ...data, id }),
};

export const supportApi = {
  getTickets: async (): Promise<any[]> => [],
  createTicket: async (data: any) => ({ ...data, id: Date.now().toString() }),
  addMessage: async (id: string, sender: string, message: string) => ({ id, sender, message }),
  updateStatus: async (id: string, status: any) => ({ id, status }),
};

export const serviceRequestsApi = {
  getRequests: async (unitId?: string) => {
    const url = unitId ? `/handovers/service-requests/?unit=${unitId}` : '/handovers/service-requests/';
    const response = await apiClient.get(url);
    return mapped(response.data, normalizeServiceRequest);
  },
  createRequest: async (data: any) => {
    // ServiceRequestSerializer writable fields: unit, customer, title,
    // description, category, priority, status, assigned_contractor, … The care
    // form only collects a description — title is derived from its first line.
    const description = data.description || data.request || '';
    const title = data.title || String(description).split('\n')[0].slice(0, 255) || 'Service Request';
    const payload: any = {
      unit: data.unit || data.unitId,
      customer: data.customer || data.customerId,
      title,
      description,
    };
    if (data.category) payload.category = data.category;
    if (data.priority) payload.priority = data.priority;
    // Status is only sent when explicitly provided — the model default
    // ('Submitted') applies otherwise. Values are the backend's own choice
    // strings, so they pass through unchanged.
    if (data.status) payload.status = data.status;
    const response = await apiClient.post('/handovers/service-requests/', payload);
    return normalizeServiceRequest(response.data);
  },
  updateRequest: async (id: string, status: any, contractorId?: string | null) => {
    const payload: any = { status };
    if (contractorId) payload.assigned_contractor = contractorId;
    const response = await apiClient.patch(`/handovers/service-requests/${id}/`, payload);
    return normalizeServiceRequest(response.data);
  },
};

// Real HandoverRecord write path. Approvals / keys / status are
// Builder-Owner-gated SERVER-SIDE; the backend auto-completes the record
// (status HANDED_OVER + unit.status handed_over) when all approvals and
// keys are true.
export const handoverApi = {
  ensureRecord: async (unitId: string | number): Promise<any> => {
    const existing = await apiClient.get('/handovers/records/', { params: { unit: unitId } });
    const rows = Array.isArray(existing.data) ? existing.data : existing.data?.results || [];
    if (rows.length) return normalizeHandoverRecord(rows[0]);
    const created = await apiClient.post('/handovers/records/', { unit: unitId });
    return normalizeHandoverRecord(created.data);
  },
  updateRecord: async (id: string | number, patch: Record<string, any>): Promise<any> => {
    const response = await apiClient.patch(`/handovers/records/${id}/`, patch);
    return normalizeHandoverRecord(response.data);
  },
};

export const associationApi = {
  getTransitions: async (projectId?: string) => {
    const url = projectId ? `/handovers/transitions/?project=${projectId}` : '/handovers/transitions/';
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },
  updateStep: async (builderId: string, step: any) => {
    const response = await apiClient.post('/handovers/transitions/', { builder_company: builderId, step });
    return response.data;
  },
  updateItem: async (builderId: string, field: string, status: string) => {
    const response = await apiClient.post('/handovers/transitions/', { builder_company: builderId, [field]: status });
    return response.data;
  },
};

export const documentService = {
  // The backend DocumentViewSet supports ?unit= / ?customer= / ?defect= /
  // ?project= server-side filters — use them instead of client-side filtering.
  getDocuments: async (filters?: { unitId?: string; customerId?: string; defectId?: string; projectId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.unitId) params.set('unit', filters.unitId);
    if (filters?.customerId) params.set('customer', filters.customerId);
    if (filters?.defectId) params.set('defect', filters.defectId);
    if (filters?.projectId) params.set('project', filters.projectId);
    const query = params.toString();
    const response = await apiClient.get(query ? `/documents/documents/?${query}` : '/documents/documents/');
    return mapped(response.data, normalizeDocument);
  },

  getCustomerDocuments: async (customerId: string) => documentService.getDocuments({ customerId }),

  getUnitDocuments: async (unitId: string) => documentService.getDocuments({ unitId }),

  getDefectEvidence: async (defectId: string) => documentService.getDocuments({ defectId }),

  uploadDocument: async (data: any) => {
    let payload: any = data;
    if (data.file || data.fileData) {
      const formData = new FormData();
      formData.append('title', data.title || data.name || data.fileName || 'Uploaded Document');
      // Backend Document.DOCUMENT_TYPES slugs only — anything else falls back
      // to OTHER so the serializer doesn't reject the whole upload.
      const DOCUMENT_TYPE_SLUGS = ['PROJECT_DOC', 'CUSTOMER_DOC', 'DEFECT_EVIDENCE', 'WARRANTY', 'RECEIPT', 'HANDOVER_CERT', 'OTHER'];
      const docType = String(data.documentType || 'OTHER').toUpperCase();
      formData.append('document_type', DOCUMENT_TYPE_SLUGS.includes(docType) ? docType : 'OTHER');
      formData.append('category', data.category || 'General');
      const file: File | Blob | undefined =
        data.file instanceof File ? data.file : (data.fileData ? dataUrlToFile(data.fileData, data.fileName || 'upload') || undefined : undefined);
      if (file) formData.append('file', file);
      if (data.unitId || data.unit) formData.append('unit', data.unitId || data.unit);
      if (data.customerId || data.customer) formData.append('customer', data.customerId || data.customer);
      if (data.defectId || data.defect) formData.append('defect', data.defectId || data.defect);
      if (data.projectId || data.project) formData.append('project', data.projectId || data.project);
      payload = formData;
    }
    const response = await apiClient.post('/documents/documents/', payload);
    return normalizeDocument(response.data);
  },

  verifyDocument: async (id: string) => {
    const response = await apiClient.patch(`/documents/documents/${id}/`, { status: 'APPROVED' });
    return normalizeDocument(response.data);
  },

  rejectDocument: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/documents/documents/${id}/`, { status: 'REJECTED', rejection_reason: reason });
    return normalizeDocument(response.data);
  },

  deleteDocument: async (id: string) => {
    await apiClient.delete(`/documents/documents/${id}/`);
  },
};

export const auditService = {
  getAuditLogs: async () => {
    try {
      const response = await apiClient.get('/platform-admin/audit-logs/');
      return response.data.results || response.data;
    } catch {
      return [];
    }
  },
  // The backend AuditLog endpoint is read-only (super-admin viewset), so the
  // POST is best-effort: audit writes must never fail the business mutation
  // they trail (e.g. defect creation).
  createAuditLog: async (data: any) => {
    try {
      const response = await apiClient.post('/platform-admin/audit-logs/', data);
      return response.data;
    } catch {
      return data;
    }
  },
};

export const notificationService = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications/notifications/');
    return response.data.results || response.data;
  },
  createNotification: async (data: any) => {
    const response = await apiClient.post('/notifications/notifications/', data);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/notifications/${id}/`, { is_read: true });
    return response.data;
  },
};

export const paymentService = {
  getPayments: async (unitId?: string) => {
    // Backend PaymentClearanceViewSet scopes by ?unit= server-side.
    const url = unitId ? `/handovers/payments/?unit=${unitId}` : '/handovers/payments/';
    const response = await apiClient.get(url);
    return mapped(response.data, normalizePayment);
  },
  createPayment: async (data: any) => {
    // PaymentClearance writable fields: unit, customer, unit_amount,
    // amount_received, maintenance_deposit, corpus_fund, registration_charges,
    // utility_charges, additional_work_charges, late_fees, refundable_deposits,
    // status, receipt_file, remarks. pending_amount is model-calculated;
    // verified_by/verified_at are set server-side and are never sent.
    // The UI's payment type/method/reference/date/proof live in `remarks`
    // (token format — parsed back out by normalizePayment).
    const amount = Number(data.amount || 0);
    const status = toBackendStatus('payment', data.status || 'Pending Verification');
    const remarks = buildPaymentRemarks({
      paymentType: data.paymentType || data.title,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      paymentDate: data.paymentDate || data.dueDate,
      proofFileName: data.proofFileName || undefined,
      notes: data.notes,
    });
    const jsonPayload: any = {
      unit: data.unit || data.unitId,
      customer: data.customer || data.customerId,
      unit_amount: amount,
      amount_received: amount,
      status,
      remarks,
    };
    // Extra charge fields pass through when a caller provides them.
    for (const field of ['maintenance_deposit', 'corpus_fund', 'registration_charges', 'utility_charges', 'additional_work_charges', 'late_fees', 'refundable_deposits']) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') jsonPayload[field] = Number(data[field]);
    }
    // Receipt proof must go as multipart so it lands in receipt_file.
    const proofFile: File | undefined =
      data.proofFile instanceof File
        ? data.proofFile
        : data.proofFileData
          ? dataUrlToFile(data.proofFileData, data.proofFileName || 'payment-proof') || undefined
          : undefined;
    if (proofFile) {
      const formData = new FormData();
      Object.entries(jsonPayload).forEach(([key, value]) => formData.append(key, String(value)));
      formData.append('receipt_file', proofFile);
      const response = await apiClient.post('/handovers/payments/', formData);
      return normalizePayment(response.data);
    }
    const response = await apiClient.post('/handovers/payments/', jsonPayload);
    return normalizePayment(response.data);
  },
  updatePaymentStatus: async (id: string, status: any, _verifiedBy?: string) => {
    // `status` may arrive as a UI display label ('Verified', 'Cleared', …) —
    // toBackendStatus maps it to the real PaymentClearance.STATUS_CHOICES slug.
    // verifiedBy is intentionally ignored: the server stamps verified_by /
    // verified_at from request.user.
    const payload = { status: toBackendStatus('payment', status) };
    const response = await apiClient.patch(`/handovers/payments/${id}/`, payload);
    return normalizePayment(response.data);
  },
};

export const chargeService = {
  getCharges: async (clearanceId?: string, unitId?: string) => {
    const params = new URLSearchParams();
    if (clearanceId) params.set('clearance', clearanceId);
    if (unitId) params.set('unit', unitId);
    const query = params.toString();
    const url = query ? `/handovers/charges/?${query}` : '/handovers/charges/';
    const response = await apiClient.get(url);
    return mapped(response.data, normalizeCharge);
  },
  createCharge: async (data: any) => {
    const response = await apiClient.post('/handovers/charges/', data);
    return normalizeCharge(response.data);
  },
  updateCharge: async (id: string, data: any) => {
    const response = await apiClient.patch(`/handovers/charges/${id}/`, data);
    return normalizeCharge(response.data);
  }
};

export const paymentRecordService = {
  getPaymentRecords: async (clearanceId?: string, unitId?: string) => {
    const params = new URLSearchParams();
    if (clearanceId) params.set('clearance', clearanceId);
    if (unitId) params.set('unit', unitId);
    const query = params.toString();
    const url = query ? `/handovers/payment-records/?${query}` : '/handovers/payment-records/';
    const response = await apiClient.get(url);
    return mapped(response.data, normalizePaymentRecord);
  },
  createPaymentRecord: async (data: any) => {
    const response = await apiClient.post('/handovers/payment-records/', data);
    return normalizePaymentRecord(response.data);
  },
  updatePaymentRecord: async (id: string, data: any) => {
    const response = await apiClient.patch(`/handovers/payment-records/${id}/`, data);
    return normalizePaymentRecord(response.data);
  },
  approvePaymentRecord: async (id: string) => {
    const response = await apiClient.post(`/handovers/payment-records/${id}/approve/`);
    return normalizePaymentRecord(response.data);
  },
  rejectPaymentRecord: async (id: string, rejection_reason: string) => {
    const response = await apiClient.post(`/handovers/payment-records/${id}/reject/`, { rejection_reason });
    return normalizePaymentRecord(response.data);
  }
};

// ─── Subscription Billing API ────────────────────────────────────────────────
// Super Admin subscription payment tracking.
// Endpoint: /api/v1/platform-admin/subscription-billing/
// ─────────────────────────────────────────────────────────────────────────────
export const subscriptionBillingApi = {
  getAll: async (params?: { builder?: string; payment_status?: string }) => {
    const query = new URLSearchParams();
    if (params?.builder) query.set('builder', params.builder);
    if (params?.payment_status) query.set('payment_status', params.payment_status);
    const url = '/platform-admin/subscription-billing/' + (query.toString() ? `?${query.toString()}` : '');
    const response = await apiClient.get(url);
    return response.data.results || response.data;
  },
  create: async (data: {
    builder: string;
    plan?: string;
    billing_period_start: string;
    billing_period_end: string;
    amount_due: number;
    due_date: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/platform-admin/subscription-billing/', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/platform-admin/subscription-billing/${id}/`, data);
    return response.data;
  },
  recordPayment: async (id: string, data: {
    amount_paid?: number;
    paid_date?: string;
    payment_reference?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(`/platform-admin/subscription-billing/${id}/record_payment/`, data);
    return response.data;
  },
  markOverdue: async (id: string) => {
    const response = await apiClient.post(`/platform-admin/subscription-billing/${id}/mark_overdue/`);
    return response.data;
  },
};

export const accountsApi = {
  getSummary: async () => {
    const response = await apiClient.get('/handovers/accounts-summary/');
    return response.data;
  }
};
