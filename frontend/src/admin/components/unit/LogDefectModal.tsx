import React from 'react';
import { X } from 'lucide-react';
import { inputCls, labelCls } from './shared';
import { ButtonLoading } from '../../../components/LoadingState';

export interface LogDefectModalProps {
  defectContractor: any;
  setDefectContractor: any;
  handleLogDefect: any;
  defectTitle: any;
  defectDesc: any;
  defectErrors: any;
  showLogDefect: any;
  setDefectSeverity: any;
  isSubmitting: any;
  setDefectLoc: any;
  contractorsList: any;
  defectLoc: any;
  setShowLogDefect: any;
  setDefectDesc: any;
  defectSeverity: any;
  setDefectTitle: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) — pure move,
 * identical JSX and behavior.
 */
export function LogDefectModal({defectContractor, setDefectContractor, handleLogDefect, defectTitle, defectDesc, defectErrors, showLogDefect, setDefectSeverity, isSubmitting, setDefectLoc, contractorsList, defectLoc, setShowLogDefect, setDefectDesc, defectSeverity, setDefectTitle}: LogDefectModalProps) {
  return (
    <>
      {/* 2. Log Defect Modal */}
      {showLogDefect && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Log Defect Snag</h3>
              <button
                type="button"
                onClick={() => setShowLogDefect(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogDefect} className="space-y-4">
              <div>
                <label className={labelCls}>Issue Title *</label>
                <input
                  type="text"
                  className={inputCls(Boolean(defectErrors.defectTitle))}
                  value={defectTitle}
                  onChange={e => setDefectTitle(e.target.value)}
                  placeholder="e.g. Broken wall socket"
                />
              </div>

              <div>
                <label className={labelCls}>Exact Location *</label>
                <input
                  type="text"
                  className={inputCls(Boolean(defectErrors.defectLoc))}
                  value={defectLoc}
                  onChange={e => setDefectLoc(e.target.value)}
                  placeholder="e.g. Living room north wall"
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={`${inputCls()} min-h-[80px] resize-y`}
                  value={defectDesc}
                  onChange={e => setDefectDesc(e.target.value)}
                  placeholder="Provide more details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Severity *</label>
                  <select
                    className={inputCls()}
                    value={defectSeverity}
                    onChange={e => setDefectSeverity(e.target.value as any)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Contractor Assignment *</label>
                  <select
                    className={inputCls()}
                    value={defectContractor}
                    onChange={e => setDefectContractor(e.target.value)}
                  >
                    <option value="">Select Contractor</option>
                    {contractorsList.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.companyName} ({c.trade})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogDefect(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all"
                >
                  {isSubmitting ? <ButtonLoading label="Registering..." /> : 'Register Snag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
