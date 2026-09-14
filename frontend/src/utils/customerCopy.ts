/**
 * Maps internal workflow/status enum values (used across mockDb and admin screens)
 * to warmer, homeowner-facing copy for the customer portal. Purely a display-layer
 * translation — never changes the underlying stored status value.
 */
const STATUS_COPY: Record<string, string> = {
  // Unit.status — backend UNIT_STATUS_CHOICES slugs
  'Under Construction': 'Under Construction',
  'Ready for Inspection': 'Ready for Inspection',
  'Defects Found': 'Issues Found',
  'Resolved': 'Issues Resolved',
  'Approved': 'Approved',
  'Handed Over': 'Handed Over',
  'not_started': 'Not Yet Started',
  'construction_in_progress': 'Under Construction',
  'nearing_completion': 'Nearing Completion',
  'internal_inspection': 'Internal Inspection',
  'defect_resolution': 'Issues Found',
  'customer_inspection_ready': 'Inspection Ready',
  'customer_inspection_completed': 'Inspection Completed',
  'handover_preparation': 'Preparing Handover',
  'ready_for_handover': 'Ready for Handover',
  'handover_scheduled': 'Handover Scheduled',
  'handed_over': 'Handed Over',
  'warranty_stage': 'Warranty Stage',

  // Unit.inspectionStatus
  'Pending': 'Not Yet Started',
  'In Progress': 'In Progress',
  'Failed': 'Issues Found',
  'Passed': 'Completed',

  // Defect.status — backend STATUS_CHOICES slugs
  'Open': 'Reported',
  'Assigned': 'In Review',
  'Closed': 'Closed',
  'open': 'Reported',
  'assigned': 'In Review',
  'accepted': 'Accepted',
  'in_progress': 'Being Repaired',
  'waiting_for_reinspection': 'Awaiting Reinspection',
  'rejected': 'Needs Attention',
  'resolved': 'Fixed — Awaiting Approval',
  'closed': 'Closed',
  'cancelled': 'Cancelled',

  // Document.status — backend STATUS_CHOICES slugs
  'Verified': 'Approved',
  'Rejected': 'Needs Attention',
  'REQUIRED': 'Required',
  'REQUESTED': 'Requested',
  'UPLOADED': 'Under Review',
  'UNDER_REVIEW': 'Under Review',
  'APPROVED': 'Approved',
  'REJECTED': 'Needs Attention',
  'EXPIRED': 'Expired',
  'NOT_APPLICABLE': 'Not Applicable',

  // Payment.status — backend STATUS_CHOICES slugs
  'Pending Verification': 'Under Review',
  'Cleared': 'Paid',
  'NOT_REVIEWED': 'Under Review',
  'PENDING_PAYMENT': 'Under Review',
  'PARTIALLY_CLEARED': 'Verified',
  'CLEARED': 'Paid',
  'APPROVED_FOR_HANDOVER': 'Approved for Handover',
  'ON_HOLD': 'Needs Attention',

  // ServiceRequest.status — backend choices are already display strings
  'Request': 'Submitted',
  'Assign': 'Assigned to a Technician',
  'Resolve': 'Completed',
  'Customer confirmation': 'Awaiting Your Confirmation',
  'Submitted': 'Submitted',
  'Scheduled': 'Scheduled',
  'Completed': 'Completed',
};

export function friendlyStatus(status: string | undefined | null): string {
  if (!status) return 'Not Yet Started';
  return STATUS_COPY[status] || status;
}
