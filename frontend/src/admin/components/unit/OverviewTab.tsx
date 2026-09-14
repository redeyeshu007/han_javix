import React from 'react';
import { Building2, AlertTriangle, FileText, CreditCard, Key, Home, Layers, BedDouble, Bath, Car, Maximize2, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface OverviewTabProps {
  blockName: any;
  defectsCleared: any;
  project: any;
  floorName: any;
  activeTab: any;
  paymentCleared: any;
  unit: any;
  docsCleared: any;
  keysHandedOverFlag: any;
}

/**
 * Extracted from UnitDetail.tsx (Phase 6 component split) â€” pure move,
 * identical JSX and behavior.
 */
export function OverviewTab({blockName, defectsCleared, project, floorName, activeTab, paymentCleared, unit, docsCleared, keysHandedOverFlag}: OverviewTabProps) {
  return (
    <>
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 gap-8">
                
                {/* Property Specifications */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[16px] font-bold text-[#0F172A] flex items-center gap-2">
                      <Home size={18} className="text-[#2563EB]" /> Property Specifications
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-[#2563EB]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Project</div>
                        <div className="text-[16px] font-bold text-[#0F172A] leading-none truncate mt-1">{project?.name || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Layers size={18} className="text-[#7C3AED]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Block / Phase</div>
                        <div className="text-[16px] font-bold text-[#0F172A] leading-none truncate mt-1">{blockName || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Layers size={18} className="text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Floor</div>
                        <div className="text-[16px] font-bold text-[#0F172A] leading-none truncate mt-1">{floorName || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Home size={18} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Unit Type</div>
                        <div className="text-[16px] font-bold text-[#0F172A] leading-none truncate mt-1 capitalize">{unit.type || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                        <Maximize2 size={18} className="text-cyan-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Area</div>
                        <div className="text-[16px] font-bold text-[#0F172A] leading-none truncate mt-1">{unit.areaSqFt ? `${unit.areaSqFt} sq ft` : 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <BedDouble size={18} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Bed / Bath</div>
                        <div className="text-[16px] font-bold text-[#0F172A] leading-none truncate mt-1">{unit.bedrooms || 0} Bed Â· {unit.bathrooms || 0} Bath</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
    </>
  );
}
