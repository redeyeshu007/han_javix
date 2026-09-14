import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download, Receipt, Wallet, ChevronRight, Activity, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, chargeService, paymentService, paymentRecordService } from '../../api/services';
import { User, Charge, Payment } from '../../types/models';
import { UnitWorkspace } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { UnitPaymentManagement } from '../components/UnitPaymentManagement';
import KPIOrb from '../components/KPIOrb';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerPayments: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<UnitWorkspace | null>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]); // Clearances
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]); // Transactions
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedChargeId, setSelectedChargeId] = useState<string | undefined>();
  const [selectedChargeAmount, setSelectedChargeAmount] = useState<number | undefined>();

  const openPaymentModalForCharge = (chargeId: string, amount: number) => {
    setSelectedChargeId(chargeId);
    setSelectedChargeAmount(amount);
    setShowPaymentModal(true);
  };

  const openPaymentModalGeneric = () => {
    setSelectedChargeId(undefined);
    setSelectedChargeAmount(undefined);
    setShowPaymentModal(true);
  };

  const fetchPayments = async () => {
    if (!user?.unitId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [data, allCharges, allPayments, allRecords] = await Promise.all([
        unitsApi.getWorkspace(user.unitId),
        chargeService.getCharges(undefined, user.unitId),
        paymentService.getPayments(user.unitId),
        paymentRecordService.getPaymentRecords(undefined, user.unitId)
      ]);
      setWorkspace(data);
      setCharges(allCharges);
      setPayments(allPayments);
      setPaymentRecords(allRecords);
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

  if (!workspace?.unit) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 bg-[#F8FAFC]">
        <Activity size={64} className="opacity-20 mb-6" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Payments Found</h3>
        <p className="text-slate-500">You have not been assigned to a property yet.</p>
      </div>
    );
  }

  const { unit } = workspace;
  const totalValue = charges.reduce((sum, c) => sum + c.amount, 0);
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(0, totalValue - amountPaid);

  const progressPercentage = totalValue > 0 ? (amountPaid / totalValue) * 100 : 0;

  // Combine charges and payments for the timeline/table
  const timelineItems = [
    ...charges.map(c => ({
      id: `charge-${c.id}`,
      originalId: c.id,
      type: 'charge',
      title: c.chargeType || (c as any).charge_type,
      date: c.dueDate || c.createdAt,
      amount: c.amount,
      status: c.status
    })),
    ...paymentRecords.map(p => ({
      id: `payment-${p.id}`,
      originalId: p.id,
      type: 'payment',
      title: 'Payment Received',
      date: p.paymentDate || p.createdAt,
      amount: p.amount,
      status: p.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
              My Payments
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Manage payments, download receipts, and track your property milestones.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {unit.paymentCleared ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-semibold text-[15px] shadow-sm">
                <CheckCircle2 size={18} /> Payments Cleared
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-semibold text-[15px] shadow-sm">
                <Wallet size={18} /> Balance Due
              </div>
            )}
            
            {(payments.length === 0 || outstanding > 0) && (
              <button
                onClick={openPaymentModalGeneric}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border-none font-semibold text-[15px] flex items-center gap-2 cursor-pointer transition-colors shadow-sm group"
              >
                Make Payment <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
          <KPIOrb 
            title="Total Property Value" 
            value={`₹${totalValue.toLocaleString('en-IN')}`} 
            icon={Home} 
            colorHex="#3B82F6"
            percentage={progressPercentage}
          />
          <KPIOrb 
            title="Amount Paid" 
            value={`₹${amountPaid.toLocaleString('en-IN')}`} 
            icon={CheckCircle2} 
            colorHex="#10B981"
          />
          <KPIOrb 
            title="Outstanding Balance" 
            value={`₹${outstanding.toLocaleString('en-IN')}`} 
            icon={Wallet} 
            colorHex="#F59E0B"
          />
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-2">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-slate-900 m-0 tracking-tight">Payment History</h2>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {timelineItems.map((item: any, idx: number) => (
                  <tr key={item.id} className={`${idx === timelineItems.length - 1 ? '' : 'border-b border-slate-100'} hover:bg-slate-50/50 transition-colors`}>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                          <Receipt size={20} className="text-slate-500" />
                        </div>
                        <div className="font-semibold text-slate-800 text-[15px]">{item.title}</div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-[14px] text-slate-500 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-5 px-6 text-[15px] text-slate-900 font-bold">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-5 px-6">
                      {item.status === 'CLEARED' || item.status === 'PAID' ? (
                        <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[13px] font-semibold shadow-sm">Paid</span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[13px] font-semibold shadow-sm">{friendlyStatus(item.status)}</span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      {item.type === 'payment' ? (
                        <button className="w-9 h-9 rounded-lg border border-slate-200 inline-flex items-center justify-center text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer shadow-sm ml-auto" title="Download Receipt">
                          <Download size={18} />
                        </button>
                      ) : (
                        (item.status !== 'PAID' && item.status !== 'CLEARED') ? (
                          <button 
                            onClick={() => openPaymentModalForCharge(item.originalId, item.amount)}
                            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] transition-colors ml-auto cursor-pointer"
                          >
                            Pay
                          </button>
                        ) : (
                          <span className="text-[13px] text-slate-400 font-medium">-</span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {timelineItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-16 px-8 text-slate-500">
                      <Receipt size={48} className="opacity-20 mx-auto mb-4 text-slate-400" />
                      <div className="text-lg font-semibold text-slate-800 mb-2">No payment records</div>
                      <div className="text-sm">Your payment milestones will appear here.</div>
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
          customerId={unit.customerId || ''}
          clearanceId={payments[0]?.id}
          chargeId={selectedChargeId}
          chargeAmount={selectedChargeAmount}
          onClose={() => setShowPaymentModal(false)}
          onRefresh={fetchPayments}
        />
      )}
      </div>
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
