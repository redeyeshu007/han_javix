import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, CheckCircle2, Wrench, Calendar, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { unitsApi, customersApi, serviceRequestsApi } from '../../api/services';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CATEGORIES = ['Plumbing', 'Electrical', 'Civil', 'Painting', 'Carpentry', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const CustomerCare: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<any>(null);
  const [customerId, setCustomerId] = useState('');
  const [requests, setRequests] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [priority, setPriority] = useState('Medium');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<{ id: string; date: string } | null>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [units, customers, allRequests] = await Promise.all([
        unitsApi.getUnits(user.projectId || ''),
        customersApi.getCustomers(user.builderId),
        serviceRequestsApi.getRequests()
      ]);
      const myUnit = units.find((u: any) => u.id === user.unitId);
      setUnit(myUnit || null);
      const myCustomer = customers.find((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
      const cid = myCustomer?.id || '';
      setCustomerId(cid);
      setRequests(allRequests.filter((r: any) => r.customerId === cid).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching care data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!title.trim()) newErrors.title = 'Required';
    if (!description.trim()) newErrors.description = 'Required';
    if (!category) newErrors.category = 'Required';
    if (!priority) newErrors.priority = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !unit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestText = `[${category} / ${priority}] ${title}\n\n${description}${preferredDate ? `\n\nPreferred Visit: ${preferredDate} ${preferredTime}` : ''}`;
      const created = await serviceRequestsApi.createRequest({
        unitId: unit.id,
        customerId,
        request: requestText
      });

      setSuccessMsg({ id: created.id, date: created.date });
      setTitle('');
      setDescription('');
      setCategory('Plumbing');
      setPriority('Medium');
      setPreferredDate('');
      setPreferredTime('');
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating service request', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Request': return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'Assign': return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' };
      case 'Resolve': return { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' };
      case 'Customer confirmation': return { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' };
      case 'Closed': return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Care & Warranty
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Request service for your home and track your past requests.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSuccessMsg(null); }}
          style={{ padding: '12px 24px', backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        >
          <Plus size={18} /> Request Service
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '20px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#059669" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#065F46', fontSize: '15px', marginBottom: '4px' }}>Request Submitted</div>
              <div style={{ fontSize: '13px', color: '#047857' }}>
                Reference: {successMsg.id} &bull; Submitted: {successMsg.date}
              </div>
            </div>
          </div>
          <button onClick={() => setSuccessMsg(null)} aria-label="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', padding: '8px' }}>
            <X size={20} />
          </button>
        </div>
      )}

      {showForm && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Request Service</h3>
            <button onClick={() => setShowForm(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>What's the issue? *</label>
              <input 
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#F8FAFC', border: `1px solid ${errors.title ? '#EF4444' : '#E2E8F0'}`, borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none', transition: 'border-color 0.2s' }}
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Bathroom tap leaking" 
              />
              {errors.title && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.title}</div>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Category *</label>
                <select 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Priority *</label>
                <select 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                  value={priority} 
                  onChange={e => setPriority(e.target.value)}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Description *</label>
              <textarea 
                style={{ width: '100%', padding: '16px', backgroundColor: '#F8FAFC', border: `1px solid ${errors.description ? '#EF4444' : '#E2E8F0'}`, borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none', minHeight: '120px', resize: 'vertical' }}
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Describe the issue in detail" 
              />
              {errors.description && <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{errors.description}</div>}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Preferred Visit Date (Optional)</label>
                <input 
                  type="date" 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                  value={preferredDate} 
                  onChange={e => setPreferredDate(e.target.value)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Preferred Time (Optional)</label>
                <input 
                  type="time" 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                  value={preferredTime} 
                  onChange={e => setPreferredTime(e.target.value)} 
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Attachment / Evidence (Optional)</label>
              <div style={{ border: '2px dashed #E2E8F0', backgroundColor: '#F8FAFC', padding: '32px', textAlign: 'center', borderRadius: '16px', color: '#64748B', cursor: 'pointer', transition: 'border-color 0.2s', ':hover': { borderColor: '#94A3B8' } } as any}>
                <Plus size={24} color="#94A3B8" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Click to upload photos</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>JPEG, PNG up to 5MB</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                disabled={isSubmitting}
                style={{ padding: '12px 24px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ padding: '12px 24px', backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', minWidth: '160px' }}
              >
                {isSubmitting ? <ButtonLoading label="Submitting..." /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>Your Requests</h3>
        
        {requests.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <HeartHandshake size={32} color="#94A3B8" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: '0 0 8px 0' }}>No service requests</h4>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>You haven't submitted any care or warranty requests yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {requests.map(r => {
              const colors = statusColor(r.status);
              const requestTitle = r.request.split('\n')[0].replace(/^\[.*?\]\s*/, ''); // Remove the [Category / Priority] tag from title for display
              
              // Extract category for display
              const match = r.request.match(/^\[(.*?) \//);
              const extractedCategory = match ? match[1] : 'Other';

              return (
                <div key={r.id} style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '16px', backgroundColor: '#F8FAFC', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} className="hover-lift">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontSize: '12px', fontWeight: 600 }}>
                      {friendlyStatus(r.status)}
                    </span>
                  </div>
                  
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.4 }}>
                    {requestTitle || 'Service Request'}
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
                      <Wrench size={14} /> {extractedCategory}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
                      <Calendar size={14} /> {r.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerCare;
