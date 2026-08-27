import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ChevronRight } from 'lucide-react';
import { mockDb, Customer, Unit } from '../../services/mockDb';

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCustomers(mockDb.getCustomers());
    setUnits(mockDb.getUnits());
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Customers</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Directories of homebuyers, contract associations, and key handovers.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--admin-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '0 12px', backgroundColor: 'var(--admin-bg)' }}>
          <Search size={18} color="#718096" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px 0', outline: 'none', color: 'var(--admin-navy)', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length > 0 ? (
          filtered.map(c => {
            const unit = units.find(u => u.id === c.unitId);
            
            return (
              <div key={c.id} style={{
                backgroundColor: 'white',
                border: '1px solid var(--admin-border)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--admin-light-blue)',
                    color: 'var(--admin-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{c.name}</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                      <span>Email: <strong>{c.email}</strong></span>
                      <span>Phone: <strong>{c.phone}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  {unit ? (
                    <Link to={`/admin/units/${unit.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ padding: '6px 12px', border: '1px solid var(--admin-border)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-accent)', backgroundColor: '#FAFCFF' }}>
                        Unit {unit.name}
                      </div>
                    </Link>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>No Unit Assigned</span>
                  )}

                  <span className={`status-badge status-badge--${
                    c.handoverStatus === 'Complete' ? 'neutral' : c.handoverStatus === 'Accepted' ? 'success' : 'warning'
                  }`}>
                    {c.handoverStatus}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'var(--admin-text-secondary)' }}>
            <User size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3>No customers found</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomersList;
