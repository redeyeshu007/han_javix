import React, { useState, useEffect } from 'react';
import { Key, FileText, CreditCard, ShieldCheck, ClipboardCheck, CheckCircle2, Clock, Calendar, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, defectsApi, documentService, paymentService } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { computeHandoverReadiness } from '../../utils/handoverReadiness';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerHandover: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [inspectionOk, setInspectionOk] = useState(false);
  const [defectsOk, setDefectsOk] = useState(false);
  const [documentsOk, setDocumentsOk] = useState(false);
  const [paymentOk, setPaymentOk] = useState(false);
  const [approvalsOk, setApprovalsOk] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const units = await unitsApi.getUnits(user.projectId || '');
        const myUnit = units.find((u: any) => u.id === user.unitId);
        setUnit(myUnit || null);
        if (!myUnit) return;

        const [defects, docs, payments] = await Promise.all([
          defectsApi.getDefects(user.projectId || ''),
          documentService.getUnitDocuments(myUnit.id),
          paymentService.getPayments(myUnit.id)
        ]);

        const unitDefects = defects.filter((d: any) => d.unitId === myUnit.id);
        const readiness = computeHandoverReadiness(myUnit, docs, payments, unitDefects);
        setInspectionOk(readiness.inspectionCleared);
        setDefectsOk(readiness.defectsCleared);
        setDocumentsOk(readiness.docsCleared);
        setPaymentOk(readiness.paymentCleared);
        setApprovalsOk(readiness.approvalsCleared);
      } catch (error) {
        console.error('Error fetching handover data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <PageLoading />;
  
  if (!unit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748B' }}>
        <Home size={64} style={{ opacity: 0.2, marginBottom: '24px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1E293B' }}>No Home Linked Yet</h3>
        <p>Your home details will appear here once your builder links them to your account.</p>
      </div>
    );
  }

  const isReady = inspectionOk && defectsOk && documentsOk && paymentOk && approvalsOk;
  const isHandedOver = unit?.status === 'Handed Over';

  const items = [
    { label: 'Property Inspection', desc: 'Final quality check', ok: inspectionOk, icon: ClipboardCheck, hint: friendlyStatus(unit.inspectionStatus) },
    { label: 'Issue Resolution', desc: 'All reported defects closed', ok: defectsOk, icon: ShieldCheck, hint: defectsOk ? 'All cleared' : 'Open items remain' },
    { label: 'Legal Documents', desc: 'Agreements & proofs verified', ok: documentsOk, icon: FileText, hint: documentsOk ? 'Verified' : 'Pending verification' },
    { label: 'Final Payments', desc: 'All dues cleared', ok: paymentOk, icon: CreditCard, hint: paymentOk ? 'Cleared' : 'Balance due' },
    { label: 'Builder Approvals', desc: 'Management sign-off', ok: approvalsOk, icon: Key, hint: approvalsOk ? 'Approved' : 'Awaiting approval' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Handover Readiness
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Track everything required before the keys to {unit.name} are handed over.
          </p>
        </div>
      </div>

      {isHandedOver ? (
        <div style={{ backgroundColor: '#0F172A', borderRadius: '24px', padding: '48px', color: '#FFFFFF', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <Key size={40} color="#10B981" />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>Welcome Home!</h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Your property handover is complete. You can now use the Warranty & Care section to report any post-handover issues covered under your warranty period.
          </p>
          <div style={{ display: 'inline-flex', gap: '16px' }}>
            <button style={{ padding: '14px 24px', backgroundColor: '#FFFFFF', color: '#0F172A', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <FileText size={18} /> View Handover Certificate
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ 
              backgroundColor: isReady ? '#059669' : '#0F172A', 
              borderRadius: '20px', 
              padding: '40px', 
              color: '#FFFFFF', 
              boxShadow: isReady ? '0 10px 15px -3px rgba(5, 150, 105, 0.4)' : '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.4s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                {isReady ? (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={28} color="#FFFFFF" />
                  </div>
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={28} color="#FFFFFF" />
                  </div>
                )}
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {isReady ? 'READY FOR HANDOVER' : 'NOT READY YET'}
                </h2>
              </div>
              <p style={{ margin: '0 0 32px 0', fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                {isReady ? 'All requirements are complete. Your handover appointment can be scheduled by the builder.' : 'Complete the pending requirements below to unlock your handover appointment scheduling.'}
              </p>
              
              {isReady && (
                <div style={{ padding: '24px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Next Step</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>Schedule Appointment</div>
                  </div>
                  <button style={{ padding: '12px 20px', backgroundColor: '#FFFFFF', color: '#059669', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} /> Schedule
                  </button>
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>What's Left To Do</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item, idx) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: item.ok ? '#ECFDF5' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon size={20} color={item.ok ? '#10B981' : '#94A3B8'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '15px' }}>{item.label}</div>
                        <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        backgroundColor: item.ok ? '#ECFDF5' : '#FFFBEB', 
                        color: item.ok ? '#065F46' : '#92400E', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        border: `1px solid ${item.ok ? '#A7F3D0' : '#FDE68A'}`,
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        {item.ok ? 'Cleared' : 'Pending'}
                      </span>
                      <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                        {item.hint}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>Handover Process</h3>
              
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                <div style={{ position: 'absolute', top: '8px', bottom: '24px', left: '7px', width: '2px', backgroundColor: '#E2E8F0' }} />
                
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', left: '-29px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #FFFFFF' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>Booking & Construction</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Completed</div>
                </div>
                
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', left: '-29px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: inspectionOk && defectsOk ? '#10B981' : '#0F172A', border: '2px solid #FFFFFF', boxShadow: '0 0 0 2px #E2E8F0' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>Final Inspection</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{inspectionOk && defectsOk ? 'Completed' : 'In Progress'}</div>
                </div>
                
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', left: '-29px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: documentsOk && paymentOk ? '#10B981' : (inspectionOk && defectsOk ? '#0F172A' : '#E2E8F0'), border: '2px solid #FFFFFF', boxShadow: documentsOk && paymentOk ? 'none' : (inspectionOk && defectsOk ? '0 0 0 2px #E2E8F0' : 'none') }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: documentsOk && paymentOk ? '#1E293B' : (inspectionOk && defectsOk ? '#1E293B' : '#94A3B8') }}>Documents & Payments</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{documentsOk && paymentOk ? 'Completed' : 'Pending'}</div>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-29px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isReady ? '#0F172A' : '#E2E8F0', border: '2px solid #FFFFFF', boxShadow: isReady ? '0 0 0 2px #E2E8F0' : 'none' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: isReady ? '#1E293B' : '#94A3B8' }}>Key Handover</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Final step</div>
                </div>
              </div>
            </div>
            
            {!isReady && (
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>Need Help?</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>If you have questions about what's still pending, our support team is happy to help.</p>
                <button style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  Contact Support
                </button>
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CustomerHandover;
