import React, { useState, useEffect } from 'react';
import { Camera, Plus, CheckCircle2, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { unitsApi, defectsApi, checklistsApi, auditService } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import '../admin.css';

const CustomerInspection: React.FC = () => {
  const { activeProjectId, activeRole } = useRole();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [checklists, setChecklists] = useState<any[]>([]);
  
  // State for logging a new customer issue
  const [isLoggingIssue, setIsLoggingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        const [units, cl] = await Promise.all([
          unitsApi.getUnits(activeProjectId),
          checklistsApi.getChecklists()
        ]);
        setUnit(units[0]);
        // Filter a customer specific checklist if possible, otherwise just use a generic one
        setChecklists(cl);
      } catch (error) {
        console.error('Error fetching inspection data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInspectionData();
  }, [activeProjectId]);

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !issueTitle || !issueLocation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (unit?.status === 'Handed Over') {
        const { serviceRequestsApi } = await import('../../api/services');
        await serviceRequestsApi.createRequest({
          unitId: unit.id,
          customerId: 'TEST-CST-001', // Ideally fetch from active user
          request: `${issueTitle} - ${issueLocation}\n\n${issueDescription}`
        });
        await auditService.createAuditLog({
          projectId: activeProjectId,
          unitId: unit.id,
          action: 'Warranty Request Logged',
          actor: activeRole || 'Customer',
          details: `Customer logged a warranty request: ${issueTitle}`
        });
      } else {
        await defectsApi.createDefect({
          builderId: unit?.builderId || 'BLD-001',
          projectId: activeProjectId,
          unitId: unit.id,
          title: issueTitle,
          location: issueLocation,
          description: issueDescription,
          severity: 'Medium',
          contractorId: 'CON-001', // Default contractor for customer issues
          evidence: []
        });
        await auditService.createAuditLog({
          projectId: activeProjectId,
          unitId: unit.id,
          action: 'Defect Logged',
          actor: activeRole || 'Customer',
          details: `Customer logged an issue: ${issueTitle}`
        });
      }
      
      setSuccessMsg('Request logged successfully. Our team will review it shortly.');
      setIsLoggingIssue(false);
      setIssueTitle('');
      setIssueLocation('');
      setIssueDescription('');
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Error submitting issue', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{unit?.status === 'Handed Over' ? 'Warranty & Care' : 'My Inspection'}</h1>
          <p className="admin-page__subtitle">{unit?.status === 'Handed Over' ? 'Lodge warranty service requests for your property.' : 'Review your property and report any issues found during your visit.'}</p>
        </div>
        <button 
          className="admin-button admin-button--primary"
          onClick={() => setIsLoggingIssue(!isLoggingIssue)}
        >
          <Plus size={16} /> {unit?.status === 'Handed Over' ? 'Lodge Request' : 'Report Issue'}
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {isLoggingIssue ? (
        <div className="admin-card">
          <h3 className="admin-card__title">Report a New Issue</h3>
          <form onSubmit={handleSubmitIssue} className="admin-form">
            <div className="admin-form__group">
              <label className="admin-form__label">Issue Title *</label>
              <input 
                type="text" 
                className="admin-form__input" 
                placeholder="e.g. Broken tile, Paint chip" 
                value={issueTitle}
                onChange={e => setIssueTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-form__group">
              <label className="admin-form__label">Exact Location *</label>
              <input 
                type="text" 
                className="admin-form__input" 
                placeholder="e.g. Master Bedroom, Kitchen Counter" 
                value={issueLocation}
                onChange={e => setIssueLocation(e.target.value)}
                required
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Description</label>
              <textarea 
                className="admin-form__input" 
                rows={4}
                placeholder="Provide more details about the issue..."
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Photo Evidence</label>
              <div style={{ border: '2px dashed #CBD5E1', padding: '32px', textAlign: 'center', borderRadius: '8px', color: '#64748B', cursor: 'pointer' }}>
                <Camera size={32} style={{ margin: '0 auto 12px auto' }} />
                <p style={{ margin: 0 }}>Click to upload photos from your device</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                type="button" 
                className="admin-button admin-button--secondary"
                onClick={() => setIsLoggingIssue(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <ButtonLoading 
                isLoading={isSubmitting}
                text="Submit Issue"
                loadingText="Submitting..."
                type="submit"
              />
            </div>
          </form>
        </div>
      ) : (
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <FileText size={24} />
            </div>
            <div>
              <h3 className="admin-card__title" style={{ margin: 0 }}>Self-Guided Tour</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>Walk through your property and verify these common areas.</p>
            </div>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            {['Main Entrance & Door', 'Living Room Walls & Paint', 'Kitchen Cabinetry & Plumbing', 'Master Bedroom & Wardrobes', 'Bathrooms & Fittings', 'Electrical Switches & Points'].map((area, idx) => (
              <div key={idx} style={{ padding: '16px', borderBottom: idx !== 5 ? '1px solid #E2E8F0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                <div style={{ fontWeight: 500, color: '#1E293B' }}>{area}</div>
                <button 
                  className="admin-button admin-button--secondary"
                  style={{ padding: '4px 12px', fontSize: '13px' }}
                  onClick={() => setIsLoggingIssue(true)}
                >
                  <AlertTriangle size={14} style={{ marginRight: '6px' }}/> Found Issue
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInspection;
