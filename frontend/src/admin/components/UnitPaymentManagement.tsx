import React, { useState } from 'react';
import { X } from 'lucide-react';
import { paymentService } from '../../api/services';
import { useRole } from '../../context/RoleContext';
import { ButtonLoading } from '../../components/LoadingState';

interface UnitPaymentManagementProps {
  unitId: string;
  projectId: string;
  customerId?: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

const PAYMENT_TYPES = [
  'Booking Amount',
  'First Installment',
  'Second Installment',
  'Final Payment',
  'Other'
];

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Credit Card',
  'Check',
  'Cash',
  'Other'
];

export const UnitPaymentManagement: React.FC<UnitPaymentManagementProps> = ({ 
  unitId, 
  projectId,
  customerId,
  onClose,
  onRefresh
}) => {
  const { activeRole } = useRole();
  
  // Form State
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Pending Verification' | 'Verified' | 'Cleared'>('Pending Verification');
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileData, setProofFileData] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setProofFileData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reference || !customerId) {
      alert(!customerId ? "No customer assigned to this unit." : "Please fill required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await paymentService.createPayment({
        projectId,
        unitId,
        customerId,
        amount: Number(amount),
        paymentType,
        paymentDate,
        paymentMethod,
        reference,
        status,
        notes,
        proofFileName: proofFileName || undefined,
        proofFileData: proofFileData || undefined,
        title: paymentType, // Legacy fallback
        dueDate: paymentDate, // Legacy fallback
        createdBy: activeRole || 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(status === 'Cleared' || status === 'Verified' ? {
          verifiedBy: activeRole,
          verifiedAt: new Date().toISOString()
        } : {})
      });

      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          {!customerId ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#DC2626' }}>
              No customer is assigned to this unit. Cannot record a payment.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Payment Type *</label>
                  <select 
                    className="admin-form-input" 
                    value={paymentType} 
                    onChange={e => setPaymentType(e.target.value)}
                    required
                  >
                    {PAYMENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="admin-form-group">
                  <label>Amount *</label>
                  <input 
                    type="number" 
                    className="admin-form-input" 
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="e.g. 500000"
                    required 
                    min={1}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group">
                  <label>Payment Date *</label>
                  <input 
                    type="date" 
                    className="admin-form-input" 
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="admin-form-group">
                  <label>Payment Method *</label>
                  <select 
                    className="admin-form-input" 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                    required
                  >
                    {PAYMENT_METHODS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="admin-form-group">
                <label>Payment Reference *</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="e.g. Transaction ID, Check Number..."
                  required 
                />
              </div>

              <div className="admin-form-group">
                <label>Payment Proof (Optional)</label>
                <input type="file" className="admin-form-input" onChange={handleProofChange} accept="image/*,application/pdf" />
                {proofFileName && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Attached: {proofFileName}</div>}
              </div>

              {(activeRole === 'ACCOUNTS' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
                <div className="admin-form-group">
                  <label>Initial Status *</label>
                  <select 
                    className="admin-form-input" 
                    value={status} 
                    onChange={e => setStatus(e.target.value as any)}
                    required
                  >
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Verified">Verified</option>
                    <option value="Cleared">Cleared</option>
                  </select>
                </div>
              )}
              
              <div className="admin-form-group">
                <label>Notes (Optional)</label>
                <textarea 
                  className="admin-form-input" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any relevant notes here..."
                  rows={2}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonLoading label="Saving..." /> : 'Record Payment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
