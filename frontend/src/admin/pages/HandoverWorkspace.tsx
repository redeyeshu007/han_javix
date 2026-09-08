import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Key, Check, X, ArrowRight } from 'lucide-react';
import { Unit, Project } from '../../types';
import { projectsService } from '../../services/projectsService';
import { documentsService } from '../../services/documentsService';
import { defectsService } from '../../services/defectsService';
import { paymentsService } from '../../services/paymentsService';
import { computeHandoverReadiness } from '../../utils/handoverReadiness';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ isReady: boolean }> = ({ isReady }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border tracking-wide uppercase
      ${isReady ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}
    `}>
      {isReady && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {!isReady && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>}
      {isReady ? 'READY' : 'BLOCKED'}
    </span>
  );
};

const ChecklistItem: React.FC<{ label: string, isCleared: boolean }> = ({ label, isCleared }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-[10px] font-bold text-slate-400 mb-1 tracking-wider uppercase">{label}</span>
      {isCleared ? (
        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
          <Check size={14} className="text-emerald-600 stroke-[3]" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
          <X size={14} className="text-rose-600 stroke-[3]" />
        </div>
      )}
    </div>
  );
};

const HandoverWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setUnits(projectsService.getUnits());
    setProjects(projectsService.getProjects());
    setDocuments(documentsService.getDocuments());
    setDefects(defectsService.getDefects());
    if (paymentsService.getPayments) setPayments(paymentsService.getPayments());
    setLoading(false);
  };

  useEffect(() => {
    setTimeout(loadData, 400);
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = units.filter(u => {
    const p = projects.find(proj => proj.id === u.projectId);
    const searchStr = `${u.name} ${p?.name || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Handover Workspace
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Overview of units nearing occupancy. Clear outstanding compliance and schedule key transitions.
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
                placeholder="Search unit or project..." 
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
                  <th className="px-5 py-3">Unit</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3 text-center">Clearance Audit</th>
                  <th className="px-5 py-3 text-center">Overall Readiness</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(u => {
                  const proj = projects.find(p => p.id === u.projectId);
                  const unitDocs = documents.filter(d => d.unitId === u.id);
                  const unitPayments = payments.filter(p => p.unitId === u.id);
                  const unitDefects = defects.filter(d => d.unitId === u.id);

                  const { docsCleared, approvalsCleared, paymentCleared, defectsCleared, isReadyForHandover: isReady } =
                    computeHandoverReadiness(u, unitDocs, unitPayments, unitDefects);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Key size={16} />
                          </div>
                          <div className="font-semibold text-[#0F172A] text-[14px]">Unit {u.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[13px]">
                        {proj?.name}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-6">
                          <ChecklistItem label="Docs" isCleared={docsCleared} />
                          <ChecklistItem label="Payment" isCleared={paymentCleared} />
                          <ChecklistItem label="Snags" isCleared={defectsCleared} />
                          <ChecklistItem label="Approval" isCleared={approvalsCleared} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge isReady={isReady} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/builder/units/${u.id}`)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[12px] font-semibold rounded-md shadow-sm transition-colors group-hover:border-[#2563EB] group-hover:text-[#2563EB]"
                        >
                          Workspace
                          <ArrowRight size={14} className="ml-1.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Key className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No units in handover pipeline</p>
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

export default HandoverWorkspace;
