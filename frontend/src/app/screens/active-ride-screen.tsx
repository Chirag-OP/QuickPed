import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
import { calculateRideFare } from '../lib/admin-data';
import { NotificationBell } from '../components/notification-bell';

interface ActiveRideScreenProps {
  onEndRide: (durationSeconds: number) => void;
  onBack: () => void;
}

const LOW_BATTERY_MESSAGE = 'This vehicle has low battery. Please exchange it at the nearest dock.';
const nearestExchangeDock = {
  name: 'Library Dock',
  distance: '200m',
  availability: '6 vehicles available',
};

export const ActiveRideScreen: React.FC<ActiveRideScreenProps> = ({ onEndRide, onBack }) => {
  const [rideTime, setRideTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(32);
  const [lowBatteryTriggered, setLowBatteryTriggered] = useState(false);
  const [showLowBatteryAlert, setShowLowBatteryAlert] = useState(false);

  const currentFare = calculateRideFare(rideTime);
  const isLowBattery = batteryLevel < 30;
  const batteryStatus = isLowBattery ? 'Low' : batteryLevel < 60 ? 'Moderate' : 'Ready';
  const batteryClass = isLowBattery ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-success/10 border-success/20 text-success';

  useEffect(() => {
    const timer = setInterval(() => {
      setRideTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const batteryTimer = window.setInterval(() => {
      setBatteryLevel((prev) => Math.max(18, prev - 1));
    }, 3000);

    return () => window.clearInterval(batteryTimer);
  }, []);

  useEffect(() => {
    if (!isLowBattery || lowBatteryTriggered) return;

    setLowBatteryTriggered(true);
    setShowLowBatteryAlert(true);
    window.dispatchEvent(new CustomEvent('quickped:add-notification', {
      detail: {
        type: 'warning',
        title: 'Low battery alert',
        message: `${LOW_BATTERY_MESSAGE} Nearest dock: ${nearestExchangeDock.name} (${nearestExchangeDock.distance}).`,
      },
    }));
  }, [isLowBattery, lowBatteryTriggered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      {}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-b-3xl mb-6">
        <div className="flex items-center justify-between text-white mb-4">
          <button onClick={onBack} className="text-white">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
            <Badge className="bg-white/20 text-white border-white/40">
              Ride Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {}
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
              {}
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

              {}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Bike #QP-2847</h2>
                <Badge className="bg-info/10 text-info text-sm">Standard Bike</Badge>
              </div>

              {}
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

              {}
              <div className={`flex items-center justify-center gap-2 p-4 rounded-xl border mb-4 ${batteryClass}`}>
                <Battery className={isLowBattery ? 'text-warning fill-warning' : 'text-success fill-success'} size={24} />
                <div>
                  <p className="text-sm font-medium">Battery status: {batteryStatus}</p>
                  <p className="text-xs text-muted-foreground">{isLowBattery ? 'Exchange recommended now' : 'Enough range for this ride'}</p>
                </div>
              </div>

              {isLowBattery && (
                <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-warning mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-warning">{LOW_BATTERY_MESSAGE}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nearest available dock: {nearestExchangeDock.name} - {nearestExchangeDock.distance} away - {nearestExchangeDock.availability}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {}
              <Button
                onClick={() => setIsLocked(!isLocked)}
                variant={isLocked ? 'destructive' : 'default'}
                size="lg"
                className={`w-full mb-3 ${isLocked ? '' : 'bg-success text-white hover:bg-success/90'}`}
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

              {}
              <Button
                onClick={() => onEndRide(rideTime)}
                variant="outline"
                size="lg"
                className="w-full border-2"
              >
                End Ride
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {}
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

        {}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowSOS(true)}
            variant="destructive"
            size="lg"
            className="w-full shadow-2xl shadow-danger/50"
          >
            <AlertTriangle size={24} className="mr-2" />
            SOS Emergency
          </Button>
        </motion.div>

        <AnimatePresence>
          {showLowBatteryAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              onClick={() => setShowLowBatteryAlert(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 16, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="w-full max-w-md">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-warning" size={32} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Low Battery Alert</h3>
                      <p className="text-muted-foreground">{LOW_BATTERY_MESSAGE}</p>
                    </div>

                    <div className="rounded-2xl bg-muted p-4 mb-6">
                      <p className="text-sm text-muted-foreground">Nearest available dock</p>
                      <p className="font-semibold">{nearestExchangeDock.name}</p>
                      <p className="text-sm text-muted-foreground">{nearestExchangeDock.distance} away - {nearestExchangeDock.availability}</p>
                    </div>

                    <Button onClick={() => setShowLowBatteryAlert(false)} size="lg" className="w-full">
                      Exchange at Nearest Dock
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
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
                    <Button variant="destructive" size="lg" className="w-full">
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
