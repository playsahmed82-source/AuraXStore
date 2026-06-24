import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  FileText,
  Tag,
  Settings,
  Shield,
  Menu,
  X,
  Gamepad2,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Lock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { ADMIN_ROUTE } from '../../lib/auth';
import type { Profile } from '../../lib/types';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: ADMIN_ROUTE },
  { name: 'Products', icon: Package, path: `${ADMIN_ROUTE}/products` },
  { name: 'Orders', icon: ShoppingCart, path: `${ADMIN_ROUTE}/orders` },
  { name: 'Customers', icon: Users, path: `${ADMIN_ROUTE}/customers` },
  { name: 'Sellers', icon: Shield, path: `${ADMIN_ROUTE}/sellers` },
  { name: 'Support', icon: Ticket, path: `${ADMIN_ROUTE}/support` },
  { name: 'Blog', icon: FileText, path: `${ADMIN_ROUTE}/blog` },
  { name: 'Coupons', icon: Tag, path: `${ADMIN_ROUTE}/coupons` },
  { name: 'Analytics', icon: TrendingUp, path: `${ADMIN_ROUTE}/analytics` },
  { name: 'Security Logs', icon: Lock, path: `${ADMIN_ROUTE}/security-logs` },
  { name: 'Settings', icon: Settings, path: `${ADMIN_ROUTE}/settings` },
];

interface DebugState {
  step: string;
  session: boolean;
  user: string | null;
  profile: string | null;
  error: string | null;
}

export default function AdminLayout() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [debug, setDebug] = useState<DebugState>({
    step: 'init',
    session: false,
    user: null,
    profile: null,
    error: null,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useStore();

  useEffect(() => {
    // Use auth state from StoreProvider instead of re-fetching
    // This avoids the onAuthStateChange deadlock entirely
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setDebug(prev => ({ ...prev, step: 'timeout', error: 'Loading timed out after 8s' }));
        setIsLoading(false);
      }
    }, 8000);

    if (auth.isLoading) {
      setDebug(prev => ({ ...prev, step: 'waiting_for_store', session: !!auth.session }));
      return () => clearTimeout(timeoutId);
    }

    // StoreProvider has finished auth initialization
    const session = auth.session;
    const user = auth.user;
    const profileData = auth.profile;

    setDebug(prev => ({ ...prev, step: 'store_ready', session: !!session, user: user?.email || null }));

    if (!session?.user) {
      setDebug(prev => ({ ...prev, step: 'no_session', error: 'No active session - please log in' }));
      setIsLoading(false);
      clearTimeout(timeoutId);
      return () => clearTimeout(timeoutId);
    }

    if (!profileData) {
      setDebug(prev => ({ ...prev, step: 'no_profile', error: 'No profile found for user' }));
      setIsLoading(false);
      clearTimeout(timeoutId);
      return () => clearTimeout(timeoutId);
    }

    const role = profileData.role;
    const isAdminRole = role === 'admin' || role === 'super_admin' || profileData.is_admin === true;

    if (!isAdminRole) {
      setDebug(prev => ({ ...prev, step: 'not_admin', error: `Role '${role}' is not admin or super_admin` }));
      setIsLoading(false);
      clearTimeout(timeoutId);
      return () => clearTimeout(timeoutId);
    }

    setDebug(prev => ({ ...prev, step: 'success', profile: role }));
    setProfile(profileData);
    setIsLoading(false);
    clearTimeout(timeoutId);

    return () => clearTimeout(timeoutId);
  }, [auth.isLoading, auth.session, auth.user, auth.profile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse" />
          </div>
          <p className="text-gray-500 mb-4">Loading admin panel...</p>
          <div className="text-left bg-dark-400 p-4 rounded-lg text-xs font-mono max-w-md mb-4">
            <p className="text-gray-400">Step: <span className="text-primary-400">{debug.step}</span></p>
            <p className="text-gray-400">Session: <span className={debug.session ? 'text-success-400' : 'text-warning-400'}>{debug.session ? 'Yes' : 'No'}</span></p>
            <p className="text-gray-400">User: <span className="text-white">{debug.user || 'null'}</span></p>
            <p className="text-gray-400">Profile: <span className="text-white">{debug.profile || 'null'}</span></p>
            {debug.error && <p className="text-error-400 mt-2">Error: {debug.error}</p>}
          </div>
          <div className="flex gap-2 justify-center">
            <Link to="/auth/login" className="btn-primary text-sm px-4 py-2">
              Go to Login
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm px-4 py-2 bg-dark-400"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-error-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-2">You don't have permission to access the admin panel.</p>
          <div className="text-left bg-dark-400 p-3 rounded-lg text-xs font-mono mb-4">
            <p className="text-gray-400">Step: <span className="text-primary-400">{debug.step}</span></p>
            <p className="text-gray-400">Session: <span className={debug.session ? 'text-success-400' : 'text-warning-400'}>{debug.session ? 'Yes' : 'No'}</span></p>
            {debug.error && <p className="text-error-400 mt-2">Error: {debug.error}</p>}
          </div>
          <div className="flex gap-2 justify-center">
            <Link to="/" className="btn-primary text-sm px-4 py-2">
              Go Home
            </Link>
            <Link to="/auth/login" className="btn-primary text-sm px-4 py-2 bg-dark-400">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-500">
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full w-64 glass border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white">
                  Aura<span className="text-primary-400">x</span>Store
                </span>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{profile?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{profile?.role || 'admin'}</p>
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-2"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>View Store</span>
            </Link>

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-error-400 hover:bg-error-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden p-2 glass rounded-xl"
      >
        {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
