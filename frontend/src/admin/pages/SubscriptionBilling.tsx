import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, 
  ChevronDown, IndianRupee, Calendar, Building2, CreditCard
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { subscriptionBillingApi, buildersApi, plansApi, formatINR } from '../../api/services';
import { Builder, Plan } from '../../types';
import { PageLoading } from '../../components/LoadingState';

type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED' | 'CANCELLED';

interface BillingRecord {
  id: string;
  builder: string;
  builder_name: string;
  builder_status: string;
  plan: string | null;
  plan_name: string | null;
  plan_billing_cycle: string | null;
  billing_period_start: string;
  billing_period_end: string;
  amount_due: string;
  amount_paid: string;
  payment_status: PaymentStatus;
  due_date: string;
  paid_date: string | null;
  payment_reference: string;
  notes: string;
  recorded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  PENDING: { label: 'Pending', icon: <Clock size={12} />, classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAID: { label: 'Paid', icon: <CheckCircle size={12} />, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OVERDUE: { label: 'Overdue', icon: <AlertCircle size={12} />, classes: 'bg-red-50 text-red-700 border-red-200' },
  FAILED: { label: 'Failed', icon: <XCircle size={12} />, classes: 'bg-red-50 text-red-700 border-red-200' },
  CANCELLED: { label: 'Cancelled', icon: <XCircle size={12} />, classes: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.classes}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const PAYMENT_STATUS_FILTERS = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Failed', value: 'FAILED' },
];

const SubscriptionBilling: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BillingRecord[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Create billing modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createBuilder, setCreateBuilder] = useState('');
  const [createPlan, setCreatePlan] = useState('');
  const [createAmountDue, setCreateAmountDue] = useState('');
  const [createPeriodStart, setCreatePeriodStart] = useState('');
  const [createPeriodEnd, setCreatePeriodEnd] = useState('');
  const [createDueDate, setCreateDueDate] = useState('');
  const [createNotes, setCreateNotes] = useState('');

  // Record payment modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<BillingRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const fetchData = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      const [records, builderList, planList] = await Promise.all([
        subscriptionBillingApi.getAll({ payment_status: status || undefined }),
        buildersApi.getBuilders(),
        plansApi.getPlans(),
      ]);
      setData(records);
      setBuilders(builderList);
      setPlans(planList);
    } catch (error) {
      console.error('Failed to fetch billing data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setShowStatusFilter(false);
    fetchData(value);
  };

  const openCreateModal = () => {
    setCreateBuilder('');
    setCreatePlan('');
    setCreateAmountDue('');
    const today = new Date().toISOString().split('T')[0];
    setCreatePeriodStart(today);
    setCreatePeriodEnd('');
    setCreateDueDate('');
    setCreateNotes('');
    setSubmitError(null);
    setIsCreateOpen(true);
  };

  // Auto-populate plan price when builder+plan selected
  const handleBuilderChange = (builderId: string) => {
    setCreateBuilder(builderId);
    const builder = builders.find(b => b.id === builderId);
    if (builder?.subscription_plan_id) {
      const plan = plans.find(p => p.id === builder.subscription_plan_id);
      if (plan) {
        setCreatePlan(plan.id);
        setCreateAmountDue(plan.price || '');
      }
    }
  };

  const handleCreateSubmit = async () => {
    if (!createBuilder || !createPeriodStart || !createPeriodEnd || !createDueDate || !createAmountDue) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await subscriptionBillingApi.create({
        builder: createBuilder,
        plan: createPlan || undefined,
        billing_period_start: createPeriodStart,
        billing_period_end: createPeriodEnd,
        amount_due: parseFloat(createAmountDue),
        due_date: createDueDate,
        notes: createNotes,
      });
      await fetchData(statusFilter);
      setIsCreateOpen(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      if (errData) {
        const firstKey = Object.keys(errData)[0];
        const msg = Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey];
        setSubmitError(typeof msg === 'string' ? msg : 'Failed to create billing record.');
      } else {
        setSubmitError(error?.message || 'Failed to create billing record.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (record: BillingRecord) => {
    setPaymentRecord(record);
    setPaymentAmount(record.amount_due);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentReference('');
    setPaymentNotes('');
    setSubmitError(null);
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentRecord || !paymentAmount || !paymentDate) {
      setSubmitError('Amount and payment date are required.');
      return;
    }
    setIsPaymentSubmitting(true);
    setSubmitError(null);
    try {
      await subscriptionBillingApi.recordPayment(paymentRecord.id, {
        amount_paid: parseFloat(paymentAmount),
        paid_date: paymentDate,
        payment_reference: paymentReference,
        notes: paymentNotes,
      });
      await fetchData(statusFilter);
      setIsPaymentOpen(false);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to record payment.');
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleMarkOverdue = async (record: BillingRecord) => {
    try {
      await subscriptionBillingApi.markOverdue(record.id);
      await fetchData(statusFilter);
    } catch (error) {
      console.error('Failed to mark as overdue', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Stats summary
  const totalDue = data.filter(r => r.payment_status !== 'CANCELLED').reduce((s, r) => s + parseFloat(r.amount_due || '0'), 0);
  const totalPaid = data.filter(r => r.payment_status === 'PAID').reduce((s, r) => s + parseFloat(r.amount_paid || '0'), 0);
  const overdueCount = data.filter(r => r.payment_status === 'OVERDUE').length;

  if (loading) return <PageLoading />;

  const activeFilterLabel = PAYMENT_STATUS_FILTERS.find(f => f.value === statusFilter)?.label || 'All Status';

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">

        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Subscription Billing</h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Track and manage subscription payment records for all builder companies.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} className="mr-1.5" strokeWidth={2.5} />
            New Billing Record
          </button>
        </section>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <IndianRupee size={18} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total Billed</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{formatINR(totalDue)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total Collected</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{formatINR(totalPaid)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Overdue</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{overdueCount}</p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <p className="text-[13px] font-semibold text-slate-500">{data.length} records</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchData(statusFilter)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md bg-white text-[13px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {activeFilterLabel}
                  <ChevronDown size={14} />
                </button>
                {showStatusFilter && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                    {PAYMENT_STATUS_FILTERS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => handleStatusFilter(f.value)}
                        className={`w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === f.value ? 'text-[#2563EB] font-semibold' : 'text-slate-700'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Builder</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3">Amount Due</th>
                  <th className="px-5 py-3">Amount Paid</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 size={13} />
                        </div>
                        <span className="font-semibold text-[#0F172A] text-[13px]">{record.builder_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {record.plan_name ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[12px] border border-blue-100">
                            {record.plan_name}
                          </span>
                          {record.plan_billing_cycle && (
                            <span className="text-[11px] text-slate-400 ml-1">{record.plan_billing_cycle}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[12px]">No plan</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[12px]">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDate(record.billing_period_start)} – {formatDate(record.billing_period_end)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-[#0F172A] text-[13px]">
                        {formatINR(parseFloat(record.amount_due || '0'))}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {record.payment_status === 'PAID' ? (
                        <span className="font-semibold text-emerald-700 text-[13px]">
                          {formatINR(parseFloat(record.amount_paid || '0'))}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[13px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[13px]">
                      {formatDate(record.due_date)}
                    </td>
                    <td className="px-5 py-3">
                      <PaymentStatusBadge status={record.payment_status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {(record.payment_status === 'PENDING' || record.payment_status === 'OVERDUE') && (
                          <>
                            <button
                              onClick={() => openPaymentModal(record)}
                              className="px-2.5 py-1 text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                            >
                              Record Payment
                            </button>
                            {record.payment_status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkOverdue(record)}
                                className="px-2.5 py-1 text-[12px] font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                              >
                                Mark Overdue
                              </button>
                            )}
                          </>
                        )}
                        {record.payment_status === 'PAID' && (
                          <span className="text-[12px] text-slate-400 italic">
                            Paid {formatDate(record.paid_date)}
                            {record.payment_reference ? ` · ${record.payment_reference}` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CreditCard className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No billing records found</p>
                        <p className="text-sm mt-1">Create a billing record to start tracking payments.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Billing Record Modal */}
      <Modal
        title="New Billing Record"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isSubmitting}>Create Record</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-4">
          {submitError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
          <Select
            label="Builder Company"
            required
            value={createBuilder}
            onChange={e => handleBuilderChange(e.target.value)}
            options={[
              { value: '', label: 'Select a builder...' },
              ...builders.map(b => ({ value: b.id, label: b.name }))
            ]}
          />
          <Select
            label="Subscription Plan"
            value={createPlan}
            onChange={e => {
              setCreatePlan(e.target.value);
              const plan = plans.find(p => p.id === e.target.value);
              if (plan?.price) setCreateAmountDue(plan.price);
            }}
            options={[
              { value: '', label: 'Select a plan...' },
              ...plans.map(p => ({ value: p.id, label: `${p.name} — ${formatINR(parseFloat(p.price || '0'), p.billingCycle)}` }))
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Amount Due (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-[14px]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={createAmountDue}
                  onChange={e => setCreateAmountDue(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <Input type="date" label="Due Date" required value={createDueDate} onChange={e => setCreateDueDate(e.target.value)} />
            <Input type="date" label="Period Start" required value={createPeriodStart} onChange={e => setCreatePeriodStart(e.target.value)} />
            <Input type="date" label="Period End" required value={createPeriodEnd} onChange={e => setCreatePeriodEnd(e.target.value)} />
          </div>
          <Textarea label="Notes" value={createNotes} onChange={e => setCreateNotes(e.target.value)} rows={2} placeholder="Optional notes..." />
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        title={`Record Payment — ${paymentRecord?.builder_name}`}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPaymentOpen(false)} disabled={isPaymentSubmitting}>Cancel</Button>
            <Button variant="primary" onClick={handleRecordPayment} isLoading={isPaymentSubmitting}>Confirm Payment</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pt-4">
          {submitError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
          {paymentRecord && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[13px] text-blue-700">
              <strong>Amount Due:</strong> {formatINR(parseFloat(paymentRecord.amount_due))} · Period: {formatDate(paymentRecord.billing_period_start)} – {formatDate(paymentRecord.billing_period_end)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Amount Paid (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-[14px]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            <Input type="date" label="Payment Date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
          </div>
          <Input label="Payment Reference / UTR" value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="e.g. UTR123456789" />
          <Textarea label="Notes" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} rows={2} placeholder="Optional notes..." />
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionBilling;
