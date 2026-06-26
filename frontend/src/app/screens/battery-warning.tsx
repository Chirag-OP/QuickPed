import React from 'react';
import { motion } from 'motion/react';
import { Battery, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface BatteryWarningProps {
  batteryLevel: number;
  bikeId: string;
  onProceed: () => void;
  onCancel: () => void;
}

export const BatteryWarning: React.FC<BatteryWarningProps> = ({
  batteryLevel,
  bikeId,
  onProceed,
  onCancel
}) => {
  const getBatteryStatus = () => {
    if (batteryLevel > 60) return { text: 'Good', iconClass: 'text-success fill-success', bgClass: 'bg-success/10', barClass: 'bg-success', badgeClass: 'bg-success/10 text-success' };
    if (batteryLevel >= 30) return { text: 'Medium', iconClass: 'text-warning fill-warning', bgClass: 'bg-warning/10', barClass: 'bg-warning', badgeClass: 'bg-warning/10 text-warning' };
    return { text: 'Low', iconClass: 'text-danger fill-danger', bgClass: 'bg-danger/10', barClass: 'bg-danger', badgeClass: 'bg-danger/10 text-danger' };
  };

  const status = getBatteryStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className={`mx-auto w-20 h-20 ${status.bgClass} rounded-full flex items-center justify-center mb-4`}>
                <Battery
                  size={48}
                  className={status.iconClass}
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Battery Status</h3>
              <p className="text-muted-foreground">Bike {bikeId}</p>
            </div>

            <div className="mb-6 p-4 bg-muted/30 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-2">Battery Status</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <p className="text-4xl font-bold">{status.text}</p>
                <Badge className={status.badgeClass}>{status.text}</Badge>
              </div>

              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${status.barClass} transition-all`}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
            </div>

            {batteryLevel < 30 && (
              <div className="mb-6 p-4 bg-warning/10 border-l-4 border-warning rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-warning mb-1">Low Battery Warning</p>
                  <p className="text-sm text-muted-foreground">
                    This vehicle has low battery. Please exchange it at the nearest dock.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={onCancel} variant="outline" size="lg" className="flex-1">
                Choose Another
              </Button>
              <Button onClick={onProceed} size="lg" className="flex-1">
                Proceed Anyway
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
