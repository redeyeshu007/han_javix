import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { apiClient } from '../api/client';

interface ProjectAccessGuardProps {
  children: React.ReactNode;
  type: 'project' | 'unit';
}

/**
 * Wraps project-scoped detail routes (/builder/projects/:id, /builder/units/:id).
 *
 * Strategy: Ask the backend directly. The backend already enforces tenant isolation
 * via get_queryset. If the API returns 200, the user is allowed. If 403 or 404,
 * show Access Denied. This is the single source of truth — no mock stores.
 */
const ProjectAccessGuard: React.FC<ProjectAccessGuardProps> = ({ children, type }) => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    if (!id) {
      setStatus('denied');
      return;
    }

    const endpoint = type === 'project'
      ? `/projects/projects/${id}/`
      : `/projects/units/${id}/`;

    apiClient.get(endpoint)
      .then(() => setStatus('allowed'))
      .catch((err) => {
        const code = err?.response?.status;
        // 403 = forbidden, 404 = not found (also effectively access denied for this tenant)
        if (code === 403 || code === 404) {
          setStatus('denied');
        } else {
          // Network error or 5xx — still allow render so the page itself can show an error
          setStatus('allowed');
        }
      });
  }, [id, type]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid #E2E8F0', borderTopColor: '#2563EB',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', height: '60vh', textAlign: 'center'
      }}>
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
