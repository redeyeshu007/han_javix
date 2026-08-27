import React, { useState, useEffect } from 'react';
import { PageHeader, AdminPanel } from '../components/AdminUI';
import { buildersApi, projectsApi, customersApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';

const PlatformUsage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ builders: 0, projects: 0, customers: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [b, p, c] = await Promise.all([
          buildersApi.getBuilders(),
          projectsApi.getProjects(),
          customersApi.getCustomers()
        ]);
        setStats({ builders: b.length, projects: p.length, customers: c.length });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <PageLoading message="Loading platform analytics..." />;

  return (
    <div>
      <PageHeader 
        title="Platform Usage" 
        subtitle="Analytics and adoption metrics across all clients."
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <AdminPanel title="Global Platform Reach">
          <div style={{ display: 'flex', gap: '32px', padding: '24px', backgroundColor: '#FAFCFF', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>Total Registered Builders</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)' }}>{stats.builders}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>Active Projects</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)' }}>{stats.projects}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>Homebuyers Onboarded</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)' }}>{stats.customers}</div>
            </div>
          </div>
        </AdminPanel>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <AdminPanel title="Activity Chart (Last 30 Days)">
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFCFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)' }}>
              <div style={{ color: 'var(--admin-text-secondary)', display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                <div style={{ width: '40px', height: '40%', backgroundColor: '#2563EB', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '40px', height: '60%', backgroundColor: '#2563EB', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '40px', height: '100%', backgroundColor: '#2563EB', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '40px', height: '80%', backgroundColor: '#2563EB', borderRadius: '4px 4px 0 0' }}></div>
              </div>
            </div>
          </AdminPanel>
          <AdminPanel title="Feature Adoption">
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFCFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)' }}>
              <ul style={{ listStyle: 'none', padding: 0, width: '80%' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span>Defect Logging</span> <strong>98%</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span>Contractor Board</span> <strong>85%</strong></li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span>Care Requests</span> <strong>45%</strong></li>
              </ul>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
};

export default PlatformUsage;
