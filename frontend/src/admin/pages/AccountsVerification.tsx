import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { paymentRecordService } from '../../api/services';

const AccountsVerification: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await paymentRecordService.getPaymentRecords();
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRecord) return;
    setIsProcessing(true);
    try {
      await paymentRecordService.approvePaymentRecord(selectedRecord.id);
      await load();
      setSelectedRecord(null);
    } catch (e) {
      console.error('Approval failed', e);
      alert('Failed to approve payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setIsProcessing(true);
    try {
      await paymentRecordService.rejectPaymentRecord(selectedRecord.id, rejectReason);
      await load();
      setSelectedRecord(null);
      setRejectReason('');
    } catch (e) {
      console.error('Rejection failed', e);
      alert('Failed to reject payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRecords = records.filter(r => r.status === 'PENDING_VERIFICATION');
  const historyRecords = records.filter(r => r.status !== 'PENDING_VERIFICATION');

  const filteredPending = pendingRecords.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (r.unitDetails?.customer_name?.toLowerCase() || '').includes(s) || (r.unitDetails?.unit_number?.toLowerCase() || '').includes(s);
  });

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen p-8 w-full flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <section className="flex flex-col mb-8 mt-2">
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight m-0">Payment Verification</h1>
          <p className="text-[14px] text-slate-500 mt-1.5 font-medium">
            Review and clear customer payments. Verified payments count towards financial clearance.
          </p>
        </section>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search pending payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Pending Verification Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-10">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-[16px] font-bold text-[#0F172A] m-0 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Action Required ({pendingRecords.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">Unit / Customer</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Reference / Method</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPending.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-bold text-[#0F172A] text-[13px]">{record.unitDetails?.unit_number || 'Unknown Unit'}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5">{record.unitDetails?.customer_name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-[13px] font-medium">
                      {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-3 font-bold text-[#0F172A] text-[14px]">
                      ₹{Number(record.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-[#0F172A] text-[13px]">{record.paymentMethod?.replace('_', ' ') || '-'}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5 font-mono">{record.referenceId || '-'}</div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[13px] font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPending.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
                        <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">Queue is clear</h3>
                        <p className="text-[13px] text-slate-500">No pending payments require your verification.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-[18px] font-bold text-[#0F172A] m-0">Review Payment</h2>
                <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-2">
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
                    <div className="text-[32px] font-bold text-[#0F172A] tracking-tight">₹{Number(selectedRecord.amount).toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-slate-500 mb-1">Unit</div>
                    <div className="font-bold text-[#0F172A] text-[14px]">{selectedRecord.unitDetails?.unit_number || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-slate-500 mb-1">Customer</div>
                    <div className="font-bold text-[#0F172A] text-[14px]">{selectedRecord.unitDetails?.customer_name || 'No Customer'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-slate-500 mb-1">Date</div>
                    <div className="font-medium text-[#0F172A] text-[14px]">
                      {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : 'Not available'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-slate-500 mb-1">Reference</div>
                    <div className="font-medium text-[#0F172A] text-[14px] font-mono">{selectedRecord.referenceId || 'Not provided'}</div>
                  </div>
                </div>

                {selectedRecord.receiptUrl ? (
                  <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F172A] text-[13px]">Payment Receipt</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">Customer uploaded evidence</div>
                      </div>
                    </div>
                    <a href={selectedRecord.receiptUrl} target="_blank" rel="noreferrer" className="text-[13px] font-bold text-blue-600 hover:text-blue-700">
                      View File
                    </a>
                  </div>
                ) : (
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-200 rounded-lg text-slate-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-500 text-[13px]">Payment Receipt</div>
                        <div className="text-[12px] text-slate-400 mt-0.5">No proof uploaded</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Rejection Reason (if rejecting)</label>
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for the customer if you are rejecting this payment..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsVerification;
