import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bike,
  MapPin,
  Wallet,
  Headphones,
  Ticket,
  BarChart3,
  Building2,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { adminToast } from '../lib/admin-feedback';

type AdminNavId =
  | 'overview'
  | 'campus'
  | 'users'
  | 'bikes'
  | 'docks'
  | 'wallets'
  | 'rides'
  | 'support'
  | 'coupons'
  | 'reports'
  | 'settings';

interface AdminSidebarProps {
  prefix: string;
  adminName: string;
  adminRole?: string;
  userCount?: number;
  supportCount?: number;
  onLogout?: () => void;
}

const navItems: {
  id: AdminNavId;
  label: string;
  Icon: LucideIcon;
  path: string;
  badgeKey?: 'users' | 'support';
}[] = [
  { id: 'overview', label: 'Dashboard', Icon: LayoutDashboard, path: '' },
  { id: 'campus', label: 'Campus', Icon: Building2, path: 'campus' },
  { id: 'docks', label: 'Docks', Icon: MapPin, path: 'docks' },
  { id: 'bikes', label: 'Fleet', Icon: Bike, path: 'fleet' },
  { id: 'coupons', label: 'Fare Rules', Icon: Ticket, path: 'pricing' },
  { id: 'users', label: 'Users', Icon: Users, path: 'users', badgeKey: 'users' },
  { id: 'wallets', label: 'Wallet', Icon: Wallet, path: 'revenue' },
  { id: 'rides', label: 'Ride History', Icon: History, path: 'rides' },
  { id: 'reports', label: 'Reports', Icon: BarChart3, path: 'revenue' },
  { id: 'support', label: 'Support', Icon: Headphones, path: 'support', badgeKey: 'support' },
];

const resolveActiveNav = (pathname: string, prefix: string): AdminNavId => {
  const rest = pathname.replace(`/${prefix}`, '').replace(/^\//, '');
  if (!rest || rest === 'admin') return 'overview';
  if (rest.startsWith('campus')) return 'campus';
  if (rest.startsWith('users')) return 'users';
  if (rest.startsWith('fleet')) return 'bikes';
  if (rest.startsWith('docks')) return 'docks';
  if (rest.startsWith('rides')) return 'rides';
  if (rest.startsWith('support')) return 'support';
  if (rest.startsWith('revenue')) return 'reports';
  if (rest.startsWith('pricing')) return 'coupons';
  return 'overview';
};

const formatBadge = (count: number) => {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(count);
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  prefix,
  adminName,
  adminRole = 'Super admin',
  userCount = 0,
  supportCount = 0,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeNav = resolveActiveNav(location.pathname, prefix);

  const initials = adminName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const badges: Record<'users' | 'support', number> = {
    users: userCount,
    support: supportCount,
  };

  return (
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-[#eceae6] bg-white px-4 py-6 min-h-screen">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8C42] text-white font-bold text-sm">
            Q
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#1a1a1a] leading-tight">QuickPad</p>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[#9a9a9a]">ADMIN</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, Icon, path, badgeKey }) => {
          const isActive = activeNav === id;
          const badge = badgeKey ? badges[badgeKey] : 0;

          return (
            <button
              key={id}
              type="button"
              onClick={() => navigate(`/${prefix}${path ? `/${path}` : ''}`)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#1f1f1f] text-white shadow-sm'
                  : 'text-[#5c5c5c] hover:bg-[#f5f5f5]'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-white' : 'text-[#888]'} />
              <span className="flex-1 truncate">{label}</span>
              {badge > 0 && (
                <span className="rounded-md bg-[#FF8C42] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {formatBadge(badge)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 px-1 pt-6">
        <button
          type="button"
          onClick={() => adminToast.info('Admin settings are managed from the campus profile.')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#5c5c5c] hover:bg-[#f5f5f5]"
        >
          <Settings size={17} className="text-[#888]" />
          Settings
        </button>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={17} />
            Logout
          </button>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-[#eceae6] bg-[#fafafa] px-3 py-2.5 mt-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF8C42]/15 text-[13px] font-bold text-[#FF8C42]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#1a1a1a]">{adminName}</p>
            <p className="truncate text-[11px] text-[#9a9a9a]">{adminRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
