import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus, MapPin, ChevronRight } from 'lucide-react';
import { statusLabel } from '../../../utils/statusMap';
import EmptyState from '../../../components/EmptyState';
import { useRole } from '../../../context/RoleContext';
import { ROLE_NAMESPACES } from '../../../utils/roleUtils';

export interface DefectsTabProps {
  canInspect: any;
  defects: any;
  activeTab: any;
  unit: any;
  openLogDefect: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) — pure move,
 * identical JSX and behavior.
 */
export function DefectsTab({canInspect, defects, activeTab, unit, openLogDefect}: DefectsTabProps) {
  const { activeRole } = useRole();
  return (
    <>
          {/* 4. DEFECTS TAB */}
          {activeTab === 'defects' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">Logged Defects / Snags</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">Track and assign snag rectifications to specialized contractors.</p>
                </div>
                {canInspect && (
                  <button
                    onClick={openLogDefect}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all duration-200"
                  >
                    <Plus size={14} /> Log Defect
                  </button>
                )}
              </div>

              {defects.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {defects.map(d => (
                      <Link
                        key={d.id}
                        to={`${ROLE_NAMESPACES[activeRole as any] || '/builder'}/defects/${d.id}`}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-underline group"
                      >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          d.severity === 'High' ? 'bg-rose-50 text-rose-600' : d.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{d.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-slate-400" /> {d.location}
                            </span>
                            <span>Â·</span>
                            <span>Severity: <strong className={d.severity === 'High' ? 'text-red-600' : 'text-slate-700'}>{d.severity}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          d.status === 'resolved' || d.status === 'closed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {statusLabel('defect', d.status)}
                        </span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<AlertTriangle size={36} />}
                  title="No defects found"
                  description="There are no active or open defects registered for this unit."
                />
              )}
            </div>
          )}
    </>
  );
}
