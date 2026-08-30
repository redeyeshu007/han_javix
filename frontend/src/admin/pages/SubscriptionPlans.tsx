import React, { useEffect, useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { plansApi, buildersApi } from '../../api/services';
import { Plan, Builder } from '../../types';;
import { PageLoading } from '../../components/LoadingState';

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
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage billing tiers and limits."
        action={
          <Button variant="primary" onClick={() => handleOpen()} leftIcon={<Plus size={18} />}>
            Create Plan
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Description</th>
                <th>Builders</th>
                <th>Status</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(record => (
                <tr key={record.id}>
                  <td><strong style={{ color: 'var(--admin-navy)' }}>{record.name}</strong></td>
                  <td>{record.description}</td>
                  <td>{buildersOnPlan(record.name)}</td>
                  <td><StatusBadge status={record.status === 'Active' ? 'Active' : 'Suspended'} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <Button variant="secondary" size="sm" style={{ padding: '6px' }} onClick={() => handleOpen(record)} aria-label="Edit plan">
                      <Edit2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-secondary)' }}>
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px' }}>
          <Input label="Plan Name" required error={errors.planName} value={planName} onChange={e => setPlanName(e.target.value)} />
          <Input type="number" label="Price" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />

          <div style={{ gridColumn: '1 / -1' }}>
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
