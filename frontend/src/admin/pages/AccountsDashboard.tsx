import React, { useState, useEffect } from 'react';
import { IndianRupee, AlertTriangle, FileText, CheckCircle2, Clock, Activity, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { accountsApi } from '../../api/services';

const AccountsDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await accountsApi.getSummary();
        setSummary(data);
      } catch (e) {
        console.error('Failed to load accounts summary', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen p-8 w-full flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) return null;

  const totalDemanded = Number(summary.total_demanded || 0);
  const totalCollected = Number(summary.total_collected || 0);
  const totalPending = Number(summary.total_pending || 0);
  const collectionPercent = totalDemanded > 0 ? Math.round((totalCollected / totalDemanded) * 100) : 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <section className="flex flex-col mb-8 mt-2">
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight m-0">
            {summary.project_name ? `${summary.project_name} Financials` : 'Financial Overview'}
          </h1>
          <p className="text-[14px] text-slate-500 mt-1.5 font-medium">
            Monitor real-time collection metrics, payment verifications, and overdue accounts.
          </p>
        </section>

        {/* Primary Financial Metric Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-[14px] font-bold tracking-wide uppercase text-slate-500 m-0 mb-3 flex items-center gap-2">
              <IndianRupee size={16} className="text-slate-400" /> Total Demanded
            </h3>
            <div className="text-[40px] font-bold text-[#0F172A] tracking-tight leading-none">
              ₹{totalDemanded.toLocaleString()}
            </div>
          </div>

          <div className="bg-emerald-500 p-7 rounded-2xl shadow-[0_12px_24px_rgba(16,185,129,0.2)] flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-emerald-400/30 to-transparent pointer-events-none" />
            <h3 className="text-[14px] font-bold tracking-wide uppercase text-emerald-100 m-0 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} /> Total Collected
            </h3>
            <div className="text-[40px] font-bold text-white tracking-tight leading-none">
              ₹{totalCollected.toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-amber-200 shadow-[0_12px_24px_rgba(245,158,11,0.06)] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
            <h3 className="text-[14px] font-bold tracking-wide uppercase text-amber-600 m-0 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Outstanding Pending
            </h3>
            <div className="text-[40px] font-bold text-amber-600 tracking-tight leading-none">
              ₹{totalPending.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Collection Progress & Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#0F172A] flex items-center gap-2 m-0 mb-1">
                  <Target size={18} className="text-blue-600" /> Collection Target
                </h3>
                <p className="text-[13px] text-slate-500 m-0">Percentage of demanded funds successfully collected.</p>
              </div>
              <div className="text-[32px] font-bold text-blue-600 leading-none">{collectionPercent}%</div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${collectionPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex gap-4 divide-x divide-slate-100">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-[32px] font-bold text-[#0F172A]">{summary.overdue_count}</div>
              <div className="text-[13px] font-medium text-slate-500 mt-1">Overdue Charges</div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center text-center pl-4">
              <div className="text-[32px] font-bold text-[#0F172A]">{summary.cleared_units_count}</div>
              <div className="text-[13px] font-medium text-slate-500 mt-1">Units Cleared</div>
            </div>
          </div>

        </div>

        {/* Awaiting Verification Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A] m-0 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Awaiting Payment Verification
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium m-0">
                Customer payments pending your approval to clear outstanding balances.
              </p>
            </div>
            {summary.awaiting_verification_count > 0 && (
              <div className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-[13px]">
                {summary.awaiting_verification_count} Pending
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">Unit / Customer</th>
                  <th className="px-6 py-4">Date submitted</th>
                  <th className="px-6 py-4">Payment Against</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summary.pending_verification_records?.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-bold text-[#0F172A] text-[13px]">{record.unit_number || 'Unknown'}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5">{record.customer_name}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-[13px] font-medium">
                      {new Date(record.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-[#0F172A] text-[13px] font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-400" />
                        {record.charge_type}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold text-[#0F172A] text-[13px]">
                      ₹{Number(record.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-700 text-[13px]">{record.payment_method.replace('_', ' ')}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{record.reference_id || 'No ref'}</div>
                    </td>
                  </tr>
                ))}
                {summary.pending_verification_records?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
                        <h3 className="text-[15px] font-bold text-slate-700 m-0 mb-1">All caught up!</h3>
                        <p className="text-[13px] text-slate-500 m-0">There are no payments waiting for verification.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
