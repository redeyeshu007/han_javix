import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, Image as ImageIcon, X, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { defectsApi, contractorsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerIssues: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [contractors, setContractors] = useState<any[]>([]);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!user) return;
      try {
        const [defects, contractorsList] = await Promise.all([
          defectsApi.getDefects(user.projectId || ''),
          contractorsApi.getContractors()
        ]);
        const myDefects = defects.filter(d => d.unitId === user.unitId);
        setIssues(myDefects);
        setContractors(contractorsList);
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
      case 'Open': return { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5', icon: AlertCircle };
      case 'In Progress': return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', icon: Clock };
      case 'Resolved': return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', icon: CheckCircle2 };
      case 'Closed': return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', icon: CheckCircle2 };
      default: return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', icon: MessageSquare };
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Reported Issues
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Track the status of everything you've reported for your home.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedIssue ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start', transition: 'all 0.3s ease' }}>
        
        {/* Issues List */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>All Issues ({issues.length})</h2>
          </div>
          
          {issues.length === 0 ? (
            <div style={{ padding: '64px 32px', textAlign: 'center', color: '#64748B' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ opacity: 0.5, margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>All Good</h3>
              <p>You haven't reported any issues, or they have all been cleared.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {issues.map((issue, idx) => {
                const colors = getStatusColor(issue.status);
                const Icon = colors.icon;
                const isSelected = selectedIssue?.id === issue.id;
                
                return (
                  <div 
                    key={issue.id} 
                    onClick={() => setSelectedIssue(issue)}
                    style={{ 
                      padding: '20px 24px', 
                      borderBottom: idx === issues.length - 1 ? 'none' : '1px solid #E2E8F0',
                      cursor: 'pointer', 
                      backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#0F172A' }} />}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            backgroundColor: colors.bg, 
                            border: `1px solid ${colors.border}`,
                            color: colors.text, 
                            fontSize: '12px', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Icon size={12} /> {friendlyStatus(issue.status)}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '15px', marginBottom: '4px' }}>{issue.title}</div>
                        <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare size={14} /> {issue.location}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {new Date(issue.timeline?.[0]?.date || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isSelected ? '#0F172A' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <ChevronRight size={18} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
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
          <div style={{ position: 'sticky', top: '24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 48px)' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Issue Details</h3>
              <button
                onClick={() => setSelectedIssue(null)}
                aria-label="Close"
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{selectedIssue.title}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Location</span>
                    <span style={{ color: '#1E293B', fontWeight: 600 }}>{selectedIssue.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Reference</span>
                    <span style={{ color: '#1E293B', fontWeight: 600 }}>{selectedIssue.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Priority</span>
                    <span style={{ color: '#1E293B', fontWeight: 600 }}>{selectedIssue.severity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Handled By</span>
                    <span style={{ color: '#1E293B', fontWeight: 600 }}>{contractors.find(c => c.id === selectedIssue.contractorId)?.companyName || 'Not yet assigned'}</span>
                  </div>
                </div>
              </div>

              {selectedIssue.description && (
                <div style={{ marginBottom: '32px' }}>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h5>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{selectedIssue.description}</p>
                </div>
              )}

              <div style={{ marginBottom: '32px' }}>
                <h5 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Updates</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                  {/* Vertical Line */}
                  <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }} />
                  
                  {(selectedIssue.timeline || []).map((t: any, idx: number) => {
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: idx === 0 ? '#0F172A' : '#FFFFFF', 
                          border: idx === 0 ? 'none' : '2px solid #CBD5E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px'
                        }}>
                          {idx === 0 && <CheckCircle2 size={14} color="#FFFFFF" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: idx === 0 ? '#0F172A' : '#475569', fontSize: '14px' }}>{friendlyStatus(t.status)}</div>
                          {t.note && <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>{t.note}</div>}
                          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px', fontWeight: 500 }}>{new Date(t.date).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {selectedIssue.resolutionEvidence && (
                <div>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photos</h5>
                  <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={20} color="#64748B" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>resolution_photo.jpg</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>2.4 MB</div>
                    </div>
                    <button style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                      View
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerIssues;
