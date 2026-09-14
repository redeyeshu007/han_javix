import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Filter, Eye } from 'lucide-react';
import { Defect, Unit } from '../../types';
import { defectsApi, unitsApi } from '../../api/services';
import { statusLabel, toBackendStatus } from '../../utils/statusMap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES, AppRole } from '../../utils/roleUtils';
import { canAccessDefect } from '../../utils/access';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  // Rows carry the backend Defect.STATUS_CHOICES slug ('open', 'in_progress', …).
  const slug = toBackendStatus('defect', status);
  const isResolved = slug === 'resolved' || slug === 'closed';
  const isOpen = slug === 'open';
  const isInProgress = slug === 'in_progress' || slug === 'assigned';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isResolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isOpen ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
    `}>
      {isResolved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {isOpen && <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>}
      {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
      {statusLabel('defect', slug)}
    </span>
  );
};

const DefectsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeRole } = useRole();
  const ns = ROLE_NAMESPACES[activeRole as AppRole] || '/admin';
  const [defects, setDefects] = useState<Defect[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Filter values are backend slugs; the <option> labels display them.
  const [statusFilter, setStatusFilter] = useState<'All' | 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'>('All');
  const [loading, setLoading] = useState(true);

  const loadDefects = async () => {
    const [fetchedDefects, fetchedUnits] = await Promise.all([
      defectsApi.getDefects(),
      unitsApi.getUnits(),
    ]);
    setDefects(fetchedDefects);
    setUnits(fetchedUnits);
    setLoading(false);
  };

  useEffect(() => {
    loadDefects();
    const interval = setInterval(loadDefects, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const filtered = defects.filter(d => {
    const unit = units.find(u => u.id === d.unitId);
    const searchString = `${d.title} ${d.location} ${unit?.name || ''}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Defects Snag Board
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Assign snags to partners, log rectification activities, and reinspect repairs.
            </p>
          </div>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by title, location or unit..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="pl-2 pr-8 py-1.5 bg-white border border-slate-200 rounded-md text-[13px] font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors shadow-sm"
              >
                <option value="All">All Statuses</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Snag Title</th>
                  <th className="px-5 py-3">Location / Unit</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(d => {
                  const unit = units.find(u => u.id === d.unitId);
                  
                  const items: DropdownItem[] = [
                    { key: '1', label: 'View Snag', icon: <Eye size={14} />, onClick: () => navigate(`${ns}/defects/${d.id}`) },
                  ];

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <AlertTriangle size={16} />
                          </div>
                          <div className="font-semibold text-[#0F172A] text-[13px]">{d.title}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px]">
                        <div className="flex flex-col gap-0.5">
                          <span>{d.location}</span>
                          <span className="text-[11px] text-slate-400">Unit: {unit?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[12px] font-semibold ${d.severity === 'High' ? 'text-red-600' : d.severity === 'Medium' ? 'text-amber-600' : 'text-slate-600'}`}>
                          {d.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={d.status} />
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
                        <AlertTriangle className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No defects recorded</p>
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

export default DefectsList;
