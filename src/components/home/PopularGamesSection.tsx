import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Game } from '../../lib/types';

interface PopularGamesSectionProps {
  games: Game[];
}

const gameColorMap: Record<string, string> = {
  'pubg-mobile': 'from-orange-500 to-yellow-500',
  'free-fire': 'from-yellow-500 to-orange-500',
  'valorant': 'from-red-500 to-pink-500',
  'fortnite': 'from-blue-500 to-cyan-500',
  'gta-online': 'from-green-500 to-emerald-500',
  'steam': 'from-gray-600 to-gray-400',
  'playstation': 'from-blue-600 to-indigo-600',
  'xbox': 'from-green-600 to-emerald-600',
  'roblox': 'from-gray-700 to-gray-500',
  'mobile-legends': 'from-blue-400 to-cyan-400',
  'clash-of-clans': 'from-yellow-500 to-amber-500',
  'clash-royale': 'from-blue-500 to-purple-500',
  'brawl-stars': 'from-yellow-400 to-orange-400',
  'genshin-impact': 'from-cyan-500 to-blue-500',
  'ea-fc': 'from-green-500 to-lime-500',
  'league-of-legends': 'from-yellow-400 to-orange-400',
  'counter-strike-2': 'from-orange-500 to-red-500',
};

export default function PopularGamesSection({ games }: PopularGamesSectionProps) {
  const displayGames = games.slice(0, 12);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  if (displayGames.length === 0) return null;

  return (
    <section ref={containerRef} className="py-16 bg-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Games</span>
            </h2>
            <p className="text-gray-500 text-lg">Shop for your favorite games</p>
          </div>
          <Link to="/games" className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {displayGames.map((game, index) => {
            const gradient = gameColorMap[game.slug] || 'from-primary-500 to-accent-500';
            const initials = game.name.split(' ').map(w => w[0]).join('').slice(0, 2);

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.05 + index * 0.04 }}
              >
                <Link
                  to={`/games/${game.slug}`}
                  className="group block"
                >
                  <motion.div
                    className="aspect-square rounded-2xl glass-card overflow-hidden hover:border-primary-500/50 transition-all p-2"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`relative w-full h-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                      {game.image_url ? (
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg sm:text-xl">
                          {initials}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-dark-500/0 group-hover:bg-dark-500/20 transition-colors" />
                    </div>
                  </motion.div>
                  <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-400 group-hover:text-white text-center transition-colors truncate">
                    {game.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to="/games" className="link-arrow">
            View All Games
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
