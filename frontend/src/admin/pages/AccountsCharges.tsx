import React, { useState, useEffect } from 'react';
import { IndianRupee, FileText, Plus, Search, Filter } from 'lucide-react';
import { chargeService, unitsApi } from '../../api/services';

const AccountsCharges: React.FC = () => {
  const [charges, setCharges] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [chargesData, unitsData] = await Promise.all([
          chargeService.getCharges(),
          unitsApi.getProjectUnitsLite()
        ]);
        setCharges(chargesData);
        setUnits(unitsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCharges = charges.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    const unitName = c.unit_number?.toLowerCase() || '';
    const custName = c.customer_name?.toLowerCase() || '';
    const type = (c.chargeType || c.charge_type || '').toLowerCase().replace(/_/g, ' ');
    return unitName.includes(s) || custName.includes(s) || type.includes(s);
  });

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen p-8 w-full flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight m-0">Charge Registry</h1>
            <p className="text-[14px] text-slate-500 mt-1.5 font-medium">
              Manage all unit charges and payment demands.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-[14px] hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
            <Plus size={18} />
            Raise Charge
          </button>
        </section>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by unit, customer, or charge type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-[14px] hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} className="text-slate-400" />
            Filters
          </button>
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-[12px] uppercase tracking-wider">
                  <th className="px-6 py-4">Unit / Customer</th>
                  <th className="px-6 py-4">Charge Details</th>
                  <th className="px-6 py-4">Raised On</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Amount (₹)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCharges.map((charge) => {
                  const typeLabel = (charge.chargeType || charge.charge_type || '').replace(/_/g, ' ');
                  return (
                    <tr key={charge.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0F172A] text-[14px]">{charge.unit_number || `Unit ${charge.unitId || charge.unit}`}</div>
                        <div className="text-[13px] text-slate-500 mt-0.5">{charge.customer_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[#0F172A] text-[14px] font-medium">
                          <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                            <FileText size={14} />
                          </div>
                          {typeLabel}
                        </div>
                        <div className="text-[12px] text-slate-400 mt-1 truncate max-w-[200px]">
                          {charge.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-[13px]">
                        {new Date(charge.created_at || charge.date || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-[13px] font-medium">
                        {charge.due_date ? new Date(charge.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#0F172A] text-[14px] text-right">
                        {Number(charge.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold border ${
                          charge.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : charge.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {charge.status || 'UNPAID'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredCharges.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">No charges found</h3>
                        <p className="text-[14px] text-slate-500">There are no charges matching your filters.</p>
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

export default AccountsCharges;
