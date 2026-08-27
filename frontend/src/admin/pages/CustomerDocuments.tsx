import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, ShieldCheck, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, documentService } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import { Document } from '../../services/mockDb';
import '../admin.css';

const CustomerDocuments: React.FC = () => {
  const { activeProjectId } = useRole();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('Address Proof');
  const [docName, setDocName] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const docs = await documentService.getCustomerDocuments(user.id);
      setDocuments(docs);
      
      if (user.unitId) {
        const units = await unitsApi.getUnits(activeProjectId);
        const u = units.find((un: any) => un.id === user.unitId);
        if (u) setUnit(u);
      }
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, activeProjectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX.');
        return;
      }
      // 5MB limit check (optional)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name.split('.')[0]);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) {
      setUploadError('Please select a file.');
      return;
    }
    
    setUploadError('');
    setUploading(true);
    
    try {
      let fileData = '';
      if (selectedFile.size < 500 * 1024) {
        // Less than 500kb, store as base64
        fileData = await fileToBase64(selectedFile);
      } else {
        // Mock large file with object URL (won't persist across refresh, but avoids quota limit)
        fileData = URL.createObjectURL(selectedFile);
      }

      await documentService.uploadDocument({
        builderId: unit?.builderId || user.builderId,
        projectId: activeProjectId || user.projectId,
        unitId: unit?.id || user.unitId,
        customerId: user.id,
        category: 'Customer',
        documentType: docType,
        name: docName || docType,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'Pending',
        description: docDescription,
        fileData
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
        setSelectedFile(null);
        setDocName('');
        setDocDescription('');
        fetchData();
      }, 2000);
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="admin-page">
      <div className="admin-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-page__title">My Documents</h1>
          <p className="admin-page__subtitle">Access all important legal and technical documents for {unit?.name || 'your unit'}.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="admin-card__title" style={{ margin: 0 }}>Document Repository</h3>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={16} color="#10B981" /> Verified</span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Upload Date</th>
                <th>Size</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No documents found.
                  </td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={20} color={doc.status === 'Pending' ? '#F59E0B' : doc.status === 'Rejected' ? '#EF4444' : '#2563EB'} />
                        <div>
                          <span style={{ fontWeight: 500, color: '#1E293B', display: 'block' }}>{doc.name}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{doc.fileName}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#F1F5F9', fontSize: '12px', color: '#475569' }}>
                        {doc.category} - {doc.documentType}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${
                        doc.status === 'Verified' ? 'success' :
                        doc.status === 'Rejected' ? 'error' :
                        'warning'
                      }`}>
                        {doc.status}
                      </span>
                      {doc.status === 'Rejected' && doc.rejectionReason && (
                        <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>
                          Reason: {doc.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#64748B' }}>{doc.uploadedAt}</td>
                    <td style={{ color: '#64748B' }}>{doc.fileSize}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {doc.fileData ? (
                          <>
                            <a href={doc.fileData} target="_blank" rel="noreferrer" className="icon-button" title="View"><Eye size={18} /></a>
                            <a href={doc.fileData} download={doc.fileName} className="icon-button" title="Download"><Download size={18} /></a>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Not Available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0F172A' }}>Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {uploadSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#10B981', margin: '0 0 8px 0' }}>Upload Successful</h3>
                <p style={{ color: '#64748B', margin: 0 }}>Your document has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit}>
                {uploadError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <AlertCircle size={16} /> {uploadError}
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                  <label className="admin-form-label">Document Type *</label>
                  <select className="admin-form-input" value={docType} onChange={e => setDocType(e.target.value)} required>
                    <option value="Address Proof">Address Proof</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Payment Receipt">Payment Receipt</option>
                    <option value="Bank Loan NOC">Bank Loan NOC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="admin-form-label">Document Name *</label>
                  <input type="text" className="admin-form-input" value={docName} onChange={e => setDocName(e.target.value)} required placeholder="e.g. Aadhar Card" />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="admin-form-label">File *</label>
                  <div 
                    style={{ 
                      border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '24px', 
                      textAlign: 'center', cursor: 'pointer', backgroundColor: '#F8FAFC' 
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                    {selectedFile ? (
                      <div>
                        <div style={{ color: '#0F172A', fontWeight: 500 }}>{selectedFile.name}</div>
                        <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px' }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                        <div style={{ color: '#0F172A', fontWeight: 500 }}>Click to browse or drag file here</div>
                        <div style={{ color: '#64748B', fontSize: '12px', marginTop: '4px' }}>PDF, JPG, PNG, DOCX up to 5MB</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="admin-form-label">Description (Optional)</label>
                  <textarea className="admin-form-input" value={docDescription} onChange={e => setDocDescription(e.target.value)} placeholder="Add any additional notes here..." style={{ minHeight: '80px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={uploading || !selectedFile}>
                    {uploading ? <ButtonLoading label="Uploading..." /> : 'Upload Document'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDocuments;
