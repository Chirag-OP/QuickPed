import React from 'react';
import { motion } from 'motion/react';
import {
  Bike,
  MapPin,
  Clock,
  IndianRupee,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate, formatDuration } from '../lib/utils';
import type { RideHistoryRecord } from '../lib/admin-data';
import { NotificationBell } from '../components/notification-bell';

interface HistoryScreenProps {
  rides: RideHistoryRecord[];
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ rides, onBack }) => {
  const totalRides = rides.length;
  const totalDuration = rides.reduce((sum, ride) => sum + ride.duration, 0);
  const totalSpent = rides.reduce((sum, ride) => sum + ride.fare, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-12 rounded-b-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button onClick={onBack} className="text-white">
            ← Back
          </button>
          <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
        </div>

        <div className="flex items-center gap-3 text-white mb-6">
          <Calendar size={32} />
          <div>
            <h1 className="text-3xl font-bold">Ride History</h1>
            <p className="text-white/90">Your journey with QuickPed</p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardContent className="p-4 text-center">
              <Bike className="mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{totalRides}</p>
              <p className="text-xs text-white/80">Total Rides</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
              <p className="text-xs text-white/80">Total Time</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardContent className="p-4 text-center">
              <IndianRupee className="mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold">{totalSpent}</p>
              <p className="text-xs text-white/80">Total Spent</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-6 -mt-8">
        {}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>All Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rides.length === 0 && (
                <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  Completed rides will appear here after you end a ride.
                </div>
              )}

              {rides.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bike className="text-primary" size={24} />
                      </div>
                      <div>
                        <p className="font-bold">Ride #{ride.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(ride.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(ride.fare)}
                      </p>
                      <Badge variant="success" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-success" size={16} />
                      <span className="font-medium">{ride.startDock}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-danger" size={16} />
                      <span className="font-medium">{ride.endDock}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(ride.duration)}
                    </span>
                    <span>{ride.distance} km</span>
                    <ChevronRight
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      size={16}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
