import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Package, FileText, HelpCircle, X, TrendingUp, Clock, ArrowRight, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';
import { supabase } from '../lib/supabase';
import type { Product, BlogPost, FAQ } from '../lib/types';

const POPULAR_SEARCHES = [
  'PUBG Mobile',
  'Valorant',
  'Free Fire',
  'Fortnite',
  'Steam',
  'Mobile Legends',
  'Clash of Clans',
];

interface Suggestion {
  type: 'product' | 'game' | 'blog' | 'faq';
  title: string;
  id: string;
  slug?: string;
  icon: React.ReactNode;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{
    products: Product[];
    blogPosts: BlogPost[];
    faqs: FAQ[];
  }>({ products: [], blogPosts: [], faqs: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'blog' | 'faqs'>('all');
  const [searchInput, setSearchInput] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aurax_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(s => s !== term)].slice(0, 5);
      localStorage.setItem('aurax_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Debounced suggestions
  useEffect(() => {
    if (!searchInput.trim() || searchInput.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const [productsRes, gamesRes, blogRes] = await Promise.all([
          supabase
            .from('products')
            .select('id, name, slug')
            .eq('is_active', true)
            .ilike('name', `%${searchInput}%`)
            .limit(4),
          supabase
            .from('games')
            .select('id, name, slug')
            .eq('is_active', true)
            .ilike('name', `%${searchInput}%`)
            .limit(3),
          supabase
            .from('blog_posts')
            .select('id, title, slug')
            .eq('is_published', true)
            .ilike('title', `%${searchInput}%`)
            .limit(3),
        ]);

        const newSuggestions: Suggestion[] = [];
        (productsRes.data || []).forEach(p => {
          newSuggestions.push({ type: 'product', title: p.name, id: p.id, slug: p.slug, icon: <Package className="w-4 h-4 text-primary-400" /> });
        });
        (gamesRes.data || []).forEach(g => {
          newSuggestions.push({ type: 'game', title: g.name, id: g.id, slug: g.slug, icon: <Gamepad2 className="w-4 h-4 text-accent-400" /> });
        });
        (blogRes.data || []).forEach(b => {
          newSuggestions.push({ type: 'blog', title: b.title, id: b.id, slug: b.slug, icon: <FileText className="w-4 h-4 text-success-400" /> });
        });

        setSuggestions(newSuggestions);
      } catch (err) {
        console.error('Suggestion error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search
  useEffect(() => {
    if (query) {
      performSearch();
      saveRecentSearch(query);
    } else {
      setResults({ products: [], blogPosts: [], faqs: [] });
    }
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const [productsRes, blogRes, faqsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
          .limit(10),
        supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(10),
        supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
          .limit(10),
      ]);

      setResults({
        products: productsRes.data || [],
        blogPosts: blogRes.data || [],
        faqs: faqsRes.data || [],
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === 'product') {
      navigate(`/products/${suggestion.slug}`);
    } else if (suggestion.type === 'game') {
      navigate(`/products?game=${suggestion.slug}`);
    } else if (suggestion.type === 'blog') {
      navigate(`/blog/${suggestion.slug}`);
    }
  };

  const handlePopularSearch = (term: string) => {
    setSearchInput(term);
    setSearchParams({ q: term });
    setShowSuggestions(false);
  };

  const handleRecentSearch = (term: string) => {
    setSearchInput(term);
    setSearchParams({ q: term });
    setShowSuggestions(false);
  };

  const clearRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      localStorage.setItem('aurax_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchInput('');
    setResults({ products: [], blogPosts: [], faqs: [] });
  };

  const totalResults = results.products.length + results.blogPosts.length + results.faqs.length;

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl sm:text-4xl font-display font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Next Game</span>
            </motion.h1>
            <p className="text-gray-500">Search products, guides, and answers</p>
          </div>

          <div className="relative max-w-2xl mx-auto" ref={suggestionsRef}>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for games, accounts, guides..."
                  className="w-full pl-12 pr-12 py-4 bg-dark-100 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 text-lg transition-all"
                  autoComplete="off"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-dark-100 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-gray-500 px-3 py-2">Suggestions</p>
                      {suggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.type}-${suggestion.id}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors text-left"
                        >
                          {suggestion.icon}
                          <div className="flex-1">
                            <p className="text-sm text-white">{suggestion.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{suggestion.type}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && !searchInput && (
                    <div className="p-2 border-t border-white/5">
                      <div className="flex items-center justify-between px-3 py-2">
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Recent Searches
                        </p>
                      </div>
                      {recentSearches.map((term) => (
                        <div key={term} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg group">
                          <button
                            onClick={() => handleRecentSearch(term)}
                            className="flex-1 text-left text-sm text-gray-300 hover:text-white"
                          >
                            {term}
                          </button>
                          <button
                            onClick={() => clearRecentSearch(term)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Popular Searches */}
                  {!searchInput && (
                    <div className="p-2 border-t border-white/5">
                      <p className="text-xs text-gray-500 px-3 py-2 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Popular Searches
                      </p>
                      <div className="flex flex-wrap gap-2 px-3 pb-2">
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            onClick={() => handlePopularSearch(term)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Searching indicator */}
                  {isSearchingSuggestions && searchInput.length >= 2 && (
                    <div className="p-4 text-center">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* No query state - show popular categories */}
        {!query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">Start Searching</h3>
              <p className="text-gray-500 mb-8">Type a game name or product to find what you need</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 max-w-3xl mx-auto">
                {POPULAR_SEARCHES.map((term, index) => (
                  <motion.button
                    key={term}
                    onClick={() => handlePopularSearch(term)}
                    className="p-4 glass-card rounded-xl hover:border-primary-500/30 transition-colors text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Gamepad2 className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                    <p className="text-sm text-white">{term}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results state */}
        {query && (
          <>
            <div className="mb-8">
              <p className="text-gray-500">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  `Found ${totalResults} results for "${query}"`
                )}
              </p>
            </div>

            {totalResults > 0 && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {[
                  { value: 'all', label: 'All', count: totalResults },
                  { value: 'products', label: 'Products', count: results.products.length },
                  { value: 'blog', label: 'Blog', count: results.blogPosts.length },
                  { value: 'faqs', label: 'FAQs', count: results.faqs.length },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value as typeof activeTab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.value
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card p-6 h-64 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">Try different keywords or check your spelling</p>
                <Link to="/products" className="btn-primary">
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="space-y-12">
                {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Package className="w-5 h-5 text-primary-400" />
                      <h2 className="text-xl font-semibold text-white">Products</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {results.products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'blog') && results.blogPosts.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5 text-accent-400" />
                      <h2 className="text-xl font-semibold text-white">Blog Posts</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.blogPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            to={`/blog/${post.slug}`}
                            className="block glass-card p-6 hover:border-primary-500/30 transition-colors"
                          >
                            <span className="badge badge-accent mb-3 capitalize">{post.category}</span>
                            <h3 className="font-semibold text-white mb-2">{post.title}</h3>
                            {post.excerpt && (
                              <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'faqs') && results.faqs.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <HelpCircle className="w-5 h-5 text-success-400" />
                      <h2 className="text-xl font-semibold text-white">FAQs</h2>
                    </div>
                    <div className="space-y-4">
                      {results.faqs.map((faq, index) => (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-card p-6"
                        >
                          <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                          <p className="text-gray-500">{faq.answer}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
