import { useState } from 'react';
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function SecurityPage() {
  const { auth } = useStore();
  const [is2FAEnabled, setIs2FAEnabled] = useState(auth.profile?.two_factor_enabled || false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupCode, setSetupCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError(null);

    // In real implementation, this would call an edge function to generate TOTP secret
    // For demo, we'll just update the profile
    setSetupCode('JBSWY3DPEHPK3PXP');
    setBackupCodes([
      'ABCD-EFGH-IJKL',
      'MNOP-QRST-UVWX',
      'YZ12-3456-7890',
      'ABCD-9876-5432',
    ]);
    setShowSetup(true);
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError(null);

    // In real implementation, verify the TOTP code
    // For demo, accept any 6-digit code
    if (setupCode.length >= 6) {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          two_factor_backup_codes: backupCodes,
        })
        .eq('id', auth.user!.id);

      if (!error) {
        setIs2FAEnabled(true);
        setSuccess('Two-factor authentication enabled successfully!');
        setShowSetup(false);
      } else {
        setError('Failed to enable 2FA');
      }
    } else {
      setError('Please enter a valid 6-digit code');
    }
    setIsLoading(false);
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
      })
      .eq('id', auth.user!.id);

    if (!error) {
      setIs2FAEnabled(false);
      setSuccess('Two-factor authentication disabled');
    }
    setIsLoading(false);
  };

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-display font-bold text-white">Security Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account security and authentication</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20 text-success-400">
          {success}
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account by requiring both your password and an authenticator app code.
              </p>
            </div>
          </div>
          {is2FAEnabled ? (
            <span className="badge badge-success">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enabled
            </span>
          ) : (
            <span className="badge bg-warning-500/20 text-warning-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Disabled
            </span>
          )}
        </div>

        {showSetup ? (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-white mb-4">Setup Authenticator App</h4>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <p className="text-sm text-gray-400 mb-3">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-mono text-gray-800">{setupCode}</span>
              </div>
              <p className="text-xs text-gray-600 text-center mb-4">
                Or enter this code manually: <span className="font-mono">{setupCode}</span>
              </p>

              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center tracking-widest max-w-xs"
                  maxLength={6}
                />
                <button onClick={handleVerifyCode} disabled={isLoading || setupCode.length < 6} className="btn-primary">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-warning-500/10 border border-warning-500/20">
              <h5 className="text-sm font-medium text-warning-400 mb-3">Backup Codes</h5>
              <p className="text-xs text-gray-500 mb-3">
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-dark-300 rounded font-mono text-sm text-gray-400"
                  >
                    <span>{code}</span>
                    <button onClick={() => copyToClipboard(code)} className="text-gray-500 hover:text-white">
                      {copied === code ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
            {is2FAEnabled ? (
              <button onClick={handleDisable2FA} disabled={isLoading} className="btn-secondary text-error-400">
                Disable 2FA
              </button>
            ) : (
              <button onClick={handleEnable2FA} disabled={isLoading} className="btn-primary">
                <Smartphone className="w-4 h-4 mr-2" />
                Enable 2FA
              </button>
            )}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
            <Key className="w-6 h-6 text-accent-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Password</h3>
            <p className="text-sm text-gray-500 mt-1">
              Last changed: Never
            </p>
          </div>
          <button className="btn-secondary">Change Password</button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Login Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white">Current Session</p>
              <p className="text-xs text-gray-500">This device</p>
            </div>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
        </div>
      </div>
    </div>
  );
}
