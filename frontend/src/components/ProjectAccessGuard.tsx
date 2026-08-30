import React from 'react';
import { useParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectsService } from '../services/projectsService';;
import { canAccessProject } from '../utils/access';

interface ProjectAccessGuardProps {
  children: React.ReactNode;
  type: 'project' | 'unit';
}

/**
 * Wraps project-scoped detail routes (/admin/projects/:id, /admin/units/:id).
 * Re-evaluates on every render, so it also blocks the browser back button and
 * refresh, not just the initial navigation.
 */
const ProjectAccessGuard: React.FC<ProjectAccessGuardProps> = ({ children, type }) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  let projectId: string | undefined;
  let projectBuilderId: string | undefined;

  if (id) {
    if (type === 'project') {
      const project = projectsService.getProjects().find(p => p.id === id);
      projectId = project?.id;
      projectBuilderId = project?.builderId;
    } else {
      const unit = projectsService.getUnits().find(u => u.id === id);
      projectId = unit?.projectId;
      projectBuilderId = unit?.builderId;
    }
  }

  const allowed = canAccessProject(user, projectId, projectBuilderId);

  if (!allowed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', textAlign: 'center' }}>
        <ShieldAlert size={40} color="#DC2626" style={{ marginBottom: '16px' }} />
        <h1 style={{ color: 'var(--admin-navy)', marginBottom: '8px' }}>Access Denied</h1>
        <p style={{ color: 'var(--admin-text-secondary)' }}>
          You do not have permission to view this {type}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProjectAccessGuard;
