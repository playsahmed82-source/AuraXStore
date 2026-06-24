import { useState, useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Testimonial {
  id: string;
  author_name: string;
  author_email: string;
  avatar_url: string;
  rating: number;
  content: string;
  game: string;
  created_at: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        if (data && data.length > 0) {
          setTestimonials(data as Testimonial[]);
        } else {
          // Fallback to hardcoded data if no testimonials in DB
          setTestimonials([
            { id: '1', author_name: 'Alex Chen', author_email: '', avatar_url: '', rating: 5, content: 'Got my Conqueror account instantly. The quality exceeded my expectations. Will definitely buy again!', game: 'PUBG Mobile', created_at: '' },
            { id: '2', author_name: 'Sarah Williams', author_email: '', avatar_url: '', rating: 5, content: 'The boosting service was professional and fast. Reached Immortal in just 3 days. Highly recommended!', game: 'Valorant', created_at: '' },
            { id: '3', author_name: 'Mike Johnson', author_email: '', avatar_url: '', rating: 5, content: 'Top-up was instant and cheaper than official store. Great customer support too!', game: 'Genshin Impact', created_at: '' },
            { id: '4', author_name: 'David Park', author_email: '', avatar_url: '', rating: 5, content: 'Best marketplace for Free Fire diamonds. Delivered within minutes every time.', game: 'Free Fire', created_at: '' },
          ]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load testimonials');
        // Fallback
        setTestimonials([
          { id: '1', author_name: 'Alex Chen', author_email: '', avatar_url: '', rating: 5, content: 'Got my Conqueror account instantly. The quality exceeded my expectations. Will definitely buy again!', game: 'PUBG Mobile', created_at: '' },
          { id: '2', author_name: 'Sarah Williams', author_email: '', avatar_url: '', rating: 5, content: 'The boosting service was professional and fast. Reached Immortal in just 3 days. Highly recommended!', game: 'Valorant', created_at: '' },
          { id: '3', author_name: 'Mike Johnson', author_email: '', avatar_url: '', rating: 5, content: 'Top-up was instant and cheaper than official store. Great customer support too!', game: 'Genshin Impact', created_at: '' },
          { id: '4', author_name: 'David Park', author_email: '', avatar_url: '', rating: 5, content: 'Best marketplace for Free Fire diamonds. Delivered within minutes every time.', game: 'Free Fire', created_at: '' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading) {
    return (
      <section ref={containerRef} className="py-16 bg-dark-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-dark-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-96 bg-dark-200 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-16 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Customers</span> Say
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Join over 500,000 satisfied gamers who trust AuraxStore for their gaming needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.slice(0, 4).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <motion.div
                className="glass-card p-6 relative h-full group"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/20 group-hover:to-accent-500/20 transition-all duration-500 blur-xl opacity-0 group-hover:opacity-100" />

                <div className="relative">
                  <Quote className="absolute top-0 right-0 w-8 h-8 text-primary-500/20" />

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.3 + index * 0.1 + i * 0.05 }}
                      >
                        <Star className="w-4 h-4 fill-warning-400 text-warning-400" />
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-gray-400 mb-6 italic">&ldquo;{testimonial.content || ''}&rdquo;</p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.author_name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{testimonial.author_name}</p>
                      <p className="text-xs text-gray-500">{testimonial.game || 'Gaming'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
