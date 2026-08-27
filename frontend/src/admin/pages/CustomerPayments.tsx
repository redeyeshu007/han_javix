import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, FileText, Download } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { unitsApi, paymentService } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import '../admin.css';

const CustomerPayments: React.FC = () => {
  const { activeProjectId } = useRole();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const units = await unitsApi.getUnits(activeProjectId);
        if (units.length > 0) {
          const activeUnit = units[0];
          setUnit(activeUnit);
          const unitPayments = await paymentService.getPayments(activeUnit.id);
          setPayments(unitPayments);
        }
      } catch (error) {
        console.error('Error fetching payments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [activeProjectId]);

  if (loading) return <PageLoading />;

  const totalValue = payments.reduce((sum, p) => sum + p.amount, 0);
  const amountPaid = payments.filter(p => p.status === 'Cleared').reduce((sum, p) => sum + p.amount, 0);
  const outstanding = totalValue - amountPaid;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">My Payments</h1>
          <p className="admin-page__subtitle">Review your payment milestones and transaction history.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="admin-card" style={{ backgroundColor: '#1E293B', color: 'white' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#94A3B8' }}>Total Property Value</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>${totalValue.toLocaleString()}</p>
        </div>
        <div className="admin-card">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748B' }}>Amount Paid</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#10B981' }}>${amountPaid.toLocaleString()}</p>
        </div>
        <div className="admin-card">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748B' }}>Outstanding Balance</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1E293B' }}>${outstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="admin-card__title" style={{ margin: 0 }}>Payment Status</h3>
          {unit?.paymentCleared ? (
            <span style={{ padding: '6px 12px', borderRadius: '16px', backgroundColor: '#D1FAE5', color: '#065F46', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> All Payments Cleared
            </span>
          ) : (
            <span style={{ padding: '6px 12px', borderRadius: '16px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '13px', fontWeight: 600 }}>
              Payment Pending
            </span>
          )}
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: 500 }}>{payment.title}</td>
                  <td>{payment.dueDate}</td>
                  <td>${payment.amount.toLocaleString()}</td>
                  <td>
                    {payment.status === 'Cleared' ? (
                      <span style={{ color: '#10B981', fontWeight: 600 }}>Paid</span>
                    ) : (
                      <span style={{ color: '#F59E0B', fontWeight: 600 }}>{payment.status}</span>
                    )}
                  </td>
                  <td>
                    {payment.status === 'Cleared' ? <button className="icon-button"><Download size={16} /></button> : '-'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748B' }}>No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;
