import React, { useEffect, useState } from 'react';
import { Plus, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { plansApi, buildersApi } from '../../api/services';
import { Plan, Builder } from '../../types';
import { PageLoading } from '../../components/LoadingState';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isSuspended = status === 'Suspended' || status === 'Inactive';
  const isPending = status === 'Pending';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
      ${isSuspended ? 'bg-red-50 text-red-700 border-red-200' : isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
    `}>
      {isSuspended && <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>}
      {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>}
      {!isSuspended && !isPending && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>}
      {status === 'Inactive' ? 'Suspended' : status}
    </span>
  );
};

const SubscriptionPlans: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Plan[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

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

  const buildersOnPlan = (planName: string) => builders.filter(b => b.plan === planName).length;

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
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!planName.trim()) newErrors.planName = 'Required';
    if (!billingCycle) newErrors.billingCycle = 'Required';
    if (!status) newErrors.status = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = { name: planName, description, price, billingCycle, maxProjects, maxUnits, maxUsers, storageLimit, status };
      if (editingPlan) {
        await plansApi.updatePlan(editingPlan.id, payload);
      } else {
        await plansApi.createPlan(payload);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save plan', error);
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
              Manage billing tiers and limits.
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
                  <th className="px-5 py-3">Description</th>
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
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-[13px] whitespace-normal min-w-[250px]">
                        {record.description}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[12px] border border-slate-200">
                          {buildersOnPlan(record.name)}
                        </span>
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
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mb-3 opacity-40" />
                        <p className="font-medium text-[#0F172A]">No plans found</p>
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
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSubmitting}
            >
              Save Plan
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Input label="Plan Name" required error={errors.planName} value={planName} onChange={e => setPlanName(e.target.value)} />
          <Input type="number" label="Price" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />

          <div className="col-span-2">
            <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
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

          <Input type="number" label="Maximum Projects" value={maxProjects} onChange={e => setMaxProjects(e.target.value)} />
          <Input type="number" label="Maximum Units" value={maxUnits} onChange={e => setMaxUnits(e.target.value)} />
          <Input type="number" label="Maximum Users" value={maxUsers} onChange={e => setMaxUsers(e.target.value)} />
          <Input type="number" label="Storage Limit (GB)" value={storageLimit} onChange={e => setStorageLimit(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionPlans;
