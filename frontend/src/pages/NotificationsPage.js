import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON = { booking_confirmed:'✅', booking_cancelled:'❌', booking_reminder:'⏰', booking_completed:'🎉', promo:'🎁', system:'📢', review_request:'⭐' };
const TYPE_COLOR = { booking_confirmed:'badge-green', booking_cancelled:'badge-red', booking_reminder:'badge-gold', booking_completed:'badge-blue', promo:'badge-gold', system:'badge-gray', review_request:'badge-gold' };

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 700 }}>Notifications</h1>
            {unreadCount > 0 && <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-outline btn-sm">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(n => (
              <div key={n._id} style={{
                background: n.isRead ? 'var(--surface)' : 'var(--bg-secondary)',
                border: `1px solid ${n.isRead ? 'var(--border)' : 'var(--gold-border)'}`,
                borderRadius: 14, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'all 0.2s',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: n.isRead ? 'var(--bg-secondary)' : 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 15, fontWeight: n.isRead ? 500 : 700 }}>{n.title}</h4>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <span className={`badge ${TYPE_COLOR[n.type] || 'badge-gray'}`} style={{ textTransform: 'capitalize', fontSize: 11 }}>
                      {n.type?.replace(/_/g, ' ')}
                    </span>
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n._id)} className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 12 }}>
                        <Check size={12} /> Mark read
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteNotification(n._id)} className="btn btn-ghost" style={{ padding: 6, flexShrink: 0, color: 'var(--text-muted)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
