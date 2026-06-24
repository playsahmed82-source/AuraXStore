import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import type { Order } from '../../lib/types';

export default function OrdersPage() {
  const { auth } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.user) {
      fetchOrders();
    }
  }, [auth.user]);

  const fetchOrders = async () => {
    if (!auth.user) return;

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
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
        return <CheckCircle className="w-5 h-5 text-success-400" />;
      case 'processing':
      case 'paid':
        return <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />;
      case 'pending':
      case 'awaiting_payment':
        return <Clock className="w-5 h-5 text-warning-400" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-error-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-48 mb-4" />
            <div className="h-4 bg-white/5 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-display font-bold text-white">My Orders</h1>
        <p className="text-gray-500 mt-1">View and track your order history</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-mono text-white font-medium">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${order.total.toFixed(2)}</p>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <Link
                    to={`/dashboard/orders/${order.id}`}
                    className="btn-secondary text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Payment:</span>
                  <span className="text-white capitalize">{order.payment_method || 'Pending'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
