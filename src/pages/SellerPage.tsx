import { Link } from 'react-router-dom';
import {
  Store,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Globe,
  Wallet,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Store,
    title: 'Your Own Store',
    description: 'Create and manage your own store on AuraxStore platform',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Track your sales, revenue, and customer insights',
  },
  {
    icon: Wallet,
    title: 'Secure Payouts',
    description: 'Get paid securely with multiple payout options',
  },
  {
    icon: Shield,
    title: 'Seller Protection',
    description: 'Protected against fraud with our seller protection program',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Access millions of gamers worldwide',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Badge',
    description: 'Get verified and build trust with customers',
  },
];

const stats = [
  { value: '15%', label: 'Commission', sublabel: 'Industry lowest' },
  { value: '500K+', label: 'Buyers', sublabel: 'Active monthly' },
  { value: '$2M+', label: 'Paid Out', sublabel: 'To sellers' },
  { value: '24/7', label: 'Support', sublabel: 'Dedicated team' },
];

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-dark-500">
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-warning-400" />
            <span className="text-sm text-warning-400 font-medium">Coming Soon</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Seller</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Join thousands of sellers on AuraxStore. Start selling gaming products and services to millions of gamers worldwide.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-warning-500/20 border border-warning-500/30 text-warning-400">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Seller registration will open soon</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-600">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title text-white mb-4">Why Sell on AuraxStore?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything you need to build and scale your gaming business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-6 hover:border-primary-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-warning-500/20 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-warning-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Seller Marketplace Coming Soon</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We are preparing an amazing seller marketplace experience. Register your interest and be the first to know when we launch.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-gray-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-success-400 inline mr-2" />
                  Earn up to 85% revenue share
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-gray-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-success-400 inline mr-2" />
                  Access to 500K+ active buyers
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-gray-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-success-400 inline mr-2" />
                  Full seller dashboard with analytics
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-sm mb-4">
                Want to be notified when we launch?
              </p>
              <Link to="/#newsletter" className="btn-primary">
                Subscribe to Newsletter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
