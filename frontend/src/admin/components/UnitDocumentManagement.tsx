import React, { useState } from 'react';
import { X, Upload, FileText, AlertTriangle, Download, Eye, RefreshCw } from 'lucide-react';
import { documentService } from '../../api/services';
import { statusLabel, DOCUMENT_REJECTED_SLUG, DOCUMENT_APPROVED_SLUG, DOCUMENT_PENDING_REVIEW_STATUSES } from '../../utils/statusMap';
import { useRole } from '../../context/RoleContext';
import { ButtonLoading } from '../../components/LoadingState';
import { inputCls, labelCls } from './unit/shared';

interface BackendDocument {
  id: string | number;
  title?: string;
  name?: string;
  category?: string;
  file?: string;
  fileUrl?: string;
  file_name?: string;
  fileName?: string;
  file_size?: number;
  fileSize?: string;
  uploaded_by_name?: string;
  uploadedBy?: string;
  created_at?: string;
  uploadedAt?: string;
  status?: string;
  rejection_reason?: string;
  rejectionReason?: string;
  description?: string;
  // Legacy
  fileData?: string;
}

interface UnitDocumentManagementProps {
  unitId: string;
  projectId: string;
  unitDocs: BackendDocument[];
  onClose: () => void;
  onRefresh: () => void;
}

const CATEGORIES = [
  'Ownership & Identity Documents',
  'Municipal Certificate of Occupancy',
  'Approved Plans',
  'RERA Certificate',
  'Completion Certificate',
  'Sale Agreement',
  'Payment Receipt',
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

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedFile) return;

    setIsSubmitting(true);
    try {
      await documentService.uploadDocument({
        projectId,
        unitId,
        category,
        title: name,
        documentType: 'OTHER',
        file: selectedFile,
        fileName,
        description,
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
    setSelectedFile(null);
    setFileName('');
    setFileSize('');
  };

  const startReupload = (cat: string, n: string) => {
    resetForm();
    setCategory(cat);
    setName(n);
    setShowUpload(true);
  };

  // unitDocs arrive normalized at the service boundary (api/normalize.ts):
  // name/category/fileName/uploadedAt/rejectionReason/fileUrl + raw status slug.
  const normalizeDoc = (doc: BackendDocument) => ({
    id: doc.id,
    name: doc.title || doc.name || 'Untitled',
    category: doc.category || 'General',
    fileName: doc.file_name || doc.fileName || '',
    uploadedAt: doc.created_at ? doc.created_at.split('T')[0] : (doc.uploadedAt || ''),
    status: doc.status || 'UPLOADED',
    rejectionReason: doc.rejection_reason || doc.rejectionReason,
    fileUrl: doc.file || doc.fileUrl || doc.fileData,
  });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-[#0F172A]">Unit Document Management</h2>
          <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {!showUpload ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-[#0F172A]">Uploaded Documents</h3>
              {activeRole !== 'PROJECT_ADMIN' && (
                <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all" onClick={() => setShowUpload(true)}>
                  <Upload size={16} /> Upload Document
                </button>
              )}
            </div>

            {unitDocs.length === 0 ? (
              <div className="text-center p-10 bg-[#F8FAFC] rounded-lg border border-dashed border-slate-300">
                <FileText size={32} className="mx-auto mb-3 text-slate-400" />
                <p className="text-slate-500 m-0 text-[14px]">No documents uploaded for this unit yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {unitDocs.map(rawDoc => {
                  const doc = normalizeDoc(rawDoc);
                  const isRejected = doc.status === DOCUMENT_REJECTED_SLUG || doc.status === 'Rejected';
                  return (
                    <div key={doc.id} className={`p-4 rounded-lg border flex items-center justify-between ${isRejected ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <FileText size={20} className="text-slate-500" />
                        </div>
                        <div>
                          <h4 className="m-0 mb-1 text-[14px] font-semibold text-[#0F172A]">{doc.name}</h4>
                          <div className="flex items-center gap-3 text-[12px] text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-full">{doc.category}</span>
                            <span>{doc.fileName}</span>
                            <span>{doc.uploadedAt}</span>
                          </div>
                          {isRejected && doc.rejectionReason && (
                            <p className="mt-2 mb-0 text-[12px] text-red-600 flex items-center gap-1">
                              <AlertTriangle size={14} /> {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          doc.status === DOCUMENT_APPROVED_SLUG || doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {statusLabel('document', doc.status)}
                        </span>

                        <div className="flex items-center gap-2">
                          {doc.fileUrl && (
                            <>
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="View"><Eye size={18} /></a>
                              <a href={doc.fileUrl} download={doc.fileName} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Download"><Download size={18} /></a>
                            </>
                          )}
                          {isRejected && activeRole !== 'PROJECT_ADMIN' && (
                            <button
                              className="p-2 rounded-lg text-[#2563EB] bg-indigo-50 hover:bg-indigo-100 transition-colors"
                              title="Re-upload"
                              onClick={() => startReupload(doc.category, doc.name)}
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-semibold text-[#0F172A]">Upload New Document</h3>
              <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold shadow-sm transition-colors" onClick={() => { setShowUpload(false); resetForm(); }}>Back to List</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Document Category *</label>
                <select
                  className={inputCls()}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Document Name/Title *</label>
                <input
                  type="text"
                  className={inputCls()}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Buyer Passport, Structural Sign-off..."
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Description (Optional)</label>
                <textarea
                  className={inputCls()}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add any relevant notes here..."
                  rows={2}
                />
              </div>

              <div>
                <label className={labelCls}>File Upload *</label>
                <div className="relative border border-dashed border-slate-300 p-6 rounded-lg text-center bg-[#F8FAFC] cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  {!fileName ? (
                    <div>
                      <Upload size={24} className="mx-auto mb-2 text-slate-500" />
                      <p className="m-0 text-[14px] text-slate-800 font-medium">Click or drag file to upload</p>
                      <p className="mt-1 mb-0 text-[12px] text-slate-500">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <FileText size={24} className="text-[#2563EB]" />
                      <div className="text-left">
                        <p className="m-0 text-[14px] font-medium text-[#0F172A]">{fileName}</p>
                        <p className="m-0 text-[12px] text-slate-500">{fileSize}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold shadow-sm transition-colors" onClick={() => { setShowUpload(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all disabled:opacity-60" disabled={isSubmitting || !selectedFile}>
                  {isSubmitting ? <ButtonLoading label="Uploading..." /> : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
