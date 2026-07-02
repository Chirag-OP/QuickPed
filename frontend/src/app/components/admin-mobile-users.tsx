import React, { useState } from 'react';
import { Search, Wallet, Snowflake, Flag, Ban } from 'lucide-react';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';
import type { AdminUser, AdminUserRole, InstituteData } from '../lib/admin-data';
import { avatarColors } from './admin-mobile-shared';

interface AdminMobileUsersProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}

type UserFilter = 'All' | 'Active' | 'Flagged' | 'Banned' | 'Top spenders';

const userStatus = (user: AdminUser): 'ACTIVE' | 'FLAGGED' | 'BANNED' => {
  if (user.role === 'blocked') return 'BANNED';
  if (user.role === 'guest') return 'FLAGGED';
  return 'ACTIVE';
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600',
  FLAGGED: 'bg-amber-50 text-amber-600',
  BANNED: 'bg-red-50 text-red-500',
};

const filters: UserFilter[] = ['All', 'Active', 'Flagged', 'Banned', 'Top spenders'];

export const AdminMobileUsers: React.FC<AdminMobileUsersProps> = ({
  institute,
  onUpdateInstitute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<UserFilter>('All');

  const filteredUsers = institute.users
    .filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        user.phone.includes(q);
      const status = userStatus(user);
      const matchFilter =
        filter === 'All' ||
        (filter === 'Active' && status === 'ACTIVE') ||
        (filter === 'Flagged' && status === 'FLAGGED') ||
        (filter === 'Banned' && status === 'BANNED') ||
        (filter === 'Top spenders' && user.walletBalance >= 200);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => (filter === 'Top spenders' ? b.walletBalance - a.walletBalance : 0));

  const handleAction = (userId: string, action: string) => {
    onUpdateInstitute((current) => ({
      ...current,
      users: current.users.map((user) => {
        if (user.id !== userId) return user;
        if (action === 'ban') return { ...user, role: 'blocked' as AdminUserRole };
        if (action === 'flag') return { ...user, role: 'guest' as AdminUserRole };
        if (action === 'unflag') return { ...user, role: 'verified' as AdminUserRole };
        return user;
      }),
    }));
  };

  return (
    <div className="p-4 pb-28 space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={17} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID, phone"
          className="h-11 rounded-2xl border-[#eceae6] bg-white pl-10 text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-[#eceae6] text-[#666]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user, index) => {
          const status = userStatus(user);
          return (
            <div key={user.id} className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: avatarColors[index % avatarColors.length] }}
                  >
                    {user.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user.name}</p>
                    <p className="text-xs text-[#9a9a9a]">
                      {user.id.replace('u-', 'U-').toUpperCase()} · {user.totalRides} rides
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${statusStyles[status]}`}>
                  {status}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#fafafa] px-3 py-2">
                <p className="text-xs text-[#9a9a9a]">Wallet</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{formatCurrency(user.walletBalance)}</p>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { label: 'Credit', icon: Wallet, action: 'credit' },
                  { label: 'Freeze', icon: Snowflake, action: 'freeze' },
                  { label: 'Flag', icon: Flag, action: 'flag' },
                  { label: 'Ban', icon: Ban, action: 'ban' },
                ].map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleAction(user.id, action)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-[#f0f0f0] py-2 text-[#666] hover:bg-[#fafafa]"
                  >
                    <Icon size={15} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <p className="py-12 text-center text-sm text-[#9a9a9a]">No users match your search.</p>
        )}
      </div>
    </div>
  );
};
