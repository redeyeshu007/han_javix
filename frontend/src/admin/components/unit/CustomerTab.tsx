import React from 'react';
import { Plus, UserX } from 'lucide-react';

export interface CustomerTabProps {
  setUnassignError: any;
  canEditUnit: any;
  setShowAssignCustomer: any;
  activeTab: any;
  setAssignErrors: any;
  customer: any;
  unit: any;
  setShowUnassignConfirm: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) â€” pure move,
 * identical JSX and behavior.
 */
export function CustomerTab({setUnassignError, canEditUnit, setShowAssignCustomer, activeTab, setAssignErrors, customer, unit, setShowUnassignConfirm}: CustomerTabProps) {
  return (
    <>
          {/* 2. CUSTOMER TAB */}
          {activeTab === 'customer' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Homebuyer Allocation</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">Purchaser record and access assignment for this unit.</p>
                </div>
                {!customer && (
                  <button
                    onClick={() => { setAssignErrors({}); setShowAssignCustomer(true); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all duration-200"
                  >
                    <Plus size={14} /> Assign Customer
                  </button>
                )}
              </div>

              {customer ? (
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white font-bold text-[22px] flex items-center justify-center shadow-md flex-shrink-0">
                      {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Allocated Buyer</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Account
                        </span>
                      </div>
                      <h4 className="text-[20px] font-bold text-[#0F172A]">{customer.name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-[13px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Email:</span> {customer.email}
                        </span>
                        <span>Â·</span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Phone:</span> {customer.phone}
                        </span>
                        <span>Â·</span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Handover:</span> {customer.handoverStatus || 'Scheduled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canEditUnit && (
                    <button
                      onClick={() => { setUnassignError(null); setShowUnassignConfirm(true); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-[13px] font-semibold shadow-sm transition-all duration-200 flex-shrink-0"
                    >
                      <UserX size={14} /> Unassign
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <UserX size={26} />
                  </div>
                  <h4 className="text-[16px] font-bold text-[#0F172A]">No Customer Allocated</h4>
                  <p className="text-[13px] text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
                    This unit has not been assigned to a buyer profile. Assign a customer to enable portal access.
                  </p>
                  <button
                    onClick={() => { setAssignErrors({}); setShowAssignCustomer(true); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all duration-200"
                  >
                    <Plus size={14} /> Assign Customer Now
                  </button>
                </div>
              )}
            </div>
          )}
    </>
  );
}
