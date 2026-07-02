import React, { useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate, formatDuration } from '../lib/utils';
import { getCompletedRides, type InstituteData } from '../lib/admin-data';

interface AdminRideHistoryProps {
  institute: InstituteData;
}

export const AdminRideHistory: React.FC<AdminRideHistoryProps> = ({ institute }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const rides = useMemo(() => {
    const all = [...institute.rideHistory].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    const q = searchQuery.toLowerCase();
    if (!q) return all;
    return all.filter(
      (ride) =>
        ride.id.toLowerCase().includes(q) ||
        ride.user.toLowerCase().includes(q) ||
        ride.vehicleId.toLowerCase().includes(q) ||
        ride.startDock.toLowerCase().includes(q) ||
        ride.endDock.toLowerCase().includes(q)
    );
  }, [institute.rideHistory, searchQuery]);

  const completedCount = getCompletedRides(institute.rideHistory).length;
  const activeCount = institute.rideHistory.filter((r) => r.status === 'active').length;

  return (
    <div className="min-h-full bg-[#F9F9F9] p-4 md:p-6 pb-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <History className="text-[#FF8C42]" size={30} />
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] md:text-3xl">Ride History</h1>
            <p className="text-sm text-muted-foreground">{institute.name} — all campus rides</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rides..."
            className="h-11 rounded-xl pl-10 bg-white"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 max-w-lg">
        <div className="rounded-2xl bg-white border border-[#eceae6] p-4 text-center">
          <p className="text-2xl font-bold">{rides.length}</p>
          <p className="text-xs text-muted-foreground">Total records</p>
        </div>
        <div className="rounded-2xl bg-white border border-[#eceae6] p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="rounded-2xl bg-white border border-[#eceae6] p-4 text-center">
          <p className="text-2xl font-bold text-[#FF8C42]">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>All Rides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="flex flex-col gap-2 rounded-2xl border border-[#eceae6] p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-[#1a1a1a]">{ride.id} · {ride.user}</p>
                <p className="text-sm text-muted-foreground">
                  {ride.vehicleId} · {ride.startDock} → {ride.endDock}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ride.status === 'active' ? 'In progress' : formatDate(ride.completedAt)} · {formatDuration(ride.duration)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-[#1a1a1a]">{formatCurrency(ride.fare)}</p>
                <Badge className={ride.status === 'active' ? 'bg-[#fff0df] text-[#FF8C42]' : 'bg-emerald-50 text-emerald-600'}>
                  {ride.status}
                </Badge>
              </div>
            </div>
          ))}
          {rides.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">No rides found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
