import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Search, ClipboardList, Eye, Plus } from 'lucide-react';
import { inspectionsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { statusLabel, toBackendStatus } from '../../utils/statusMap';


import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES, AppRole } from '../../utils/roleUtils';

const InspectionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const slug = toBackendStatus('inspection', status);
  const isCompleted = slug === 'completed';
  const isFailed = slug === 'needs_reinspection';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isCompleted
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : isFailed
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }
    `}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isCompleted ? 'bg-emerald-600' : isFailed ? 'bg-red-600' : 'bg-amber-500'}`} />
      {statusLabel('inspection', slug) || status || 'Pending'}
    </span>
  );
};

const InspectionsList: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole } = useRole();
  const ns = ROLE_NAMESPACES[activeRole as AppRole] || '/admin';
  const [inspections, setInspections] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await inspectionsApi.getInspections();
        setInspections(data);
      } catch (err) {
        console.error('Failed to load inspections', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return inspections;
    const q = searchTerm.toLowerCase();
    return inspections.filter(ins => {
      const unitName = ((ins as any).unit_name || ins.unitName || '').toLowerCase();
      const projectName = ((ins as any).project_name || ins.projectName || '').toLowerCase();
      return unitName.includes(q) || projectName.includes(q);
    });
  }, [inspections, searchTerm]);

  // Roles that can create new inspections
  const canCreate = ['BUILDER_OWNER', 'SITE_ENGINEER'].includes(activeRole);

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">

        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Snag Inspections
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Monitor quality audits and schedule pre-handover checking loops.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate(`${ns}/inspections/new`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-[13px] font-semibold rounded-lg shadow-sm hover:bg-[#1D4ED8] transition-colors"
            >
              <Plus size={16} />
              New Inspection
            </button>
          )}
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by unit name or project..."
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
                  <th className="px-5 py-3">Unit Name</th>
                  <th className="px-5 py-3">Associated Project</th>
                  <th className="px-5 py-3">Inspection Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(ins => {
                  const unitId = String((ins as any).unit || ins.unitId || '');
                  const unitName = (ins as any).unit_name || ins.unitName || unitId;
                  const projectName = (ins as any).project_name || ins.projectName || '\u2014';

                  return (
                    <tr key={ins.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckSquare size={16} />
                          </div>
                          <div className="font-semibold text-[#0F172A] text-[13px]">Unit {unitName}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-slate-600 text-[13px]">{projectName}</span>
                      </td>
                      <td className="px-5 py-3">
                        <InspectionStatusBadge status={ins.status || 'pending'} />
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-slate-600 text-[13px]">{ins.date || (ins as any).created_at?.split('T')[0] || '\u2014'}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Navigate to StartInspection with unitId — it auto-loads the existing inspection for that unit */}
                          <button
                            onClick={() => navigate(`${ns}/inspections/new?unitId=${unitId}`)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-[#2563EB] text-white text-[12px] font-medium rounded-md shadow-sm transition-colors hover:bg-[#1D4ED8]"
                          >
                            <ClipboardList size={14} className="mr-1.5" />
                            Inspect
                          </button>
                          {unitId && (
                            <button
                              onClick={() => navigate(`${ns}/units/${unitId}`)}
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[12px] font-medium rounded-md shadow-sm transition-colors"
                            >
                              <Eye size={14} className="mr-1.5 text-slate-400" />
                              View Unit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckSquare className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No inspection items found</p>
                        <p className="text-[13px] text-slate-400 mt-1">Inspections appear here once units are assigned to your projects.</p>
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

export default InspectionsList;
