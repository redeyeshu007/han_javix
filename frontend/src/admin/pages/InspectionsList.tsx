import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Search, ChevronRight } from 'lucide-react';
import { mockDb, Unit, Project } from '../../services/mockDb';

const InspectionsList: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUnits(mockDb.getUnits());
    setProjects(mockDb.getProjects());
  }, []);

  const filteredUnits = units.filter(u => {
    const proj = projects.find(p => p.id === u.projectId);
    const searchString = `${u.name} ${proj?.name || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Snag Inspections</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Monitor quality audits and schedule pre-handover checking loops.
        </p>
      </div>

      {/* Search toolbar */}
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
            placeholder="Search by unit name or project..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px 0', outline: 'none', color: 'var(--admin-navy)', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Grid List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredUnits.length > 0 ? (
          filteredUnits.map(u => {
            const proj = projects.find(p => p.id === u.projectId);
            
            return (
              <div key={u.id} style={{
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
                    borderRadius: '8px',
                    backgroundColor: 'var(--admin-light-blue)',
                    color: 'var(--admin-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>Unit {u.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Project: <strong>{proj?.name || 'Unknown'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <span className={`status-badge status-badge--${
                    u.inspectionStatus === 'Passed' ? 'success' : u.inspectionStatus === 'Failed' ? 'error' : 'warning'
                  }`}>
                    {u.inspectionStatus === 'Pending' ? 'Awaiting Snag Check' : `Inspection ${u.inspectionStatus}`}
                  </span>
                  
                  <Link to={`/admin/inspections/new?unitId=${u.id}`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                    Inspect
                  </Link>

                  <Link to={`/admin/units/${u.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={20} color="var(--admin-text-secondary)" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'var(--admin-text-secondary)' }}>
            <CheckSquare size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3>No inspection items found</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default InspectionsList;
