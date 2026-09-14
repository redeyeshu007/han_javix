import React, { useEffect, useState } from 'react';
import { Plus, Edit2, AlertCircle, CreditCard, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { plansApi, buildersApi, formatINR } from '../../api/services';
import { Plan, Builder } from '../../types';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isInactive = status === 'Inactive';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isInactive ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isInactive ? 'bg-red-600' : 'bg-emerald-600'}`} />
      {isInactive ? 'Inactive' : 'Active'}
    </span>
  );
};

const SubscriptionPlans: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Plan[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [maxProjects, setMaxProjects] = useState('');
  const [maxUnits, setMaxUnits] = useState('');
  const [maxUsers, setMaxUsers] = useState('');
  const [storageLimit, setStorageLimit] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plans, builderList] = await Promise.all([plansApi.getPlans(), buildersApi.getBuilders()]);
      setData(plans);
      setBuilders(builderList);
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buildersOnPlan = (planId: string) => builders.filter(b => b.subscription_plan_id === planId).length;

  const handleOpen = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name || '');
      setDescription(plan.description || '');
      setPrice(plan.price || '');
      setBillingCycle(plan.billingCycle || 'Monthly');
      setMaxProjects(plan.maxProjects || '');
      setMaxUnits(plan.maxUnits || '');
      setMaxUsers(plan.maxUsers || '');
      setStorageLimit(plan.storageLimit || '');
      setStatus(plan.status || 'Active');
    } else {
      setEditingPlan(null);
      setPlanName('');
      setDescription('');
      setPrice('');
      setBillingCycle('Monthly');
      setMaxProjects('');
      setMaxUnits('');
      setMaxUsers('');
      setStorageLimit('');
      setStatus('Active');
    }
    setErrors({});
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!planName.trim()) newErrors.planName = 'Plan name is required';
    if (!billingCycle) newErrors.billingCycle = 'Billing cycle is required';
    if (price && isNaN(parseFloat(price))) newErrors.price = 'Must be a valid number';
    if (price && parseFloat(price) < 0) newErrors.price = 'Price cannot be negative';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // plansApi now handles camelCase → snake_case mapping internally
      const payload: any = {
        name: planName,
        description,
        price: price || '0',
        billingCycle,
        maxProjects: maxProjects || null,
        maxUnits: maxUnits || null,
        maxUsers: maxUsers || null,
        storageLimit: storageLimit || null,
        status,
      };
      if (editingPlan) {
        await plansApi.updatePlan(editingPlan.id, payload);
      } else {
        await plansApi.createPlan(payload);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      const data = error?.response?.data;
      if (data) {
        const firstKey = Object.keys(data)[0];
        const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        setSubmitError(typeof msg === 'string' ? msg : 'Failed to save plan. Please check all fields.');
      } else {
        setSubmitError(error?.message || 'Failed to save plan. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-6 lg:p-8 font-sans text-[#0F172A] w-full flex-1">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Subscription Plans
            </h1>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Manage billing tiers and feature limits for builder companies.
            </p>
          </div>
          <button 
            onClick={() => handleOpen()}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} className="mr-1.5" strokeWidth={2.5} />
            Create Plan
          </button>
        </section>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3">Plan Name</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Billing</th>
                  <th className="px-5 py-3">Limits</th>
                  <th className="px-5 py-3">Builders</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(record => {
                  const items: DropdownItem[] = [
                    { key: '1', label: 'Edit Plan', icon: <Edit2 size={14} />, onClick: () => handleOpen(record) }
                  ];

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A] text-[13px]">{record.name}</div>
                        {record.description && (
                          <div className="text-[12px] text-slate-400 mt-0.5 max-w-[200px] truncate">{record.description}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-[#0F172A] text-[14px]">
                          {record.price ? formatINR(parseFloat(record.price)) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[12px] border border-blue-100">
                          {record.billingCycle || 'Monthly'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5 text-[12px] text-slate-500">
                          {record.maxProjects && <span>{record.maxProjects} projects</span>}
                          {record.maxUnits && <span>{record.maxUnits} units</span>}
                          {record.maxUsers && <span>{record.maxUsers} users</span>}
                          {!record.maxProjects && !record.maxUnits && !record.maxUsers && <span className="text-slate-300 italic">No limits set</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="inline-flex items-center gap-1.5">
                          <Users size={13} className="text-slate-400" />
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[12px] border border-slate-200">
                            {buildersOnPlan(record.id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Dropdown items={items} />
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <CreditCard className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No subscription plans found</p>
                        <p className="text-sm mt-1">Get started by creating a new subscription plan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Modal
        title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSubmitting}
            >
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Plan Name" required error={errors.planName} value={planName} onChange={e => setPlanName(e.target.value)} placeholder="e.g. Professional" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-[14px]">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="25000"
                  className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.price ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                />
              </div>
              {errors.price && <p className="text-[12px] text-red-600 mt-1">{errors.price}</p>}
            </div>

            <Select
              label="Billing Cycle"
              required
              error={errors.billingCycle}
              value={billingCycle}
              onChange={e => setBillingCycle(e.target.value as 'Monthly' | 'Yearly')}
              options={[
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Yearly', label: 'Yearly' }
              ]}
            />

            <div className="col-span-2">
              <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief description of what this plan includes..." />
            </div>

            <Input type="number" label="Maximum Projects" value={maxProjects} onChange={e => setMaxProjects(e.target.value)} placeholder="e.g. 5" />
            <Input type="number" label="Maximum Units" value={maxUnits} onChange={e => setMaxUnits(e.target.value)} placeholder="e.g. 100" />
            <Input type="number" label="Maximum Users" value={maxUsers} onChange={e => setMaxUsers(e.target.value)} placeholder="e.g. 10" />
            <Input type="number" label="Storage Limit (GB)" value={storageLimit} onChange={e => setStorageLimit(e.target.value)} placeholder="e.g. 10" />

            <div className="col-span-2">
              <Select
                label="Status"
                required
                error={errors.status}
                value={status}
                onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
              />
            </div>
          </div>

          {price && billingCycle && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[13px] text-blue-700 font-medium">
              Preview: <span className="font-bold">{formatINR(parseFloat(price) || 0, billingCycle)}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionPlans;
