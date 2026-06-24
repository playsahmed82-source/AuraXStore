import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Heart,
  Bell,
  User,
  Shield,
  Ticket,
  Settings,
  ChevronRight,
  Home,
} from 'lucide-react';
import { useStore } from '../../lib/store';

const sidebarItems = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'My Orders', icon: Package, path: '/dashboard/orders' },
  { name: 'Wishlist', icon: Heart, path: '/dashboard/wishlist' },
  { name: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { name: 'Profile', icon: User, path: '/dashboard/profile' },
  { name: 'Security', icon: Shield, path: '/dashboard/security' },
  { name: 'Support Tickets', icon: Ticket, path: '/dashboard/tickets' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function CustomerDashboard() {
  const { auth } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      navigate('/auth/login');
    }
  }, [auth.user, auth.isLoading, navigate]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white truncate">
                    {auth.profile?.username || auth.profile?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {auth.profile?.is_verified ? 'Verified' : 'Customer'}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
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
                    {isActive(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Back to Store</span>
                </Link>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
