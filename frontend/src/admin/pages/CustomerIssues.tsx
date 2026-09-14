import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, Image as ImageIcon, X, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerIssues: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!user?.unitId) {
        setLoading(false);
        return;
      }
      try {
        const workspace = await unitsApi.getWorkspace(user.unitId);
        setIssues(workspace.defects || []);
      } catch (error) {
        console.error('Error fetching issues', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5', icon: AlertCircle };
      case 'in_progress': return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', icon: Clock };
      case 'resolved': return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', icon: CheckCircle2 };
      case 'closed': return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', icon: CheckCircle2 };
      default: return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', icon: MessageSquare };
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-full p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full relative z-0">
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        
        {/* Header section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
              Reported Issues
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Track the status of everything you've reported for your home.
            </p>
          </div>
        </section>

        <div className={`grid ${selectedIssue ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6 items-start transition-all duration-300 ease-in-out`}>
          
          {/* Issues List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-900 m-0 tracking-tight">All Issues ({issues.length})</h2>
            </div>
            
            {issues.length === 0 ? (
              <div className="py-16 px-8 text-center text-slate-500">
                <CheckCircle2 size={48} className="text-emerald-500 opacity-50 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">All Good</h3>
                <p className="text-[15px] text-slate-500">You haven't reported any issues, or they have all been cleared.</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                {issues.map((issue, idx) => {
                  const colors = getStatusColor(issue.status);
                  const Icon = colors.icon;
                  const isSelected = selectedIssue?.id === issue.id;
                  
                  return (
                    <div 
                      key={issue.id} 
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-5 px-6 border-b border-slate-100 cursor-pointer transition-all duration-200 relative ${isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/50'}`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />}
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span 
                              className="px-2.5 py-1 rounded-md text-[12px] font-semibold flex items-center gap-1 shadow-sm"
                              style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                            >
                              <Icon size={12} /> {friendlyStatus(issue.status)}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-[15px] mb-1.5">{issue.title}</div>
                          <div className="text-[13px] text-slate-500 flex items-center gap-3 font-medium">
                            <span className="flex items-center gap-1.5">
                              <MessageSquare size={14} /> {issue.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} /> {new Date(issue.reportedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Issue Details Sidebar */}
          {selectedIssue && (
            <div className="sticky top-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[calc(100vh-48px)]">
              
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <h3 className="m-0 text-lg font-bold text-slate-900 tracking-tight">Issue Details</h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="mb-8">
                  <h4 className="m-0 mb-4 text-xl font-bold text-slate-900 leading-snug tracking-tight">{selectedIssue.title}</h4>
                  
                  <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-semibold">Location</span>
                      <span className="text-slate-900 font-bold">{selectedIssue.location}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-semibold">Reference</span>
                      <span className="text-slate-900 font-bold">#{selectedIssue.id}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-semibold">Priority</span>
                      <span className="text-slate-900 font-bold">{selectedIssue.priority || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 font-semibold">Handled By</span>
                      <span className="text-slate-900 font-bold">Support Team</span>
                    </div>
                  </div>
                </div>

                {selectedIssue.description && (
                  <div className="mb-8">
                    <h5 className="m-0 mb-3 text-sm font-bold text-slate-900 uppercase tracking-wider">Description</h5>
                    <p className="m-0 text-[14px] text-slate-600 leading-relaxed font-medium">{selectedIssue.description}</p>
                  </div>
                )}

                <div className="mb-8">
                  <h5 className="m-0 mb-5 text-sm font-bold text-slate-900 uppercase tracking-wider">Status Updates</h5>
                  <div className="flex flex-col gap-5 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 z-0" />
                    
                    {(selectedIssue.timeline || []).map((t: any, idx: number) => {
                      return (
                        <div key={idx} className="flex gap-4 relative z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${idx === 0 ? 'bg-slate-900 border-none' : 'bg-white border-2 border-slate-300'}`}>
                            {idx === 0 && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <div>
                            <div className={`font-bold text-[14px] ${idx === 0 ? 'text-slate-900' : 'text-slate-600'}`}>{friendlyStatus(t.status)}</div>
                            {t.note && <div className="text-[13px] text-slate-500 mt-1 leading-relaxed font-medium">{t.note}</div>}
                            <div className="text-[12px] text-slate-400 mt-1.5 font-semibold tracking-wide">{new Date(t.date).toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedIssue.resolutionEvidence && (
                  <div>
                    <h5 className="m-0 mb-3 text-sm font-bold text-slate-900 uppercase tracking-wider">Resolution Evidence</h5>
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shadow-sm">
                        <ImageIcon size={20} className="text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-bold text-slate-900">resolution_photo.jpg</div>
                        <div className="text-[12px] text-slate-500 mt-0.5 font-medium">Attached</div>
                      </div>
                      <a href={selectedIssue.resolutionEvidence} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
                        View
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerIssues;
