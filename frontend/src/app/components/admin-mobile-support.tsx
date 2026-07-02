import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { InstituteData } from '../lib/admin-data';
import { getInstituteAnalytics } from '../lib/admin-analytics';
import { ORANGE, fallbackTickets, formatRelativeTime } from './admin-mobile-shared';

interface AdminMobileSupportProps {
  institute: InstituteData;
}

type TicketFilter = 'All' | 'High' | 'Refund' | 'Damage';

const filters: TicketFilter[] = ['All', 'High', 'Refund', 'Damage'];

export const AdminMobileSupport: React.FC<AdminMobileSupportProps> = ({ institute }) => {
  const [filter, setFilter] = useState<TicketFilter>('All');
  const analytics = useMemo(() => getInstituteAnalytics(institute), [institute]);

  const tickets = institute.issueReports.length > 0 ? institute.issueReports : fallbackTickets;

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'All') return true;
    if (filter === 'High') return ticket.issueType === 'damage' || ticket.issueType === 'refund';
    if (filter === 'Refund') return ticket.issueType === 'refund' || ticket.issueLabel.toLowerCase().includes('refund');
    if (filter === 'Damage') return ticket.issueType === 'damage' || ticket.issueLabel.toLowerCase().includes('damage');
    return true;
  });

  const openCount = analytics.openTickets;
  const resolvedCount = analytics.supportTicketsTrend.reduce((sum, week) => sum + week.closed, 0);
  const avgTime = `${analytics.avgRideDurationMinutes}m`;

  const priorityLabel = (type: string) => {
    if (type === 'damage') return 'high';
    if (type === 'refund') return 'medium';
    return 'low';
  };

  return (
    <div className="p-4 pb-28 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-[#FF8C42] p-3 text-white text-center shadow-sm">
          <p className="text-[10px] font-semibold tracking-wide text-white/80">OPEN</p>
          <p className="text-2xl font-bold mt-0.5">{openCount}</p>
        </div>
        <div className="rounded-2xl border border-[#eceae6] bg-white p-3 text-center shadow-sm">
          <p className="text-[10px] font-semibold tracking-wide text-[#9a9a9a]">RESOLVED</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-0.5">{resolvedCount}</p>
        </div>
        <div className="rounded-2xl border border-[#eceae6] bg-white p-3 text-center shadow-sm">
          <p className="text-[10px] font-semibold tracking-wide text-[#9a9a9a]">AVG RIDE</p>
          <p className="text-2xl font-bold text-[#1a1a1a] mt-0.5">{avgTime}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1a1a1a]">Tickets · 4 wks</p>
        <p className="text-xs text-[#9a9a9a] mb-3">Open vs Closed</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.supportTicketsTrend} barGap={2}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9a9a9a' }} axisLine={false} tickLine={false} />
              <Bar dataKey="open" fill={ORANGE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="closed" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-[#9a9a9a]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#FF8C42]" /> Open</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#1a1a1a]" /> Closed</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
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
        {filteredTickets.length === 0 && (
          <p className="text-center text-sm text-[#9a9a9a] py-8">No tickets in this filter.</p>
        )}
        {filteredTickets.map((ticket) => {
          const priority = priorityLabel(ticket.issueType);
          return (
            <div key={ticket.id} className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  priority === 'high' ? 'bg-red-50' : 'bg-amber-50'
                }`}>
                  <AlertTriangle size={15} className={priority === 'high' ? 'text-red-500' : 'text-amber-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{ticket.issueLabel}</p>
                  <p className="text-xs text-[#9a9a9a] mt-0.5">
                    {ticket.id} · {ticket.user} · {priority}
                  </p>
                </div>
                <span className="text-xs text-[#9a9a9a] shrink-0">{formatRelativeTime(ticket.reportedAt)}</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-[#1a1a1a] py-2 text-xs font-semibold text-white"
                >
                  Open
                </button>
                <button type="button" className="px-3 py-2 text-xs font-semibold text-emerald-600">
                  Resolve
                </button>
                <button type="button" className="px-3 py-2 text-xs font-semibold text-[#9a9a9a]">
                  Refund
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
