import { useState } from 'react';
import { User, Camera, Mail, Phone, Lock, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const { auth } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: auth.profile?.username || '',
    full_name: auth.profile?.full_name || '',
    phone: auth.profile?.phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auth.user!.id);

      if (error) throw error;
      setSuccess('Profile updated successfully!');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-display font-bold text-white">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="btn-secondary text-sm mx-auto">
              <Camera className="w-4 h-4 mr-2" />
              Change Avatar
            </button>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-white">
                {auth.profile?.created_at
                  ? new Date(auth.profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-success-500/10 border border-success-500/20 flex items-center gap-3">
                <Check className="w-5 h-5 text-success-400" />
                <p className="text-sm text-success-400">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-error-500/10 border border-error-500/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error-400" />
                <p className="text-sm text-error-400">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={auth.profile?.email || ''}
                    className="input-field bg-dark-300 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button onClick={handleSave} disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" />
                  Password
                </h3>
                <p className="text-sm text-gray-500 mt-1">Change your account password</p>
              </div>
              <button className="btn-secondary">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
