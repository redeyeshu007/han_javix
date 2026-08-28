import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download, Receipt, Wallet, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, paymentService } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { UnitPaymentManagement } from '../components/UnitPaymentManagement';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerPayments: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchPayments = async () => {
    if (!user) return;
    try {
      const units = await unitsApi.getUnits(user.projectId || '');
      const activeUnit = units.find((u: any) => u.id === user.unitId);
      if (activeUnit) {
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

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <PageLoading />;

  const totalValue = payments.reduce((sum, p) => sum + p.amount, 0);
  const amountPaid = payments.filter(p => p.status === 'Cleared').reduce((sum, p) => sum + p.amount, 0);
  const outstanding = totalValue - amountPaid;

  const progressPercentage = totalValue > 0 ? (amountPaid / totalValue) * 100 : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            My Payments
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage payments, download receipts, and track your property milestones.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {unit?.paymentCleared ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', color: '#065F46', fontWeight: 600, fontSize: '14px' }}>
              <CheckCircle2 size={18} /> Payments Cleared
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', color: '#92400E', fontWeight: 600, fontSize: '14px' }}>
              <Wallet size={18} /> Balance Due
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Total Value */}
        <div style={{ backgroundColor: '#0F172A', borderRadius: '20px', padding: '32px', color: '#FFFFFF', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.4)' }}>
          <div style={{ position: 'absolute', top: '-24px', right: '-24px', opacity: 0.1 }}>
            <Building2 size={120} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Property Value</div>
            <div style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>${totalValue.toLocaleString()}</div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#F8FAFC' }}>
                <span>Paid: {progressPercentage.toFixed(0)}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: '#3B82F6', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Amount Paid */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} color="#10B981" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Paid</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981', letterSpacing: '-0.02em' }}>${amountPaid.toLocaleString()}</div>
        </div>

        {/* Outstanding */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={24} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Balance</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>${outstanding.toLocaleString()}</div>
          {(payments.length === 0 || outstanding > 0) && (
            <button
              onClick={() => setShowPaymentModal(true)}
              style={{ marginTop: '16px', padding: '10px 16px', backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              Make Payment <ChevronRight size={16} />
            </button>
          )}
        </div>

      </div>

      {/* Transaction History */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Payment History</h2>
        </div>
        
        <div style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr key={payment.id} style={{ borderBottom: idx === payments.length - 1 ? 'none' : '1px solid #E2E8F0' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Receipt size={20} color="#64748B" />
                      </div>
                      <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '15px' }}>{payment.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                    {payment.dueDate}
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '15px', color: '#0F172A', fontWeight: 700 }}>
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {payment.status === 'Cleared' ? (
                      <span style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#065F46', fontSize: '13px', fontWeight: 600 }}>Paid</span>
                    ) : (
                      <span style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#FFFBEB', color: '#92400E', fontSize: '13px', fontWeight: 600 }}>{friendlyStatus(payment.status)}</span>
                    )}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    {payment.status === 'Cleared' ? (
                      <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', backgroundColor: '#FFFFFF', transition: 'all 0.2s', cursor: 'pointer' }} title="Download Receipt">
                        <Download size={18} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '64px', color: '#64748B' }}>
                    <Receipt size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>No payment records</div>
                    <div style={{ fontSize: '14px' }}>Your payment milestones will appear here.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && unit && (
        <UnitPaymentManagement
          unitId={unit.id}
          projectId={unit.projectId}
          customerId={unit.customerId}
          onClose={() => setShowPaymentModal(false)}
          onRefresh={fetchPayments}
        />
      )}
    </div>
  );
};

// Simple icon for the dashboard card
const Building2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);

export default CustomerPayments;
