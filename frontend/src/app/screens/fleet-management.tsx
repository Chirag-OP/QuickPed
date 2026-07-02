import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Battery,
  Bike,
  Eye,
  Edit2,
  Lock,
  Unlock,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Wrench,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  recalculateDockOccupancy,
  type AdminVehicle,
  type InstituteData,
  type VehicleStatus,
} from '../lib/admin-data';
import { adminToast, runWithFeedback } from '../lib/admin-feedback';
import { ConfirmDialog } from '../components/confirm-dialog';

interface FleetManagementProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}

const statusFilters: Array<'all' | VehicleStatus> = ['all', 'available', 'in-ride', 'maintenance'];
const vehicleTypes = ['BICYCLE', 'E_BIKE'];

const getStatusLabel = (status: VehicleStatus) => {
  if (status === 'in-ride') return 'In Use';
  if (status === 'maintenance') return 'Maintenance';
  if (status === 'user-locked') return 'Locked';
  return 'Available';
};

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

const normalizeType = (value: string) => {
  const upper = value.trim().toUpperCase().replace(/[-\s]+/g, '_');
  return upper === 'E_BIKE' || upper === 'EBIKE' ? 'E_BIKE' : 'BICYCLE';
};

const parseCsvRows = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map((line) => {
      const [displayTag, type, hardwareMac] = line.split(',').map((item) => item.trim());
      return { displayTag, type: normalizeType(type), hardwareMac };
    })
    .filter((row) => row.displayTag && row.hardwareMac);

export const FleetManagement: React.FC<FleetManagementProps> = ({ institute, onUpdateInstitute }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');
  const [displayTag, setDisplayTag] = useState('');
  const [vehicleType, setVehicleType] = useState('BICYCLE');
  const [hardwareMac, setHardwareMac] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState<AdminVehicle | null>(null);
  const [editVehicle, setEditVehicle] = useState<AdminVehicle | null>(null);
  const [assignVehicle, setAssignVehicle] = useState<AdminVehicle | null>(null);
  const [assignDockId, setAssignDockId] = useState('');
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<{
    valid: { displayTag: string; type: string; hardwareMac: string }[];
    invalid: number;
    duplicates: number;
  } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const filteredVehicles = useMemo(
    () =>
      institute.vehicles.filter((vehicle) => {
        const matchesSearch =
          vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicle.hardwareMac ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [institute.vehicles, searchQuery, statusFilter]
  );

  const showSuccess = (msg: string) => adminToast.success(msg);

  const updateVehicles = (updater: (vehicles: AdminVehicle[]) => AdminVehicle[]) => {
    onUpdateInstitute((current) => {
      const vehiclesNext = updater(current.vehicles);
      return {
        ...current,
        vehicles: vehiclesNext,
        docks: recalculateDockOccupancy(current.docks, vehiclesNext),
      };
    });
  };

  const buildVehicle = (tag: string, type: string, mac: string, indexOffset = 0): AdminVehicle => {
    const assignedDock = institute.docks[indexOffset % Math.max(institute.docks.length, 1)];
    return {
      id: tag.trim().toUpperCase(),
      status: 'available',
      battery: 100,
      dockId: assignedDock?.id ?? '',
      location: assignedDock?.name ?? 'Unassigned',
      lastRide: 'Never',
      totalRides: 0,
      condition: 'good',
      type,
      hardwareMac: mac.trim().toUpperCase(),
    };
  };

  const addVehicles = (vehiclesToAdd: AdminVehicle[]) => {
    onUpdateInstitute((current) => {
      const existingIds = new Set(current.vehicles.map((vehicle) => vehicle.id));
      const uniqueVehicles = vehiclesToAdd.filter((vehicle) => !existingIds.has(vehicle.id));
      const vehiclesNext = [...uniqueVehicles, ...current.vehicles];
      return {
        ...current,
        vehicleTypes: Array.from(new Set([...current.vehicleTypes, ...uniqueVehicles.map((vehicle) => vehicle.type)])),
        vehicles: vehiclesNext,
        docks: recalculateDockOccupancy(current.docks, vehiclesNext),
      };
    });
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayTag.trim() || !hardwareMac.trim()) {
      adminToast.error('Display tag and MAC address are required.');
      return;
    }
    if (institute.vehicles.some((v) => v.id === displayTag.trim().toUpperCase())) {
      adminToast.error('A vehicle with this display tag already exists.');
      return;
    }
    setSubmitting(true);
    const newVehicle = buildVehicle(displayTag, vehicleType, hardwareMac);
    await runWithFeedback(
      () => { addVehicles([newVehicle]); },
      { loading: 'Registering vehicle...', success: `${newVehicle.id} registered.` }
    );
    setDisplayTag('');
    setVehicleType('BICYCLE');
    setHardwareMac('');
    setSubmitting(false);
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const rows = parseCsvRows(await file.text());
    const existingIds = new Set(institute.vehicles.map((v) => v.id));
    const seen = new Set<string>();
    const valid: { displayTag: string; type: string; hardwareMac: string }[] = [];
    let invalid = 0;
    let duplicates = 0;
    rows.forEach((row) => {
      const tag = row.displayTag.toUpperCase();
      if (!row.hardwareMac || !tag) { invalid += 1; return; }
      if (existingIds.has(tag) || seen.has(tag)) { duplicates += 1; return; }
      seen.add(tag);
      valid.push(row);
    });
    setCsvPreview({ valid, invalid, duplicates });
    event.target.value = '';
  };

  const confirmCsvImport = async () => {
    if (!csvPreview?.valid.length) return;
    setSubmitting(true);
    const vehiclesToAdd = csvPreview.valid.map((row, index) =>
      buildVehicle(row.displayTag, row.type, row.hardwareMac, index)
    );
    await runWithFeedback(
      () => { addVehicles(vehiclesToAdd); },
      { loading: 'Importing vehicles...', success: `${vehiclesToAdd.length} vehicles imported.` }
    );
    setCsvPreview(null);
    setSubmitting(false);
  };

  const markForMaintenance = (vehicle: AdminVehicle) => {
    updateVehicles((vehicles) =>
      vehicles.map((item) =>
        item.id === vehicle.id ? { ...item, status: 'maintenance', condition: 'needs-repair' } : item
      )
    );
    showSuccess(`${vehicle.id} marked for maintenance.`);
  };

  const lockVehicle = (vehicle: AdminVehicle) => {
    updateVehicles((vehicles) =>
      vehicles.map((item) => (item.id === vehicle.id ? { ...item, status: 'user-locked' } : item))
    );
    showSuccess(`${vehicle.id} locked.`);
  };

  const unlockVehicle = (vehicle: AdminVehicle) => {
    updateVehicles((vehicles) =>
      vehicles.map((item) =>
        item.id === vehicle.id ? { ...item, status: 'available', condition: 'good' } : item
      )
    );
    showSuccess(`${vehicle.id} unlocked.`);
  };

  const deleteVehicle = (vehicleId: string) => {
    updateVehicles((vehicles) => vehicles.filter((item) => item.id !== vehicleId));
    showSuccess(`${vehicleId} removed from fleet.`);
    setDeleteVehicleId(null);
  };

  const saveVehicleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVehicle) return;
    updateVehicles((vehicles) =>
      vehicles.map((item) => (item.id === editVehicle.id ? editVehicle : item))
    );
    showSuccess(`${editVehicle.id} updated.`);
    setEditVehicle(null);
  };

  const saveDockAssignment = () => {
    if (!assignVehicle || !assignDockId) return;
    const dock = institute.docks.find((d) => d.id === assignDockId);
    updateVehicles((vehicles) =>
      vehicles.map((item) =>
        item.id === assignVehicle.id
          ? { ...item, dockId: assignDockId, location: dock?.name ?? item.location }
          : item
      )
    );
    showSuccess(`${assignVehicle.id} assigned to ${dock?.name ?? 'dock'}.`);
    setAssignVehicle(null);
  };

  return (
    <div className="min-h-full bg-[#F9F9F9] p-6 pb-8">

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <Bike className="text-[#ee5f13]" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-[#1f1714]">Fleet Management</h1>
            <p className="text-muted-foreground">{institute.name} hardware registration and vehicle state.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
          <Button variant="outline" className="rounded-full bg-white" onClick={() => csvInputRef.current?.click()}>
            <Upload size={16} /> Upload CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.6fr]">
        <div className="space-y-5">
          <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <Plus size={19} className="text-[#ee5f13]" /> Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Display Tag</label>
                  <Input value={displayTag} onChange={(e) => setDisplayTag(e.target.value)} placeholder="IITRPR-B-01" className="h-11 rounded-xl bg-white" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Vehicle Type</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="h-11 w-full rounded-xl border border-border/80 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee5f13]/20">
                    {vehicleTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Hardware MAC Address</label>
                  <Input value={hardwareMac} onChange={(e) => setHardwareMac(e.target.value)} placeholder="A4:C1:38:11:QP:22" className="h-11 rounded-xl bg-white" required />
                </div>
                <Button type="submit" className="w-full rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13]" disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Plus size={16} /> Register Vehicle</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Fleet Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                ['Total', institute.vehicles.length],
                ['Available', institute.vehicles.filter((vehicle) => vehicle.status === 'available').length],
                ['In Use', institute.vehicles.filter((vehicle) => vehicle.status === 'in-ride').length],
                ['Maintenance', institute.vehicles.filter((vehicle) => vehicle.status === 'maintenance').length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#f3f1ee] p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg font-bold text-gray-800">Vehicle List</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tag, MAC, dock..." className="h-10 w-full rounded-xl bg-white pl-10 md:w-72" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    statusFilter === status
                      ? 'bg-[#ee5f13] text-white shadow-lg shadow-[#ee5f13]/20'
                      : 'border border-border/80 bg-white text-gray-600 hover:border-[#ee5f13]/30 hover:bg-[#fff0df]/40'
                  }`}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Battery Level</TableHead>
                  <TableHead>Current State</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-[12px] bg-[#fff0df] p-2 text-[#ee5f13]">
                          <Bike size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{vehicle.id}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${getBatteryColor(vehicle.battery)}`}>
                        <Battery size={18} />
                        <span className="font-semibold">{vehicle.battery}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(vehicle.status)}>{getStatusLabel(vehicle.status)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{vehicle.hardwareMac ?? 'Not linked'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button variant="outline" size="sm" className="h-8 rounded-full px-2" onClick={() => setDetailVehicle(vehicle)} title="View details"><Eye size={14} /></Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-full px-2" onClick={() => setEditVehicle(vehicle)} title="Edit"><Edit2 size={14} /></Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-full px-2" onClick={() => { setAssignVehicle(vehicle); setAssignDockId(vehicle.dockId); }} title="Assign dock"><MapPin size={14} /></Button>
                        {vehicle.status === 'user-locked' ? (
                          <Button variant="outline" size="sm" className="h-8 rounded-full px-2" onClick={() => unlockVehicle(vehicle)} title="Unlock"><Unlock size={14} /></Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8 rounded-full px-2" onClick={() => lockVehicle(vehicle)} title="Lock"><Lock size={14} /></Button>
                        )}
                        <Button variant="outline" size="sm" className="h-8 rounded-full px-2" disabled={vehicle.status === 'maintenance'} onClick={() => markForMaintenance(vehicle)} title="Maintenance"><Wrench size={14} /></Button>
                        <Button variant="destructive" size="sm" className="h-8 rounded-full px-2" onClick={() => setDeleteVehicleId(vehicle.id)} title="Delete"><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {filteredVehicles.length === 0 && (
              <div className="rounded-2xl bg-[#f3f1ee] p-8 text-center text-sm text-muted-foreground">
                No vehicles match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {csvPreview && (
        <Card className="mt-6 border border-[#FF8C42]/30 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-2">CSV Import Preview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {csvPreview.valid.length} valid · {csvPreview.duplicates} duplicates · {csvPreview.invalid} invalid rows
          </p>
          <div className="max-h-40 overflow-y-auto rounded-xl bg-[#fafafa] p-3 text-xs font-mono mb-4">
            {csvPreview.valid.slice(0, 8).map((row) => (
              <p key={row.displayTag}>{row.displayTag}, {row.type}, {row.hardwareMac}</p>
            ))}
            {csvPreview.valid.length > 8 && <p className="text-muted-foreground">+{csvPreview.valid.length - 8} more...</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => setCsvPreview(null)}>Cancel</Button>
            <Button className="rounded-full bg-[#ee5f13] text-white" disabled={!csvPreview.valid.length || submitting} onClick={confirmCsvImport}>
              Import {csvPreview.valid.length} Vehicles
            </Button>
          </div>
        </Card>
      )}

      {detailVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailVehicle(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{detailVehicle.id}</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Type:</span> {detailVehicle.type}</p>
              <p><span className="text-muted-foreground">MAC:</span> {detailVehicle.hardwareMac ?? 'N/A'}</p>
              <p><span className="text-muted-foreground">Dock:</span> {detailVehicle.location}</p>
              <p><span className="text-muted-foreground">Battery:</span> {detailVehicle.battery}%</p>
              <p><span className="text-muted-foreground">Status:</span> {getStatusLabel(detailVehicle.status)}</p>
              <p><span className="text-muted-foreground">Total rides:</span> {detailVehicle.totalRides}</p>
              <p><span className="text-muted-foreground">Last seen:</span> {detailVehicle.lastRide}</p>
            </div>
            <Button className="mt-4 w-full rounded-full" onClick={() => setDetailVehicle(null)}>Close</Button>
          </Card>
        </div>
      )}

      {editVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditVehicle(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Edit {editVehicle.id}</h3>
            <form onSubmit={saveVehicleEdit} className="space-y-3">
              <Input value={editVehicle.type} onChange={(e) => setEditVehicle({ ...editVehicle, type: e.target.value })} placeholder="Vehicle type" className="h-11 rounded-xl" />
              <Input value={editVehicle.hardwareMac ?? ''} onChange={(e) => setEditVehicle({ ...editVehicle, hardwareMac: e.target.value })} placeholder="MAC address" className="h-11 rounded-xl" />
              <Input type="number" min="0" max="100" value={editVehicle.battery} onChange={(e) => setEditVehicle({ ...editVehicle, battery: Number(e.target.value) })} className="h-11 rounded-xl" />
              <Button type="submit" className="w-full rounded-full bg-[#ee5f13] text-white">Save Changes</Button>
            </form>
          </Card>
        </div>
      )}

      {assignVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAssignVehicle(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Assign Dock — {assignVehicle.id}</h3>
            <select value={assignDockId} onChange={(e) => setAssignDockId(e.target.value)} className="h-11 w-full rounded-xl border px-3 text-sm mb-4">
              {institute.docks.map((dock) => <option key={dock.id} value={dock.id}>{dock.name}</option>)}
            </select>
            <Button className="w-full rounded-full bg-[#ee5f13] text-white" onClick={saveDockAssignment}>Assign Dock</Button>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteVehicleId}
        title="Delete vehicle?"
        description={`Remove ${deleteVehicleId} from the fleet? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteVehicleId && deleteVehicle(deleteVehicleId)}
        onOpenChange={(open) => !open && setDeleteVehicleId(null)}
      />
    </div>
  );
};
