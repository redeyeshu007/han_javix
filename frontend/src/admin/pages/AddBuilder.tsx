import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Building2, User, CreditCard, ClipboardCheck, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/AdminUI';
import { buildersApi, usersApi, plansApi } from '../../api/services';
import { CredentialSuccessCard } from '../../components/CredentialSuccessCard';
import { Eye, EyeOff } from 'lucide-react';

const AddBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [corporatePhone, setCorporatePhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [website, setWebsite] = useState('');
  
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('');
  const [subscriptionTierName, setSubscriptionTierName] = useState('');
  const [notes, setNotes] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(false);

  useEffect(() => {
    if (step === 3 && plans.length === 0 && !plansError) {
      fetchPlans();
    }
  }, [step]);

  const fetchPlans = () => {
    setPlansLoading(true);
    setPlansError(false);
    plansApi.getPlans()
      .then(data => {
        setPlans(data.filter(p => p.status === 'Active'));
        setPlansLoading(false);
      })
      .catch(() => {
        setPlansError(true);
        setPlansLoading(false);
      });
  };

  const [errors, setErrors] = useState<any>({});
  
  // Credential Card state
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [newlyCreatedAdmin, setNewlyCreatedAdmin] = useState<{name: string, role: string, email: string, password?: string} | null>(null);

  const validateStep = () => {
    const newErrors: any = {};
    if (step === 1) {
      if (!companyName.trim()) newErrors.companyName = 'Required';
      if (!registrationNumber.trim()) newErrors.registrationNumber = 'Required';
      if (!corporateEmail.trim()) newErrors.corporateEmail = 'Required';
      if (!corporatePhone.trim()) newErrors.corporatePhone = 'Required';
      if (!addressLine1.trim()) newErrors.addressLine1 = 'Required';
      if (!city.trim()) newErrors.city = 'Required';
      if (!stateRegion.trim()) newErrors.stateRegion = 'Required';
      if (!country.trim()) newErrors.country = 'Required';
      if (!pincode.trim()) newErrors.pincode = 'Required';
    } else if (step === 2) {
      if (!adminFullName.trim()) newErrors.adminFullName = 'Required';
      if (!adminEmail.trim()) newErrors.adminEmail = 'Required';
      if (!adminPhone.trim()) newErrors.adminPhone = 'Required';
      if (!adminPassword) newErrors.adminPassword = 'Required';
      if (!confirmAdminPassword) newErrors.confirmAdminPassword = 'Required';
      if (adminPassword && confirmAdminPassword && adminPassword !== confirmAdminPassword) {
        newErrors.confirmAdminPassword = 'Passwords do not match.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 3 && !subscriptionTier) return;
      setStep(s => Math.min(s + 1, 4));
    }
  };
  
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newBuilder = await buildersApi.createBuilder({
        name: companyName,
        contact: adminFullName,
        email: corporateEmail,
        phone: corporatePhone,
        address: `${addressLine1}, ${city}, ${stateRegion}, ${country} ${pincode}`,
        brn: registrationNumber,
        plan: subscriptionTierName,
        subscription_plan_id: subscriptionTier,
        status: 'Active',
        adminEmail: adminEmail,
        adminPassword: adminPassword,
        adminName: adminFullName,
        adminPhone: adminPhone
      } as any);



      setLoading(false);
      
      setNewlyCreatedAdmin({
        name: adminFullName,
        role: 'Builder Admin',
        email: adminEmail,
        password: adminPassword
      });
      setShowSuccessCard(true);
    } catch (error) {
      setLoading(false);
      console.error('Failed to create builder', error);
      // optionally show an error message
    }
  };

  const steps = [
    { id: 1, title: 'Company Details', icon: <Building2 size={18} /> },
    { id: 2, title: 'Contact Person', icon: <User size={18} /> },
    { id: 3, title: 'Subscription', icon: <CreditCard size={18} /> },
    { id: 4, title: 'Review', icon: <ClipboardCheck size={18} /> }
  ];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '64px' }}>
      
      {/* Top Navigation */}
      <div style={{ marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/admin/builders')}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            fontSize: '14px', 
            fontWeight: 500, 
            color: 'var(--admin-text-secondary)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            marginLeft: '-16px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = 'var(--admin-navy)';
            e.currentTarget.style.backgroundColor = 'var(--admin-light-blue)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'var(--admin-text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} />
          Back to Builders
        </button>
      </div>

      <PageHeader 
        title="Add Builder Company" 
        subtitle="Onboard a new organization to the Handoverly platform."
      />

      {/* Main Card */}
      <div style={{ 
        backgroundColor: 'var(--admin-surface)', 
        borderRadius: '16px', 
        border: '1px solid var(--admin-border)', 
        boxShadow: '0 4px 20px rgba(7, 26, 51, 0.04)',
        overflow: 'hidden',
        marginTop: '32px'
      }}>
        
        {/* Step Indicator Header */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--admin-border)',
          backgroundColor: '#FAFCFF'
        }}>
          {steps.map((s) => {
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            return (
              <div 
                key={s.id} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '20px 12px',
                  position: 'relative',
                  color: isActive ? 'var(--admin-accent)' : isCompleted ? 'var(--admin-navy)' : 'var(--admin-text-secondary)',
                  fontWeight: isActive || isCompleted ? 600 : 500,
                  fontSize: '13px',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--admin-accent)', borderRadius: '3px 3px 0 0' }} />
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--admin-light-blue)' : isCompleted ? '#E8F5E9' : 'transparent',
                  color: isActive ? 'var(--admin-accent)' : isCompleted ? '#22C55E' : 'inherit',
                  border: `1px solid ${isActive ? 'transparent' : isCompleted ? 'transparent' : 'var(--admin-border)'}`
                }}>
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : s.icon}
                </div>
                
                <span>{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div style={{ padding: '40px' }}>
          <div style={{ minHeight: '320px' }}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Company Information</h3>
                <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '32px' }}>Enter the legal details of the builder company.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Company Name *</label>
                    <input type="text" className={`admin-form-input ${errors.companyName ? 'error' : ''}`} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Green Valley Developers" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Registration Number *</label>
                    <input type="text" className={`admin-form-input ${errors.registrationNumber ? 'error' : ''}`} value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} placeholder="e.g. BRN-12345678" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Corporate Email *</label>
                    <input type="email" className={`admin-form-input ${errors.corporateEmail ? 'error' : ''}`} value={corporateEmail} onChange={e => setCorporateEmail(e.target.value)} placeholder="contact@greenvalley.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Corporate Phone *</label>
                    <input type="tel" className={`admin-form-input ${errors.corporatePhone ? 'error' : ''}`} value={corporatePhone} onChange={e => setCorporatePhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Website</label>
                    <input type="url" className="admin-form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://greenvalley.com" />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}><h4 style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--admin-navy)' }}>Address</h4></div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Address Line 1 *</label>
                    <input type="text" className={`admin-form-input ${errors.addressLine1 ? 'error' : ''}`} value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="123 Builder St" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Address Line 2</label>
                    <input type="text" className="admin-form-input" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Suite 400" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>City *</label>
                    <input type="text" className={`admin-form-input ${errors.city ? 'error' : ''}`} value={city} onChange={e => setCity(e.target.value)} placeholder="New York" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>State / Region *</label>
                    <input type="text" className={`admin-form-input ${errors.stateRegion ? 'error' : ''}`} value={stateRegion} onChange={e => setStateRegion(e.target.value)} placeholder="NY" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Country *</label>
                    <input type="text" className={`admin-form-input ${errors.country ? 'error' : ''}`} value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Pincode / Zip *</label>
                    <input type="text" className={`admin-form-input ${errors.pincode ? 'error' : ''}`} value={pincode} onChange={e => setPincode(e.target.value)} placeholder="10001" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Primary Contact</h3>
                <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '32px' }}>This person will receive the initial platform credentials.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Admin Full Name *</label>
                    <input type="text" className={`admin-form-input ${errors.adminFullName ? 'error' : ''}`} value={adminFullName} onChange={e => setAdminFullName(e.target.value)} placeholder="e.g. Alice Green" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Admin Email *</label>
                    <input type="email" className={`admin-form-input ${errors.adminEmail ? 'error' : ''}`} value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="alice@greenvalley.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Admin Phone *</label>
                    <input type="tel" className={`admin-form-input ${errors.adminPhone ? 'error' : ''}`} value={adminPhone} onChange={e => setAdminPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Admin Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          className={`admin-form-input ${errors.adminPassword ? 'error' : ''}`} 
                          value={adminPassword} 
                          onChange={e => setAdminPassword(e.target.value)} 
                          placeholder="e.g. SecretPassword123!" 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.adminPassword && <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.adminPassword}</div>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Confirm Admin Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className={`admin-form-input ${errors.confirmAdminPassword ? 'error' : ''}`} 
                          value={confirmAdminPassword} 
                          onChange={e => setConfirmAdminPassword(e.target.value)} 
                          placeholder="e.g. SecretPassword123!" 
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmAdminPassword && <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.confirmAdminPassword}</div>}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Builder Logo</label>
                    <div style={{ padding: '24px', border: '1px dashed var(--admin-border)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#F8FAFC' }}>
                      <Upload size={24} style={{ color: '#64748B', margin: '0 auto 8px auto' }} />
                      <span style={{ fontSize: '14px', color: 'var(--admin-navy)', fontWeight: 500 }}>Click to upload logo</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Notes</label>
                    <textarea className="admin-form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional internal notes..." />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Select Subscription</h3>
                <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '32px' }}>Choose the appropriate tier for this builder.</p>
                
                {plansLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--admin-accent)' }} />
                    <p>Loading subscription plans...</p>
                  </div>
                ) : plansError ? (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', color: '#B91C1C' }}>
                    <AlertCircle size={24} style={{ margin: '0 auto 12px auto' }} />
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>Unable to load subscription plans</p>
                    <button type="button" onClick={fetchPlans} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', color: '#B91C1C', fontWeight: 600 }}>Retry</button>
                  </div>
                ) : plans.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
                    <p style={{ fontWeight: 500 }}>No subscription plans available</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {plans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`plan-card ${plan.id === subscriptionTier ? 'selected' : ''}`}
                        onClick={() => { setSubscriptionTier(plan.id); setSubscriptionTierName(plan.name); }}
                      >
                        {plan.id === subscriptionTier && (
                          <div style={{ position: 'absolute', top: 16, right: 16, color: 'var(--admin-accent)' }}>
                            <Check size={20} strokeWidth={3} />
                          </div>
                        )}
                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0 0 12px 0' }}>{plan.name}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: '0 0 24px 0', lineHeight: 1.5, minHeight: '60px' }}>
                          {plan.description}
                        </p>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-navy)' }}>
                          ${plan.price}
                          <span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', fontWeight: 400 }}>/{plan.billingCycle === 'Monthly' ? 'mo' : 'yr'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="fade-in">
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Review & Confirm</h3>
                <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '32px' }}>Please review the details before provisioning the account.</p>
                
                <div style={{ backgroundColor: 'var(--admin-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px dashed var(--admin-border)', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Company Information</div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)' }}>{companyName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>BRN: {registrationNumber}</div>
                    </div>
                    <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--admin-accent)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setStep(1)}>Edit</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px dashed var(--admin-border)', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Primary Contact</div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)' }}>{adminFullName}</div>
                      <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>{adminEmail}</div>
                    </div>
                    <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--admin-accent)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setStep(2)}>Edit</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Subscription</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', backgroundColor: 'var(--admin-light-blue)', color: 'var(--admin-accent)', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                        {subscriptionTierName || 'None'} Plan
                      </div>
                    </div>
                    <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--admin-accent)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setStep(3)}>Edit</button>
                  </div>

                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ 
          padding: '24px 40px', 
          backgroundColor: '#FAFCFF', 
          borderTop: '1px solid var(--admin-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {step > 1 ? (
            <button 
              className="btn-secondary" 
              onClick={handleBack} 
              disabled={loading}
              style={{ backgroundColor: 'white' }}
            >
              Back
            </button>
          ) : (
            <div />
          )}
          
          {step < 4 ? (
            <button className="btn-primary" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ position: 'relative', overflow: 'hidden' }}>
              {loading ? 'Provisioning...' : 'Create Builder Account'}
            </button>
          )}
        </div>

      </div>
      
      {showSuccessCard && newlyCreatedAdmin && (
        <CredentialSuccessCard 
          name={newlyCreatedAdmin.name}
          role={newlyCreatedAdmin.role}
          email={newlyCreatedAdmin.email}
          password={newlyCreatedAdmin.password}
          onClose={() => {
            setShowSuccessCard(false);
            setNewlyCreatedAdmin(null);
            navigate('/admin/builders');
          }}
        />
      )}

      <style>{`
        .admin-form-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--admin-border);
          font-size: 14px;
          color: var(--admin-navy);
          background-color: var(--admin-surface);
          transition: all 0.2s ease;
          outline: none;
          font-family: inherit;
        }
        .admin-form-input::placeholder {
          color: #A0AEC0;
        }
        .admin-form-input:focus {
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 3px var(--admin-light-blue);
        }
        .admin-form-input.error {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px #FEE2E2;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .plan-card {
          border: 2px solid var(--admin-border);
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          position: relative;
          background-color: var(--admin-surface);
          transition: all 0.2s ease;
        }
        .plan-card:hover {
          border-color: #B0C8F2;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
        }
        .plan-card.selected {
          border-color: var(--admin-accent);
          background-color: var(--admin-light-blue);
        }
      `}</style>
    </div>
  );
};

export default AddBuilder;
