import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  Star,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import type { Product, Review } from '../lib/types';
import ProductCard from '../components/products/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, auth } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setIsLoading(true);

    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (productData) {
      setProduct(productData);

      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('game_id', productData.game_id)
        .eq('is_active', true)
        .neq('id', productData.id)
        .limit(4);
      if (related) setRelatedProducts(related);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (reviewsData) setReviews(reviewsData);
    }

    setIsLoading(false);
  };

  const handleAddToCart = async () => {
    if (!auth.user) return;
    setIsAddingToCart(true);
    await addToCart(product!.id, quantity);
    setIsAddingToCart(false);
  };

  const discount = product?.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-white/5 rounded w-48 mb-6" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-[4/3] bg-white/5 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-white/5 rounded w-3/4" />
                <div className="h-6 bg-white/5 rounded w-1/2" />
                <div className="h-4 bg-white/5 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = product.images?.[0] || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop`;

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/products?type=${product.product_type}`} className="hover:text-white transition-colors capitalize">
            {product.product_type}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{product.name}</span>
        </nav>

        <Link to="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/10 hover:border-primary-500/50 transition-colors flex-shrink-0"
                >
                  <img
                    src={imageUrl}
                    alt={`${product.name} view ${i}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.is_featured && (
                <span className="badge badge-primary">Featured</span>
              )}
              {product.is_best_seller && (
                <span className="badge badge-warning">Best Selling</span>
              )}
              {discount > 0 && (
                <span className="badge bg-error-500/20 text-error-400">Save {discount}%</span>
              )}
            </div>

            <h1 className="text-3xl font-display font-bold text-white mb-2">{product.name}</h1>

            {product.short_description && (
              <p className="text-gray-400 text-lg mb-4">{product.short_description}</p>
            )}

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-white">${product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="glass-card p-4 text-center">
                <Shield className="w-6 h-6 text-success-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Verified</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Zap className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Instant</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Clock className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">24/7 Support</p>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Features</h3>
                <div className="space-y-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-success-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-white font-medium">${(product.price * quantity).toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (!product.stock_unlimited && product.stock_quantity === 0)}
                  className="btn-primary flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button className="btn-secondary">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="btn-secondary">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {product.delivery_info && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                <Zap className="w-5 h-5 text-success-400" />
                <div>
                  <p className="text-sm font-medium text-white">Delivery</p>
                  <p className="text-sm text-success-400">{product.delivery_info}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex gap-4 border-b border-white/10 mb-6">
            {['description', 'reviews', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-white border-primary-500'
                    : 'text-gray-500 border-transparent hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="glass-card p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-400 whitespace-pre-wrap">
                  {product.description || 'No detailed description available for this product.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <span className="text-primary-400 text-sm font-medium">
                              {review.user_id?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">Customer</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-warning-400 text-warning-400' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="font-medium text-white mb-2">{review.title}</p>}
                    {review.content && <p className="text-gray-400">{review.content}</p>}
                    {review.is_verified_purchase && (
                      <span className="badge badge-success mt-4">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
