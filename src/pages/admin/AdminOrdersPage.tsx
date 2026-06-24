import { useEffect, useState, useCallback } from 'react';
import { Search, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAuditEvent } from '../../lib/auth';
import type { Order, OrderItem } from '../../lib/types';

const statuses = [
  { value: 'pending', label: 'Pending', color: 'badge-warning' },
  { value: 'awaiting_payment', label: 'Awaiting Payment', color: 'badge-warning' },
  { value: 'paid', label: 'Paid', color: 'badge-primary' },
  { value: 'processing', label: 'Processing', color: 'badge-primary' },
  { value: 'delivered', label: 'Delivered', color: 'badge-success' },
  { value: 'completed', label: 'Completed', color: 'badge-success' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'badge-error' },
];

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'badge-warning' },
  { value: 'processing', label: 'Processing', color: 'badge-primary' },
  { value: 'completed', label: 'Completed', color: 'badge-success' },
  { value: 'failed', label: 'Failed', color: 'badge-error' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500/20 text-gray-400' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`order_number.ilike.%${searchQuery}%`);
    }

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query.limit(100);

    if (data) {
      setOrders(data);

      // Fetch order items for all orders
      const orderIds = data.map(o => o.id);
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (items) {
        const grouped: Record<string, OrderItem[]> = {};
        items.forEach(item => {
          if (!grouped[item.order_id]) grouped[item.order_id] = [];
          grouped[item.order_id].push(item);
        });
        setOrderItems(grouped);
      }
    }
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsUpdating(true);

    const oldOrder = orders.find(o => o.id === orderId);
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);

    await logAuditEvent('update', 'order', orderId, { status: oldOrder?.status }, { status });

    fetchOrders();
    setIsUpdating(false);
  };

  const getPaymentStatusColor = (status: string) => {
    return paymentStatuses.find(s => s.value === status)?.color || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
        <p className="text-gray-500">Manage customer orders</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 glass px-4 py-2 rounded-xl flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="glass-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="font-mono text-white font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order Status</p>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-transparent text-white font-medium focus:outline-none"
                    disabled={isUpdating}
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value} className="bg-dark-100">
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Payment</p>
                  <span className={`badge ${getPaymentStatusColor(order.payment_status || 'pending')}`}>
                    {order.payment_status || 'pending'}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-white">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {orderItems[order.id] && orderItems[order.id].length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-500 mb-2">Items ({orderItems[order.id].length})</p>
                <div className="flex flex-wrap gap-2">
                  {orderItems[order.id].map((item) => (
                    <div key={item.id} className="glass px-3 py-2 rounded-lg text-sm text-gray-400">
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
