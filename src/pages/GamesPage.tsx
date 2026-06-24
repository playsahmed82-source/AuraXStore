import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Game } from '../lib/types';

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

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const { data } = await supabase.from('games').select('*').eq('is_active', true).order('sort_order');
    if (data) setGames(data);
    setIsLoading(false);
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Browse Games</h1>
          <p className="text-gray-500 mb-8">Find products for your favorite games</p>

          <div className="max-w-md glass px-4 py-3 rounded-xl flex items-center">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square glass-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredGames.map((game) => {
              const gradient = gameColorMap[game.slug] || 'from-primary-500 to-accent-500';
              const initials = game.name.split(' ').map((w) => w[0]).join('').slice(0, 2);

              return (
                <Link
                  key={game.id}
                  to={`/products?game=${game.id}`}
                  className="group"
                >
                  <div className="aspect-square rounded-2xl glass-card overflow-hidden hover:border-primary-500/50 transition-all p-2">
                    <div className={`relative w-full h-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                      {game.image_url ? (
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">{initials}</span>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-400 group-hover:text-white text-center transition-colors truncate">
                    {game.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No games found matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
