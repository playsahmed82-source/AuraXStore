import { useEffect, useState, useCallback } from 'react';
import { Tag, Percent, DollarSign, Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAuditEvent } from '../../lib/auth';
import type { Coupon } from '../../lib/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 0,
    min_quantity: 1,
    max_uses: 100,
    valid_from: '',
    valid_until: '',
    first_order_only: false,
    is_active: true,
  });

  const fetchCoupons = useCallback(async () => {
    let query = supabase.from('coupons').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.ilike('code', `%${searchQuery}%`);
    }

    const { data } = await query;
    if (data) setCoupons(data);
  }, [searchQuery]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(formData)
        .eq('id', editingCoupon.id);

      if (!error) {
        await logAuditEvent('update', 'coupon', editingCoupon.id, null, formData);
      }
    } else {
      const { error } = await supabase.from('coupons').insert(formData);

      if (!error) {
        await logAuditEvent('create', 'coupon', 'new', null, formData);
      }
    }

    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
    fetchCoupons();
    setIsSaving(false);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;

    await logAuditEvent('delete', 'coupon', id, { code }, null);
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from('coupons').update({ is_active }).eq('id', id);
    fetchCoupons();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_value: 0,
      min_quantity: 1,
      max_uses: 100,
      valid_from: '',
      valid_until: '',
      first_order_only: false,
      is_active: true,
    });
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value || 0,
      min_quantity: coupon.min_quantity,
      max_uses: coupon.max_uses || 100,
      valid_from: coupon.valid_from || '',
      valid_until: coupon.valid_until || '',
      first_order_only: coupon.first_order_only,
      is_active: coupon.is_active,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Coupons</h1>
          <p className="text-gray-500">Manage discount coupons and promotions</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="glass px-4 py-2 rounded-xl flex items-center">
          <Tag className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  {coupon.discount_type === 'percentage' ? (
                    <Percent className="w-6 h-6 text-primary-400" />
                  ) : (
                    <DollarSign className="w-6 h-6 text-primary-400" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-xl text-white">{coupon.code}</p>
                  <p className="text-sm text-gray-500">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Uses</p>
                  <p className="text-white">{coupon.current_uses} / {coupon.max_uses || '∞'}</p>
                </div>

                <button
                  onClick={() => toggleActive(coupon.id, !coupon.is_active)}
                  className={`px-3 py-1 rounded-lg text-sm ${coupon.is_active ? 'bg-success-500/20 text-success-400' : 'bg-gray-500/20 text-gray-400'}`}
                >
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </button>

                <button onClick={() => openEditModal(coupon)} className="p-2 text-gray-400 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(coupon.id, coupon.code)} className="p-2 text-gray-400 hover:text-error-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="relative glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Value</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Min Order Value</label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) })}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Uses</label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={formData.first_order_only}
                  onChange={(e) => setFormData({ ...formData, first_order_only: e.target.checked })}
                />
                First order only
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">
                  {isSaving ? <Save className="w-5 h-5 animate-spin" /> : editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
