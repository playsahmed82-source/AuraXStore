import { useEffect, useState, useCallback } from 'react';
import { Store, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SellerApplication, Profile } from '../../lib/types';

export default function AdminSellersPage() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [users, setUsers] = useState<Record<string, Profile>>({});
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchApplications = useCallback(async () => {
    let query = supabase.from('seller_applications').select('*').order('created_at', { ascending: false });

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query.limit(100);

    if (data) {
      setApplications(data);

      const userIds = [...new Set(data.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profiles) {
        const grouped: Record<string, Profile> = {};
        profiles.forEach(p => {
          grouped[p.id] = p as Profile;
        });
        setUsers(grouped);
      }
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setIsUpdating(true);

    const app = applications.find(a => a.id === id);

    await supabase
      .from('seller_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        notes: reviewNotes,
      })
      .eq('id', id);

    if (status === 'approved' && app) {
      await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', app.user_id);
    }

    setSelectedApp(null);
    setReviewNotes('');
    setIsUpdating(false);
    fetchApplications();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-error';
      case 'under_review': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Seller Applications</h1>
        <p className="text-gray-500">Review and manage seller applications</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <div key={app.id} className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{app.business_name}</p>
                  <p className="text-sm text-gray-500">{app.business_email}</p>
                  {users[app.user_id] && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <span>{users[app.user_id].email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`badge ${getStatusColor(app.status)}`}>
                  {app.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {app.description && (
              <p className="text-sm text-gray-400 mt-4">{app.description}</p>
            )}

            {app.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewNotes('');
                  }}
                  className="btn-secondary text-sm flex-1"
                >
                  Review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedApp(null)} />
          <div className="relative glass-card p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Review Application</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-500">Business Name</p>
                <p className="text-white">{selectedApp.business_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white">{selectedApp.business_email}</p>
              </div>
              {selectedApp.business_type && (
                <div>
                  <p className="text-xs text-gray-500">Business Type</p>
                  <p className="text-white capitalize">{selectedApp.business_type}</p>
                </div>
              )}
              {selectedApp.description && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-white">{selectedApp.description}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Add notes about this application..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => updateStatus(selectedApp.id, 'rejected')}
                disabled={isUpdating}
                className="btn-secondary flex-1 text-error-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => updateStatus(selectedApp.id, 'approved')}
                disabled={isUpdating}
                className="btn-primary flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
