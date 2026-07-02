import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis } from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Bike,
  AlertTriangle,
  Ticket,
  Wallet,
  Gift,
  CreditCard,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { formatTrendLabel, getInstituteAnalytics } from '../lib/admin-analytics';
import type { InstituteData } from '../lib/admin-data';
import { ORANGE } from './admin-mobile-shared';
import type { ActivePanel } from '../screens/admin-dashboard-types';

interface AdminMobileOverviewProps {
  selectedInstitute: InstituteData;
  onSetActivePanel: (panel: ActivePanel) => void;
  onNavigateFleet?: () => void;
}

export const AdminMobileOverview: React.FC<AdminMobileOverviewProps> = ({
  selectedInstitute,
  onSetActivePanel,
  onNavigateFleet,
}) => {
  const vehicles = selectedInstitute.vehicles;
  const analytics = useMemo(() => getInstituteAnalytics(selectedInstitute), [selectedInstitute]);

  const stats = useMemo(() => {
    const activeBikes = vehicles.filter((v) => v.status === 'available' || v.status === 'in-ride').length;
    const offline = vehicles.filter((v) => v.status === 'user-locked' || v.status === 'maintenance').length;

    return {
      revenue: analytics.revenue.daily,
      ridesToday: analytics.rides.today,
      activeUsers: analytics.activeRiders,
      avgRideMin: analytics.avgRideDurationMinutes,
      activeBikes,
      totalBikes: vehicles.length,
      offline,
      openTickets: analytics.openTickets,
      highTickets: analytics.highPriorityTickets,
      avgFare: analytics.avgFare,
      weeklyRides: analytics.rides.thisWeek,
      revenueTrend: analytics.trends.dailyRevenue,
      avgFareTrend: analytics.trends.avgFare,
    };
  }, [vehicles, analytics]);

  const attentionBikes = vehicles
    .filter((v) => v.status === 'maintenance' || v.battery < 20)
    .slice(0, 3);

  const quickActions = [
    { label: 'Coupon', icon: Gift, panel: 'reports' as ActivePanel },
    { label: 'Credit', icon: CreditCard, panel: 'operations' as ActivePanel },
    { label: 'Bike', icon: Bike, panel: 'add-fleet' as ActivePanel },
    { label: 'Dock', icon: MapPin, panel: 'add-dock' as ActivePanel },
  ];

  return (
    <div className="space-y-4 p-4 pb-28">
      <div className="rounded-2xl bg-[#FF8C42] p-5 text-white shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-semibold tracking-wider text-white/80">TODAY&apos;S REVENUE</p>
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
        </div>
        <p className="text-4xl font-bold mt-2">{formatCurrency(stats.revenue)}</p>
        <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
          {stats.revenueTrend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {formatTrendLabel(stats.revenueTrend, 'yesterday')}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/20 pt-4">
          <div>
            <p className="text-lg font-bold">{stats.ridesToday.toLocaleString()}</p>
            <p className="text-[10px] text-white/70 tracking-wide">RIDES</p>
          </div>
          <div>
            <p className="text-lg font-bold">{stats.activeUsers.toLocaleString()}</p>
            <p className="text-[10px] text-white/70 tracking-wide">ACTIVE</p>
          </div>
          <div>
            <p className="text-lg font-bold">{stats.avgRideMin}m</p>
            <p className="text-[10px] text-white/70 tracking-wide">AVG RIDE</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">Rides this week</p>
          <p className="text-sm font-bold text-[#FF8C42]">{stats.weeklyRides}</p>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.weeklyChart}>
              <defs>
                <linearGradient id="mobileRidesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9a9a9a' }} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="rides" stroke={ORANGE} fill="url(#mobileRidesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs text-[#9a9a9a]">Active Bikes</p>
          </div>
          <p className="text-xl font-bold text-[#1a1a1a]">{stats.activeBikes}</p>
          <p className="text-xs text-[#9a9a9a]">of {stats.totalBikes.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="text-[#9a9a9a]" />
            <p className="text-xs text-[#9a9a9a]">Offline</p>
          </div>
          <p className="text-xl font-bold text-[#1a1a1a]">{stats.offline}</p>
          <p className="text-xs text-[#9a9a9a]">needs check</p>
        </div>

        <div className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Ticket size={12} className="text-[#FF8C42]" />
            <p className="text-xs text-[#9a9a9a]">Open Tickets</p>
          </div>
          <p className="text-xl font-bold text-[#1a1a1a]">{stats.openTickets}</p>
          <p className="text-xs text-[#FF8C42]">{stats.highTickets} high</p>
        </div>

        <div className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={12} className="text-[#9a9a9a]" />
            <p className="text-xs text-[#9a9a9a]">Avg Fare</p>
          </div>
          <p className="text-xl font-bold text-[#1a1a1a]">{formatCurrency(stats.avgFare)}</p>
          <p className={`text-xs ${stats.avgFareTrend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatTrendLabel(stats.avgFareTrend)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#9a9a9a] mb-2 tracking-wide">QUICK ACTIONS</p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(({ label, icon: Icon, panel }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSetActivePanel(panel)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#eceae6] bg-white py-3 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5ed]">
                <Icon size={18} className="text-[#FF8C42]" />
              </div>
              <span className="text-[11px] font-medium text-[#444]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {attentionBikes.length > 0 && (
        <div className="rounded-2xl bg-[#1a1a1a] p-4 text-white">
          <p className="text-sm font-bold text-[#FF8C42]">
            {attentionBikes.length} bikes need attention
          </p>
          <div className="mt-2 space-y-1">
            {attentionBikes.map((bike) => (
              <p key={bike.id} className="text-xs text-white/70">
                {bike.id} — {bike.status === 'maintenance' ? 'reported damage' : `low battery (${bike.battery}%)`}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={onNavigateFleet}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-[#FF8C42] py-2.5 text-sm font-semibold text-white"
          >
            Review Fleet <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
