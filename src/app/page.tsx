'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface DashboardMetrics {
  totalEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  upcomingEvents: number;
  recentUploads: Array<{
    id: string;
    filename: string;
    platform: string;
    status: string;
    createdAt: string;
    recordsProcessed: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    count: number;
  }>;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="apple-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Apple-style color palette
  const COLORS = ['#0A84FF', '#30D158', '#FF453A', '#BF5AF2', '#FFD60A'];

  // Custom tooltip with Apple styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-system-gray-800 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-lg shadow-xl">
          <p className="text-xs font-medium text-white/80 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-white/60">
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              {entry.name}: {entry.name === 'revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-8 animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-white/60">
          Monitor your event performance and analytics
        </p>
      </div>

      {/* Key Metrics Cards - Apple style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="apple-card border-white/5 hover:bg-white/[0.02] transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-white">
                {metrics?.totalEvents || 0}
              </span>
              <div className="flex items-center gap-1 text-system-green">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-xs font-medium">12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card border-white/5 hover:bg-white/[0.02] transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-white">
                ${(metrics?.totalRevenue || 0).toLocaleString()}
              </span>
              <div className="flex items-center gap-1 text-system-green">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-xs font-medium">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card border-white/5 hover:bg-white/[0.02] transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-white">
                {(metrics?.totalTicketsSold || 0).toLocaleString()}
              </span>
              <div className="flex items-center gap-1 text-system-green">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-xs font-medium">18%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card border-white/5 hover:bg-white/[0.02] transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold text-white">
                {metrics?.upcomingEvents || 0}
              </span>
              <Badge className="bg-system-blue/10 text-system-blue border-0">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Monthly Revenue Chart */}
        <Card className="apple-card border-white/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">
                Revenue Trends
              </CardTitle>
              <Badge className="bg-white/5 text-white/60 border-0 font-normal">
                Monthly
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {metrics?.monthlyRevenue && metrics.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={metrics.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} />
                  <XAxis
                    dataKey="month"
                    stroke="#ffffff"
                    opacity={0.3}
                    tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#ffffff"
                    opacity={0.3}
                    tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0A84FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-white/40 text-sm">No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="apple-card border-white/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">
                Platform Distribution
              </CardTitle>
              <Badge className="bg-white/5 text-white/60 border-0 font-normal">
                All Time
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {metrics?.platformBreakdown && metrics.platformBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={metrics.platformBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ platform, percent }: any) =>
                      `${platform}: ${((percent as number) * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.platformBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-white/40 text-sm">No platform data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads Table - Apple style */}
      <Card className="apple-card border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Recent Uploads
            </CardTitle>
            {metrics?.recentUploads && metrics.recentUploads.filter(u => u.status === 'PROCESSING').length > 0 && (
              <Badge className="bg-system-blue/10 text-system-blue border-0">
                {metrics.recentUploads.filter(u => u.status === 'PROCESSING').length} Processing
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {metrics?.recentUploads && metrics.recentUploads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60 font-medium text-xs">File</TableHead>
                    <TableHead className="text-white/60 font-medium text-xs">Platform</TableHead>
                    <TableHead className="text-white/60 font-medium text-xs">Status</TableHead>
                    <TableHead className="text-white/60 font-medium text-xs text-right">Records</TableHead>
                    <TableHead className="text-white/60 font-medium text-xs text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentUploads.map((upload) => (
                    <TableRow
                      key={upload.id}
                      className="border-white/10 hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="font-medium text-sm">
                        <span className="text-white/90">{upload.filename}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/20 text-white/60 bg-transparent">
                          {upload.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 ${
                            upload.status === 'COMPLETED'
                              ? 'bg-system-green/10 text-system-green'
                              : upload.status === 'PROCESSING'
                              ? 'bg-system-blue/10 text-system-blue'
                              : 'bg-system-red/10 text-system-red'
                          }`}
                        >
                          {upload.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-white/60">
                        {upload.recordsProcessed.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-white/40 text-sm">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-white/40 text-sm">
                No uploads yet. Upload a CSV file to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}