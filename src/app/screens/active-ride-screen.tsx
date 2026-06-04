import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bike,
  Lock,
  Unlock,
  Phone,
  Battery,
  MapPin,
  Clock,
  IndianRupee,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDuration } from '../lib/utils';

interface ActiveRideScreenProps {
  onEndRide: () => void;
  onBack: () => void;
}

export const ActiveRideScreen: React.FC<ActiveRideScreenProps> = ({ onEndRide, onBack }) => {
  const [rideTime, setRideTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const baseFare = 5;
  const perMinuteFare = 2;
  const currentFare = baseFare + Math.floor(rideTime / 60) * perMinuteFare;

  useEffect(() => {
    const timer = setInterval(() => {
      setRideTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-b-3xl mb-6">
        <div className="flex items-center justify-between text-white mb-4">
          <button onClick={onBack} className="text-white">
            ← Back
          </button>
          <Badge variant="success" className="bg-white/20 text-white border-white/40">
            Ride Active
          </Badge>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Active Ride Card with Pulse Animation */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(16, 185, 129, 0.4)',
              '0 0 0 20px rgba(16, 185, 129, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Card variant="elevated" className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <CardContent className="p-6">
              {/* Bike Image */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-8 bg-gradient-to-br from-primary to-secondary rounded-full"
                  >
                    <Bike size={80} className="text-white" />
                  </motion.div>
                  <div className="absolute -top-2 -right-2 bg-success text-white rounded-full px-3 py-1 text-sm font-bold">
                    Active
                  </div>
                </div>
              </div>

              {/* Bike Details */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Bike #QP-2847</h2>
                <Badge variant="info" className="text-sm">Standard Bike</Badge>
              </div>

              {/* Live Timer and Fare */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-card rounded-2xl p-6 text-center border-2 border-primary/20">
                  <Clock className="mx-auto mb-2 text-primary" size={32} />
                  <p className="text-sm text-muted-foreground mb-1">Ride Time</p>
                  <motion.p
                    key={rideTime}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-primary"
                  >
                    {formatDuration(rideTime)}
                  </motion.p>
                </div>

                <div className="bg-card rounded-2xl p-6 text-center border-2 border-secondary/20">
                  <IndianRupee className="mx-auto mb-2 text-secondary" size={32} />
                  <p className="text-sm text-muted-foreground mb-1">Current Fare</p>
                  <motion.p
                    key={currentFare}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-secondary"
                  >
                    {formatCurrency(currentFare)}
                  </motion.p>
                </div>
              </div>

              {/* Battery Status */}
              <div className="flex items-center justify-center gap-2 p-4 bg-success/10 rounded-xl border border-success/20 mb-6">
                <Battery className="text-success fill-success" size={24} />
                <div>
                  <p className="text-sm font-medium">Battery: 85%</p>
                  <p className="text-xs text-muted-foreground">~15 km range</p>
                </div>
              </div>

              {/* Lock/Unlock Button */}
              <Button
                onClick={() => setIsLocked(!isLocked)}
                variant={isLocked ? 'danger' : 'success'}
                size="lg"
                className="w-full mb-3"
              >
                {isLocked ? (
                  <>
                    <Lock size={24} className="mr-2" />
                    Locked - Tap to Unlock
                  </>
                ) : (
                  <>
                    <Unlock size={24} className="mr-2" />
                    Unlocked - Tap to Lock
                  </>
                )}
              </Button>

              {/* End Ride Button */}
              <Button
                onClick={onEndRide}
                variant="outline"
                size="lg"
                className="w-full border-2"
              >
                End Ride
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Location Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-primary" size={24} />
              <div className="flex-1">
                <p className="font-medium">Starting Point</p>
                <p className="text-sm text-muted-foreground">Main Gate Dock</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SOS Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowSOS(true)}
            variant="danger"
            size="lg"
            className="w-full shadow-2xl shadow-danger/50"
          >
            <AlertTriangle size={24} className="mr-2" />
            SOS Emergency
          </Button>
        </motion.div>

        {/* SOS Modal */}
        {showSOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowSOS(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="text-danger" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Emergency Assistance</h3>
                    <p className="text-muted-foreground">Need immediate help?</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button variant="danger" size="lg" className="w-full">
                      <Phone className="mr-2" size={20} />
                      Call Campus Security
                    </Button>
                    <Button variant="outline" size="lg" className="w-full">
                      <Phone className="mr-2" size={20} />
                      Call Support
                    </Button>
                  </div>

                  <Button
                    onClick={() => setShowSOS(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
