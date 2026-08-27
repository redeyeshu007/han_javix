import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import { mockDb, Project, Unit } from '../../services/mockDb';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  status: 'Pass' | 'Fail' | 'N/A';
  defectLogged?: boolean;
  defectTitle?: string;
  defectDesc?: string;
  defectLoc?: string;
  defectSeverity?: 'Low' | 'Medium' | 'High';
  defectContractor?: string;
}

const StartInspection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitIdParam = searchParams.get('unitId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  // Selection
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  
  // Checklist Items State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Electrical
    { id: 'el-1', category: 'Electrical', name: 'Power switches operate smoothly', status: 'Pass' },
    { id: 'el-2', category: 'Electrical', name: 'All power sockets provide stable current', status: 'Pass' },
    { id: 'el-3', category: 'Electrical', name: 'Lighting fixtures functional and hum-free', status: 'Pass' },
    // Plumbing
    { id: 'pl-1', category: 'Plumbing', name: 'Water pressure at faucets is optimal', status: 'Pass' },
    { id: 'pl-2', category: 'Plumbing', name: 'Zero pipe seepage under sinks', status: 'Pass' },
    { id: 'pl-3', category: 'Plumbing', name: 'Drainage outflow operates cleanly', status: 'Pass' },
    // Finishes
    { id: 'fn-1', category: 'Finishes', name: 'Wall paint is consistent, scratch-free', status: 'Pass' },
    { id: 'fn-2', category: 'Finishes', name: 'Tiles are hollow-free and cracks-free', status: 'Pass' }
  ]);

  // Loading selections
  useEffect(() => {
    const projs = mockDb.getProjects();
    setProjects(projs);
    const unts = mockDb.getUnits();
    setUnits(unts);

    if (unitIdParam) {
      const targetUnit = unts.find(u => u.id === unitIdParam);
      if (targetUnit) {
        setSelectedProjectId(targetUnit.projectId);
        setSelectedUnitId(targetUnit.id);
      }
    } else if (projs.length > 0) {
      setSelectedProjectId(projs[0].id);
    }
  }, [unitIdParam]);

  // Load units whenever project changes
  useEffect(() => {
    if (selectedProjectId) {
      const projectUnits = mockDb.getUnits().filter(u => u.projectId === selectedProjectId);
      if (projectUnits.length > 0 && !unitIdParam) {
        setSelectedUnitId(projectUnits[0].id);
      }
    }
  }, [selectedProjectId]);

  const handleStatusChange = (itemId: string, status: 'Pass' | 'Fail' | 'N/A') => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          // Initialize empty defect values if marked fail
          defectTitle: status === 'Fail' ? `Defect: ${item.name}` : undefined,
          defectLoc: status === 'Fail' ? 'Various locations' : undefined,
          defectSeverity: status === 'Fail' ? 'Medium' : undefined,
          defectContractor: status === 'Fail' ? 'CON-001' : undefined
        };
      }
      return item;
    }));
  };

  const handleDefectChange = (itemId: string, field: string, value: any) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) return;

    // Check if any item failed
    const failedItems = checklist.filter(item => item.status === 'Fail');

    if (failedItems.length > 0) {
      const activeProj = projects.find(p => p.id === selectedProjectId);
      const builderId = activeProj?.builderId || 'BLD-001';

      // Create Inspection Record
      const newInspection = mockDb.createInspection({
        builderId,
        projectId: selectedProjectId,
        unitId: selectedUnitId,
        inspectorId: 'USR-000', // Assuming current user is inspector
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        notes: 'Quality Audit Inspection (Failed)'
      });

      // Create defects for all failed items
      failedItems.forEach(item => {
        mockDb.createDefect({
          builderId,
          unitId: selectedUnitId,
          projectId: selectedProjectId,
          inspectionId: newInspection.id,
          title: item.defectTitle || `Defect in ${item.name}`,
          description: item.defectDesc || 'Discovered during quality audit.',
          location: item.defectLoc || 'Unit Interior',
          severity: item.defectSeverity || 'Medium',
          contractorId: item.defectContractor || 'CON-001',
          evidence: []
        });
      });

      // Update unit status to Defects Found, inspection Failed
      mockDb.updateUnit(selectedUnitId, {
        status: 'Defects Found',
        inspectionStatus: 'Failed',
        defectsCleared: false
      });
    } else {
      const activeProj = projects.find(p => p.id === selectedProjectId);
      const builderId = activeProj?.builderId || 'BLD-001';

      // Create Inspection Record
      mockDb.createInspection({
        builderId,
        projectId: selectedProjectId,
        unitId: selectedUnitId,
        inspectorId: 'USR-000',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        notes: 'Quality Audit Inspection (Passed)'
      });

      // Update unit status to Approved, inspection Passed
      mockDb.updateUnit(selectedUnitId, {
        status: 'Approved',
        inspectionStatus: 'Passed',
        defectsCleared: true
      });
    }

    // Go back to unit details
    navigate(`/admin/units/${selectedUnitId}`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '64px' }}>
      
      {/* Back link */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <ArrowLeft size={16} /> Cancel Inspection
        </button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0 0 8px 0' }}>Conduct Snag Inspection</h1>
        <p style={{ fontSize: '15px', color: 'var(--admin-text-secondary)', margin: 0 }}>
          Inspect building works, run standards checkboxes, and log snags on defects.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Step 1: Select Asset */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid var(--admin-border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(7, 26, 51, 0.02)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Project</label>
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!!unitIdParam}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'white' }}
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '8px' }}>Unit</label>
            <select 
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              disabled={!!unitIdParam}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: 'white' }}
            >
              {units.filter(u => u.projectId === selectedProjectId).map(u => (
                <option key={u.id} value={u.id}>Unit {u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Checklist Matrix */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid var(--admin-border)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(7, 26, 51, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}>
          
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', margin: 0 }}>
            INSPECTION CHECKLIST
          </h3>

          {/* Grouped by Categories */}
          {['Electrical', 'Plumbing', 'Finishes'].map(cat => {
            const catItems = checklist.filter(item => item.category === cat);
            return (
              <div key={cat}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {catItems.map(item => (
                    <div key={item.id} style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--admin-border)',
                      backgroundColor: '#FAFCFF'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-navy)' }}>{item.name}</span>
                        
                        {/* Tri-state buttons */}
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--admin-bg)', padding: '2px', borderRadius: '6px' }}>
                          {(['Pass', 'Fail', 'N/A'] as const).map(opt => {
                            const isSel = item.status === opt;
                            let btnBg = 'transparent';
                            let btnColor = 'var(--admin-text-secondary)';
                            if (isSel) {
                              btnBg = opt === 'Pass' ? 'var(--admin-accent)' : opt === 'Fail' ? '#DC2626' : '#6B7C93';
                              btnColor = 'white';
                            }
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleStatusChange(item.id, opt)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  backgroundColor: btnBg,
                                  color: btnColor,
                                  transition: 'all 0.1s ease'
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expand defect subform inline if Fail selected */}
                      {item.status === 'Fail' && (
                        <div style={{
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px dashed var(--admin-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                            <AlertTriangle size={16} /> Log defect snag for this failure
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Issue Description</label>
                              <input 
                                type="text"
                                value={item.defectTitle || ''}
                                onChange={(e) => handleDefectChange(item.id, 'defectTitle', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Location/Notes</label>
                              <input 
                                type="text"
                                placeholder="e.g. Master Bedroom outlet"
                                value={item.defectLoc || ''}
                                onChange={(e) => handleDefectChange(item.id, 'defectLoc', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)', fontSize: '12px' }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Severity</label>
                              <select 
                                value={item.defectSeverity} 
                                onChange={(e) => handleDefectChange(item.id, 'defectSeverity', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)', backgroundColor: 'white', fontSize: '12px' }}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Assign Contractor</label>
                              <select 
                                value={item.defectContractor}
                                onChange={(e) => handleDefectChange(item.id, 'defectContractor', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--admin-border)', backgroundColor: 'white', fontSize: '12px' }}
                              >
                                <option value="CON-001">Elite Tiling Solutions</option>
                                <option value="CON-002">Apex Plumbing Corp</option>
                                <option value="CON-003">Prime Painting Ltd</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Form Actions */}
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Quality Inspection
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default StartInspection;
