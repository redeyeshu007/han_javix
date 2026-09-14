import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Eye, ShieldCheck, Upload, AlertCircle, CheckCircle, X, Search, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, documentService } from '../../api/services';
import { User } from '../../types/models';
import { UnitWorkspace } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerDocuments: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<UnitWorkspace | null>(null);
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
    if (!user?.unitId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await unitsApi.getWorkspace(user.unitId);
      setWorkspace(data);
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
    if (!selectedFile || !workspace?.unit) {
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
        builderId: '',
        projectId: workspace.project?.id || '',
        unitId: workspace.unit.id,
        customerId: workspace.customer?.id || '',
        category: 'Customer',
        documentType: docType,
        name: docName || docType,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploadedBy: user?.name || 'Customer',
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'UPLOADED',
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

  if (!workspace?.unit) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 bg-[#F8FAFC]">
        <Activity size={64} className="opacity-20 mb-6" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Documents</h3>
        <p className="text-slate-500">You have not been assigned to a property yet.</p>
      </div>
    );
  }

  const { unit, documents = [] } = workspace;
  const filteredDocs = filter === 'All' ? documents : documents.filter((d: any) => d.status === filter);

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
              Property Documents
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-2xl">
              Access and manage all important legal and technical documents for {unit.name}.
            </p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white border-none py-3 px-5 rounded-lg font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-colors whitespace-nowrap"
          >
            <Upload size={18} /> Upload Document
          </button>
        </section>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {['All', 'Verified', 'Pending', 'Rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all ${
                    filter === f 
                      ? 'bg-slate-900 text-white border border-transparent shadow-sm' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f === 'All' ? 'All' : friendlyStatus(f)}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="w-full sm:w-60 py-2.5 pl-9 pr-4 rounded-lg border border-slate-200 text-[13px] outline-none bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Document List */}
          <div className="p-0 overflow-x-auto">
            {filteredDocs.length === 0 ? (
              <div className="py-16 px-8 text-center text-slate-500">
                <FileText size={48} className="opacity-20 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No documents found</h3>
                <p>You haven't uploaded any documents matching this criteria yet.</p>
              </div>
            ) : (
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc: any, idx: number) => (
                    <tr key={doc.id} className={`${idx === filteredDocs.length - 1 ? '' : 'border-b border-slate-100'} hover:bg-slate-50/50 transition-colors`}>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            doc.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                            doc.status === 'Rejected' ? 'bg-red-100 text-red-500' : 
                            'bg-blue-50 text-blue-500'
                          }`}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm mb-0.5">{doc.name}</div>
                            <div className="text-xs text-slate-500">{doc.fileSize} • {doc.fileName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5">
                          {doc.status === 'Verified' && <ShieldCheck size={16} className="text-emerald-500" />}
                          {doc.status === 'Pending' && <AlertCircle size={16} className="text-amber-500" />}
                          {doc.status === 'Rejected' && <X size={16} className="text-red-500" />}
                          <span className={`text-[13px] font-semibold ${
                            doc.status === 'Verified' ? 'text-emerald-600' : 
                            doc.status === 'Rejected' ? 'text-red-600' : 
                            'text-amber-600'
                          }`}>
                            {friendlyStatus(doc.status)}
                          </span>
                        </div>
                        {doc.status === 'Rejected' && doc.rejectionReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[200px]">
                            {doc.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-6 text-[13px] text-slate-500 font-medium">
                        {doc.uploadedAt}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          {doc.fileData ? (
                            <>
                              <a href={doc.fileData} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg border border-slate-200 inline-flex items-center justify-center text-slate-500 bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer shadow-sm" title="View">
                                <Eye size={16} />
                              </a>
                              <a href={doc.fileData} download={doc.fileName} className="w-8 h-8 rounded-lg border border-slate-200 inline-flex items-center justify-center text-slate-500 bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer shadow-sm" title="Download">
                                <Download size={16} />
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
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
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[1000] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="m-0 text-2xl font-bold text-slate-900 tracking-tight">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} aria-label="Close" className="bg-slate-100 border-none cursor-pointer text-slate-500 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-8">
                <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
                <h3 className="text-slate-900 text-xl font-bold m-0 mb-2">Upload Successful</h3>
                <p className="text-slate-500 m-0 text-[15px]">Your document has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit}>
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 py-3 px-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium">
                    <AlertCircle size={18} /> {uploadError}
                  </div>
                )}
                
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-2">Document Type *</label>
                  <select 
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer"
                    value={docType} onChange={e => setDocType(e.target.value)} required
                  >
                    <option value="Address Proof">Address Proof</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Payment Receipt">Payment Receipt</option>
                    <option value="Bank Loan NOC">Bank Loan No-Objection Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-2">Document Name *</label>
                  <input 
                    type="text" 
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                    value={docName} onChange={e => setDocName(e.target.value)} required placeholder="e.g. Aadhar Card" 
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-2">File *</label>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                    {selectedFile ? (
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-sm border border-blue-100">
                          <FileText size={24} />
                        </div>
                        <div className="text-slate-900 font-semibold text-[15px]">{selectedFile.name}</div>
                        <div className="text-slate-500 text-[13px] mt-1">
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type.split('/')[1] || 'document'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                          <Upload size={24} />
                        </div>
                        <div className="text-slate-800 font-semibold text-[15px]">Click to browse or drag file here</div>
                        <div className="text-slate-500 text-[13px] mt-1">PDF, JPG, PNG, DOCX up to 5MB</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[13px] font-semibold text-slate-600 mb-2">Description (Optional)</label>
                  <textarea 
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all min-h-[80px] resize-y"
                    value={docDescription} onChange={e => setDocDescription(e.target.value)} placeholder="Add any additional notes here..." 
                  />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowUploadModal(false)} disabled={uploading} className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[15px] cursor-pointer hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading || !selectedFile} className={`flex-1 py-3.5 rounded-xl border-none font-semibold text-[15px] transition-colors ${
                    (uploading || !selectedFile) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white cursor-pointer hover:bg-slate-800 shadow-sm'
                  }`}>
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
