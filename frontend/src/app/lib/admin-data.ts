export type DockStatus = 'active' | 'available' | 'full';
export type VehicleStatus = 'available' | 'in-ride' | 'user-locked' | 'maintenance';
export type VehicleCondition = 'good' | 'low-battery' | 'needs-repair';

export interface AdminDock {
  id: string;
  name: string;
  location: string;
  campus: string;
  spots: number;
  occupied: number;
  status: DockStatus;
}

export interface AdminVehicle {
  id: string;
  type: string;
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
}

export interface NewInstituteInput {
  name: string;
  dockCount: number;
  vehicleCount: number;
  vehicleTypes: string;
  pricingStructure: string;
  dockLocations: string;
}

export const defaultPricing: AdminPricing = {
  baseFare: 0,
  perMinute: 2,
  reservation: 5,
  subscription: 299,
  discount: 10,
  pricingStructure: 'Standard: base 0, per minute 2, reservation 5',
};

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

export const createInstituteFromInput = (input: NewInstituteInput): InstituteData => {
  const name = input.name.trim();
  const id = `${makeId(name)}-${Date.now().toString(36)}`;
  const locations = splitList(input.dockLocations);
  const vehicleTypes = splitList(input.vehicleTypes);
  const safeDockCount = Math.max(1, input.dockCount || locations.length || 1);
  const safeVehicleCount = Math.max(0, input.vehicleCount || 0);
  const resolvedTypes = vehicleTypes.length ? vehicleTypes : ['Bicycle'];

  const docks: AdminDock[] = Array.from({ length: safeDockCount }, (_, index) => {
    const location = locations[index] || `Campus Zone ${index + 1}`;
    return {
      id: `${id}-dock-${index + 1}`,
      name: `${location} Dock`,
      location,
      campus: name,
      spots: Math.max(8, Math.ceil(safeVehicleCount / safeDockCount) + 4),
      occupied: 0,
      status: 'available',
    };
  });

  const vehicles: AdminVehicle[] = Array.from({ length: safeVehicleCount }, (_, index) => {
    const dock = docks[index % docks.length];
    const battery = Math.max(35, 98 - index * 4);
    return {
      id: `${name.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(4, '0')}`,
      type: resolvedTypes[index % resolvedTypes.length],
      dockId: dock.id,
      location: dock.name,
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
    revenue: 0,
    activeRides: 0,
    completedRides: 0,
    vehicleTypes: resolvedTypes,
    docks: recalculateDockOccupancy(docks, vehicles),
    vehicles,
    rideHistory: [],
    issueReports: [],
    users: [],
    pricing: parsePricingStructure(input.pricingStructure),
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

  const delhiRideHistory: RideHistoryRecord[] = [
    {
      id: 'R-4701',
      user: 'Amit Kumar',
      userPhone: '+91 98765 43212',
      vehicleId: 'QP-2846',
      startDock: 'Main Gate Dock',
      endDock: 'Library Dock',
      fare: calculateRideFare(17 * 60),
      duration: 17 * 60,
      distance: 2.3,
      bikeType: 'Bicycle',
      status: 'completed',
      startedAt: '2026-06-08T10:13:00+05:30',
      completedAt: '2026-06-08T10:30:00+05:30',
    },
    {
      id: 'R-4702',
      user: 'Rahul Sharma',
      userPhone: '+91 98765 43210',
      vehicleId: 'QP-2847',
      startDock: 'Hostel A Dock',
      endDock: 'Sports Complex Dock',
      fare: 0,
      duration: 14 * 60,
      distance: 2.8,
      bikeType: 'Bicycle',
      status: 'active',
      startedAt: '2026-06-08T11:32:00+05:30',
      completedAt: 'Live',
    },
    {
      id: 'R-4703',
      user: 'Priya Patel',
      userPhone: '+91 98765 43211',
      vehicleId: 'QP-2843',
      startDock: 'Library Dock',
      endDock: 'Main Gate Dock',
      fare: calculateRideFare(21 * 60),
      duration: 21 * 60,
      distance: 3.1,
      bikeType: 'Bicycle',
      status: 'completed',
      startedAt: '2026-06-08T11:24:00+05:30',
      completedAt: '2026-06-08T11:45:00+05:30',
    },
  ];

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

  const bombayRideHistory: RideHistoryRecord[] = [
    {
      id: 'B-2101',
      user: 'Neha Mehta',
      userPhone: '+91 98765 44210',
      vehicleId: 'QB-1001',
      startDock: 'Powai Gate Dock',
      endDock: 'Lecture Hall Dock',
      fare: calculateRideFare(11 * 60),
      duration: 11 * 60,
      distance: 1.9,
      bikeType: 'Bicycle',
      status: 'completed',
      startedAt: '2026-06-08T09:09:00+05:30',
      completedAt: '2026-06-08T09:20:00+05:30',
    },
    {
      id: 'B-2102',
      user: 'Arjun Rao',
      userPhone: '+91 98765 44211',
      vehicleId: 'QB-1003',
      startDock: 'Hostel 12 Dock',
      endDock: 'Powai Gate Dock',
      fare: 0,
      duration: 9 * 60,
      distance: 1.5,
      bikeType: 'Bicycle',
      status: 'active',
      startedAt: '2026-06-08T11:40:00+05:30',
      completedAt: 'Live',
    },
  ];

  return [
    {
      id: 'iit-delhi',
      name: 'IIT Delhi',
      revenue: getInstituteRevenue({ rideHistory: delhiRideHistory }),
      activeRides: delhiRideHistory.filter((ride) => ride.status === 'active').length,
      completedRides: getCompletedRides(delhiRideHistory).length,
      vehicleTypes: ['Bicycle', 'E-Bike', 'E-Scooter'],
      docks: recalculateDockOccupancy(delhiDocks, delhiVehicles),
      vehicles: delhiVehicles,
      rideHistory: delhiRideHistory,
      issueReports: [],
      users: delhiUsers,
      pricing: { ...defaultPricing },
    },
    {
      id: 'iit-bombay',
      name: 'IIT Bombay',
      revenue: getInstituteRevenue({ rideHistory: bombayRideHistory }),
      activeRides: bombayRideHistory.filter((ride) => ride.status === 'active').length,
      completedRides: getCompletedRides(bombayRideHistory).length,
      vehicleTypes: ['Bicycle', 'E-Scooter'],
      docks: recalculateDockOccupancy(bombayDocks, bombayVehicles),
      vehicles: bombayVehicles,
      rideHistory: bombayRideHistory,
      issueReports: [],
      users: bombayUsers,
      pricing: { ...defaultPricing },
    },
  ];
};
