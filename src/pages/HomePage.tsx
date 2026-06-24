import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap, Clock, TrendingUp, Star, ChevronRight, Gamepad2, Crown, Gift, Shield, Timer } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import PopularGamesSection from '../components/home/PopularGamesSection';
import FeaturedProductsSection from '../components/home/FeaturedProducts';
import HowToOrderSection from '../components/home/HowToOrderSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NewsletterSection from '../components/home/NewsletterSection';
import FAQSection from '../components/home/FAQSection';
import ProductCard from '../components/products/ProductCard';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import type { Category, Game, Product, FAQ, FlashSale, Announcement } from '../lib/types';

export default function HomePage() {
  const { auth } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  const fetchHomeData = useCallback(async () => {
    try {
      const [
        categoriesRes,
        gamesRes,
        featuredRes,
        bestSellersRes,
        trendingRes,
        newArrivalsRes,
        faqsRes,
        flashSalesRes,
        announcementsRes
      ] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('games').select('*').eq('is_active', true).eq('is_popular', true).order('sort_order').limit(12),
        supabase.from('products').select('*, game:games(*), category:categories(*)').eq('is_featured', true).eq('is_active', true).limit(8),
        supabase.from('products').select('*, game:games(*), category:categories(*)').eq('is_best_seller', true).eq('is_active', true).limit(8),
        supabase.from('products').select('*, game:games(*), category:categories(*)').eq('is_trending', true).eq('is_active', true).limit(8),
        supabase.from('products').select('*, game:games(*), category:categories(*)').eq('is_active', true).order('created_at', { ascending: false }).limit(8),
        supabase.from('faqs').select('*').eq('is_active', true).order('sort_order').limit(6),
        supabase.from('flash_sales').select('*, product:products(*, game:games(*), category:categories(*))').eq('is_active', true).gt('end_time', new Date().toISOString()).limit(4),
        supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (gamesRes.data) setGames(gamesRes.data);
      if (featuredRes.data) setFeaturedProducts(featuredRes.data as Product[]);
      if (bestSellersRes.data) setBestSellers(bestSellersRes.data as Product[]);
      if (trendingRes.data) setTrendingProducts(trendingRes.data as Product[]);
      if (newArrivalsRes.data) setNewArrivals(newArrivalsRes.data as Product[]);
      if (faqsRes.data) setFaqs(faqsRes.data);
      if (flashSalesRes.data) setFlashSales(flashSalesRes.data as FlashSale[]);
      if (announcementsRes.data) setAnnouncements(announcementsRes.data);

      if (auth.user) {
        const { data: recentlyViewedData } = await supabase
          .from('recently_viewed')
          .select('product:products(*, game:games(*), category:categories(*))')
          .eq('user_id', auth.user.id)
          .order('last_viewed_at', { ascending: false })
          .limit(6);

        if (recentlyViewedData) {
          const products = recentlyViewedData
            .map((rv) => {
              const p = (rv as Record<string, unknown>).product;
              return Array.isArray(p) ? p[0] : p;
            })
            .filter(Boolean) as Product[];
          setRecentlyViewed(products);
        }
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  }, [auth.user]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const dismissAnnouncement = (id: string) => {
    setDismissedAnnouncements(prev => [...prev, id]);
  };

  const activeAnnouncements = announcements.filter(a => !dismissedAnnouncements.includes(a.id));

  const getTimeRemaining = (endTime: string) => {
    const total = Date.parse(endTime) - Date.now();
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { hours, minutes, seconds, total };
  };

  const [flashTimers, setFlashTimers] = useState<Record<string, { hours: number; minutes: number; seconds: number }>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const timers: Record<string, { hours: number; minutes: number; seconds: number }> = {};
      flashSales.forEach(sale => {
        const remaining = getTimeRemaining(sale.end_time);
        timers[sale.id] = { hours: remaining.hours, minutes: remaining.minutes, seconds: remaining.seconds };
      });
      setFlashTimers(timers);
    }, 1000);
    return () => clearInterval(interval);
  }, [flashSales]);

  return (
    <div className="bg-dark-500">
      {/* Announcement Bar */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-gradient-to-r from-primary-600 to-accent-600">
          {activeAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`relative py-3 px-4 text-center ${
                announcement.type === 'promo' ? 'bg-gradient-to-r from-warning-600 to-warning-500' :
                announcement.type === 'warning' ? 'bg-gradient-to-r from-error-600 to-error-500' :
                announcement.type === 'success' ? 'bg-gradient-to-r from-success-600 to-success-500' :
                ''
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                {announcement.type === 'promo' && <Zap className="w-4 h-4" />}
                <span>{announcement.message}</span>
                {announcement.link_url && (
                  <Link to={announcement.link_url} className="underline hover:text-white/80">
                    {announcement.link_text || 'Learn More'}
                  </Link>
                )}
              </div>
              {announcement.is_dismissible && (
                <button
                  onClick={() => dismissAnnouncement(announcement.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Security Badges - Trust Section */}
      <section className="py-4 bg-dark-400 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { icon: Shield, text: '256-bit SSL', subtext: 'Secure Payment' },
              { icon: Crown, text: '50K+ Orders', subtext: 'Completed' },
              { icon: Star, text: '4.9/5 Rating', subtext: 'Customer Reviews' },
              { icon: Clock, text: '24/7 Support', subtext: 'Live Chat' },
              { icon: Gift, text: 'Instant Delivery', subtext: 'Within Minutes' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <badge.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{badge.text}</p>
                  <p className="text-xs text-gray-600">{badge.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      {flashSales.length > 0 && (
        <section className="py-12 bg-dark-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-error-500 to-warning-500 flex items-center justify-center animate-pulse">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">Flash Sales</h2>
                  <p className="text-gray-500">Limited time offers - don&apos;t miss out!</p>
                </div>
              </div>
              <Link to="/products?filter=flash-sale" className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSales.map((sale) => (
                <div key={sale.id} className="glass-card overflow-hidden group">
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-error-500 text-white text-xs font-bold">
                        -{sale.discount_percentage}%
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 z-10 glass px-3 py-2 rounded-lg flex items-center gap-2">
                      <Timer className="w-4 h-4 text-error-400" />
                      <span className="text-xs font-mono text-white">
                        {String(flashTimers[sale.id]?.hours || 0).padStart(2, '0')}:
                        {String(flashTimers[sale.id]?.minutes || 0).padStart(2, '0')}:
                        {String(flashTimers[sale.id]?.seconds || 0).padStart(2, '0')}
                      </span>
                    </div>
                    {sale.product && <ProductCard product={sale.product} />}
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500 line-through">${sale.original_price?.toFixed(2)}</span>
                        <span className="text-xl font-bold text-white ml-2">${sale.sale_price?.toFixed(2)}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {sale.current_purchases}/{sale.max_purchases} sold
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-dark-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-error-500 to-warning-500"
                        style={{ width: `${(sale.current_purchases / sale.max_purchases) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <CategoriesSection categories={categories} />

      {/* Featured Games */}
      <PopularGamesSection games={games} />

      {/* Featured Products */}
      <FeaturedProductsSection
        products={featuredProducts}
        title="Featured Products"
        subtitle="Hand-picked deals by our team"
        linkText="View All Products"
        linkUrl="/products"
      />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <FeaturedProductsSection
          products={bestSellers}
          title="Best Selling Products"
          subtitle="Top-rated products trusted by gamers"
          linkText="View All"
          linkUrl="/products?filter=bestseller"
        />
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <FeaturedProductsSection
          products={trendingProducts}
          title="Trending Now"
          subtitle="What gamers are buying right now"
          linkText="View All"
          linkUrl="/products?filter=trending"
        />
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <FeaturedProductsSection
          products={newArrivals}
          title="New Arrivals"
          subtitle="Fresh products just added to our catalog"
          linkText="View All"
          linkUrl="/products?sort=newest"
        />
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-12 bg-dark-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Recently Viewed</h2>
                  <p className="text-sm text-gray-500">Continue where you left off</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="glass-card p-4 hover:border-primary-500/30 transition-colors"
                >
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-3 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Gamepad2 className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  <p className="text-sm text-white line-clamp-2">{product.name}</p>
                  <p className="text-primary-400 font-semibold mt-1">${product.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How To Order Section */}
      <HowToOrderSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Blog Preview */}
      <section className="py-16 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">From Our Blog</h2>
            <p className="text-gray-500">Stay updated with the latest gaming news and guides</p>
          </div>
          <div className="flex justify-center">
            <Link to="/blog" className="btn-primary">
              Visit Our Blog
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && <FAQSection faqs={faqs} />}

      {/* Newsletter */}
      <NewsletterSection />

      {/* Seller Marketplace Coming Soon Banner */}
      <section className="py-12 bg-gradient-to-r from-primary-600/20 via-accent-600/20 to-primary-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-warning-400" />
            <span className="text-sm text-warning-400 font-medium">Coming Soon - Apply Now</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Seller</span>
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Join thousands of sellers on AuraxStore. Start selling gaming products and services to millions of gamers worldwide.
          </p>
          <Link to="/seller" className="btn-primary">
            Apply Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
