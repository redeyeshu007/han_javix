import React, { useState, useEffect } from 'react';
import { Home, FileText, CreditCard, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { projectsApi, unitsApi, defectsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import '../admin.css';

const CustomerDashboard: React.FC = () => {
  const { activeProjectId } = useRole();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [openIssues, setOpenIssues] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projects, units, defects] = await Promise.all([
          projectsApi.getProjects(),
          unitsApi.getUnits(activeProjectId),
          defectsApi.getDefects(activeProjectId)
        ]);

        const currentProject = projects.find(p => p.id === activeProjectId);
        setProject(currentProject || projects[0]);

        // Just take the first unit in the project for the demo
        const myUnit = units[0];
        setUnit(myUnit);

        if (myUnit) {
          const myDefects = defects.filter(d => d.unitId === myUnit.id && d.status !== 'Closed');
          setOpenIssues(myDefects.length);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeProjectId]);

  if (loading) return <PageLoading />;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Welcome Home, Priya!</h1>
          <p className="admin-page__subtitle">Here is the latest status on your new property.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card__icon"><Home size={24} /></div>
          <div className="stat-card__content">
            <h3 className="stat-card__title">My Home</h3>
            <p className="stat-card__value">{unit?.name || 'Loading...'}</p>
            <p className="stat-card__subtitle">{project?.name}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon"><AlertCircle size={24} /></div>
          <div className="stat-card__content">
            <h3 className="stat-card__title">Handover Status</h3>
            <p className="stat-card__value" style={{ color: unit?.status === 'Handed Over' ? '#10B981' : '#F59E0B' }}>
              {unit?.status === 'Handed Over' ? 'Complete' : 'In Progress'}
            </p>
            <p className="stat-card__subtitle">Possession Date: TBD</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon"><MessageSquare size={24} /></div>
          <div className="stat-card__content">
            <h3 className="stat-card__title">Open Issues</h3>
            <p className="stat-card__value">{openIssues}</p>
            <p className="stat-card__subtitle">Currently being resolved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon"><Calendar size={24} /></div>
          <div className="stat-card__content">
            <h3 className="stat-card__title">Next Appointment</h3>
            <p className="stat-card__value">None</p>
            <p className="stat-card__subtitle">No scheduled visits</p>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '24px' }}>
        <h3 className="admin-card__title">Readiness Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} color={unit?.docsCleared ? '#10B981' : '#94A3B8'} />
              <div>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>Documents & Agreements</div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>Registration and legal paperwork</div>
              </div>
            </div>
            <div>
              {unit?.docsCleared ? (
                <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '12px', fontWeight: 600 }}>Complete</span>
              ) : (
                <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '12px', fontWeight: 600 }}>Pending</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={20} color={unit?.paymentCleared ? '#10B981' : '#94A3B8'} />
              <div>
                <div style={{ fontWeight: 600, color: '#1E293B' }}>Payment Clearance</div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>Final dues and possession charges</div>
              </div>
            </div>
            <div>
              {unit?.paymentCleared ? (
                <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '12px', fontWeight: 600 }}>Cleared</span>
              ) : (
                <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '12px', fontWeight: 600 }}>Pending</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
