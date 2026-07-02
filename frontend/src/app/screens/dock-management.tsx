import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, CheckCircle2, Edit2, MapPin, Plus, Radar, Search, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { recalculateDockOccupancy, type AdminDock, type InstituteData } from '../lib/admin-data';
import { adminToast } from '../lib/admin-feedback';
import { ConfirmDialog } from '../components/confirm-dialog';

interface DockManagementProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}

type DockForm = {
  name: string;
  latitude: string;
  longitude: string;
  strictRadius: string;
  softBuffer: string;
  optimumCapacity: string;
  rebalanceThreshold: string;
  isActive: boolean;
  mapX: number;
  mapY: number;
};

const defaultForm: DockForm = {
  name: '',
  latitude: '30.9685',
  longitude: '76.5273',
  strictRadius: '20',
  softBuffer: '15',
  optimumCapacity: '10',
  rebalanceThreshold: '5',
  isActive: true,
  mapX: 50,
  mapY: 50,
};

const metersToPixels = (meters: number) => Math.max(22, meters * 2.6);

const toDockForm = (dock: AdminDock): DockForm => ({
  name: dock.name,
  latitude: String(dock.latitude ?? 30.9685),
  longitude: String(dock.longitude ?? 76.5273),
  strictRadius: String(dock.strictRadius ?? 20),
  softBuffer: String(dock.softBuffer ?? 15),
  optimumCapacity: String(dock.optimumCapacity ?? dock.spots),
  rebalanceThreshold: String(dock.rebalanceThreshold ?? 5),
  isActive: dock.isActive ?? true,
  mapX: dock.mapX ?? 50,
  mapY: dock.mapY ?? 50,
});

export const DockManagement: React.FC<DockManagementProps> = ({ institute, onUpdateInstitute }) => {
  const [query, setQuery] = useState('');
  const [dockForm, setDockForm] = useState<DockForm>(defaultForm);
  const [editingDock, setEditingDock] = useState<AdminDock | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [dockToDelete, setDockToDelete] = useState<AdminDock | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'utilisation'>('name');

  const filteredDocks = useMemo(() => {
    const list = institute.docks.filter(
      (dock) =>
        dock.name.toLowerCase().includes(query.toLowerCase()) ||
        dock.location.toLowerCase().includes(query.toLowerCase())
    );
    if (sortBy === 'utilisation') {
      return [...list].sort((a, b) => (b.occupied / Math.max(b.spots, 1)) - (a.occupied / Math.max(a.spots, 1)));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [institute.docks, query, sortBy]);

  const showSuccess = (msg: string) => {
    adminToast.success(msg);
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };

  const resetForm = () => {
    setDockForm(defaultForm);
    setEditingDock(null);
    setFormOpen(false);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mapX = Math.min(94, Math.max(6, ((event.clientX - rect.left) / rect.width) * 100));
    const mapY = Math.min(92, Math.max(8, ((event.clientY - rect.top) / rect.height) * 100));
    const latitude = 30.9685 + (50 - mapY) * 0.00008;
    const longitude = 76.5273 + (mapX - 50) * 0.00008;

    setEditingDock(null);
    setDockForm({
      ...defaultForm,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      mapX,
      mapY,
    });
    setFormOpen(true);
  };

  const openEditForm = (dock: AdminDock) => {
    setEditingDock(dock);
    setDockForm(toDockForm(dock));
    setFormOpen(true);
  };

  const handleSaveDock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dockForm.name.trim()) return;

    const optimumCapacity = Math.max(1, Number(dockForm.optimumCapacity) || 10);
    const savedDock = {
      name: dockForm.name.trim(),
      location: `${Number(dockForm.latitude).toFixed(5)}, ${Number(dockForm.longitude).toFixed(5)}`,
      campus: institute.name,
      spots: optimumCapacity,
      latitude: Number(dockForm.latitude) || 0,
      longitude: Number(dockForm.longitude) || 0,
      strictRadius: Math.max(1, Number(dockForm.strictRadius) || 20),
      softBuffer: Math.max(0, Number(dockForm.softBuffer) || 0),
      optimumCapacity,
      rebalanceThreshold: Math.max(0, Number(dockForm.rebalanceThreshold) || 0),
      isActive: dockForm.isActive,
      mapX: dockForm.mapX,
      mapY: dockForm.mapY,
    };

    if (editingDock) {
      onUpdateInstitute((current) => {
        const docksNext = current.docks.map((dock) =>
          dock.id === editingDock.id ? { ...dock, ...savedDock } : dock
        );
        const vehiclesNext = current.vehicles.map((vehicle) =>
          vehicle.dockId === editingDock.id ? { ...vehicle, location: savedDock.name } : vehicle
        );
        return { ...current, docks: recalculateDockOccupancy(docksNext, vehiclesNext), vehicles: vehiclesNext };
      });
      showSuccess(`Dock "${savedDock.name}" updated.`);
    } else {
      const newDock: AdminDock = {
        id: `${institute.id}-dock-${Date.now().toString(36)}`,
        ...savedDock,
        occupied: 0,
        status: 'available',
      };
      onUpdateInstitute((current) => ({ ...current, docks: [...current.docks, newDock] }));
      showSuccess(`Dock "${newDock.name}" saved.`);
    }

    resetForm();
  };

  const handleRemoveDock = (dock: AdminDock) => {
    onUpdateInstitute((current) => {
      const docksNext = current.docks.filter((item) => item.id !== dock.id);
      const fallbackDock = docksNext[0];
      const vehiclesNext = current.vehicles.map((vehicle) => {
        if (vehicle.dockId !== dock.id) return vehicle;
        if (!fallbackDock) return { ...vehicle, dockId: '', location: 'Unassigned' };
        return { ...vehicle, dockId: fallbackDock.id, location: fallbackDock.name };
      });
      return { ...current, docks: recalculateDockOccupancy(docksNext, vehiclesNext), vehicles: vehiclesNext };
    });
    showSuccess(`Dock "${dock.name}" removed.`);
    setDockToDelete(null);
  };

  const renderDockMarker = (dock: AdminDock, faded = false) => {
    const strict = dock.strictRadius ?? 20;
    const soft = strict + (dock.softBuffer ?? 15);
    const x = dock.mapX ?? 50;
    const y = dock.mapY ?? 50;

    return (
      <div key={dock.id} className={`absolute ${faded ? 'opacity-50' : ''}`} style={{ left: `${x}%`, top: `${y}%` }}>
        <span
          className="absolute rounded-full border-2 border-dashed border-orange-500/80 bg-orange-300/10"
          style={{
            width: metersToPixels(soft),
            height: metersToPixels(soft),
            transform: 'translate(-50%, -50%)',
          }}
        />
        <span
          className="absolute rounded-full border-2 border-red-500 bg-red-500/15"
          style={{
            width: metersToPixels(strict),
            height: metersToPixels(strict),
            transform: 'translate(-50%, -50%)',
          }}
        />
        <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#181818] p-2 text-white shadow-lg">
          <MapPin size={16} />
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#F9F9F9] p-6 pb-8">
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#ee5f13] px-6 py-3 text-sm font-semibold text-white shadow-xl"
          >
            <CheckCircle2 size={16} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="text-[#ee5f13]" size={30} />
          <div>
            <h1 className="text-3xl font-bold text-[#1f1714]">Dock Management</h1>
            <p className="text-muted-foreground">{institute.name} parking zones and GPS buffers.</p>
          </div>
        </div>
        <Button className="rounded-full bg-[#181818] px-4 py-2 text-white hover:bg-[#111]" onClick={() => setFormOpen(true)}>
          <Plus size={16} className="mr-2" /> Add Dock
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <Radar size={19} className="text-[#ee5f13]" /> Campus Map
              </CardTitle>
              <Badge className="w-fit bg-[#fff0df] text-[#ee5f13]">{institute.city ?? 'Campus location'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              role="button"
              tabIndex={0}
              onClick={handleMapClick}
              className="relative h-[520px] overflow-hidden rounded-[22px] border border-border/70 bg-[#e9e1d7] shadow-inner"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px)] bg-[size:44px_44px]" />
              <div className="absolute left-[7%] top-[47%] h-8 w-[86%] -rotate-6 rounded-full bg-white/70 shadow-sm" />
              <div className="absolute left-[20%] top-[10%] h-[76%] w-7 rotate-12 rounded-full bg-white/65 shadow-sm" />
              <div className="absolute left-[13%] top-[18%] h-24 w-36 rounded-[8px] bg-[#cdd8d0] shadow-sm" />
              <div className="absolute right-[11%] top-[16%] h-32 w-44 rounded-[8px] bg-[#d9cdbd] shadow-sm" />
              <div className="absolute bottom-[14%] left-[22%] h-28 w-48 rounded-[8px] bg-[#d6c3b2] shadow-sm" />
              <div className="absolute bottom-[20%] right-[16%] h-28 w-32 rounded-[8px] bg-[#c9d5dc] shadow-sm" />
              {institute.docks.map((dock) => renderDockMarker(dock, !(dock.isActive ?? true)))}
              {formOpen && !editingDock && renderDockMarker({
                id: 'draft-dock',
                name: dockForm.name,
                location: '',
                campus: institute.name,
                spots: Number(dockForm.optimumCapacity) || 10,
                occupied: 0,
                status: 'available',
                strictRadius: Number(dockForm.strictRadius) || 20,
                softBuffer: Number(dockForm.softBuffer) || 15,
                mapX: dockForm.mapX,
                mapY: dockForm.mapY,
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">{editingDock ? 'Edit Dock' : 'Save Dock'}</CardTitle>
            </CardHeader>
            <CardContent>
              {formOpen ? (
                <form onSubmit={handleSaveDock} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Dock Name</label>
                    <Input value={dockForm.name} onChange={(e) => setDockForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Hostel Avenue" className="h-11 rounded-xl bg-white" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                      <Input type="number" step="0.000001" value={dockForm.latitude} onChange={(e) => setDockForm((prev) => ({ ...prev, latitude: e.target.value }))} className="h-11 rounded-xl bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                      <Input type="number" step="0.000001" value={dockForm.longitude} onChange={(e) => setDockForm((prev) => ({ ...prev, longitude: e.target.value }))} className="h-11 rounded-xl bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Strict Radius (Meters)</label>
                      <Input type="number" min="1" value={dockForm.strictRadius} onChange={(e) => setDockForm((prev) => ({ ...prev, strictRadius: e.target.value }))} className="h-11 rounded-xl bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Soft Buffer (Meters)</label>
                      <Input type="number" min="0" value={dockForm.softBuffer} onChange={(e) => setDockForm((prev) => ({ ...prev, softBuffer: e.target.value }))} className="h-11 rounded-xl bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Optimum Capacity</label>
                      <Input type="number" min="1" value={dockForm.optimumCapacity} onChange={(e) => setDockForm((prev) => ({ ...prev, optimumCapacity: e.target.value }))} className="h-11 rounded-xl bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Rebalance Threshold</label>
                      <Input type="number" min="0" value={dockForm.rebalanceThreshold} onChange={(e) => setDockForm((prev) => ({ ...prev, rebalanceThreshold: e.target.value }))} className="h-11 rounded-xl bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#f3f1ee] p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Is Active</p>
                      <p className="text-xs text-muted-foreground">Inactive docks remain visible but unavailable.</p>
                    </div>
                    <Switch checked={dockForm.isActive} onCheckedChange={(checked) => setDockForm((prev) => ({ ...prev, isActive: checked }))} />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={resetForm}>Cancel</Button>
                    <Button type="submit" className="flex-1 rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13]">Save Dock</Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl bg-[#f3f1ee] p-5 text-sm text-muted-foreground">
                  Select Add Dock or place a pin on the map.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg font-bold text-gray-800">Saved Docks</CardTitle>
                <Badge className="bg-[#fff0df] text-[#ee5f13]">{institute.docks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search docks..." className="h-11 rounded-xl bg-white pl-10" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={sortBy === 'name' ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setSortBy('name')}>Sort A–Z</Button>
                <Button type="button" variant={sortBy === 'utilisation' ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setSortBy('utilisation')}>By utilisation</Button>
              </div>
              {filteredDocks.map((dock) => (
                <div key={dock.id} className="rounded-[18px] border border-border/70 bg-white p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-800">{dock.name}</p>
                      <p className="text-xs text-muted-foreground">{dock.location}</p>
                    </div>
                    <Badge className={(dock.isActive ?? true) ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                      {(dock.isActive ?? true) ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-[#f3f1ee] p-2"><p className="text-muted-foreground">Strict</p><p className="font-bold">{dock.strictRadius ?? 20}m</p></div>
                    <div className="rounded-xl bg-[#f3f1ee] p-2"><p className="text-muted-foreground">Buffer</p><p className="font-bold">{dock.softBuffer ?? 15}m</p></div>
                    <div className="rounded-xl bg-[#f3f1ee] p-2"><p className="text-muted-foreground">Target</p><p className="font-bold">{dock.optimumCapacity ?? dock.spots}</p></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => openEditForm(dock)}>
                      <Edit2 size={14} /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="rounded-full" onClick={() => setDockToDelete(dock)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredDocks.length === 0 && (
                <div className="rounded-2xl bg-[#f3f1ee] p-5 text-center text-sm text-muted-foreground">
                  No docks saved for this campus.
                </div>
              )}
              <div className="flex items-center gap-3 rounded-2xl bg-[#fff0df] p-4 text-[#ee5f13]">
                <Activity size={18} />
                <p className="text-sm font-semibold">{institute.vehicles.length} vehicles are linked to {institute.docks.length} dock zones.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!dockToDelete}
        title="Delete dock?"
        description={dockToDelete ? `Remove "${dockToDelete.name}"? Bikes at this dock will be reassigned.` : ''}
        confirmLabel="Delete dock"
        destructive
        onConfirm={() => dockToDelete && handleRemoveDock(dockToDelete)}
        onOpenChange={(open) => !open && setDockToDelete(null)}
      />
    </div>
  );
};
