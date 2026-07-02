import {
  getCompletedRides,
  getInstituteRevenue,
  getRevenueMetrics,
  type AdminDock,
  type AdminUser,
  type AdminVehicle,
  type InstituteData,
  type IssueReport,
  type RideHistoryRecord,
} from './admin-data';

export const INITIAL_TARGET_REVENUE = 500;

const ORANGE = '#FF8C42';
const ORANGE_LIGHT = '#FFB380';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const parseRideCompletedAt = (ride: RideHistoryRecord) => {
  const parsed = new Date(ride.completedAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseRideStartedAt = (ride: RideHistoryRecord) => {
  if (ride.startedAt) {
    const parsed = new Date(ride.startedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const completed = parseRideCompletedAt(ride);
  if (!completed) return null;
  return new Date(completed.getTime() - ride.duration * 1000);
};

export const percentChange = (current: number, previous: number) => {
  if (previous === 0) {
    const percent = current > 0 ? 100 : 0;
    return { percent, up: current >= previous };
  }
  const raw = ((current - previous) / previous) * 100;
  return { percent: Math.round(raw * 10) / 10, up: raw >= 0 };
};

export const formatTrendLabel = (trend: { percent: number; up: boolean }, period = 'last wk') => {
  const sign = trend.up ? '+' : '';
  return `${sign}${trend.percent}% vs ${period}`;
};

export interface WeeklyChartPoint {
  day: string;
  revenue: number;
  rides: number;
  durationMinutes: number;
}

export interface HourlyUsersPoint {
  hour: string;
  users: number;
}

export interface SupportTicketsPoint {
  week: string;
  open: number;
  closed: number;
}

export interface RideTimeBreakdown {
  overall: number;
  weekday: number;
  weekend: number;
  peakHour: number;
}

export interface FleetSlice {
  name: string;
  value: number;
  color: string;
}

export interface LocationPerformanceRow {
  id: string;
  name: string;
  rides: number;
  revenue: number;
  docks: number;
  utilisation: number;
}

export interface HourlyRideTrendPoint {
  label: string;
  value: number;
}

export interface InstituteAnalytics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
    previousDaily: number;
    previousWeekly: number;
  };
  rides: {
    today: number;
    thisWeek: number;
    total: number;
    completed: number;
    active: number;
    previousWeek: number;
    totalDurationMinutes: number;
  };
  avgFare: number;
  previousAvgFare: number;
  avgRideDurationMinutes: number;
  rideTime: RideTimeBreakdown;
  activeRiders: number;
  previousActiveRiders: number;
  trends: {
    revenue: ReturnType<typeof percentChange>;
    dailyRevenue: ReturnType<typeof percentChange>;
    rides: ReturnType<typeof percentChange>;
    avgFare: ReturnType<typeof percentChange>;
    activeUsers: ReturnType<typeof percentChange>;
  };
  weeklyChart: WeeklyChartPoint[];
  activeUsersByHour: HourlyUsersPoint[];
  supportTicketsTrend: SupportTicketsPoint[];
  fleetBreakdown: FleetSlice[];
  fleetTotal: number;
  locationPerformance: LocationPerformanceRow[];
  hourlyRideTrend: HourlyRideTrendPoint[];
  openTickets: number;
  highPriorityTickets: number;
}

const sumRideFares = (rides: RideHistoryRecord[]) =>
  rides.reduce((sum, ride) => sum + ride.fare, 0);

const sumRideDurations = (rides: RideHistoryRecord[]) =>
  rides.reduce((sum, ride) => sum + ride.duration, 0);

const avgDurationMinutes = (rides: RideHistoryRecord[]) => {
  if (rides.length === 0) return 0;
  return Math.round((sumRideDurations(rides) / rides.length / 60) * 10) / 10;
};

const ridesInRange = (rides: RideHistoryRecord[], start: Date, end: Date) =>
  rides.filter((ride) => {
    const rideDate = parseRideCompletedAt(ride);
    return rideDate ? rideDate >= start && rideDate <= end : false;
  });

const ridesToday = (rideHistory: RideHistoryRecord[], now: Date) => {
  const today = startOfDay(now);
  return rideHistory.filter((ride) => {
    if (ride.status === 'active') return true;
    const rideDate = parseRideCompletedAt(ride);
    return rideDate ? isSameDay(rideDate, today) : false;
  });
};

export const buildWeeklyChart = (
  rideHistory: RideHistoryRecord[],
  now = new Date()
): WeeklyChartPoint[] => {
  const completed = getCompletedRides(rideHistory);
  const today = startOfDay(now);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dayRides = ridesInRange(completed, day, dayEnd);
    const revenue = sumRideFares(dayRides);
    const durationMinutes = dayRides.length
      ? Math.round(sumRideDurations(dayRides) / dayRides.length / 60)
      : 0;

    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue,
      rides: dayRides.length,
      durationMinutes,
    };
  });
};

export const buildActiveUsersByHour = (
  rideHistory: RideHistoryRecord[],
  now = new Date()
): HourlyUsersPoint[] => {
  const slots = [
    { hour: '6a', start: 6, end: 8 },
    { hour: '8a', start: 8, end: 10 },
    { hour: '10a', start: 10, end: 12 },
    { hour: '12p', start: 12, end: 14 },
    { hour: '2p', start: 14, end: 16 },
    { hour: '4p', start: 16, end: 18 },
    { hour: '6p', start: 18, end: 20 },
    { hour: '8p', start: 20, end: 21 },
    { hour: '9p', start: 21, end: 24 },
  ];

  const today = startOfDay(now);
  const todayRides = rideHistory.filter((ride) => {
    const started = parseRideStartedAt(ride);
    return started ? isSameDay(started, today) : false;
  });

  return slots.map(({ hour, start, end }) => {
    const users = new Set(
      todayRides
        .filter((ride) => {
          const started = parseRideStartedAt(ride);
          if (!started) return false;
          const rideHour = started.getHours();
          return rideHour >= start && rideHour < end;
        })
        .map((ride) => ride.user)
    );
    return { hour, users: users.size };
  });
};

export const buildSupportTicketsTrend = (
  issueReports: IssueReport[],
  now = new Date()
): SupportTicketsPoint[] => {
  const today = startOfDay(now);

  return Array.from({ length: 4 }, (_, index) => {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - index * 7);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const open = issueReports.filter((ticket) => {
      const reported = new Date(ticket.reportedAt);
      return !Number.isNaN(reported.getTime()) && reported >= weekStart && reported <= weekEnd;
    }).length;

    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(weekStart.getDate() - 7);
    const previousWeekEnd = new Date(weekStart);
    previousWeekEnd.setMilliseconds(-1);

    const closed = Math.max(
      0,
      issueReports.filter((ticket) => {
        const reported = new Date(ticket.reportedAt);
        return !Number.isNaN(reported.getTime()) && reported >= previousWeekStart && reported <= previousWeekEnd;
      }).length - open
    );

    return {
      week: `W${4 - index}`,
      open,
      closed,
    };
  }).reverse();
};

export const buildRideTimeBreakdown = (
  rideHistory: RideHistoryRecord[]
): RideTimeBreakdown => {
  const completed = getCompletedRides(rideHistory);
  if (completed.length === 0) {
    return { overall: 0, weekday: 0, weekend: 0, peakHour: 0 };
  }

  const weekdayRides = completed.filter((ride) => {
    const date = parseRideCompletedAt(ride);
    if (!date) return false;
    const day = date.getDay();
    return day >= 1 && day <= 5;
  });

  const weekendRides = completed.filter((ride) => {
    const date = parseRideCompletedAt(ride);
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6;
  });

  const peakRides = completed.filter((ride) => {
    const started = parseRideStartedAt(ride);
    if (!started) return false;
    const hour = started.getHours();
    return hour >= 16 && hour < 19;
  });

  return {
    overall: avgDurationMinutes(completed),
    weekday: avgDurationMinutes(weekdayRides),
    weekend: avgDurationMinutes(weekendRides),
    peakHour: avgDurationMinutes(peakRides),
  };
};

export const buildFleetBreakdown = (vehicles: AdminVehicle[]): FleetSlice[] => {
  const active = vehicles.filter((v) => v.status === 'available' || v.status === 'in-ride').length;
  const idle = vehicles.filter((v) => v.status === 'user-locked').length;
  const damaged = vehicles.filter((v) => v.status === 'maintenance').length;

  const slices = [
    { name: 'Active', value: active, color: ORANGE },
    { name: 'Idle', value: idle, color: ORANGE_LIGHT },
    { name: 'Damaged', value: damaged, color: '#737373' },
  ];

  return vehicles.length === 0 ? slices : slices.filter((slice) => slice.value > 0);
};

export const buildLocationPerformance = (
  docks: AdminDock[],
  completedRides: RideHistoryRecord[]
): LocationPerformanceRow[] => {
  return docks
    .map((dock) => {
      const dockRides = completedRides.filter(
        (ride) => ride.startDock === dock.name || ride.endDock === dock.name
      );
      const revenue = sumRideFares(dockRides);
      const utilisation = dock.spots > 0 ? Math.round((dock.occupied / dock.spots) * 100) : 0;

      return {
        id: dock.id,
        name: dock.name,
        rides: dockRides.length,
        revenue,
        docks: dock.spots,
        utilisation,
      };
    })
    .sort((a, b) => b.utilisation - a.utilisation || b.revenue - a.revenue);
};

export const buildHourlyRideTrend = (
  rideHistory: RideHistoryRecord[],
  now = new Date()
): HourlyRideTrendPoint[] => {
  const todayRides = ridesToday(rideHistory, now);
  const slots = [
    { label: '6 AM', start: 6, end: 9 },
    { label: '9 AM', start: 9, end: 12 },
    { label: '12 PM', start: 12, end: 15 },
    { label: '3 PM', start: 15, end: 18 },
    { label: '6 PM', start: 18, end: 21 },
    { label: '9 PM', start: 21, end: 24 },
  ];

  return slots.map(({ label, start, end }) => {
    const value = todayRides.filter((ride) => {
      const started = parseRideStartedAt(ride);
      if (!started) return false;
      const hour = started.getHours();
      return hour >= start && hour < end;
    }).length;

    return { label, value };
  });
};

export const getInstituteAnalytics = (
  institute: InstituteData,
  now = new Date()
): InstituteAnalytics => {
  const completed = getCompletedRides(institute.rideHistory);
  const metrics = getRevenueMetrics(institute, now);
  const today = startOfDay(now);

  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 6);
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setMilliseconds(-1);
  const previousWeekStart = new Date(previousWeekEnd);
  previousWeekStart.setDate(previousWeekEnd.getDate() - 6);
  previousWeekStart.setHours(0, 0, 0, 0);

  const previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);

  const currentWeekRides = ridesInRange(completed, currentWeekStart, now);
  const previousWeekRides = ridesInRange(completed, previousWeekStart, previousWeekEnd);
  const previousDayRides = completed.filter((ride) => {
    const rideDate = parseRideCompletedAt(ride);
    return rideDate ? isSameDay(rideDate, previousDay) : false;
  });

  const todayRideList = ridesToday(institute.rideHistory, now);
  const avgFare = completed.length ? sumRideFares(completed) / completed.length : 0;
  const previousAvgFare = previousWeekRides.length
    ? sumRideFares(previousWeekRides) / previousWeekRides.length
    : 0;

  const activeRiders = new Set(
    institute.rideHistory
      .filter((ride) => {
        const started = parseRideStartedAt(ride);
        return started && started >= currentWeekStart && started <= now;
      })
      .map((ride) => ride.user)
  ).size;

  const previousActiveRiders = new Set(
    institute.rideHistory
      .filter((ride) => {
        const started = parseRideStartedAt(ride);
        return started && started >= previousWeekStart && started <= previousWeekEnd;
      })
      .map((ride) => ride.user)
  ).size;

  const fleetBreakdown = buildFleetBreakdown(institute.vehicles);
  const rideTime = buildRideTimeBreakdown(institute.rideHistory);
  const highPriorityTickets = institute.issueReports.filter(
    (ticket) => ticket.issueType === 'damage' || ticket.issueType === 'refund'
  ).length;

  return {
    revenue: {
      daily: metrics.daily,
      weekly: metrics.weekly,
      monthly: metrics.monthly,
      total: metrics.total,
      previousDaily: sumRideFares(previousDayRides),
      previousWeekly: sumRideFares(previousWeekRides),
    },
    rides: {
      today: todayRideList.length,
      thisWeek: currentWeekRides.length,
      total: institute.rideHistory.length,
      completed: completed.length,
      active: institute.rideHistory.filter((ride) => ride.status === 'active').length,
      previousWeek: previousWeekRides.length,
      totalDurationMinutes: Math.round(sumRideDurations(completed) / 60),
    },
    avgFare,
    previousAvgFare,
    avgRideDurationMinutes: rideTime.overall,
    rideTime,
    activeRiders,
    previousActiveRiders,
    trends: {
      revenue: percentChange(metrics.weekly, sumRideFares(previousWeekRides)),
      dailyRevenue: percentChange(metrics.daily, sumRideFares(previousDayRides)),
      rides: percentChange(currentWeekRides.length, previousWeekRides.length),
      avgFare: percentChange(avgFare, previousAvgFare),
      activeUsers: percentChange(activeRiders, previousActiveRiders),
    },
    weeklyChart: buildWeeklyChart(institute.rideHistory, now),
    activeUsersByHour: buildActiveUsersByHour(institute.rideHistory, now),
    supportTicketsTrend: buildSupportTicketsTrend(institute.issueReports, now),
    fleetBreakdown,
    fleetTotal: fleetBreakdown.reduce((sum, slice) => sum + slice.value, 0),
    locationPerformance: buildLocationPerformance(institute.docks, completed),
    hourlyRideTrend: buildHourlyRideTrend(institute.rideHistory, now),
    openTickets: institute.issueReports.length,
    highPriorityTickets,
  };
};
