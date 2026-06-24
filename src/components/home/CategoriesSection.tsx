import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Gamepad2,
  CreditCard,
  TrendingUp,
  Package,
  Settings,
  Gift,
  ArrowRight,
} from 'lucide-react';
import type { Category } from '../../lib/types';

const categoryIcons: Record<string, React.ElementType> = {
  'game-accounts': Gamepad2,
  'top-up': CreditCard,
  'boosting': TrendingUp,
  'in-game-items': Package,
  'digital-services': Settings,
  'gift-cards': Gift,
};

const categoryColors: Record<string, string> = {
  'game-accounts': 'from-primary-600 to-primary-400',
  'top-up': 'from-accent-600 to-accent-400',
  'boosting': 'from-warning-600 to-warning-400',
  'in-game-items': 'from-success-600 to-success-400',
  'digital-services': 'from-gray-600 to-gray-400',
  'gift-cards': 'from-pink-600 to-pink-400',
};

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  if (categories.length === 0) return null;

  return (
    <section ref={containerRef} className="py-16 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Category</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Explore our comprehensive selection of gaming products and services across all major platforms
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Package;
            const gradient = categoryColors[category.slug] || 'from-gray-600 to-gray-400';

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group glass-card p-6 text-center hover:border-primary-500/50 transition-all block h-full"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow-sm`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
