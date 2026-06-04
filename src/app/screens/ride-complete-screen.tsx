import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Bike,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { formatCurrency, formatDuration } from '../lib/utils';

interface RideCompleteScreenProps {
  rideData: {
    duration: number;
    fare: number;
    startDock: string;
    endDock: string;
    distance: number;
  };
  onContinue: () => void;
}

export const RideCompleteScreen: React.FC<RideCompleteScreenProps> = ({
  rideData,
  onContinue
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center relative">
            <CheckCircle2 size={60} className="text-success" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute inset-0 bg-success/20 rounded-full"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Ride Complete!</h1>
          <p className="text-muted-foreground">Thank you for riding with QuickPed</p>
        </motion.div>

        {/* Ride Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" className="mb-6">
            <CardContent className="p-6">
              {/* Fare */}
              <div className="text-center mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2">Total Fare</p>
                <div className="flex items-center justify-center gap-2">
                  <IndianRupee className="text-primary" size={32} />
                  <p className="text-5xl font-bold text-primary">
                    {rideData.fare}
                  </p>
                </div>
              </div>

              {/* Ride Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="text-muted-foreground" size={20} />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-bold">{formatDuration(rideData.duration)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bike className="text-muted-foreground" size={20} />
                    <span className="text-sm">Distance</span>
                  </div>
                  <span className="font-bold">{rideData.distance} km</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-success" size={16} />
                    <span className="font-medium">{rideData.startDock}</span>
                  </div>
                  <div className="w-full h-12 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-border rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="text-danger" size={16} />
                    <span className="font-medium">{rideData.endDock}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-center mb-3">How was your ride?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="p-2 hover:scale-110 transition-transform"
                  >
                    <Star size={32} className="text-warning fill-warning" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button onClick={onContinue} size="xl" className="w-full">
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
