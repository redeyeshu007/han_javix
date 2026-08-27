import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Key, ChevronRight, Check, X } from 'lucide-react';
import { mockDb, Unit, Project } from '../../services/mockDb';

const HandoverWorkspace: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);

  const loadData = () => {
    setUnits(mockDb.getUnits());
    setProjects(mockDb.getProjects());
    setDocuments(mockDb.getDocuments());
    setDefects(mockDb.getDefects());
    if (mockDb.getPayments) setPayments(mockDb.getPayments());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = units.filter(u => {
    const p = projects.find(proj => proj.id === u.projectId);
    const searchStr = `${u.name} ${p?.name || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Handover Workspace</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Overview of units nearing occupancy. Clear outstanding compliance and schedule key transitions.
        </p>
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
            placeholder="Search unit or project..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px 0', outline: 'none', color: 'var(--admin-navy)', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Handover List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length > 0 ? (
          filtered.map(u => {
            const proj = projects.find(p => p.id === u.projectId);
            const unitDocs = documents.filter(d => d.unitId === u.id);
            const unitPayments = payments.filter(p => p.unitId === u.id);
            const unitDefects = defects.filter(d => d.unitId === u.id);
            
            const docsCleared = unitDocs.length > 0 && unitDocs.every(d => d.status === 'Verified');
            const paymentCleared = unitPayments.length > 0 && unitPayments.every(p => p.status === 'Cleared');
            const defectsCleared = unitDefects.length > 0 ? unitDefects.every(d => d.status === 'Resolved' || d.status === 'Closed') : u.inspectionStatus === 'Passed';
            
            const isReady = docsCleared && paymentCleared && defectsCleared && u.approvalsCleared;

            return (
              <div key={u.id} style={{
                backgroundColor: 'white',
                border: '1px solid var(--admin-border)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(7, 26, 51, 0.01)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 200px' }}>
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
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>Unit {u.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Project: <strong>{proj?.name}</strong></span>
                  </div>
                </div>

                {/* Audit Checklist columns */}
                <div style={{ display: 'flex', gap: '20px', flex: '2 1 400px', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>DOCS</span>
                    {docsCleared ? <Check size={16} color="var(--admin-accent)" /> : <X size={16} color="#DC2626" />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>PAYMENT</span>
                    {paymentCleared ? <Check size={16} color="var(--admin-accent)" /> : <X size={16} color="#DC2626" />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>SNAGS</span>
                    {defectsCleared ? <Check size={16} color="var(--admin-accent)" /> : <X size={16} color="#DC2626" />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>APPROVAL</span>
                    {u.approvalsCleared ? <Check size={16} color="var(--admin-accent)" /> : <X size={16} color="#DC2626" />}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 200px', justifyContent: 'flex-end' }}>
                  <span className={`status-badge status-badge--${isReady ? 'success' : 'warning'}`}>
                    {isReady ? 'READY' : 'BLOCKED'}
                  </span>

                  <Link to={`/admin/units/${u.id}`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                    View Workspace
                  </Link>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'var(--admin-text-secondary)' }}>
            <Key size={36} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <h3>No units ready or in handover pipeline</h3>
          </div>
        )}
      </div>

    </div>
  );
};

export default HandoverWorkspace;
