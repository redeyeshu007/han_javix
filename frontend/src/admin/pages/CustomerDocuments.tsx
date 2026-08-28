import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, ShieldCheck, Upload, AlertCircle, CheckCircle, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, documentService } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import { Document } from '../../services/mockDb';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerDocuments: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState('All');
  
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
        const units = await unitsApi.getUnits(user.projectId || '');
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
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX.');
        return;
      }
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
        fileData = await fileToBase64(selectedFile);
      } else {
        fileData = URL.createObjectURL(selectedFile);
      }

      await documentService.uploadDocument({
        builderId: unit?.builderId || user.builderId,
        projectId: user.projectId || '',
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

  const filteredDocs = filter === 'All' ? documents : documents.filter(d => d.status === filter);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Property Documents
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Access and manage all important legal and technical documents for {unit?.name}.
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          style={{ 
            backgroundColor: '#0F172A', 
            color: '#FFFFFF', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: '8px', 
            fontWeight: 600, 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          <Upload size={18} /> Upload Document
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Verified', 'Pending', 'Rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filter === f ? '1px solid transparent' : '1px solid #E2E8F0',
                  backgroundColor: filter === f ? '#0F172A' : '#FFFFFF',
                  color: filter === f ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.2s'
                }}
              >
                {f === 'All' ? 'All' : friendlyStatus(f)}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search files..." 
              style={{
                padding: '10px 16px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                width: '240px',
                outline: 'none',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>
        </div>

        {/* Document List */}
        <div style={{ padding: '0' }}>
          {filteredDocs.length === 0 ? (
            <div style={{ padding: '64px 32px', textAlign: 'center', color: '#64748B' }}>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>No documents found</h3>
              <p>You haven't uploaded any documents matching this criteria yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} style={{ borderBottom: idx === filteredDocs.length - 1 ? 'none' : '1px solid #E2E8F0' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: doc.status === 'Pending' ? '#FEF3C7' : doc.status === 'Rejected' ? '#FEE2E2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} color={doc.status === 'Pending' ? '#D97706' : doc.status === 'Rejected' ? '#EF4444' : '#3B82F6'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>{doc.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{doc.fileSize} • {doc.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F1F5F9', fontSize: '12px', fontWeight: 500, color: '#475569' }}>
                        {doc.documentType}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {doc.status === 'Verified' && <ShieldCheck size={16} color="#10B981" />}
                        {doc.status === 'Pending' && <AlertCircle size={16} color="#F59E0B" />}
                        {doc.status === 'Rejected' && <X size={16} color="#EF4444" />}
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: 600,
                          color: doc.status === 'Verified' ? '#10B981' : doc.status === 'Rejected' ? '#EF4444' : '#F59E0B'
                        }}>
                          {friendlyStatus(doc.status)}
                        </span>
                      </div>
                      {doc.status === 'Rejected' && doc.rejectionReason && (
                        <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', maxWidth: '200px' }}>
                          {doc.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                      {doc.uploadedAt}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {doc.fileData ? (
                          <>
                            <a href={doc.fileData} target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', backgroundColor: '#FFFFFF', transition: 'all 0.2s', cursor: 'pointer' }} title="View">
                              <Eye size={16} />
                            </a>
                            <a href={doc.fileData} download={doc.fileName} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', backgroundColor: '#FFFFFF', transition: 'all 0.2s', cursor: 'pointer' }} title="Download">
                              <Download size={16} />
                            </a>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>N/A</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Modal (Retained functionality, updated styling) */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px',
            padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} aria-label="Close" style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#64748B', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {uploadSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ color: '#0F172A', fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Upload Successful</h3>
                <p style={{ color: '#64748B', margin: 0, fontSize: '15px' }}>Your document has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit}>
                {uploadError && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                    <AlertCircle size={18} /> {uploadError}
                  </div>
                )}
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Document Type *</label>
                  <select 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none' }}
                    value={docType} onChange={e => setDocType(e.target.value)} required
                  >
                    <option value="Address Proof">Address Proof</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Payment Receipt">Payment Receipt</option>
                    <option value="Bank Loan NOC">Bank Loan No-Objection Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Document Name *</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none' }}
                    value={docName} onChange={e => setDocName(e.target.value)} required placeholder="e.g. Aadhar Card" 
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>File *</label>
                  <div 
                    style={{ 
                      border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '32px', 
                      textAlign: 'center', cursor: 'pointer', backgroundColor: '#F8FAFC',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                    {selectedFile ? (
                      <div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                          <FileText size={24} color="#3B82F6" />
                        </div>
                        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '15px' }}>{selectedFile.name}</div>
                        <div style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type.split('/')[1] || 'document'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                          <Upload size={24} color="#64748B" />
                        </div>
                        <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '15px' }}>Click to browse or drag file here</div>
                        <div style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>PDF, JPG, PNG, DOCX up to 5MB</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Description (Optional)</label>
                  <textarea 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                    value={docDescription} onChange={e => setDocDescription(e.target.value)} placeholder="Add any additional notes here..." 
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setShowUploadModal(false)} disabled={uploading} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading || !selectedFile} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: (uploading || !selectedFile) ? '#94A3B8' : '#0F172A', color: '#FFFFFF', fontWeight: 600, fontSize: '15px', cursor: (uploading || !selectedFile) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}>
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
