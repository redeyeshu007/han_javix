import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Unit, Payment } from '../../../types';
import { chargeService } from '../../../api/services';

interface CreateChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  payments: Payment[]; // PaymentClearances
  onSuccess: () => void;
}

const CreateChargeModal: React.FC<CreateChargeModalProps> = ({ isOpen, onClose, units, payments, onSuccess }) => {
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [chargeType, setChargeType] = useState('MAINTENANCE_DEPOSIT');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !amount) {
      setError('Please select a unit and enter an amount.');
      return;
    }

    // Find the clearance for this unit
    const clearance = payments.find(p => p.unitId === selectedUnitId);

    setIsLoading(true);
    setError(null);
    try {
      await chargeService.createCharge({
        clearance: clearance?.id,
        unit: selectedUnitId,
        charge_type: chargeType,
        amount: parseFloat(amount),
        due_date: dueDate || null,
        description,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create charge.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(11, 31, 51, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--admin-navy)', margin: 0 }}>Create New Charge</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--admin-navy)', marginBottom: '8px' }}>Select Unit</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '14px', boxSizing: 'border-box' }}
              required
            >
              <option value="">Select a unit...</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.customer?.name ? `— ${u.customer.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--admin-navy)', marginBottom: '8px' }}>Charge Type</label>
            <select
              value={chargeType}
              onChange={(e) => setChargeType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="MAINTENANCE_DEPOSIT">Maintenance Deposit</option>
              <option value="CORPUS_FUND">Corpus Fund</option>
              <option value="REGISTRATION_CHARGES">Registration Charges</option>
              <option value="UTILITY_CHARGES">Utility Charges</option>
              <option value="ADDITIONAL_WORK">Additional Work</option>
              <option value="LATE_FEE">Late Fee</option>
              <option value="REFUNDABLE_DEPOSIT">Refundable Deposit</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--admin-navy)', marginBottom: '8px' }}>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '14px', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--admin-navy)', marginBottom: '8px' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--admin-navy)', marginBottom: '8px' }}>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details about this charge..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'white', color: 'var(--admin-text-secondary)', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--admin-accent)', color: 'white', fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Creating...' : 'Create Charge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChargeModal;
