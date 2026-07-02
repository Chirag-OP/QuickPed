import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Wallet,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { formatCurrency, formatDate, formatDuration } from '../lib/utils';
import type { AdminUserRole, InstituteData } from '../lib/admin-data';

interface UserManagementProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}

const roleVariant: Record<AdminUserRole, 'success' | 'default' | 'info' | 'danger'> = {
  verified: 'success',
  guest: 'default',
  admin: 'info',
  blocked: 'danger',
};

const roleLabel: Record<AdminUserRole, string> = {
  verified: 'Verified Rider',
  guest: 'Guest Rider',
  admin: 'Admin',
  blocked: 'Blocked',
};

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

export const UserManagement: React.FC<UserManagementProps> = ({ institute, onUpdateInstitute }) => {
  const users = institute.users;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; action: string } | null>(null);
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

  const handleAction = (userId: string, action: string) => {
    onUpdateInstitute((currentInstitute) => ({
      ...currentInstitute,
      users: currentInstitute.users.map((user) => {
        if (user.id !== userId) return user;
        if (action === 'block') return { ...user, role: 'blocked' };
        if (action === 'unblock') return { ...user, role: 'guest' };
        if (action === 'promote') return { ...user, role: 'admin' };
        if (action === 'demote') return { ...user, role: 'verified' };
        return user;
      }),
    }));
    setConfirmAction(null);
  };

  const verifiedCount = users.filter(u => u.role === 'verified').length;
  const guestCount = users.filter(u => u.role === 'guest').length;
  const blockedCount = users.filter(u => u.role === 'blocked').length;

  return (
    <div className="min-h-full bg-[#F9F9F9] p-4 md:p-6 pb-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#fff0df] rounded-xl">
            <Users className="text-[#ee5f13]" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f1714]">User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} registered users</p>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-white border border-border/80 focus:ring-[#ee5f13]/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'verified', 'guest', 'admin', 'blocked'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                roleFilter === r 
                  ? 'bg-[#ee5f13] text-white shadow-lg shadow-[#ee5f13]/20' 
                  : 'bg-white text-gray-600 border border-border/80 hover:bg-[#fff0df]/30 hover:border-[#ee5f13]/30'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-border/50 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
          <p className="text-xl font-bold text-green-600">{verifiedCount}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
        <div className="bg-white border border-border/50 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
          <p className="text-xl font-bold text-gray-800">{guestCount}</p>
          <p className="text-xs text-muted-foreground">Guest</p>
        </div>
        <div className="bg-white border border-border/50 rounded-2xl p-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
          <p className="text-xl font-bold text-red-600">{blockedCount}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user, index) => {
          const expanded = expandedUser === user.id;
          const userPhone = normalizePhone(user.phone);
          const history = institute.rideHistory.filter((ride) => {
            const ridePhone = ride.userPhone ? normalizePhone(ride.userPhone) : '';
            return ride.user.toLowerCase() === user.name.toLowerCase() || (userPhone && ridePhone.endsWith(userPhone));
          });
          const latestRide = history[0];

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 rounded-[24px] shadow-[0_8px_18px_rgba(15,15,15,0.035)] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedUser(expanded ? null : user.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_minmax(8rem,auto)_auto] items-center gap-3 p-4 text-left transition-colors hover:bg-[#fff0df]/10"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate font-bold text-gray-800">{user.name}</h3>
                    {user.role === 'verified' && <CheckCircle className="shrink-0 text-green-600" size={15} />}
                    {user.role === 'blocked' && <Ban className="shrink-0 text-red-600" size={15} />}
                    {user.role === 'admin' && <ShieldCheck className="shrink-0 text-[#ee5f13]" size={15} />}
                  </div>
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone size={14} />
                    <span className="truncate">{user.phone}</span>
                  </div>
                  <ChevronRight className={`text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} size={18} />
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-4 pb-4 pt-2 border-t border-border/60">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="rounded-2xl bg-[#f3f1ee] p-3">
                              <p className="text-[11px] uppercase text-muted-foreground">Joining Date</p>
                              <p className="mt-2 text-sm font-bold text-gray-800">{user.memberSince}</p>
                            </div>
                            <div className="rounded-2xl bg-[#f3f1ee] p-3">
                              <p className="text-[11px] uppercase text-muted-foreground">Institute</p>
                              <p className="mt-2 text-sm font-bold text-gray-800">{user.institute}</p>
                            </div>
                            <div className="rounded-2xl bg-[#f3f1ee] p-3">
                              <p className="text-[11px] uppercase text-muted-foreground">Ride Count</p>
                              <p className="mt-2 text-sm font-bold text-gray-800">{user.totalRides}</p>
                            </div>
                            <div className="rounded-2xl bg-[#f3f1ee] p-3">
                              <p className="text-[11px] uppercase text-muted-foreground">Wallet Balance</p>
                              <p className="mt-2 text-sm font-bold text-gray-800">{formatCurrency(user.walletBalance)}</p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-[#f3f1ee] p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800">Additional User Information</p>
                              <Badge variant={roleVariant[user.role]} className="text-xs">
                                {roleLabel[user.role]}
                              </Badge>
                            </div>
                            <div className="grid gap-3 text-sm md:grid-cols-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail size={14} />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet size={14} />
                                <span>{roleLabel[user.role]}</span>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Latest Ride</p>
                                <p className="font-medium text-gray-700">
                                  {latestRide ? `${latestRide.vehicleId} - ${latestRide.startDock} to ${latestRide.endDock}` : 'No recent ride'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Last Activity</p>
                                <p className="font-medium text-gray-700">
                                  {latestRide ? `${formatDate(latestRide.completedAt)} - ${formatDuration(latestRide.duration)}` : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {confirmAction?.userId === user.id && (
                            <div className="rounded-2xl bg-orange-50 border border-[#ee5f13]/20 p-4">
                              <p className="text-sm font-semibold text-gray-800">Are you sure?</p>
                              <div className="mt-3 flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setConfirmAction(null)}>
                                  Cancel
                                </Button>
                                <Button className="flex-1 rounded-full bg-[#ee5f13] hover:bg-[#d65a13] text-white" onClick={() => handleAction(user.id, confirmAction.action)}>
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            {user.role !== 'admin' && (
                              <Button variant="secondary" className="w-full rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={() => setConfirmAction({ userId: user.id, action: 'promote' })}>
                                Promote to Admin
                              </Button>
                            )}
                            {user.role === 'admin' && (
                              <Button variant="outline" className="w-full rounded-full border-gray-300 text-gray-700" onClick={() => setConfirmAction({ userId: user.id, action: 'demote' })}>
                                Demote Admin
                              </Button>
                            )}
                            {user.role !== 'blocked' ? (
                              <Button variant="destructive" className="w-full rounded-full" onClick={() => setConfirmAction({ userId: user.id, action: 'block' })}>
                                Block User
                              </Button>
                            ) : (
                              <Button className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setConfirmAction({ userId: user.id, action: 'unblock' })}>
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
