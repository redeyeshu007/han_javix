import { Unit, Document, Payment, Defect } from '../types';;
import { DEFECT_RESOLVED_SLUGS, DOCUMENT_APPROVED_SLUG } from './statusMap';

export const OWNERSHIP_DOCS_CATEGORY = 'Ownership & Identity Documents';
export const MUNICIPAL_DOCS_CATEGORY = 'Municipal Certificate of Occupancy';

export interface HandoverReadiness {
  inspectionCleared: boolean;
  defectsCleared: boolean;
  docsCleared: boolean;
  approvalsCleared: boolean;
  paymentCleared: boolean;
  isReadyForHandover: boolean;
}

/**
 * Single source of truth for "is this unit ready for handover" — every screen that
 * shows handover readiness (UnitDetail, HandoverWorkspace, CustomerHandover) must
 * derive it from this function instead of recomputing its own version, otherwise
 * different screens can disagree about the same unit's readiness.
 *
 * Status comparisons use the RAW backend slugs (documents/payments/defects rows
 * keep their backend status slugs — see api/normalize.ts + utils/statusMap.ts):
 *   document APPROVED, payment CLEARED, defect resolved/closed.
 */
export function computeHandoverReadiness(
  unit: Pick<Unit, 'inspectionStatus'>,
  documents: Pick<Document, 'category' | 'status'>[],
  payments: Pick<Payment, 'status'>[],
  defects: Pick<Defect, 'status'>[]
): HandoverReadiness {
  const ownershipDocs = documents.filter(d => d.category === OWNERSHIP_DOCS_CATEGORY);
  const municipalDocs = documents.filter(d => d.category === MUNICIPAL_DOCS_CATEGORY);

  const inspectionCleared = unit.inspectionStatus === 'Passed';
  const defectsCleared = defects.length > 0
    ? defects.every(d => DEFECT_RESOLVED_SLUGS.includes(d.status))
    : inspectionCleared;
  const docsCleared = ownershipDocs.length > 0 && ownershipDocs.every(d => d.status === DOCUMENT_APPROVED_SLUG);
  const approvalsCleared = municipalDocs.length > 0 && municipalDocs.every(d => d.status === DOCUMENT_APPROVED_SLUG);
  const paymentCleared = payments.length > 0 && payments.every(p => p.status === 'CLEARED');

  const isReadyForHandover = inspectionCleared && defectsCleared && docsCleared && approvalsCleared && paymentCleared;

  return { inspectionCleared, defectsCleared, docsCleared, approvalsCleared, paymentCleared, isReadyForHandover };
}
