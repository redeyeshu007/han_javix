import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Mail, Phone, Home } from 'lucide-react';
import { customersApi } from '../../api/services';
import { Customer } from '../../types';

const AccountsCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customersApi.getCustomers();
        setCustomers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.phone && c.phone.includes(s));
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
        <section className="flex flex-col mb-8 mt-2">
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight m-0">Customer Accounts</h1>
          <p className="text-[14px] text-slate-500 mt-1.5 font-medium">
            Directory of homebuyers and their associated units.
          </p>
        </section>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-[12px] uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Assigned Units</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A] text-[14px]">{c.name}</div>
                          <div className="text-[12px] text-slate-500 mt-0.5">ID: {c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-[13px] text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            {c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.allocated_units && c.allocated_units.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {c.allocated_units.map((u: any) => (
                            <div key={u.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[12px] font-bold border border-slate-200">
                              <Home size={12} />
                              {u.name || `Unit ${u.id}`}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[13px] italic">No units assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-[13px] font-medium">
                      {c.joined ? new Date(c.joined).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <UserCheck size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">No customers found</h3>
                        <p className="text-[14px] text-slate-500">There are no customers matching your search criteria.</p>
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

export default AccountsCustomers;
