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
import { formatCurrency, formatDuration } from '../lib/utils';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const rides = [
    {
      id: 2847,
      date: new Date('2026-06-02T10:30:00'),
      duration: 720,
      fare: 15,
      startDock: 'Main Gate Dock',
      endDock: 'Library Dock',
      distance: 2.3,
      bikeType: 'Standard'
    },
    {
      id: 2846,
      date: new Date('2026-06-01T18:15:00'),
      duration: 540,
      fare: 12,
      startDock: 'Hostel A Dock',
      endDock: 'Main Gate Dock',
      distance: 1.8,
      bikeType: 'Standard'
    },
    {
      id: 2845,
      date: new Date('2026-06-01T14:20:00'),
      duration: 900,
      fare: 18,
      startDock: 'Library Dock',
      endDock: 'Sports Complex',
      distance: 3.1,
      bikeType: 'Standard'
    },
    {
      id: 2844,
      date: new Date('2026-05-31T16:45:00'),
      duration: 600,
      fare: 13,
      startDock: 'Main Gate Dock',
      endDock: 'Cafeteria Dock',
      distance: 2.0,
      bikeType: 'Standard'
    },
    {
      id: 2843,
      date: new Date('2026-05-31T09:30:00'),
      duration: 420,
      fare: 10,
      startDock: 'Hostel A Dock',
      endDock: 'Academic Block',
      distance: 1.5,
      bikeType: 'Standard'
    },
  ];

  const totalRides = rides.length;
  const totalDuration = rides.reduce((sum, ride) => sum + ride.duration, 0);
  const totalSpent = rides.reduce((sum, ride) => sum + ride.fare, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-12 rounded-b-3xl">
        <button onClick={onBack} className="text-white mb-6">
          ← Back
        </button>

        <div className="flex items-center gap-3 text-white mb-6">
          <Calendar size={32} />
          <div>
            <h1 className="text-3xl font-bold">Ride History</h1>
            <p className="text-white/90">Your journey with QuickPed</p>
          </div>
        </div>

        {/* Stats Cards */}
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
              <p className="text-2xl font-bold">{Math.floor(totalDuration / 3600)}h</p>
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
        {/* Ride List */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>All Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                          {ride.date.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
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
