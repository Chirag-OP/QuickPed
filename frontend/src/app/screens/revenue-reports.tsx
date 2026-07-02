import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, CalendarDays, DollarSign, ArrowUpRight, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';
import { getCompletedRides, getRevenueMetrics, type InstituteData } from '../lib/admin-data';
import { buildWeeklyChart, getInstituteAnalytics } from '../lib/admin-analytics';
import { downloadInstituteReport, type ReportFormat } from '../lib/report-export';

interface RevenueReportsProps {
  institute: InstituteData;
}

const buildRevenueData = (institute: InstituteData, period: 'weekly' | 'monthly') => {
  if (period === 'weekly') {
    return buildWeeklyChart(institute.rideHistory).map((point) => ({
      name: point.day,
      revenue: point.revenue,
      rides: point.rides,
    }));
  }

  const completedRides = getCompletedRides(institute.rideHistory);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekCount = Math.ceil(now.getDate() / 7);
  return Array.from({ length: Math.max(1, weekCount) }, (_, index) => {
    const rangeStart = new Date(monthStart);
    rangeStart.setDate(monthStart.getDate() + index * 7);
    const rangeEnd = new Date(monthStart);
    rangeEnd.setDate(Math.min(monthStart.getDate() + index * 7 + 6, now.getDate()));
    rangeEnd.setHours(23, 59, 59, 999);
    const weekRides = completedRides.filter((ride) => {
      const rideDate = new Date(ride.completedAt);
      return !Number.isNaN(rideDate.getTime()) && rideDate >= rangeStart && rideDate <= rangeEnd;
    });
    const revenue = weekRides.reduce((sum, ride) => sum + ride.fare, 0);
    return {
      name: `Week ${index + 1}`,
      revenue,
      rides: weekRides.length,
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
  const analytics = useMemo(() => getInstituteAnalytics(institute), [institute]);
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
    <div className="min-h-full bg-[#F9F9F9] p-6 pb-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-[#ee5f13]" size={30} />
            <div>
              <h1 className="text-3xl font-bold text-[#1f1714]">Revenue Reports</h1>
              <p className="text-muted-foreground">View {institute.name} revenue and rider spend trends.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={selectedPeriod === 'weekly' ? 'secondary' : 'outline'} className="rounded-full" onClick={() => setSelectedPeriod('weekly')}>
            Weekly
          </Button>
          <Button variant={selectedPeriod === 'monthly' ? 'secondary' : 'outline'} className="rounded-full" onClick={() => setSelectedPeriod('monthly')}>
            Monthly
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-0 rounded-[24px] shadow-[0_8px_18px_rgba(15,15,15,0.035)] bg-white">
          <CardHeader>
            <CardTitle className="text-gray-800 font-bold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ee5f13" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ee5f13" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#ee5f13" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 rounded-[24px] shadow-[0_8px_18px_rgba(15,15,15,0.035)] bg-white">
            <CardHeader>
              <CardTitle className="text-gray-800 font-bold">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#f3f1ee] p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(revenueMetrics.daily)}</p>
                </div>
                <DollarSign className="text-[#ee5f13]" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#f3f1ee] p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(revenueMetrics.weekly)}</p>
                </div>
                <TrendingUp className="text-[#ee5f13]" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#f3f1ee] p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(revenueMetrics.monthly)}</p>
                </div>
                <CalendarDays className="text-[#ee5f13]" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#f3f1ee] p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(revenueMetrics.total)}</p>
                </div>
                <ArrowUpRight className="text-[#ee5f13]" size={26} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 rounded-[24px] shadow-[0_8px_18px_rgba(15,15,15,0.035)] bg-white">
            <CardHeader>
              <CardTitle className="text-gray-800 font-bold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-[#f3f1ee] p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={18} className="text-[#ee5f13]" />
                  <p className="text-gray-700 text-sm font-semibold">{completedRides.length} completed rides in this institute</p>
                </div>
              </div>
              <div className="rounded-3xl bg-[#f3f1ee] p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowUpRight size={18} className="text-[#ee5f13]" />
                  <p className="text-gray-700 text-sm font-semibold">{institute.activeRides} active rides currently underway</p>
                </div>
              </div>
              <div className="rounded-3xl bg-[#f3f1ee] p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp size={18} className="text-[#ee5f13]" />
                  <p className="text-gray-700 text-sm font-semibold">
                    {analytics.rides.totalDurationMinutes} total ride minutes · avg {analytics.avgRideDurationMinutes} min
                  </p>
                </div>
              </div>
              <div className="rounded-3xl bg-[#f3f1ee] p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText size={18} className="text-[#ee5f13]" />
                  <p className="text-gray-700 text-sm font-semibold">{formatCurrency(periodSummary.total)} shown in the selected {selectedPeriod} chart</p>
                </div>
              </div>
              {reportStatus && (
                <Badge className="bg-green-50 text-green-700 border border-green-200">
                  {reportStatus}
                </Badge>
              )}
              <Button className="w-full bg-[#181818] hover:bg-[#111] text-white rounded-full" onClick={() => setReportOptionsOpen((open) => !open)}>Generate Report</Button>
              {reportOptionsOpen && (
                <div className="grid grid-cols-3 gap-2">
                  {(['pdf', 'csv', 'excel'] as ReportFormat[]).map((format) => (
                    <Button key={format} variant="outline" onClick={() => handleDownloadReport(format)} className="uppercase rounded-full">
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
