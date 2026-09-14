import React, { useState } from 'react';
import { X } from 'lucide-react';
import { paymentRecordService } from '../../api/services';
import { useRole } from '../../context/RoleContext';
import { toBackendStatus } from '../../utils/statusMap';
import { inputCls, labelCls } from './unit/shared';

interface UnitPaymentManagementProps {
  unitId: string;
  projectId: string;
  customerId?: string | null;
  clearanceId?: string;
  chargeId?: string;
  chargeAmount?: number;
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
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online Payment Gateway' },
  { value: 'OTHER', label: 'Other' }
];

// Initial-status options as raw PaymentClearance.STATUS_CHOICES slugs
// (labels shown for humans). createPayment passes slugs straight through.
const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Pending Verification' },
  { value: 'PARTIALLY_CLEARED', label: 'Verified' },
  { value: 'CLEARED', label: 'Cleared' },
];

export const UnitPaymentManagement: React.FC<UnitPaymentManagementProps> = ({
  unitId,
  projectId,
  customerId,
  clearanceId,
  chargeId,
  chargeAmount,
  onClose,
  onRefresh
}) => {
  const { activeRole } = useRole();

  // Form State
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES[0]);
  const [amount, setAmount] = useState<number | ''>(chargeAmount || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string>(PAYMENT_STATUS_OPTIONS[0].value);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reference || !customerId) {
      alert(!customerId ? "No customer assigned to this unit." : "Please fill required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend PaymentClearance contract (handovers/models.py): unit, customer,
      // unit_amount, amount_received, status, receipt_file, remarks.
      // pending_amount is model-calculated; verified_by/verified_at are stamped
      // server-side from request.user and are never sent from the client.
      const formData = new FormData();
      if (clearanceId) formData.append('clearance', clearanceId);
      if (unitId) formData.append('unit', unitId);
      if (chargeId) formData.append('charge', chargeId);
      formData.append('amount', String(amount));
      formData.append('payment_date', paymentDate);
      formData.append('payment_method', paymentMethod || 'OTHER');
      if (reference) formData.append('reference_id', reference);
      
      // Force customer role to submit PENDING_VERIFICATION on frontend too (though backend also enforces it)
      if (activeRole === 'CUSTOMER') {
        formData.append('status', 'PENDING_VERIFICATION');
      } else {
        formData.append('status', status);
      }
      
      if (notes) formData.append('remarks', notes);
      if (proofFile) {
        formData.append('receipt_file', proofFile);
      }

      await paymentRecordService.createPaymentRecord(formData);

      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-[90%] max-w-[600px] p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-[#0F172A]">Record Payment</h2>
          <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {!customerId ? (
          <div className="text-center p-6 text-red-600 text-[14px]">
            No customer is assigned to this unit. Cannot record a payment.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {!chargeId && (
                <div>
                  <label className={labelCls}>Payment Type *</label>
                  <select
                    className={inputCls()}
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value)}
                    required
                  >
                    {PAYMENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className={labelCls}>Amount *</label>
                <input
                  type="number"
                  className={inputCls()}
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="e.g. 500000"
                  required
                  min={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Date *</label>
                <input
                  type="date"
                  className={inputCls()}
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Payment Method *</label>
                <select
                  className={inputCls()}
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  required
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Payment Reference *</label>
              <input
                type="text"
                className={inputCls()}
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="e.g. Transaction ID, Check Number..."
                required
              />
            </div>

            <div>
              <label className={labelCls}>Payment Proof (Optional)</label>
              <input type="file" className={inputCls()} onChange={handleProofChange} accept="image/*,application/pdf" />
              {proofFileName && <div className="text-[12px] text-slate-500 mt-1">Attached: {proofFileName}</div>}
            </div>

            {(activeRole === 'ACCOUNTS' || activeRole === 'BUILDER_OWNER' || activeRole === 'SUPER_ADMIN') && (
              <div>
                <label className={labelCls}>Initial Status *</label>
                <select
                  className={inputCls()}
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required
                >
                  {PAYMENT_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>Notes (Optional)</label>
              <textarea
                className={inputCls()}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any relevant notes here..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 mt-3">
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold shadow-sm transition-colors" onClick={onClose}>Cancel</button>
              <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shadow-sm transition-all disabled:opacity-60" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
