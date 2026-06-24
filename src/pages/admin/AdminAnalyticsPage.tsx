import { useEffect, useState, useCallback } from 'react';
import { Users, ShoppingCart, DollarSign, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { DailyAnalytics } from '../../lib/types';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<DailyAnalytics[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [totals, setTotals] = useState({
    revenue: 0,
    orders: 0,
    pageViews: 0,
    visitors: 0,
    newUsers: 0,
  });

  const fetchAnalytics = useCallback(async () => {

    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await supabase
      .from('daily_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) {
      setAnalytics(data);

      const totalsData = data.reduce((acc, day) => ({
        revenue: acc.revenue + (day.total_revenue || 0),
        orders: acc.orders + (day.total_orders || 0),
        pageViews: acc.pageViews + (day.page_views || 0),
        visitors: acc.visitors + (day.unique_visitors || 0),
        newUsers: acc.newUsers + (day.new_users || 0),
      }), { revenue: 0, orders: 0, pageViews: 0, visitors: 0, newUsers: 0 });

      setTotals(totalsData);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = [
    {
      name: 'Total Revenue',
      value: totals.revenue,
      prefix: '$',
      icon: DollarSign,
      color: 'from-success-500 to-success-400',
    },
    {
      name: 'Total Orders',
      value: totals.orders,
      icon: ShoppingCart,
      color: 'from-primary-500 to-primary-400',
    },
    {
      name: 'Page Views',
      value: totals.pageViews,
      icon: Eye,
      color: 'from-accent-500 to-accent-400',
    },
    {
      name: 'Unique Visitors',
      value: totals.visitors,
      icon: Users,
      color: 'from-warning-500 to-warning-400',
    },
  ];

  const maxRevenue = Math.max(...analytics.map(a => a.total_revenue || 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
          <p className="text-gray-500">Revenue reports and performance metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-gray-500 text-sm">{stat.name}</p>
            <p className="text-2xl font-bold text-white mt-1">
              {stat.prefix}{stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Revenue Overview</h2>

        <div className="h-64 flex items-end gap-2">
          {analytics.map((day) => {
            const height = Math.max(((day.total_revenue || 0) / maxRevenue) * 100, 2);
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all group-hover:from-primary-500 group-hover:to-primary-300"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white whitespace-nowrap">${day.total_revenue || 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-600">
          <span>{analytics[0]?.date}</span>
          <span>{analytics[analytics.length - 1]?.date}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Orders</h2>
          <div className="h-48 flex items-end gap-1">
            {analytics.map((day) => {
              const maxOrders = Math.max(...analytics.map(a => a.total_orders || 0), 1);
              const height = Math.max(((day.total_orders || 0) / maxOrders) * 100, 2);
              return (
                <div key={day.date} className="flex-1">
                  <div
                    className="w-full bg-accent-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: '2px' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Page Views</h2>
          <div className="h-48 flex items-end gap-1">
            {analytics.map((day) => {
              const maxViews = Math.max(...analytics.map(a => a.page_views || 0), 1);
              const height = Math.max(((day.page_views || 0) / maxViews) * 100, 2);
              return (
                <div key={day.date} className="flex-1">
                  <div
                    className="w-full bg-success-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: '2px' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
