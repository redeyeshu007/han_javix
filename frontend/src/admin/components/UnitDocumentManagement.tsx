import React, { useState } from 'react';
import { X, Upload, FileText, AlertTriangle, Download, Eye, RefreshCw } from 'lucide-react';
import { Document } from '../../types';;
import { documentService } from '../../api/services';
import { useRole } from '../../context/RoleContext';
import { ButtonLoading } from '../../components/LoadingState';

interface UnitDocumentManagementProps {
  unitId: string;
  projectId: string;
  unitDocs: Document[];
  onClose: () => void;
  onRefresh: () => void;
}

const CATEGORIES = [
  'Ownership & Identity Documents',
  'Municipal Certificate of Occupancy',
  'Other'
];

export const UnitDocumentManagement: React.FC<UnitDocumentManagementProps> = ({ 
  unitId, 
  projectId, 
  unitDocs, 
  onClose,
  onRefresh
}) => {
  const { activeRole } = useRole();
  const [showUpload, setShowUpload] = useState(false);
  
  // Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
      setFileType(file.type || 'application/pdf');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fileData) return;
    
    setIsSubmitting(true);
    try {
      await documentService.uploadDocument({
        projectId,
        unitId,
        category,
        documentType: fileType,
        name,
        fileName,
        fileType,
        fileSize,
        uploadedBy: activeRole === 'builder_admin' ? 'Builder Admin' : (activeRole === 'contractor' ? 'Contractor' : 'Customer'),
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'Pending',
        description,
        fileData
      });
      
      setShowUpload(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory(CATEGORIES[0]);
    setName('');
    setDescription('');
    setFileData(null);
    setFileName('');
    setFileSize('');
    setFileType('');
  };

  const startReupload = (cat: string, n: string) => {
    resetForm();
    setCategory(cat);
    setName(n);
    setShowUpload(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>Unit Document Management</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          {!showUpload ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)' }}>Uploaded Documents</h3>
                <button className="btn-primary" onClick={() => setShowUpload(true)}>
                  <Upload size={16} /> Upload Document
                </button>
              </div>
              
              {unitDocs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                  <FileText size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
                  <p style={{ color: '#64748B', margin: 0 }}>No documents uploaded for this unit yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unitDocs.map(doc => (
                    <div key={doc.id} style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${doc.status === 'Rejected' ? '#FECACA' : 'var(--admin-border)'}`,
                      backgroundColor: doc.status === 'Rejected' ? '#FEF2F2' : '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '8px', 
                          backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                          <FileText size={20} color="#64748B" />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--admin-navy)' }}>{doc.name}</h4>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                            <span style={{ backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '12px' }}>{doc.category}</span>
                            <span>{doc.fileName}</span>
                            <span>{doc.uploadedAt}</span>
                          </div>
                          {doc.status === 'Rejected' && doc.rejectionReason && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={14} /> {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className={`status-badge status-badge--${
                          doc.status === 'Verified' ? 'success' :
                          doc.status === 'Rejected' ? 'error' :
                          'warning'
                        }`}>
                          {doc.status === 'Pending' ? 'Pending Review' : doc.status}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {doc.fileData && (
                            <>
                              <a href={doc.fileData} target="_blank" rel="noreferrer" className="icon-button" title="View"><Eye size={18} /></a>
                              <a href={doc.fileData} download={doc.fileName} className="icon-button" title="Download"><Download size={18} /></a>
                            </>
                          )}
                          {doc.status === 'Rejected' && (
                            <button 
                              className="icon-button" 
                              style={{ color: 'var(--admin-primary)', backgroundColor: '#EEF2FF' }}
                              title="Re-upload"
                              onClick={() => startReupload(doc.category, doc.name)}
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)' }}>Upload New Document</h3>
                <button className="btn-secondary" onClick={() => { setShowUpload(false); resetForm(); }}>Back to List</button>
              </div>
              
              <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Document Category *</label>
                  <select 
                    className="admin-form-input" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="admin-form-group">
                  <label>Document Name/Title *</label>
                  <input 
                    type="text" 
                    className="admin-form-input" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Buyer Passport, Structural Sign-off..."
                    required 
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Description (Optional)</label>
                  <textarea 
                    className="admin-form-input" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add any relevant notes here..."
                    rows={2}
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>File Upload *</label>
                  <div style={{ 
                    border: '1px dashed #CBD5E1', 
                    padding: '24px', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' 
                      }} 
                      required
                    />
                    {!fileName ? (
                      <div>
                        <Upload size={24} color="#64748B" style={{ marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>Click or drag file to upload</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>PDF, JPG, PNG up to 10MB</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <FileText size={24} color="var(--admin-primary)" />
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--admin-navy)' }}>{fileName}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{fileSize}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={() => { setShowUpload(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting || !fileData}>
                    {isSubmitting ? <ButtonLoading label="Uploading..." /> : 'Submit Document'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
