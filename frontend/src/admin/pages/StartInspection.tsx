import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckSquare } from 'lucide-react';
import { Project, Unit, Contractor } from '../../types';
import { checklistsApi, inspectionsApi, projectsApi, unitsApi, contractorsApi, defectsApi } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Select, Input, Textarea } from '../../components/ui/FormElements';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES, AppRole } from '../../utils/roleUtils';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  status: 'Pass' | 'Fail' | 'N/A' | 'Not Inspected';
  defectLogged?: boolean;
  defectTitle?: string;
  defectDesc?: string;
  defectLoc?: string;
  defectSeverity?: 'Low' | 'Medium' | 'High';
  defectContractor?: string;
  existingResultId?: string;
}

const StartInspection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeRole } = useRole();
  const ns = ROLE_NAMESPACES[activeRole as AppRole] || '/admin';
  const [searchParams] = useSearchParams();
  const { inspectionId: inspectionIdParam } = useParams<{ inspectionId?: string }>();
  const unitIdParam = searchParams.get('unitId');

  // If opened via /inspections/:inspectionId, resolve unitId from API
  const [resolvedUnitId, setResolvedUnitId] = React.useState<string | null>(null);
  const [resolving, setResolving] = React.useState(!!inspectionIdParam);

  useEffect(() => {
    if (!inspectionIdParam) return;
    const resolve = async () => {
      try {
        const { apiClient } = await import('../../api/client');
        const response = await apiClient.get(`/inspections/inspections/${inspectionIdParam}/`);
        const data = response.data;
        const uid = data.unit ? String(data.unit) : '';
        setResolvedUnitId(uid);
      } catch (e) {
        console.error('Could not resolve inspection', e);
      } finally {
        setResolving(false);
      }
    };
    resolve();
  }, [inspectionIdParam]);

  // Effective unitId: URL param wins, then resolved from inspectionId, then null
  const effectiveUnitIdParam = unitIdParam || resolvedUnitId;

  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);

  // Selection
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  
  // Existing Inspection State
  const [existingInspectionId, setExistingInspectionId] = useState<string | null>(null);
  const [existingDefects, setExistingDefects] = useState<any[]>([]);

  // Checklist Items State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Loading selections and existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projs, unts, conts, chkData] = await Promise.all([
          projectsApi.getProjects(),
          unitsApi.getUnits(),
          contractorsApi.getContractors(),
          checklistsApi.getActiveChecklists()
        ]);
        
        setProjects(projs);
        setUnits(unts);
        setContractors(conts);

        let targetUnitId = effectiveUnitIdParam;
        if (targetUnitId) {
          const targetUnit = unts.find(u => u.id === targetUnitId || String(u.id) === targetUnitId);
          if (targetUnit) {
            const projId = typeof targetUnit.project === 'object' ? targetUnit.project?.id : targetUnit.projectId;
            if (projId) setSelectedProjectId(String(projId));
            setSelectedUnitId(String(targetUnit.id));
          }
        } else if (projs.length > 0) {
          setSelectedProjectId(String(projs[0].id));
        }

        let mapped: ChecklistItem[] = chkData.map((i: any) => ({
          id: i.id,
          category: i.category || 'General',
          name: i.name,
          description: i.description,
          status: 'Not Inspected' as const
        }));

        if (targetUnitId) {
          try {
            const workspace = await unitsApi.getWorkspace(targetUnitId);
            setExistingDefects(workspace.defects || []);
            
            if (workspace.latestInspection) {
              setExistingInspectionId(String(workspace.latestInspection.id));
              
              const resultsMap = new Map();
              (workspace.latestInspection.results || []).forEach((r: any) => {
                 const cid = r.checklist_id || r.checklist?.id || r.checklist;
                 if (cid) resultsMap.set(String(cid), r);
              });
              
              mapped = mapped.map(item => {
                const existing = resultsMap.get(String(item.id));
                if (existing) {
                  let status: 'Pass' | 'Fail' | 'N/A' | 'Not Inspected' = 'Not Inspected';
                  if (existing.result === 'passed') status = 'Pass';
                  if (existing.result === 'defect_found') status = 'Fail';
                  if (existing.result === 'not_applicable') status = 'N/A';
                  
                  // Try to find if there's an existing defect for this result to pre-fill contractor/severity maybe
                  // But just mapping remarks is fine for now
                  return {
                    ...item,
                    status,
                    defectDesc: existing.remarks || '',
                    existingResultId: String(existing.id)
                  };
                }
                return item;
              });
            } else {
              mapped = mapped.map(i => ({ ...i, status: 'Pass' as const }));
            }
          } catch (e) {
            console.error('Could not load unit workspace', e);
            mapped = mapped.map(i => ({ ...i, status: 'Pass' as const }));
          }
        } else {
           mapped = mapped.map(i => ({ ...i, status: 'Pass' as const }));
        }

        setChecklist(mapped);
        setLoadingItems(false);
      } catch (err) {
        console.error('Failed to load inspection data', err);
        setLoadingItems(false);
      }
    };
    
    loadData();
  }, [effectiveUnitIdParam]);

  // Handle Project Change -> Unit Selection Update
  useEffect(() => {
    if (selectedProjectId && !effectiveUnitIdParam) {
      const projectUnits = units.filter(u => {
        const pid = typeof (u as any).project === 'object' ? (u as any).project?.id : u.projectId;
        return String(pid) === String(selectedProjectId);
      });
      if (projectUnits.length > 0) {
        setSelectedUnitId(String(projectUnits[0].id));
      } else {
        setSelectedUnitId('');
      }
    }
  }, [selectedProjectId, units, effectiveUnitIdParam]);

  // When Unit selection changes without URL params (e.g. from dropdown), fetch its workspace to load existing inspection
  useEffect(() => {
    if (selectedUnitId && !effectiveUnitIdParam) {
      const reloadUnitData = async () => {
        try {
          const workspace = await unitsApi.getWorkspace(selectedUnitId);
          setExistingDefects(workspace.defects || []);
          
          if (workspace.latestInspection) {
            setExistingInspectionId(String(workspace.latestInspection.id));
            const resultsMap = new Map();
            (workspace.latestInspection.results || []).forEach((r: any) => {
               const cid = r.checklist_id || r.checklist?.id || r.checklist;
               if (cid) resultsMap.set(String(cid), r);
            });
            
            setChecklist(prev => prev.map(item => {
              const existing = resultsMap.get(String(item.id));
              if (existing) {
                let status: 'Pass' | 'Fail' | 'N/A' | 'Not Inspected' = 'Not Inspected';
                if (existing.result === 'passed') status = 'Pass';
                if (existing.result === 'defect_found') status = 'Fail';
                if (existing.result === 'not_applicable') status = 'N/A';
                
                return {
                  ...item,
                  status,
                  defectDesc: existing.remarks || '',
                  existingResultId: String(existing.id)
                };
              }
              return { ...item, status: 'Pass' as const, defectDesc: '', existingResultId: undefined };
            }));
          } else {
            setExistingInspectionId(null);
            setChecklist(prev => prev.map(item => ({ ...item, status: 'Pass' as const, defectDesc: '', existingResultId: undefined })));
          }
        } catch(e) {}
      };
      reloadUnitData();
    }
  }, [selectedUnitId, effectiveUnitIdParam]);

  const projectContractors = contractors.filter(c => {
    const assigned = c.assigned_projects || [];
    return assigned.includes(selectedProjectId);
  });

  const handleStatusChange = (itemId: string, status: 'Pass' | 'Fail' | 'N/A' | 'Not Inspected') => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          defectTitle: status === 'Fail' && !item.defectTitle ? `Defect: ${item.name}` : item.defectTitle,
          defectLoc: status === 'Fail' && !item.defectLoc ? 'Various locations' : item.defectLoc,
          defectSeverity: status === 'Fail' && !item.defectSeverity ? 'Medium' : item.defectSeverity,
          defectContractor: status === 'Fail' && !item.defectContractor ? (projectContractors[0]?.id || '') : item.defectContractor
        };
      }
      return item;
    }));
  };

  const handleDefectChange = (itemId: string, field: string, value: any) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) return;

    const failedItems = checklist.filter(item => item.status === 'Fail');

    const statusMap: Record<string, string> = {
      'Pass': 'passed',
      'Fail': 'defect_found',
      'N/A': 'not_applicable',
      'Not Inspected': 'not_inspected'
    };

    const resultsInput = checklist.map(item => ({
      checklist: item.id,
      result: statusMap[item.status],
      remarks: item.defectDesc || ''
    }));

    try {
      const inspectionData = {
        unit: selectedUnitId,
        inspection_type: 'internal',
        status: 'completed',
        results_input: resultsInput
      };
      
      let savedInspection;
      if (existingInspectionId) {
        savedInspection = await inspectionsApi.updateInspection(existingInspectionId, inspectionData);
      } else {
        savedInspection = await inspectionsApi.createInspection(inspectionData);
      }

      if (failedItems.length > 0) {
        for (const item of failedItems) {
          const resultRecord = savedInspection.results?.find((r: any) => String(r.checklist) === String(item.id) || String(r.checklist?.id) === String(item.id) || String(r.checklist_id) === String(item.id));
          const inspectionResultId = resultRecord ? resultRecord.id : undefined;

          // Only create defect if there isn't already an open defect for this result record
          const alreadyHasDefect = existingDefects.some(d => 
            (String(d.inspection_result) === String(inspectionResultId) || String(d.inspectionResultId) === String(inspectionResultId)) &&
            !['closed', 'cancelled'].includes(d.status)
          );

          if (!alreadyHasDefect && inspectionResultId) {
            await defectsApi.createDefect({
              unit: selectedUnitId,
              inspection_result: inspectionResultId,
              title: item.defectTitle || `Defect in ${item.name}`,
              description: item.defectDesc || 'Discovered during quality audit.',
              category: 'general',
              priority: (item.defectSeverity || 'Medium').toLowerCase(),
              status: 'open',
              assigned_contractor: item.defectContractor || undefined
            });
          }
        }
      }

      navigate(`${ns}/units/${selectedUnitId}`);
    } catch (err) {
      console.error('Failed to submit inspection:', err);
      alert('Failed to submit inspection. Check console for details.');
    }
  };

  if (resolving) return <div className="flex items-center justify-center min-h-screen text-slate-400 text-[14px]">Loading inspection…</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1 relative z-0">
      <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#2563EB]/5 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto w-full">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />} className="text-[13px] font-semibold text-slate-500 hover:text-[#2563EB] bg-transparent border-transparent hover:bg-transparent shadow-none px-0">
            Cancel & Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(37,99,235,0.35)] flex-shrink-0 text-white">
                <CheckSquare size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    QUALITY ASSURANCE
                  </span>
                </div>
                <h1 className="text-[28px] md:text-[32px] font-bold text-[#0B1F33] leading-tight">
                  {existingInspectionId ? 'Update Snag Inspection' : 'Snag Inspection'}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-slate-600">
                    {existingInspectionId ? 'Modify existing inspection results and log new defects if any.' : 'Conduct physical inspections, log defects, and approve units.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h2 className="text-[15px] font-bold text-[#0B1F33] mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[12px]">1</span>
            Select Asset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label="Project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!!unitIdParam}
            >
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </Select>

            <Select 
              label="Unit"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              disabled={!!unitIdParam || !selectedProjectId}
            >
              <option value="">Select a unit...</option>
              {units.filter(u => {
                const pid = String(typeof (u as any).project === 'object' ? (u as any).project?.id : u.projectId);
                return pid === String(selectedProjectId);
              }).map(u => (
                <option key={u.id} value={String(u.id)}>Unit {u.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-[15px] font-bold text-[#0B1F33] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[12px]">2</span>
                Inspection Checklist
              </h2>
              <p className="text-[13px] text-slate-500 ml-8 mb-6">Review each item. Logging a defect will automatically assign it to the relevant contractor.</p>
              <hr className="border-slate-100 mb-6" />
            </div>

            {loadingItems ? (
              <div className="py-10 text-center text-slate-500">
                Loading global inspection items...
              </div>
            ) : checklist.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                No inspection items found.
              </div>
            ) : (
              Object.keys(
                checklist.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, ChecklistItem[]>)
              ).map(cat => {
                const catItems = checklist.filter(item => item.category === cat);
                return (
                  <div key={cat} className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
                      {cat}
                    </h3>
                    
                    <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                      {catItems.map(item => (
                        <div key={item.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            
                            <div className="flex bg-slate-100 rounded-md p-1">
                              {(['Pass', 'Fail', 'N/A', 'Not Inspected'] as const).map(opt => {
                                const isSel = item.status === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleStatusChange(item.id, opt)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                      isSel 
                                        ? opt === 'Pass' ? 'bg-emerald-500 text-white shadow-sm' :
                                          opt === 'Fail' ? 'bg-red-500 text-white shadow-sm' :
                                          'bg-slate-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {opt === 'Not Inspected' ? 'Skip' : opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {item.status === 'Fail' && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                              <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-4">
                                <AlertTriangle size={16} /> Log Defect for {item.name}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                  label="Defect Title"
                                  value={item.defectTitle || ''}
                                  onChange={(e) => handleDefectChange(item.id, 'defectTitle', e.target.value)}
                                  placeholder="e.g. Broken switch"
                                  required
                                />
                                <Select 
                                  label="Severity"
                                  value={item.defectSeverity || 'Medium'}
                                  onChange={(e) => handleDefectChange(item.id, 'defectSeverity', e.target.value)}
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </Select>
                                <Select 
                                  label="Assign Contractor"
                                  value={item.defectContractor || ''}
                                  onChange={(e) => handleDefectChange(item.id, 'defectContractor', e.target.value)}
                                >
                                  <option value="">Select Contractor...</option>
                                  {projectContractors.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                </Select>
                                <div className="md:col-span-2">
                                  <Textarea 
                                    label="Description"
                                    value={item.defectDesc || ''}
                                    onChange={(e) => handleDefectChange(item.id, 'defectDesc', e.target.value)}
                                    placeholder="Detailed description of the issue..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            <div className="border-t border-slate-200 pt-6 flex justify-end gap-4 mt-8">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">
                {existingInspectionId ? 'Update Inspection' : 'Submit Quality Inspection'}
              </Button>
            </div>
          </div>
        </div>

      </form>
      </div>
    </div>
  );
};

export default StartInspection;
