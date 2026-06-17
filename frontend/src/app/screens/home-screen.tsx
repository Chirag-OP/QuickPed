// gurpreet singh -17-jan-26 
import React from 'react';
import { motion } from 'motion/react';
import {
  Bike,
  Wallet,
  MapPin,
  QrCode,
  User,
  Moon,
  Sun,
  Battery,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useTheme } from '../components/theme-provider';
import { formatCurrency } from '../lib/utils';
import { NotificationBell } from '../components/notification-bell';
import { useAuth } from '../../context/AuthContext';
import quickPedLogo from '../../assets/logo.jpeg';

interface HomeScreenProps {
  onStartRide: () => void;
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartRide, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const balance = Number(user?.walletBalance ?? 0);

  const nearbyDocks = [
    { id: 1, name: 'Main Gate Dock', bikes: 8, distance: '50m', battery: 'high' },
    { id: 2, name: 'Library Dock', bikes: 12, distance: '200m', battery: 'high' },
    { id: 3, name: 'Hostel A Dock', bikes: 3, distance: '350m', battery: 'medium' },
    { id: 4, name: 'Sports Complex', bikes: 15, distance: '500m', battery: 'high' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={quickPedLogo} alt="QuickPed" className="h-12 w-24 object-contain mix-blend-multiply" />
            <div>
              <h1 className="text-2xl font-bold text-white">QuickPed</h1>
              <p className="text-xs font-medium text-white/75">Campus rides, ready.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-white" />}
            </button>
            <NotificationBell className="border-0 bg-white/20 text-white shadow-none hover:bg-white/30" />
            <button
              onClick={() => onNavigate('profile')}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <User size={20} className="text-white" />
            </button>
          </div>
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl border-white/20 bg-white/15 text-white shadow-2xl shadow-orange-950/20 backdrop-blur-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-lg">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Wallet Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate('wallet')}
                  variant="secondary"
                  size="lg"
                  className="rounded-2xl bg-white text-orange-600 shadow-lg hover:bg-orange-50 hover:text-orange-700 active:scale-[0.98]"
                >
                  Add Money
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="px-6 -mt-4">
        {}
        <motion.div
          initial={{ opacity: 0, scale: 2.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={onStartRide}
            size="lg"
            className="w-full h-16 shadow-2xl shadow-primary/50 mb-6 text-2xl font-bold"
          >
            <QrCode size={120} className="mr-2" />
            Scan QR & Ride
          </Button>
        </motion.div>

        {}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 h-48 flex items-center justify-center relative">
            <MapPin size={58} className="text-primary" />
            <div className="absolute bottom-4 right-4">
              <Button size="sm" variant="secondary" className="rounded-full shadow-lg">
                View Map
              </Button>
            </div>
          </div>
        </Card>

        {}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Nearby Docks</h2>
          <div className="space-y-3">
            {nearbyDocks.map((dock) => (
              <motion.div
                key={dock.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * dock.id }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{dock.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {dock.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bike size={14} />
                            {dock.bikes} available
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={dock.bikes > 5 ? 'success' : dock.bikes > 2 ? 'warning' : 'danger'}>
                          {dock.bikes} bikes
                        </Badge>
                        <Battery
                          size={16}
                          className={dock.battery === 'high' ? 'text-orange-500 fill-orange-500' : 'text-warning fill-warning'}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Your Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <Clock className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Total Rides</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <Bike className="mx-auto mb-2 text-secondary" size={24} />
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
