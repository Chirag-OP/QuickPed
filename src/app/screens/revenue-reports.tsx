import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, CalendarDays, DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const revenueData = [
  { name: 'Mon', revenue: 4800 },
  { name: 'Tue', revenue: 5200 },
  { name: 'Wed', revenue: 5900 },
  { name: 'Thu', revenue: 6200 },
  { name: 'Fri', revenue: 7100 },
  { name: 'Sat', revenue: 7600 },
  { name: 'Sun', revenue: 8200 },
];

export const RevenueReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const periodSummary = useMemo(() => {
    const total = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const average = Math.round(total / revenueData.length);
    return { total, average };
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="text-primary" size={30} />
            <div>
              <h1 className="text-3xl font-bold">Revenue Reports</h1>
              <p className="text-muted-foreground">View revenue and rider spend trends.</p>
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
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{periodSummary.total}</p>
                </div>
                <DollarSign className="text-primary" size={26} />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-3xl bg-muted p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Daily Revenue</p>
                  <p className="text-2xl font-bold">₹{periodSummary.average}</p>
                </div>
                <TrendingUp className="text-green-500" size={26} />
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
                  <p>Revenue increased by 22% this week</p>
                </div>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowUpRight size={18} />
                  <p>Rider conversion improved by 8%</p>
                </div>
              </div>
              <Button className="w-full">Generate detailed report</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
