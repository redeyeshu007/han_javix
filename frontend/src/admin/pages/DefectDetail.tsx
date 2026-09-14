import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Check, Play, ShieldAlert, ArrowLeft, Image as ImageIcon, Upload, Download, Eye } from 'lucide-react';
import { Defect, Unit, Document, Contractor } from '../../types';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import { defectsApi, documentService, auditService, contractorsApi } from '../../api/services';
import { apiClient } from '../../api/client';
import { normalizeDefect, normalizeUnit } from '../../api/normalize';
import { statusLabel, toBackendStatus } from '../../utils/statusMap';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import { canAccessDefect } from '../../utils/access';

const DefectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeRole, activeProjectId } = useRole();
  const { user } = useAuth();
  
  const [defect, setDefect] = useState<Defect | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [evidence, setEvidence] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [actionNote, setActionNote] = useState('');
  const [contractorSelect, setContractorSelect] = useState('');
  const [projectContractors, setProjectContractors] = useState<Contractor[]>([]);

  const loadData = async () => {
    if (!id) return;
    try {
      // Fetch defect directly by ID, then normalize it through the same
      // mapper the list endpoints use (unitId, title/location parsed out of
      // description, slug statuses, timeline from activity_logs).
      const raw = await (await apiClient.get(`/inspections/defects/${id}/`)).data;
      const d = normalizeDefect(raw);
      if (d) {
        setDefect(d as Defect);
        // Fetch unit if available
        if (d.unitId) {
          try {
            const unitResp = await apiClient.get(`/projects/units/${d.unitId}/`);
            setUnit(normalizeUnit(unitResp.data));
          } catch { /* ok */ }
        }
        
        // Fetch evidence documents
        const evDocs = await documentService.getDefectEvidence(String(d.id));
        setEvidence(evDocs);

        const allContractors = await contractorsApi.getContractors();
        setProjectContractors(allContractors);
        setContractorSelect(prev => prev || allContractors[0]?.id || '');
      }
    } catch {
      // defect not found
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusUpdate = async (status: Defect['status'], note: string, resolutionEvidence?: string, reopenReason?: string) => {
    if (!defect || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await defectsApi.updateDefect(defect.id, status, note, resolutionEvidence, undefined, reopenReason);
      await auditService.createAuditLog({
        projectId: activeProjectId,
        unitId: defect.unitId,
        action: 'Defect Updated',
        actor: activeRole || 'System',
        details: `Updated defect ${defect.id} status to ${status}. Note: ${note}`
      });
      setActionNote('');
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defect || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const contractorName = projectContractors.find(c => c.id === contractorSelect)?.companyName || 'Unknown Contractor';

      await defectsApi.updateDefect(defect.id, 'Assigned', `Assigned to contractor: ${contractorName}`, undefined, contractorSelect);
      await auditService.createAuditLog({
        projectId: activeProjectId,
        unitId: defect.unitId,
        action: 'Defect Assigned',
        actor: activeRole || 'System',
        details: `Assigned defect ${defect.id} to contractor ${contractorName}`
      });
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !defect) return;
    
    setIsSubmitting(true);
    try {
      await documentService.uploadDocument({
        defectId: defect.id,
        unitId: (defect as any).unit || defect.unitId || '',
        category: 'Defect Evidence',
        title: `Evidence for Defect #${defect.id}`,
        documentType: 'DEFECT_EVIDENCE',
        file,
      });
      
      await loadData();
    } catch (err) {
      console.error('Failed to upload evidence:', err);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading message="Loading defect details..." />;
  }

  if (!defect) {
    return <div style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-secondary)' }}>Defect snag not found.</div>;
  }

  // Rows carry the backend Defect.STATUS_CHOICES slug; UI labels come from statusMap.
  const defectStatus = toBackendStatus('defect', defect.status);

  if (!canAccessDefect(user, defect)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', textAlign: 'center' }}>
        <ShieldAlert size={40} color="#DC2626" style={{ marginBottom: '16px' }} />
        <h1 style={{ color: 'var(--admin-navy)', marginBottom: '8px' }}>Access Denied</h1>
        <p style={{ color: 'var(--admin-text-secondary)' }}>You do not have permission to view this defect.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '64px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div style={{
        backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '16px',
        padding: '32px', marginBottom: '32px', boxShadow: '0 4px 15px rgba(7, 26, 51, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              DEFECT AUDIT &bull; {defect.id}
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-navy)', margin: '4px 0 0 0' }}>{defect.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '8px', marginBottom: 0 }}>
              Located in: <strong>{defect.location}</strong> &bull; Unit: <strong>Unit {unit?.name}</strong>
            </p>
          </div>
          <span className={`status-badge status-badge--${defectStatus === 'resolved' || defectStatus === 'closed' ? 'success' : 'warning'}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
            {statusLabel('defect', defectStatus)}
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', fontSize: '14px', color: 'var(--admin-navy)', lineHeight: 1.6 }}>
          <strong>Description:</strong>
          <p style={{ margin: '8px 0 0 0', color: 'var(--admin-text-secondary)' }}>{defect.description}</p>
        </div>

        <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: '14px', color: 'var(--admin-navy)' }}>Evidence Photos:</strong>
            
            {(activeRole === 'SITE_ENGINEER' || activeRole === 'CONTRACTOR' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
              <div>
                <input 
                  type="file" accept="image/*,.pdf" style={{ display: 'none' }} 
                  ref={fileInputRef} onChange={handleFileUpload} disabled={isSubmitting}
                />
                <button 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <ButtonLoading label="Uploading..." /> : <><Upload size={14} /> Upload Evidence</>}
                </button>
              </div>
            )}
          </div>
          
          {evidence && evidence.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {evidence.map((doc, i) => (
                <div key={i} style={{ 
                  width: '140px', height: '140px', borderRadius: '8px', border: '1px solid var(--admin-border)',
                  overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9', position: 'relative'
                }}>
                  {doc.fileType.startsWith('image/') && doc.fileData ? (
                    <img src={doc.fileData} alt={`Evidence ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '10px', textAlign: 'center' }}>
                      <ImageIcon size={32} color="#94A3B8" />
                      <span style={{ fontSize: '10px', marginTop: '8px', wordBreak: 'break-all' }}>{doc.fileName}</span>
                    </div>
                  )}
                  {doc.fileData && (
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                       <a href={doc.fileData} target="_blank" rel="noreferrer" style={{ color: 'white', padding: '4px' }} title="View"><Eye size={14} /></a>
                       <a href={doc.fileData} download={doc.fileName} style={{ color: 'white', padding: '4px' }} title="Download"><Download size={14} /></a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '24px', backgroundColor: '#FAFCFF', borderRadius: '8px', border: '1px dashed var(--admin-border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-secondary)'
            }}>
              <ImageIcon size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <span style={{ fontSize: '13px' }}>No evidence photos attached</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--admin-accent)" /> TIMELINE LOGS
          </h3>
          <div style={{ backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(7, 26, 51, 0.01)' }}>
            <div className="timeline" style={{ marginLeft: '12px', borderLeft: '2px solid var(--admin-border)', paddingLeft: '24px' }}>
              {defect.timeline.map((log, index) => (
                <div key={index} className="timeline-item" style={{ position: 'relative', paddingBottom: '20px' }}>
                  <div className="timeline-dot" style={{ left: '-29px', width: '9px', height: '9px', backgroundColor: 'var(--admin-accent)' }} />
                  <div className="timeline-content">
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)' }}>Status: {log.status}</span>
                    <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', margin: '4px 0 0 0' }}>{log.note}</p>
                    <span style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} color="var(--admin-accent)" /> ACTION CONTROL
          </h3>
          <div style={{ backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(7, 26, 51, 0.01)' }}>
            
            {defectStatus === 'open' && (activeRole === 'BUILDER_OWNER' || activeRole === 'SITE_ENGINEER' || activeRole === 'SUPER_ADMIN') && (
              <form onSubmit={handleAssignContractor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label className="admin-form-label">Contractor Partner *</label>
                <select className="admin-form-input" value={contractorSelect} onChange={(e) => setContractorSelect(e.target.value)} style={{ backgroundColor: 'white' }}>
                  {projectContractors.length === 0 && <option value="">No contractors assigned to this project</option>}
                  {projectContractors.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.trade})</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={isSubmitting || !contractorSelect}>
                  {isSubmitting ? <ButtonLoading label="Assigning..." /> : 'Assign Contractor'}
                </button>
              </form>
            )}

            {defectStatus === 'assigned' && (activeRole === 'CONTRACTOR' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-primary" style={{ justifyContent: 'center' }} disabled={isSubmitting} onClick={() => handleStatusUpdate('In Progress', 'Contractor started work on this repair.')}>
                  {isSubmitting ? <ButtonLoading label="Updating..." /> : <><Play size={16} /> Mark as In Progress</>}
                </button>
              </div>
            )}

            {defectStatus === 'in_progress' && (activeRole === 'CONTRACTOR' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Resolution Notes *</label>
                  <textarea className="admin-form-input" value={actionNote} onChange={e => setActionNote(e.target.value)} style={{ minHeight: '80px' }} placeholder="Describe how the snag was fixed..." />
                </div>
                <button className="btn-primary" style={{ justifyContent: 'center' }} disabled={!actionNote.trim() || isSubmitting} onClick={() => handleStatusUpdate('waiting_for_reinspection', `Contractor completed repairs. Notes: ${actionNote}`, actionNote)}>
                  {isSubmitting ? <ButtonLoading label="Lodging..." /> : <><Check size={16} /> Lodge Resolution</>}
                </button>
              </div>
            )}

            {defectStatus === 'waiting_for_reinspection' && (activeRole === 'SITE_ENGINEER' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #B0C8F2', fontSize: '13px', color: 'var(--admin-navy)' }}>
                  <strong>Contractor Report:</strong> {defect.resolutionEvidence || 'Repairs completed.'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-primary" style={{ justifyContent: 'center' }} disabled={isSubmitting} onClick={() => handleStatusUpdate('closed', 'Quality audit passed. Snag resolved successfully.')}>
                    {isSubmitting ? <ButtonLoading label="Approving..." /> : 'Approve & Close Snag'}
                  </button>
                  
                  <div style={{ marginTop: '8px' }}>
                    <label className="admin-form-label">Rejection Reason *</label>
                    <textarea 
                      className="admin-form-input" 
                      value={actionNote} 
                      onChange={e => setActionNote(e.target.value)} 
                      style={{ minHeight: '60px', marginBottom: '8px' }} 
                      placeholder="Why did the reinspection fail?" 
                    />
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: '#E53E3E', color: '#E53E3E' }} disabled={!actionNote.trim() || isSubmitting} onClick={() => handleStatusUpdate('rejected', `Reinspection failed. Rejection reason: ${actionNote}`, undefined, actionNote)}>
                      {isSubmitting ? 'Rejecting...' : 'Fail Reinspection (Reject/Return)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {defectStatus === 'closed' && (activeRole === 'SITE_ENGINEER' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--admin-accent)', fontWeight: 600, marginBottom: '12px' }}>✓ Snag is Closed & Cleared</div>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting} onClick={() => handleStatusUpdate('Open', 'Defect snag reopened for audit.')}>
                  {isSubmitting ? 'Reopening...' : 'Reopen Snag'}
                </button>
              </div>
            )}

            {((defectStatus === 'open' && activeRole === 'CONTRACTOR') || (defectStatus === 'resolved' && activeRole === 'CONTRACTOR') || (defectStatus === 'closed' && activeRole === 'CONTRACTOR')) && (
              <div style={{ textAlign: 'center', color: 'var(--admin-text-secondary)', fontSize: '13px' }}>Awaiting actions from builder/inspector team.</div>
            )}

          </div>
        </div>

      </div>

      <style>{`
        .admin-form-label { display: block; font-size: 13px; font-weight: 600; color: var(--admin-navy); margin-bottom: 8px; }
        .admin-form-input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--admin-border); font-size: 14px; color: var(--admin-navy); outline: none; font-family: inherit; }
        .admin-form-input:focus { border-color: var(--admin-accent); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .admin-form-input.error { border-color: #EF4444; background-color: #FEF2F2; }
      `}</style>
    </div>
  );
};

export default DefectDetail;
