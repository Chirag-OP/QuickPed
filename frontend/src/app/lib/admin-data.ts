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
