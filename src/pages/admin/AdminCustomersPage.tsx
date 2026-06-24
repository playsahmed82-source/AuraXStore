import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchCustomers = useCallback(async () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`email.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
    }

    if (filterRole) {
      query = query.eq('role', filterRole);
    }

    const { data } = await query.limit(100);
    if (data) setCustomers(data);
  }, [searchQuery, filterRole]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const updateRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchCustomers();
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId);
    fetchCustomers();
  };

  const roles = ['customer', 'seller', 'admin', 'super_admin'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Customers</h1>
        <p className="text-gray-500">Manage user accounts and permissions</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 glass px-4 py-2 rounded-xl flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role} className="capitalize">{role.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">2FA</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {(customer.username || customer.email)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white">{customer.username || 'No username'}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={customer.role}
                      onChange={(e) => updateRole(customer.id, e.target.value)}
                      className="bg-transparent text-white capitalize focus:outline-none"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role} className="bg-dark-100 capitalize">
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${customer.is_banned ? 'badge-error' : 'badge-success'}`}>
                      {customer.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${customer.two_factor_enabled ? 'badge-success' : 'bg-gray-500/20 text-gray-400'}`}>
                      {customer.two_factor_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleBan(customer.id, customer.is_banned)}
                      className={`text-sm ${customer.is_banned ? 'text-success-400 hover:text-success-300' : 'text-error-400 hover:text-error-300'}`}
                    >
                      {customer.is_banned ? 'Unban' : 'Ban'}
                    </button>
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
