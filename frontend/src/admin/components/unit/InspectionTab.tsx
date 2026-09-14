import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, CheckCircle2, Clock, ChevronRight, XCircle, MinusCircle } from 'lucide-react';

export interface InspectionTabProps {
  canInspect: boolean;
  activeTab: string;
  inspectionUrl: string;
  customer: any;
  unit: any;
  /** Array of UnitInspection objects from workspace API */
  inspections?: any[];
}

function getInspectionStatusLabel(inspections: any[]): { label: string; color: 'green' | 'red' | 'amber' } {
  if (!inspections || inspections.length === 0) return { label: 'Pending', color: 'amber' };
  const latest = [...inspections].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  const hasDefect = latest.results?.some((r: any) => r.result === 'defect_found');
  const allPassed = latest.results?.every((r: any) =>
    r.result === 'passed' || r.result === 'not_applicable'
  );
  if (latest.status === 'completed') {
    if (hasDefect) return { label: 'Defects Found', color: 'red' };
    if (allPassed) return { label: 'Passed', color: 'green' };
    return { label: 'Completed', color: 'amber' };
  }
  if (latest.status === 'in_progress') return { label: 'In Progress', color: 'amber' };
  return { label: 'Pending', color: 'amber' };
}

function ResultIcon({ result }: { result: string }) {
  if (result === 'passed' || result === 'not_applicable') return <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />;
  if (result === 'defect_found') return <XCircle size={14} className="text-rose-500 flex-shrink-0" />;
  return <MinusCircle size={14} className="text-slate-400 flex-shrink-0" />;
}

/**
 * Inspection Tab — displays live inspection data from the workspace API.
 * Falls back gracefully when no inspections exist yet.
 */
export function InspectionTab({
  canInspect,
  activeTab,
  inspectionUrl,
  unit,
  inspections = [],
}: InspectionTabProps) {
  const latestInspection = inspections.length > 0
    ? [...inspections].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  const { label: statusLabel, color: statusColor } = getInspectionStatusLabel(inspections);

  // Summarise result counts from latest inspection
  const resultCounts = {
    passed: latestInspection?.results?.filter((r: any) => r.result === 'passed').length ?? 0,
    failed: latestInspection?.results?.filter((r: any) => r.result === 'defect_found').length ?? 0,
    na: latestInspection?.results?.filter((r: any) => r.result === 'not_applicable').length ?? 0,
    total: latestInspection?.results?.length ?? 0,
  };

  // Group latest inspection results by category for display
  const categorisedResults: Record<string, any[]> = {};
  (latestInspection?.results ?? []).forEach((r: any) => {
    const cat = r.snapshot_category || r.checklist_item_category || 'General';
    if (!categorisedResults[cat]) categorisedResults[cat] = [];
    categorisedResults[cat].push(r);
  });

  const statusBadgeClass =
    statusColor === 'green'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : statusColor === 'red'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const statusDotClass =
    statusColor === 'green' ? 'bg-emerald-500' : statusColor === 'red' ? 'bg-rose-500' : 'bg-amber-500';

  return (
    <>
      {/* INSPECTION TAB */}
      {activeTab === 'inspection' && (
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[18px] font-bold text-[#0F172A]">Unit Inspection</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">Pre-handover snag inspection and quality assurance audit.</p>
            </div>
            {canInspect && (
              <Link
                to={inspectionUrl}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-all duration-200 no-underline"
              >
                <CheckSquare size={14} />
                {latestInspection ? 'Re-inspect Unit' : 'Start Inspection'}
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Status Overview Card */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Overview</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${statusBadgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotClass}`} />
                    {statusLabel}
                  </span>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    statusColor === 'green' ? 'bg-emerald-50 text-emerald-600' :
                    statusColor === 'red' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {statusColor === 'green' ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0F172A]">
                      {latestInspection
                        ? `Inspection status: ${statusLabel}`
                        : 'No inspection conducted yet'}
                    </div>
                    <p className="text-[13px] text-slate-500 mt-1">
                      {statusColor === 'green'
                        ? 'Property cleared for customer handover with zero blocking snags.'
                        : statusColor === 'red'
                        ? `${resultCounts.failed} defect(s) found — resolve before handover.`
                        : 'Snag lists need resolution prior to formal customer key handover.'}
                    </p>
                    {latestInspection && (
                      <div className="flex gap-4 mt-3">
                        <span className="text-[11px] text-emerald-700 font-semibold">✓ {resultCounts.passed} Passed</span>
                        {resultCounts.failed > 0 && (
                          <span className="text-[11px] text-rose-700 font-semibold">✗ {resultCounts.failed} Failed</span>
                        )}
                        {resultCounts.na > 0 && (
                          <span className="text-[11px] text-slate-500 font-semibold">– {resultCounts.na} N/A</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {latestInspection && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Last inspected:{' '}
                    {new Date(latestInspection.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                    {latestInspection.inspected_by_name && ` by ${latestInspection.inspected_by_name}`}
                  </div>
                )}
              </div>

              {canInspect && (
                <div className="pt-3">
                  <Link
                    to={inspectionUrl}
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors no-underline"
                  >
                    Launch Pre-Handover Snagging Audit <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Inspection Summary / Checklist Template Card */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {latestInspection ? 'Inspection Summary' : 'Checklist Template'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {latestInspection
                    ? `${resultCounts.total} items checked`
                    : 'Standard Snagging Checklist'}
                </span>
              </div>

              {latestInspection && resultCounts.total > 0 ? (
                <div className="space-y-3">
                  {Object.entries(categorisedResults).map(([cat, items]) => (
                    <div key={cat} className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-[13px] font-bold text-[#0F172A] mb-2">{cat}</div>
                      <div className="space-y-1.5">
                        {items.slice(0, 4).map((r: any, idx: number) => (
                          <div key={r.id ?? idx} className="flex items-center gap-2 text-[12px] text-slate-600">
                            <ResultIcon result={r.result} />
                            <span className="truncate">{r.snapshot_item_text || r.checklist_item_text || 'Item'}</span>
                          </div>
                        ))}
                        {items.length > 4 && (
                          <div className="text-[11px] text-slate-400 pl-5">+{items.length - 4} more items</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-slate-600 mb-4 leading-relaxed font-medium">
                    We will run the standard <strong>Pre-Handover Snagging Checklist</strong> comprising:
                  </p>
                  <div className="space-y-3">
                    {['Masonry & Finishes', 'Plumbing Systems', 'Electrical & HVAC'].map((name) => (
                      <div key={name} className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={15} />
                        </div>
                        <div className="text-[13px] font-bold text-[#0F172A]">{name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Inspection History */}
          {inspections.length > 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-4">Inspection History</h4>
              <div className="space-y-2">
                {[...inspections]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((insp: any, idx: number) => {
                    const hasDefect = insp.results?.some((r: any) => r.result === 'defect_found');
                    const passed = !hasDefect && insp.status === 'completed';
                    return (
                      <div key={insp.id ?? idx} className="flex items-center justify-between text-[13px] py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${passed ? 'bg-emerald-500' : hasDefect ? 'bg-rose-500' : 'bg-amber-400'}`} />
                          <span className="text-slate-700 font-medium capitalize">{insp.inspection_type} Inspection</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500">
                          <span>{new Date(insp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className={`font-semibold ${passed ? 'text-emerald-600' : hasDefect ? 'text-rose-600' : 'text-amber-600'}`}>
                            {passed ? 'Passed' : hasDefect ? 'Defects Found' : insp.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
