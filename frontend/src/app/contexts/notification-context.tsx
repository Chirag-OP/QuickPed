import React, { createContext, useContext, useEffect, useState } from 'react';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: number;
  read?: boolean;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  addNotification: (n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem('qp_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('qp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const data = ce.detail as { type: NotificationType; title: string; message?: string };
      if (data && data.title) {
        addNotification(data);
      }
    };

    window.addEventListener('quickped:add-notification', handler as EventListener);
    return () => window.removeEventListener('quickped:add-notification', handler as EventListener);
  }, []);

  const addNotification = (n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const item: NotificationItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...n,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((s) => [item, ...s].slice(0, 200));
  };

  const markRead = (id: string) => {
    setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((s) => s.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, markAllRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};

export default NotificationProvider;
