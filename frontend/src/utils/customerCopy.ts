/**
 * Maps internal workflow/status enum values (used across mockDb and admin screens)
 * to warmer, homeowner-facing copy for the customer portal. Purely a display-layer
 * translation — never changes the underlying stored status value.
 */
const STATUS_COPY: Record<string, string> = {
  // Unit.status
  'Under Construction': 'Under Construction',
  'Ready for Inspection': 'Ready for Inspection',
  'Defects Found': 'Issues Found',
  'Resolved': 'Issues Resolved',
  'Approved': 'Approved',
  'Handed Over': 'Handed Over',

  // Unit.inspectionStatus
  'Pending': 'Not Yet Started',
  'In Progress': 'In Progress',
  'Failed': 'Issues Found',
  'Passed': 'Completed',

  // Defect.status
  'Open': 'Reported',
  'Assigned': 'In Review',
  'Closed': 'Closed',

  // Document.status
  'Verified': 'Approved',
  'Rejected': 'Needs Attention',

  // Payment.status
  'Pending Verification': 'Under Review',
  'Cleared': 'Paid',

  // ServiceRequest.status
  'Request': 'Submitted',
  'Assign': 'Assigned to a Technician',
  'Resolve': 'Completed',
  'Customer confirmation': 'Awaiting Your Confirmation',
};

export function friendlyStatus(status: string | undefined | null): string {
  if (!status) return 'Not Yet Started';
  return STATUS_COPY[status] || status;
}
