import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, CalendarDays, DollarSign, ArrowUpRight, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';
import { getCompletedRides, getRevenueMetrics, type InstituteData } from '../lib/admin-data';
import { downloadInstituteReport, type ReportFormat } from '../lib/report-export';
interface RevenueReportsProps {
  institute: InstituteData;
}
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const buildRevenueData = (institute: InstituteData, period: 'weekly' | 'monthly') => {
  const completedRides = getCompletedRides(institute.rideHistory);
  const now = new Date();
  if (period === 'weekly') {
    const today = startOfDay(now);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      const revenue = completedRides.reduce((sum, ride) => {
        const rideDate = new Date(ride.completedAt);
        return Number.isNaN(rideDate.getTime()) || !isSameDay(rideDate, day) ? sum : sum + ride.fare;
      }, 0);
      return {
        name: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue,
      };
    });
  }
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekCount = Math.ceil(now.getDate() / 7);
  return Array.from({ length: Math.max(1, weekCount) }, (_, index) => {
    const rangeStart = new Date(monthStart);
    rangeStart.setDate(monthStart.getDate() + index * 7);
    const rangeEnd = new Date(monthStart);
    rangeEnd.setDate(Math.min(monthStart.getDate() + index * 7 + 6, now.getDate()));
    rangeEnd.setHours(23, 59, 59, 999);
    const revenue = completedRides.reduce((sum, ride) => {
      const rideDate = new Date(ride.completedAt);
      return Number.isNaN(rideDate.getTime()) || rideDate < rangeStart || rideDate > rangeEnd ? sum : sum + ride.fare;
    }, 0);
    return {
      name: `Week ${index + 1}`,
      revenue,
    };
  });
};
export const RevenueReports: React.FC<RevenueReportsProps> = ({ institute }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [reportOptionsOpen, setReportOptionsOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState('');
  const revenueData = useMemo(
    () => buildRevenueData(institute, selectedPeriod),
    [institute, selectedPeriod]
  );
  const revenueMetrics = useMemo(() => getRevenueMetrics(institute), [institute]);
  const completedRides = useMemo(() => getCompletedRides(institute.rideHistory), [institute.rideHistory]);
  const periodSummary = useMemo(() => {
    const total = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const average = Math.round(total / revenueData.length);
    return { total, average };
  }, [revenueData]);
  const handleDownloadReport = (format: ReportFormat) => {
    const message = downloadInstituteReport(institute, format);
    setReportStatus(message);
  };
  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-primary" size={30} />
            <div>
              <h1 className="text-3xl font-bold">Revenue Reports</h1>
              <p className="text-muted-foreground">View {institute.name} revenue and rider spend trends.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={selectedPeriod === 'weekly' ? 'secondary' : 'outline'} onClick={() => setSelectedPeriod('weekly')}>
            Weekly
          </Button>
          <Button variant={selectedPeriod === 'monthly' ? 'secondary' : 'outline'} onClick={() => setSelectedPeriod('monthly')}>
            Monthly
          </Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2 rounded-3xl bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.daily)}</p>
                </div>
                <DollarSign className="text-primary" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-3xl bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.weekly)}</p>
                </div>
                <TrendingUp className="text-orange-500" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-3xl bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.monthly)}</p>
                </div>
                <CalendarDays className="text-info" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-3xl bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(revenueMetrics.total)}</p>
                </div>
                <ArrowUpRight className="text-primary" size={26} />
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={18} />
                  <p>{completedRides.length} completed rides in this institute</p>
                </div>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowUpRight size={18} />
                  <p>{institute.activeRides} active rides currently underway</p>
                </div>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText size={18} />
                  <p>{formatCurrency(periodSummary.total)} shown in the selected {selectedPeriod} chart</p>
                </div>
              </div>
              {reportStatus && (
                <Badge className="bg-success/10 text-success">
                  {reportStatus}
                </Badge>
              )}
              <Button className="w-full" onClick={() => setReportOptionsOpen((open) => !open)}>Generate Report</Button>
              {reportOptionsOpen && (
                <div className="grid grid-cols-3 gap-2">
                  {(['pdf', 'csv', 'excel'] as ReportFormat[]).map((format) => (
                    <Button key={format} variant="outline" onClick={() => handleDownloadReport(format)} className="uppercase">
                      {format === 'excel' ? 'Excel' : format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
