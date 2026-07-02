export type DockStatus = 'active' | 'available' | 'full';
export type VehicleStatus = 'available' | 'in-ride' | 'user-locked' | 'maintenance';
export type VehicleCondition = 'good' | 'low-battery' | 'needs-repair';
export type FareVehicleType = 'BICYCLE' | 'E_BIKE';
export type FareUserRole = 'GUEST_RIDER' | 'VERIFIED_RIDER';

export interface AdminDock {
  id: string;
  name: string;
  location: string;
  campus: string;
  spots: number;
  occupied: number;
  status: DockStatus;
  latitude?: number;
  longitude?: number;
  strictRadius?: number;
  softBuffer?: number;
  optimumCapacity?: number;
  rebalanceThreshold?: number;
  isActive?: boolean;
  mapX?: number;
  mapY?: number;
}

export interface AdminVehicle {
  id: string;
  type: string;
  hardwareMac?: string;
  dockId: string;
  location: string;
  status: VehicleStatus;
  battery: number;
  lastRide: string;
  totalRides: number;
  condition: VehicleCondition;
}

export interface AdminPricing {
  baseFare: number;
  perMinute: number;
  reservation: number;
  subscription: number;
  discount: number;
  pricingStructure: string;
}

export interface AdminFareRule {
  id: string;
  vehicleType: FareVehicleType;
  userRole: FareUserRole;
  baseFare: number;
  baseDurationMinutes: number;
  perMinuteRate: number;
}

export type AdminUserRole = 'verified' | 'guest' | 'admin' | 'blocked';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  walletBalance: number;
  totalRides: number;
  memberSince: string;
  institute: string;
  avatar: string;
}

export interface RideHistoryRecord {
  id: string;
  user: string;
  userPhone?: string;
  vehicleId: string;
  startDock: string;
  endDock: string;
  fare: number;
  duration: number;
  distance: number;
  bikeType?: string;
  status: 'active' | 'completed';
  completedAt: string;
  startedAt?: string;
}

export interface IssueReport {
  id: string;
  instituteId: string;
  instituteName: string;
  user: string;
  userPhone?: string;
  vehicleId: string;
  rideId?: string;
  issueType: string;
  issueLabel: string;
  description: string;
  reportedAt: string;
}

export interface InstituteData {
  id: string;
  name: string;
  city?: string;
  mapAssetName?: string;
  mapPreviewDataUrl?: string;
  revenue: number;
  activeRides: number;
  completedRides: number;
  vehicleTypes: string[];
  docks: AdminDock[];
  vehicles: AdminVehicle[];
  rideHistory: RideHistoryRecord[];
  issueReports: IssueReport[];
  users: AdminUser[];
  pricing: AdminPricing;
  fareRules: AdminFareRule[];
}

export interface NewInstituteInput {
  name: string;
  city?: string;
  mapAssetName?: string;
  mapPreviewDataUrl?: string;
  dockCount?: number;
  vehicleCount?: number;
  vehicleTypes?: string;
  pricingStructure?: string;
  dockLocations?: string;
}

export const defaultPricing: AdminPricing = {
  baseFare: 0,
  perMinute: 2,
  reservation: 5,
  subscription: 299,
  discount: 10,
  pricingStructure: 'Standard: base 0, per minute 2, reservation 5',
};

export const defaultFareRules: AdminFareRule[] = [
  {
    id: 'fare-bicycle-guest',
    vehicleType: 'BICYCLE',
    userRole: 'GUEST_RIDER',
    baseFare: 5,
    baseDurationMinutes: 15,
    perMinuteRate: 1,
  },
  {
    id: 'fare-bicycle-verified',
    vehicleType: 'BICYCLE',
    userRole: 'VERIFIED_RIDER',
    baseFare: 3,
    baseDurationMinutes: 15,
    perMinuteRate: 0.75,
  },
  {
    id: 'fare-ebike-guest',
    vehicleType: 'E_BIKE',
    userRole: 'GUEST_RIDER',
    baseFare: 10,
    baseDurationMinutes: 10,
    perMinuteRate: 2,
  },
];

export const calculateRideFare = (
  durationSeconds: number,
  pricing: Pick<AdminPricing, 'baseFare' | 'perMinute'> = defaultPricing
) => {
  const billableMinutes = durationSeconds <= 0 ? 0 : Math.ceil(durationSeconds / 60);
  return Math.round((pricing.baseFare + billableMinutes * pricing.perMinute) * 100) / 100;
};

const makeId = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `institute-${Date.now()}`;

const splitList = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const getVehicleCondition = (battery: number): VehicleCondition => {
  if (battery < 30) return 'low-battery';
  return 'good';
};

const getDockStatus = (spots: number, occupied: number): DockStatus => {
  if (occupied >= spots) return 'full';
  if (occupied > 0) return 'active';
  return 'available';
};

const parsePricingStructure = (pricingStructure: string): AdminPricing => {
  const numbers = pricingStructure.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];

  return {
    ...defaultPricing,
    pricingStructure: pricingStructure.trim() || defaultPricing.pricingStructure,
    baseFare: numbers[0] ?? defaultPricing.baseFare,
    perMinute: numbers[1] ?? defaultPricing.perMinute,
    reservation: numbers[2] ?? defaultPricing.reservation,
  };
};

export const recalculateDockOccupancy = (docks: AdminDock[], vehicles: AdminVehicle[]) =>
  docks.map((dock) => {
    const occupied = vehicles.filter((vehicle) => vehicle.dockId === dock.id).length;
    return {
      ...dock,
      occupied,
      status: getDockStatus(dock.spots, occupied),
    };
  });

export const getCompletedRides = (rideHistory: RideHistoryRecord[]) =>
  rideHistory.filter((ride) => ride.status === 'completed');

export const getInstituteRevenue = (institute: Pick<InstituteData, 'rideHistory'>) =>
  getCompletedRides(institute.rideHistory).reduce((sum, ride) => sum + ride.fare, 0);

const parseRideDate = (ride: RideHistoryRecord) => {
  const parsed = new Date(ride.completedAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getRevenueMetrics = (institute: Pick<InstituteData, 'rideHistory'>, now = new Date()) => {
  const completed = getCompletedRides(institute.rideHistory);
  const today = startOfDay(now);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return completed.reduce(
    (metrics, ride) => {
      metrics.total += ride.fare;
      const rideDate = parseRideDate(ride);
      if (!rideDate) return metrics;

      if (isSameDay(rideDate, now)) metrics.daily += ride.fare;
      if (rideDate >= weekStart && rideDate <= now) metrics.weekly += ride.fare;
      if (rideDate >= monthStart && rideDate <= now) metrics.monthly += ride.fare;
      return metrics;
    },
    { daily: 0, weekly: 0, monthly: 0, total: 0 }
  );
};

export const getDashboardStats = (institute: InstituteData, now = new Date()) => {
  const completed = getCompletedRides(institute.rideHistory);
  const today = startOfDay(now);
  const ridesToday = institute.rideHistory.filter((ride) => {
    if (ride.status === 'active') return true;
    const rideDate = parseRideDate(ride);
    return rideDate ? isSameDay(rideDate, today) : false;
  }).length;
  const revenueToday = completed.reduce((sum, ride) => {
    const rideDate = parseRideDate(ride);
    return rideDate && isSameDay(rideDate, today) ? sum + ride.fare : sum;
  }, 0);
  const avgFare = completed.length
    ? completed.reduce((sum, ride) => sum + ride.fare, 0) / completed.length
    : 0;
  const totalRideDurationMinutes = Math.round(
    completed.reduce((sum, ride) => sum + ride.duration, 0) / 60
  );
  const avgRideDurationMinutes = completed.length
    ? Math.round((completed.reduce((sum, ride) => sum + ride.duration, 0) / completed.length / 60) * 10) / 10
    : 0;

  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 6);
  const activeRiders = new Set(
    institute.rideHistory
      .filter((ride) => {
        const started = ride.startedAt ? new Date(ride.startedAt) : parseRideDate(ride);
        return started && !Number.isNaN(started.getTime()) && started >= currentWeekStart && started <= now;
      })
      .map((ride) => ride.user)
  ).size;

  return {
    totalVehicles: institute.vehicles.length,
    activeVehicles: institute.vehicles.filter((v) => v.status === 'available' || v.status === 'in-ride').length,
    maintenanceVehicles: institute.vehicles.filter((v) => v.status === 'maintenance').length,
    activeRiders,
    registeredUsers: institute.users.length,
    revenueToday,
    ridesToday,
    activeDocks: institute.docks.filter((d) => d.isActive !== false).length,
    openTickets: institute.issueReports.length,
    avgFare,
    weeklyRevenue: getRevenueMetrics(institute, now).weekly,
    avgRideDurationMinutes,
    totalRideDurationMinutes,
  };
};

const createSeedRideHistory = (options: {
  instituteId: string;
  docks: AdminDock[];
  vehicles: AdminVehicle[];
  users: AdminUser[];
  targetRevenue?: number;
  now?: Date;
}): RideHistoryRecord[] => {
  const {
    instituteId,
    docks,
    vehicles,
    users,
    targetRevenue = 500,
    now = new Date(),
  } = options;

  if (docks.length === 0 || vehicles.length === 0 || users.length === 0) {
    return [];
  }

  const seedPlan = [
    { dayOffset: -6, fare: 42, durationMin: 12 },
    { dayOffset: -5, fare: 48, durationMin: 14 },
    { dayOffset: -4, fare: 55, durationMin: 16 },
    { dayOffset: -3, fare: 62, durationMin: 18 },
    { dayOffset: -2, fare: 70, durationMin: 20 },
    { dayOffset: -1, fare: 78, durationMin: 22 },
    { dayOffset: -1, fare: 45, durationMin: 13 },
    { dayOffset: 0, fare: 50, durationMin: 15 },
    { dayOffset: 0, fare: 50, durationMin: 15 },
  ];

  const scaledFares = seedPlan.map((plan) => Math.round(plan.fare * (targetRevenue / 500) * 100) / 100);
  const fareTotal = scaledFares.slice(0, -1).reduce((sum, fare) => sum + fare, 0);
  scaledFares[scaledFares.length - 1] = Math.round((targetRevenue - fareTotal) * 100) / 100;

  const completedRides = seedPlan.map((plan, index) => {
    const user = users[index % users.length];
    const startDock = docks[index % docks.length];
    const endDock = docks[(index + 1) % docks.length];
    const vehicle = vehicles[index % vehicles.length];
    const completedAt = new Date(now);
    completedAt.setDate(now.getDate() + plan.dayOffset);
    completedAt.setHours(9 + (index % 8), 10 + index, 0, 0);
    const startedAt = new Date(completedAt.getTime() - plan.durationMin * 60 * 1000);

    return {
      id: `R-SEED-${instituteId}-${index + 1}`,
      user: user.name,
      userPhone: user.phone,
      vehicleId: vehicle.id,
      startDock: startDock.name,
      endDock: endDock.name,
      fare: scaledFares[index],
      duration: plan.durationMin * 60,
      distance: Math.round((1.5 + (index % 3) * 0.4) * 10) / 10,
      bikeType: vehicle.type,
      status: 'completed' as const,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
    };
  });

  const activeUser = users[0];
  const activeVehicle = vehicles.find((vehicle) => vehicle.status === 'in-ride') ?? vehicles[0];
  const activeStartDock = docks[0];
  const activeEndDock = docks[1] ?? docks[0];

  const activeRide: RideHistoryRecord = {
    id: `R-SEED-${instituteId}-active`,
    user: activeUser.name,
    userPhone: activeUser.phone,
    vehicleId: activeVehicle.id,
    startDock: activeStartDock.name,
    endDock: activeEndDock.name,
    fare: 0,
    duration: 14 * 60,
    distance: 2.1,
    bikeType: activeVehicle.type,
    status: 'active',
    startedAt: new Date(now.getTime() - 14 * 60 * 1000).toISOString(),
    completedAt: 'Live',
  };

  return [...completedRides, activeRide];
};

export const syncInstituteMetrics = (institute: InstituteData): InstituteData => ({
  ...institute,
  revenue: getInstituteRevenue(institute),
  completedRides: getCompletedRides(institute.rideHistory).length,
  activeRides: institute.rideHistory.filter((ride) => ride.status === 'active').length,
});

export const createInstituteFromInput = (input: NewInstituteInput): InstituteData => {
  const name = input.name.trim();
  const id = `${makeId(name)}-${Date.now().toString(36)}`;
  const locations = splitList(input.dockLocations ?? '');
  const vehicleTypes = splitList(input.vehicleTypes ?? 'BICYCLE, E_BIKE');
  const safeDockCount = Math.max(0, input.dockCount ?? locations.length);
  const safeVehicleCount = Math.max(0, input.vehicleCount || 0);
  const resolvedTypes = vehicleTypes.length ? vehicleTypes : ['BICYCLE'];

  const docks: AdminDock[] = Array.from({ length: safeDockCount }, (_, index) => {
    const location = locations[index] || `Campus Zone ${index + 1}`;
    const capacity = Math.max(8, Math.ceil(safeVehicleCount / safeDockCount) + 4);
    return {
      id: `${id}-dock-${index + 1}`,
      name: `${location} Dock`,
      location,
      campus: name,
      spots: capacity,
      occupied: 0,
      status: 'available',
      latitude: 30.9685 + index * 0.0014,
      longitude: 76.5273 + index * 0.0012,
      strictRadius: 20,
      softBuffer: 15,
      optimumCapacity: capacity,
      rebalanceThreshold: 5,
      isActive: true,
      mapX: 25 + (index % 3) * 24,
      mapY: 32 + Math.floor(index / 3) * 22,
    };
  });

  const vehicles: AdminVehicle[] = Array.from({ length: safeVehicleCount }, (_, index) => {
    const dock = docks[index % Math.max(docks.length, 1)];
    const battery = Math.max(35, 98 - index * 4);
    return {
      id: `${name.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
      type: resolvedTypes[index % resolvedTypes.length],
      hardwareMac: `A4:C1:38:${String(index + 1).padStart(2, '0')}:QP:${String(index + 11).padStart(2, '0')}`,
      dockId: dock?.id ?? '',
      location: dock?.name ?? 'Unassigned',
      status: 'available',
      battery,
      lastRide: 'Never',
      totalRides: 0,
      condition: getVehicleCondition(battery),
    };
  });

  return {
    id,
    name,
    city: input.city?.trim() || 'Campus City',
    mapAssetName: input.mapAssetName,
    mapPreviewDataUrl: input.mapPreviewDataUrl,
    revenue: 0,
    activeRides: 0,
    completedRides: 0,
    vehicleTypes: resolvedTypes,
    docks: recalculateDockOccupancy(docks, vehicles),
    vehicles,
    rideHistory: [],
    issueReports: [],
    users: [],
    pricing: parsePricingStructure(input.pricingStructure ?? defaultPricing.pricingStructure),
    fareRules: defaultFareRules.map((rule) => ({ ...rule, id: `${id}-${rule.id}` })),
  };
};

export const createInitialInstitutes = (): InstituteData[] => {
  const delhiDocks: AdminDock[] = [
    { id: 'iit-delhi-dock-1', name: 'Main Gate Dock', location: 'Main Gate', campus: 'IIT Delhi', spots: 12, occupied: 0, status: 'available' },
    { id: 'iit-delhi-dock-2', name: 'Library Dock', location: 'Central Library', campus: 'IIT Delhi', spots: 8, occupied: 0, status: 'available' },
    { id: 'iit-delhi-dock-3', name: 'Sports Complex Dock', location: 'Sports Area', campus: 'IIT Delhi', spots: 10, occupied: 0, status: 'available' },
    { id: 'iit-delhi-dock-4', name: 'Hostel A Dock', location: 'Hostel Area', campus: 'IIT Delhi', spots: 6, occupied: 0, status: 'available' },
  ];

  const delhiVehicles: AdminVehicle[] = [
    { id: 'QP-2847', status: 'in-ride', battery: 85, dockId: delhiDocks[0].id, location: delhiDocks[0].name, lastRide: '2 min ago', totalRides: 234, condition: 'good', type: 'Bicycle' },
    { id: 'QP-2846', status: 'available', battery: 92, dockId: delhiDocks[1].id, location: delhiDocks[1].name, lastRide: '15 min ago', totalRides: 189, condition: 'good', type: 'Bicycle' },
    { id: 'QP-2845', status: 'user-locked', battery: 78, dockId: delhiDocks[2].id, location: delhiDocks[2].name, lastRide: '1 hour ago', totalRides: 312, condition: 'good', type: 'Bicycle' },
    { id: 'QP-2844', status: 'maintenance', battery: 45, dockId: delhiDocks[0].id, location: delhiDocks[0].name, lastRide: '1 day ago', totalRides: 567, condition: 'needs-repair', type: 'E-Bike' },
    { id: 'QP-2843', status: 'available', battery: 15, dockId: delhiDocks[3].id, location: delhiDocks[3].name, lastRide: '30 min ago', totalRides: 423, condition: 'low-battery', type: 'Bicycle' },
  ];

  const delhiUsers: AdminUser[] = [
    { id: 'u-delhi-1', name: 'Rahul Sharma', email: 'rahul.sharma@university.edu', phone: '+91 98765 43210', role: 'verified', walletBalance: 250, totalRides: 12, memberSince: 'June 2026', institute: 'IIT Delhi', avatar: 'R' },
    { id: 'u-delhi-2', name: 'Priya Patel', email: 'priya.patel@university.edu', phone: '+91 98765 43211', role: 'verified', walletBalance: 180, totalRides: 23, memberSince: 'May 2026', institute: 'IIT Delhi', avatar: 'P' },
    { id: 'u-delhi-3', name: 'Amit Kumar', email: 'amit.kumar@gmail.com', phone: '+91 98765 43212', role: 'guest', walletBalance: 50, totalRides: 5, memberSince: 'June 2026', institute: 'IIT Delhi', avatar: 'A' },
    { id: 'u-delhi-4', name: 'Sneha Gupta', email: 'sneha.gupta@university.edu', phone: '+91 98765 43213', role: 'verified', walletBalance: 420, totalRides: 45, memberSince: 'April 2026', institute: 'IIT Delhi', avatar: 'S' },
    { id: 'u-delhi-5', name: 'Karan Mehta', email: 'karan.mehta@university.edu', phone: '+91 98765 43214', role: 'admin', walletBalance: 1000, totalRides: 128, memberSince: 'March 2026', institute: 'IIT Delhi', avatar: 'K' },
    { id: 'u-delhi-6', name: 'Ritu Singh', email: 'ritu.singh@gmail.com', phone: '+91 98765 43215', role: 'blocked', walletBalance: 0, totalRides: 3, memberSince: 'June 2026', institute: 'IIT Delhi', avatar: 'R' },
  ];

  const delhiVehiclesMapped = delhiVehicles.map((vehicle, index) => ({
    ...vehicle,
    type: vehicle.type === 'E-Bike' ? 'E_BIKE' : 'BICYCLE',
    hardwareMac: `D8:3A:DD:${String(index + 1).padStart(2, '0')}:QP:${String(index + 21).padStart(2, '0')}`,
  }));

  const delhiRideHistory = createSeedRideHistory({
    instituteId: 'iit-delhi',
    docks: delhiDocks,
    vehicles: delhiVehiclesMapped,
    users: delhiUsers,
    targetRevenue: 500,
  });

  const bombayDocks: AdminDock[] = [
    { id: 'iit-bombay-dock-1', name: 'Powai Gate Dock', location: 'Powai Gate', campus: 'IIT Bombay', spots: 14, occupied: 0, status: 'available' },
    { id: 'iit-bombay-dock-2', name: 'Lecture Hall Dock', location: 'Lecture Hall Complex', campus: 'IIT Bombay', spots: 10, occupied: 0, status: 'available' },
    { id: 'iit-bombay-dock-3', name: 'Hostel 12 Dock', location: 'Hostel 12', campus: 'IIT Bombay', spots: 9, occupied: 0, status: 'available' },
  ];

  const bombayVehicles: AdminVehicle[] = [
    { id: 'QB-1001', status: 'available', battery: 94, dockId: bombayDocks[0].id, location: bombayDocks[0].name, lastRide: '8 min ago', totalRides: 143, condition: 'good', type: 'Bicycle' },
    { id: 'QB-1002', status: 'available', battery: 68, dockId: bombayDocks[1].id, location: bombayDocks[1].name, lastRide: '21 min ago', totalRides: 118, condition: 'good', type: 'E-Scooter' },
    { id: 'QB-1003', status: 'in-ride', battery: 55, dockId: bombayDocks[2].id, location: bombayDocks[2].name, lastRide: 'Now', totalRides: 87, condition: 'good', type: 'Bicycle' },
  ];

  const bombayUsers: AdminUser[] = [
    { id: 'u-bombay-1', name: 'Neha Mehta', email: 'neha.mehta@university.edu', phone: '+91 98765 44210', role: 'verified', walletBalance: 310, totalRides: 18, memberSince: 'May 2026', institute: 'IIT Bombay', avatar: 'N' },
    { id: 'u-bombay-2', name: 'Arjun Rao', email: 'arjun.rao@university.edu', phone: '+91 98765 44211', role: 'verified', walletBalance: 140, totalRides: 9, memberSince: 'June 2026', institute: 'IIT Bombay', avatar: 'A' },
  ];

  const bombayVehiclesMapped = bombayVehicles.map((vehicle, index) => ({
    ...vehicle,
    type: vehicle.type === 'E-Scooter' ? 'E_BIKE' : 'BICYCLE',
    hardwareMac: `B0:22:BY:${String(index + 1).padStart(2, '0')}:QP:${String(index + 41).padStart(2, '0')}`,
  }));

  const bombayRideHistory = createSeedRideHistory({
    instituteId: 'iit-bombay',
    docks: bombayDocks,
    vehicles: bombayVehiclesMapped,
    users: bombayUsers,
    targetRevenue: 250,
  });

  return [
    {
      id: 'iit-delhi',
      name: 'IIT Delhi',
      city: 'New Delhi',
      mapAssetName: 'iit-delhi-campus-map.svg',
      revenue: getInstituteRevenue({ rideHistory: delhiRideHistory }),
      activeRides: delhiRideHistory.filter((ride) => ride.status === 'active').length,
      completedRides: getCompletedRides(delhiRideHistory).length,
      vehicleTypes: ['BICYCLE', 'E_BIKE'],
      docks: recalculateDockOccupancy(
        delhiDocks.map((dock, index) => ({
          ...dock,
          latitude: 28.545 + index * 0.0011,
          longitude: 77.1926 + index * 0.0013,
          strictRadius: 20,
          softBuffer: 15,
          optimumCapacity: dock.spots,
          rebalanceThreshold: 5,
          isActive: true,
          mapX: [34, 54, 68, 26][index] ?? 35,
          mapY: [58, 42, 68, 34][index] ?? 45,
        })),
        delhiVehicles
      ),
      vehicles: delhiVehiclesMapped,
      rideHistory: delhiRideHistory,
      issueReports: [],
      users: delhiUsers,
      pricing: { ...defaultPricing },
      fareRules: defaultFareRules.map((rule) => ({ ...rule, id: `iit-delhi-${rule.id}` })),
    },
    {
      id: 'iit-bombay',
      name: 'IIT Bombay',
      city: 'Mumbai',
      mapAssetName: 'iit-bombay-campus-map.svg',
      revenue: getInstituteRevenue({ rideHistory: bombayRideHistory }),
      activeRides: bombayRideHistory.filter((ride) => ride.status === 'active').length,
      completedRides: getCompletedRides(bombayRideHistory).length,
      vehicleTypes: ['BICYCLE', 'E_BIKE'],
      docks: recalculateDockOccupancy(
        bombayDocks.map((dock, index) => ({
          ...dock,
          latitude: 19.1334 + index * 0.001,
          longitude: 72.9133 + index * 0.0012,
          strictRadius: 20,
          softBuffer: 15,
          optimumCapacity: dock.spots,
          rebalanceThreshold: 5,
          isActive: true,
          mapX: [31, 58, 72][index] ?? 38,
          mapY: [48, 39, 62][index] ?? 46,
        })),
        bombayVehicles
      ),
      vehicles: bombayVehiclesMapped,
      rideHistory: bombayRideHistory,
      issueReports: [],
      users: bombayUsers,
      pricing: { ...defaultPricing },
      fareRules: defaultFareRules.map((rule) => ({ ...rule, id: `iit-bombay-${rule.id}` })),
    },
  ];
};

export { getInstituteAnalytics, buildWeeklyChart, formatTrendLabel, INITIAL_TARGET_REVENUE } from './admin-analytics';
export type { InstituteAnalytics } from './admin-analytics';
