import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Wallet,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';

type UserRole = 'verified' | 'guest' | 'admin' | 'blocked';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  walletBalance: number;
  totalRides: number;
  memberSince: string;
  avatar: string;
}

interface RideRecord {
  id: string;
  date: string;
  bike: string;
  from: string;
  to: string;
  duration: string;
  fare: number;
}

const initialUsers: User[] = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@university.edu', phone: '+91 98765 43210', role: 'verified', walletBalance: 250, totalRides: 12, memberSince: 'June 2026', avatar: 'R' },
  { id: 2, name: 'Priya Patel', email: 'priya.patel@university.edu', phone: '+91 98765 43211', role: 'verified', walletBalance: 180, totalRides: 23, memberSince: 'May 2026', avatar: 'P' },
  { id: 3, name: 'Amit Kumar', email: 'amit.kumar@gmail.com', phone: '+91 98765 43212', role: 'guest', walletBalance: 50, totalRides: 5, memberSince: 'June 2026', avatar: 'A' },
  { id: 4, name: 'Sneha Gupta', email: 'sneha.gupta@university.edu', phone: '+91 98765 43213', role: 'verified', walletBalance: 420, totalRides: 45, memberSince: 'April 2026', avatar: 'S' },
  { id: 5, name: 'Karan Mehta', email: 'karan.mehta@university.edu', phone: '+91 98765 43214', role: 'admin', walletBalance: 1000, totalRides: 128, memberSince: 'March 2026', avatar: 'K' },
  { id: 6, name: 'Ritu Singh', email: 'ritu.singh@gmail.com', phone: '+91 98765 43215', role: 'blocked', walletBalance: 0, totalRides: 3, memberSince: 'June 2026', avatar: 'R' },
];

const rideHistoryByUser: Record<number, RideRecord[]> = {
  1: [
    { id: 'R-5521', date: 'Today 09:15', bike: 'QP-2847', from: 'Main Gate Dock', to: 'Library Dock', duration: '12 min', fare: 15 },
    { id: 'R-5399', date: 'Yesterday 14:30', bike: 'QP-2842', from: 'Hostel A Dock', to: 'Sports Complex', duration: '8 min', fare: 10 },
  ],
  2: [
    { id: 'R-5512', date: 'Today 08:00', bike: 'QP-2846', from: 'Library Dock', to: 'Main Gate Dock', duration: '6 min', fare: 10 },
    { id: 'R-5420', date: 'Jun 3, 17:45', bike: 'QP-2843', from: 'Sports Complex', to: 'Hostel A Dock', duration: '18 min', fare: 25 },
    { id: 'R-5310', date: 'Jun 2, 11:00', bike: 'QP-2847', from: 'Main Gate Dock', to: 'Admin Block Dock', duration: '5 min', fare: 10 },
  ],
  4: [
    { id: 'R-5519', date: 'Today 07:30', bike: 'QP-2841', from: 'Cafeteria Dock', to: 'Library Dock', duration: '4 min', fare: 10 },
  ],
};

const roleVariant: Record<UserRole, 'success' | 'default' | 'info' | 'danger'> = {
  verified: 'success',
  guest: 'default',
  admin: 'info',
  blocked: 'danger',
};

const roleLabel: Record<UserRole, string> = {
  verified: 'Verified Rider',
  guest: 'Guest Rider',
  admin: 'Admin',
  blocked: 'Blocked',
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ userId: number; action: string } | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone.includes(q);
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAction = (userId: number, action: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        if (action === 'block') return { ...u, role: 'blocked' as UserRole };
        if (action === 'unblock') return { ...u, role: 'guest' as UserRole };
        if (action === 'promote') return { ...u, role: 'admin' as UserRole };
        if (action === 'demote') return { ...u, role: 'verified' as UserRole };
        return u;
      })
    );
    setConfirmAction(null);
  };

  const verifiedCount = users.filter(u => u.role === 'verified').length;
  const guestCount = users.filter(u => u.role === 'guest').length;
  const blockedCount = users.filter(u => u.role === 'blocked').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-28">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Users className="text-primary" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} registered users</p>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'verified', 'guest', 'admin', 'blocked'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                roleFilter === r ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-success/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-success">{verifiedCount}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{guestCount}</p>
          <p className="text-xs text-muted-foreground">Guest</p>
        </div>
        <div className="bg-danger/10 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-danger">{blockedCount}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user, index) => {
          const expanded = expandedUser === user.id;
          const history = rideHistoryByUser[user.id] ?? [];

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="elevated" className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 ${
                        user.role === 'blocked' ? 'bg-danger/40' : 'bg-gradient-to-br from-primary to-secondary'
                      }`}>
                        {user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold">{user.name}</h3>
                          {user.role === 'verified' && <CheckCircle className="text-success" size={15} />}
                          {user.role === 'blocked' && <Ban className="text-danger" size={15} />}
                          {user.role === 'admin' && <ShieldCheck className="text-info" size={15} />}
                        </div>
                        <Badge variant={roleVariant[user.role]} className="text-xs">
                          {roleLabel[user.role]}
                        </Badge>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedUser(expanded ? null : user.id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone size={12} />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                        <Wallet size={13} />
                      </div>
                      <p className="text-sm font-bold">{formatCurrency(user.walletBalance)}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.totalRides}</p>
                      <p className="text-xs text-muted-foreground">Rides</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mt-1">{user.memberSince}</p>
                      <p className="text-xs text-muted-foreground">Joined</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-border">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-muted p-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Latest Ride</p>
                              <p className="mt-2 text-sm font-medium">{history[0]?.bike ?? 'No recent ride'}</p>
                              <p className="text-xs text-muted-foreground">{history[0]?.from ?? ''} → {history[0]?.to ?? ''}</p>
                            </div>
                            <div className="rounded-2xl bg-muted p-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Member Since</p>
                              <p className="mt-2 text-sm font-medium">{user.memberSince}</p>
                              <p className="text-xs text-muted-foreground">{history.length} rides recorded</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-2xl bg-muted p-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Total Wallet</p>
                              <p className="mt-2 text-sm font-bold">{formatCurrency(user.walletBalance)}</p>
                            </div>
                            <div className="rounded-2xl bg-muted p-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Total Rides</p>
                              <p className="mt-2 text-sm font-bold">{user.totalRides}</p>
                            </div>
                            <div className="rounded-2xl bg-muted p-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Last Seen</p>
                              <p className="mt-2 text-sm font-bold">{history[0]?.date ?? 'N/A'}</p>
                            </div>
                          </div>

                          {confirmAction?.userId === user.id && (
                            <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4">
                              <p className="text-sm font-medium">Are you sure?</p>
                              <div className="mt-3 flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)}>
                                  Cancel
                                </Button>
                                <Button className="flex-1" onClick={() => handleAction(user.id, confirmAction.action)}>
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {user.role !== 'admin' && (
                              <Button variant="secondary" className="w-full" onClick={() => setConfirmAction({ userId: user.id, action: 'promote' })}>
                                Promote to Admin
                              </Button>
                            )}
                            {user.role === 'admin' && (
                              <Button variant="outline" className="w-full" onClick={() => setConfirmAction({ userId: user.id, action: 'demote' })}>
                                Demote Admin
                              </Button>
                            )}
                            {user.role !== 'blocked' ? (
                              <Button variant="destructive" className="w-full" onClick={() => setConfirmAction({ userId: user.id, action: 'block' })}>
                                Block User
                              </Button>
                            ) : (
                              <Button className="w-full" onClick={() => setConfirmAction({ userId: user.id, action: 'unblock' })}>
                                Unblock User
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
