import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import ProductCard from '../products/ProductCard';
import type { Product } from '../../lib/types';

interface FeaturedProductsSectionProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  linkText?: string;
  linkUrl?: string;
}

export default function FeaturedProductsSection({
  products,
  title = 'Featured Products',
  subtitle = 'Hand-picked deals just for you',
  linkText = 'View All',
  linkUrl = '/products',
}: FeaturedProductsSectionProps) {
  const displayProducts = products.slice(0, 8);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  if (displayProducts.length === 0) return null;

  return (
    <section ref={containerRef} className="py-16 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-500 text-lg">{subtitle}</p>
          </div>
          <Link to={linkUrl} className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors">
            {linkText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to={linkUrl} className="link-arrow">
            {linkText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
