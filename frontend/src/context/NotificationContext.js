import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const s = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
      s.emit('join', user._id);
      s.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.custom((t) => (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--gold)', borderRadius: '12px',
            padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px',
            maxWidth: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{notif.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>{notif.message}</div>
            </div>
          </div>
        ), { duration: 5000 });
      });
      setSocket(s);
      return () => s.disconnect();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {}
  };

  const markAsRead = useCallback(async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id) => {
    await notificationsAPI.delete(id);
    const notif = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (notif && !notif.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, deleteNotification, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
