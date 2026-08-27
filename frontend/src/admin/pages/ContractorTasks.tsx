import React, { useState, useEffect } from 'react';

import { CheckSquare, AlertTriangle, Play, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { contractorsApi, defectsApi, unitsApi } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';

const ContractorTasks: React.FC = () => {
  const { user } = useAuth();
  const [contractor, setContractor] = useState<any | null>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Resolution form controls
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resNote, setResNote] = useState('');

  const loadTasks = async () => {
    try {
      if (!user) return;
      
      const [allContractors, allUnits] = await Promise.all([
        contractorsApi.getContractors(),
        unitsApi.getUnits()
      ]);
      
      const currentContractor = allContractors.find((c: any) => c.email.toLowerCase() === user.email.toLowerCase());
      setContractor(currentContractor || null);
      setUnits(allUnits);

      if (currentContractor) {
        const allDefects = await defectsApi.getDefects();
        setDefects(allDefects.filter((d: any) => d.contractorId === currentContractor.id));
      }
    } catch (err) {
      console.error('Failed to load contractor tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStartWork = async (id: string) => {
    try {
      await defectsApi.updateDefect(id, 'In Progress', 'Contractor partners commenced repairs.');
      loadTasks();
    } catch (err) {
      console.error('Error starting work:', err);
    }
  };

  const handleResolveDefect = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!resNote.trim()) return;

    try {
      await defectsApi.updateDefect(id, 'Resolved', `Contractor completed repairs. Notes: ${resNote}`, resNote);
      setResNote('');
      setResolvingId(null);
      loadTasks();
    } catch (err) {
      console.error('Error resolving defect:', err);
    }
  };

  if (loading) return <PageLoading />;

  if (!contractor) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-secondary)' }}>
        Contractor profile not found for this account.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>My Repair Tasks</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Partner Workspace ({contractor.companyName}) &bull; Lodge completions and update project engineers.
        </p>
      </div>

      {/* Grid of Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* ASSIGNED TASKS */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#F59E0B" />
            ASSIGNED REPAIRS ({defects.filter(d => d.status === 'Assigned' || d.status === 'Open').length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {defects.filter(d => d.status === 'Assigned' || d.status === 'Open').map(d => {
              const u = units.find(unit => unit.id === d.unitId);
              return (
                <div key={d.id} style={{ padding: '16px', border: '1px solid var(--admin-border)', borderRadius: '8px', backgroundColor: '#FAFCFF' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{d.title}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '12px' }}>
                    Unit: <strong>{u?.name}</strong> &bull; Loc: <strong>{d.location}</strong>
                  </div>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', width: '100%', justifyContent: 'center' }} onClick={() => handleStartWork(d.id)}>
                    <Play size={12} /> Start Repair
                  </button>
                </div>
              );
            })}
            {defects.filter(d => d.status === 'Assigned' || d.status === 'Open').length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                No newly assigned tasks.
              </div>
            )}
          </div>
        </div>

        {/* IN PROGRESS TASKS */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={16} color="var(--admin-accent)" />
            ACTIVE WORK ({defects.filter(d => d.status === 'In Progress').length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {defects.filter(d => d.status === 'In Progress').map(d => {
              const u = units.find(unit => unit.id === d.unitId);
              const isResolving = resolvingId === d.id;

              return (
                <div key={d.id} style={{ padding: '16px', border: '1px solid var(--admin-border)', borderRadius: '8px', backgroundColor: '#FAFCFF' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{d.title}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '12px' }}>
                    Unit: <strong>{u?.name}</strong> &bull; Loc: <strong>{d.location}</strong>
                  </div>

                  {isResolving ? (
                    <form onSubmit={(e) => handleResolveDefect(e, d.id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea 
                        required
                        value={resNote}
                        onChange={e => setResNote(e.target.value)}
                        placeholder="Explain resolution (e.g. replaced tile)"
                        style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--admin-border)', minHeight: '60px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }} onClick={() => setResolvingId(null)}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ padding: '4px 8px', fontSize: '11px', flex: 1, justifyContent: 'center' }}>Submit</button>
                      </div>
                    </form>
                  ) : (
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', width: '100%', justifyContent: 'center', backgroundColor: '#1E3A8A' }} onClick={() => setResolvingId(d.id)}>
                      <Check size={12} /> Resolve Snag
                    </button>
                  )}
                </div>
              );
            })}
            {defects.filter(d => d.status === 'In Progress').length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                No active work items.
              </div>
            )}
          </div>
        </div>

        {/* RESOLVED / COMPLETED TASKS */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={16} color="#2563EB" />
            COMPLETED WORK ({defects.filter(d => d.status === 'Resolved' || d.status === 'Closed').length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {defects.filter(d => d.status === 'Resolved' || d.status === 'Closed').map(d => {
              const u = units.find(unit => unit.id === d.unitId);
              return (
                <div key={d.id} style={{ padding: '12px', border: '1px solid var(--admin-border)', borderRadius: '8px', opacity: 0.8 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{d.title}</h4>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>
                    Unit: <strong>{u?.name}</strong> &bull; Status: <strong style={{ color: 'var(--admin-accent)' }}>{d.status}</strong>
                  </div>
                </div>
              );
            })}
            {defects.filter(d => d.status === 'Resolved' || d.status === 'Closed').length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                No completed work logged yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ContractorTasks;
