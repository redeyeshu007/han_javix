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
  EyeOff
} from 'lucide-react';
import { Unit, Customer, Defect, ServiceRequest, Project, Document, Block, Floor } from '../../types';;
import { computeHandoverReadiness, MUNICIPAL_DOCS_CATEGORY } from '../../utils/handoverReadiness';
import { useRole } from '../../context/RoleContext';
import { unitsApi, projectsApi, customersApi, defectsApi, serviceRequestsApi, paymentService, auditService, contractorsApi } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { CredentialSuccessCard } from '../../components/CredentialSuccessCard';
import { UnitDocumentManagement } from '../components/UnitDocumentManagement';
import { UnitPaymentManagement } from '../components/UnitPaymentManagement';

const UnitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeRole, activeBuilderId } = useRole();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [contractorsList, setContractorsList] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'inspection' | 'defects' | 'documents' | 'payments' | 'handover' | 'care'>('overview');

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
    parking: '',
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

  // Care Request Form
  const [showCareRequest, setShowCareRequest] = useState(false);
  const [careDescription, setCareDescription] = useState('');
  const [careErrors, setCareErrors] = useState<any>({});

  const loadData = async () => {
    if (!id) return;
    try {
      const unitsList = await unitsApi.getUnits();
      const u = unitsList.find(unit => unit.id === id);
      if (u) {
        setUnit(u);
        
        const projectsList = await projectsApi.getProjects();
        const p = projectsList.find(proj => proj.id === u.projectId);
        if (p) setProject(p);

        const blocksList = await unitsApi.getBlocks(u.projectId);
        setBlocks(blocksList);
        const floorsList = await unitsApi.getFloors();
        setFloors(floorsList.filter(f => f.projectId === u.projectId));

        if (u.customerId) {
          const customersList = await customersApi.getCustomers();
          const c = customersList.find(cust => cust.id === u.customerId);
          if (c) setCustomer(c);
        } else {
          setCustomer(null);
        }

        const docsList = await (await import('../../api/services')).documentService.getDocuments();
        setDocuments(docsList.filter((d: any) => d.unitId === id));
        if (paymentService.getPayments) {
          const paymentsList = await paymentService.getPayments(id);
          setPayments(paymentsList);
        }
        
        const defectsList = await defectsApi.getDefects();
        setDefects(defectsList.filter((d: any) => d.unitId === id));

        const allSR = await serviceRequestsApi.getRequests();
        setServiceRequests(allSR.filter(sr => sr.unitId === id));

        const allContractors = await contractorsApi.getContractors();
        setContractorsList(allContractors.filter((c: any) => 
          c.builderId === (p?.builderId || activeBuilderId) && 
          (c.assignedProjectIds || []).includes(u.projectId)
        ));
      }
    } finally {
      setLoading(false);
    }
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
        parking: unit.parking || '',
        status: unit.status || ''
      });
      setShowEditUnit(true);
    }
  };

  const handleEditUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await unitsApi.updateUnit(id, {
        name: editUnitForm.name,
        blockId: editUnitForm.blockId,
        floorId: editUnitForm.floorId,
        type: editUnitForm.type,
        areaSqFt: editUnitForm.areaSqFt,
        bedrooms: editUnitForm.bedrooms,
        bathrooms: editUnitForm.bathrooms,
        parking: editUnitForm.parking,
        status: editUnitForm.status as any
      });
      setShowEditUnit(false);
      await loadData();
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
    if (!customerPassword) newErrors.customerPassword = 'Required';
    if (!confirmCustomerPassword) newErrors.confirmCustomerPassword = 'Required';
    if (customerPassword && confirmCustomerPassword && customerPassword !== confirmCustomerPassword) {
      newErrors.confirmCustomerPassword = 'Passwords do not match.';
    }

    setAssignErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!id || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await customersApi.createCustomerWithAccount({
        builderId: project?.builderId || 'BLD-001',
        projectId: project?.id || '',
        unitId: id,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        status: 'Active',
        password: customerPassword
      });

      setNewlyCreatedCustomer({
        name: customerName,
        role: 'Customer',
        email: customerEmail,
        password: customerPassword
      });
      setShowSuccessCard(true);

      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerPassword('');
      setConfirmCustomerPassword('');
      setShowAssignCustomer(false);
      await loadData();
    } catch (err: any) {
      setAssignErrors({ customerEmail: err.message || 'Failed to assign customer. Email may already exist.' });
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
      await defectsApi.createDefect({
        builderId: project?.builderId || 'BLD-001',
        unitId: id,
        projectId: project?.id || '',
        title: defectTitle,
        description: defectDesc,
        location: defectLoc,
        severity: defectSeverity as any,
        contractorId: defectContractor || contractorsList[0]?.id || '',
        evidence: []
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
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCareRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!careDescription.trim()) newErrors.careDescription = 'Required';
    
    setCareErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!id || !customer || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await serviceRequestsApi.createRequest({
        unitId: id,
        customerId: customer.id,
        request: careDescription
      });

      setCareDescription('');
      setShowCareRequest(false);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChecklistRequirement = async (field: 'docsCleared' | 'paymentCleared' | 'defectsCleared' | 'keysHandedOver' | 'approvalsCleared') => {
    if (!unit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updatedVal = !unit[field];
      await unitsApi.updateUnit(unit.id, { [field]: updatedVal });
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoading message="Loading unit details..." />;

  if (!unit) {
    return <div style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-secondary)' }}>Loading unit details...</div>;
  }

  const unitDocsData = documents;
  const unitPayments = payments;
  const unitDefects = defects;

  const municipalDocs = unitDocsData.filter(d => d.category === MUNICIPAL_DOCS_CATEGORY);

  const { docsCleared, approvalsCleared: actualApprovalsCleared, paymentCleared, defectsCleared, isReadyForHandover } =
    computeHandoverReadiness(unit, unitDocsData, unitPayments, unitDefects);

  const pendingMunicipalDoc = municipalDocs.find(d => d.status === 'Pending');

  const handleUpdatePaymentStatus = async (paymentId: string, status: 'Verified' | 'Cleared' | 'Rejected') => {
    setIsSubmitting(true);
    try {
      await paymentService.updatePaymentStatus(paymentId, status as any, activeRole);
      await loadData();
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
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '64px' }}>
      
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <Link to={`/admin/projects/${unit.projectId}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Back to Project Structure
        </Link>
      </div>

      {/* Main Header Card */}
      <div style={{
        background: 'linear-gradient(to right, #FFFFFF, #F8FAFC)',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px 40px',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', letterSpacing: '0.02em' }}>
              {project?.name}
            </span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.02em' }}>
              UNIT DETAILS
            </span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', margin: '0', letterSpacing: '-0.02em' }}>
            {unit.name}
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: unit.status === 'Handed Over' ? '#F1F5F9' : 
                             unit.status === 'Approved' ? '#ECFDF5' : 
                             unit.status === 'Defects Found' ? '#FEF2F2' : '#FFFBEB',
              color: unit.status === 'Handed Over' ? '#475569' : 
                     unit.status === 'Approved' ? '#059669' : 
                     unit.status === 'Defects Found' ? '#DC2626' : '#D97706',
              border: `1px solid ${
                unit.status === 'Handed Over' ? '#E2E8F0' : 
                unit.status === 'Approved' ? '#A7F3D0' : 
                unit.status === 'Defects Found' ? '#FECACA' : '#FDE68A'
              }`
            }}>
              <div style={{ 
                width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px',
                backgroundColor: unit.status === 'Handed Over' ? '#94A3B8' : 
                               unit.status === 'Approved' ? '#10B981' : 
                               unit.status === 'Defects Found' ? '#EF4444' : '#F59E0B'
              }} />
              {unit.status}
            </span>
            {(activeRole === 'builder_admin' || activeRole === 'project_manager') && (
              <button className="btn-secondary" onClick={openEditUnit} style={{ padding: '6px 16px', fontSize: '13px' }}>
                Edit Unit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '32px',
        gap: '32px',
        overflowX: 'auto',
        paddingBottom: '0'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <Building2 size={16} /> },
          { id: 'customer', label: 'Customer', icon: <User size={16} /> },
          { id: 'inspection', label: 'Inspection', icon: <CheckSquare size={16} /> },
          { id: 'defects', label: 'Defects', icon: <AlertTriangle size={16} /> },
          { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
          { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
          { id: 'handover', label: 'Handover', icon: <Key size={16} /> },
          { id: 'care', label: 'Care', icon: <Wrench size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 4px',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? '#0F172A' : '#64748B',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ color: activeTab === tab.id ? '#3B82F6' : '#94A3B8' }}>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '3px', backgroundColor: '#3B82F6', borderRadius: '3px 3px 0 0' }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Workspaces */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
        minHeight: '360px'
      }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
              
              {/* Left Column: Details */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '24px' }}>Property Details</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Project Name</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{project?.name}</span>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Block / Phase</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{blocks.find(b => b.id === unit.blockId)?.name || unit.blockId}</span>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Floor</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{floors.find(f => f.id === unit.floorId)?.name || unit.floorId}</span>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Unit Type</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{unit.type || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Area (sq ft)</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{unit.areaSqFt || 'N/A'}</span>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Bedrooms / Bathrooms</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{unit.bedrooms || 0} Bed / {unit.bathrooms || 0} Bath</span>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>Parking Allocation</span>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>{unit.parking || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Handover Readiness */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '24px' }}>Handover Readiness</h3>
                
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '16px', 
                  padding: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      { label: 'Documents Cleared', isCleared: docsCleared, icon: <FileText size={18}/> },
                      { label: 'Payments Cleared', isCleared: paymentCleared, icon: <CreditCard size={18}/> },
                      { label: 'Defects Rectified', isCleared: defectsCleared, isWarning: !defectsCleared, icon: <AlertTriangle size={18}/> },
                      { label: 'Key Handover', isCleared: unit.keysHandedOver, isNeutral: !unit.keysHandedOver, icon: <Key size={18}/> }
                    ].map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '15px', fontWeight: 500, color: '#334155' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            backgroundColor: item.isCleared ? '#ECFDF5' : (item.isWarning ? '#FEF2F2' : '#F1F5F9'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: item.isCleared ? '#10B981' : (item.isWarning ? '#EF4444' : '#64748B')
                          }}>
                            {item.icon}
                          </div>
                          {item.label}
                        </div>
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: 600, 
                          color: item.isCleared ? '#059669' : (item.isWarning ? '#DC2626' : '#64748B'),
                          backgroundColor: item.isCleared ? '#ECFDF5' : (item.isWarning ? '#FEF2F2' : '#F1F5F9'),
                          padding: '4px 12px',
                          borderRadius: '20px'
                        }}>
                          {item.isCleared ? 'Cleared' : (item.label === 'Key Handover' ? 'Awaiting' : (item.label === 'Defects Rectified' ? 'Open Issues' : 'Pending'))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* CUSTOMER TAB */}
        {activeTab === 'customer' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0 }}>Homebuyer Allocation</h3>
              {!customer && (
                <button className="btn-primary" onClick={() => setShowAssignCustomer(true)}>
                  <Plus size={16} /> Assign Customer
                </button>
              )}
            </div>

            {customer ? (
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center', backgroundColor: '#FAFCFF', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--admin-light-blue)',
                  color: 'var(--admin-accent)',
                  fontSize: '20px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{customer.name}</h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                    <span>Email: <strong>{customer.email}</strong></span>
                    <span>Phone: <strong>{customer.phone}</strong></span>
                    <span>Handover: <strong>{customer.handoverStatus}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-secondary)', border: '1px dashed var(--admin-border)', borderRadius: '12px' }}>
                <User size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <h4>No Customer Assigned</h4>
                <p style={{ fontSize: '13px', marginBottom: '20px' }}>This property unit has not been allocated to a buyer yet.</p>
                <button className="btn-secondary" onClick={() => setShowAssignCustomer(true)}>
                  Assign Customer Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* INSPECTION TAB */}
        {activeTab === 'inspection' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0 }}>Unit Inspection</h3>
              {activeRole === 'site_engineer' || activeRole === 'builder_admin' ? (
                <Link to={`/admin/inspections/new?unitId=${unit.id}`} className="btn-primary">
                  <CheckSquare size={16} /> Start Inspection
                </Link>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>STATUS OVERVIEW</h4>
                <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: '#FAFCFF', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: unit.inspectionStatus === 'Passed' ? 'var(--admin-accent)' : unit.inspectionStatus === 'Failed' ? '#DC2626' : '#F59E0B'
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-navy)' }}>Inspection status: {unit.inspectionStatus}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>
                      {unit.inspectionStatus === 'Passed' ? 'Property cleared for customer handover' : 'Snag lists need resolution'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>CHECKLIST TEMPLATE</h4>
                <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                  We will run the standard <strong>Pre-Handover Snagging Checklist</strong> comprising:
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    <li>Masonry & Finishes (Flooring, Tiling, Walls)</li>
                    <li>Plumbing Systems (Pressure, Outflow, Faucets)</li>
                    <li>Electrical & HVAC (Switches, Sockets, Duct checks)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEFECTS TAB */}
        {activeTab === 'defects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0 }}>Logged Defects / Snags</h3>
              {activeRole === 'site_engineer' || activeRole === 'builder_admin' ? (
                <button className="btn-primary" onClick={() => setShowLogDefect(true)}>
                  <Plus size={16} /> Log Defect
                </button>
              ) : null}
            </div>

            {defects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {defects.map(d => (
                  <Link key={d.id} to={`/admin/defects/${d.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--admin-border)',
                      backgroundColor: '#FAFCFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#B0C8F2'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--admin-border)'}
                    >
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{d.title}</h4>
                        <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                          Location: <strong>{d.location}</strong> &bull; Severity: <span style={{ color: d.severity === 'High' ? '#DC2626' : 'inherit' }}>{d.severity}</span>
                        </div>
                      </div>
                      <span className={`status-badge status-badge--${
                        d.status === 'Resolved' || d.status === 'Closed' ? 'success' : 'warning'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<AlertTriangle size={36} />}
                title="No defects found"
                description="There are no active/open defects registered for this unit."
              />
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '24px' }}>Document Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border)',
                  backgroundColor: '#FAFCFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>Ownership & Identity Documents</h4>
                    <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: 0 }}>Copy of buyer identity verification card and sale deed.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: docsCleared ? 'var(--admin-accent)' : '#DC2626' }}>
                      {docsCleared ? 'Verified' : 'Awaiting Review'}
                    </span>
                    <button onClick={() => setShowDocumentModal(true)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Manage Documents
                    </button>
                  </div>
              </div>
              
              <div style={{
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border)',
                  backgroundColor: '#FAFCFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>Municipal Certificate of Occupancy</h4>
                    <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: 0 }}>Required municipality sign-off documents.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: actualApprovalsCleared ? 'var(--admin-accent)' : '#DC2626' }}>
                      {actualApprovalsCleared ? 'Cleared' : 'Awaiting Review'}
                    </span>
                    {(activeRole === 'crm' || activeRole === 'builder_admin' || activeRole === 'super_admin') ? (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px', opacity: pendingMunicipalDoc ? 1 : 0.5, cursor: pendingMunicipalDoc ? 'pointer' : 'not-allowed' }}
                        disabled={isSubmitting || !pendingMunicipalDoc}
                        onClick={handleApproveMunicipalDoc}
                        title={!pendingMunicipalDoc ? "No pending municipal document to approve" : ""}
                      >
                        Approve File
                      </button>
                    ) : null}
                    <button onClick={() => setShowDocumentModal(true)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Manage Documents
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0 }}>Financial Ledger clearance</h3>
              {(activeRole === 'builder_admin' || activeRole === 'accounts' || activeRole === 'customer') && (
                <button 
                  className="btn-primary" 
                  onClick={() => setShowPaymentModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} /> Record Payment
                </button>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div className="admin-card" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Total Value</h4>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-navy)' }}>
                  ${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                </div>
              </div>
              <div className="admin-card" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Amount Cleared</h4>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>
                  ${payments.filter(p => p.status === 'Cleared').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                </div>
              </div>
              <div className="admin-card" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Overall Status</h4>
                <div style={{ fontSize: '24px', fontWeight: 700, color: paymentCleared ? '#10B981' : '#F59E0B' }}>
                  {paymentCleared ? 'FULLY CLEARED' : 'PENDING'}
                </div>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Payment Title / Type</th>
                    <th>Date / Ref</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>{payment.paymentType || payment.title}</div>
                        {payment.paymentMethod && <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>{payment.paymentMethod}</div>}
                      </td>
                      <td>
                        <div style={{ color: 'var(--admin-navy)' }}>{payment.paymentDate || payment.dueDate}</div>
                        {payment.reference && <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Ref: {payment.reference}</div>}
                      </td>
                      <td style={{ fontWeight: 600 }}>${payment.amount.toLocaleString()}</td>
                      <td>
                        {payment.status === 'Cleared' ? (
                          <span style={{ color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Cleared</span>
                        ) : payment.status === 'Verified' ? (
                          <span style={{ color: '#3B82F6', fontWeight: 600 }}>Verified</span>
                        ) : payment.status === 'Rejected' ? (
                          <span style={{ color: '#EF4444', fontWeight: 600 }}>Rejected</span>
                        ) : (
                          <span style={{ color: '#F59E0B', fontWeight: 600 }}>{payment.status}</span>
                        )}
                      </td>
                      <td>
                        {payment.status !== 'Cleared' && payment.status !== 'Rejected' && (activeRole === 'accounts' || activeRole === 'builder_admin' || activeRole === 'super_admin') ? (
                           <div style={{ display: 'flex', gap: '8px' }}>
                             {payment.status === 'Pending Verification' && (
                               <>
                                 <button 
                                   className="btn-secondary" 
                                   style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderColor: '#BFDBFE' }}
                                   disabled={isSubmitting}
                                   onClick={() => handleUpdatePaymentStatus(payment.id, 'Verified')}
                                 >
                                   Verify
                                 </button>
                                 <button 
                                   className="icon-button" 
                                   style={{ color: '#EF4444', backgroundColor: '#FEE2E2', padding: '4px' }}
                                   disabled={isSubmitting}
                                   onClick={() => handleUpdatePaymentStatus(payment.id, 'Rejected')}
                                   title="Reject"
                                 >
                                   <X size={14} />
                                 </button>
                               </>
                             )}
                             {payment.status === 'Verified' && (
                               <button 
                                 className="btn-primary" 
                                 style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#10B981', borderColor: '#10B981' }}
                                 disabled={isSubmitting}
                                 onClick={() => handleUpdatePaymentStatus(payment.id, 'Cleared')}
                               >
                                 Clear Funds
                               </button>
                             )}
                           </div>
                        ) : (
                           <span style={{ color: 'var(--admin-text-secondary)', fontSize: '13px' }}>
                             {payment.status === 'Cleared' ? `Cleared on ${payment.clearedDate}` : payment.status === 'Rejected' ? 'Requires action' : 'No Action'}
                           </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-text-secondary)' }}>No payment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* HANDOVER TAB */}
        {activeTab === 'handover' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '24px' }}>Handover Readiness Audit</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>REQUIREMENTS MATRIX</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'docs', label: 'Documentation Verification', val: docsCleared },
                    { id: 'payment', label: 'Financial Clearance', val: paymentCleared },
                    { id: 'snags', label: 'Defect Snags Resolved', val: defectsCleared },
                    { id: 'approval', label: 'Management Approval', val: actualApprovalsCleared }
                  ].map((req, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--admin-border)' }}>
                      <span style={{ fontSize: '14px', color: 'var(--admin-navy)' }}>{req.label}</span>
                      {req.val ? (
                        <div style={{ color: 'var(--admin-accent)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                          <Check size={16} /> Cleared
                        </div>
                      ) : (
                        <div style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                          <X size={16} /> Pending
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>FINALIZATION BOARD</h4>
                <div style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: `2px solid ${isReadyForHandover ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                  backgroundColor: '#FAFCFF',
                  textAlign: 'center'
                }}>
                  {isReadyForHandover ? (
                    <div>
                      <div style={{ color: 'var(--admin-accent)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>✓ READY FOR HANDOVER</div>
                      <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', marginBottom: '24px' }}>All operational and ledger prerequisites are satisfied.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <input 
                            type="checkbox" 
                            id="key_hando" 
                            checked={unit.keysHandedOver} 
                            disabled={isSubmitting}
                            onChange={() => toggleChecklistRequirement('keysHandedOver')}
                          />
                          <label htmlFor="key_hando" style={{ fontSize: '13px', fontWeight: 600 }}>Mark keys as physically handed over</label>
                        </div>
                        {unit.keysHandedOver && unit.status !== 'Handed Over' && (
                          <button 
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={isSubmitting}
                            onClick={async () => {
                              setIsSubmitting(true);
                              await unitsApi.updateUnit(unit.id, { status: 'Handed Over' });
                              await loadData();
                              setIsSubmitting(false);
                            }}
                          >
                            {isSubmitting ? <ButtonLoading label="Processing..." /> : 'Mark Complete Handover'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: '#DC2626', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>❌ NOT READY FOR HANDOVER</div>
                      <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>You cannot finalize the key handover. One or more requirements are outstanding.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARE TAB */}
        {activeTab === 'care' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0 }}>Care & Warranty Desk</h3>
              {customer && (
                <button className="btn-primary" onClick={() => setShowCareRequest(true)}>
                  <Plus size={16} /> Lodge Service Request
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
              <div>
                <div style={{ padding: '20px', backgroundColor: '#FAFCFF', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0 0 12px 0' }}>WARRANTY CARD</h4>
                  <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                    <div style={{ marginBottom: '8px' }}>Period: <strong>12-Month DLP</strong></div>
                    <div style={{ marginBottom: '8px' }}>Status: <strong>{unit.status === 'Handed Over' ? 'Active' : 'Awaiting Handover'}</strong></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>SERVICE WORKORDERS</h4>
                {serviceRequests.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {serviceRequests.map(sr => (
                      <div key={sr.id} style={{ padding: '16px', border: '1px solid var(--admin-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>{sr.request}</div>
                          <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>Filed: {sr.date}</div>
                        </div>
                        <span className="status-badge status-badge--warning" style={{ textTransform: 'capitalize' }}>{sr.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', fontStyle: 'italic' }}>
                    No service requests logged for this unit.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}
      {/* 1. Assign Customer */}
      {showAssignCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Assign Buyer to {unit.name}</h3>
            <form onSubmit={handleAssignCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Customer Name *</label>
                <input type="text" className={`admin-form-input ${assignErrors.customerName ? 'error' : ''}`} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="admin-form-label">Email Address *</label>
                <input type="email" className={`admin-form-input ${assignErrors.customerEmail ? 'error' : ''}`} value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="e.g. john@doe.com" />
              </div>
              <div>
                <label className="admin-form-label">Phone Number *</label>
                <input type="tel" className={`admin-form-input ${assignErrors.customerPhone ? 'error' : ''}`} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. +1 555-0199" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`admin-form-input ${assignErrors.customerPassword ? 'error' : ''}`} 
                      value={customerPassword} 
                      onChange={e => setCustomerPassword(e.target.value)} 
                      placeholder="e.g. SecretPassword123!" 
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {assignErrors.customerPassword && <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{assignErrors.customerPassword}</div>}
                </div>

                <div>
                  <label className="admin-form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className={`admin-form-input ${assignErrors.confirmCustomerPassword ? 'error' : ''}`} 
                      value={confirmCustomerPassword} 
                      onChange={e => setConfirmCustomerPassword(e.target.value)} 
                      placeholder="e.g. SecretPassword123!" 
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {assignErrors.confirmCustomerPassword && <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{assignErrors.confirmCustomerPassword}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAssignCustomer(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonLoading label="Allocating..." /> : 'Allocate Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Log Defect */}
      {showLogDefect && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Log Defect snag</h3>
            <form onSubmit={handleLogDefect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Issue Title *</label>
                <input type="text" className={`admin-form-input ${defectErrors.defectTitle ? 'error' : ''}`} value={defectTitle} onChange={e => setDefectTitle(e.target.value)} placeholder="e.g. Broken wall socket" />
              </div>
              <div>
                <label className="admin-form-label">Exact Location *</label>
                <input type="text" className={`admin-form-input ${defectErrors.defectLoc ? 'error' : ''}`} value={defectLoc} onChange={e => setDefectLoc(e.target.value)} placeholder="e.g. Living room north wall" />
              </div>
              <div>
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-input" value={defectDesc} onChange={e => setDefectDesc(e.target.value)} style={{ minHeight: '80px' }} placeholder="Provide more details..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div>
                  <label className="admin-form-label">Severity *</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={defectSeverity} onChange={e => setDefectSeverity(e.target.value as any)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Contractor Assignment *</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={defectContractor} onChange={e => setDefectContractor(e.target.value)}>
                    <option value="">Select Contractor</option>
                    {contractorsList.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName} ({c.trade})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowLogDefect(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonLoading label="Registering..." /> : 'Register Snag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Care Service Request */}
      {showCareRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Lodge Warranty Service Request</h3>
            <form onSubmit={handleLogCareRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Request Details *</label>
                <textarea className={`admin-form-input ${careErrors.careDescription ? 'error' : ''}`} value={careDescription} onChange={e => setCareDescription(e.target.value)} style={{ minHeight: '100px' }} placeholder="Describe the issue reported by the buyer..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCareRequest(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonLoading label="Lodging..." /> : 'Lodge Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      {/* Edit Unit Modal */}
      {showEditUnit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-navy)', margin: 0 }}>Edit Unit Details</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }} onClick={() => setShowEditUnit(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditUnitSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="admin-form-label">Unit Name</label>
                  <input type="text" className="admin-form-input" value={editUnitForm.name} onChange={(e) => setEditUnitForm({ ...editUnitForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="admin-form-label">Current Status</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={editUnitForm.status} onChange={(e) => setEditUnitForm({ ...editUnitForm, status: e.target.value })} required>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready for Inspection">Ready for Inspection</option>
                    <option value="Defects Found">Defects Found</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Approved">Approved</option>
                    <option value="Handed Over">Handed Over</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="admin-form-label">Block</label>
                  <select
                    className="admin-form-input"
                    style={{ backgroundColor: 'white' }}
                    value={editUnitForm.blockId}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, blockId: e.target.value, floorId: '' })}
                    required
                  >
                    <option value="">Select Block</option>
                    {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Floor</label>
                  <select
                    className="admin-form-input"
                    style={{ backgroundColor: 'white' }}
                    value={editUnitForm.floorId}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, floorId: e.target.value })}
                    required
                    disabled={!editUnitForm.blockId}
                  >
                    <option value="">Select Floor</option>
                    {floors.filter(f => f.blockId === editUnitForm.blockId).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="admin-form-label">Unit Type (e.g., 2 BHK)</label>
                  <input type="text" className="admin-form-input" value={editUnitForm.type} onChange={(e) => setEditUnitForm({ ...editUnitForm, type: e.target.value })} />
                </div>
                <div>
                  <label className="admin-form-label">Area (sq ft)</label>
                  <input type="number" className="admin-form-input" value={editUnitForm.areaSqFt} onChange={(e) => setEditUnitForm({ ...editUnitForm, areaSqFt: Number(e.target.value) })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label className="admin-form-label">Bedrooms</label>
                  <input type="number" className="admin-form-input" value={editUnitForm.bedrooms} onChange={(e) => setEditUnitForm({ ...editUnitForm, bedrooms: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="admin-form-label">Bathrooms</label>
                  <input type="number" className="admin-form-input" value={editUnitForm.bathrooms} onChange={(e) => setEditUnitForm({ ...editUnitForm, bathrooms: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="admin-form-label">Parking</label>
                  <input type="text" className="admin-form-input" value={editUnitForm.parking} onChange={(e) => setEditUnitForm({ ...editUnitForm, parking: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditUnit(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonLoading label="Saving..." /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocumentModal && (
        <UnitDocumentManagement 
          unitId={unit.id}
          projectId={unit.projectId}
          unitDocs={unitDocsData}
          onClose={() => setShowDocumentModal(false)}
          onRefresh={loadData}
        />
      )}

      {showPaymentModal && (
        <UnitPaymentManagement 
          unitId={unit.id}
          projectId={unit.projectId}
          customerId={unit.customerId}
          onClose={() => setShowPaymentModal(false)}
          onRefresh={loadData}
        />
      )}

      <style>{`
        .admin-form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--admin-navy);
          margin-bottom: 8px;
        }
        .admin-form-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--admin-border);
          font-size: 14px;
          color: var(--admin-navy);
          outline: none;
          font-family: inherit;
        }
        .admin-form-input:focus {
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .admin-form-input.error {
          border-color: #EF4444;
          background-color: #FEF2F2;
        }
      `}</style>
    </div>
  );
};

export default UnitDetail;
