import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { mockDb, Defect, Unit } from '../../services/mockDb';

const DefectsList: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed'>('All');

  const loadDefects = () => {
    setDefects(mockDb.getDefects());
    setUnits(mockDb.getUnits());
  };

  useEffect(() => {
    loadDefects();
    const interval = setInterval(loadDefects, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = defects.filter(d => {
    const unit = units.find(u => u.id === d.unitId);
    const searchString = `${d.title} ${d.location} ${unit?.name || ''}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Defects Snag Board</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Assign snags to partners, log rectification activities, and reinspect repairs.
        </p>
      </div>

      {/* Toolbar & Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--admin-border)',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '0 12px', backgroundColor: 'var(--admin-bg)' }}>
          <Search size={18} color="#718096" />
          <input 
            type="text" 
            placeholder="Search by title, location or unit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px 0', outline: 'none', color: 'var(--admin-navy)', fontSize: '14px' }}
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select 
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'white',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--admin-navy)',
              outline: 'none'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Defects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length > 0 ? (
          filtered.map(d => {
            const unit = units.find(u => u.id === d.unitId);
            
            return (
              <div key={d.id} style={{
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
                    backgroundColor: '#FFF5F5',
                    color: '#E53E3E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{d.title}</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                      <span>Unit: <strong>{unit?.name || 'Unknown'}</strong></span>
                      <span>Location: <strong>{d.location}</strong></span>
                      <span>Severity: <strong style={{ color: d.severity === 'High' ? '#E53E3E' : 'inherit' }}>{d.severity}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <span className={`status-badge status-badge--${
                    d.status === 'Resolved' || d.status === 'Closed' ? 'success' : 'warning'
                  }`}>
                    {d.status}
                  </span>

                  <Link to={`/admin/defects/${d.id}`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                    View Snag
                  </Link>

                  <Link to={`/admin/defects/${d.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                    <ChevronRight size={20} color="var(--admin-text-secondary)" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'var(--admin-text-secondary)' }}>
            <AlertTriangle size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3>No defects recorded</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default DefectsList;
