import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAuditEvent } from '../../lib/auth';
import type { Product } from '../../lib/types';
import { ADMIN_ROUTE } from '../../lib/auth';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchData = useCallback(async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
    }

    if (filterType) {
      query = query.eq('product_type', filterType);
    }

    const { data } = await query.limit(50);
    if (data) setProducts(data);
  }, [searchQuery, filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    await logAuditEvent('delete', 'product', id, { name }, null);
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const productTypes = [
    { value: 'account', label: 'Game Accounts' },
    { value: 'topup', label: 'Top Up' },
    { value: 'boosting', label: 'Boosting' },
    { value: 'item', label: 'In-Game Items' },
    { value: 'service', label: 'Services' },
    { value: 'giftcard', label: 'Gift Cards' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Products</h1>
          <p className="text-gray-500">Manage all products in your store</p>
        </div>
        <a href={`${ADMIN_ROUTE}/products/new`} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </a>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 glass px-4 py-2 rounded-xl flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="">All Types</option>
            {productTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-primary capitalize">{product.product_type}</span>
                  </td>
                  <td className="px-6 py-4 text-white">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {product.stock_unlimited ? (
                      <span className="text-success-400">Unlimited</span>
                    ) : (
                      <span className={product.stock_quantity < 10 ? 'text-error-400' : 'text-white'}>
                        {product.stock_quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${product.is_active ? 'badge-success' : 'bg-gray-500/20 text-gray-400'}`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4" />
                      </a>
                      <a
                        href={`${ADMIN_ROUTE}/products/${product.id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-gray-400 hover:text-error-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
