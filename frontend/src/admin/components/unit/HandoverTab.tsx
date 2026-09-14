import React from 'react';
import { Check, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { ButtonLoading } from '../../../components/LoadingState';
import { unitsApi } from '../../../api/services';

export interface HandoverTabProps {
  recordError: any;
  setIsSubmitting: any;
  loadData: any;
  handoverRecord: any;
  actualApprovalsCleared: any;
  canManageHandover: any;
  isSubmitting: any;
  defectsCleared: any;
  isReadyForHandover: any;
  activeTab: any;
  paymentCleared: any;
  unit: any;
  docsCleared: any;
  toggleRecordField: any;
  keysHandedOverFlag: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) â€” pure move,
 * identical JSX and behavior.
 */
export function HandoverTab({loadData, handoverRecord, actualApprovalsCleared, canManageHandover, isSubmitting, defectsCleared, isReadyForHandover, activeTab, paymentCleared, unit, docsCleared, toggleRecordField, keysHandedOverFlag, recordError, setIsSubmitting}: HandoverTabProps) {
  return (
    <>
          {/* 7. HANDOVER TAB */}
          {activeTab === 'handover' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Handover Readiness Audit</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">Final sign-off check before physical key release to homeowner.</p>
                </div>
              </div>

              {recordError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-700 font-medium">
                  {recordError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real HandoverRecord (database-backed) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:col-span-2">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Handover Record (database)</span>
                  {handoverRecord ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#0F172A]">Record Status</span>
                        <span className="text-[12px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">{handoverRecord.status}</span>
                      </div>
                      {handoverRecord.scheduledDate && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Scheduled Date</span>
                          <span className="font-semibold text-[#0F172A]">{handoverRecord.scheduledDate}</span>
                        </div>
                      )}
                      {([
                        ['site_engineer_approval', 'Site Engineer Approval'],
                        ['accounts_approval', 'Accounts Approval'],
                      ] as const).map(([field, label]) => (
                        <div key={field} className="flex items-center justify-between">
                          <span className="text-[13px] text-slate-500 font-medium">{label}</span>
                          {canManageHandover ? (
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(handoverRecord[field])}
                                disabled={isSubmitting || handoverRecord.status === 'HANDED_OVER'}
                                onChange={() => toggleRecordField(field)}
                                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300"
                              />
                              <span className="text-[12px] font-semibold text-slate-600">{handoverRecord[field] ? 'Approved' : 'Approve'}</span>
                            </label>
                          ) : (
                            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md border ${handoverRecord[field] ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {handoverRecord[field] ? 'Approved' : 'Pending'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-slate-500">No handover record yet. It is created automatically when you set the first approval or hand over keys.</p>
                  )}
                </div>

                {/* Requirements matrix */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Requirements Matrix</span>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'docs', label: 'Documentation Verification', val: docsCleared },
                      { id: 'payment', label: 'Financial Clearance', val: paymentCleared },
                      { id: 'snags', label: 'Defect Snags Resolved', val: defectsCleared },
                      { id: 'approval', label: 'Management Approval', val: actualApprovalsCleared }
                    ].map((req, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-[14px] font-semibold text-[#0F172A]">{req.label}</span>
                        {req.val ? (
                          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <Check size={14} /> Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                            <X size={14} /> Pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finalization Board */}
                <div className={`rounded-2xl p-6 border flex flex-col justify-between ${
                  isReadyForHandover ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Finalization Board</span>
                    
                    {isReadyForHandover ? (
                      <div>
                        <div className="flex items-center gap-2 text-emerald-700 text-[18px] font-bold mb-2">
                          <CheckCircle2 size={22} className="text-emerald-600" /> READY FOR HANDOVER
                        </div>
                        <p className="text-[13px] text-slate-600 mb-6">
                          All operational, documentation, and ledger prerequisites are fully satisfied. You can now release physical keys.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 text-rose-700 text-[18px] font-bold mb-2">
                          <AlertCircle size={22} className="text-rose-600" /> NOT READY FOR HANDOVER
                        </div>
                        <p className="text-[13px] text-slate-600 mb-6">
                          You cannot finalize key handover. One or more mandatory audit requirements remain outstanding.
                        </p>
                      </div>
                    )}
                  </div>

                  {isReadyForHandover && (
                    <div className="space-y-4 pt-4 border-t border-emerald-200/60">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          id="key_hando" 
                          checked={keysHandedOverFlag}
                          disabled={isSubmitting || !canManageHandover}
                          onChange={() => toggleRecordField('keys_handed_over')}
                          className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300"
                        />
                        <span className="text-[13px] font-semibold text-[#0F172A]">Mark keys as physically handed over</span>
                      </label>
                      
                      {unit.keysHandedOver && unit.status !== 'handed_over' && (
                        <button
                          className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-bold shadow-sm transition-all duration-200"
                          disabled={isSubmitting}
                          onClick={async () => {
                            setIsSubmitting(true);
                            // Send the real Unit.UNIT_STATUS_CHOICES slug.
                            await unitsApi.updateUnit(unit.id, { status: 'handed_over' });
                            await loadData(true);
                            setIsSubmitting(false);
                          }}
                        >
                          {isSubmitting ? <ButtonLoading label="Processing..." /> : 'Mark Complete Handover'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
    </>
  );
}
