import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../api/services';
import { PageLoading } from '../../components/LoadingState';
import '../admin.css';

const CustomerNotifications: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications([...data].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    await Promise.all(unreadIds.map(id => notificationService.markAsRead(id)));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <PageLoading />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#EF4444', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
                {unreadCount} New
              </span>
            )}
          </div>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Updates on your property, inspections, payments, and requests.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            style={{ padding: '10px 16px', backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', ':hover': { backgroundColor: '#F1F5F9' } } as any}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <Bell size={40} color="#94A3B8" />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>No notifications</h4>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>You're all caught up! New updates will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map(n => {
              const dateObj = new Date(n.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              let icon = <Bell size={20} color={n.isRead ? '#94A3B8' : '#2563EB'} />;
              let iconBg = n.isRead ? '#F1F5F9' : '#DBEAFE';
              
              if (n.title.toLowerCase().includes('success') || n.title.toLowerCase().includes('completed')) {
                icon = <CheckCircle2 size={20} color={n.isRead ? '#94A3B8' : '#059669'} />;
                iconBg = n.isRead ? '#F1F5F9' : '#D1FAE5';
              } else if (n.title.toLowerCase().includes('important') || n.title.toLowerCase().includes('due')) {
                icon = <AlertCircle size={20} color={n.isRead ? '#94A3B8' : '#DC2626'} />;
                iconBg = n.isRead ? '#F1F5F9' : '#FEE2E2';
              }

              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
                    padding: '20px', borderRadius: '16px',
                    backgroundColor: n.isRead ? '#FFFFFF' : '#F8FAFC',
                    border: `1px solid ${n.isRead ? '#F1F5F9' : '#E2E8F0'}`,
                    transition: 'all 0.2s'
                  }}
                  className="hover-lift"
                >
                  <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: n.isRead ? '#334155' : '#0F172A', fontSize: '15px', marginBottom: '4px' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '14px', color: n.isRead ? '#64748B' : '#334155', lineHeight: 1.5, marginBottom: '8px' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> {formattedDate} at {formattedTime}
                      </div>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button 
                      title="Mark as read" 
                      onClick={() => handleMarkRead(n.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', ':hover': { backgroundColor: '#F1F5F9', color: '#0F172A' } } as any}
                    >
                      <CheckCheck size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerNotifications;
