import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Battery,
  Bike,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  recalculateDockOccupancy,
  type AdminVehicle,
  type InstituteData,
  type VehicleStatus,
} from '../lib/admin-data';
interface FleetManagementProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}
const statusFilters: Array<'all' | VehicleStatus> = ['all', 'available', 'in-ride', 'user-locked', 'maintenance'];
const getStatusClass = (status: VehicleStatus) => {
  switch (status) {
    case 'available':
      return 'bg-success/10 text-success';
    case 'in-ride':
      return 'bg-info/10 text-info';
    case 'user-locked':
      return 'bg-warning/10 text-warning';
    case 'maintenance':
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
const getBatteryColor = (battery: number) => {
  if (battery > 60) return 'text-success';
  if (battery >= 30) return 'text-warning';
  return 'text-danger';
};
export const FleetManagement: React.FC<FleetManagementProps> = ({ institute, onUpdateInstitute }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState(institute.vehicleTypes[0] ?? 'Bicycle');
  const [vehicleDockId, setVehicleDockId] = useState(institute.docks[0]?.id ?? '');
  const filteredVehicles = useMemo(
    () =>
      institute.vehicles.filter((vehicle) => {
        const matchesSearch =
          vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [institute.vehicles, searchQuery, statusFilter]
  );
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDock = institute.docks.find((dock) => dock.id === vehicleDockId);
    if (!vehicleNumber.trim() || !vehicleType.trim() || !assignedDock) return;
    const newVehicle: AdminVehicle = {
      id: vehicleNumber.trim().toUpperCase(),
      status: 'available',
      battery: 100,
      dockId: assignedDock.id,
      location: assignedDock.name,
      lastRide: 'Never',
      totalRides: 0,
      condition: 'good',
      type: vehicleType.trim(),
    };
    onUpdateInstitute((current) => {
      const vehiclesNext = [newVehicle, ...current.vehicles];
      return {
        ...current,
        vehicleTypes: Array.from(new Set([...current.vehicleTypes, newVehicle.type])),
        vehicles: vehiclesNext,
        docks: recalculateDockOccupancy(current.docks, vehiclesNext),
      };
    });
    setVehicleNumber('');
    setVehicleType(institute.vehicleTypes[0] ?? 'Bicycle');
    setVehicleDockId(institute.docks[0]?.id ?? '');
    setShowAddForm(false);
    showSuccess(`${newVehicle.id} added to ${assignedDock.name}.`);
  };
  const handleRemoveVehicle = (vehicle: AdminVehicle) => {
    onUpdateInstitute((current) => {
      const vehiclesNext = current.vehicles.filter((item) => item.id !== vehicle.id);
      return {
        ...current,
        vehicles: vehiclesNext,
        docks: recalculateDockOccupancy(current.docks, vehiclesNext),
      };
    });
    showSuccess(`${vehicle.id} removed from ${institute.name}.`);
  };
  return (
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
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddForm(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bike size={20} className="text-primary" /> Add Fleet Vehicle
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Number</label>
                  <Input
                    placeholder="e.g. QP-2850"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <Input
                    list="vehicle-types"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                  <datalist id="vehicle-types">
                    {institute.vehicleTypes.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Which Dock to Assign Vehicle To</label>
                  <select
                    value={vehicleDockId}
                    onChange={(e) => setVehicleDockId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select a dock...</option>
                    {institute.docks.map((dock) => (
                      <option key={dock.id} value={dock.id}>{dock.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={!vehicleDockId || !vehicleNumber.trim()}>
                    <Plus size={16} className="mr-1" /> Add Vehicle
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bike className="text-primary" size={32} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">{institute.name} vehicles ({institute.vehicles.length} total)</p>
          </div>
          <Button size="sm" className="rounded-full" onClick={() => setShowAddForm(true)}>
            <Plus size={16} className="mr-1" /> Add Fleet
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search vehicles by ID, type, or dock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button variant="outline" size="lg" className="rounded-xl">
            <Filter size={20} />
          </Button>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status === 'all' ? 'All' : status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bike size={40} className="mx-auto mb-3 opacity-40" />
            <p>No vehicles match your search.</p>
          </div>
        )}
        {filteredVehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="elevated" className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Bike className="text-primary" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{vehicle.id}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{vehicle.type}</p>
                      <Badge className={getStatusClass(vehicle.status)}>
                        {vehicle.status.replace(/-/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <div className={`flex items-center gap-2 justify-end mb-2 ${getBatteryColor(vehicle.battery)}`}>
                        <Battery size={24} />
                        <span className="text-2xl font-bold">{vehicle.battery}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{vehicle.totalRides} rides</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveVehicle(vehicle)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-foreground" size={16} />
                    <span>{vehicle.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-muted-foreground" size={16} />
                    <span>Last ride: {vehicle.lastRide}</span>
                  </div>
                </div>
                {vehicle.condition !== 'good' && (
                  <div className="mt-4 p-3 bg-warning/10 border-l-4 border-warning rounded-lg">
                    <p className="text-sm font-medium text-warning">
                      {vehicle.condition === 'low-battery' ? 'Low battery - needs charging' : 'Requires maintenance'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
