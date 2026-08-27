import React, { useState, useEffect } from 'react';
import { Share2, Check, ArrowRight } from 'lucide-react';
import { mockDb, AssociationTransition } from '../../services/mockDb';
import { useRole } from '../../context/RoleContext';

const AssociationTransitionPage: React.FC = () => {
  const { activeBuilderId } = useRole();
  const [transition, setTransition] = useState<AssociationTransition | null>(null);

  const loadData = () => {
    const list = mockDb.getTransitions();
    let current = list.find(t => t.builderId === activeBuilderId);
    if (!current) {
      // Seed default
      current = mockDb.updateTransitionStep(activeBuilderId, 'Preparation');
    }
    setTransition(current);
  };

  useEffect(() => {
    loadData();
  }, [activeBuilderId]);

  const handleStepChange = (step: AssociationTransition['step']) => {
    mockDb.updateTransitionStep(activeBuilderId, step);
    loadData();
  };

  const handleItemToggle = (field: keyof Omit<AssociationTransition, 'builderId' | 'step'>) => {
    if (!transition) return;
    const currentStatus = transition[field];
    const nextStatus = currentStatus === 'Pending' ? 'In Progress' : 
                     currentStatus === 'In Progress' ? 'Completed' : 'Pending';
    
    mockDb.updateTransitionItem(activeBuilderId, field, nextStatus);
    loadData();
  };

  if (!transition) return null;

  const steps: AssociationTransition['step'][] = ['Preparation', 'Review', 'Transfer', 'Acceptance', 'Complete'];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0' }}>Association Transition</h1>
        <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginTop: '4px' }}>
          Transition common area assets, legal deeds, and vendor contracts from developer ownership to the Homeowners Association.
        </p>
      </div>

      {/* Progress Wizard Header */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid var(--admin-border)',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '32px',
        boxShadow: '0 4px 15px rgba(7, 26, 51, 0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {steps.map((st, i) => {
          const isActive = transition.step === st;
          const isDone = steps.indexOf(transition.step) > i;
          return (
            <React.Fragment key={st}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: isActive ? 'var(--admin-accent)' : isDone ? 'var(--admin-navy)' : 'var(--admin-text-secondary)',
                  fontWeight: isActive || isDone ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => handleStepChange(st)}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--admin-light-blue)' : isDone ? '#EBF5FF' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px'
                }}>
                  {isDone ? <Check size={12} color="var(--admin-accent)" /> : i + 1}
                </div>
                {st}
              </div>
              {i < steps.length - 1 && <ArrowRight size={16} color="var(--admin-border)" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Checklist section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '32px' }}>
        
        {/* Left Side: Items status */}
        <div>
          <h2 className="section-title">TRANSITION SUBMITTALS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { field: 'commonAreas' as const, label: 'Common Area Handover', desc: 'Lobbies, corridors, stairs, roof decks inspection signoffs.' },
              { field: 'assets' as const, label: 'Asset Register Registry', desc: 'Log of building machinery, elevators, generator units.' },
              { field: 'contracts' as const, label: 'Vendor Service Contracts', desc: 'Transfer security, janitorial, elevator maintenance agreements.' },
              { field: 'financials' as const, label: 'Financial Documents Ledger', desc: 'Audited statements, capital reserve accounting files.' },
              { field: 'legals' as const, label: 'Legal deeds & compliance certifications', desc: 'Occupancy permits, structural certifications, fire safety logs.' }
            ].map(item => {
              const status = transition[item.field];
              return (
                <div key={item.field} style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(7, 26, 51, 0.01)'
                }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--admin-navy)', margin: '0 0 4px 0' }}>{item.label}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', margin: 0 }}>{item.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={`status-badge status-badge--${
                      status === 'Completed' ? 'success' : status === 'In Progress' ? 'warning' : 'neutral'
                    }`}>
                      {status}
                    </span>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleItemToggle(item.field)}>
                      Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Operational Action Info */}
        <div>
          <h2 className="section-title">STAGE SUMMARY</h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--admin-border)',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(7, 26, 51, 0.02)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--admin-navy)', margin: '0 0 12px 0' }}>
              Stage: {transition.step}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {transition.step === 'Preparation' && 'Builder compiles registries, contracts, and financial books.'}
              {transition.step === 'Review' && 'Joint audit conducted by developer engineers and association board.'}
              {transition.step === 'Transfer' && 'Physical operations keys and compliance deeds are registered.'}
              {transition.step === 'Acceptance' && 'Association executes final signoff and release forms.'}
              {transition.step === 'Complete' && 'Asset ownership transitions completely. Developer liabilities closed.'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AssociationTransitionPage;
