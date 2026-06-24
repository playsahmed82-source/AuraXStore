import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  Ticket,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../lib/types';

interface Stats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  products: number;
  customers: number;
  tickets: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    revenueChange: 12,
    orders: 0,
    ordersChange: 8,
    products: 0,
    customers: 0,
    tickets: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const [productsRes, ordersRes, customersRes, ticketsRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + order.total, 0) || 0;

    setStats({
      revenue: totalRevenue,
      revenueChange: 12,
      orders: ordersRes.data?.length || 0,
      ordersChange: 8,
      products: productsRes.count || 0,
      customers: customersRes.count || 0,
      tickets: ticketsRes.count || 0,
    });

    if (ordersRes.data) {
      setRecentOrders(ordersRes.data.slice(0, 5));
    }

    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'badge-success';
      case 'processing':
      case 'paid':
        return 'badge-primary';
      case 'pending':
      case 'awaiting_payment':
        return 'badge-warning';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-20 mb-4" />
              <div className="h-8 bg-white/5 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-gray-500">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-success-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-success-400">
              <ArrowUpRight className="w-4 h-4" />
              {stats.revenueChange}%
            </span>
          </div>
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-white">${stats.revenue.toFixed(2)}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-success-400">
              <ArrowUpRight className="w-4 h-4" />
              {stats.ordersChange}%
            </span>
          </div>
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-white">{stats.orders}</p>
        </div>

        <div className="glass-card p-6">
          <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-accent-400" />
          </div>
          <p className="text-gray-500 text-sm">Customers</p>
          <p className="text-2xl font-bold text-white">{stats.customers}</p>
        </div>

        <div className="glass-card p-6">
          <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center mb-4">
            <Ticket className="w-5 h-5 text-warning-400" />
          </div>
          <p className="text-gray-500 text-sm">Open Tickets</p>
          <p className="text-2xl font-bold text-white">{stats.tickets}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {order.status === 'completed' || order.status === 'delivered' ? (
                      <CheckCircle className="w-5 h-5 text-success-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning-400" />
                    )}
                    <div>
                      <p className="font-mono text-sm text-white">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/products"
              className="p-4 rounded-xl bg-primary-500/20 border border-primary-500/30 hover:border-primary-500/50 transition-colors"
            >
              <Package className="w-8 h-8 text-primary-400 mb-2" />
              <p className="text-sm font-medium text-white">Manage Products</p>
              <p className="text-xs text-gray-500">{stats.products} active</p>
            </Link>

            <Link
              to="/admin/orders"
              className="p-4 rounded-xl bg-accent-500/20 border border-accent-500/30 hover:border-accent-500/50 transition-colors"
            >
              <ShoppingCart className="w-8 h-8 text-accent-400 mb-2" />
              <p className="text-sm font-medium text-white">View Orders</p>
              <p className="text-xs text-gray-500">{stats.orders} total</p>
            </Link>

            <Link
              to="/admin/customers"
              className="p-4 rounded-xl bg-success-500/20 border border-success-500/30 hover:border-success-500/50 transition-colors"
            >
              <Users className="w-8 h-8 text-success-400 mb-2" />
              <p className="text-sm font-medium text-white">Customers</p>
              <p className="text-xs text-gray-500">{stats.customers} registered</p>
            </Link>

            <Link
              to="/admin/support"
              className="p-4 rounded-xl bg-warning-500/20 border border-warning-500/30 hover:border-warning-500/50 transition-colors"
            >
              <Ticket className="w-8 h-8 text-warning-400 mb-2" />
              <p className="text-sm font-medium text-white">Support</p>
              <p className="text-xs text-gray-500">{stats.tickets} open</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
