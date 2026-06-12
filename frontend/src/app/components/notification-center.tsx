import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useNotifications } from '../contexts/notification-context';
import { Bell } from 'lucide-react';

export const NotificationCenter: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({ open, onOpenChange }) => {
  const { notifications, markRead, markAllRead } = useNotifications();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto space-y-3 mt-2">
          {notifications.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
              <Bell className="mx-auto mb-2" />
              No notifications yet
            </div>
          )}

          {notifications.map((n) => (
            <div key={n.id} className={`p-3 rounded-lg border ${n.read ? 'bg-background' : 'bg-muted/20'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  {n.message && <div className="text-sm text-muted-foreground">{n.message}</div>}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleTimeString()}</div>
              </div>
              {!n.read && (
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>Mark read</Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => markAllRead()}>Mark all read</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
