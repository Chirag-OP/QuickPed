import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bike,
  Search,
  Filter,
  MapPin,
  Battery,
  Clock,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export const FleetManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const bikes = [
    {
      id: 'QP-2847',
      status: 'in-ride' as const,
      battery: 85,
      location: 'Main Gate Dock',
      lastRide: '2 min ago',
      totalRides: 234,
      condition: 'good'
    },
    {
      id: 'QP-2846',
      status: 'available' as const,
      battery: 92,
      location: 'Library Dock',
      lastRide: '15 min ago',
      totalRides: 189,
      condition: 'good'
    },
    {
      id: 'QP-2845',
      status: 'user-locked' as const,
      battery: 78,
      location: 'Sports Complex',
      lastRide: '1 hour ago',
      totalRides: 312,
      condition: 'good'
    },
    {
      id: 'QP-2844',
      status: 'maintenance' as const,
      battery: 45,
      location: 'Maintenance Bay',
      lastRide: '1 day ago',
      totalRides: 567,
      condition: 'needs-repair'
    },
    {
      id: 'QP-2843',
      status: 'available' as const,
      battery: 15,
      location: 'Hostel A Dock',
      lastRide: '30 min ago',
      totalRides: 423,
      condition: 'low-battery'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in-ride':
        return 'info';
      case 'user-locked':
        return 'warning';
      case 'maintenance':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-success fill-success';
    if (battery > 30) return 'text-warning fill-warning';
    return 'text-danger fill-danger';
  };

  const filteredBikes = bikes.filter((bike) => {
    const matchesSearch =
      bike.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bike.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bike className="text-primary" size={32} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">Monitor and manage all bikes</p>
          </div>
          <Button size="sm" className="rounded-full">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search bikes by ID or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          <Button variant="outline" size="lg" className="rounded-xl">
            <Filter size={20} />
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {['all', 'available', 'in-ride', 'user-locked', 'maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bike List */}
      <div className="space-y-4">
        {filteredBikes.map((bike, index) => (
          <motion.div
            key={bike.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="elevated" className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Bike className="text-primary" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{bike.id}</h3>
                      <Badge variant={getStatusColor(bike.status) as any}>
                        {bike.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`flex items-center gap-2 justify-end mb-2 ${getBatteryColor(bike.battery)}`}>
                      <Battery size={24} />
                      <span className="text-2xl font-bold">{bike.battery}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{bike.totalRides} rides</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-foreground" size={16} />
                    <span>{bike.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-muted-foreground" size={16} />
                    <span>Last ride: {bike.lastRide}</span>
                  </div>
                </div>

                {bike.condition !== 'good' && (
                  <div className="mt-4 p-3 bg-warning/10 border-l-4 border-warning rounded-lg">
                    <p className="text-sm font-medium text-warning">
                      {bike.condition === 'low-battery' ? '⚠️ Low battery - needs charging' : '⚠️ Requires maintenance'}
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
