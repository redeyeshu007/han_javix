import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, Play, Pause, Plus } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { buildersApi, projectsApi } from '../../api/services';
import { Builder } from '../../services/mockDb';
import { PageLoading } from '../../components/LoadingState';

const BuildersList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Builder[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);
  const [modalAction, setModalAction] = useState<'suspend' | 'activate' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [builders, projects] = await Promise.all([
        buildersApi.getBuilders(),
        projectsApi.getProjects()
      ]);
      setData(builders);
      const counts: Record<string, number> = {};
      projects.forEach((p: any) => { counts[p.builderId] = (counts[p.builderId] || 0) + 1; });
      setProjectCounts(counts);
    } catch (error) {
      console.error('Failed to fetch builders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (builder: Builder, action: 'view' | 'edit' | 'suspend' | 'activate') => {
    if (action === 'view') {
      navigate(`/admin/builders/${builder.id}`);
    } else if (action === 'edit') {
      navigate(`/admin/builders/${builder.id}?edit=true`);
    } else {
      setSelectedBuilder(builder);
      setModalAction(action);
      setIsModalOpen(true);
    }
  };

  const confirmAction = async () => {
    if (selectedBuilder && modalAction) {
      const newStatus = modalAction === 'suspend' ? 'Suspended' : 'Active';
      setIsSubmitting(true);
      try {
        await buildersApi.updateBuilder(selectedBuilder.id, { status: newStatus });
        await fetchData();
      } catch (error) {
        console.error('Failed to update builder status', error);
      } finally {
        setIsSubmitting(false);
      }
    }
    setIsModalOpen(false);
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <PageHeader 
        title="Builder Companies" 
        subtitle="Manage organizations using the Handoverly platform."
        action={
          <Button variant="primary" onClick={() => navigate('/admin/builders/new')} leftIcon={<Plus size={18} />}>
            Add Builder
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Projects</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(record => {
                const items: DropdownItem[] = [
                  { key: '1', label: 'View Details', icon: <Eye size={14} />, onClick: () => handleAction(record, 'view') },
                  { key: '2', label: 'Edit Profile', icon: <Edit2 size={14} />, onClick: () => handleAction(record, 'edit') },
                  { key: 'div', label: '', divider: true },
                ];
                
                if (record.status === 'Active' || record.status === 'Pending') {
                  items.push({ 
                    key: '3', 
                    label: 'Suspend Account', 
                    icon: <Pause size={14} />, 
                    danger: true, 
                    onClick: () => handleAction(record, 'suspend') 
                  });
                } else {
                  items.push({ 
                    key: '3', 
                    label: 'Activate Account', 
                    icon: <Play size={14} />, 
                    onClick: () => handleAction(record, 'activate') 
                  });
                }

                return (
                  <tr key={record.id}>
                    <td><strong style={{ color: 'var(--admin-navy)' }}>{record.name}</strong></td>
                    <td>{record.contact}</td>
                    <td>{projectCounts[record.id] || 0}</td>
                    <td>{record.plan}</td>
                    <td><StatusBadge status={record.status} /></td>
                    <td>{record.joined}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Dropdown items={items} />
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-secondary)' }}>
                    No builders found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Modal
        title={modalAction === 'suspend' ? 'Suspend Builder Account' : 'Activate Builder Account'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant={modalAction === 'suspend' ? 'danger' : 'primary'} onClick={confirmAction} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : modalAction === 'suspend' ? 'Suspend Account' : 'Activate Account'}
            </Button>
          </>
        }
      >
        <p>
          {modalAction === 'suspend' 
            ? `Are you sure you want to suspend ${selectedBuilder?.name}? This will prevent all their users from accessing Handoverly.` 
            : `Are you sure you want to activate ${selectedBuilder?.name}? They will regain full access to the platform.`}
        </p>
      </Modal>
    </div>
  );
};

export default BuildersList;
