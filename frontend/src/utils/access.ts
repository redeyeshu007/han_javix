import { User, Defect, Document } from '../services/mockDb';

/**
 * Centralized project-scoping rules. Every list/detail page and route guard
 * should import from here instead of re-deriving role checks inline.
 */
export function canAccessProject(user: User | null, projectId: string | undefined | null, projectBuilderId?: string): boolean {
  if (!user || !projectId) return false;

  switch (user.role) {
    case 'super_admin':
      return true;
    case 'builder_admin':
      return !projectBuilderId || projectBuilderId === user.builderId;
    case 'project_manager':
    case 'site_engineer':
    case 'crm':
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
  if (user.role === 'customer') return defect.unitId === user.unitId;
  return canAccessProject(user, defect.projectId, defect.builderId);
}

export function canAccessDocument(user: User | null, doc: Pick<Document, 'projectId' | 'customerId' | 'builderId'> | null): boolean {
  if (!user || !doc) return false;
  if (user.role === 'customer') return doc.customerId === user.id;
  if (user.role === 'builder_admin' || user.role === 'super_admin') return canAccessProject(user, doc.projectId, doc.builderId);
  return canAccessProject(user, doc.projectId);
}
