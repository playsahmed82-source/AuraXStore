import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SecurityLog, AuditLog } from '../../lib/types';

export default function AdminSecurityLogsPage() {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'security' | 'audit'>('security');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = useCallback(async () => {
    if (activeTab === 'security') {
      let query = supabase.from('security_logs').select('*').order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`action.ilike.%${searchQuery}%`);
      }

      if (filterAction) {
        query = query.eq('action', filterAction);
      }

      const { data } = await query.limit(100);
      if (data) setSecurityLogs(data);
    } else {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`action.ilike.%${searchQuery}%,entity_type.ilike.%${searchQuery}%`);
      }

      if (filterAction) {
        query = query.eq('action', filterAction);
      }

      const { data } = await query.limit(100);
      if (data) setAuditLogs(data);
    }
  }, [activeTab, searchQuery, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban')) return 'badge-error';
    if (action.includes('create') || action.includes('login')) return 'badge-success';
    if (action.includes('update')) return 'badge-warning';
    return 'badge-primary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Security & Audit Logs</h1>
        <p className="text-gray-500">Monitor system activity and security events</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Security Logs
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Audit Logs
            </button>
          </div>

          <div className="flex-1 glass px-4 py-2 rounded-xl flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="">All Actions</option>
            {activeTab === 'security' ? (
              <>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="admin_access">Admin Access</option>
                <option value="failed_login">Failed Login</option>
              </>
            ) : (
              <>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                {activeTab === 'audit' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Entity</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeTab === 'security' ? (
                securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getActionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {log.user_id ? log.user_id.slice(0, 8) + '...' : 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getActionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {log.entity_type ? `${log.entity_type}:${log.entity_id?.slice(0, 8)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {log.old_values || log.new_values ? 'Changes recorded' : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
