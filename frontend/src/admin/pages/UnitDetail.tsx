import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  User, 
  CheckSquare, 
  AlertTriangle, 
  FileText, 
  CreditCard, 
  Key, 
  Wrench, 
  Plus,
  Check,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  Home,
  Layers,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  CheckCircle2,
  Clock,
  Edit2,
  AlertCircle,
  MapPin,
  ChevronRight,
  UserCheck,
  UserX,
  FileCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Unit, Customer, Defect, ServiceRequest, Project, Document, Block, Floor } from '../../types';
import { MUNICIPAL_DOCS_CATEGORY } from '../../utils/handoverReadiness';
import { formatINR } from '../../utils/currency';
import { useRole } from '../../context/RoleContext';
import { ROLE_NAMESPACES } from '../../utils/roleUtils';
import { unitsApi, defectsApi, serviceRequestsApi, paymentService, documentService, auditService, fetchTeamShared, handoverApi } from '../../api/services';
import { statusLabel, toBackendStatus, DOCUMENT_PENDING_REVIEW_STATUSES } from '../../utils/statusMap';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { CredentialSuccessCard } from '../../components/CredentialSuccessCard';
import { UnitDocumentManagement } from '../components/UnitDocumentManagement';
import { UnitPaymentManagement } from '../components/UnitPaymentManagement';
// Phase 6 component split — unit tab/modal components (pure move from this file)
import { OverviewTab, CustomerTab, InspectionTab, DefectsTab, DocumentsTab, PaymentsTab, HandoverTab, CustomerModals, LogDefectModal, EditUnitModal } from '../components/unit';
import { inputCls, labelCls, UnitStatusBadge } from '../components/unit/shared';

const extractAllocationError = (err: any): Record<string, string> => {
  const data = err?.response?.data;
  if (!data) return { form: err?.message || 'Failed to allocate customer.' };
  if (typeof data === 'string') return { form: data };
  if (data.detail) return { form: String(data.detail) };
  const fieldMap: Record<string, string> = {
    email: 'customerEmail',
    name: 'customerName',
    phone: 'customerPhone',
    password: 'customerPassword',
    customer_id: 'customerEmail',
  };
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    const msg = Array.isArray(value) ? String(value[0]) : String(value);
    const target = fieldMap[key];
    if (target) out[target] = msg;
    else out.form = out.form ? `${out.form} ${msg}` : msg;
  }
  return out;
};

const UnitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeRole } = useRole();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [handoverRecord, setHandoverRecord] = useState<any | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [contractorsList, setContractorsList] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  // Floor options for the Edit Unit modal, fetched per selected block from the API
  const [editFloors, setEditFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'inspection' | 'defects' | 'documents' | 'payments' | 'handover'>('overview');

  // Customer Assignment Form
  const [showAssignCustomer, setShowAssignCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [confirmCustomerPassword, setConfirmCustomerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [assignErrors, setAssignErrors] = useState<any>({});
  
  // Credential Card state
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<{name: string, role: string, email: string, password?: string} | null>(null);

  // Unassign confirmation
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [unassignError, setUnassignError] = useState<string | null>(null);

  // Edit Unit Form
  const [showEditUnit, setShowEditUnit] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editUnitForm, setEditUnitForm] = useState({
    name: '',
    blockId: '',
    floorId: '',
    type: '',
    areaSqFt: 0,
    bedrooms: 0,
    bathrooms: 0,
    status: ''
  });

  // Defect Logging Form
  const [showLogDefect, setShowLogDefect] = useState(false);
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDesc, setDefectDesc] = useState('');
  const [defectLoc, setDefectLoc] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [defectContractor, setDefectContractor] = useState('');
  const [defectErrors, setDefectErrors] = useState<any>({});


  const applyWorkspace = (ws: any) => {
    if (!ws?.unit) {
      setError('Unit not found');
      return;
    }
    setUnit(ws.unit as Unit);
    setProject(ws.project as Project | null);
    setCustomer(ws.customer as Customer | null);
    setDefects(ws.defects || []);
    setDocuments(ws.documents || []);
    setPayments(ws.payments || []);
    setServiceRequests(ws.serviceRequests || []);
    setInspections(ws.inspections || []);
    // Server-computed readiness + the real HandoverRecord are the single
    // source of truth for the Handover tab and the Overview checklist.
    setReadiness(ws.readiness ?? null);
    setHandoverRecord(ws.handoverRecord ?? null);
    // Block/floor display names come straight from the workspace unit — the
    // page no longer loads the whole project tree to resolve them.
    setBlocks([]);
  };

  // refresh=true bypasses the shared guard/page promise: used after mutations
  // so stale rows never linger. Still ONE request — never the old waterfall.
  const loadData = async (refresh = false) => {
    if (!id) return;
    try {
      setError(null);
      const ws = await unitsApi.getWorkspace(id, refresh);
      applyWorkspace(ws);
    } catch (err: any) {
      console.error('Failed to load unit details:', err);
      setError(err?.response?.status === 404 ? 'Unit not found' : 'Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  // Targeted slice invalidation (master-prompt §29): each mutator refetches
  // only what it changed, through the existing filtered endpoints.
  const refreshDefects = async () => {
    if (!id) return;
    try { setDefects(await defectsApi.getDefects(undefined, id)); } catch (e) { console.warn('Could not refresh defects', e); }
  };
  const refreshDocuments = async () => {
    if (!id) return;
    try { setDocuments(await documentService.getDocuments({ unitId: id })); } catch (e) { console.warn('Could not refresh documents', e); }
  };
  const refreshPayments = async () => {
    if (!id) return;
    try { setPayments(await paymentService.getPayments(id)); } catch (e) { console.warn('Could not refresh payments', e); }
  };
  const refreshServiceRequests = async () => {
    if (!id) return;
    try { setServiceRequests(await serviceRequestsApi.getRequests(id)); } catch (e) { console.warn('Could not refresh service requests', e); }
  };

  // Defects need contractor names: one shared GET /accounts/team/ per unit
  // open (deduplicated with any other consumer via api/sharedFetch).
  const openLogDefect = () => {
    setShowLogDefect(true);
    fetchTeamShared()
      .then((team: any[]) => {
        setContractorsList(
          team
            .filter((c: any) => c.role === 'CONTRACTOR')
            .map((c: any) => ({
              id: String(c.id),
              name: c.full_name || c.name || c.email || '',
              trade: c.trade || '',
              assignedProjectIds: (c.assigned_project_ids || []).map(String),
            }))
        );
      })
      .catch(e => console.warn('Could not load contractors', e));
  };

  const openEditUnit = () => {
    if (unit) {
      setEditUnitForm({
        name: unit.name || '',
        blockId: unit.blockId || '',
        floorId: unit.floorId || '',
        type: unit.type || '',
        areaSqFt: unit.areaSqFt || 0,
        bedrooms: unit.bedrooms || 0,
        bathrooms: unit.bathrooms || 0,
        status: unit.status || ''
      });
      setShowEditUnit(true);
      // Block dropdown options are only needed inside this modal — fetch on
      // open instead of on page load (one interaction-scoped request).
      if (unit.projectId) {
        unitsApi.getBlocks(unit.projectId)
          .then((list: any) => setBlocks(list))
          .catch(e => console.warn('Could not load blocks for project', e));
      }
      // Fetch the unit's current block floors so the Floor dropdown preselects the existing floor
      if (unit.blockId) {
        unitsApi.getFloors(unit.blockId)
          .then((list: any) => setEditFloors(list))
          .catch(e => console.warn('Could not load floors for block', e));
      } else {
        setEditFloors([]);
      }
    }
  };

  const handleEditUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Send every editable field under its writable UnitSerializer name.
      // `name`/`type`/`areaSqFt` are declared read_only and `parking`/`blockId`
      // don't exist on the serializer, so those keys were silently dropped;
      // the writable model fields are `unit_number`/`unit_type`/`area_sqft`/
      // `parking_details`. Block is reached through Floor, so it is not sent.
      await unitsApi.updateUnit(id, {
        unit_number: editUnitForm.name,
        // Omit when empty so DRF doesn't reject the whole PATCH on the FK.
        ...(editUnitForm.floorId ? { floor: editUnitForm.floorId } : {}),
        unit_type: editUnitForm.type,
        area_sqft: editUnitForm.areaSqFt,
        bedrooms: editUnitForm.bedrooms,
        bathrooms: editUnitForm.bathrooms,
        status: editUnitForm.status as any
      });
      setShowEditUnit(false);
      await loadData(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAssignCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!customerName.trim()) newErrors.customerName = 'Required';
    if (!customerEmail.trim()) newErrors.customerEmail = 'Required';

    if (!customerPhone.trim()) newErrors.customerPhone = 'Required';
    // Password is intentionally optional: when the email matches an existing
    // same-company customer, the backend LINKS that account (no password
    // needed); otherwise it creates one and the backend rejects a missing
    // password with a real message. Only the match check stays client-side.
    if (customerPassword && customerPassword !== confirmCustomerPassword) {
      newErrors.confirmCustomerPassword = 'Passwords do not match.';
    }

    setAssignErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!id || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await unitsApi.assignCustomer(id, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        ...(customerPassword ? { password: customerPassword } : {}),
      });

      // Credentials card only for a genuinely new account — a linked account
      // keeps its existing password.
      if (result.accountCreated) {
        setNewlyCreatedCustomer({
          name: customerName,
          role: 'Customer',
          email: customerEmail,
          password: customerPassword
        });
        setShowSuccessCard(true);
      }

      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerPassword('');
      setConfirmCustomerPassword('');
      setShowAssignCustomer(false);
      await loadData(true);
    } catch (err: any) {
      setAssignErrors(extractAllocationError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignCustomer = async () => {
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await unitsApi.unassignCustomer(id);
      setShowUnassignConfirm(false);
      setUnassignError(null);
      await loadData(true);
    } catch (err: any) {
      setUnassignError(extractAllocationError(err).form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!defectTitle.trim()) newErrors.defectTitle = 'Required';
    if (!defectLoc.trim()) newErrors.defectLoc = 'Required';
    
    setDefectErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!id || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Backend Defect writable fields: unit, description, priority,
      // assigned_contractor. title/location are embedded into `description`
      // and reported_by is set server-side (see api/normalize.ts).
      await defectsApi.createDefect({
        unitId: id,
        title: defectTitle,
        location: defectLoc,
        description: defectDesc,
        severity: toBackendStatus('defectPriority', defectSeverity),
        contractorId: defectContractor || contractorsList[0]?.id || '',
      });

      await auditService.createAuditLog({
        projectId: project?.id || '',
        unitId: id,
        action: 'Defect Created',
        actor: activeRole || 'Admin',
        details: `Created defect: ${defectTitle} at ${defectLoc}`
      });

      setDefectTitle('');
      setDefectDesc('');
      setDefectLoc('');
      setShowLogDefect(false);
      await refreshDefects();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handover-record toggles: keys/approvals live on the real
  // HandoverRecord (Builder-Owner-gated server-side), never on phantom
  // unit fields. The backend auto-completes when everything is true.
  const toggleRecordField = async (backendField: string) => {
    if (!unit || isSubmitting) return;
    setIsSubmitting(true);
    setRecordError(null);
    try {
      let rec = handoverRecord;
      if (!rec) {
        rec = await handoverApi.ensureRecord(unit.id);
        setHandoverRecord(rec);
      }
      const updated = await handoverApi.updateRecord(rec.id, { [backendField]: !rec[backendField] });
      setHandoverRecord(updated);
      if (updated.status === 'HANDED_OVER') await loadData(true);
    } catch (err: any) {
      setRecordError(err?.response?.data?.detail || err?.message || 'Could not update the handover record.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) return <PageLoading message="Loading unit details..." />;

  const roleStr = (activeRole as string)?.toUpperCase() || '';
  const ns = ROLE_NAMESPACES[activeRole as any] || '/builder';
  // Site Engineers navigate back to their Inspections list (they have no project-level view).
  const backUrl = roleStr === 'SITE_ENGINEER'
    ? `${ns}/inspections`
    : unit?.projectId ? `${ns}/projects/${unit.projectId}` : `${ns}/projects`;

  if (error || !unit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#F8FAFC]">
        <AlertCircle size={44} className="text-red-400 mb-3" />
        <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">
          {error || 'Unit Not Found'}
        </h3>
        <p className="text-[14px] text-slate-500 mb-5 max-w-md">
          {error === 'Unit not found'
            ? 'The requested unit could not be found or you do not have permission to view it.'
            : 'Unable to load unit details from the database.'}
        </p>
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold rounded-xl shadow-sm transition-colors no-underline"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>
      </div>
    );
  }

  const unitDocsData = documents;
  const unitPayments = payments;
  const unitDefects = defects;


  const canEditUnit = roleStr === 'BUILDER_OWNER' || roleStr === 'PROJECT_ADMIN' || roleStr === 'SUPER_ADMIN';
  const canInspect = roleStr === 'SITE_ENGINEER' || roleStr === 'BUILDER_OWNER';
  const canManageHandover = roleStr === 'BUILDER_OWNER' || roleStr === 'SUPER_ADMIN';
  const canApproveDocs = roleStr === 'BUILDER_OWNER' || roleStr === 'SITE_ENGINEER' || roleStr === 'SUPER_ADMIN';
  const canRecordPayment = roleStr === 'BUILDER_OWNER' || roleStr === 'ACCOUNTS' || roleStr === 'CUSTOMER';
  const canVerifyPayment = roleStr === 'ACCOUNTS' || roleStr === 'BUILDER_OWNER' || roleStr === 'SUPER_ADMIN';

  const municipalDocs = unitDocsData.filter(d => d.category === MUNICIPAL_DOCS_CATEGORY);

  // Server-computed readiness (workspace) is the single source of truth.
  const wsReadiness: any = readiness || {};
  const docsCleared = Boolean(wsReadiness.documents_ready);
  const paymentCleared = Boolean(wsReadiness.payment_ready);
  const defectsCleared = Boolean(wsReadiness.defects_ready);
  const actualApprovalsCleared = Boolean(wsReadiness.approvals_ready);
  const keysHandedOverFlag = Boolean(wsReadiness.keys_handed_over);
  const isReadyForHandover = Boolean(wsReadiness.is_ready);

  // Backend document statuses that still need a review decision.
  const pendingMunicipalDoc = municipalDocs.find(d => DOCUMENT_PENDING_REVIEW_STATUSES.includes(d.status));

  // Block/floor names arrive on the workspace unit (unit.blockName/floorName).
  const blockName = unit.blockName || (unit.blockId ? `Block ${unit.blockId}` : null);
  const floorName = unit.floorName || (unit.floorId ? `Floor ${unit.floorId}` : null);

  // Build the inspection URL using the role namespace so SITE_ENGINEER
  // navigates to /site-engineer/inspections/new (not /builder/...).
  const inspectionUrl = `${ns}/inspections/new?unitId=${unit.id}`;

  const handleUpdatePaymentStatus = async (paymentId: string, status: 'Verified' | 'Cleared' | 'Rejected') => {
    setIsSubmitting(true);
    try {
      // updatePaymentStatus maps the UI intent to the real
      // PaymentClearance.STATUS_CHOICES slug; verified_by/verified_at are
      // stamped server-side from the authenticated user.
      await paymentService.updatePaymentStatus(paymentId, status);
      await refreshPayments();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveMunicipalDoc = async () => {
    if (!pendingMunicipalDoc) return;
    setIsSubmitting(true);
    try {
      const { documentService } = await import('../../api/services');
      await documentService.verifyDocument(pendingMunicipalDoc.id);
      await refreshDocuments();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Building2 size={16} /> },
    { id: 'customer', label: 'Customer', icon: <User size={16} /> },
    { id: 'inspection', label: 'Inspection', icon: <CheckSquare size={16} /> },
    { id: 'defects', label: 'Defects', icon: <AlertTriangle size={16} />, badge: defects.length },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'handover', label: 'Handover', icon: <Key size={16} /> },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1 relative z-0">
      {/* ambient background */}
      <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#2563EB]/5 to-transparent pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* ── Breadcrumb ── */}
        <div className="mb-6">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-[#2563EB] transition-colors no-underline group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Project
          </Link>
        </div>

        {/* ── Hero Header Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col">
          {/* Top Section */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(37,99,235,0.35)] flex-shrink-0 text-white">
                <Home size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {project?.name || 'Project'} / UNIT DETAILS
                  </span>
                </div>
                <h1 className="text-[28px] md:text-[32px] font-bold text-[#0B1F33] leading-tight">
                  {unit.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {unit.type && (
                    <span className="text-[13px] font-semibold text-slate-600 capitalize">{unit.type}</span>
                  )}
                  {blockName && (
                    <>
                      <span className="text-[13px] font-medium text-slate-300">·</span>
                      <span className="text-[13px] font-medium text-slate-500">{blockName}</span>
                    </>
                  )}
                  {floorName && (
                    <>
                      <span className="text-[13px] font-medium text-slate-300">·</span>
                      <span className="text-[13px] font-medium text-slate-500">{floorName}</span>
                    </>
                  )}
                  <UnitStatusBadge status={unit.status} />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {canEditUnit && (
                <button
                  onClick={openEditUnit}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold shadow-sm transition-all duration-200"
                >
                  <Edit2 size={14} /> Edit Unit
                </button>
              )}
              {canInspect && (
                <Link
                  to={inspectionUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-[0_4px_12px_-2px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all duration-200 no-underline"
                >
                  <CheckSquare size={14} /> Start Inspection
                </Link>
              )}
            </div>
          </div>

          {/* Bottom Section: Integrated KPI Strip */}
          <div className="border-t border-slate-100 bg-[#FAFCFF] rounded-b-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="p-4 md:p-5 flex items-center gap-3.5 hover:bg-blue-50/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center flex-shrink-0">
                  <CheckSquare size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Inspection</div>
                  <div className="text-[15px] font-bold text-[#0F172A] leading-none truncate">{unit.inspectionStatus || 'Pending'}</div>
                </div>
              </div>

              <div className="p-4 md:p-5 flex items-center gap-3.5 hover:bg-purple-50/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-100/50 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Homebuyer</div>
                  <div className="text-[15px] font-bold text-[#0F172A] leading-none truncate">{customer?.name || 'Unassigned'}</div>
                </div>
              </div>

              <div className="p-4 md:p-5 flex items-center gap-3.5 hover:bg-amber-50/30 transition-colors">
                <div className={`w-10 h-10 rounded-full ${defects.length > 0 ? 'bg-amber-100/50' : 'bg-emerald-100/50'} flex items-center justify-center flex-shrink-0`}>
                  <AlertTriangle size={18} className={defects.length > 0 ? 'text-amber-600' : 'text-emerald-600'} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Open Snags</div>
                  <div className="text-[15px] font-bold text-[#0F172A] leading-none truncate">
                    {defects.length > 0 ? `${defects.length} Logged` : 'Zero Snags'}
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-5 flex items-center gap-3.5 hover:bg-emerald-50/30 transition-colors">
                <div className={`w-10 h-10 rounded-full ${isReadyForHandover ? 'bg-emerald-100/50' : 'bg-slate-200/50'} flex items-center justify-center flex-shrink-0`}>
                  <Key size={18} className={isReadyForHandover ? 'text-emerald-600' : 'text-slate-500'} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Handover</div>
                  <div className="text-[15px] font-bold text-[#0F172A] leading-none truncate">
                    {isReadyForHandover ? 'Ready' : 'In Progress'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Modern Tabs Navigation ── */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-[14px] font-semibold transition-all border-b-2 whitespace-nowrap outline-none focus:outline-none focus:ring-0 ${
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span className={isActive ? 'text-[#2563EB]' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-blue-100 text-[#2563EB]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Workspaces Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[420px]">
          
          <OverviewTab
            blockName={blockName}
            defectsCleared={defectsCleared}
            project={project}
            floorName={floorName}
            activeTab={activeTab}
            paymentCleared={paymentCleared}
            unit={unit}
            docsCleared={docsCleared}
            keysHandedOverFlag={keysHandedOverFlag}
          />
          <CustomerTab
            setUnassignError={setUnassignError}
            canEditUnit={canEditUnit}
            setShowAssignCustomer={setShowAssignCustomer}
            activeTab={activeTab}
            setAssignErrors={setAssignErrors}
            customer={customer}
            unit={unit}
            setShowUnassignConfirm={setShowUnassignConfirm}
          />
          <InspectionTab
            canInspect={canInspect}
            activeTab={activeTab}
            inspectionUrl={inspectionUrl}
            customer={customer}
            unit={unit}
            inspections={inspections}
          />
          <DefectsTab
            canInspect={canInspect}
            defects={defects}
            activeTab={activeTab}
            unit={unit}
            openLogDefect={openLogDefect}
          />
          <DocumentsTab
            documents={documents}
            actualApprovalsCleared={actualApprovalsCleared}
            isSubmitting={isSubmitting}
            setShowDocumentModal={setShowDocumentModal}
            pendingMunicipalDoc={pendingMunicipalDoc}
            handleApproveMunicipalDoc={handleApproveMunicipalDoc}
            activeTab={activeTab}
            docsCleared={docsCleared}
            canApproveDocs={canApproveDocs}
          />
          <PaymentsTab
            handleUpdatePaymentStatus={handleUpdatePaymentStatus}
            canRecordPayment={canRecordPayment}
            isSubmitting={isSubmitting}
            payments={payments}
            setShowPaymentModal={setShowPaymentModal}
            activeTab={activeTab}
            paymentCleared={paymentCleared}
            unit={unit}
            canVerifyPayment={canVerifyPayment}
          />
          <HandoverTab
            loadData={loadData}
            handoverRecord={handoverRecord}
            actualApprovalsCleared={actualApprovalsCleared}
            canManageHandover={canManageHandover}
            isSubmitting={isSubmitting}
            defectsCleared={defectsCleared}
            isReadyForHandover={isReadyForHandover}
            activeTab={activeTab}
            paymentCleared={paymentCleared}
            unit={unit}
            docsCleared={docsCleared}
            toggleRecordField={toggleRecordField}
            keysHandedOverFlag={keysHandedOverFlag}
            recordError={recordError}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      </div>
      {/* ── MODALS ── */}

          <CustomerModals
            customerPassword={customerPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            assignErrors={assignErrors}
            customerName={customerName}
            confirmCustomerPassword={confirmCustomerPassword}
            showUnassignConfirm={showUnassignConfirm}
            isSubmitting={isSubmitting}
            customerEmail={customerEmail}
            setCustomerPhone={setCustomerPhone}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            handleAssignCustomer={handleAssignCustomer}
            setShowAssignCustomer={setShowAssignCustomer}
            showPassword={showPassword}
            unassignError={unassignError}
            setCustomerPassword={setCustomerPassword}
            customerPhone={customerPhone}
            showAssignCustomer={showAssignCustomer}
            handleUnassignCustomer={handleUnassignCustomer}
            customer={customer}
            unit={unit}
            setConfirmCustomerPassword={setConfirmCustomerPassword}
            setCustomerName={setCustomerName}
            setCustomerEmail={setCustomerEmail}
            setShowUnassignConfirm={setShowUnassignConfirm}
          />
          <LogDefectModal
            defectContractor={defectContractor}
            setDefectContractor={setDefectContractor}
            handleLogDefect={handleLogDefect}
            defectTitle={defectTitle}
            defectDesc={defectDesc}
            defectErrors={defectErrors}
            showLogDefect={showLogDefect}
            setDefectSeverity={setDefectSeverity}
            isSubmitting={isSubmitting}
            setDefectLoc={setDefectLoc}
            contractorsList={contractorsList}
            defectLoc={defectLoc}
            setShowLogDefect={setShowLogDefect}
            setDefectDesc={setDefectDesc}
            defectSeverity={defectSeverity}
            setDefectTitle={setDefectTitle}
          />
      {/* 4. Credential Success Card */}
      {showSuccessCard && newlyCreatedCustomer && (
        <CredentialSuccessCard 
          name={newlyCreatedCustomer.name}
          role={newlyCreatedCustomer.role}
          email={newlyCreatedCustomer.email}
          password={newlyCreatedCustomer.password}
          onClose={() => {
            setShowSuccessCard(false);
            setNewlyCreatedCustomer(null);
          }}
        />
      )}

          <EditUnitModal
            editFloors={editFloors}
            showEditUnit={showEditUnit}
            setEditUnitForm={setEditUnitForm}
            setEditFloors={setEditFloors}
            isSubmitting={isSubmitting}
            handleEditUnitSubmit={handleEditUnitSubmit}
            blocks={blocks}
            setShowEditUnit={setShowEditUnit}
            editUnitForm={editUnitForm}
          />
      {/* 6. Document Modal */}
      {showDocumentModal && (
        <UnitDocumentManagement
          unitId={unit.id}
          projectId={unit.projectId}
          unitDocs={unitDocsData}
          onClose={() => setShowDocumentModal(false)}
          onRefresh={refreshDocuments}
        />
      )}

      {/* 7. Payment Modal */}
      {showPaymentModal && (
        <UnitPaymentManagement
          unitId={unit.id}
          projectId={unit.projectId}
          customerId={unit.customerId}
          clearanceId={payments[0]?.id}
          onClose={() => setShowPaymentModal(false)}
          onRefresh={refreshPayments}
        />
      )}
    </div>
  );
};

export default UnitDetail;
