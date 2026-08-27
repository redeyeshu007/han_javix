import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  CheckSquare, 
  FileText, 
  LayoutTemplate,
  MessageSquare,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeBuilders: 0,
    activeProjects: 0,
    unitsInHandover: 0,
    openSupport: 0
  });
  
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { dashboardApi } = await import('../../api/services');
        const data = await dashboardApi.getStats();
        setStats(data.stats || stats);
        setActivities(data.recentActivity || []);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '32px' }}>
      
      {/* 1. DASHBOARD HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>
            Good morning, Admin
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--admin-text-secondary)', margin: 0 }}>
            Here's what's happening across your platform.
          </p>
        </div>
        <Link to="/admin/builders/new" className="btn btn-primary">
          <Plus size={16} /> Add Builder
        </Link>
      </div>

      {/* 2. MANAGE HANDOVERLY */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">MANAGE HANDOVERLY</h2>
        <div className="action-tiles-grid">
          
          <Link to="/admin/builders" className="action-tile">
            <div className="action-tile__top">
              <Building2 className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Builders</h3>
              <p className="action-tile__desc">{stats.activeBuilders} active companies</p>
            </div>
          </Link>

          <Link to="/admin/accounts" className="action-tile">
            <div className="action-tile__top">
              <Users className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Accounts</h3>
              <p className="action-tile__desc">Manage users</p>
            </div>
          </Link>

          <Link to="/admin/plans" className="action-tile">
            <div className="action-tile__top">
              <CreditCard className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Plans</h3>
              <p className="action-tile__desc">Manage plans</p>
            </div>
          </Link>

          <Link to="/admin/checklists" className="action-tile">
            <div className="action-tile__top">
              <CheckSquare className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Checklists</h3>
              <p className="action-tile__desc">Manage standards</p>
            </div>
          </Link>

          <Link to="/admin/documents" className="action-tile">
            <div className="action-tile__top">
              <FileText className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Documents</h3>
              <p className="action-tile__desc">Manage categories</p>
            </div>
          </Link>

          <Link to="/admin/templates" className="action-tile">
            <div className="action-tile__top">
              <LayoutTemplate className="action-tile__icon" size={20} />
              <ArrowRight className="action-tile__arrow" size={16} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Templates</h3>
              <p className="action-tile__desc">Industry templates</p>
            </div>
          </Link>

          {/* Support Wide Tile */}
          <Link to="/admin/support" className="action-tile wide">
            <div className="action-tile__top" style={{ marginBottom: 0 }}>
              <MessageSquare className="action-tile__icon" size={20} />
            </div>
            <div className="action-tile__bottom">
              <h3 className="action-tile__title">Support</h3>
              <p className="action-tile__desc" style={{ color: 'var(--admin-accent)', fontWeight: 500 }}>
                {stats.openSupport} open requests need attention
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: 'var(--admin-text-secondary)' }}>
              View <ArrowRight className="action-tile__arrow" size={16} />
            </div>
          </Link>
          
        </div>
      </div>

      {/* 3. NEEDS YOUR ATTENTION */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">NEEDS YOUR ATTENTION</h2>
        <div className="attention-section">
          <div className="attention-list">
            <Link to="/admin/builders" className="attention-list__item">
              <div className="attention-list__item-left">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--admin-navy)' }} />
                <span>0 builder accounts need review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--admin-text-secondary)', fontSize: '13px' }}>
                Review <ArrowRight size={16} />
              </div>
            </Link>
            <Link to="/admin/support" className="attention-list__item">
              <div className="attention-list__item-left">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--admin-accent)' }} />
                <span>{stats.openSupport} support requests waiting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--admin-text-secondary)', fontSize: '13px' }}>
                View <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. PLATFORM OVERVIEW */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="section-title">PLATFORM OVERVIEW</h2>
        <div className="metric-panel">
          <div className="metric-item">
            <div className="metric-item__value">{stats.activeBuilders}</div>
            <div className="metric-item__label">Builders</div>
          </div>
          <div className="metric-item">
            <div className="metric-item__value">{stats.activeProjects}</div>
            <div className="metric-item__label">Projects</div>
          </div>
          <div className="metric-item">
            <div className="metric-item__value">{stats.unitsInHandover.toLocaleString()}</div>
            <div className="metric-item__label">Units</div>
          </div>
          <div className="metric-item">
            <div className="metric-item__value">{stats.openSupport}</div>
            <div className="metric-item__label">Support</div>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY & HEALTH */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>RECENT ACTIVITY</h2>
            <Link to="/admin/activity" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-accent)', textDecoration: 'none' }}>
              View all &rarr;
            </Link>
          </div>
          <div style={{ backgroundColor: 'var(--admin-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 8px rgba(7, 26, 51, 0.02)' }}>
            {activities.length > 0 ? (
              <div className="timeline">
                {activities.map((activity: any, index) => (
                  <div className="timeline-item" key={index}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-navy)' }}>{activity.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{activity.description}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--admin-text-secondary)', padding: '12px' }}>
                No recent activity.
              </div>
            )}
          </div>
        </div>
        
        <div style={{ flex: '1 1 250px' }}>
          <h2 className="section-title">PLATFORM STATUS</h2>
          <div style={{ backgroundColor: 'var(--admin-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 8px rgba(7, 26, 51, 0.02)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--admin-accent)', boxShadow: '0 0 0 3px var(--admin-light-blue)' }} />
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-navy)' }}>All systems operational</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
