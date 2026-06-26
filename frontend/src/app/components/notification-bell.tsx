import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/notification-context';
import NotificationCenter from './notification-center';
import { cn } from '../lib/utils';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={cn(
        "flex items-center justify-center p-2 rounded-full bg-background border border-border shadow-md hover:cursor-pointer hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
      aria-label="Notifications">
      <div className="relative">
        <Bell size={20} />
        {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-danger text-white">
        {unreadCount}
        </span>
      )}
      </div>
    </button>

      <NotificationCenter open={open} onOpenChange={setOpen} />
    </>
  );
};

export default NotificationBell;
