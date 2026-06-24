import { useEffect, useState } from 'react';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingBag, Heart, Ticket, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Order } from '../../lib/types';

export default function DashboardOverview() {
  const { auth } = useStore();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
    tickets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.user) {
      fetchDashboardData();
    }
  }, [auth.user]);

  const fetchDashboardData = async () => {
    if (!auth.user) return;

    setIsLoading(true);

    const [ordersRes, wishlistRes, ticketsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('wishlist_items').select('id', { count: 'exact' }).eq('user_id', auth.user.id),
      supabase.from('support_tickets').select('id', { count: 'exact' }).eq('user_id', auth.user.id),
    ]);

    if (ordersRes.data) {
      setRecentOrders(ordersRes.data);
      const completed = ordersRes.data.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      setStats(prev => ({ ...prev, totalOrders: ordersRes.data!.length, completedOrders: completed }));
    }

    if (wishlistRes.count !== null) {
      setStats(prev => ({ ...prev, wishlistItems: wishlistRes.count || 0 }));
    }

    if (ticketsRes.count !== null) {
      setStats(prev => ({ ...prev, tickets: ticketsRes.count || 0 }));
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
      case 'cancelled':
      case 'refunded':
        return 'badge-error';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return CheckCircle;
      case 'processing':
      case 'paid':
        return Clock;
      case 'pending':
      case 'awaiting_payment':
        return AlertCircle;
      default:
        return Package;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-white/5 rounded w-48 mb-4" />
          <div className="h-4 bg-white/5 rounded w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Welcome back, {auth.profile?.username || auth.profile?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-500">Here's an overview of your account activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-400" />
            </div>
            <span className="text-gray-500">Total Orders</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-400" />
            </div>
            <span className="text-gray-500">Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.completedOrders}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-error-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-error-400" />
            </div>
            <span className="text-gray-500">Wishlist</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.wishlistItems}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-accent-400" />
            </div>
            <span className="text-gray-500">Tickets</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.tickets}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <a href="/dashboard/orders" className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <a href="/products" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${order.total.toFixed(2)}</p>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a
              href="/products"
              className="p-4 rounded-xl bg-primary-500/20 border border-primary-500/30 hover:border-primary-500/50 transition-colors text-center"
            >
              <ShoppingBag className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Browse Products</p>
            </a>

            <a
              href="/support"
              className="p-4 rounded-xl bg-accent-500/20 border border-accent-500/30 hover:border-accent-500/50 transition-colors text-center"
            >
              <Ticket className="w-8 h-8 text-accent-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Create Ticket</p>
            </a>

            <a
              href="/dashboard/wishlist"
              className="p-4 rounded-xl bg-error-500/20 border border-error-500/30 hover:border-error-500/50 transition-colors text-center"
            >
              <Heart className="w-8 h-8 text-error-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">View Wishlist</p>
            </a>

            <a
              href="/dashboard/profile"
              className="p-4 rounded-xl bg-success-500/20 border border-success-500/30 hover:border-success-500/50 transition-colors text-center"
            >
              <TrendingUp className="w-8 h-8 text-success-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-white">Edit Profile</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
