import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, FileText, CreditCard, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Unit, Customer, Payment } from '../../types';
import { unitsApi, customersApi, paymentService, chargeService, paymentRecordService } from '../../api/services';
import CreateChargeModal from '../components/Accounts/CreateChargeModal';

const AccountsPayments: React.FC = () => {
  const { user } = useAuth();
  
  const [payments, setPayments] = useState<Payment[]>([]); // These are PaymentClearances
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]); // Payment Transactions
  const [charges, setCharges] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'charges' | 'verifications'>('charges');

  const [searchTerm, setSearchTerm] = useState('');
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  
  // Review Modal State
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!selectedRecord) return;
    setIsProcessing(true);
    try {
      await paymentRecordService.approvePaymentRecord(selectedRecord.id);
      setPaymentRecords(await paymentRecordService.getPaymentRecords());
      setPayments(await paymentService.getPayments());
      setSelectedRecord(null);
    } catch (e) {
      console.error(e);
      alert('Failed to approve payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord || !rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setIsProcessing(true);
    try {
      await paymentRecordService.rejectPaymentRecord(selectedRecord.id, rejectReason);
      setPaymentRecords(await paymentRecordService.getPaymentRecords());
      setSelectedRecord(null);
      setRejectReason('');
    } catch (e) {
      console.error(e);
      alert('Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [allPayments, allCharges, allRecords, allUnits] = await Promise.all([
        paymentService.getPayments(),
        chargeService.getCharges(),
        paymentRecordService.getPaymentRecords(),
        unitsApi.getProjectUnitsLite()
      ]);
      setPayments(allPayments);
      setCharges(allCharges);
      setPaymentRecords(allRecords);
      setUnits(allUnits);
    };
    load();
  }, [user]);

  const filteredCharges = charges.filter(charge => {
    const unitNo = charge.unitDetails?.unit_number || '';
    const custName = charge.unitDetails?.customer_name || '';
    const searchStr = `${unitNo} ${custName} ${charge.chargeType}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const filteredRecords = paymentRecords.filter(record => {
    const unitNo = record.unitDetails?.unit_number || '';
    const custName = record.unitDetails?.customer_name || '';
    const searchStr = `${unitNo} ${custName} ${record.status}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Payments Workspace</h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Manage charges, installments, and verify received payments.
            </p>
          </div>
          <button
            onClick={() => setChargeModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-[14px] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create Charge
          </button>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by unit, customer, or charge type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              />
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-1.5 rounded-md font-medium text-[13px] transition-colors shadow-sm">
              <Filter size={16} />
              Filter
            </button>
          </div>
          <div className="border-b border-slate-200 px-4 flex gap-6">
            <button
              onClick={() => setActiveTab('charges')}
              className={`py-3 text-[13px] font-semibold border-b-2 transition-colors ${activeTab === 'charges' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Charges Due
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`py-3 text-[13px] font-semibold border-b-2 transition-colors ${activeTab === 'verifications' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Payment Verifications
              {paymentRecords.filter(r => r.status === 'PENDING_VERIFICATION').length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[11px]">
                  {paymentRecords.filter(r => r.status === 'PENDING_VERIFICATION').length}
                </span>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Unit & Customer</th>
                  <th className="px-5 py-3">Charge Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'charges' && filteredCharges.map(charge => (
                    <tr key={charge.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A] text-[13px]">{charge.unitDetails?.unit_number || 'Unknown Unit'}</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">{charge.unitDetails?.customer_name || 'No Customer'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 font-medium text-slate-700 text-[13px]">
                          <FileText size={14} className="text-blue-500" />
                          {charge.chargeType.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A] text-[13px]">₹{charge.amount.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Paid: ₹{charge.amountPaid.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${charge.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : charge.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' : charge.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {charge.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px]">
                        {charge.dueDate || '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md font-medium text-[12px] transition-colors shadow-sm">
                          <FileText size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                ))}
                {activeTab === 'charges' && filteredCharges.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                          <FileText size={32} />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-[#0F172A] m-0 mb-1">No charges found</h3>
                          <p className="text-[13px] text-slate-500 m-0">Create a new charge to get started tracking payments.</p>
                        </div>
                        <button
                          onClick={() => setChargeModalOpen(true)}
                          className="mt-2 flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-1.5 rounded-md font-medium text-[13px] transition-colors shadow-sm"
                        >
                          <Plus size={16} />
                          Create Charge
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                {activeTab === 'verifications' && filteredRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A] text-[13px]">{record.unitDetails?.unit_number || 'Unknown Unit'}</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">{record.unitDetails?.customer_name || 'No Customer'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 font-medium text-slate-700 text-[13px]">
                          <Receipt size={14} className="text-blue-500" />
                          Payment Received
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A] text-[13px]">₹{record.amount.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{record.paymentMethod}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${record.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : record.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px]">
                        {record.paymentDate || '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {record.status === 'PENDING_VERIFICATION' ? (
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium text-[12px] transition-colors shadow-sm"
                          >
                            <FileText size={14} />
                            Review Payment
                          </button>
                        ) : record.status === 'VERIFIED' ? (
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md font-medium text-[12px] transition-colors shadow-sm"
                          >
                            <FileText size={14} />
                            View Payment
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md font-medium text-[12px] transition-colors shadow-sm"
                          >
                            <FileText size={14} />
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                ))}
                {activeTab === 'verifications' && filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      No payments awaiting verification.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {isChargeModalOpen && (
        <CreateChargeModal 
          isOpen={isChargeModalOpen} 
          onClose={() => setChargeModalOpen(false)} 
          units={units}
          payments={payments}
          onSuccess={() => {
            setChargeModalOpen(false);
            chargeService.getCharges().then(setCharges);
            paymentService.getPayments().then(setPayments);
          }}
        />
      )}

      {selectedRecord && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(11, 31, 51, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Review Payment</h2>
              <button onClick={() => { setSelectedRecord(null); setRejectReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <span style={{ fontSize: '20px' }}>&times;</span>
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Charge Amount</div>
                  <div className="text-[16px] font-bold text-slate-700">₹{Number(selectedRecord.chargeDetails?.amount || 0).toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Outstanding Before</div>
                  <div className="text-[16px] font-bold text-slate-700">
                    ₹{Number((selectedRecord.chargeDetails?.amount || 0) - (selectedRecord.chargeDetails?.amount_paid || 0)).toLocaleString()}
                  </div>
                </div>
                <div className="h-px bg-blue-200 my-1"></div>
                <div className="flex justify-between items-center">
                  <div className="text-[12px] font-semibold text-blue-600 uppercase tracking-wide">Submitted Payment</div>
                  <div className="text-[28px] font-bold text-[#0F172A]">₹{Number(selectedRecord.amount).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Unit</div>
                  <div className="font-bold text-[#0F172A] text-[14px]">{selectedRecord.unitDetails?.unit_number || '-'}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Customer</div>
                  <div className="font-bold text-[#0F172A] text-[14px]">{selectedRecord.unitDetails?.customer_name || 'No Customer'}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Charge Type</div>
                  <div className="font-bold text-[#0F172A] text-[14px]">{selectedRecord.chargeDetails?.charge_type_display || 'Other'}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Method</div>
                  <div className="font-medium text-[#0F172A] text-[14px]">{selectedRecord.paymentMethod?.replace('_', ' ') || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Reference No.</div>
                  <div className="font-medium text-[#0F172A] text-[14px] font-mono">{selectedRecord.referenceId || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-500 mb-1">Date Submitted</div>
                  <div className="font-medium text-[#0F172A] text-[14px]">
                    {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : 'Not available'}
                  </div>
                </div>
              </div>

              {selectedRecord.receiptUrl ? (
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[#0F172A] text-[13px]">Payment Proof</div>
                      <div className="text-[12px] text-slate-500">Receipt attached</div>
                    </div>
                  </div>
                  <a href={selectedRecord.receiptUrl} target="_blank" rel="noreferrer" className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                    View File
                  </a>
                </div>
              ) : (
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 rounded-lg text-slate-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-500 text-[13px]">Payment Proof</div>
                      <div className="text-[12px] text-slate-400">No proof uploaded</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecord.status === 'PENDING_VERIFICATION' && (
                <div className="mt-4">
                  <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Rejection Reason (if rejecting)</label>
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Provide a reason if rejecting..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-[14px] focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                  />
                </div>
              )}
            </div>

            {selectedRecord.status === 'PENDING_VERIFICATION' && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--admin-border)', backgroundColor: '#F8FAFC', display: 'flex', gap: '12px', borderRadius: '0 0 16px 16px' }}>
                <button 
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 font-bold text-[14px] rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Reject Payment
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-[14px] rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Approve Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPayments;
