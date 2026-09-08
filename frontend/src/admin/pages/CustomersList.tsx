import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Eye, AlertCircle, Home } from 'lucide-react';
import { Customer, Unit } from '../../types';
import { customersService } from '../../services/customersService';
import { projectsService } from '../../services/projectsService';
import { useRole } from '../../context/RoleContext';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isComplete = status === 'Complete';
  const isAccepted = status === 'Accepted';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isComplete ? 'bg-slate-50 text-slate-700 border-slate-200' : isAccepted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
    `}>
      {isComplete && <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-1.5"></span>}
      {isAccepted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {!isComplete && !isAccepted && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
      {status}
    </span>
  );
};

const CustomersList: React.FC = () => {
  const navigate = useNavigate();
  const { activeBuilderId } = useRole();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth transition
    setTimeout(() => {
      setCustomers(customersService.getCustomers(activeBuilderId));
      setUnits(projectsService.getUnits());
      setLoading(false);
    }, 400);
  }, [activeBuilderId]);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Customers
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Directories of homebuyers, contract associations, and key handovers.
            </p>
          </div>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Table Header/Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Assigned Unit</th>
                  <th className="px-5 py-3">Handover Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const unit = units.find(u => u.id === c.unitId);
                  
                  const items: DropdownItem[] = [
                    { key: '1', label: 'View Profile', icon: <Eye size={14} />, onClick: () => navigate(`/builder/customers/${c.id}`) },
                  ];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px]">
                            {c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="font-semibold text-[#0F172A] text-[13px]">{c.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px]">
                        <div className="flex flex-col gap-0.5">
                          <span>{c.email}</span>
                          <span className="text-[11px] text-slate-400">{c.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {unit ? (
                          <div 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-[12px] border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                            onClick={() => navigate(`/builder/units/${unit.id}`)}
                          >
                            <Home size={12} /> Unit {unit.name}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[12px] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={c.handoverStatus} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Dropdown items={items} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <User className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No customers found</p>
                        <p className="text-sm mt-1">Customers will appear here once onboarded.</p>
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

export default CustomersList;
