import { Unit, Document, Payment, Defect } from '../types';;

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
    ? defects.every(d => d.status === 'Resolved' || d.status === 'Closed')
    : inspectionCleared;
  const docsCleared = ownershipDocs.length > 0 && ownershipDocs.every(d => d.status === 'Verified');
  const approvalsCleared = municipalDocs.length > 0 && municipalDocs.every(d => d.status === 'Verified');
  const paymentCleared = payments.length > 0 && payments.every(p => p.status === 'Cleared');

  const isReadyForHandover = inspectionCleared && defectsCleared && docsCleared && approvalsCleared && paymentCleared;

  return { inspectionCleared, defectsCleared, docsCleared, approvalsCleared, paymentCleared, isReadyForHandover };
}
