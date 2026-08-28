import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Archive, RotateCcw } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { checklistsApi } from '../../api/services';
import { ChecklistTemplate } from '../../services/mockDb';
import { PageLoading } from '../../components/LoadingState';

const Checklists: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChecklistTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistTemplate | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setData(await checklistsApi.getChecklists());
    } catch (error) {
      console.error('Failed to fetch checklists', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (checklist?: ChecklistTemplate) => {
    if (checklist) {
      setEditingChecklist(checklist);
      setName(checklist.name);
      setCategory(checklist.category);
      setDescription(checklist.description || '');
      setStatus(checklist.status);
    } else {
      setEditingChecklist(null);
      setName('');
      setCategory('Plumbing');
      setDescription('');
      setStatus('Active');
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!category.trim()) newErrors.category = 'Required';
    if (!status.trim()) newErrors.status = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (editingChecklist) {
        await checklistsApi.updateChecklist(editingChecklist.id, { name, category, description, status });
      } else {
        await checklistsApi.createChecklist({ name, category, description, status, items: 0 });
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save checklist', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async (checklist: ChecklistTemplate) => {
    const newStatus = checklist.status === 'Archived' ? 'Active' : 'Archived';
    try {
      await checklistsApi.updateChecklist(checklist.id, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Failed to update checklist status', error);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <PageHeader
        title="Standard Checklists"
        subtitle="Manage reusable inspection checklists across the platform."
        action={
          <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<Plus size={18} />}>
            New Checklist
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Checklist Name</th>
                <th>Category</th>
                <th>Items</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(record => (
                <tr key={record.id}>
                  <td><strong style={{ color: 'var(--admin-navy)' }}>{record.name}</strong></td>
                  <td>{record.category}</td>
                  <td>{record.items}</td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>{record.updated}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="Edit" onClick={() => handleOpenModal(record)}>
                        <Edit2 size={14} />
                      </Button>
                      {record.status === 'Archived' ? (
                        <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="Restore" onClick={() => handleArchiveToggle(record)}>
                          <RotateCcw size={14} />
                        </Button>
                      ) : (
                        <Button variant="danger" size="sm" style={{ padding: '6px' }} title="Archive" onClick={() => handleArchiveToggle(record)}>
                          <Archive size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-secondary)' }}>
                    No checklists found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Modal
        title={editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}
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
              {editingChecklist ? 'Save Changes' : 'Create Checklist'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
          <Input label="Checklist Name" required error={errors.name} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pre-Handover Quality Check" />
          <Select
            label="Category"
            required
            error={errors.category}
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              { value: 'Plumbing', label: 'Plumbing' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Civil', label: 'Civil' },
              { value: 'Carpentry', label: 'Carpentry' },
              { value: 'General', label: 'General' }
            ]}
          />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description of this checklist's purpose..." />
          <Select
            label="Status"
            required
            error={errors.status}
            value={status}
            onChange={e => setStatus(e.target.value as 'Active' | 'Draft' | 'Archived')}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Archived', label: 'Archived' }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Checklists;
