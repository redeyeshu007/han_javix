import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Grid, Activity, Maximize, BedDouble, Bath, CarFront, FileText, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectsApi, unitsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import { useNavigate } from 'react-router-dom';
import { friendlyStatus } from '../../utils/customerCopy';
import '../admin.css';

const CustomerHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [block, setBlock] = useState<any>(null);
  const [floor, setFloor] = useState<any>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!user) return;
      try {
        const [projects, units, blocks, floors] = await Promise.all([
          projectsApi.getProjects(),
          unitsApi.getUnits(user.projectId || ''),
          unitsApi.getBlocks(user.projectId || ''),
          unitsApi.getFloors()
        ]);
        const currentProject = projects.find(p => p.id === user.projectId);
        setProject(currentProject);
        
        const myUnit = units.find((u: any) => u.id === user.unitId) || null;
        setUnit(myUnit);
        
        setBlock(myUnit ? blocks.find((b: any) => b.id === myUnit.blockId) : null);
        setFloor(myUnit ? floors.find((f: any) => f.id === myUnit.floorId) : null);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [user]);

  if (loading) return <PageLoading />;
  
  if (!unit) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748B' }}>
        <Building2 size={64} style={{ opacity: 0.2, marginBottom: '24px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1E293B' }}>No Home Linked Yet</h3>
        <p>Your home details will appear here once your builder links them to your account.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Property Hero Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ height: '160px', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-40px', left: '32px', width: '100px', height: '100px', backgroundColor: '#FFFFFF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '4px solid #FFFFFF' }}>
            <Building2 size={48} color="#3B82F6" />
          </div>
          <div style={{ position: 'absolute', top: '24px', right: '32px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '20px', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
            {friendlyStatus(unit.status)}
          </div>
        </div>
        
        <div style={{ padding: '56px 32px 32px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                {unit.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '15px' }}>
                <MapPin size={18} />
                <span>{project?.name} {block ? `• ${block.name}` : ''} {floor ? `• ${floor.name}` : ''}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property Type</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>{unit.type || 'Apartment'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>Property Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Maximize size={24} color="#64748B" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Total Area</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>{unit.areaSqFt ? `${unit.areaSqFt} Sq.Ft` : 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BedDouble size={24} color="#64748B" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Bedrooms</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>{unit.bedrooms || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bath size={24} color="#64748B" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Bathrooms</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>{unit.bathrooms || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CarFront size={24} color="#64748B" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Parking</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B' }}>{unit.parking || 'N/A'}</div>
                </div>
              </div>

            </div>
          </div>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => navigate('/admin/customer-documents')}
                style={{ flex: 1, padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <FileText size={20} color="#3B82F6" />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>View Documents</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/customer-issues')}
                style={{ flex: 1, padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Wrench size={20} color="#EF4444" />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>Report an Issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0' }}>Your Progress</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Documents</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: unit.docsCleared ? '#10B981' : '#F59E0B' }}>{unit.docsCleared ? 'Approved' : 'Under Review'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Quality Check</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: unit.inspectionStatus === 'Passed' ? '#10B981' : (unit.inspectionStatus === 'Failed' ? '#EF4444' : '#F59E0B') }}>{friendlyStatus(unit.inspectionStatus)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}><Grid size={16} /> Handover</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: unit.keysHandedOver ? '#10B981' : '#64748B' }}>{unit.keysHandedOver ? 'Completed' : 'Not Yet'}</span>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default CustomerHome;
