import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Bike,
  Users,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';

const bookings = [
  { id: 'B-4701', user: 'Amit Kumar', bike: 'QP-2843', time: '10:30 AM', status: 'Confirmed' },
  { id: 'B-4702', user: 'Rahul Sharma', bike: 'QP-2847', time: '11:15 AM', status: 'Pending' },
  { id: 'B-4703', user: 'Priya Patel', bike: 'QP-2846', time: '11:45 AM', status: 'Completed' },
];

const drivers = [
  { id: 1, name: 'Rahul Sharma', role: 'Fleet Supervisor', status: 'Active' },
  { id: 2, name: 'Priya Patel', role: 'Route Manager', status: 'On Duty' },
  { id: 3, name: 'Amit Kumar', role: 'Field Driver', status: 'Offline' },
  { id: 4, name: 'Sneha Gupta', role: 'Field Driver', status: 'Active' },
];

const rideTrends = [
  { label: '6 AM', value: 24 },
  { label: '9 AM', value: 40 },
  { label: '12 PM', value: 52 },
  { label: '3 PM', value: 68 },
  { label: '6 PM', value: 78 },
  { label: '9 PM', value: 48 },
];

interface AdminDashboardProps {
  onNavigate?: (screen: 'user-management' | 'fleet-management') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(45680);
  const [totalUsers, setTotalUsers] = useState(892);
  const [totalRides, setTotalRides] = useState(1247);
  const [activeDrivers, setActiveDrivers] = useState(78);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setLoading(false);
      setError(null);
    }, 750);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTotalRevenue((prev) => prev + Math.round(Math.random() * 90));
      setTotalRides((prev) => prev + Math.round(Math.random() * 4));
      setActiveDrivers((prev) => Math.min(120, Math.max(45, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.bike.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-muted p-8 text-center shadow-lg">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-semibold">Loading Admin Dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Preparing enterprise analytics and fleet data.
          </p>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-danger bg-muted p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-danger" />
          <h2 className="text-2xl font-semibold">Unable to load dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <LayoutDashboard className="text-primary" size={36} />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Enterprise insights, fleet command, and live dispatch control.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Live Feed</Badge>
            <Badge variant="success">Operations</Badge>
            <Badge variant="info">Analytics</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="px-3 py-1 rounded-full text-sm bg-muted hover:bg-muted/80"
              onClick={() => onNavigate?.('user-management')}
            >
              Manage Users
            </button>
            <button
              className="px-3 py-1 rounded-full text-sm bg-muted hover:bg-muted/80"
              onClick={() => onNavigate?.('fleet-management')}
            >
              Fleet Management
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="rounded-full px-5 py-3">
            <Sparkles size={18} /> Premium View
          </Button>
          <Button variant="outline" className="rounded-full px-5 py-3">
            <ArrowRight size={18} /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <Card variant="elevated" className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <IndianRupee className="text-primary" size={32} />
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp size={16} /> 5.2% growth
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="text-primary" size={32} />
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp size={16} /> +1.8% week
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Rides</p>
                <p className="text-3xl font-bold">{totalRides}</p>
              </div>
              <Bike className="text-primary" size={32} />
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp size={16} /> +7.1% today
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Drivers</p>
                <p className="text-3xl font-bold">{activeDrivers}</p>
              </div>
              <Activity className="text-primary" size={32} />
            </div>
            <div className="flex items-center gap-2 text-success text-sm">
              <TrendingUp size={16} /> +2 drivers
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card variant="elevated" className="xl:col-span-2 border border-border">
          <CardHeader>
            <CardTitle>Operational Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {rideTrends.map((item) => (
                <div key={item.label} className="rounded-3xl p-4 bg-muted/70">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}k</p>
                </div>
              ))}
            </div>

            <div className="h-52 rounded-[32px] bg-muted/60 p-5 overflow-hidden">
              <div className="relative h-full">
                {rideTrends.map((item, index) => (
                  <div
                    key={item.label}
                    className="absolute bottom-0 bg-primary rounded-t-3xl"
                    style={{ left: `${index * 14.5}%`, width: '9%', height: `${item.value}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border border-border">
          <CardHeader>
            <CardTitle>Driver Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="rounded-3xl bg-muted/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.role}</p>
                  </div>
                  <Badge variant={driver.status === 'Active' ? 'success' : 'default'} className="text-xs">
                    {driver.status}
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: driver.status === 'Active' ? '88%' : '34%' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
