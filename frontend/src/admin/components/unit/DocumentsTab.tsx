import React from 'react';
import { FileText, FileCheck } from 'lucide-react';

export interface DocumentsTabProps {
  documents: any;
  actualApprovalsCleared: any;
  isSubmitting: any;
  setShowDocumentModal: any;
  pendingMunicipalDoc: any;
  handleApproveMunicipalDoc: any;
  activeTab: any;
  docsCleared: any;
  canApproveDocs: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) â€” pure move,
 * identical JSX and behavior.
 */
export function DocumentsTab({documents, actualApprovalsCleared, isSubmitting, setShowDocumentModal, pendingMunicipalDoc, handleApproveMunicipalDoc, activeTab, docsCleared, canApproveDocs}: DocumentsTabProps) {
  return (
    <>
          {/* 5. DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Document Checklist</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">Verification files and statutory compliance archives.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0F172A]">Ownership & Identity Documents</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Copy of buyer identity verification card and sale deed.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      docsCleared ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {docsCleared ? 'Verified' : 'Awaiting Review'}
                    </span>
                    <button
                      onClick={() => setShowDocumentModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold shadow-sm transition-colors"
                    >
                      Manage Documents
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0F172A]">Municipal Certificate of Occupancy</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">Required statutory municipality sign-off documents.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      actualApprovalsCleared ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {actualApprovalsCleared ? 'Cleared' : 'Awaiting Review'}
                    </span>
                    {canApproveDocs && (
                      <button
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting || !pendingMunicipalDoc}
                        onClick={handleApproveMunicipalDoc}
                        title={!pendingMunicipalDoc ? "No pending municipal document to approve" : ""}
                      >
                        Approve File
                      </button>
                    )}
                    <button
                      onClick={() => setShowDocumentModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold shadow-sm transition-colors"
                    >
                      Manage Documents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );
}
