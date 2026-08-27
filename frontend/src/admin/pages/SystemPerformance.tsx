import React from 'react';
import { PageHeader, AdminPanel, StatCard } from '../components/AdminUI';

const SystemPerformance: React.FC = () => {
  return (
    <div>
      <PageHeader 
        title="System Performance" 
        subtitle="Platform-level performance monitoring."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="SYSTEM AVAILABILITY" value="99.99%" trend={{ value: '0.01%', isUp: true }} />
        <StatCard title="API LATENCY" value="124ms" trend={{ value: '12ms', isUp: false }} />
        <StatCard title="ACTIVE CONNECTIONS" value="1,248" trend={{ value: '5%', isUp: true }} />
        <StatCard title="ERROR RATE" value="0.02%" trend={{ value: '0.01%', isUp: false }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <AdminPanel title="System Availability (Last 24 Hours)">
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFCFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)' }}>
             <div style={{ display: 'flex', gap: '4px', height: '120px', alignItems: 'flex-end', width: '80%', overflow: 'hidden' }}>
                {[...Array(48)].map((_, i) => (
                  <div key={i} style={{ 
                    flex: 1, 
                    backgroundColor: Math.random() > 0.95 ? '#F59E0B' : '#10B981', 
                    height: Math.random() > 0.95 ? `${Math.random() * 40 + 20}%` : '100%',
                    borderRadius: '2px 2px 0 0'
                  }}></div>
                ))}
             </div>
             <div style={{ marginTop: '16px', color: 'var(--admin-text-secondary)', fontSize: '12px' }}>Hourly Uptime Blocks</div>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
};

export default SystemPerformance;
