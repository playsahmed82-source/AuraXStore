import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Gamepad2,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { useStore } from '../../lib/store';

interface NavLink {
  name: string;
  path: string;
  children?: { name: string; path: string }[];
  badge?: string;
  disabled?: boolean;
}

const navLinks: NavLink[] = [
  { name: 'Home', path: '/' },
  {
    name: 'Products',
    path: '/products',
    children: [
      { name: 'Game Accounts', path: '/products?type=account' },
      { name: 'Top Up', path: '/products?type=topup' },
      { name: 'Boosting', path: '/products?type=boosting' },
      { name: 'In-Game Items', path: '/products?type=item' },
      { name: 'Services', path: '/products?type=service' },
      { name: 'Gift Cards', path: '/products?type=giftcard' },
    ],
  },
  { name: 'Games', path: '/games' },
  { name: 'Blog', path: '/blog' },
  {
    name: 'Seller',
    path: '/seller',
    badge: 'Coming Soon',
  },
  { name: 'Support', path: '/support' },
];

export default function Header() {
  const { auth, cart, signOut } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: { path: string }[]) =>
    children?.some(child => location.pathname.startsWith(child.path.split('?')[0]));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Aura<span className="text-primary-400">x</span>Store
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.path} className="relative group">
                  <Link
                    to={link.disabled ? '#' : link.path}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                      link.disabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : isActive(link.path) || isParentActive(link.children)
                        ? 'text-white bg-white/5'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={(e) => link.disabled && e.preventDefault()}
                  >
                    {link.name}
                    {link.children && <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />}
                    {link.badge && (
                      <span className="badge badge-primary ml-1">{link.badge}</span>
                    )}
                  </Link>

                  {link.children && !link.disabled && (
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="glass-card p-2 min-w-48">
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center glass px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search products, games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-gray-500 w-48 lg:w-64 focus:outline-none"
              />
            </form>

            <Link
              to="/wishlist"
              className="p-2 text-gray-400 hover:text-white transition-colors relative hidden sm:block"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              className="p-2 text-gray-400 hover:text-white transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            {auth.user ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <div className={`absolute top-full right-0 pt-2 ${isProfileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all z-50`}>
                  <div className="glass-card p-2 min-w-48">
                    <div className="px-4 py-2 border-b border-white/10 mb-2">
                      <p className="text-sm font-medium text-white truncate">{auth.profile?.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{auth.profile?.role || 'Customer'}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/dashboard/orders" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      Orders
                    </Link>
                    <Link to="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      Profile
                    </Link>
                    {auth.isAdmin && (
                      <Link to="/aurax-admin-secure-2024" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-white/5 rounded-lg transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-error-400 hover:text-error-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden glass-card mb-4 p-4">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.disabled ? '#' : link.path}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    link.disabled
                      ? 'text-gray-500 cursor-not-allowed'
                      : isActive(link.path)
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={(e) => {
                    if (link.disabled) e.preventDefault();
                    else setIsMobileMenuOpen(false);
                  }}
                >
                  {link.name}
                  {link.badge && (
                    <span className="badge badge-primary ml-2">{link.badge}</span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center glass px-4 py-3 rounded-xl">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
