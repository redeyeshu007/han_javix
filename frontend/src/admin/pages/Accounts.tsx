import React, { useState } from 'react';
import { Eye, Pause, Play, Plus } from 'lucide-react';
import { PageHeader, StatusBadge } from '../components/AdminUI';
import { accountsMock } from '../data/adminMockData';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/FormElements';

const Accounts: React.FC = () => {
  const [data, setData] = useState(accountsMock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'suspend' | 'activate' | 'create' | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Builder Admin');
  const [status, setStatus] = useState('Active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleAction = (user: any, action: 'suspend' | 'activate') => {
    setSelectedUser(user);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const confirmAction = () => {
    if (modalAction === 'create') {
      const newErrors: any = {};
      if (!firstName) newErrors.firstName = 'Required';
      if (!lastName) newErrors.lastName = 'Required';
      if (!email) newErrors.email = 'Required';
      if (!password) newErrors.password = 'Required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setIsSubmitting(true);
      setTimeout(() => {
        setData([{
          id: Date.now().toString(),
          name: `${firstName} ${lastName}`,
          company: 'Handoverly',
          role: role,
          status: status,
          lastActive: 'Just now'
        }, ...data]);
        setIsSubmitting(false);
        setIsModalOpen(false);
      }, 500);
      return;
    }

    if (selectedUser && modalAction) {
      const newStatus = modalAction === 'suspend' ? 'Suspended' : 'Active';
      setData(data.map(u => u.id === selectedUser.id ? { ...u, status: newStatus } : u));
    }
    setIsModalOpen(false);
  };

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
              setRole('Builder Admin');
              setStatus('Active');
              setPassword('');
              setConfirmPassword('');
              setErrors({});
              setModalAction('create');
              setIsModalOpen(true);
            }}
          >
            Add Account
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
                <th>Last Active</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(record => (
                <tr key={record.id}>
                  <td><strong style={{ color: 'var(--admin-navy)' }}>{record.name}</strong></td>
                  <td>{record.company}</td>
                  <td>{record.role}</td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>{record.lastActive}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="secondary" size="sm" style={{ padding: '6px' }} title="View User">
                        <Eye size={14} />
                      </Button>
                      {record.status !== 'Suspended' ? (
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
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-secondary)' }}>
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Modal
        title={modalAction === 'suspend' ? 'Suspend Account?' : modalAction === 'activate' ? 'Activate Account?' : 'Create Internal Account'}
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
            <Select 
              label="Role" 
              required 
              value={role} 
              onChange={e => setRole(e.target.value)}
              options={[
                { value: 'Super Admin', label: 'Super Admin' },
                { value: 'Builder Admin', label: 'Builder Admin' },
                { value: 'Project Manager', label: 'Project Manager' },
                { value: 'Site Engineer', label: 'Site Engineer' },
                { value: 'CRM', label: 'CRM' },
                { value: 'Accounts', label: 'Accounts' }
              ]}
            />
            <Select 
              label="Status" 
              required 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Suspended', label: 'Suspended' }
              ]}
            />
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
