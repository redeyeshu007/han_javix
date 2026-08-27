import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  CheckSquare, 
  AlertCircle, 
  Key, 
  ChevronRight,
  TrendingUp,
  Building,
  ArrowRight
} from 'lucide-react';
import { mockDb, Project, Unit, Defect } from '../../services/mockDb';
import { useRole } from '../../context/RoleContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const BuilderDashboard: React.FC = () => {
  const { activeBuilderId } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  
  useEffect(() => {
    const loadData = () => {
      const bProjects = mockDb.getProjects(activeBuilderId);
      setProjects(bProjects);
      
      const allUnits = mockDb.getUnits();
      const builderProjectsIds = bProjects.map(p => p.id);
      const bUnits = allUnits.filter(u => builderProjectsIds.includes(u.projectId));
      setUnits(bUnits);

      const allDefects = mockDb.getDefects();
      const bDefects = allDefects.filter(d => builderProjectsIds.includes(d.projectId));
      setDefects(bDefects);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [activeBuilderId]);

  // Calculations
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const totalUnits = units.length;
  const completedInspections = units.filter(u => u.inspectionStatus === 'Passed').length;
  const openDefects = defects.filter(d => d.status !== 'Closed').length;
  const handoverReady = units.filter(u => u.status === 'Approved').length;
  const handedOver = units.filter(u => u.status === 'Handed Over').length;

  return (
    <div style={{ paddingBottom: '48px', animation: 'fadeUp 0.6s ease-out' }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0B1F33 0%, #1A365D 100%)',
        borderRadius: '16px',
        padding: '40px',
        color: 'white',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(11, 31, 51, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Operations Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
            Manage your development handovers, inspections, and defects in one unified place. Stay on top of your portfolio's progress.
          </p>
        </div>
      </div>

      {/* Grid Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <Card className="hover-lift">
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Briefcase size={24} color="#2563EB" />
              </div>
              <span style={{ padding: '4px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                PROJECTS
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.02em' }}>
              {activeProjectsCount}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Active developments</div>
          </CardBody>
        </Card>

        <Card className="hover-lift">
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <CheckSquare size={24} color="#16A34A" />
              </div>
              <span style={{ padding: '4px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                INSPECTIONS
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {completedInspections}
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#94A3B8' }}>/ {totalUnits}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Units passed inspections</div>
          </CardBody>
        </Card>

        <Card className="hover-lift">
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: openDefects > 0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(71, 85, 105, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <AlertCircle size={24} color={openDefects > 0 ? "#DC2626" : "#475569"} />
              </div>
              <span style={{ padding: '4px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                DEFECTS
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.02em' }}>
              {openDefects}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Awaiting contractor repair</div>
          </CardBody>
        </Card>

        <Card className="hover-lift">
          <CardBody style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Key size={24} color="#8B5CF6" />
              </div>
              <span style={{ padding: '4px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                HANDOVER
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              {handoverReady}
              {handedOver > 0 && <span style={{ fontSize: '14px', fontWeight: 600, color: '#16A34A', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{handedOver} done</span>}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Fully approved units</div>
          </CardBody>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Projects Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} color="#2563EB" />
              Active Projects
            </h2>
            <Link to="/admin/projects" style={{ fontSize: '14px', color: '#2563EB', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <Card>
            <CardBody style={{ padding: 0 }}>
              {projects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {projects.map((p, i) => (
                    <Link key={p.id} to={`/admin/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        padding: '24px',
                        borderBottom: i !== projects.length - 1 ? '1px solid #E2E8F0' : 'none',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{p.name}</div>
                            <div style={{ fontSize: '14px', color: '#64748B' }}>{p.address}</div>
                          </div>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronRight size={20} color="#64748B" />
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                            <span>Handover Progress</span>
                            <span style={{ color: '#2563EB' }}>{p.progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${p.progress}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', 
                              borderRadius: '4px',
                              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748B', padding: '48px 24px' }}>
                  <Building size={48} color="#CBD5E1" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>No active projects found.</p>
                  <p style={{ margin: '4px 0 16px 0', fontSize: '14px' }}>Go to Projects to create your first development.</p>
                  <Button variant="outline" onClick={() => window.location.href = '/admin/projects'}>Go to Projects</Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Side: Quick Actions */}
        <div>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="#2563EB" />
            Quick Actions
          </h2>
          <Card>
            <CardBody style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link to="/admin/inspections" style={{ textDecoration: 'none' }}>
                <Button variant="primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px', height: 'auto', fontSize: '15px' }}>
                  <CheckSquare size={20} style={{ marginRight: '12px' }} />
                  Conduct Inspections
                </Button>
              </Link>
              <Link to="/admin/defects" style={{ textDecoration: 'none' }}>
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px', height: 'auto', fontSize: '15px' }}>
                  <AlertCircle size={20} style={{ marginRight: '12px' }} />
                  Manage Defects
                </Button>
              </Link>
              <Link to="/admin/handover" style={{ textDecoration: 'none' }}>
                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px', height: 'auto', fontSize: '15px' }}>
                  <Key size={20} style={{ marginRight: '12px' }} />
                  Handover Workspace
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>

      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(15, 23, 42, 0.1);
        }
        @media (max-width: 1024px) {
          .hover-lift {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BuilderDashboard;

