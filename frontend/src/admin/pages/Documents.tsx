import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Check, X, ShieldCheck, Filter } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { documentService, unitsApi, auditService } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import { Document, Unit } from '../../services/mockDb';
import '../admin.css';

const Documents: React.FC = () => {
  const { activeProjectId, activeRole } = useRole();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [verifying, setVerifying] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments();
      const projectDocs = docs.filter(d => d.projectId === activeProjectId);
      setDocuments(projectDocs);
      
      const unitsList = await unitsApi.getUnits(activeProjectId);
      setUnits(unitsList);
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProjectId]);

  const handleVerify = async (id: string) => {
    setVerifying(id);
    try {
      await documentService.verifyDocument(id);
      await auditService.createAuditLog({
        projectId: activeProjectId,
        action: 'Document Verified',
        actor: activeRole || 'Admin',
        details: `Verified document with ID: ${id}`
      });
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setVerifying(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setVerifying(id); // use same loading state for button spinner
    try {
      await documentService.rejectDocument(id, rejectReason);
      await auditService.createAuditLog({
        projectId: activeProjectId,
        action: 'Document Rejected',
        actor: activeRole || 'Admin',
        details: `Rejected document with ID: ${id}. Reason: ${rejectReason}`
      });
      setRejecting(null);
      setRejectReason('');
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setVerifying(null);
    }
  };

  const filteredDocs = documents.filter(doc => 
    statusFilter === 'All' || doc.status === statusFilter
  );

  const getUnitName = (unitId?: string) => {
    if (!unitId) return 'N/A';
    return units.find(u => u.id === unitId)?.name || unitId;
  };

  if (loading) return <PageLoading />;

  return (
    <div className="admin-page">
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-page__title">Document Verification Center</h1>
          <p className="admin-page__subtitle">Review and verify documents submitted by customers and contractors.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Filter size={18} color="#64748B" />
          <select 
            className="admin-form-input" 
            style={{ width: 'auto', padding: '6px 12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Document Details</th>
                <th>Context</th>
                <th>Status</th>
                <th>Upload Info</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No documents found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} color={doc.status === 'Pending' ? '#F59E0B' : doc.status === 'Rejected' ? '#EF4444' : '#2563EB'} />
                        <div>
                          <span style={{ fontWeight: 500, color: '#1E293B', display: 'block' }}>{doc.name}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{doc.fileName} &bull; {doc.fileSize}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#F1F5F9', fontSize: '12px', color: '#475569', display: 'inline-block', width: 'fit-content' }}>
                          {doc.category}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          Unit: <strong>{getUnitName(doc.unitId)}</strong>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`status-badge status-badge--${
                          doc.status === 'Verified' ? 'success' :
                          doc.status === 'Rejected' ? 'error' :
                          'warning'
                        }`} style={{ width: 'fit-content' }}>
                          {doc.status}
                        </span>
                        {doc.status === 'Rejected' && doc.rejectionReason && (
                          <span style={{ fontSize: '11px', color: '#EF4444' }}>{doc.rejectionReason}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', color: '#1E293B' }}>{doc.uploadedBy}</span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>{doc.uploadedAt}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {doc.fileData && (
                          <>
                            <a href={doc.fileData} target="_blank" rel="noreferrer" className="icon-button" title="View"><Eye size={18} /></a>
                            <a href={doc.fileData} download={doc.fileName} className="icon-button" title="Download"><Download size={18} /></a>
                          </>
                        )}
                        
                        {doc.status === 'Pending' && (
                          <>
                            <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0', margin: '0 4px' }} />
                            <button 
                              className="icon-button" 
                              style={{ color: '#10B981', backgroundColor: '#D1FAE5' }} 
                              title="Verify"
                              onClick={() => handleVerify(doc.id)}
                              disabled={verifying === doc.id}
                            >
                              {verifying === doc.id ? <ButtonLoading label="" /> : <Check size={18} />}
                            </button>
                            <button 
                              className="icon-button" 
                              style={{ color: '#EF4444', backgroundColor: '#FEE2E2' }} 
                              title="Reject"
                              onClick={() => setRejecting(rejecting === doc.id ? null : doc.id)}
                              disabled={verifying === doc.id}
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {rejecting === doc.id && (
                        <div style={{ marginTop: '12px', textAlign: 'left', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <input 
                            type="text" 
                            className="admin-form-input" 
                            placeholder="Reason for rejection..." 
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            style={{ marginBottom: '8px', fontSize: '12px', padding: '6px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setRejecting(null)}>Cancel</button>
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#EF4444' }} onClick={() => handleReject(doc.id)}>Confirm Reject</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
