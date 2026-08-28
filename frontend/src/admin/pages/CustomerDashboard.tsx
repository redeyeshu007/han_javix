import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, MessageSquare, ArrowRight, CheckCircle2, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectsApi, unitsApi, defectsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { Link } from 'react-router-dom';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [openIssues, setOpenIssues] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const [projects, units, defects] = await Promise.all([
          projectsApi.getProjects(),
          unitsApi.getUnits(user.projectId || ''),
          defectsApi.getDefects(user.projectId || '')
        ]);

        const currentProject = projects.find(p => p.id === user.projectId);
        setProject(currentProject);

        const myUnit = units.find((u: any) => u.id === user.unitId) || null;
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
  }, [user]);

  if (loading) return <PageLoading />;

  // Dynamic Next Action based on unit status
  let nextAction = {
    title: 'Await Inspection',
    description: 'We are preparing your property for inspection.',
    link: '/admin/customer-home',
    color: 'var(--admin-accent)',
    ready: false
  };

  if (unit?.inspectionStatus === 'Failed' || openIssues > 0) {
    nextAction = {
      title: 'Review Open Issues',
      description: 'Some issues require your attention or are being resolved by our team.',
      link: '/admin/customer-issues',
      color: '#F59E0B',
      ready: true
    };
  } else if (!unit?.paymentCleared) {
    nextAction = {
      title: 'Clear Final Payments',
      description: 'Your final payment is required before possession.',
      link: '/admin/customer-payments',
      color: '#EF4444',
      ready: true
    };
  } else if (!unit?.docsCleared) {
    nextAction = {
      title: 'Sign Documents',
      description: 'Please complete your registration documents.',
      link: '/admin/customer-documents',
      color: '#8B5CF6',
      ready: true
    };
  } else if (unit?.docsCleared && unit?.paymentCleared && unit?.inspectionStatus === 'Passed') {
    nextAction = {
      title: 'Ready for Handover',
      description: 'Congratulations! Your property is ready for key handover.',
      link: '/admin/customer-handover',
      color: '#10B981',
      ready: true
    };
  }

  const steps = [
    { label: 'Booking', completed: true },
    { label: 'Construction', completed: true },
    { label: 'Inspection', completed: unit?.inspectionStatus === 'Passed' },
    { label: 'Clearance', completed: unit?.docsCleared && unit?.paymentCleared },
    { label: 'Possession', completed: unit?.keysHandedOver }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '32px' }}>
      
      {/* 1. DASHBOARD HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="page-header__subtitle">
            Here is the latest status on {unit?.name} • {project?.name}
          </p>
        </div>
      </div>

      {/* 2. PROPERTY OVERVIEW */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">PROPERTY OVERVIEW</h2>
        <div className="metric-panel">
          <div className="metric-item">
            <div className="metric-item__value" style={{ fontSize: '20px', color: unit?.inspectionStatus === 'Passed' ? '#10B981' : '#F59E0B' }}>
              {friendlyStatus(unit?.inspectionStatus)}
            </div>
            <div className="metric-item__label">Quality Check</div>
          </div>
          <div className="metric-item">
            <div className="metric-item__value" style={{ fontSize: '20px', color: openIssues === 0 ? '#10B981' : '#EF4444' }}>
              {openIssues} Open
            </div>
            <div className="metric-item__label">Reported Issues</div>
          </div>
          <div className="metric-item">
            <div className="metric-item__value" style={{ fontSize: '20px', color: unit?.docsCleared ? '#10B981' : '#F59E0B' }}>
              {unit?.docsCleared ? 'Cleared' : 'Pending'}
            </div>
            <div className="metric-item__label">Documents</div>
          </div>
          <div className="metric-item">
            <div className="metric-item__value" style={{ fontSize: '20px', color: unit?.paymentCleared ? '#10B981' : '#EF4444' }}>
              {unit?.paymentCleared ? 'Cleared' : 'Balance Due'}
            </div>
            <div className="metric-item__label">Payments</div>
          </div>
        </div>
      </div>

      {/* 3. NEEDS YOUR ATTENTION */}
      {nextAction.ready && (
        <div style={{ marginBottom: '32px' }}>
          <h2 className="section-title">NEEDS YOUR ATTENTION</h2>
          <div className="attention-section">
            <div className="attention-list">
              <Link to={nextAction.link} className="attention-list__item">
                <div className="attention-list__item-left">
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: nextAction.color }} />
                  <span>{nextAction.title}: {nextAction.description}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--admin-text-secondary)', fontSize: '13px' }}>
                  Action Required <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. MANAGE PROPERTY */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">MANAGE PROPERTY</h2>
        <div className="action-tiles-grid">
          
          <Link to="/admin/customer-inspection" className="action-tile">
            <div className="action-tile__top">
              <CheckSquare className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Inspections</h3>
              <p className="action-tile__desc">Quality check status</p>
            </div>
          </Link>

          <Link to="/admin/customer-issues" className="action-tile">
            <div className="action-tile__top">
              <MessageSquare className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Issues</h3>
              <p className="action-tile__desc">Track things you've reported</p>
            </div>
          </Link>

          <Link to="/admin/customer-documents" className="action-tile">
            <div className="action-tile__top">
              <FileText className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Documents</h3>
              <p className="action-tile__desc">Legal & agreements</p>
            </div>
          </Link>

          <Link to="/admin/customer-payments" className="action-tile">
            <div className="action-tile__top">
              <CreditCard className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Payments</h3>
              <p className="action-tile__desc">Financial history</p>
            </div>
          </Link>

        </div>
      </div>

      {/* 5. PROPERTY PROGRESS TIMELINE */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">YOUR PROGRESS</h2>
        <div style={{ backgroundColor: 'var(--admin-surface)', padding: '32px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 8px rgba(7, 26, 51, 0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>Current Stage</div>
              <div style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569', display: 'inline-block' }}>
                {friendlyStatus(unit?.status)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '48px', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', backgroundColor: 'var(--admin-border)', zIndex: 0 }} />
            
            {steps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1, flex: 1 }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: step.completed ? 'var(--admin-accent)' : 'var(--admin-surface)',
                  border: step.completed ? 'none' : '2px solid var(--admin-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {step.completed && <CheckCircle2 size={16} color="#FFFFFF" />}
                </div>
                <div style={{ fontSize: '13px', fontWeight: step.completed ? 600 : 500, color: step.completed ? 'var(--admin-navy)' : 'var(--admin-text-secondary)' }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
