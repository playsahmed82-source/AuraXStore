import { ArrowRight, Shield, Zap, Clock, Award, Users, Gamepad2, TrendingUp, Gift, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const stats = [
  { value: '500K+', label: 'Happy Customers', icon: Users },
  { value: '2M+', label: 'Transactions', icon: TrendingUp },
  { value: '24/7', label: 'Live Support', icon: Clock },
  { value: '4.9★', label: 'Rating', icon: Star },
];

const trustBadges = [
  { text: '256-bit SSL', icon: Shield, desc: 'Secure Payment' },
  { text: 'Instant Delivery', icon: Zap, desc: 'Within Minutes' },
  { text: 'Money-back', icon: Gift, desc: 'Guarantee' },
  { text: 'Verified Sellers', icon: Award, desc: 'Trusted Only' },
];

const popularGames = [
  'PUBG Mobile', 'Free Fire', 'Valorant', 'Genshin Impact', 'Mobile Legends', 'Fortnite'
];

export default function HeroSection() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [banners, setBanners] = useState<{ title: string; subtitle: string; link_url: string; button_text: string; image_url: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % Math.max(banners.length, 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'hero')
        .order('sort_order')
        .limit(3);

      if (data && data.length > 0) {
        setBanners(data);
      }
    };
    fetchBanners();
  }, []);

  const currentBanner = banners[activeBanner] || {
    title: 'Level Up Your Gaming Experience',
    subtitle: 'Premium gaming marketplace with verified accounts, instant top-ups, professional boosting, and secure transactions for all major games.',
    link_url: '/products',
    button_text: 'Browse Products',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop',
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-600/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-success-600/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              <span className="text-sm text-gray-400">Seller Marketplace Coming Soon</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6 animate-slide-up">
              {currentBanner.title.includes('Level') ? (
                <>
                  Level Up Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-accent-400 mt-2">
                    Gaming Experience
                  </span>
                </>
              ) : (
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                  {currentBanner.title}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              {currentBanner.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to={currentBanner.link_url}
                className="btn-primary inline-flex items-center justify-center gap-2 text-lg group"
              >
                {currentBanner.button_text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/games"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg"
              >
                <Gamepad2 className="w-5 h-5" />
                Explore Games
              </Link>
            </div>

            {/* Popular Games Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-xs text-gray-600">Popular:</span>
              {popularGames.slice(0, 4).map((game) => (
                <Link
                  key={game}
                  to={`/games/${game.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {game}
                </Link>
              ))}
              <Link to="/games" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                More <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right Content - Hero Image/Visual */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main Image Container */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-accent-600/30 rounded-3xl blur-2xl" />
                <img
                  src={currentBanner.image_url}
                  alt="Gaming"
                  className="w-full h-full object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-dark-500/20 to-transparent" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 glass-card p-4 animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Secure Checkout</p>
                    <p className="text-white font-semibold">256-bit SSL</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 -left-8 glass-card p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="text-white font-semibold">Instant</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 glass-card p-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trusted by</p>
                    <p className="text-white font-semibold">500K+ Users</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/3 -right-8 glass-card p-4 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-white font-semibold">4.9/5 Stars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-6 text-center hover:border-primary-500/30 transition-all duration-300 group"
            >
              <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {trustBadges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <badge.icon className="w-5 h-5 text-success-400" />
              <div>
                <p className="text-sm font-medium text-white">{badge.text}</p>
                <p className="text-xs text-gray-600">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Banner Indicators */}
        {banners.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeBanner ? 'w-8 bg-primary-500' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
