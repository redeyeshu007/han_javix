import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Home, Shield, Lock, Edit3, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectsApi, unitsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import '../admin.css';

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [projects, units] = await Promise.all([
          projectsApi.getProjects(),
          unitsApi.getUnits(user.projectId || '')
        ]);
        setProject(projects.find((p: any) => p.id === user.projectId) || null);
        setUnit(units.find((u: any) => u.id === user.unitId) || null);
      } catch (error) {
        console.error('Error fetching profile data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <PageLoading />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            My Profile
          </h1>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Manage your personal information and account settings.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Left Column: Avatar & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#F8FAFC', 
              color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: 800, fontSize: '32px', margin: '0 auto 24px auto', border: '1px solid #E2E8F0'
            }}>
              {(user?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>{user?.name}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: '1px solid #A7F3D0', marginBottom: '24px' }}>
              <Shield size={14} /> Verified Homeowner
            </div>
            
            <button style={{ width: '100%', padding: '12px', backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F1F5F9' } } as any}>
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#64748B" /> Account Security
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Your account is protected with a password. For changes to ownership records, please contact your builder.
            </p>
            <button style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Change Password
            </button>
          </div>

        </div>

        {/* Right Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>Personal Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <User size={18} color="#94A3B8" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B' }}>{user?.name || 'N/A'}</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <Mail size={18} color="#94A3B8" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B' }}>{user?.email || 'N/A'}</span>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <Phone size={18} color="#94A3B8" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#1E293B' }}>{user?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ padding: '12px 24px', backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>Your Property</h3>
            
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={16} color="#475569" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Community</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginLeft: '44px' }}>
                    {project?.name || 'Not linked yet'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Home size={16} color="#475569" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginLeft: '44px' }}>
                    {unit?.name || 'Not linked yet'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>These details are managed by your builder and can't be changed here. If something looks incorrect, please contact our support team.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
