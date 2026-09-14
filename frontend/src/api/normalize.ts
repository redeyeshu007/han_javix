// Phase 1 normalization layer — the ONE place where backend rows are mapped to
// frontend types for the unit-details core domains (unit / document / payment /
// defect / service-request / inspection / handover-record).
//
// Rules:
//  - snake_case → camelCase, FK `unit` → `unitId`, `customer` → `customerId`.
//  - Status values stay as raw backend slugs (see utils/statusMap.ts for
//    slug ↔ label maps). Nothing here invents status data.
//  - Every normalized row spreads the raw backend row first, so legacy
//    consumers that still read raw keys (e.g. `row.unit`, `row.created_at`)
//    keep working while new code uses the normalized keys.
//  - Fields the backend model does not have but the UI renders (defect
//    title/location, payment type/method/reference) are embedded into a single
//    backend text field on write (defect.description / payment.remarks) using
//    the tagged formats below, and parsed back out here on read.

import { statusLabel } from '../utils/statusMap';

// ---------------------------------------------------------------------------
// Tagged text formats (write-side builders + read-side parsers)
// ---------------------------------------------------------------------------

/** Defect description convention: title / location / detail in one TextField. */
export function buildDefectDescription(title: string, location: string, detail?: string): string {
  return [title.trim(), `[Location] ${location.trim()}`, (detail || '').trim()].filter(Boolean).join('\n');
}

export function parseDefectDescription(description?: string | null): { title: string; location: string; detail: string } {
  const text = (description || '').trim();
  if (!text) return { title: '', location: '', detail: '' };
  const lines = text.split('\n');
  const title = (lines[0] || '').trim();
  const locationLineIdx = lines.findIndex(l => /^\[Location\]\s*/.test(l.trim()));
  let location = '';
  let detailLines = lines.slice(1);
  if (locationLineIdx >= 0) {
    location = lines[locationLineIdx].trim().replace(/^\[Location\]\s*/, '');
    detailLines = lines.slice(0, locationLineIdx).slice(1).concat(lines.slice(locationLineIdx + 1));
  }
  return { title, location, detail: detailLines.join('\n').trim() };
}

/** Payment remarks convention: `key=value` tokens + free-text notes. */
const PAYMENT_REMARK_KEYS = ['payment_type', 'method', 'reference', 'payment_date', 'proof'] as const;

export function buildPaymentRemarks(fields: {
  paymentType?: string; paymentMethod?: string; reference?: string;
  paymentDate?: string; proofFileName?: string; notes?: string;
}): string {
  const tokens: string[] = [];
  if (fields.paymentType) tokens.push(`payment_type=${fields.paymentType}`);
  if (fields.paymentMethod) tokens.push(`method=${fields.paymentMethod}`);
  if (fields.reference) tokens.push(`reference=${fields.reference}`);
  if (fields.paymentDate) tokens.push(`payment_date=${fields.paymentDate}`);
  if (fields.proofFileName) tokens.push(`proof=${fields.proofFileName}`);
  const notes = (fields.notes || '').trim();
  return [...tokens, notes].filter(Boolean).join(' | ');
}

export function parsePaymentRemarks(remarks?: string | null): {
  paymentType: string; paymentMethod: string; reference: string;
  paymentDate: string; proofFileName: string; notes: string;
} {
  const text = (remarks || '').trim();
  const out = { paymentType: '', paymentMethod: '', reference: '', paymentDate: '', proofFileName: '', notes: '' };
  if (!text) return out;
  const notesParts: string[] = [];
  for (const part of text.split('|').map(p => p.trim())) {
    const eq = part.indexOf('=');
    const key = eq > 0 ? part.slice(0, eq).trim() : '';
    if ((PAYMENT_REMARK_KEYS as readonly string[]).includes(key)) {
      const value = part.slice(eq + 1).trim();
      if (key === 'payment_type') out.paymentType = value;
      else if (key === 'method') out.paymentMethod = value;
      else if (key === 'reference') out.reference = value;
      else if (key === 'payment_date') out.paymentDate = value;
      else if (key === 'proof') out.proofFileName = value;
    } else if (part) {
      notesParts.push(part);
    }
  }
  out.notes = notesParts.join(' | ');
  return out;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const str = (v: any): string => (v === undefined || v === null ? '' : String(v));
const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const guessFileType = (fileName?: string | null): string => {
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
  return EXT_TO_MIME[ext] || '';
};

/** Extract a page/list payload and map each row (DRF paginated or plain array). */
export function normalizeList<T>(data: any, mapRow: (row: any) => T): T[] {
  const rows = data?.results ? data.results : Array.isArray(data) ? data : [];
  return rows.map(mapRow);
}

/** Convert a legacy base64 data-URL payload into a real File for multipart upload. */
export function dataUrlToFile(dataUrl: string, fileName: string): File | null {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  try {
    const byteString = atob(match[2]);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) bytes[i] = byteString.charCodeAt(i);
    return new File([bytes], fileName || 'upload', { type: match[1] || 'application/octet-stream' });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Per-domain mappers (backend row → frontend type)
// ---------------------------------------------------------------------------

export function normalizeUnit(row: any) {
  if (!row) return row;
  return {
    ...row,
    id: str(row.id),
    name: row.name || row.unit_number || `Unit ${row.id}`,
    projectId: str(row.projectId ?? row.project_id ?? row.floor?.block?.project ?? ''),
    blockId: str(row.blockId ?? row.block_id ?? row.floor?.block ?? ''),
    floorId: str(row.floorId ?? row.floor_id ?? row.floor ?? ''),
    type: row.type || row.unit_type || 'Apartment',
    areaSqFt: num(row.areaSqFt ?? row.area_sqft),
    bedrooms: num(row.bedrooms),
    bathrooms: num(row.bathrooms),
    // Backend slug preserved (e.g. 'not_started', 'handed_over').
    status: row.status || 'not_started',
    customerId: (row.customerId ?? row.customer) ? str(row.customerId ?? row.customer) : null,
    // No inspection-status source field on Unit yet — keep the legacy default.
    inspectionStatus: row.inspectionStatus || 'Pending',
    docsCleared: Boolean(row.docsCleared),
    paymentCleared: Boolean(row.paymentCleared),
    defectsCleared: Boolean(row.defectsCleared),
    keysHandedOver: Boolean(row.keysHandedOver),
    approvalsCleared: Boolean(row.approvalsCleared),
  };
}

export function normalizeDocument(row: any) {
  if (!row) return row;
  const fileName = row.file_name || row.fileName || (row.file ? String(row.file).split('/').pop() : '') || '';
  return {
    ...row,
    id: str(row.id),
    builderId: row.builderId ?? row.builder_company ?? undefined,
    projectId: row.projectId ?? (row.project ? str(row.project) : undefined),
    unitId: row.unitId ?? (row.unit ? str(row.unit) : undefined),
    customerId: row.customerId ?? (row.customer ? str(row.customer) : undefined),
    defectId: row.defectId ?? (row.defect ? str(row.defect) : undefined),
    name: row.title || row.name || 'Untitled',
    documentType: row.document_type || row.documentType || 'OTHER',
    category: row.category || 'General',
    fileName,
    fileType: row.fileType || guessFileType(fileName),
    fileSize: row.fileSize && typeof row.fileSize === 'string' ? row.fileSize : formatFileSize(row.file_size),
    uploadedBy: row.uploaded_by_name || row.uploadedBy || (row.uploaded_by ? str(row.uploaded_by) : ''),
    uploadedAt: row.uploadedAt || (row.created_at ? String(row.created_at).split('T')[0] : ''),
    // Backend slug preserved ('APPROVED' | 'REJECTED' | 'UPLOADED' | ...).
    status: row.status || 'UPLOADED',
    rejectionReason: row.rejection_reason || row.rejectionReason || undefined,
    fileUrl: row.file || row.fileUrl || row.fileData || '',
    // Legacy alias: consumers render evidence images from `fileData`.
    fileData: row.file || row.fileData || '',
  };
}

export function normalizePayment(row: any) {
  if (!row) return row;
  const remarks = parsePaymentRemarks(row.remarks);
  return {
    ...row,
    id: str(row.id),
    unitId: row.unitId ?? (row.unit ? str(row.unit) : ''),
    customerId: row.customerId ?? (row.customer ? str(row.customer) : ''),
    // The UI's single "Amount" is the money received on this entry.
    amount: num(row.amount ?? row.amount_received),
    unitAmount: num(row.unit_amount),
    pendingAmount: num(row.pending_amount),
    paymentType: row.paymentType || remarks.paymentType || 'Payment',
    paymentDate: row.paymentDate || remarks.paymentDate || String(row.created_at || '').split('T')[0],
    paymentMethod: row.paymentMethod || remarks.paymentMethod || '',
    reference: row.reference || remarks.reference || '',
    notes: row.notes || remarks.notes || '',
    proofFileName: row.proofFileName || remarks.proofFileName || undefined,
    // Backend slug preserved (PENDING_PAYMENT / PARTIALLY_CLEARED / CLEARED / ...).
    status: row.status || 'NOT_REVIEWED',
    verifiedBy: row.verifiedBy ?? row.verified_by_name ?? (row.verified_by ? str(row.verified_by) : undefined),
    verifiedAt: row.verifiedAt ?? row.verified_at ?? undefined,
    createdAt: row.created_at || row.createdAt || '',
    updatedAt: row.updated_at || row.updatedAt || '',
  };
}

export function normalizeCharge(row: any) {
  if (!row) return row;
  return {
    id: str(row.id),
    clearanceId: row.clearance_id ?? (row.clearance ? str(row.clearance) : ''),
    chargeType: row.charge_type || 'OTHER',
    amount: num(row.amount),
    amountPaid: num(row.amount_paid),
    dueDate: row.due_date || '',
    description: row.description || '',
    status: row.status || 'PENDING',
    createdAt: row.created_at || '',
    unitDetails: row.unit_details || undefined,
  };
}

export function normalizePaymentRecord(row: any) {
  if (!row) return row;
  return {
    id: str(row.id),
    clearanceId: row.clearance_id ?? (row.clearance ? str(row.clearance) : ''),
    chargeId: row.charge_id ?? (row.charge ? str(row.charge) : ''),
    amount: num(row.amount),
    paymentMethod: row.payment_method || 'OTHER',
    referenceId: row.reference_id || '',
    paymentDate: row.payment_date || '',
    status: row.status || 'VERIFIED',
    remarks: row.remarks || '',
    receiptFile: row.receipt_file || undefined,
    receiptUrl: row.receipt_file_url || undefined,
    createdAt: row.created_at || '',
    unitDetails: row.unit_details || undefined,
    chargeDetails: row.charge_details || undefined,
  };
}

export function normalizeDefect(row: any) {
  if (!row) return row;
  const parsed = parseDefectDescription(row.description);
  const prioritySlug = row.priority || 'medium';
  return {
    ...row,
    id: str(row.id),
    unitId: row.unitId ?? (row.unit ? str(row.unit) : ''),
    // `inspection_result` is the backend FK to UnitInspectionResult.
    inspectionId: row.inspectionId ?? (row.inspection_result ? str(row.inspection_result) : undefined),
    inspectionResultId: row.inspection_result ? str(row.inspection_result) : undefined,
    title: row.title || parsed.title || 'Defect',
    description: row.description || '',
    location: row.location || parsed.location || '',
    // Display label derived from the backend priority slug ('high' → 'High').
    severity: (row.severity || statusLabel('defectPriority', prioritySlug)) as any,
    priority: prioritySlug,
    contractorId: row.contractorId ?? (row.assigned_contractor ? str(row.assigned_contractor) : ''),
    // Backend slug preserved ('open' | 'assigned' | 'in_progress' | ...).
    status: row.status || 'open',
    resolutionEvidence: row.resolution_evidence || row.resolutionEvidence || undefined,
    reportedAt: row.reported_date || row.reportedAt || '',
    date: row.reported_date || '',
    timeline: Array.isArray(row.timeline) && row.timeline.length > 0
      ? row.timeline
      : (row.activity_logs || []).map((log: any) => ({
          status: statusLabel('defect', log.action),
          date: String(log.timestamp || '').split('T')[0],
          note: log.remarks || log.action || '',
        })),
  };
}

export function normalizeServiceRequest(row: any) {
  if (!row) return row;
  return {
    ...row,
    id: str(row.id),
    unitId: row.unitId ?? (row.unit ? str(row.unit) : ''),
    customerId: row.customerId ?? (row.customer ? str(row.customer) : ''),
    title: row.title || '',
    description: row.description || '',
    // Legacy aliases the unit Care tab / care desk render.
    request: row.request || row.description || row.title || '',
    date: row.date || (row.created_at ? String(row.created_at).split('T')[0] : ''),
    contractorId: row.contractorId ?? (row.assigned_contractor ? str(row.assigned_contractor) : null),
    // Values are the backend's own choice strings ('Submitted', 'In Progress', ...).
    status: row.status || 'Submitted',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  };
}

export function normalizeInspection(row: any) {
  if (!row) return row;
  return {
    ...row,
    id: str(row.id),
    unitId: row.unitId ?? (row.unit ? str(row.unit) : ''),
    inspectorId: row.inspectorId ?? (row.inspected_by ? str(row.inspected_by) : ''),
    inspectionType: row.inspectionType || row.inspection_type || 'internal',
    // Backend slug preserved ('not_started' | 'in_progress' | 'completed').
    status: row.status || 'not_started',
    scheduledDate: row.scheduledDate ?? row.scheduled_date ?? undefined,
    completedDate: row.completedDate ?? row.completed_date ?? undefined,
    date: row.date || row.scheduled_date || row.completed_date || String(row.created_at || '').split('T')[0],
  };
}

export function normalizeHandoverRecord(row: any) {
  if (!row) return row;
  return {
    ...row,
    id: str(row.id),
    unitId: row.unitId ?? (row.unit ? str(row.unit) : ''),
    customerId: row.customerId ?? (row.customer ? str(row.customer) : ''),
    projectId: row.projectId ?? row.project_id ?? undefined,
    projectName: row.project_name || undefined,
    // Backend slug preserved ('NOT_READY' | 'READY_FOR_HANDOVER' | ...).
    status: row.status || 'NOT_READY',
    keysHandedOver: row.keysHandedOver ?? Boolean(row.keys_handed_over),
    accessCardsHandedOver: row.accessCardsHandedOver ?? Boolean(row.access_cards_handed_over),
    scheduledDate: row.scheduledDate ?? row.scheduled_date ?? undefined,
    actualDate: row.actualDate ?? row.actual_date ?? undefined,
    parkingAllotted: row.parkingAllotted ?? row.parking_allotted ?? '',
  };
}
