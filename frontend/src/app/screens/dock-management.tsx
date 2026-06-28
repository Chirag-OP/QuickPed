import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, Building2, CheckCircle2, Edit2, MapPin, Plus, Search, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  recalculateDockOccupancy,
  type AdminDock,
  type InstituteData,
} from '../lib/admin-data';
interface DockManagementProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}
const statusClass: Record<string, string> = {
  active: 'bg-success/10 text-success',
  available: 'bg-info/10 text-info',
  full: 'bg-danger/10 text-danger',
};
const emptyDock: Omit<AdminDock, 'id' | 'occupied' | 'status'> = {
  name: '',
  location: '',
  campus: '',
  spots: 10,
};
export const DockManagement: React.FC<DockManagementProps> = ({ institute, onUpdateInstitute }) => {
  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDock, setEditingDock] = useState<AdminDock | null>(null);
  const [dockForm, setDockForm] = useState(emptyDock);
  const [successMsg, setSuccessMsg] = useState('');
  const filteredDocks = useMemo(
    () =>
      institute.docks.filter(
        (dock) =>
          dock.name.toLowerCase().includes(query.toLowerCase()) ||
          dock.id.toLowerCase().includes(query.toLowerCase()) ||
          dock.campus.toLowerCase().includes(query.toLowerCase()) ||
          dock.location.toLowerCase().includes(query.toLowerCase())
      ),
    [institute.docks, query]
  );
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };
  const resetForm = () => {
    setDockForm({ ...emptyDock, campus: institute.name });
    setEditingDock(null);
    setShowAddForm(false);
  };
  const openAddForm = () => {
    setDockForm({ ...emptyDock, campus: institute.name });
    setEditingDock(null);
    setShowAddForm(true);
  };
  const openEditForm = (dock: AdminDock) => {
    setDockForm({
      name: dock.name,
      location: dock.location,
      campus: dock.campus,
      spots: dock.spots,
    });
    setEditingDock(dock);
    setShowAddForm(true);
  };
  const handleSaveDock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dockForm.name.trim() || !dockForm.location.trim() || !dockForm.campus.trim()) return;
    if (editingDock) {
      onUpdateInstitute((current) => {
        const docksNext = current.docks.map((dock) =>
          dock.id === editingDock.id
            ? {
                ...dock,
                name: dockForm.name.trim(),
                location: dockForm.location.trim(),
                campus: dockForm.campus.trim(),
                spots: Math.max(1, Number(dockForm.spots) || 1),
              }
            : dock
        );
        const vehiclesNext = current.vehicles.map((vehicle) =>
          vehicle.dockId === editingDock.id ? { ...vehicle, location: dockForm.name.trim() } : vehicle
        );
        return { ...current, docks: recalculateDockOccupancy(docksNext, vehiclesNext), vehicles: vehiclesNext };
      });
      showSuccess(`Dock "${dockForm.name}" updated.`);
    } else {
      const newDock: AdminDock = {
        id: `${institute.id}-dock-${Date.now().toString(36)}`,
        name: dockForm.name.trim(),
        location: dockForm.location.trim(),
        campus: dockForm.campus.trim(),
        spots: Math.max(1, Number(dockForm.spots) || 10),
        occupied: 0,
        status: 'available',
      };
      onUpdateInstitute((current) => ({ ...current, docks: [...current.docks, newDock] }));
      showSuccess(`Dock "${newDock.name}" created.`);
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
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="text-primary" size={30} />
            <div>
              <h1 className="text-3xl font-bold">Dock Management</h1>
              <p className="text-muted-foreground">{institute.name} station health, availability, and coverage.</p>
            </div>
          </div>
        </div>
        <Button className="rounded-full px-4 py-2" onClick={openAddForm}>
          <Plus size={16} className="mr-2" /> Add Dock
        </Button>
      </div>
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
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
                  <MapPin size={20} className="text-primary" /> {editingDock ? 'Edit Dock' : 'Add New Dock'}
                </h2>
                <button type="button" onClick={resetForm} className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveDock} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dock Name</label>
                  <Input
                    placeholder="e.g. Central Library Dock"
                    value={dockForm.name}
                    onChange={(e) => setDockForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dock Location</label>
                  <Input
                    placeholder="e.g. Near Block A"
                    value={dockForm.location}
                    onChange={(e) => setDockForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campus / Institute</label>
                  <Input
                    value={dockForm.campus}
                    onChange={(e) => setDockForm((prev) => ({ ...prev, campus: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    min="1"
                    value={dockForm.spots}
                    onChange={(e) => setDockForm((prev) => ({ ...prev, spots: Number(e.target.value) }))}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingDock ? <><Edit2 size={16} className="mr-1" /> Save</> : <><Plus size={16} className="mr-1" /> Create</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_2fr]">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Search Docks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dock by name, ID, campus, or location..."
                className="pl-10 h-12 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Total Docks</p>
                <p className="text-3xl font-bold">{institute.docks.length}</p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold">{institute.docks.filter((dock) => dock.status === 'active').length}</p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-primary/10 p-4">
              <div className="flex items-center gap-3 text-primary">
                <Activity size={18} />
                <p className="text-sm">{institute.name} is tracking {institute.vehicles.length} vehicles across these docks.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-4">
        {filteredDocks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 size={40} className="mx-auto mb-3 opacity-40" />
            <p>No docks match your search.</p>
          </div>
        )}
        {filteredDocks.map((dock, index) => {
          const assignedVehicles = institute.vehicles.filter((vehicle) => vehicle.dockId === dock.id);
          return (
            <motion.div
              key={dock.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="border border-border">
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-2xl px-3 py-2 text-sm font-semibold ${statusClass[dock.status]}`}>
                          {dock.status.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{dock.name}</p>
                          <p className="text-sm text-muted-foreground">{dock.id} - {dock.campus} - {dock.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditForm(dock)}>
                        <Edit2 size={14} className="mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveDock(dock)}>
                        <Trash2 size={14} className="mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div>
                      <p className="text-xs uppercase">Capacity</p>
                      <p className="text-base font-semibold">{dock.spots}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Occupied</p>
                      <p className="text-base font-semibold">{dock.occupied}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Available</p>
                      <p className="text-base font-semibold">{Math.max(0, dock.spots - dock.occupied)}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ASSIGNED VEHICLES ({assignedVehicles.length})</p>
                    {assignedVehicles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {assignedVehicles.map((vehicle) => (
                          <Badge key={vehicle.id} className="bg-primary/10 text-primary">
                            {vehicle.id} - {vehicle.type}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No vehicles assigned yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
