import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Briefcase, ChevronRight, FolderPlus } from 'lucide-react';
import { mockDb, Project, Block, Floor, Unit } from '../../services/mockDb';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Block Modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockCode, setNewBlockCode] = useState('');
  const [newBlockDescription, setNewBlockDescription] = useState('');
  const [newBlockFloors, setNewBlockFloors] = useState('');
  const [newBlockStatus, setNewBlockStatus] = useState('Active');

  // Floor Modal
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [floorBlockId, setFloorBlockId] = useState('');
  const [newFloorName, setNewFloorName] = useState('');
  const [newFloorNumber, setNewFloorNumber] = useState('');
  const [newFloorDescription, setNewFloorDescription] = useState('');
  const [newFloorStatus, setNewFloorStatus] = useState('Active');

  // Unit Modal
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitBlockId, setUnitBlockId] = useState('');
  const [unitFloorId, setUnitFloorId] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState('Apartment');
  const [newUnitArea, setNewUnitArea] = useState('');
  const [newUnitBedrooms, setNewUnitBedrooms] = useState('1');
  const [newUnitBathrooms, setNewUnitBathrooms] = useState('1');
  const [newUnitParking, setNewUnitParking] = useState('1');
  const [newUnitStatus, setNewUnitStatus] = useState('Under Construction');

  const loadAllData = () => {
    if (!id) return;
    const p = mockDb.getProjects().find(proj => proj.id === id);
    if (p) {
      setProject(p);
      const blks = mockDb.getBlocks(id);
      setBlocks(blks);
      
      const flrs: Floor[] = [];
      const unts: Unit[] = [];
      blks.forEach(blk => {
        flrs.push(...mockDb.getFloors(blk.id));
      });
      setFloors(flrs);

      const allUnits = mockDb.getUnits();
      setUnits(allUnits.filter(u => u.projectId === id));
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id]);

  useEffect(() => {
    if (blocks.length > 0 && !unitBlockId) {
      setUnitBlockId(blocks[0].id);
      setFloorBlockId(blocks[0].id);
    }
  }, [blocks]);

  useEffect(() => {
    // When the selected block for a new unit changes, reset the floor selection
    // or automatically select the first available floor for convenience.
    const availableFloors = floors.filter(f => f.blockId === unitBlockId);
    if (availableFloors.length > 0) {
      if (!availableFloors.find(f => f.id === unitFloorId)) {
        setUnitFloorId(availableFloors[0].id);
      }
    } else {
      setUnitFloorId('');
    }
  }, [unitBlockId, floors]);

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!newBlockName.trim()) newErrors.newBlockName = 'Required';
    if (!newBlockCode.trim()) newErrors.newBlockCode = 'Required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      mockDb.createBlock({
        builderId: project?.builderId || '',
        projectId: id!,
        name: newBlockName
      });
      setNewBlockName('');
      setNewBlockCode('');
      setNewBlockDescription('');
      setNewBlockFloors('');
      setNewBlockStatus('Active');
      setShowBlockModal(false);
      setIsSubmitting(false);
      loadAllData();
    }, 500);
  };

  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!newFloorName.trim()) newErrors.newFloorName = 'Required';
    if (!newFloorNumber.trim()) newErrors.newFloorNumber = 'Required';
    if (!floorBlockId) newErrors.floorBlockId = 'Required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      mockDb.createFloor({
        builderId: project?.builderId || '',
        projectId: id!,
        blockId: floorBlockId,
        name: newFloorName
      });
      setNewFloorName('');
      setNewFloorNumber('');
      setNewFloorDescription('');
      setNewFloorStatus('Active');
      setShowFloorModal(false);
      setIsSubmitting(false);
      loadAllData();
    }, 500);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!newUnitName.trim()) newErrors.newUnitName = 'Required';
    if (!unitBlockId) newErrors.unitBlockId = 'Required';
    if (!unitFloorId) newErrors.unitFloorId = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      mockDb.createUnit({
        builderId: project?.builderId || '',
        projectId: id!,
        blockId: unitBlockId,
        floorId: unitFloorId,
        name: newUnitName
      });
      setNewUnitName('');
      setNewUnitArea('');
      setNewUnitType('Apartment');
      setNewUnitBedrooms('1');
      setNewUnitBathrooms('1');
      setNewUnitParking('1');
      setShowUnitModal(false);
      setIsSubmitting(false);
      loadAllData();
    }, 500);
  };

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-secondary)' }}>
        Project not found.
      </div>
    );
  }

  const getUnitStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'Under Construction':
        return { bg: '#EFF6FF', border: '#DCE6F2', text: 'var(--admin-accent)' };
      case 'Ready for Inspection':
        return { bg: '#EEF5FF', border: '#B0C8F2', text: 'var(--admin-dark-blue)' };
      case 'Defects Found':
        return { bg: '#FAFCFF', border: '#E2E8F0', text: '#6B7C93' };
      case 'Resolved':
        return { bg: '#EBF5FF', border: '#93C5FD', text: '#1E40AF' };
      case 'Approved':
        return { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A8A' };
      case 'Handed Over':
        return { bg: '#FAFCFF', border: 'var(--admin-navy)', text: 'var(--admin-navy)' };
      default:
        return { bg: 'white', border: 'var(--admin-border)', text: 'var(--admin-navy)' };
    }
  };

  const availableFloorsForUnitModal = floors.filter(f => f.blockId === unitBlockId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '64px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <Link to="/admin/projects" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Back to Projects
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 4px 15px rgba(7, 26, 51, 0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>PROJECT OVERVIEW</span>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--admin-navy)', margin: '4px 0 0 0' }}>{project.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setShowBlockModal(true)}>
              <Plus size={16} /> Add Block
            </button>
            <button className="btn-secondary" onClick={() => {
              if (blocks.length > 0) {
                setFloorBlockId(blocks[0].id);
                setShowFloorModal(true);
              } else {
                alert('Please create a Block first before adding floors!');
              }
            }}>
              <Plus size={16} /> Add Floor
            </button>
            <button className="btn-primary" onClick={() => {
              if (blocks.length > 0 && floors.length > 0) {
                if (!unitBlockId) setUnitBlockId(blocks[0].id);
                setShowUnitModal(true);
              } else {
                alert('Please create a Block and at least one Floor first before adding units!');
              }
            }}>
              <Plus size={16} /> Add Unit
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px', alignItems: 'center', borderTop: '1px solid var(--admin-border)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Total Blocks</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-navy)' }}>{project.blocksCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Total Units</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--admin-navy)' }}>{project.unitsCount}</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--admin-text-secondary)', marginBottom: '6px' }}>
              <span>Handover progress of units</span>
              <span>{project.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: 'var(--admin-accent)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">BUILDING STRUCTURE & UNITS</h2>

        {blocks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {blocks.map(block => {
              const blockFloors = floors.filter(f => f.blockId === block.id);
              
              return (
                <div key={block.id} style={{ backgroundColor: 'white', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(7, 26, 51, 0.01)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderPlus size={18} color="var(--admin-accent)" />
                    {block.name}
                  </h3>

                  {blockFloors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {blockFloors.map(floor => {
                        const floorUnits = units.filter(u => u.blockId === block.id && u.floorId === floor.id);

                        return (
                          <div key={floor.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--admin-border)', paddingBottom: '16px', gap: '24px' }}>
                            <div style={{ width: '120px', fontSize: '14px', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                              {floor.name}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
                              {floorUnits.length > 0 ? (
                                floorUnits.map(unit => {
                                  const c = getUnitStatusColor(unit.status);
                                  return (
                                    <Link key={unit.id} to={`/admin/units/${unit.id}`} style={{ textDecoration: 'none' }}>
                                      <div style={{ padding: '10px 16px', backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px', transition: 'all 0.15s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '4px' }}>{unit.name}</span>
                                        <span style={{ fontSize: '11px', color: c.text, fontWeight: 500 }}>{unit.status}</span>
                                      </div>
                                    </Link>
                                  );
                                })
                              ) : (
                                <span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>No units on this floor yet.</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--admin-text-secondary)', fontSize: '14px' }}>
                      No floors created for this block. Add a floor to map units.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '48px', color: 'var(--admin-text-secondary)' }}>
            <h3>No building structure configured</h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>Create blocks and add units to map this development asset.</p>
            <button className="btn-primary" onClick={() => setShowBlockModal(true)}>
              Add Block
            </button>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Add Block / Phase</h3>
            <form onSubmit={handleCreateBlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Block Name *</label>
                <input type="text" className={`admin-form-input ${errors.newBlockName ? 'error' : ''}`} value={newBlockName} onChange={(e) => setNewBlockName(e.target.value)} placeholder="e.g. Block A" />
              </div>
              <div>
                <label className="admin-form-label">Block Code *</label>
                <input type="text" className={`admin-form-input ${errors.newBlockCode ? 'error' : ''}`} value={newBlockCode} onChange={(e) => setNewBlockCode(e.target.value)} placeholder="e.g. BLK-A" />
              </div>
              <div>
                <label className="admin-form-label">Number of Floors</label>
                <input type="number" className="admin-form-input" value={newBlockFloors} onChange={(e) => setNewBlockFloors(e.target.value)} />
              </div>
              <div>
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-input" value={newBlockDescription} onChange={(e) => setNewBlockDescription(e.target.value)} rows={2} />
              </div>
              <div>
                <label className="admin-form-label">Status *</label>
                <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={newBlockStatus} onChange={(e) => setNewBlockStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowBlockModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Block'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floor Modal */}
      {showFloorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Add Floor</h3>
            <form onSubmit={handleCreateFloor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="admin-form-label">Block *</label>
                <select className={`admin-form-input ${errors.floorBlockId ? 'error' : ''}`} style={{ backgroundColor: 'white' }} value={floorBlockId} onChange={(e) => setFloorBlockId(e.target.value)}>
                  <option value="">Select Block</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-form-label">Floor Name *</label>
                <input type="text" className={`admin-form-input ${errors.newFloorName ? 'error' : ''}`} value={newFloorName} onChange={(e) => setNewFloorName(e.target.value)} placeholder="e.g. 1st Floor" />
              </div>
              <div>
                <label className="admin-form-label">Floor Number *</label>
                <input type="text" className={`admin-form-input ${errors.newFloorNumber ? 'error' : ''}`} value={newFloorNumber} onChange={(e) => setNewFloorNumber(e.target.value)} placeholder="e.g. 1, G, B1" />
              </div>
              <div>
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-input" value={newFloorDescription} onChange={(e) => setNewFloorDescription(e.target.value)} rows={2} />
              </div>
              <div>
                <label className="admin-form-label">Status *</label>
                <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={newFloorStatus} onChange={(e) => setNewFloorStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowFloorModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Floor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {showUnitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7, 26, 51, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', boxShadow: '0 10px 25px rgba(7, 26, 51, 0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '16px' }}>Add New Property Unit</h3>
            <form onSubmit={handleCreateUnit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Block *</label>
                  <select className={`admin-form-input ${errors.unitBlockId ? 'error' : ''}`} style={{ backgroundColor: 'white' }} value={unitBlockId} onChange={(e) => setUnitBlockId(e.target.value)}>
                    <option value="">Select Block</option>
                    {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Floor *</label>
                  <select 
                    className={`admin-form-input ${errors.unitFloorId ? 'error' : ''}`} 
                    style={{ backgroundColor: 'white' }} 
                    value={unitFloorId} 
                    onChange={(e) => setUnitFloorId(e.target.value)}
                    disabled={availableFloorsForUnitModal.length === 0}
                  >
                    {availableFloorsForUnitModal.length === 0 ? (
                      <option value="">No floors in this block</option>
                    ) : (
                      <option value="">Select Floor</option>
                    )}
                    {availableFloorsForUnitModal.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="admin-form-label">Unit Name / Number *</label>
                <input type="text" className={`admin-form-input ${errors.newUnitName ? 'error' : ''}`} value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} placeholder="e.g. A-101, Villa 4" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="admin-form-label">Unit Type</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={newUnitType} onChange={(e) => setNewUnitType(e.target.value)}>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial Space">Commercial Space</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Area (sq ft)</label>
                  <input type="number" className="admin-form-input" value={newUnitArea} onChange={(e) => setNewUnitArea(e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Bedrooms</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={newUnitBedrooms} onChange={(e) => setNewUnitBedrooms(e.target.value)}>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5+">5+ BHK</option>
                  </select>
                </div>
                <div>
                  <label className="admin-form-label">Bathrooms</label>
                  <input type="number" className="admin-form-input" value={newUnitBathrooms} onChange={(e) => setNewUnitBathrooms(e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Parking Spaces</label>
                  <input type="number" className="admin-form-input" value={newUnitParking} onChange={(e) => setNewUnitParking(e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Status *</label>
                  <select className="admin-form-input" style={{ backgroundColor: 'white' }} value={newUnitStatus} onChange={(e) => setNewUnitStatus(e.target.value)}>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready for Inspection">Ready for Inspection</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowUnitModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Unit'}</button>
              </div>
            </form>
          </div>
        </div>
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

export default ProjectDetail;
