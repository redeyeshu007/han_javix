import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Grid, Layers, Activity } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { projectsApi, unitsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import '../admin.css';

const CustomerHome: React.FC = () => {
  const { activeProjectId } = useRole();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [projects, units] = await Promise.all([
          projectsApi.getProjects(),
          unitsApi.getUnits(activeProjectId)
        ]);
        const currentProject = projects.find(p => p.id === activeProjectId);
        setProject(currentProject || projects[0]);
        setUnit(units[0]);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [activeProjectId]);

  if (loading) return <PageLoading />;
  if (!unit) return <div className="admin-page">No unit found.</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">My Home Details</h1>
          <p className="admin-page__subtitle">View your property configuration and details.</p>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{
            width: '120px', height: '120px', backgroundColor: '#E2E8F0', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8'
          }}>
            <Building2 size={48} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#1E293B', fontSize: '24px' }}>{unit.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', marginBottom: '16px' }}>
              <MapPin size={16} />
              <span>{project?.name} - {unit.block} Block</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> Floor
                </div>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>{unit.floor || 'N/A'}</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Grid size={14} /> Unit Name
                </div>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>{unit.name}</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} /> Status
                </div>
                <div style={{ fontWeight: 600, color: '#10B981' }}>{unit.status}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
