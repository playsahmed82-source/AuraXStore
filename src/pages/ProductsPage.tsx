import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, X, Search } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { supabase } from '../lib/supabase';
import type { Product, Game } from '../lib/types';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const productTypes = [
  { value: 'account', label: 'Game Accounts' },
  { value: 'topup', label: 'Top Up' },
  { value: 'boosting', label: 'Boosting' },
  { value: 'item', label: 'In-Game Items' },
  { value: 'service', label: 'Services' },
  { value: 'giftcard', label: 'Gift Cards' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const selectedCategory = searchParams.get('category');
  const selectedType = searchParams.get('type') as string | null;
  const selectedGame = searchParams.get('game');
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedType, selectedGame, sortBy, minPrice, maxPrice]);

  const fetchFilters = async () => {
    const gamesRes = await supabase.from('games').select('*').eq('is_active', true).order('sort_order');
    if (gamesRes.data) setGames(gamesRes.data);
  };

  const fetchProducts = async () => {
    setIsLoading(true);

    let query = supabase.from('products').select('*').eq('is_active', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (selectedType) {
      query = query.eq('product_type', selectedType);
    }

    if (selectedGame) {
      query = query.eq('game_id', selectedGame);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    switch (sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price-desc':
        query = query.order('price', { ascending: false });
        break;
      case 'popular':
        query = query.order('sort_order');
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      setProducts(data);
    }
    setIsLoading(false);
  };

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [selectedCategory, selectedType, selectedGame, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {selectedType
              ? productTypes.find(t => t.value === selectedType)?.label || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-gray-500">
            Browse our complete selection of gaming products and services
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Product Type</h4>
                  <div className="space-y-2">
                    {productTypes.map((type) => (
                      <label
                        key={type.value}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-white cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="productType"
                          checked={selectedType === type.value}
                          onChange={() => updateFilter('type', selectedType === type.value ? null : type.value)}
                          className="rounded border-gray-600 bg-dark-300 text-primary-500"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                {games.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Game</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {games.map((game) => (
                        <label
                          key={game.id}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="game"
                            checked={selectedGame === game.id}
                            onChange={() => updateFilter('game', selectedGame === game.id ? null : game.id)}
                            className="rounded border-gray-600 bg-dark-300 text-primary-500"
                          />
                          {game.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Price Range</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                      className="input-field text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn-secondary text-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white rounded-full text-xs">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <p className="text-sm text-gray-500">
                  {isLoading ? 'Loading...' : `${products.length} products found`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="appearance-none bg-dark-100 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-primary-500/50"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1 glass rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedType && (
                  <span className="badge badge-primary flex items-center gap-1">
                    {productTypes.find(t => t.value === selectedType)?.label}
                    <button onClick={() => updateFilter('type', null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedGame && (
                  <span className="badge badge-accent flex items-center gap-1">
                    {games.find(g => g.id === selectedGame)?.name}
                    <button onClick={() => updateFilter('game', null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {minPrice && (
                  <span className="badge flex items-center gap-1 bg-white/10 text-white">
                    Min: ${minPrice}
                    <button onClick={() => updateFilter('minPrice', null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {maxPrice && (
                  <span className="badge flex items-center gap-1 bg-white/10 text-white">
                    Max: ${maxPrice}
                    <button onClick={() => updateFilter('maxPrice', null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card aspect-[4/3] animate-pulse bg-white/5" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
