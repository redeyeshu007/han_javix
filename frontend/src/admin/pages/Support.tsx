import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { PageHeader, StatusBadge, StatCard } from '../components/AdminUI';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableContainer } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/FormElements';
import { supportApi, buildersApi } from '../../api/services';
import { SupportTicket, Builder } from '../../types';;
import { PageLoading } from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SupportTicket[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tickets, builderList] = await Promise.all([supportApi.getTickets(), buildersApi.getBuilders()]);
      setData(tickets);
      setBuilders(builderList);
    } catch (error) {
      console.error('Failed to fetch support tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const builderName = (builderId: string) => builders.find(b => b.id === builderId)?.name || 'Handoverly Platform';

  const handleOpenCreate = () => {
    setSubject('');
    setPriority('Medium');
    setDescription('');
    setErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    const newErrors: any = {};
    if (!subject.trim()) newErrors.subject = 'Required';
    if (!description.trim()) newErrors.description = 'Required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const ticket = await supportApi.createTicket({
        builderId: user?.builderId || '',
        requester: user?.name || 'Platform Admin',
        subject,
        priority
      });
      await supportApi.addMessage(ticket.id, 'builder', description);
      await fetchData();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create ticket', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await supportApi.addMessage(selectedTicket.id, 'admin', replyText);
      const updated = await supportApi.getTickets();
      setData(updated);
      setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to send reply', error);
    }
  };

  const handleStatusChange = async (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    try {
      await supportApi.updateStatus(selectedTicket.id, status);
      const updated = await supportApi.getTickets();
      setData(updated);
      setSelectedTicket(updated.find(t => t.id === selectedTicket.id) || null);
    } catch (error) {
      console.error('Failed to update ticket status', error);
    }
  };

  const openCount = data.filter(t => t.status === 'Open').length;
  const pendingCount = data.filter(t => t.status === 'Pending').length;
  const resolvedTodayCount = data.filter(t => t.status === 'Resolved' && t.lastUpdate === new Date().toISOString().split('T')[0]).length;

  if (loading) return <PageLoading />;

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
        <StatCard title="OPEN TICKETS" value={String(openCount)} />
        <StatCard title="PENDING TICKETS" value={String(pendingCount)} />
        <StatCard title="RESOLVED (TODAY)" value={String(resolvedTodayCount)} />
      </div>

      <Card>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Requester</th>
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
                  <td><strong style={{ color: 'var(--color-navy)' }}>{record.id}</strong></td>
                  <td>{record.requester} <span style={{ color: 'var(--admin-text-secondary)', fontSize: '12px' }}>({builderName(record.builderId)})</span></td>
                  <td>{record.subject}</td>
                  <td>
                    <span style={{
                      color: record.priority === 'High' ? 'var(--color-red)' : record.priority === 'Medium' ? 'var(--color-amber)' : 'var(--color-text-secondary)',
                      fontWeight: 600
                    }}>
                      {record.priority}
                    </span>
                  </td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>{record.lastUpdate}</td>
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

          <Select
            label="Priority"
            required
            value={priority}
            onChange={e => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' }
            ]}
          />

          <Textarea
            label="Description"
            required
            error={errors.description}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide full details..."
            rows={5}
          />
        </div>
      </Modal>

      <Modal
        title={selectedTicket ? `Ticket ${selectedTicket.id}: ${selectedTicket.subject}` : 'Ticket'}
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setReplyText(''); }}
        maxWidth="640px"
      >
        {selectedTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Requester</div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{selectedTicket.requester} ({builderName(selectedTicket.builderId)})</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status</div>
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
              {selectedTicket.conversation.length === 0 ? (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>No messages yet.</div>
              ) : (
                selectedTicket.conversation.map((msg, i) => (
                  <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px', backgroundColor: msg.sender === 'admin' ? 'var(--admin-light-blue, #EFF6FF)' : 'white' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                      {msg.sender === 'admin' ? 'Support Team' : selectedTicket.requester} - {new Date(msg.date).toLocaleString()}
                    </div>
                    <p style={{ color: 'var(--color-text)', margin: 0 }}>{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <div>
              <textarea
                placeholder="Type your reply here..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical', outline: 'none', marginBottom: '16px', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                  className="admin-input"
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }}
                  value={selectedTicket.status}
                  onChange={e => handleStatusChange(e.target.value as SupportTicket['status'])}
                >
                  <option value="Open">Status: Open</option>
                  <option value="Pending">Status: Pending</option>
                  <option value="Resolved">Status: Resolved</option>
                </select>
                <Button variant="primary" onClick={handleSendReply} disabled={!replyText.trim()}>Send Reply</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Support;
