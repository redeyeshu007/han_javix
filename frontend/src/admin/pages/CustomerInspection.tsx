import React, { useState, useEffect } from 'react';
import { Camera, Plus, CheckCircle2, AlertTriangle, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, defectsApi, auditService, customersApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerInspection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string>('');
  
  const [isLoggingIssue, setIsLoggingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueLocation, setIssueLocation] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchInspectionData = async () => {
      if (!user) return;
      try {
        const [units, customers] = await Promise.all([
          unitsApi.getUnits(user.projectId || ''),
          customersApi.getCustomers(user.builderId || '')
        ]);
        setUnit(units.find((u: any) => u.id === user.unitId) || null);
        const myCustomerRecord = customers.find((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
        setCustomerId(myCustomerRecord?.id || '');
      } catch (error) {
        console.error('Error fetching inspection data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInspectionData();
  }, [user]);

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !issueTitle || !issueLocation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (unit?.status === 'Handed Over') {
        const { serviceRequestsApi } = await import('../../api/services');
        await serviceRequestsApi.createRequest({
          unitId: unit.id,
          customerId,
          request: `${issueTitle} - ${issueLocation}\n\n${issueDescription}`
        });
        await auditService.createAuditLog({
          projectId: user?.projectId || '',
          unitId: unit.id,
          action: 'Warranty Request Logged',
          actor: 'Customer',
          details: `Customer logged a warranty request: ${issueTitle}`
        });
      } else {
        await defectsApi.createDefect({
          builderId: unit?.builderId || user?.builderId || '',
          projectId: user?.projectId || '',
          unitId: unit.id,
          title: issueTitle,
          location: issueLocation,
          description: issueDescription,
          severity: 'Medium',
          contractorId: '',
          evidence: []
        });
        await auditService.createAuditLog({
          projectId: user?.projectId || '',
          unitId: unit.id,
          action: 'Defect Logged',
          actor: 'Customer',
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {unit?.status === 'Handed Over' ? 'Warranty & Care' : 'Quality Check'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            {unit?.status === 'Handed Over' ? 'Request warranty service for your home.' : 'Review your home and report anything you notice during your visit.'}
          </p>
        </div>
        
        {!isLoggingIssue && (
          <button 
            onClick={() => setIsLoggingIssue(true)}
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
            <Plus size={18} /> {unit?.status === 'Handed Over' ? 'Request Service' : 'Report Issue'}
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      {isLoggingIssue ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>{unit?.status === 'Handed Over' ? 'Request Service' : 'Report an Issue'}</h2>
          <form onSubmit={handleSubmitIssue}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Issue Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Broken tile, Paint chip" 
                  value={issueTitle}
                  onChange={e => setIssueTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Exact Location *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Master Bedroom, Kitchen Counter" 
                  value={issueLocation}
                  onChange={e => setIssueLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Description</label>
              <textarea 
                rows={4}
                placeholder="Provide more details about the issue..."
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Photo Evidence</label>
              <div style={{ border: '2px dashed #CBD5E1', padding: '32px', textAlign: 'center', borderRadius: '16px', color: '#64748B', cursor: 'pointer', backgroundColor: '#F8FAFC' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Camera size={24} color="#3B82F6" />
                </div>
                <div style={{ color: '#0F172A', fontWeight: 600, fontSize: '15px' }}>Click to upload photos</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>JPG, PNG up to 10MB</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setIsLoggingIssue(false)}
                disabled={isSubmitting}
                style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Self-Guided Tour</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '14px' }}>Walk through your property and verify these common areas.</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={24} color="#3B82F6" />
              </div>
            </div>

            <div>
              {['Main Entrance & Door', 'Living Room Walls & Paint', 'Kitchen Cabinetry & Plumbing', 'Master Bedroom & Wardrobes', 'Bathrooms & Fittings', 'Electrical Switches & Points'].map((area, idx) => (
                <div key={idx} style={{ padding: '20px 24px', borderBottom: idx !== 5 ? '1px solid #E2E8F0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', transition: 'background-color 0.2s' }}>
                  <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>{area}</div>
                  <button 
                    onClick={() => {
                      setIssueLocation(area);
                      setIsLoggingIssue(true);
                    }}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <AlertTriangle size={14} color="#F59E0B" /> Report Issue
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>Where You Stand</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Quality Check</span>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: unit?.inspectionStatus === 'Passed' ? '#ECFDF5' : '#FEF3C7', color: unit?.inspectionStatus === 'Passed' ? '#065F46' : '#92400E', fontSize: '12px', fontWeight: 600 }}>
                    {friendlyStatus(unit?.inspectionStatus)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#64748B' }}>Next Up</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>Handover</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInspection;
