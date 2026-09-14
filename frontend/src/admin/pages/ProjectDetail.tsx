import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus, FolderPlus, Loader2, ArrowLeft, Building2,
  Layers, Home, CheckCircle2, AlertCircle, Clock, ChevronRight
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES } from '../../utils/roleUtils';

/* ── helpers ─────────────────────────────────────────────────────────── */
const formatStatus = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const unitStatusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
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

const projectStatusConfig: Record<string, { bg: string; text: string; border: string }> = {
  draft:                    { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
  active:                   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  nearing_completion:       { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  inspection_stage:         { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  customer_handover_stage:  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  completed:                { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
  archived:                 { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
};

/* ── sub-components ──────────────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = projectStatusConfig[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {formatStatus(status)}
    </span>
  );
};

const UnitBadge: React.FC<{ unit: any; ns: string }> = ({ unit, ns }) => {
  const cfg = unitStatusConfig[unit.status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
  return (
    <Link to={`${ns}/units/${unit.id}`} className="group no-underline">
      <div className={`flex flex-col items-center justify-center p-3 min-w-[96px] rounded-xl border ${cfg.border} ${cfg.bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>
        <span className="text-[14px] font-bold text-[#0F172A]">{unit.unit_number}</span>
        <span className={`text-[10px] font-semibold mt-1 ${cfg.text}`}>{formatStatus(unit.status)}</span>
      </div>
    </Link>
  );
};

/* ── modal wrapper ───────────────────────────────────────────────────── */
const ModalOverlay: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h3 className="text-[17px] font-bold text-[#0F172A]">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none">×</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

/* ── form helpers ────────────────────────────────────────────────────── */
const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> = ({ label, required, error, children }) => (
  <div>
    <label className="block text-[12px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
  </div>
);

const inputCls = (err?: string) =>
  `w-full px-3 py-2.5 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-slate-400 outline-none transition-colors font-medium
   ${err ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10'}`;

/* ══════════════════════════════════════════════════════════════════════ */
const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeRole } = useRole();
  const [project, setProject] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Block Modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockCode, setNewBlockCode] = useState('');
  const [newBlockDescription, setNewBlockDescription] = useState('');
  const [newBlockFloors, setNewBlockFloors] = useState('');

  // Floor Modal
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [floorBlockId, setFloorBlockId] = useState('');
  const [newFloorName, setNewFloorName] = useState('');
  const [newFloorNumber, setNewFloorNumber] = useState('');
  const [newFloorDescription, setNewFloorDescription] = useState('');

  // Unit Modal
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitBlockId, setUnitBlockId] = useState('');
  const [unitFloorId, setUnitFloorId] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitArea, setNewUnitArea] = useState('');
  const [newUnitBedrooms, setNewUnitBedrooms] = useState('1');
  const [newUnitBathrooms, setNewUnitBathrooms] = useState('1');
  const [newUnitStatus, setNewUnitStatus] = useState('not_started');

  const loadAllData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [projectRes, blocksRes, floorsRes, unitsRes] = await Promise.all([
        apiClient.get(`/projects/projects/${id}/`),
        apiClient.get(`/projects/blocks/?project=${id}`),
        apiClient.get(`/projects/floors/`),
        apiClient.get(`/projects/units/?floor__block__project=${id}`),
      ]);
      setProject(projectRes.data);
      const blks = blocksRes.data.results || blocksRes.data;
      setBlocks(blks);
      const blkIds = new Set(blks.map((b: any) => String(b.id)));
      const allFloors = floorsRes.data.results || floorsRes.data;
      setFloors(allFloors.filter((f: any) => blkIds.has(String(f.block))));
      setUnits(unitsRes.data.results || unitsRes.data);
      if (blks.length > 0) {
        setUnitBlockId(String(blks[0].id));
        setFloorBlockId(String(blks[0].id));
      }
    } catch (err: any) {
      setError('Failed to load project data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  useEffect(() => {
    const avail = floors.filter(f => String(f.block) === unitBlockId);
    if (avail.length > 0) {
      if (!avail.find(f => String(f.id) === unitFloorId)) setUnitFloorId(String(avail[0].id));
    } else setUnitFloorId('');
  }, [unitBlockId, floors]);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!newBlockName.trim()) errs.name = 'Required';
    if (!newBlockCode.trim()) errs.code = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/projects/blocks/', {
        project: id, name: newBlockName, code: newBlockCode,
        description: newBlockDescription,
        total_floors: newBlockFloors ? Number(newBlockFloors) : undefined,
      });
      setNewBlockName(''); setNewBlockCode(''); setNewBlockDescription(''); setNewBlockFloors('');
      setShowBlockModal(false);
      setErrors({});
      await loadAllData();
    } catch (err: any) {
      const detail = err.response?.data;
      alert('Failed to create block: ' + (typeof detail === 'object' ? JSON.stringify(detail) : detail));
    } finally { setIsSubmitting(false); }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!newFloorName.trim()) errs.name = 'Required';
    if (!newFloorNumber.trim()) errs.number = 'Required';
    if (!floorBlockId) errs.block = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/projects/floors/', {
        block: floorBlockId, name: newFloorName,
        floor_number: Number(newFloorNumber) || 0,
        description: newFloorDescription,
      });
      setNewFloorName(''); setNewFloorNumber(''); setNewFloorDescription('');
      setShowFloorModal(false);
      setErrors({});
      await loadAllData();
    } catch (err: any) {
      const detail = err.response?.data;
      alert('Failed to create floor: ' + (typeof detail === 'object' ? JSON.stringify(detail) : detail));
    } finally { setIsSubmitting(false); }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: any = {};
    if (!newUnitName.trim()) errs.name = 'Required';
    if (!unitBlockId) errs.block = 'Required';
    if (!unitFloorId) errs.floor = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/projects/units/', {
        floor: unitFloorId, unit_number: newUnitName,
        area_sqft: newUnitArea ? Number(newUnitArea) : undefined,
        bedrooms: Number(newUnitBedrooms) || undefined,
        bathrooms: Number(newUnitBathrooms) || undefined,
        status: newUnitStatus,
      });
      setNewUnitName(''); setNewUnitArea('');
      setNewUnitBedrooms('1'); setNewUnitBathrooms('1'); setNewUnitStatus('under_construction');
      setShowUnitModal(false);
      setErrors({});
      await loadAllData();
    } catch (err: any) {
      const detail = err.response?.data;
      alert('Failed to create unit: ' + (typeof detail === 'object' ? JSON.stringify(detail) : detail));
    } finally { setIsSubmitting(false); }
  };

  const availableFloorsForUnit = floors.filter(f => String(f.block) === unitBlockId);

  /* stats */
  const handedOver = units.filter(u => u.status === 'handed_over').length;
  const inProgress = units.filter(u => u.status === 'construction_in_progress' || u.status === 'not_started').length;
  const readyUnits = units.filter(u => u.status === 'ready_for_handover' || u.status === 'handover_scheduled').length;

  /* ── loading / error states ──────────────────────────────────────── */
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#2563EB]" />
        <p className="text-[14px] font-medium text-slate-500">Loading project…</p>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertCircle size={40} className="text-red-400 mb-3" />
      <p className="text-[16px] font-semibold text-[#0F172A]">{error || 'Project not found.'}</p>
      <button onClick={loadAllData} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[13px] font-medium transition-colors">
        Retry
      </button>
    </div>
  );

  /* ── render ──────────────────────────────────────────────────────── */
  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full">

      {/* ambient background */}
      <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#2563EB]/5 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto w-full">

        {/* ── breadcrumb ─────────────────────────────────────────── */}
        <div className="mb-6">
          <Link
            to="/builder/projects"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-[#2563EB] transition-colors no-underline"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Link>
        </div>

        {/* ── hero header card ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(37,99,235,0.35)] flex-shrink-0">
                <Building2 size={26} color="white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Overview</span>
                </div>
                <h1 className="text-[28px] md:text-[32px] font-bold text-[#0B1F33] leading-tight">{project.name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {project.rera_number && (
                    <span className="text-[13px] font-medium text-slate-500">RERA: <span className="text-[#0F172A] font-semibold">{project.rera_number}</span></span>
                  )}
                  {project.project_type && (
                    <span className="text-[13px] font-medium text-slate-400">·</span>
                  )}
                  {project.project_type && (
                    <span className="text-[13px] font-medium text-slate-500 capitalize">
                      {project.project_type === 'other' && project.project_type_other
                        ? project.project_type_other
                        : project.project_type.replace('_', ' ')}
                    </span>
                  )}
                  <StatusBadge status={project.status} />
                </div>
              </div>
            </div>

            {/* action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeRole !== 'PROJECT_ADMIN' && (
                <>
                  <button
                    onClick={() => setShowBlockModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus size={14} /> Add Block
                  </button>
                  <button
                    onClick={() => {
                      if (blocks.length > 0) { setFloorBlockId(String(blocks[0].id)); setShowFloorModal(true); }
                      else alert('Create a Block first.');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[13px] font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <Plus size={14} /> Add Floor
                  </button>
                  <button
                    onClick={() => {
                      if (blocks.length > 0 && floors.length > 0) setShowUnitModal(true);
                      else alert('Create a Block and at least one Floor first.');
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-[0_4px_12px_-2px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Plus size={14} /> Add Unit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            {[
              { label: 'Blocks', value: blocks.length, icon: FolderPlus, color: 'text-[#2563EB]', bg: 'bg-blue-50' },
              { label: 'Total Units', value: units.length, icon: Home, color: 'text-[#7C3AED]', bg: 'bg-purple-50' },
              { label: 'Handed Over', value: handedOver, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <div className="text-[22px] font-bold text-[#0F172A] leading-none">{value}</div>
                  <div className="text-[12px] font-medium text-slate-500 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── building structure ─────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Building Structure & Units</h2>
          <span className="text-[12px] font-medium text-slate-400">{units.length} unit{units.length !== 1 ? 's' : ''} total</span>
        </div>

        {blocks.length > 0 ? (
          <div className="flex flex-col gap-5">
            {blocks.map(block => {
              const blockFloors = floors.filter(f => String(f.block) === String(block.id));
              const blockUnits = units.filter(u => {
                const floorIds = new Set(blockFloors.map(f => String(f.id)));
                return floorIds.has(String(u.floor));
              });

              return (
                <div key={block.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* block header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                      <Layers size={15} className="text-[#2563EB]" />
                    </div>
                    <div>
                      <span className="text-[15px] font-bold text-[#0F172A]">{block.name}</span>
                      {block.code && <span className="ml-2 text-[12px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{block.code}</span>}
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-[12px] font-medium text-slate-400">
                      <span>{blockFloors.length} floor{blockFloors.length !== 1 ? 's' : ''}</span>
                      <ChevronRight size={14} />
                      <span>{blockUnits.length} unit{blockUnits.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* floors */}
                  <div className="p-6">
                    {blockFloors.length > 0 ? (
                      <div className="flex flex-col gap-5">
                        {blockFloors.map(floor => {
                          const floorUnits = units.filter(u => String(u.floor) === String(floor.id));
                          return (
                            <div key={floor.id} className="flex items-start gap-4">
                              {/* floor label */}
                              <div className="w-[100px] flex-shrink-0 pt-2">
                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{floor.name}</span>
                              </div>
                              {/* units grid */}
                              <div className="flex-1 flex flex-wrap gap-2.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                {floorUnits.length > 0 ? (
                                  floorUnits.map(unit => <UnitBadge key={unit.id} unit={unit} ns={ROLE_NAMESPACES[activeRole as any] || '/builder'} />)
                                ) : (
                                  <div className="flex items-center gap-2 text-[13px] text-slate-400 py-2">
                                    <Home size={14} />
                                    <span>No units on this floor yet.</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Layers size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-[13px] font-medium">No floors yet. Add a floor to this block.</p>
                        <button
                          onClick={() => { setFloorBlockId(String(block.id)); setShowFloorModal(true); }}
                          className="mt-3 text-[13px] font-semibold text-[#2563EB] hover:underline"
                        >
                          + Add Floor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-[#2563EB]" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0F172A] mb-2">No building structure configured</h3>
            <p className="text-[14px] text-slate-500 mb-6 max-w-[320px] mx-auto">
              Create blocks and add units to map this development asset.
            </p>
            <button
              onClick={() => setShowBlockModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_12px_-2px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus size={16} /> Add First Block
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Block Modal */}
      {showBlockModal && (
        <ModalOverlay title="Add Block / Phase" onClose={() => { setShowBlockModal(false); setErrors({}); }}>
          <form onSubmit={handleCreateBlock} className="flex flex-col gap-4">
            <Field label="Block Name" required error={errors.name}>
              <input className={inputCls(errors.name)} value={newBlockName} onChange={e => setNewBlockName(e.target.value)} placeholder="e.g. Block A" />
            </Field>
            <Field label="Block Code" required error={errors.code}>
              <input className={inputCls(errors.code)} value={newBlockCode} onChange={e => setNewBlockCode(e.target.value)} placeholder="e.g. BLK-A" />
            </Field>

            <Field label="Description">
              <textarea className={inputCls()} rows={2} value={newBlockDescription} onChange={e => setNewBlockDescription(e.target.value)} placeholder="Optional description" />
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => { setShowBlockModal(false); setErrors({}); }} disabled={isSubmitting}
                className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60">
                {isSubmitting ? 'Creating…' : 'Create Block'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Floor Modal */}
      {showFloorModal && (
        <ModalOverlay title="Add Floor" onClose={() => { setShowFloorModal(false); setErrors({}); }}>
          <form onSubmit={handleCreateFloor} className="flex flex-col gap-4">
            <Field label="Block" required error={errors.block}>
              <select className={inputCls(errors.block)} value={floorBlockId} onChange={e => setFloorBlockId(e.target.value)}>
                <option value="">Select Block</option>
                {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Floor Name" required error={errors.name}>
                <input className={inputCls(errors.name)} value={newFloorName} onChange={e => setNewFloorName(e.target.value)} placeholder="e.g. Ground Floor" />
              </Field>
              <Field label="Floor Number" required error={errors.number}>
                <input className={inputCls(errors.number)} value={newFloorNumber} onChange={e => setNewFloorNumber(e.target.value)} placeholder="e.g. 1" />
              </Field>
            </div>
            <Field label="Description">
              <textarea className={inputCls()} rows={2} value={newFloorDescription} onChange={e => setNewFloorDescription(e.target.value)} placeholder="Optional" />
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => { setShowFloorModal(false); setErrors({}); }} disabled={isSubmitting}
                className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60">
                {isSubmitting ? 'Creating…' : 'Create Floor'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Unit Modal */}
      {showUnitModal && (
        <ModalOverlay title="Add Unit" onClose={() => { setShowUnitModal(false); setErrors({}); }}>
          <form onSubmit={handleCreateUnit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Block" required error={errors.block}>
                <select className={inputCls(errors.block)} value={unitBlockId} onChange={e => setUnitBlockId(e.target.value)}>
                  <option value="">Select Block</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Floor" required error={errors.floor}>
                <select className={inputCls(errors.floor)} value={unitFloorId} onChange={e => setUnitFloorId(e.target.value)} disabled={availableFloorsForUnit.length === 0}>
                  {availableFloorsForUnit.length === 0 ? <option value="">No floors</option> : <option value="">Select Floor</option>}
                  {availableFloorsForUnit.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Unit Number / Name" required error={errors.name}>
              <input className={inputCls(errors.name)} value={newUnitName} onChange={e => setNewUnitName(e.target.value)} placeholder="e.g. A-101, Villa 4" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Area (sq ft)">
                <input type="number" className={inputCls()} value={newUnitArea} onChange={e => setNewUnitArea(e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Bedrooms">
                <select className={inputCls()} value={newUnitBedrooms} onChange={e => setNewUnitBedrooms(e.target.value)}>
                  {['1','2','3','4','5'].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </Field>
              <Field label="Bathrooms">
                <input type="number" className={inputCls()} value={newUnitBathrooms} onChange={e => setNewUnitBathrooms(e.target.value)} min="1" />
              </Field>
            </div>
            <Field label="Initial Status">
              <select className={inputCls()} value={newUnitStatus} onChange={e => setNewUnitStatus(e.target.value)}>
                <option value="not_started">Not Started</option>
                <option value="construction_in_progress">Construction in Progress</option>
                <option value="ready_for_handover">Ready for Handover</option>
              </select>
            </Field>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => { setShowUnitModal(false); setErrors({}); }} disabled={isSubmitting}
                className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-60">
                {isSubmitting ? 'Creating…' : 'Create Unit'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ProjectDetail;
