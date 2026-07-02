import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
} from 'recharts';
import {
  Wallet,
  Users,
  Bike,
  TrendingUp,
  TrendingDown,
  LineChart as LineChartIcon,
  Search,
  Bell,
  Download,
  ChevronDown,
  Filter,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Eye,
  Star,
  Snowflake,
  Pencil,
  Clock,
  MapPin,
  Gift,
  Battery,
  Ban,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';
import {
  formatTrendLabel,
  getInstituteAnalytics,
} from '../lib/admin-analytics';
import type { ActivePanel } from '../screens/admin-dashboard-types';
import type { AdminUser, AdminVehicle, InstituteData, IssueReport } from '../lib/admin-data';

const ORANGE = '#FF8C42';

const fallbackTickets: IssueReport[] = [];

const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

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

const vehicleStatusLabel = (vehicle: AdminVehicle) => {
  if (vehicle.status === 'maintenance') return { label: 'Damaged', className: 'text-red-500' };
  if (vehicle.status === 'available' || vehicle.status === 'in-ride') return { label: 'Active', className: 'text-emerald-600' };
  return { label: 'Offline', className: 'text-[#9a9a9a]' };
};

const avatarColors = ['#FF8C42', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface AdminOverviewDashboardProps {
  selectedInstitute: InstituteData;
  selectedInstituteId: string | null;
  institutes: InstituteData[];
  onSelectInstitute: (id: string) => void;
  onSetActivePanel: (panel: ActivePanel) => void;
  onNavigate?: (screen: 'user-management' | 'fleet-management' | 'docks' | 'pricing' | 'revenue') => void;
  onExport?: () => void;
}

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  selectedInstitute,
  selectedInstituteId,
  institutes,
  onSelectInstitute,
  onSetActivePanel,
  onNavigate,
  onExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'Active' | 'Flagged' | 'Banned'>('Active');

  const vehicles = selectedInstitute.vehicles;
  const users = selectedInstitute.users;
  const issueReports = selectedInstitute.issueReports;

  const analytics = useMemo(() => getInstituteAnalytics(selectedInstitute), [selectedInstitute]);

  const kpi = useMemo(() => ({
    revenue: analytics.revenue.weekly,
    activeUsers: analytics.activeRiders,
    ridesToday: analytics.rides.today,
    avgFare: analytics.avgFare,
  }), [analytics]);

  const fleetBreakdown = analytics.fleetBreakdown;
  const fleetTotal = analytics.fleetTotal;
  const locationRows = analytics.locationPerformance;
  const displayTickets = issueReports.length > 0 ? issueReports.slice(0, 4) : fallbackTickets;

  const today = new Date();
  const dateLabel = today
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase()
    .replace(',', ' -');

  const rideDurationMax = Math.max(
    analytics.rideTime.weekday,
    analytics.rideTime.weekend,
    analytics.rideTime.peakHour,
    analytics.rideTime.overall,
    1
  );

  const filteredUsers = users
    .filter((user) => {
      const status = userStatus(user);
      if (userFilter === 'Active' && status !== 'ACTIVE') return false;
      if (userFilter === 'Flagged' && status !== 'FLAGGED') return false;
      if (userFilter === 'Banned' && status !== 'BANNED') return false;
      return true;
    })
    .slice(0, 5);

  const quickActions = [
    { label: 'Issue coupon', icon: Gift, panel: 'reports' as ActivePanel },
    { label: 'Credit wallet', icon: Wallet, panel: 'operations' as ActivePanel },
    { label: 'Freeze wallet', icon: Snowflake, panel: 'operations' as ActivePanel },
    { label: 'Edit pricing', icon: Pencil, panel: 'edit-pricing' as ActivePanel },
    { label: 'Free-ride pass', icon: Clock, panel: 'operations' as ActivePanel },
    { label: 'Toggle dock', icon: MapPin, panel: 'add-dock' as ActivePanel },
  ];

  return (
    <div className="p-4 lg:p-6 xl:p-8 space-y-6 max-w-[1440px]">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#9a9a9a]">{dateLabel}</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mt-0.5">Operations overview</h1>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:max-w-2xl xl:mx-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa]" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, bikes, tickets..."
              className="h-11 rounded-2xl border-[#eceae6] bg-white pl-11 text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedInstituteId ?? ''}
            onChange={(e) => onSelectInstitute(e.target.value)}
            className="hidden md:block h-10 rounded-xl border border-[#eceae6] bg-white px-3 text-xs font-medium text-[#5c5c5c]"
          >
            {institutes.map((institute) => (
              <option key={institute.id} value={institute.id}>{institute.name}</option>
            ))}
          </select>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eceae6] bg-white text-[#666]">
            <Bell size={18} />
          </button>
          <button type="button" className="flex h-10 items-center gap-2 rounded-xl border border-[#eceae6] bg-white px-4 text-sm font-medium text-[#444]">
            This week <ChevronDown size={16} />
          </button>
          <Button
            onClick={onExport}
            className="h-10 rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white px-4 text-sm font-medium"
          >
            <Download size={16} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#FF8C42] p-5 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/80">Revenue</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(kpi.revenue)}</p>
              <p className="text-xs text-white/80 mt-2 flex items-center gap-1">
                {analytics.trends.revenue.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatTrendLabel(analytics.trends.revenue)}
              </p>
            </div>
            <Wallet size={22} className="text-white/70" />
          </div>
        </div>

        {[
          { label: 'Active Users', value: kpi.activeUsers.toLocaleString(), trend: formatTrendLabel(analytics.trends.activeUsers), up: analytics.trends.activeUsers.up, icon: Users },
          { label: 'Rides Today', value: kpi.ridesToday.toLocaleString(), trend: formatTrendLabel(analytics.trends.rides), up: analytics.trends.rides.up, icon: Bike },
          { label: 'Avg Fare', value: formatCurrency(kpi.avgFare), trend: formatTrendLabel(analytics.trends.avgFare), up: analytics.trends.avgFare.up, icon: LineChartIcon },
        ].map(({ label, value, trend, up, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#9a9a9a]">{label}</p>
                <p className="text-3xl font-bold text-[#1a1a1a] mt-1">{value}</p>
                <p className={`text-xs mt-2 flex items-center gap-1 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend}
                </p>
              </div>
              <Icon size={22} className="text-[#ccc]" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Revenue & rides */}
        <div className="xl:col-span-5 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1a1a1a]">Revenue & rides</p>
          <p className="text-xs text-[#9a9a9a] mb-4">Last 7 days</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weeklyChart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9a9a9a' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eceae6', fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke={ORANGE} fill="url(#revenueGrad)" strokeWidth={2} />
                <Line type="monotone" dataKey="rides" stroke="#1a1a1a" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-[#9a9a9a]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF8C42]" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1a1a1a]" /> Rides</span>
          </div>
        </div>

        {/* Bike fleet donut */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1a1a1a]">Bike fleet</p>
          <p className="text-xs text-[#9a9a9a] mb-2">{fleetTotal.toLocaleString()} total</p>
          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleetBreakdown} innerRadius={48} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
                  {fleetBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-lg font-bold text-[#1a1a1a]">{fleetTotal}</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {fleetBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-[#666]">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-[#1a1a1a]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active users bar */}
        <div className="xl:col-span-2 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1a1a1a]">Active users</p>
          <p className="text-xs text-[#9a9a9a] mb-4">By hour today</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.activeUsersByHour}>
                <Bar dataKey="users" fill={ORANGE} radius={[4, 4, 0, 0]} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#9a9a9a' }} axisLine={false} tickLine={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Support tickets + Ride time */}
        <div className="xl:col-span-3 space-y-4">
          <div className="rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#1a1a1a]">Support tickets</p>
            <p className="text-xs text-[#9a9a9a] mb-3">Open vs closed</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.supportTicketsTrend}>
                  <Line type="monotone" dataKey="open" stroke={ORANGE} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="closed" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9a9a9a' }} axisLine={false} tickLine={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#1a1a1a]">Ride time</p>
            <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{analytics.rideTime.overall} min</p>
            <p className="text-xs text-[#9a9a9a] mb-4">Average duration · {analytics.rides.totalDurationMinutes} min total</p>
            {[
              { label: 'Weekday', value: analytics.rideTime.weekday },
              { label: 'Weekend', value: analytics.rideTime.weekend },
              { label: 'Peak hr', value: analytics.rideTime.peakHour },
            ].map((item) => (
              <div key={item.label} className="mb-2.5">
                <div className="flex justify-between text-[11px] text-[#666] mb-1">
                  <span>{item.label}</span>
                  <span>{item.value} min</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                  <div className="h-full rounded-full bg-[#1a1a1a]" style={{ width: `${(item.value / rideDurationMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Locations + Open tickets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Locations performance</p>
              <p className="text-xs text-[#9a9a9a]">Weekly · sorted by utilisation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl border-[#eceae6] text-xs h-9">
                <Filter size={14} className="mr-1.5" /> Filter
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white text-xs h-9"
                onClick={() => onSetActivePanel('add-dock')}
              >
                <Plus size={14} className="mr-1.5" /> Add dock
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold tracking-wider text-[#9a9a9a] uppercase border-b border-[#f0f0f0]">
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Rides</th>
                  <th className="pb-3 pr-4">Revenue</th>
                  <th className="pb-3 pr-4">Docks</th>
                  <th className="pb-3 pr-4">Utilisation</th>
                  <th className="pb-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {locationRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f5f5f5] last:border-0">
                    <td className="py-3.5 pr-4 text-sm font-medium text-[#1a1a1a]">{row.name}</td>
                    <td className="py-3.5 pr-4 text-sm text-[#666]">{row.rides}</td>
                    <td className="py-3.5 pr-4 text-sm text-[#666]">{formatCurrency(row.revenue)}</td>
                    <td className="py-3.5 pr-4 text-sm text-[#666]">{row.docks}</td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-[#f0f0f0] overflow-hidden">
                          <div className="h-full rounded-full bg-[#FF8C42]" style={{ width: `${row.utilisation}%` }} />
                        </div>
                        <span className="text-xs font-medium text-[#666] w-8">{row.utilisation}%</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <button type="button" className="text-[#ccc] hover:text-[#666]">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Open tickets</p>
              <p className="text-xs text-[#9a9a9a]">Last 24 hrs</p>
            </div>
            <button type="button" className="text-xs font-semibold text-red-500 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {displayTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-start gap-3 rounded-xl border border-[#f0f0f0] p-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <AlertTriangle size={14} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{ticket.issueLabel}</p>
                  <p className="text-xs text-[#9a9a9a] mt-0.5">{ticket.id} · {ticket.user}</p>
                </div>
                <span className="text-xs text-[#9a9a9a] shrink-0">{formatRelativeTime(ticket.reportedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users + Fleet live */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Users</p>
              <p className="text-xs text-[#9a9a9a]">Quick actions</p>
            </div>
            <div className="flex gap-1.5">
              {(['Active', 'Flagged', 'Banned'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setUserFilter(filter)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    userFilter === filter
                      ? 'bg-[#1a1a1a] text-white'
                      : 'bg-[#f5f5f5] text-[#666] hover:bg-[#eceae6]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold tracking-wider text-[#9a9a9a] uppercase border-b border-[#f0f0f0]">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Wallet</th>
                  <th className="pb-3 pr-4">Rides</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const status = userStatus(user);
                  return (
                    <tr key={user.id} className="border-b border-[#f5f5f5] last:border-0">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: avatarColors[index % avatarColors.length] }}
                          >
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1a1a1a]">{user.name}</p>
                            <p className="text-xs text-[#9a9a9a]">{user.id.replace('u-', 'U-').toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-[#666]">{formatCurrency(user.walletBalance)}</td>
                      <td className="py-3.5 pr-4 text-sm text-[#666]">{user.totalRides}</td>
                      <td className="py-3.5 pr-4">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-[#bbb]">
                          <button type="button" className="hover:text-[#666]"><Eye size={15} /></button>
                          <button type="button" className="hover:text-[#666]"><Star size={15} /></button>
                          <button type="button" className="hover:text-[#666]"><Wallet size={15} /></button>
                          <button type="button" className="hover:text-[#666]"><Ban size={15} /></button>
                          <button type="button" className="hover:text-red-400"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-[#9a9a9a]">No users in this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Fleet live</p>
              <p className="text-xs text-[#9a9a9a]">Bikes by status</p>
            </div>
            <Button
              size="sm"
              className="rounded-xl bg-[#1a1a1a] hover:bg-[#333] text-white text-xs h-9"
              onClick={() => onSetActivePanel('add-fleet')}
            >
              <Plus size={14} className="mr-1.5" /> Add bike
            </Button>
          </div>
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
            {vehicles.slice(0, 6).map((vehicle) => {
              const status = vehicleStatusLabel(vehicle);
              return (
                <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-[#f0f0f0] px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff5ed]">
                      <Bike size={16} className="text-[#FF8C42]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a]">{vehicle.id}</p>
                      <p className="text-xs text-[#9a9a9a] truncate">{vehicle.location}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-xs font-semibold ${status.className}`}>{status.label}</p>
                    <p className="text-[10px] text-[#9a9a9a] flex items-center justify-end gap-0.5 mt-0.5">
                      <Battery size={10} /> {vehicle.battery}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operator quick actions */}
      <div className="rounded-2xl bg-white border border-[#eceae6] p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#1a1a1a]">Operator quick actions</p>
          <p className="text-xs text-[#9a9a9a]">One-click power tools</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, icon: Icon, panel }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSetActivePanel(panel)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] px-3 py-4 hover:border-[#FF8C42]/30 hover:bg-[#fff8f3] transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#eceae6]">
                <Icon size={18} className="text-[#FF8C42]" />
              </div>
              <span className="text-xs font-medium text-[#444] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
