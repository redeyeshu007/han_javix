import React from 'react';
import { Plus, Check, X } from 'lucide-react';
import { formatINR } from '../../../utils/currency';
import { statusLabel } from '../../../utils/statusMap';

export interface PaymentsTabProps {
  handleUpdatePaymentStatus: any;
  canRecordPayment: any;
  isSubmitting: any;
  payments: any;
  setShowPaymentModal: any;
  activeTab: any;
  paymentCleared: any;
  unit: any;
  canVerifyPayment: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) â€” pure move,
 * identical JSX and behavior.
 */
export function PaymentsTab({handleUpdatePaymentStatus, canRecordPayment, isSubmitting, payments, setShowPaymentModal, activeTab, paymentCleared, unit, canVerifyPayment}: PaymentsTabProps) {
  return (
    <>
          {/* 6. PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Financial Ledger Clearance</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">Buyer installment schedules and transaction ledger entries.</p>
                </div>
                {canRecordPayment && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all duration-200"
                  >
                    <Plus size={14} /> Record Payment
                  </button>
                )}
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
                  <div className="text-[26px] font-bold text-[#0F172A] mt-1">
                    {formatINR(payments.reduce((acc, p) => acc + (p.amount || 0), 0))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount Cleared</span>
                  <div className="text-[26px] font-bold text-emerald-600 mt-1">
                    {formatINR(payments.filter(p => p.status === 'CLEARED').reduce((acc, p) => acc + (p.amount || 0), 0))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Status</span>
                  <div className={`text-[20px] font-bold mt-2 ${paymentCleared ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {paymentCleared ? 'FULLY CLEARED' : 'PENDING'}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[160px]">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                        <th className="px-5 py-3">Payment Title / Type</th>
                        <th className="px-5 py-3">Date / Ref</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-[#0F172A] text-[13px]">{payment.paymentType || payment.title}</div>
                            {payment.paymentMethod && <div className="text-[12px] text-slate-400 mt-0.5">{payment.paymentMethod}</div>}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-slate-700 text-[13px] font-medium">{payment.paymentDate || payment.dueDate}</div>
                            {payment.reference && <div className="text-[12px] text-slate-400 mt-0.5">Ref: {payment.reference}</div>}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-[#0F172A] text-[14px]">
                            {formatINR(payment.amount || 0)}
                          </td>
                          <td className="px-5 py-3.5">
                            {payment.status === 'CLEARED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check size={12} /> Cleared
                              </span>
                            ) : payment.status === 'PARTIALLY_CLEARED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Verified
                              </span>
                            ) : payment.status === 'ON_HOLD' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                {statusLabel('payment', payment.status)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {payment.status !== 'CLEARED' && payment.status !== 'ON_HOLD' && canVerifyPayment ? (
                              <div className="flex items-center justify-end gap-2">
                                {payment.status === 'PENDING_PAYMENT' && (
                                  <>
                                    <button 
                                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-[12px] font-semibold transition-colors"
                                      disabled={isSubmitting}
                                      onClick={() => handleUpdatePaymentStatus(payment.id, 'Verified')}
                                    >
                                      Verify
                                    </button>
                                    <button 
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                      disabled={isSubmitting}
                                      onClick={() => handleUpdatePaymentStatus(payment.id, 'Rejected')}
                                      title="Reject"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                                {payment.status === 'PARTIALLY_CLEARED' && (
                                  <button
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors shadow-sm"
                                    disabled={isSubmitting}
                                    onClick={() => handleUpdatePaymentStatus(payment.id, 'Cleared')}
                                  >
                                    Clear Funds
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[12px]">
                                {payment.status === 'CLEARED' ? `Cleared` : payment.status === 'ON_HOLD' ? 'Requires action' : 'No Action'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium text-[13px]">
                            No payment records logged for this unit.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
    </>
  );
}
