import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { unitsApi, defectsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import '../admin.css';

const CustomerIssues: React.FC = () => {
  const { activeProjectId } = useRole();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const [units, defects] = await Promise.all([
          unitsApi.getUnits(activeProjectId),
          defectsApi.getDefects(activeProjectId)
        ]);
        const myUnit = units[0];
        if (myUnit) {
          const myDefects = defects.filter(d => d.unitId === myUnit.id);
          setIssues(myDefects);
        }
      } catch (error) {
        console.error('Error fetching issues', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [activeProjectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'In Progress': return { bg: '#FEF3C7', text: '#92400E' };
      case 'Resolved': return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'Closed': return { bg: '#D1FAE5', text: '#065F46' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">My Issues</h1>
          <p className="admin-page__subtitle">Track the status of reported issues for your home.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedIssue ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        <div className="admin-card">
          <h3 className="admin-card__title">Reported Issues</h3>
          
          {issues.length === 0 ? (
            <EmptyState 
              icon={CheckCircle2} 
              title="All Good" 
              message="You haven't reported any issues, or they have all been cleared." 
            />
          ) : (
            <div className="admin-list">
              {issues.map(issue => {
                const colors = getStatusColor(issue.status);
                return (
                  <div 
                    key={issue.id} 
                    className="admin-list__item"
                    onClick={() => setSelectedIssue(issue)}
                    style={{ cursor: 'pointer', border: selectedIssue?.id === issue.id ? '1px solid #2563EB' : undefined }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>{issue.issue}</div>
                        <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{issue.location}</span>
                          <span>•</span>
                          <span>{new Date(issue.timeline?.[0]?.date || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          backgroundColor: colors.bg, 
                          color: colors.text, 
                          fontSize: '12px', 
                          fontWeight: 600 
                        }}>
                          {issue.status}
                        </span>
                        <ChevronRight size={16} color="#94A3B8" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedIssue && (
          <div className="admin-card" style={{ position: 'sticky', top: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="admin-card__title" style={{ margin: 0 }}>Issue Details</h3>
              <button 
                className="admin-button admin-button--secondary" 
                onClick={() => setSelectedIssue(null)}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1E293B' }}>{selectedIssue.issue}</h4>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B' }}>
                <span><strong>Location:</strong> {selectedIssue.location}</span>
                <span><strong>ID:</strong> {selectedIssue.id}</span>
              </div>
            </div>

            {selectedIssue.description && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569' }}>Description</h5>
                <p style={{ margin: 0, fontSize: '14px', color: '#1E293B', lineHeight: 1.5 }}>{selectedIssue.description}</p>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>Status Updates</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #E2E8F0', paddingLeft: '16px', marginLeft: '8px' }}>
                {(selectedIssue.timeline || []).map((t: any, idx: number) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-21px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }}></div>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>{t.status}</div>
                    {t.note && <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{t.note}</div>}
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>{new Date(t.date).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedIssue.resolutionEvidence && (
              <div>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>Resolution Photo</h5>
                <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ImageIcon size={24} color="#94A3B8" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>resolution_photo.jpg</div>
                    <div style={{ fontSize: '12px', color: '#2563EB', cursor: 'pointer' }}>View Image</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerIssues;
