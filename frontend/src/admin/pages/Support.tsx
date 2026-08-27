import React, { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { PageHeader, StatusBadge, StatCard } from '../components/AdminUI';
import { supportMock } from '../data/adminMockData';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/FormElements';

const Support: React.FC = () => {
  const [data, setData] = useState(supportMock);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Create Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleOpenCreate = () => {
    setSubject('');
    setCategory('Technical Issue');
    setPriority('Medium');
    setDescription('');
    setErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = () => {
    const newErrors: any = {};
    if (!subject.trim()) newErrors.subject = 'Required';
    if (!description.trim()) newErrors.description = 'Required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setData([{
        id: Date.now().toString(),
        ticket: `TIC-${Math.floor(1000 + Math.random() * 9000)}`,
        builder: 'Current User Company',
        subject,
        priority,
        status: 'Open',
        updated: 'Just now'
      }, ...data]);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
    }, 600);
  };

  return (
    <div>
      <PageHeader 
        title="Customer Support" 
        subtitle="Manage and respond to platform support tickets."
        action={
          <Button variant="primary" onClick={handleOpenCreate} leftIcon={<Plus size={18} />}>
            Create Ticket
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard title="OPEN TICKETS" value="4" />
        <StatCard title="PENDING TICKETS" value="12" />
        <StatCard title="RESOLVED (TODAY)" value="8" />
      </div>
      
      <Card>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px' }}>
          <select className="admin-input" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}>
            <option>All Statuses</option>
            <option>Open</option>
            <option>Pending</option>
            <option>Resolved</option>
          </select>
          <select className="admin-input" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}>
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Builder</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(record => (
                <tr key={record.id}>
                  <td><strong style={{ color: 'var(--color-navy)' }}>{record.ticket}</strong></td>
                  <td>{record.builder}</td>
                  <td>{record.subject}</td>
                  <td>
                    <span style={{ 
                      color: record.priority === 'High' || record.priority === 'Urgent' ? 'var(--color-red)' : record.priority === 'Medium' ? 'var(--color-amber)' : 'var(--color-text-secondary)',
                      fontWeight: 600
                    }}>
                      {record.priority}
                    </span>
                  </td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>{record.updated}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      style={{ padding: '6px' }} 
                      title="View Ticket"
                      onClick={() => {
                        setSelectedTicket(record);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <MessageSquare size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-text-secondary)' }}>
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      {/* CREATE TICKET MODAL */}
      <Modal
        title="Create Support Ticket"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleCreateSubmit}
              isLoading={isSubmitting}
            >
              Submit Ticket
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
          <Input 
            label="Subject" 
            required 
            error={errors.subject} 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            placeholder="Brief summary of the issue" 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select 
              label="Category" 
              required 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              options={[
                { value: 'Technical Issue', label: 'Technical Issue' },
                { value: 'Billing', label: 'Billing' },
                { value: 'Feature Request', label: 'Feature Request' },
                { value: 'Other', label: 'Other' }
              ]}
            />
            <Select 
              label="Priority" 
              required 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Urgent', label: 'Urgent' }
              ]}
            />
          </div>
          
          <Textarea 
            label="Description" 
            required 
            error={errors.description}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Provide full details..." 
            rows={5}
          />
          
          <Input type="file" label="Attachment" />
        </div>
      </Modal>

      {/* VIEW TICKET MODAL */}
      <Modal
        title={selectedTicket ? `Ticket ${selectedTicket.ticket}: ${selectedTicket.subject}` : 'Ticket'}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        size="lg"
      >
        {selectedTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Builder</div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{selectedTicket.builder}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status</div>
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Original Message - {selectedTicket.updated}</div>
              <p style={{ color: 'var(--color-text)' }}>
                Hello, we are trying to invite a new contractor to our project but the email invitation is not sending. Could you please check?
              </p>
            </div>

            <div>
              <textarea 
                placeholder="Type your reply here..." 
                style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical', outline: 'none', marginBottom: '16px', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="secondary">Add Internal Note</Button>
                  <select className="admin-input" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }}>
                    <option>Change Status: Open</option>
                    <option>Change Status: Pending</option>
                    <option>Change Status: Resolved</option>
                  </select>
                </div>
                <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Send Reply</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Support;
