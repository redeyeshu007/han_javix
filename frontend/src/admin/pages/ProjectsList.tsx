import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronRight, Briefcase } from 'lucide-react';
import { mockDb, Project } from '../../services/mockDb';
import { useRole } from '../../context/RoleContext';
import { PageHeader } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormElements';
import { Card } from '../../components/ui/Card';

const ProjectsList: React.FC = () => {
  const { activeBuilderId } = useRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newDeveloper, setNewDeveloper] = useState('');
  const [newReraNumber, setNewReraNumber] = useState('');
  const [newLayoutType, setNewLayoutType] = useState('High-rise');
  const [newProjectStatus, setNewProjectStatus] = useState<'Planning' | 'Active' | 'Completed'>('Planning');
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = () => {
    setProjects(mockDb.getProjects(activeBuilderId));
  };

  useEffect(() => {
    loadProjects();
  }, [activeBuilderId]);

  const handleCreateProject = () => {
    const newErrors: any = {};
    if (!newProjectName.trim()) newErrors.newProjectName = 'Required';
    if (!newDeveloper.trim()) newErrors.newDeveloper = 'Required';
    if (!newReraNumber.trim()) newErrors.newReraNumber = 'Required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsSubmitting(true);

    setTimeout(() => {
      mockDb.createProject({
        builderId: activeBuilderId,
        name: newProjectName,
        status: newProjectStatus as any
      });

      setNewProjectName('');
      setNewDeveloper('');
      setNewReraNumber('');
      setNewLayoutType('High-rise');
      setIsSubmitting(false);
      setShowCreateModal(false);
      loadProjects();
    }, 500);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      <PageHeader 
        title="Projects" 
        subtitle="Developments and property assets under management."
        action={
          <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
            Add Project
          </Button>
        }
      />

      <Card style={{ marginBottom: '24px', padding: '16px' }}>
        <Input 
          type="text" 
          placeholder="Search projects..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={18} color="#718096" />}
          style={{ marginBottom: 0 }}
        />
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map(p => (
            <Link key={p.id} to={`/admin/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)'
                  }}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{p.name}</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <span>Blocks: <strong>{p.blocksCount}</strong></span>
                      <span>Units: <strong>{p.unitsCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <span className={`status-badge status-badge--${p.status === 'Active' ? 'success' : 'warning'}`} style={{ textTransform: 'capitalize' }}>
                    {p.status}
                  </span>

                  <div style={{ width: '120px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      <span>Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress}%`, height: '100%', backgroundColor: 'var(--color-accent)' }} />
                    </div>
                  </div>

                  <ChevronRight size={20} color="var(--color-text-secondary)" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '48px',
            color: 'var(--color-text-secondary)'
          }}>
            <Briefcase size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No projects found</h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>Onboard your first property project to begin managing handovers.</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          </div>
        )}
      </div>

      <Modal
        title="Create New Project"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleCreateProject}
              isLoading={isSubmitting}
            >
              Create Project
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
          <Input 
            label="Project Name" 
            required 
            error={errors.newProjectName} 
            value={newProjectName} 
            onChange={e => setNewProjectName(e.target.value)} 
            placeholder="e.g. Skyline Towers" 
          />
          <Input 
            label="Developer" 
            required 
            error={errors.newDeveloper} 
            value={newDeveloper} 
            onChange={e => setNewDeveloper(e.target.value)} 
            placeholder="e.g. Apex Developments" 
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="RERA Number" 
              required 
              error={errors.newReraNumber} 
              value={newReraNumber} 
              onChange={e => setNewReraNumber(e.target.value)} 
              placeholder="RERA-123" 
            />
            <Select 
              label="Layout Type" 
              required 
              value={newLayoutType} 
              onChange={e => setNewLayoutType(e.target.value)}
              options={[
                { value: 'High-rise', label: 'High-rise' },
                { value: 'Villas', label: 'Villas' },
                { value: 'Commercial', label: 'Commercial' },
                { value: 'Mixed-use', label: 'Mixed-use' }
              ]}
            />
          </div>
          <Select 
            label="Status" 
            required 
            value={newProjectStatus} 
            onChange={e => setNewProjectStatus(e.target.value as any)}
            options={[
              { value: 'Planning', label: 'Planning' },
              { value: 'Active', label: 'Active' }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsList;
