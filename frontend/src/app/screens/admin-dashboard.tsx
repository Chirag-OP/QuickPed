
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bike,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  MapPin,
  PlusCircle,
  Radio,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatCurrency, formatDate, formatDuration } from '../lib/utils';
import type { AdminKey } from './login-screen';
import {
  createInstituteFromInput,
  getCompletedRides,
  getInstituteRevenue,
  getRevenueMetrics,
  recalculateDockOccupancy,
  type AdminDock,
  type AdminPricing,
  type AdminVehicle,
  type InstituteData,
} from '../lib/admin-data';
import { downloadInstituteReport, type ReportFormat } from '../lib/report-export';

const rideTrends = [
  { label: '6 AM', value: 24 },
  { label: '9 AM', value: 40 },
  { label: '12 PM', value: 52 },
  { label: '3 PM', value: 68 },
  { label: '6 PM', value: 78 },
  { label: '9 PM', value: 48 },
];

const WELCOME_NAMES: Record<AdminKey, string> = {
  parth: 'Parth Bansal',
  chirag: 'Chirag',
  arshpreet: 'Arshpreet',
};

type ActivePanel =
  | 'none'
  | 'operations'
  | 'analytics'
  | 'reports'
  | 'livefeed'
  | 'add-dock'
  | 'add-fleet'
  | 'edit-pricing'
  | 'add-institute'
  | 'manage-vehicles';

interface AdminDashboardProps {
  adminKey?: AdminKey;
  institutes: InstituteData[];
  selectedInstitute: InstituteData | null;
  selectedInstituteId: string | null;
  onSelectInstitute: (instituteId: string) => void;
  onAddInstitute: (institute: InstituteData) => void;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
  onNavigate?: (screen: 'user-management' | 'fleet-management' | 'docks' | 'pricing' | 'revenue') => void;
}

const statusClass: Record<string, string> = {
  active: 'bg-success/10 text-success',
  available: 'bg-info/10 text-info',
  full: 'bg-danger/10 text-danger',
  'in-ride': 'bg-info/10 text-info',
  'user-locked': 'bg-warning/10 text-warning',
  maintenance: 'bg-danger/10 text-danger',
};

const panelTitles: Record<ActivePanel, string> = {
  none: '',
  operations: 'Operations',
  analytics: 'Analytics Overview',
  reports: 'Explore Reports',
  livefeed: 'Live Feed',
  'add-dock': 'Add New Dock',
  'add-fleet': 'Add Fleet Vehicle',
  'edit-pricing': 'Edit Pricing Plan',
  'add-institute': 'Add Institute',
  'manage-vehicles': 'Manage Vehicles',
};

const createDockId = (institute: InstituteData) => `${institute.id}-dock-${Date.now().toString(36)}`;

const getVehicleCondition = (battery: number) => (battery < 30 ? 'low-battery' : 'good');

const updatePricingField = (pricing: AdminPricing, field: keyof AdminPricing, value: string) => {
  if (field === 'pricingStructure') {
    return { ...pricing, pricingStructure: value };
  }
  return { ...pricing, [field]: Number(value) || 0 };
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminKey = 'parth',
  institutes,
  selectedInstitute,
  selectedInstituteId,
  onSelectInstitute,
  onAddInstitute,
  onUpdateInstitute,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [successMsg, setSuccessMsg] = useState('');
  const [reportOptionsOpen, setReportOptionsOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState('');

  const [dockName, setDockName] = useState('');
  const [dockLocation, setDockLocation] = useState('');
  const [dockCampus, setDockCampus] = useState('');

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Bicycle');
  const [vehicleDockId, setVehicleDockId] = useState('');
  const [pricingSaved, setPricingSaved] = useState(false);

  const [instituteName, setInstituteName] = useState('');
  const [instituteDockCount, setInstituteDockCount] = useState('3');
  const [instituteVehicleCount, setInstituteVehicleCount] = useState('10');
  const [instituteVehicleTypes, setInstituteVehicleTypes] = useState('Bicycle, E-Bike');
  const [institutePricingStructure, setInstitutePricingStructure] = useState('Standard: base 0, per minute 2, reservation 5');
  const [instituteDockLocations, setInstituteDockLocations] = useState('Main Gate, Library, Hostel Area');

  const welcomeName = WELCOME_NAMES[adminKey];
  const docks = selectedInstitute?.docks ?? [];
  const vehicles = selectedInstitute?.vehicles ?? [];
  const rideHistory = selectedInstitute?.rideHistory ?? [];
  const issueReports = selectedInstitute?.issueReports ?? [];
  const pricing = selectedInstitute?.pricing;
  const completedRideHistory = getCompletedRides(rideHistory);
  const revenueMetrics = selectedInstitute ? getRevenueMetrics(selectedInstitute) : { daily: 0, weekly: 0, monthly: 0, total: 0 };

  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'available').length;
  const completedRides = completedRideHistory.length;
  const activeRides = rideHistory.filter((ride) => ride.status === 'active').length;

  const filteredRides = useMemo(
    () =>
      completedRideHistory.filter(
        (ride) =>
          ride.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ride.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ride.vehicleId.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [completedRideHistory, searchQuery]
  );

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 500);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!vehicleDockId && docks[0]) {
      setVehicleDockId(docks[0].id);
    }
  }, [docks, vehicleDockId]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  };

  const handleAddDock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitute || !dockName.trim() || !dockLocation.trim() || !dockCampus.trim()) return;

    const newDock: AdminDock = {
      id: createDockId(selectedInstitute),
      name: dockName.trim(),
      location: dockLocation.trim(),
      campus: dockCampus.trim(),
      spots: 10,
      occupied: 0,
      status: 'available',
    };

    onUpdateInstitute((institute) => ({ ...institute, docks: [...institute.docks, newDock] }));
    setDockName('');
    setDockLocation('');
    setDockCampus('');
    setVehicleDockId(newDock.id);
    showSuccess(`Dock "${newDock.name}" created for ${newDock.campus}.`);
    setActivePanel('none');
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitute || !vehicleNumber.trim() || !vehicleType.trim() || !vehicleDockId) return;

    const assignedDock = selectedInstitute.docks.find((dock) => dock.id === vehicleDockId);
    if (!assignedDock) return;

    const newVehicle: AdminVehicle = {
      id: vehicleNumber.trim().toUpperCase(),
      type: vehicleType.trim(),
      dockId: assignedDock.id,
      location: assignedDock.name,
      status: 'available',
      battery: 100,
      lastRide: 'Never',
      totalRides: 0,
      condition: 'good',
    };

    onUpdateInstitute((institute) => {
      const vehiclesNext = [newVehicle, ...institute.vehicles];
      return {
        ...institute,
        vehicleTypes: Array.from(new Set([...institute.vehicleTypes, newVehicle.type])),
        vehicles: vehiclesNext,
        docks: recalculateDockOccupancy(institute.docks, vehiclesNext),
      };
    });

    setVehicleNumber('');
    setVehicleType('Bicycle');
    showSuccess(`${newVehicle.id} added to ${assignedDock.name}.`);
    setActivePanel('none');
  };

  const handlePricingChange = (field: keyof AdminPricing, value: string) => {
    if (!selectedInstitute) return;
    onUpdateInstitute((institute) => ({
      ...institute,
      pricing: updatePricingField(institute.pricing, field, value),
    }));
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSaved(true);
    showSuccess('Pricing updated for this institute.');
    window.setTimeout(() => setPricingSaved(false), 2000);
    setActivePanel('none');
  };

  const handleAddInstitute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteName.trim()) return;

    const newInstitute = createInstituteFromInput({
      name: instituteName,
      dockCount: Number(instituteDockCount),
      vehicleCount: Number(instituteVehicleCount),
      vehicleTypes: instituteVehicleTypes,
      pricingStructure: institutePricingStructure,
      dockLocations: instituteDockLocations,
    });

    onAddInstitute(newInstitute);
    setInstituteName('');
    setInstituteDockCount('3');
    setInstituteVehicleCount('10');
    setInstituteVehicleTypes('Bicycle, E-Bike');
    setInstitutePricingStructure('Standard: base 0, per minute 2, reservation 5');
    setInstituteDockLocations('Main Gate, Library, Hostel Area');
    showSuccess(`Institute "${newInstitute.name}" created.`);
    setActivePanel('none');
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    if (!selectedInstitute) return;
    onUpdateInstitute((institute) => {
      const vehiclesNext = institute.vehicles.filter((vehicle) => vehicle.id !== vehicleId);
      return {
        ...institute,
        vehicles: vehiclesNext,
        docks: recalculateDockOccupancy(institute.docks, vehiclesNext),
      };
    });
    showSuccess(`${vehicleId} removed from ${selectedInstitute.name}.`);
  };

  const handleDownloadReport = (format: ReportFormat) => {
    if (!selectedInstitute) return;
    const message = downloadInstituteReport(selectedInstitute, format);
    setReportStatus(message);
    showSuccess(message);
  };

  const renderAddInstituteForm = () => (
    <form onSubmit={handleAddInstitute} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Institute Name</label>
        <Input
          placeholder="e.g. IIT Ropar"
          value={instituteName}
          onChange={(e) => setInstituteName(e.target.value)}
          className="h-12 rounded-xl"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Docks</label>
          <Input
            type="number"
            min="1"
            value={instituteDockCount}
            onChange={(e) => setInstituteDockCount(e.target.value)}
            className="h-12 rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Vehicles</label>
          <Input
            type="number"
            min="0"
            value={instituteVehicleCount}
            onChange={(e) => setInstituteVehicleCount(e.target.value)}
            className="h-12 rounded-xl"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Vehicle Types</label>
        <Input
          placeholder="Bicycle, E-Bike, E-Scooter"
          value={instituteVehicleTypes}
          onChange={(e) => setInstituteVehicleTypes(e.target.value)}
          className="h-12 rounded-xl"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Pricing Structure</label>
        <Input
          placeholder="Standard: base 10, per minute 2, reservation 5"
          value={institutePricingStructure}
          onChange={(e) => setInstitutePricingStructure(e.target.value)}
          className="h-12 rounded-xl"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dock Locations</label>
        <textarea
          placeholder="Main Gate, Library, Hostel Area"
          value={instituteDockLocations}
          onChange={(e) => setInstituteDockLocations(e.target.value)}
          className="min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>
      <Button type="submit" className="w-full" size="lg">
        <Building2 size={18} className="mr-2" /> Add Institute
      </Button>
    </form>
  );

  const renderPanel = () => {
    if (activePanel === 'none') return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePanel('none');
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold">{panelTitles[activePanel]}</h2>
              <button
                type="button"
                onClick={() => setActivePanel('none')}
                className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {activePanel !== 'add-institute' && !selectedInstitute && (
                <div className="rounded-2xl bg-warning/10 p-4 text-sm text-warning">
                  Select an institute before using this control.
                </div>
              )}

              {activePanel === 'operations' && selectedInstitute && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Active Rides', value: activeRides, color: 'bg-success/10 text-success' },
                      { label: 'Docks Online', value: docks.length, color: 'bg-info/10 text-info' },
                      { label: 'Vehicles', value: vehicles.length, color: 'bg-primary/10 text-primary' },
                      { label: 'Available Vehicles', value: availableVehicles, color: 'bg-warning/10 text-warning' },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-2xl p-4 ${item.color}`}>
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-sm">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="font-semibold mb-2">Recent Ride Activity</p>
                    {rideHistory.slice(0, 4).map((ride) => (
                      <div key={ride.id} className="flex justify-between gap-3 py-2 border-b border-border last:border-0 text-sm">
                        <span>{ride.user} - {ride.vehicleId}</span>
                        <Badge className={ride.status === 'active' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}>
                          {ride.status}
                        </Badge>
                      </div>
                    ))}
                    {rideHistory.length === 0 && <p className="text-sm text-muted-foreground">No ride history yet.</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1" onClick={() => { setActivePanel('none'); onNavigate?.('fleet-management'); }}>
                      Go to Fleet
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setActivePanel('none'); onNavigate?.('docks'); }}>
                      View Docks
                    </Button>
                  </div>
                </div>
              )}

              {activePanel === 'analytics' && selectedInstitute && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {rideTrends.map((item) => (
                      <div key={item.label} className="rounded-2xl p-3 bg-muted text-center">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-xl font-bold text-primary">{item.value}k</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-40 rounded-2xl bg-muted/60 p-4 overflow-hidden relative">
                    {rideTrends.map((item, index) => (
                      <div
                        key={item.label}
                        className="absolute bottom-4 bg-primary rounded-t-2xl"
                        style={{ left: `${index * 14.5 + 2}%`, width: '9%', height: `${item.value}%` }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-success/10 p-4">
                      <p className="text-xs text-muted-foreground">Avg. Revenue / Day</p>
                      <p className="text-xl font-bold text-success">{formatCurrency(revenueMetrics.monthly / Math.max(new Date().getDate(), 1))}</p>
                    </div>
                    <div className="rounded-2xl bg-info/10 p-4">
                      <p className="text-xs text-muted-foreground">Completed Rides</p>
                      <p className="text-xl font-bold text-info">{completedRides}</p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => { setActivePanel('none'); onNavigate?.('revenue'); }}>
                    Full Analytics Report <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}

              {activePanel === 'reports' && selectedInstitute && (
                <div className="space-y-4">
                  {[
                    { title: 'Revenue Report', desc: `${formatCurrency(revenueMetrics.total)} total revenue`, icon: IndianRupee, nav: 'revenue' as const },
                    { title: 'Fleet Performance', desc: `${vehicles.length} vehicles across ${docks.length} docks`, icon: Bike, nav: 'fleet-management' as const },
                    { title: 'User Activity', desc: `${rideHistory.length} ride records`, icon: Users, nav: 'user-management' as const },
                  ].map(({ title, desc, icon: Icon, nav }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => { setActivePanel('none'); onNavigate?.(nav); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted hover:bg-muted/80 transition-colors text-left"
                    >
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </button>
                  ))}
                  <div className="rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">Generate Report</p>
                        <p className="text-sm text-muted-foreground">
                          Export revenue, ride history, users, vehicles, docks, and institute details.
                        </p>
                      </div>
                      <Button onClick={() => setReportOptionsOpen((open) => !open)}>
                        Generate Report
                      </Button>
                    </div>
                    {reportOptionsOpen && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {(['pdf', 'csv', 'excel'] as ReportFormat[]).map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            onClick={() => handleDownloadReport(format)}
                            className="uppercase"
                          >
                            {format === 'excel' ? 'Excel' : format.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    )}
                    {reportStatus && (
                      <Badge className="mt-3 bg-success/10 text-success">
                        {reportStatus}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {activePanel === 'livefeed' && selectedInstitute && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">Live updating</span>
                  </div>
                  {[...rideHistory.slice(0, 4), ...vehicles.slice(0, 2).map((vehicle) => ({
                    id: vehicle.id,
                    user: 'Fleet update',
                    vehicleId: vehicle.id,
                    startDock: vehicle.location,
                    endDock: vehicle.status,
                    fare: 0,
                    status: vehicle.status === 'in-ride' ? 'active' as const : 'completed' as const,
                    completedAt: vehicle.lastRide,
                  }))].map((item) => (
                    <div key={`${item.id}-${item.completedAt}`} className="rounded-2xl bg-muted p-4">
                      <p className="font-semibold">{item.user}</p>
                      <p className="text-sm text-muted-foreground">{item.vehicleId} - {item.startDock} - {item.completedAt}</p>
                    </div>
                  ))}
                </div>
              )}

              {activePanel === 'add-dock' && selectedInstitute && (
                <form onSubmit={handleAddDock} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dock Name</label>
                    <Input value={dockName} onChange={(e) => setDockName(e.target.value)} placeholder="e.g. Lecture Hall Dock" className="h-12 rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dock Location</label>
                    <Input value={dockLocation} onChange={(e) => setDockLocation(e.target.value)} placeholder="e.g. Lecture Hall Complex" className="h-12 rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campus / Institute</label>
                    <Input value={dockCampus} onChange={(e) => setDockCampus(e.target.value)} placeholder={selectedInstitute.name} className="h-12 rounded-xl" required />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <MapPin size={18} className="mr-2" /> Create Dock
                  </Button>
                </form>
              )}

              {activePanel === 'add-fleet' && selectedInstitute && (
                <form onSubmit={handleAddVehicle} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Number</label>
                    <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. QP-2850" className="h-12 rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle Type</label>
                    <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="Bicycle, E-Bike, E-Scooter" className="h-12 rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign to Dock</label>
                    <select
                      value={vehicleDockId}
                      onChange={(e) => setVehicleDockId(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      {docks.map((dock) => (
                        <option key={dock.id} value={dock.id}>{dock.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={!docks.length}>
                    <Bike size={18} className="mr-2" /> Add Vehicle
                  </Button>
                </form>
              )}

              {activePanel === 'edit-pricing' && selectedInstitute && pricing && (
                <form onSubmit={handleSavePricing} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Base Fare</label>
                      <Input type="number" min="0" step="0.5" value={pricing.baseFare} onChange={(e) => handlePricingChange('baseFare', e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Per Minute Charge</label>
                      <Input type="number" min="0" step="0.5" value={pricing.perMinute} onChange={(e) => handlePricingChange('perMinute', e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reservation Charge</label>
                      <Input type="number" min="0" step="0.5" value={pricing.reservation} onChange={(e) => handlePricingChange('reservation', e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subscription Fee</label>
                      <Input type="number" min="0" value={pricing.subscription} onChange={(e) => handlePricingChange('subscription', e.target.value)} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount (%)</label>
                    <Input type="number" min="0" max="100" value={pricing.discount} onChange={(e) => handlePricingChange('discount', e.target.value)} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pricing Structure</label>
                    <Input value={pricing.pricingStructure} onChange={(e) => handlePricingChange('pricingStructure', e.target.value)} className="h-12 rounded-xl" />
                  </div>
                  <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4">
                    <p className="text-xs font-semibold text-primary mb-2">LIVE PREVIEW</p>
                    <p className="text-sm">Base: <strong>{formatCurrency(pricing.baseFare)}</strong> - Per min: <strong>{formatCurrency(pricing.perMinute)}</strong> - Reserve: <strong>{formatCurrency(pricing.reservation)}</strong></p>
                    <p className="text-sm mt-1">Sample 10-min ride: <strong>{formatCurrency(pricing.baseFare + pricing.perMinute * 10)}</strong></p>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    {pricingSaved ? <><CheckCircle2 size={18} className="mr-2" /> Saved</> : <><Settings size={18} className="mr-2" /> Save Pricing</>}
                  </Button>
                </form>
              )}

              {activePanel === 'add-institute' && (
                <div className="space-y-4">
                  {renderAddInstituteForm()}
                  {institutes.length > 0 && (
                    <div className="rounded-2xl bg-muted p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">AVAILABLE INSTITUTES ({institutes.length})</p>
                      {institutes.map((institute) => (
                        <button
                          key={institute.id}
                          type="button"
                          onClick={() => { onSelectInstitute(institute.id); setActivePanel('none'); }}
                          className="w-full flex items-center justify-between py-2 border-b border-border last:border-0 text-sm text-left"
                        >
                          <span>{institute.name}</span>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activePanel === 'manage-vehicles' && selectedInstitute && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Total vehicles: {vehicles.length}</p>
                    <Button size="sm" onClick={() => setActivePanel('add-fleet')}>
                      <PlusCircle size={14} className="mr-1" /> Add
                    </Button>
                  </div>
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><Bike size={16} className="text-primary" /></div>
                        <div>
                          <p className="font-semibold text-sm">{vehicle.id}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.type} - {vehicle.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusClass[vehicle.status]}>{vehicle.status}</Badge>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveVehicle(vehicle.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {vehicles.length === 0 && <p className="text-sm text-muted-foreground">No vehicles added yet.</p>}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-muted p-8 text-center shadow-lg">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-semibold">Loading Admin Dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">Preparing institute data and fleet controls.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-danger bg-muted p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-danger" />
          <h2 className="text-2xl font-semibold">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleRetry}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedInstitute) {
    return (
      <>
        {renderPanel()}
        <div className="min-h-screen bg-background p-6 pb-24">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <LayoutDashboard className="text-primary" size={36} />
                  <div>
                    <h1 className="text-3xl font-bold">Welcome {welcomeName}</h1>
                    <p className="text-muted-foreground">Which Institute&apos;s Data Would You Like To View?</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setActivePanel('add-institute')} className="rounded-full">
                <Building2 size={18} className="mr-2" /> Add Institute
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {institutes.map((institute) => (
                <button
                  key={institute.id}
                  type="button"
                  onClick={() => onSelectInstitute(institute.id)}
                  className="rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold">{institute.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {institute.docks.length} docks - {institute.vehicles.length} vehicles - {institute.issueReports.length} issues - {formatCurrency(getInstituteRevenue(institute))}
                      </p>
                    </div>
                    <ChevronRight className="text-primary" size={22} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const summaryCards = [
    { label: 'Daily Revenue', value: formatCurrency(revenueMetrics.daily), Icon: IndianRupee, color: 'text-primary' },
    { label: 'Weekly Revenue', value: formatCurrency(revenueMetrics.weekly), Icon: IndianRupee, color: 'text-primary' },
    { label: 'Monthly Revenue', value: formatCurrency(revenueMetrics.monthly), Icon: IndianRupee, color: 'text-primary' },
    { label: 'Total Revenue', value: formatCurrency(revenueMetrics.total), Icon: IndianRupee, color: 'text-primary' },
    { label: 'Total Vehicles', value: String(vehicles.length), Icon: Bike, color: 'text-info' },
    { label: 'Total Docks', value: String(docks.length), Icon: MapPin, color: 'text-success' },
    { label: 'Active Rides', value: String(activeRides), Icon: Activity, color: 'text-warning' },
    { label: 'Completed Rides', value: String(completedRides), Icon: CheckCircle2, color: 'text-success' },
    { label: 'Available Vehicles', value: String(availableVehicles), Icon: Wrench, color: 'text-primary' },
  ];

  return (
    <>
      {renderPanel()}

      <div className="min-h-screen bg-background p-6 pb-24">
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-success text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-semibold"
            >
              <CheckCircle2 size={16} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <LayoutDashboard className="text-primary" size={36} />
              <div>
                <h1 className="text-3xl font-bold">Welcome {welcomeName}</h1>
                <p className="text-muted-foreground">{selectedInstitute.name} command center.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedInstituteId ?? ''}
                onChange={(e) => onSelectInstitute(e.target.value)}
                className="h-9 rounded-full border border-border bg-background px-3 text-sm"
              >
                {institutes.map((institute) => (
                  <option key={institute.id} value={institute.id}>{institute.name}</option>
                ))}
              </select>
              <Badge className="cursor-pointer bg-secondary text-secondary-foreground" onClick={() => setActivePanel('livefeed')}>Live Feed</Badge>
              <Badge className="cursor-pointer bg-success/10 text-success" onClick={() => setActivePanel('operations')}>Operations</Badge>
              <Badge className="cursor-pointer bg-info/10 text-info" onClick={() => setActivePanel('analytics')}>Analytics</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full px-5 py-3" onClick={() => setActivePanel('reports')}>
              <ArrowRight size={18} /> Explore Reports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {summaryCards.map(({ label, value, Icon, color }) => (
            <Card key={label} variant="elevated" className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>
                  </div>
                  <Icon className={color} size={32} />
                </div>
                <div className="flex items-center gap-2 text-success text-sm">
                  <TrendingUp size={16} /> Current institute only
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card variant="elevated" className="border border-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Add Dock', icon: MapPin, panel: 'add-dock' as ActivePanel, color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
                { label: 'Add Fleet', icon: Bike, panel: 'add-fleet' as ActivePanel, color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
                { label: 'Edit Pricing', icon: IndianRupee, panel: 'edit-pricing' as ActivePanel, color: 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20' },
                { label: 'Add Institute', icon: Building2, panel: 'add-institute' as ActivePanel, color: 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20' },
                { label: 'View Reports', icon: FileText, panel: 'reports' as ActivePanel, color: 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20' },
                { label: 'View Analytics', icon: BarChart3, panel: 'analytics' as ActivePanel, color: 'bg-pink-500/10 text-pink-700 hover:bg-pink-500/20' },
                { label: 'Manage Vehicles', icon: Wrench, panel: 'manage-vehicles' as ActivePanel, color: 'bg-teal-500/10 text-teal-700 hover:bg-teal-500/20' },
                { label: 'Live Feed', icon: Radio, panel: 'livefeed' as ActivePanel, color: 'bg-red-500/10 text-red-700 hover:bg-red-500/20' },
              ].map(({ label, icon: Icon, panel, color }) => (
                <motion.button
                  key={label}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActivePanel(panel)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${color}`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <Card variant="elevated" className="xl:col-span-2 border border-border">
            <CardHeader>
              <CardTitle>Operational Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {rideTrends.map((item) => (
                  <div key={item.label} className="rounded-3xl p-4 bg-muted/70">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-bold">{item.value}k</p>
                  </div>
                ))}
              </div>

              <div className="h-52 rounded-[32px] bg-muted/60 p-5 overflow-hidden">
                <div className="relative h-full">
                  {rideTrends.map((item, index) => (
                    <div
                      key={item.label}
                      className="absolute bottom-0 bg-primary rounded-t-3xl"
                      style={{ left: `${index * 14.5}%`, width: '9%', height: `${item.value}%` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="border border-border">
            <CardHeader>
              <CardTitle>Institute Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Add Dock', panel: 'add-dock' as ActivePanel, Icon: MapPin },
                { label: 'Add Vehicle', panel: 'add-fleet' as ActivePanel, Icon: Bike },
                { label: 'Edit Pricing', panel: 'edit-pricing' as ActivePanel, Icon: IndianRupee },
                { label: 'View Reports', panel: 'reports' as ActivePanel, Icon: FileText },
                { label: 'View Analytics', panel: 'analytics' as ActivePanel, Icon: BarChart3 },
              ].map(({ label, panel, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActivePanel(panel)}
                  className="w-full flex items-center justify-between rounded-2xl bg-muted p-4 text-left hover:bg-muted/80"
                >
                  <span className="flex items-center gap-3 font-medium"><Icon size={18} className="text-primary" /> {label}</span>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate?.('docks')}
                className="w-full flex items-center justify-between rounded-2xl bg-muted p-4 text-left hover:bg-muted/80"
              >
                <span className="flex items-center gap-3 font-medium"><Eye size={18} className="text-primary" /> Edit or Remove Docks</span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card variant="elevated" className="border border-border">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>Ride History</CardTitle>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rides..."
                  className="h-10 rounded-xl md:max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRides.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between gap-3 rounded-2xl bg-muted p-4">
                  <div>
                    <p className="font-semibold">{ride.id} - {ride.user}</p>
                    <p className="text-sm text-muted-foreground">{ride.vehicleId} - {ride.startDock} to {ride.endDock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(ride.fare)}</p>
                    <Badge className={ride.status === 'active' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}>{ride.status}</Badge>
                  </div>
                </div>
              ))}
              {filteredRides.length === 0 && <p className="text-sm text-muted-foreground">No rides match your search.</p>}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card variant="elevated" className="border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Pricing</CardTitle>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setActivePanel('edit-pricing')}>
                    <Settings size={14} className="mr-1" /> Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pricing && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Base Fare', value: formatCurrency(pricing.baseFare) },
                      { label: 'Per Minute', value: formatCurrency(pricing.perMinute) },
                      { label: 'Reservation', value: formatCurrency(pricing.reservation) },
                      { label: 'Subscription', value: `${formatCurrency(pricing.subscription)}/mo` },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-2xl bg-muted p-4">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-xl font-bold text-primary">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="elevated" className="border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Issue Reports</CardTitle>
                  <Badge className={issueReports.length ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}>
                    {issueReports.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {issueReports.map((issue) => (
                  <div key={issue.id} className="rounded-2xl bg-muted p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{issue.issueLabel}</p>
                        <p className="text-sm text-muted-foreground">
                          {issue.vehicleId}{issue.rideId ? ` - Ride ${issue.rideId}` : ''}
                        </p>
                      </div>
                      <Badge className="bg-warning/10 text-warning">{issue.issueType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {issue.description || 'No additional details provided.'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{issue.user}{issue.userPhone ? ` - ${issue.userPhone}` : ''}</span>
                      <span>{formatDate(issue.reportedAt)}</span>
                    </div>
                  </div>
                ))}
                {issueReports.length === 0 && (
                  <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    No issue reports for {selectedInstitute.name}.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};
