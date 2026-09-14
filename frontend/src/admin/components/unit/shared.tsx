import React from 'react';

// Moved from UnitDetail.tsx during the Phase 6 component split — shared by
// the page shell and the extracted unit components.

export const formatStatus = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export const unitStatusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  not_started:                   { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400' },
  construction_in_progress:      { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  nearing_completion:            { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  internal_inspection:           { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  defect_resolution:             { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-500' },
  customer_inspection_ready:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  customer_inspection_completed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  handover_preparation:          { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
  ready_for_handover:            { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
  handover_scheduled:            { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  handed_over:                   { bg: 'bg-green-100', text: 'text-green-800',  border: 'border-green-300',  dot: 'bg-green-600' },
  warranty_stage:                { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400' },
};

export const UnitStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normKey = (status || '').toLowerCase().replace(/\s+/g, '_');
  const cfg = unitStatusConfig[normKey] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${'$'}{cfg.bg} ${'$'}{cfg.text} ${'$'}{cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${'$'}{cfg.dot} mr-1.5`}></span>
      {formatStatus(status)}
    </span>
  );
};

export const inputCls = (err?: boolean) =>
  `w-full px-3.5 py-2.5 bg-white border rounded-xl text-[14px] text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-sm ${'$'}{
    err ? 'border-red-400 focus:border-red-500 bg-red-50/20' : 'border-slate-200 focus:border-[#2563EB]'
  }`;

export const labelCls = 'block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5';
