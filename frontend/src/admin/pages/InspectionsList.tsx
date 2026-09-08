import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Search, ClipboardList } from 'lucide-react';
import { Unit, Project } from '../../types';
import { projectsService } from '../../services/projectsService';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isPassed = status === 'Passed';
  const isFailed = status === 'Failed';
  const isPending = status === 'Pending';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isFailed ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
    `}>
      {isPassed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {isFailed && <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>}
      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
      {isPending ? 'Awaiting Snag Check' : `Inspection ${status}`}
    </span>
  );
};

const InspectionsList: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUnits(projectsService.getUnits());
      setProjects(projectsService.getProjects());
      setLoading(false);
    }, 400);
  }, []);

  const filteredUnits = units.filter(u => {
    const proj = projects.find(p => p.id === u.projectId);
    const searchString = `${u.name} ${proj?.name || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

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
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.map(u => {
                  const proj = projects.find(p => p.id === u.projectId);
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckSquare size={16} />
                          </div>
                          <div className="font-semibold text-[#0F172A] text-[13px]">Unit {u.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-slate-600 text-[13px]">{proj?.name || 'Unknown'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={u.inspectionStatus} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/builder/inspections/new?unitId=${u.id}`)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[12px] font-medium rounded-md shadow-sm transition-colors"
                          >
                            <ClipboardList size={14} className="mr-1.5 text-slate-400" />
                            Inspect
                          </button>
                          <button 
                            onClick={() => navigate(`/builder/units/${u.id}`)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[12px] font-medium rounded-md shadow-sm transition-colors"
                          >
                            View Unit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUnits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CheckSquare className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No inspection items found</p>
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
