import { User, Defect, Document } from '../types';

/**
 * Centralized project-scoping rules. Every list/detail page and route guard
 * should import from here instead of re-deriving role checks inline.
 */
export function canAccessProject(user: User | null, projectId: string | undefined | null, projectBuilderId?: string): boolean {
  if (!user || !projectId) return false;

  // Backend roles arrive as UPPERCASE slugs (SUPER_ADMIN, BUILDER_OWNER, ...)
  // and the mock-era vocabulary was lowercase — normalize once, match both.
  const role = (user.role || '').toLowerCase();
  switch (role) {
    case 'super_admin':
      return true;
    case 'builder_admin':
    case 'builder_owner':
      return !projectBuilderId || projectBuilderId === user.builderId;
    case 'site_engineer':
    case 'accounts':
    case 'contractor':
      return (user.assignedProjectIds || []).includes(projectId);
    case 'customer':
      return user.projectId === projectId;
    default:
      return false;
  }
}

export function canAccessDefect(user: User | null, defect: Pick<Defect, 'projectId' | 'unitId' | 'builderId'> | null): boolean {
  if (!user || !defect) return false;
  if ((user.role || '').toLowerCase() === 'customer') return defect.unitId === user.unitId;
  return canAccessProject(user, defect.projectId, defect.builderId);
}

export function canAccessDocument(user: User | null, doc: Pick<Document, 'projectId' | 'customerId' | 'builderId'> | null): boolean {
  if (!user || !doc) return false;
  if ((user.role || '').toLowerCase() === 'customer') return doc.customerId === user.id;
  if (['builder_admin', 'builder_owner', 'super_admin'].includes((user.role || '').toLowerCase())) return canAccessProject(user, doc.projectId, doc.builderId);
  return canAccessProject(user, doc.projectId);
}
