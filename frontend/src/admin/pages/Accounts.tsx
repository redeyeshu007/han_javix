import React, { useEffect, useState } from 'react';
import { Eye, Pause, Play, Plus } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/FormElements';
import { usersApi, buildersApi } from '../../api/services';
import { User, Builder } from '../../types';;
import { PageLoading } from '../../components/LoadingState';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  builder_admin: 'Builder Admin',
  project_manager: 'Project Manager',
  site_engineer: 'Site Engineer',
  crm: 'CRM',
  accounts: 'Accounts',
  contractor: 'Contractor',
  customer: 'Customer'
};

const Accounts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<'suspend' | 'activate' | 'create' | null>(null);

  // Create-account form state (Super Admin accounts only — builder-scoped roles are created from a builder's Team page)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userList, builderList] = await Promise.all([
        usersApi.getUsers(),
        buildersApi.getBuilders()
      ]);
      setUsers(userList);
      setBuilders(builderList);
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companyFor = (user: User) => {
    if (!user.builderId) return 'Handoverly Platform';
    return builders.find(b => b.id === user.builderId)?.name || user.builderId;
  };

  const handleAction = (user: User, action: 'suspend' | 'activate') => {
    setSelectedUser(user);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (modalAction === 'create') {
      const newErrors: any = {};
      if (!firstName.trim()) newErrors.firstName = 'Required';
      if (!lastName.trim()) newErrors.lastName = 'Required';
      if (!email.trim()) newErrors.email = 'Required';
      if (!password) newErrors.password = 'Required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setIsSubmitting(true);
      try {
        await usersApi.createUser({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          role: 'super_admin',
          password
        });
        await fetchData();
        setIsModalOpen(false);
      } catch (err) {
        setErrors({ email: err instanceof Error ? err.message : 'Failed to create account.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (selectedUser && modalAction) {
      const newStatus = modalAction === 'suspend' ? 'Inactive' : 'Active';
      setIsSubmitting(true);
      try {
        await usersApi.updateUser(selectedUser.id, { status: newStatus });
        await fetchData();
      } catch (error) {
        console.error('Failed to update account status', error);
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
        title="Account Management"
        subtitle="Manage users across all organizations."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => {
              setFirstName('');
              setLastName('');
              setEmail('');
              setPhone('');
              setPassword('');
              setConfirmPassword('');
              setErrors({});
              setModalAction('create');
              setIsModalOpen(true);
            }}
          >
            Add Platform Account
          </Button>
        }
      />

      <Card>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(record => (
                <tr key={record.id}>
                  <td>
                    <strong style={{ color: 'var(--admin-navy)' }}>{record.name}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>{record.email}</div>
                  </td>
                  <td>{companyFor(record)}</td>
                  <td>{ROLE_LABELS[record.role] || record.role}</td>
                  <td><StatusBadge status={record.status === 'Active' ? 'Active' : 'Suspended'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="View User">
                        <Eye size={14} />
                      </Button>
                      {record.status === 'Active' ? (
                        <Button variant="danger" size="sm" style={{ padding: '6px' }} title="Suspend" onClick={() => handleAction(record, 'suspend')}>
                          <Pause size={14} />
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="Activate" onClick={() => handleAction(record, 'activate')}>
                          <Play size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-secondary)' }}>
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Modal
        title={modalAction === 'suspend' ? 'Suspend Account?' : modalAction === 'activate' ? 'Activate Account?' : 'Create Platform Account'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              variant={modalAction === 'suspend' ? 'danger' : 'primary'}
              onClick={confirmAction}
              isLoading={isSubmitting}
            >
              {modalAction === 'suspend' ? 'Suspend Account' : modalAction === 'activate' ? 'Activate Account' : 'Create Account'}
            </Button>
          </>
        }
      >
        {modalAction === 'create' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px' }}>
            <Input label="First Name" required error={errors.firstName} value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input label="Last Name" required error={errors.lastName} value={lastName} onChange={e => setLastName(e.target.value)} />
            <Input type="email" label="Email" required error={errors.email} value={email} onChange={e => setEmail(e.target.value)} />
            <Input type="tel" label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <div style={{ gridColumn: '1 / -1', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
              This creates a platform-level Super Admin account. Builder-scoped roles (Builder Admin, Project Manager, Site Engineer, CRM, Accounts) are created from within a builder's Team page.
            </div>
            <Input type="password" label="Password" required error={errors.password} value={password} onChange={e => setPassword(e.target.value)} />
            <Input type="password" label="Confirm Password" required error={errors.confirmPassword} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
        ) : (
          <p>
            {modalAction === 'suspend'
              ? `Suspending ${selectedUser?.name} will prevent them from accessing Handoverly.`
              : `Are you sure you want to activate ${selectedUser?.name}?`}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Accounts;
