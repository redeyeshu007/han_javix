import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, EyeOff } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { contractorsApi, projectsApi } from '../../api/services';
import { CredentialSuccessCard } from '../../components/CredentialSuccessCard';
import { PageLoading, ButtonLoading } from '../../components/LoadingState';

interface Contractor {
  id: string;
  builderId: string;
  companyName: string;
  contactPersonFirstName: string;
  contactPersonLastName: string;
  email: string;
  phone: string;
  trade: string;
  status: string;
  assignedProjects: string[];
  address?: string;
  notes?: string;
}

const ContractorsList: React.FC = () => {
  const { activeRole, activeBuilderId } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [allProjects, setAllProjects] = useState<{id: string, name: string}[]>([]);
  
  const [showAddContractor, setShowAddContractor] = useState(false);
  
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('Plumbing');
  const [assignedProjects, setAssignedProjects] = useState('');
  const [status, setStatus] = useState('Active');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Credential Card state
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [newlyCreatedContractor, setNewlyCreatedContractor] = useState<{name: string, role: string, email: string, password?: string} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractorsData, projectsData] = await Promise.all([
        contractorsApi.getContractors(),
        projectsApi.getProjects(activeBuilderId)
      ]);
      setContractors(contractorsData);
      setAllProjects(projectsData.map((p: any) => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBuilderId]);

  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!companyName.trim()) newErrors.companyName = 'Required';
    if (!firstName.trim()) newErrors.firstName = 'Required';
    if (!lastName.trim()) newErrors.lastName = 'Required';
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Invalid email address format.';
    } else if (contractors.some(c => c.email.toLowerCase() === email.toLowerCase().trim())) {
      newErrors.email = 'This email is already associated with an account.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Required';
    }

    if (!trade.trim()) newErrors.trade = 'Required';
    if (!assignedProjects.trim()) newErrors.assignedProjects = 'Required';
    
    if (!password) {
      newErrors.password = 'Required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) newErrors.confirmPassword = 'Required';
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    
    try {
      const projectIds = assignedProjects.split(',').map(s => s.trim()).filter(Boolean);

      await contractorsApi.createContractorWithAccount({
        builderId: activeBuilderId,
        companyName,
        contactPersonFirstName: firstName,
        contactPersonLastName: lastName,
        email,
        phone,
        trade,
        status,
        assignedProjects: projectIds,
        address,
        notes,
        password
      });

      await fetchData();
      
      setNewlyCreatedContractor({
        name: companyName,
        role: 'Contractor',
        email: email,
        password: password
      });
      setShowSuccessCard(true);

      setCompanyName('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setTrade('Plumbing');
      setAssignedProjects('');
      setStatus('Active');
      setAddress('');
      setNotes('');
      setPassword('');
      setConfirmPassword('');
      setShowAddContractor(false);
    } catch (err) {
      setErrors({ email: 'Failed to create contractor. Duplicate or system error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = contractors.filter(c => 
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contactPersonFirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contactPersonLastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.trade || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <PageLoading />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Contractor Management</h1>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
            Manage external contractors and service partners.
          </p>
        </div>
        {(activeRole === 'builder_admin' || activeRole === 'super_admin' || activeRole === 'project_manager') && (
          <button className="btn-primary" onClick={() => setShowAddContractor(true)}>
            <Plus size={16} /> Add Contractor
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--admin-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '0 12px', backgroundColor: 'var(--admin-bg)' }}>
          <Search size={18} color="#718096" />
          <input 
            type="text" 
            placeholder="Search contractors by name, company, or trade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px 0', outline: 'none', color: 'var(--admin-navy)', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-secondary)', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
            No contractors found.
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} style={{
              backgroundColor: 'white',
              border: '1px solid var(--admin-border)',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--admin-light-blue)',
                  color: 'var(--admin-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px'
                }}>
                  {c.companyName[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{c.companyName}</h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--admin-text-secondary)', flexWrap: 'wrap' }}>
                    <span>Contact: <strong>{c.contactPersonFirstName} {c.contactPersonLastName}</strong></span>
                    <span>Email: <strong>{c.email}</strong></span>
                    <span>Phone: <strong>{c.phone}</strong></span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                    Assigned Projects: {c.assignedProjects && c.assignedProjects.length > 0 ? c.assignedProjects.join(', ') : 'None'}
                  </div>
                </div>
              </div>
  
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span className="status-badge status-badge--warning" style={{ fontWeight: 600 }}>
                  {c.trade}
                </span>
                <span className={`status-badge ${c.status === 'Active' ? 'status-badge--success' : 'status-badge--error'}`} style={{ fontSize: '11px' }}>
                  {c.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {showAddContractor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 26, 51, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '24px' }}>Add External Contractor</h3>
            <form onSubmit={handleAddContractor} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label className="admin-form-label">Company Name *</label>
                <input type="text" className={`admin-form-input ${errors.companyName ? 'error' : ''}`} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Apex Plumbing Corp" />
                {errors.companyName && <div className="admin-form-error">{errors.companyName}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Contact Person First Name *</label>
                  <input type="text" className={`admin-form-input ${errors.firstName ? 'error' : ''}`} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Mark" />
                  {errors.firstName && <div className="admin-form-error">{errors.firstName}</div>}
                </div>
                <div>
                  <label className="admin-form-label">Contact Person Last Name *</label>
                  <input type="text" className={`admin-form-input ${errors.lastName ? 'error' : ''}`} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Smith" />
                  {errors.lastName && <div className="admin-form-error">{errors.lastName}</div>}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Email Address *</label>
                  <input type="email" className={`admin-form-input ${errors.email ? 'error' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. contractor.apex@test.com" />
                  {errors.email && <div className="admin-form-error">{errors.email}</div>}
                </div>
                <div>
                  <label className="admin-form-label">Phone Number *</label>
                  <input type="tel" className={`admin-form-input ${errors.phone ? 'error' : ''}`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 555-0100" />
                  {errors.phone && <div className="admin-form-error">{errors.phone}</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Trade / Category *</label>
                  <select className={`admin-form-input ${errors.trade ? 'error' : ''}`} style={{ backgroundColor: 'white' }} value={trade} onChange={e => setTrade(e.target.value)}>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Civil">Civil</option>
                    <option value="Painting">Painting</option>
                    <option value="Tiling">Tiling</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Status *</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="admin-form-label">Assigned Project(s) *</label>
                <input type="text" className={`admin-form-input ${errors.assignedProjects ? 'error' : ''}`} value={assignedProjects} onChange={e => setAssignedProjects(e.target.value)} placeholder="Comma separated IDs (e.g. TEST-PRJ-001)" />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Available projects: {allProjects.map(p => p.id).join(', ')}
                </div>
                {errors.assignedProjects && <div className="admin-form-error">{errors.assignedProjects}</div>}
              </div>
              
              <div>
                <label className="admin-form-label">Address (Optional)</label>
                <input type="text" className="admin-form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Contractor business address" />
              </div>
              
              <div>
                <label className="admin-form-label">Notes (Optional)</label>
                <textarea className="admin-form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes about this contractor..." style={{ resize: 'vertical', minHeight: '60px' }}></textarea>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 12px 0' }}>Account Credentials</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="admin-form-label">Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className={`admin-form-input ${errors.password ? 'error' : ''}`} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="e.g. Contractor@1234" 
                        style={{ paddingRight: '40px' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <div className="admin-form-error">{errors.password}</div>}
                  </div>

                  <div>
                    <label className="admin-form-label">Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className={`admin-form-input ${errors.confirmPassword ? 'error' : ''}`} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder="Confirm password" 
                        style={{ paddingRight: '40px' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="admin-form-error">{errors.confirmPassword}</div>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddContractor(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonLoading label="Creating Account..." /> : 'Create Contractor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessCard && newlyCreatedContractor && (
        <CredentialSuccessCard 
          name={newlyCreatedContractor.name}
          role={newlyCreatedContractor.role}
          email={newlyCreatedContractor.email}
          password={newlyCreatedContractor.password}
          onClose={() => {
            setShowSuccessCard(false);
            setNewlyCreatedContractor(null);
          }}
        />
      )}

      <style>{`
        .admin-form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--admin-navy);
          margin-bottom: 8px;
        }
        .admin-form-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--admin-border);
          font-size: 14px;
          color: var(--admin-navy);
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-form-input:focus {
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .admin-form-input.error {
          border-color: #EF4444;
          background-color: #FEF2F2;
        }
        .admin-form-error {
          color: #EF4444;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default ContractorsList;
