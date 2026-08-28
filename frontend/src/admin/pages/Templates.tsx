import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Archive, RotateCcw } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { templatesApi } from '../../api/services';
import { CommTemplate } from '../../services/mockDb';
import { PageLoading } from '../../components/LoadingState';

const Templates: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CommTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommTemplate | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'Report' | 'Letter' | 'Certificate' | 'Email'>('Report');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setData(await templatesApi.getTemplates());
    } catch (error) {
      console.error('Failed to fetch templates', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (template?: CommTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setName(template.name);
      setType(template.type);
      setDescription(template.description || '');
      setStatus(template.status);
    } else {
      setEditingTemplate(null);
      setName('');
      setType('Report');
      setDescription('');
      setStatus('Active');
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!type.trim()) newErrors.type = 'Required';
    if (!status.trim()) newErrors.status = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await templatesApi.updateTemplate(editingTemplate.id, { name, type, description, status });
      } else {
        await templatesApi.createTemplate({ name, type, description, status });
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save template', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async (template: CommTemplate) => {
    const newStatus = template.status === 'Archived' ? 'Active' : 'Archived';
    try {
      await templatesApi.updateTemplate(template.id, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Failed to update template status', error);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <PageHeader
        title="Industry Templates"
        subtitle="Manage industry-standard handover templates."
        action={
          <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<Plus size={18} />}>
            Create Template
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(record => (
                <tr key={record.id}>
                  <td><strong style={{ color: 'var(--admin-navy)' }}>{record.name}</strong></td>
                  <td>{record.type}</td>
                  <td>{record.description}</td>
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
                    No templates found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Modal
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
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
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
          <Input label="Template Name" required error={errors.name} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Standard Handover Letter" />
          <Select
            label="Type"
            required
            error={errors.type}
            value={type}
            onChange={e => setType(e.target.value as 'Report' | 'Letter' | 'Certificate' | 'Email')}
            options={[
              { value: 'Report', label: 'Report' },
              { value: 'Letter', label: 'Letter' },
              { value: 'Certificate', label: 'Certificate' },
              { value: 'Email', label: 'Email' }
            ]}
          />
          <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Brief description of this template's use case..." />
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

export default Templates;
