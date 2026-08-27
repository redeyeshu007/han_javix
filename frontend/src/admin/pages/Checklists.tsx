import React, { useState } from 'react';
import { Plus, Edit2, Copy, Archive } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { checklistsMock } from '../data/adminMockData';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/FormElements';

const Checklists: React.FC = () => {
  const [data, setData] = useState(checklistsMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleOpenModal = () => {
    setName('');
    setCategory('Plumbing');
    setDescription('');
    setStatus('Active');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreateChecklist = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!category.trim()) newErrors.category = 'Required';
    if (!status.trim()) newErrors.status = 'Required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setData([{
        id: Date.now().toString(),
        name,
        category,
        items: 0,
        status,
        updated: 'Just now'
      }, ...data]);
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 500);
  };

  return (
    <div>
      <PageHeader 
        title="Standard Checklists" 
        subtitle="Manage reusable inspection checklists across the platform."
        action={
          <Button variant="primary" onClick={handleOpenModal} leftIcon={<Plus size={18} />}>
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
                      <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="Edit">
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="Duplicate">
                        <Copy size={14} />
                      </Button>
                      <Button variant="danger" size="sm" style={{ padding: '6px' }} title="Archive">
                        <Archive size={14} />
                      </Button>
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
        title="Create New Checklist"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleCreateChecklist}
              isLoading={isSubmitting}
            >
              Create Checklist
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
            onChange={e => setStatus(e.target.value)}
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
