import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  Bike,
  CheckCheck,
  Clock,
  Filter,
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

type NotifCategory = 'all' | 'rides' | 'wallet' | 'promo' | 'system';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: React.ElementType;
  accent: string;
  category: NotifCategory;
};

const SEED: NotificationItem[] = [
  {
    id: 'ride-started',
    title: 'Ride Started',
    description: 'Your QuickPed ride from Main Gate Dock has started.',
    time: '2 min ago',
    unread: true,
    icon: Bike,
    accent: 'bg-orange-500/10 text-orange-500',
    category: 'rides',
  },
  {
    id: 'ride-completed',
    title: 'Ride Completed',
    description: 'Ride completed successfully. Fare has been deducted from your wallet.',
    time: '20 min ago',
    unread: true,
    icon: CheckCheck,
    accent: 'bg-emerald-500/10 text-emerald-500 dark:text-[#10b981]',
    category: 'rides',
  },
  {
    id: 'wallet-recharge',
    title: 'Wallet Recharge Successful',
    description: '₹200 added to your QuickPed wallet. Balance updated.',
    time: '1 hr ago',
    unread: false,
    icon: Wallet,
    accent: 'bg-blue-500/10 text-blue-500 dark:text-[#3b82f6]',
    category: 'wallet',
  },
  {
    id: 'low-wallet',
    title: 'Low Wallet Balance',
    description: 'Your balance is below ₹20. Add money to continue riding.',
    time: '3 hrs ago',
    unread: true,
    icon: AlertTriangle,
    accent: 'bg-amber-500/10 text-amber-500 dark:text-[#f59e0b]',
    category: 'wallet',
  },
  {
    id: 'cycle-reserved',
    title: 'Cycle Reserved',
    description: 'QP-2847 is reserved for you near Academic Block. Pick up within 5 minutes.',
    time: 'Yesterday',
    unread: false,
    icon: Clock,
    accent: 'bg-violet-500/10 text-violet-500 dark:text-[#8b5cf6]',
    category: 'rides',
  },
  {
    id: 'reservation-expired',
    title: 'Reservation Expired',
    description: 'Your cycle reservation expired because pickup was not completed.',
    time: 'Yesterday',
    unread: false,
    icon: XCircle,
    accent: 'bg-red-500/10 text-red-500',
    category: 'rides',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Update',
    description: 'Some cycles near the Library dock are under scheduled maintenance today.',
    time: 'Mon',
    unread: false,
    icon: Wrench,
    accent: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
    category: 'system',
  },
  {
    id: 'campus',
    title: 'Campus Announcement',
    description: 'Extra QuickPed cycles available near the Sports Complex this weekend.',
    time: 'Mon',
    unread: false,
    icon: Megaphone,
    accent: 'bg-cyan-500/10 text-cyan-500 dark:text-[#06b6d4]',
    category: 'system',
  },
  {
    id: 'offers',
    title: 'Weekend Offer 🎉',
    description: 'Get ₹30 bonus wallet credit on your next recharge of ₹100 or more!',
    time: 'Sun',
    unread: true,
    icon: Sparkles,
    accent: 'bg-orange-500/10 text-orange-500',
    category: 'promo',
  },
];

const CATEGORY_LABELS: Record<NotifCategory, string> = {
  all: 'All',
  rides: 'Rides',
  wallet: 'Wallet',
  promo: 'Offers',
  system: 'System',
};

export const ProfileNotificationsScreen: React.FC<ProfileNotificationsScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED);
  const [activeCategory, setActiveCategory] = useState<NotifCategory>('all');
  const [showFilters, setShowFilters] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const displayed = useMemo(() =>
    activeCategory === 'all' ? notifications : notifications.filter((n) => n.category === activeCategory),
    [notifications, activeCategory]
  );

  const markAllRead = () =>
    setNotifications((cur) => cur.map((n) => ({ ...n, unread: false })));

  const markOneRead = (id: string) =>
    setNotifications((cur) => cur.map((n) => n.id === id ? { ...n, unread: false } : n));

  const deleteOne = (id: string) =>
    setNotifications((cur) => cur.filter((n) => n.id !== id));

  const clearAll = () => setNotifications([]);

  const categories: NotifCategory[] = ['all', 'rides', 'wallet', 'promo', 'system'];

  return (
    <div className="min-h-screen bg-background text-foreground pb-10 transition-colors duration-200">
      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon" onClick={onBack}
            className="h-11 w-11 rounded-full bg-card text-orange-500 shadow-[0_8px_18px_rgba(0,0,0,0.04)] hover:bg-orange-500/10 border border-border">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">
                {unreadCount}
              </span>
            )}
            <div className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-400">Notifications</div>
          </div>
        </div>

        {/* Hero */}
        <section className="mb-5 rounded-[30px] bg-orange-100 dark:bg-orange-950/20 px-5 py-6 transition-colors duration-200">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white dark:bg-slate-900 text-orange-500 shadow-[0_10px_24px_rgba(249,115,22,0.08)] border border-border">
              <BellRing size={26} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[3px] text-orange-700 dark:text-orange-400">QuickPed Alerts</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 dark:text-white">Notifications</h1>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Ride updates, wallet alerts, campus news, and offers.</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button type="button" onClick={markAllRead} disabled={unreadCount === 0}
            className="h-11 flex-1 rounded-[18px] bg-orange-500 text-white shadow-[0_12px_24px_rgba(249,115,22,0.15)] hover:bg-orange-600 disabled:opacity-40">
            <CheckCheck size={17} className="mr-1.5" />Mark All Read
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}
            className={`h-11 rounded-[18px] border-border bg-card px-4 text-orange-500 hover:bg-orange-500/10 ${showFilters ? 'ring-2 ring-orange-500/35' : ''}`}>
            <Filter size={17} className="mr-1.5" />Filter
          </Button>
          <Button type="button" variant="outline" onClick={clearAll}
            className="h-11 rounded-[18px] border-border bg-card px-4 text-red-500 hover:bg-red-500/10">
            <Trash2 size={17} className="mr-1.5" />Clear All
          </Button>
        </div>

        {/* Category filter pills */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                      activeCategory === cat
                        ? 'bg-orange-500 text-white shadow-[0_6px_14px_rgba(249,115,22,0.18)]'
                        : 'bg-card text-muted-foreground border border-border hover:bg-orange-500/10 hover:text-orange-500'
                    }`}>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification List */}
        <section className="space-y-3">
          <AnimatePresence mode="popLayout">
            {displayed.map((n, index) => {
              const Icon = n.icon;
              return (
                <motion.article key={n.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 60, scale: 0.95 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => markOneRead(n.id)}
                  className={`group flex cursor-pointer gap-4 rounded-[24px] bg-card p-4 shadow-[0_12px_30px_rgba(0,0,0,0.02)] border border-border transition-transform active:scale-[0.99] ${
                    n.unread ? 'ring-2 ring-orange-500/25' : ''
                  }`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${n.accent}`}>
                    <Icon size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-[15px] font-black leading-tight text-foreground">{n.title}</h2>
                          {n.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />}
                        </div>
                        <p className="mt-1 text-[13px] font-medium leading-5 text-muted-foreground">{n.description}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-muted-foreground/60">{n.time}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold capitalize text-muted-foreground">
                        {n.category}
                      </span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteOne(n.id); }}
                        className="flex h-8 items-center gap-1.5 rounded-full bg-red-500/10 px-3 text-xs font-bold text-red-500 hover:bg-red-500/25 transition-colors">
                        <Trash2 size={13} />Remove
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {displayed.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-[24px] bg-card px-5 py-14 text-center shadow-[0_12px_30px_rgba(0,0,0,0.02)] border border-border">
              <BellOff className="mx-auto text-orange-200 dark:text-orange-950" size={42} />
              <p className="mt-4 text-lg font-black text-muted-foreground/40">All clear!</p>
              <p className="mt-1 text-sm text-muted-foreground/60">No notifications in this category.</p>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
};
