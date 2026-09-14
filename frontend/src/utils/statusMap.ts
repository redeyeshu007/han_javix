// Single source of truth for status vocabulary per domain.
//
// Contract rule (Phase 1 normalization): backend rows keep their raw status
// SLUG as data (e.g. 'handed_over', 'APPROVED', 'PENDING_PAYMENT', 'open');
// display renders through the label maps below, and the UI NEVER sends display
// strings on the wire — mutations go through toBackendStatus() so only slugs /
// real backend choice values are serialized.
//
// NOTE: ServiceRequest statuses are an exception — the backend model's choices
// ARE display strings ('Submitted', 'In Progress', ...), so slug === label.

export type StatusDomain =
  | 'unit'
  | 'defect'
  | 'defectPriority'
  | 'payment'
  | 'document'
  | 'inspection'
  | 'inspectionType'
  | 'serviceRequest'
  | 'handover';

export const STATUS_LABELS: Record<StatusDomain, Record<string, string>> = {
  // projects.Unit.UNIT_STATUS_CHOICES (backend slug → label)
  unit: {
    not_started: 'Not Started',
    construction_in_progress: 'Construction in Progress',
    nearing_completion: 'Nearing Completion',
    internal_inspection: 'Internal Inspection',
    defect_resolution: 'Defect Resolution',
    customer_inspection_ready: 'Customer Inspection Ready',
    customer_inspection_completed: 'Customer Inspection Completed',
    handover_preparation: 'Handover Preparation',
    ready_for_handover: 'Ready for Handover',
    handover_scheduled: 'Handover Scheduled',
    handed_over: 'Handed Over',
    warranty_stage: 'Warranty Stage',
  },
  // inspections.Defect.STATUS_CHOICES
  defect: {
    open: 'Open',
    assigned: 'Assigned',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    waiting_for_reinspection: 'Waiting for Reinspection',
    rejected: 'Rejected',
    resolved: 'Resolved',
    closed: 'Closed',
    cancelled: 'Cancelled',
  },
  // inspections.Defect.PRIORITY_CHOICES
  defectPriority: {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  // handovers.PaymentClearance.STATUS_CHOICES.
  // The UI's four-state vocabulary maps onto these slugs:
  //   PENDING_PAYMENT   -> "Pending Verification" (recorded, awaiting verification)
  //   PARTIALLY_CLEARED -> "Verified"            (funds verified, not yet cleared)
  //   CLEARED           -> "Cleared"
  //   ON_HOLD           -> "Rejected"
  payment: {
    NOT_REVIEWED: 'Not Reviewed',
    PENDING_PAYMENT: 'Pending Verification',
    PARTIALLY_CLEARED: 'Verified',
    CLEARED: 'Cleared',
    APPROVED_FOR_HANDOVER: 'Approved for Handover',
    ON_HOLD: 'Rejected',
  },
  // documents.Document.STATUS_CHOICES
  document: {
    REQUIRED: 'Required',
    REQUESTED: 'Requested',
    UPLOADED: 'Pending Review',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Verified',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
    NOT_APPLICABLE: 'Not Applicable',
  },
  // inspections.UnitInspection.STATUS_CHOICES
  inspection: {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
  },
  // inspections.UnitInspection.INSPECTION_TYPE_CHOICES
  inspectionType: {
    internal: 'Internal',
    customer: 'Customer',
  },
  // handovers.ServiceRequest.STATUS_CHOICES (values are already display strings)
  serviceRequest: {
    Submitted: 'Submitted',
    Scheduled: 'Scheduled',
    'In Progress': 'In Progress',
    Completed: 'Completed',
    Closed: 'Closed',
    Rejected: 'Rejected',
  },
  // handovers.HandoverRecord.STATUS_CHOICES
  handover: {
    NOT_READY: 'Not Ready',
    READY_FOR_HANDOVER: 'Ready for Handover',
    HANDOVER_SCHEDULED: 'Handover Scheduled',
    HANDED_OVER: 'Handed Over',
  },
};

// UI display vocabulary → backend slug, for mutations that still pass a legacy
// display string (mock-era call sites). Slugs pass through unchanged.
const LEGACY_INTENT_TO_SLUG: Partial<Record<StatusDomain, Record<string, string>>> = {
  defect: {
    Open: 'open',
    Assigned: 'assigned',
    Accepted: 'accepted',
    'In Progress': 'in_progress',
    'Waiting for Reinspection': 'waiting_for_reinspection',
    Rejected: 'rejected',
    Resolved: 'resolved',
    Closed: 'closed',
    Cancelled: 'cancelled',
  },
  defectPriority: {
    Critical: 'critical',
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  },
  payment: {
    'Pending Verification': 'PENDING_PAYMENT',
    Verified: 'PARTIALLY_CLEARED',
    Cleared: 'CLEARED',
    Rejected: 'ON_HOLD',
  },
  document: {
    'Pending Review': 'UPLOADED',
    Verified: 'APPROVED',
    Rejected: 'REJECTED',
  },
  inspection: {
    Scheduled: 'not_started',
    'In Progress': 'in_progress',
    Completed: 'completed',
    // A finished audit (Passed/Failed) is expressed as a completed inspection
    // plus defect rows; pass/fail itself is not a UnitInspection.status choice.
    Passed: 'completed',
    Failed: 'completed',
  },
  inspectionType: {
    Internal: 'internal',
    Customer: 'customer',
  },
  unit: {
    'Handed Over': 'handed_over',
  },
  handover: {
    'Handed Over': 'HANDED_OVER',
  },
};

/**
 * Map any per-domain status value to its canonical display label.
 * Accepts a backend slug, or an already-display value (legacy code / local
 * data) — the latter passes through unchanged.
 */
export function statusLabel(domain: StatusDomain, value?: string | null): string {
  if (value === undefined || value === null || value === '') return value || '';
  const labels = STATUS_LABELS[domain];
  if (Object.prototype.hasOwnProperty.call(labels, value)) return labels[value];
  return value;
}

/**
 * Map a UI/intent value (or an already-valid backend slug) to the exact value
 * the backend serializer accepts. Unknown values pass through unchanged — the
 * server's own choice validation is the final gate.
 */
export function toBackendStatus(domain: StatusDomain, value?: string | null): string {
  if (value === undefined || value === null || value === '') return value || '';
  const labels = STATUS_LABELS[domain];
  if (Object.prototype.hasOwnProperty.call(labels, value)) return value; // already a slug
  const legacy = LEGACY_INTENT_TO_SLUG[domain];
  if (legacy && Object.prototype.hasOwnProperty.call(legacy, value)) return legacy[value];
  return value;
}

export const isValidStatus = (domain: StatusDomain, value?: string | null): boolean =>
  value != null && Object.prototype.hasOwnProperty.call(STATUS_LABELS[domain], value);

// Payment states that mean "an accounts user has verified this entry" — entering
// one of these records verified_by/verified_at server-side.
export const PAYMENT_VERIFIED_SLUGS = ['PARTIALLY_CLEARED', 'CLEARED', 'APPROVED_FOR_HANDOVER'] as const;
export const PAYMENT_STATUS_SLUGS = Object.keys(STATUS_LABELS.payment);

// Document states that still need review (backend Document.STATUS_CHOICES).
export const DOCUMENT_PENDING_REVIEW_STATUSES = ['REQUIRED', 'REQUESTED', 'UPLOADED', 'UNDER_REVIEW'];
export const DOCUMENT_APPROVED_SLUG = 'APPROVED';
export const DOCUMENT_REJECTED_SLUG = 'REJECTED';

// Defect states that count as rectified for handover-readiness math.
export const DEFECT_RESOLVED_SLUGS = ['resolved', 'closed'];
export const DEFECT_OPEN_SLUGS = ['open', 'assigned', 'accepted', 'in_progress', 'waiting_for_reinspection', 'rejected'];

export const UNIT_HANDED_OVER_SLUG = 'handed_over';
