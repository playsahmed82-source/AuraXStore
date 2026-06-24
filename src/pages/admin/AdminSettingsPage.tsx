import { useEffect, useState, useCallback } from 'react';
import { Save, CreditCard, Shield, Globe, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const grouped: Record<string, string> = {};
      data.forEach(s => {
        grouped[s.key] = s.value;
      });
      setSettings(grouped);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);

    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' });
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
          <p className="text-gray-500">Configure your store settings</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20 text-success-400">
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => updateSetting('site_name', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Tagline</label>
              <input
                type="text"
                value={settings.site_tagline || ''}
                onChange={(e) => updateSetting('site_tagline', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => updateSetting('support_email', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-accent-400" />
            <h2 className="text-lg font-semibold text-white">Payment Settings</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={settings.stripe_enabled === 'true'}
                onChange={(e) => updateSetting('stripe_enabled', e.target.checked ? 'true' : 'false')}
                className="rounded border-gray-600 bg-dark-300 text-primary-500"
              />
              Enable Stripe Payments
            </label>

            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={settings.paypal_enabled === 'true'}
                onChange={(e) => updateSetting('paypal_enabled', e.target.checked ? 'true' : 'false')}
                className="rounded border-gray-600 bg-dark-300 text-primary-500"
              />
              Enable PayPal Payments
            </label>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-warning-400" />
            <h2 className="text-lg font-semibold text-white">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={settings.two_factor_required_for_admin === 'true'}
                onChange={(e) => updateSetting('two_factor_required_for_admin', e.target.checked ? 'true' : 'false')}
                className="rounded border-gray-600 bg-dark-300 text-primary-500"
              />
              Require 2FA for Admin Accounts
            </label>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Admin Route (Hidden URL)</label>
              <input
                type="text"
                value={settings.admin_route || ''}
                onChange={(e) => updateSetting('admin_route', e.target.value)}
                className="input-field"
                placeholder="/admin-secret-route"
              />
              <p className="text-xs text-gray-600 mt-1">
                Access admin panel at: {settings.admin_route || '/aurax-admin-secure-2024'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-success-400" />
            <h2 className="text-lg font-semibold text-white">SEO Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
              <input
                type="text"
                value={settings.seo_title || ''}
                onChange={(e) => updateSetting('seo_title', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">SEO Description</label>
              <textarea
                value={settings.seo_description || ''}
                onChange={(e) => updateSetting('seo_description', e.target.value)}
                className="input-field"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">SEO Keywords</label>
              <input
                type="text"
                value={settings.seo_keywords || ''}
                onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                className="input-field"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
