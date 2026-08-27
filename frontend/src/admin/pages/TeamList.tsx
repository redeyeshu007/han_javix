import React, { useState, useEffect } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { mockDb, User } from '../../services/mockDb';
import { CredentialSuccessCard } from '../../components/CredentialSuccessCard';
import { Eye, EyeOff } from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  status: string;
}

const TeamList: React.FC = () => {
  const { activeRole, activeBuilderId } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [members, setMembers] = useState<Member[]>([]);
  
  useEffect(() => {
    // Load members from mockDb instead of static state
    const allUsers = mockDb.getUsers();
    
    // Filter for team roles (exclude super_admin, customer, contractor)
    const teamUsers = allUsers.filter(u => 
      ['builder_admin', 'project_manager', 'site_engineer', 'crm', 'accounts'].includes(u.role)
    );
    
    const mappedMembers: Member[] = teamUsers.map(u => {
      // Map system role back to UI role
      let uiRole = 'Admin';
      if (u.role === 'project_manager') uiRole = 'Project Manager';
      if (u.role === 'site_engineer') uiRole = 'Site Engineer';
      if (u.role === 'crm') uiRole = 'CRM';
      if (u.role === 'accounts') uiRole = 'Accounts';
      
      const parts = u.name.split(' ');
      
      return {
        id: u.id,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: u.email,
        role: uiRole,
        phone: u.phone,
        status: u.status
      };
    });
    
    setMembers(mappedMembers);
  }, []);
  const [showAddMember, setShowAddMember] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Project Manager');
  const [assignedProjects, setAssignedProjects] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Credential Card state
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [newlyCreatedMember, setNewlyCreatedMember] = useState<{name: string, role: string, email: string, password?: string} | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!firstName.trim()) newErrors.firstName = 'Required';
    if (!lastName.trim()) newErrors.lastName = 'Required';
    if (!email.trim()) newErrors.email = 'Required';
    
    // Duplicate email check
    if (members.some(m => m.email.toLowerCase() === email.toLowerCase().trim())) {
      newErrors.email = 'This email is already associated with an account.';
    }

    if (!assignedProjects.trim()) newErrors.assignedProjects = 'Required';
    if (!password) newErrors.password = 'Required';
    if (!confirmPassword) newErrors.confirmPassword = 'Required';
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Map UI role to system role
      let systemRole: User['role'] = 'builder_admin';
      switch (role) {
        case 'Project Manager': systemRole = 'project_manager'; break;
        case 'Site Engineer': systemRole = 'site_engineer'; break;
        case 'CRM': systemRole = 'crm'; break;
        case 'Admin': systemRole = 'builder_admin'; break;
      }

      try {
        const newUser = mockDb.createUser({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          role: systemRole,
          password: password,
          builderId: activeBuilderId // associate with current builder
        });

        const newM: Member = {
          id: newUser.id,
          firstName,
          lastName,
          email,
          role,
          phone,
          status
        };

        setMembers([...members, newM]);
        
        setNewlyCreatedMember({
          name: `${firstName} ${lastName}`,
          role: role,
          email: email,
          password: password
        });
        setShowSuccessCard(true);

        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setRole('Project Manager');
        setAssignedProjects('');
        setStatus('Active');
        setPassword('');
        setConfirmPassword('');
        setShowAddMember(false);
      } catch (err) {
        setErrors({ email: 'Failed to create user.' });
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  };

  const filtered = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Team Directory</h1>
          <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
            Manage organization members, engineer credentials, and operational permissions.
          </p>
        </div>
        {(activeRole === 'builder_admin' || activeRole === 'super_admin') && (
          <button className="btn-primary" onClick={() => setShowAddMember(true)}>
            <Plus size={16} /> Invite Member
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
            placeholder="Search team members..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px 0', outline: 'none', color: 'var(--admin-navy)', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(m => (
          <div key={m.id} style={{
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
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--admin-light-blue)',
                color: 'var(--admin-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {m.firstName[0]}{m.lastName[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{m.firstName} {m.lastName}</h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                  <span>Email: <strong>{m.email}</strong></span>
                  <span>Phone: <strong>{m.phone}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="status-badge status-badge--success" style={{ fontWeight: 600 }}>
                {m.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showAddMember && (
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
            maxWidth: '440px',
            boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Invite Team Member</h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">First Name *</label>
                  <input type="text" className={`admin-form-input ${errors.firstName ? 'error' : ''}`} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. John" />
                </div>
                <div>
                  <label className="admin-form-label">Last Name *</label>
                  <input type="text" className={`admin-form-input ${errors.lastName ? 'error' : ''}`} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Doe" />
                </div>
              </div>
              
              <div>
                <label className="admin-form-label">Email Address *</label>
                <input type="email" className={`admin-form-input ${errors.email ? 'error' : ''}`} value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@company.com" />
              </div>

              <div>
                <label className="admin-form-label">Phone Number</label>
                <input type="tel" className="admin-form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 555-0100" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Role *</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={role} onChange={e => setRole(e.target.value)}>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="CRM">CRM</option>
                    <option value="Admin">Admin</option>
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
                <label className="admin-form-label">Assigned Projects *</label>
                <input type="text" className={`admin-form-input ${errors.assignedProjects ? 'error' : ''}`} value={assignedProjects} onChange={e => setAssignedProjects(e.target.value)} placeholder="e.g. Skyline Towers" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`admin-form-input ${errors.password ? 'error' : ''}`} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="e.g. SecretPassword123!" 
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
                  {errors.password && <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.password}</div>}
                </div>

                <div>
                  <label className="admin-form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className={`admin-form-input ${errors.confirmPassword ? 'error' : ''}`} 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="e.g. SecretPassword123!" 
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
                  {errors.confirmPassword && <div style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddMember(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Invitation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showSuccessCard && newlyCreatedMember && (
        <CredentialSuccessCard 
          name={newlyCreatedMember.name}
          role={newlyCreatedMember.role}
          email={newlyCreatedMember.email}
          password={newlyCreatedMember.password}
          onClose={() => {
            setShowSuccessCard(false);
            setNewlyCreatedMember(null);
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
        }
        .admin-form-input:focus {
          border-color: var(--admin-accent);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .admin-form-input.error {
          border-color: #EF4444;
          background-color: #FEF2F2;
        }
      `}</style>

    </div>
  );
};

export default TeamList;
