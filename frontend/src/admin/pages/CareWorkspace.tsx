import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, Plus, Check } from 'lucide-react';
import { mockDb, ServiceRequest, Unit, Customer } from '../../services/mockDb';

const CareWorkspace: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadData = () => {
    setRequests(mockDb.getServiceRequests());
    setUnits(mockDb.getUnits());
    setCustomers(mockDb.getCustomers());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (id: string, status: ServiceRequest['status']) => {
    mockDb.updateServiceRequest(id, status);
    loadData();
  };

  const handleAssignContractor = (id: string, contractorId: string) => {
    mockDb.updateServiceRequest(id, 'Assign', contractorId);
    loadData();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Care & Warranty Desk</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Monitor Defect Liability Period (DLP) tickets and coordinate contractor repairs post-handover.
        </p>
      </div>

      {/* Grid of workorders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {requests.length > 0 ? (
          requests.map(req => {
            const unit = units.find(u => u.id === req.unitId);
            const customer = customers.find(c => c.id === req.customerId);

            return (
              <div key={req.id} style={{
                backgroundColor: 'white',
                border: '1px solid var(--admin-border)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(7, 26, 51, 0.01)'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                    TICKET {req.id} &bull; Unit {unit?.name || 'Unknown'}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '4px 0 8px 0' }}>{req.request}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                    Customer: <strong>{customer?.name}</strong> &bull; Date: <strong>{req.date}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span className="status-badge status-badge--warning" style={{ textTransform: 'capitalize' }}>
                    {req.status === 'Assign' ? 'Contractor Dispatched' : req.status}
                  </span>

                  {req.status === 'Request' && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                      onClick={() => handleAssignContractor(req.id, 'CON-001')}
                    >
                      Assign Contractor (Elite Tiling)
                    </button>
                  )}

                  {req.status === 'Assign' && (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 14px', fontSize: '12px', backgroundColor: '#1E3A8A' }}
                      onClick={() => handleUpdateStatus(req.id, 'Resolve')}
                    >
                      Resolve Workorder
                    </button>
                  )}

                  {req.status === 'Resolve' && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '8px 14px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(req.id, 'Customer confirmation')}
                    >
                      <Check size={14} /> Confirm Resolution
                    </button>
                  )}

                  {req.status === 'Customer confirmation' && (
                    <span style={{ fontSize: '12px', color: 'var(--admin-accent)', fontWeight: 600 }}>✓ Completed</span>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'var(--admin-text-secondary)' }}>
            <Wrench size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3>No active service requests</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default CareWorkspace;
