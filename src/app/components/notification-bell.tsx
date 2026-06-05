import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/notification-context';
import NotificationCenter from './notification-center';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-background border border-border shadow-md"
        aria-label="Notifications"
      >
        <div className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-danger text-white">{unreadCount}</span>
          )}
        </div>
      </button>

      <NotificationCenter open={open} onOpenChange={setOpen} />
    </>
  );
};

export default NotificationBell;
