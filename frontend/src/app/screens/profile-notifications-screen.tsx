import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Bike,
  CheckCheck,
  Clock,
  Megaphone,
  Sparkles,
  Trash2,
  Wallet,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
interface ProfileNotificationsScreenProps {
  onBack: () => void;
}
type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: React.ElementType;
  accent: string;
};
const seedNotifications: NotificationItem[] = [
  {
    id: 'ride-started',
    title: 'Ride Started',
    description: 'Your QuickPed ride from Main Gate Dock has started.',
    time: '2 min ago',
    unread: true,
    icon: Bike,
    accent: 'bg-orange-50 text-orange-500',
  },
  {
    id: 'ride-completed',
    title: 'Ride Completed',
    description: 'Ride completed successfully. Fare has been deducted from your wallet.',
    time: '20 min ago',
    unread: true,
    icon: CheckCheck,
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'wallet-recharge',
    title: 'Wallet Recharge Successful',
    description: 'Your wallet top-up was successful and balance is updated.',
    time: '1 hr ago',
    unread: false,
    icon: Wallet,
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'low-wallet',
    title: 'Low Wallet Balance',
    description: 'Add money to continue riding without interruptions.',
    time: '3 hrs ago',
    unread: true,
    icon: AlertTriangle,
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'cycle-reserved',
    title: 'Cycle Reserved',
    description: 'QP-2847 is reserved for you near Academic Block.',
    time: 'Yesterday',
    unread: false,
    icon: Clock,
    accent: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'reservation-expired',
    title: 'Reservation Expired',
    description: 'Your cycle reservation expired because pickup was not completed.',
    time: 'Yesterday',
    unread: false,
    icon: XCircle,
    accent: 'bg-red-50 text-red-500',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Update',
    description: 'Some cycles near the Library dock are under scheduled maintenance.',
    time: 'Mon',
    unread: false,
    icon: Wrench,
    accent: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'campus',
    title: 'Campus Announcement',
    description: 'Extra QuickPed cycles are available near the Sports Complex today.',
    time: 'Mon',
    unread: false,
    icon: Megaphone,
    accent: 'bg-cyan-50 text-cyan-600',
  },
  {
    id: 'offers',
    title: 'Offers & Discounts',
    description: 'Weekend saver: get bonus wallet credit on your next recharge.',
    time: 'Sun',
    unread: true,
    icon: Sparkles,
    accent: 'bg-orange-50 text-orange-500',
  },
];
export const ProfileNotificationsScreen: React.FC<ProfileNotificationsScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(seedNotifications);
  const unreadCount = useMemo(() => notifications.filter((notification) => notification.unread).length, [notifications]);
  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  };
  const deleteNotification = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };
  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-10">
      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-11 w-11 rounded-full bg-white text-orange-500 shadow-[0_8px_18px_rgba(15,15,15,0.08)] hover:bg-orange-50 hover:text-orange-500"
            aria-label="Back to profile"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
            {unreadCount} unread
          </div>
        </div>
        <section className="mb-5 rounded-[30px] bg-[#ffdfbd] px-5 py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.12)]">
              <BellRing size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700">QuickPed Alerts</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">Notifications</h1>
              <p className="mt-2 text-sm font-medium text-slate-600">Ride updates, wallet alerts, campus news, and offers.</p>
            </div>
          </div>
        </section>
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Button
            type="button"
            onClick={markAllAsRead}
            className="h-12 rounded-[18px] bg-orange-500 text-white shadow-[0_12px_24px_rgba(249,115,22,0.20)] hover:bg-orange-600"
          >
            <CheckCheck size={18} />
            Mark All as Read
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setNotifications([])}
            className="h-12 rounded-[18px] border-orange-100 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <Trash2 size={18} />
            Clear All
          </Button>
        </div>
        <section className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <motion.article
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group flex gap-4 rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(31,31,31,0.05)] transition-transform active:scale-[0.99] ${
                  notification.unread ? 'ring-1 ring-orange-100' : ''
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${notification.accent}`}>
                  <Icon size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-[15px] font-black leading-tight text-slate-950">{notification.title}</h2>
                        {notification.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />}
                      </div>
                      <p className="mt-1 text-[13px] font-medium leading-5 text-slate-500">{notification.description}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-400">{notification.time}</span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteNotification(notification.id)}
                      className="flex h-9 items-center gap-2 rounded-full bg-red-50 px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                      Delete Notification
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
          {notifications.length === 0 && (
            <div className="rounded-[24px] bg-white px-5 py-10 text-center shadow-[0_12px_30px_rgba(31,31,31,0.05)]">
              <BellRing className="mx-auto text-orange-300" size={34} />
              <p className="mt-4 text-sm font-bold text-slate-500">No notifications to show.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
