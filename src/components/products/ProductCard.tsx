import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Sparkles, TrendingUp, Star } from 'lucide-react';
import type { Product } from '../../lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

const productTypeColors: Record<string, string> = {
  account: 'bg-accent-500/20 text-accent-400',
  topup: 'bg-success-500/20 text-success-400',
  boosting: 'bg-warning-500/20 text-warning-400',
  item: 'bg-primary-500/20 text-primary-400',
  service: 'bg-gray-500/20 text-gray-300',
  giftcard: 'bg-pink-500/20 text-pink-400',
};

export default function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const imageUrl = product.images?.[0] || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop`;

  return (
    <motion.div
      className="group glass-card overflow-hidden relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Glow border effect */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/20 group-hover:to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />

      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {discount > 0 && (
            <span className="badge bg-error-500/80 text-white">-{discount}%</span>
          )}
          {product.is_featured && (
            <span className="badge badge-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </span>
          )}
          {product.is_best_seller && (
            <span className="badge badge-warning">
              <Star className="w-3 h-3 mr-1" />
              Best Selling
            </span>
          )}
          {product.is_trending && (
            <span className="badge badge-accent">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </span>
          )}
        </div>

        <motion.div
          className="absolute top-3 right-3 flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={onAddToWishlist}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-error-400 hover:border-error-500/50 transition-all hover:scale-110"
          >
            <Heart className="w-5 h-5" />
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-primary-400 hover:border-primary-500/50 transition-all hover:scale-110"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </motion.div>

        <div className="absolute bottom-3 left-3">
          <span className={`badge ${productTypeColors[product.product_type]}`}>
            {product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}

        {product.features && product.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
            {product.delivery_info && (
              <p className="text-xs text-success-400 mt-0.5">{product.delivery_info}</p>
            )}
          </div>

          <motion.button
            onClick={onAddToCart}
            disabled={!product.stock_unlimited && product.stock_quantity === 0}
            className="w-10 h-10 rounded-xl bg-primary-500/20 hover:bg-primary-500 text-primary-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
