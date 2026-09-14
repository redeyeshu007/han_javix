import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project, Unit, Customer, Payment } from '../../types';
import { projectsApi, customersApi, paymentService, unitsApi } from '../../api/services';
import { statusLabel } from '../../utils/statusMap';

const AccountsFinancialClearance: React.FC = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clearances, setClearances] = useState<Payment[]>([]); // PaymentClearances
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [allProjects, allUnits, allCustomers, allPayments] = await Promise.all([
        projectsApi.getProjects(),
        unitsApi.getUnits(),
        customersApi.getCustomers(),
        paymentService.getPayments(),
      ]);
      setProjects(allProjects);
      setUnits(allUnits);
      setCustomers(allCustomers);
      setClearances(allPayments);
    };
    load();
  }, [user]);

  const filteredClearances = clearances.filter(clearance => {
    const unit = units.find(u => u.id === clearance.unitId);
    const customer = customers.find(c => c.id === clearance.customerId);
    const searchStr = `${unit?.name} ${customer?.name}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Financial Clearance</h1>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
            Track overall financial readiness and handover clearance status by unit.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by unit or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', border: '1px solid var(--admin-border)', padding: '10px 16px', borderRadius: '8px', color: 'var(--admin-navy)', fontWeight: 500, cursor: 'pointer' }}>
            <Filter size={18} />
            Filter
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Demanded</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cleared</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pending</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clearance Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClearances.map(clearance => {
                const unit = units.find(u => u.id === clearance.unitId);
                const customer = customers.find(c => c.id === clearance.customerId);
                
                return (
                  <tr key={clearance.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--admin-navy)' }}>{unit?.name || 'Unknown Unit'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>{unit?.blockName || ''}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--admin-navy)' }}>{customer?.name || 'No Customer'}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--admin-navy)', fontWeight: 500 }}>
                      ₹{clearance.unitAmount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#10B981', fontWeight: 600 }}>
                      ₹{clearance.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#F59E0B', fontWeight: 600 }}>
                      ₹{clearance.pendingAmount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`status-badge status-badge--${clearance.status === 'CLEARED' ? 'success' : clearance.status === 'ON_HOLD' ? 'error' : clearance.status === 'PARTIALLY_CLEARED' ? 'warning' : 'default'}`}>
                        {statusLabel('payment', clearance.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button style={{ backgroundColor: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-navy)', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} />
                        View ledger
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredClearances.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
                    No financial clearances found for assigned projects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsFinancialClearance;
