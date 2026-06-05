import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MapPin, Search, Activity, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const docks = [
  { id: 'Dock-01', name: 'Main Gate Dock', spots: 12, occupied: 9, status: 'active' },
  { id: 'Dock-02', name: 'Library Dock', spots: 8, occupied: 8, status: 'full' },
  { id: 'Dock-03', name: 'Sports Complex', spots: 10, occupied: 4, status: 'available' },
  { id: 'Dock-04', name: 'Hostel A Dock', spots: 6, occupied: 6, status: 'full' },
  { id: 'Dock-05', name: 'Admin Block Dock', spots: 14, occupied: 11, status: 'active' },
];

const statusClass = {
  active: 'bg-success/10 text-success',
  available: 'bg-info/10 text-info',
  full: 'bg-danger/10 text-danger',
};

export const DockManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const filteredDocks = docks.filter(
    (dock) =>
      dock.name.toLowerCase().includes(query.toLowerCase()) ||
      dock.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="text-primary" size={30} />
            <div>
              <h1 className="text-3xl font-bold">Dock Management</h1>
              <p className="text-muted-foreground">Manage station health, availability, and coverage.</p>
            </div>
          </div>
        </div>
        <Button className="rounded-full px-4 py-2">
          <Plus size={16} className="mr-2" /> Add Dock
        </Button>
      </div>

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
                placeholder="Search dock by name or ID..."
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
                <p className="text-3xl font-bold">{docks.length}</p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold">{docks.filter((dock) => dock.status === 'active').length}</p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-primary/10 p-4">
              <div className="flex items-center gap-3 text-primary">
                <Activity size={18} />
                <p className="text-sm">Local load is healthy across the network.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4">
        {filteredDocks.map((dock, index) => (
          <motion.div
            key={dock.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Card className="border border-border">
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl px-3 py-2 text-sm font-semibold ${statusClass[dock.status as 'active' | 'available' | 'full']}`}>
                      {dock.status.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{dock.name}</p>
                      <p className="text-sm text-muted-foreground">{dock.id}</p>
                    </div>
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
                    <p className="text-base font-semibold">{dock.spots - dock.occupied}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
