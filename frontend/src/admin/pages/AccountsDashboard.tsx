import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, Activity, Building, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project, Unit, Customer, Payment } from '../../types';
import { projectsService } from '../../services/projectsService';
import { customersService } from '../../services/customersService';
import { paymentsService } from '../../services/paymentsService';;

const AccountsDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;

    const allProjects = projectsService.getProjects();
    const allCustomers = customersService.getCustomers();
    const allUnits = projectsService.getUnits();
    const allPayments = paymentsService.getPayments();

    const assignedIds = user.assignedProjectIds || [];

    const userProjects = allProjects.filter(p => assignedIds.includes(p.id));
    const userCustomers = allCustomers.filter(c => assignedIds.includes(c.projectId));
    const userUnits = allUnits.filter(u => assignedIds.includes(u.projectId));
    const userPayments = allPayments.filter(pay => {
      const unit = allUnits.find(u => u.id === pay.unitId);
      return unit && assignedIds.includes(unit.projectId);
    });

    setProjects(userProjects);
    setCustomers(userCustomers);
    setUnits(userUnits);
    setPayments(userPayments);
  }, [user]);

  const totalPayments = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const clearedPayments = payments.filter(p => p.status === 'Cleared').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending Verification' || p.status === 'Verified').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '48px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Accounts Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Overview of financials, customers, and payments across your assigned projects.
        </p>
      </div>

      {/* Metrics Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="metric-panel" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--admin-light-blue)', borderRadius: '8px', color: 'var(--admin-accent)' }}>
              <Building size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', margin: '0 0 8px 0', fontWeight: 500 }}>Assigned Projects</h3>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)' }}>{projects.length}</div>
        </div>

        <div className="metric-panel" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#FEF3C7', borderRadius: '8px', color: '#D97706' }}>
              <Users size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', margin: '0 0 8px 0', fontWeight: 500 }}>Customers</h3>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)' }}>{customers.length}</div>
        </div>

        <div className="metric-panel" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#D1FAE5', borderRadius: '8px', color: '#059669' }}>
              <CheckSquare size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', margin: '0 0 8px 0', fontWeight: 500 }}>Units</h3>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)' }}>{units.length}</div>
        </div>
      </div>

      {/* Metrics Row 2 (Payments) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IndianRupee size={18} color="var(--admin-accent)" /> Total Demanded
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)' }}>₹{totalPayments.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #10B981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px', backgroundColor: '#10B981' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#059669', margin: '0 0 16px 0' }}>
            Total Cleared
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)' }}>₹{clearedPayments.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #F59E0B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '4px', backgroundColor: '#F59E0B' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#D97706', margin: '0 0 16px 0' }}>
            Total Pending
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)' }}>₹{pendingPayments.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--admin-accent)" />
            Recent Payment Activity
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 10).map((payment) => {
                const unit = units.find(u => u.id === payment.unitId);
                const customer = customers.find(c => c.id === payment.customerId);
                return (
                  <tr key={payment.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--admin-navy)', fontWeight: 500 }}>
                      {unit?.name || '-'}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--admin-text-secondary)' }}>
                      {customer?.name || '-'}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--admin-navy)' }}>
                      {payment.title}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--admin-navy)', fontWeight: 500 }}>
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`status-badge status-badge--${payment.status === 'Cleared' ? 'success' : payment.status === 'Rejected' ? 'error' : 'warning'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
                    No payment records found for assigned projects.
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

export default AccountsDashboard;
