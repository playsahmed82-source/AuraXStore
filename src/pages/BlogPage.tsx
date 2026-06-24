import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';

const categories = [
  { value: '', label: 'All Posts' },
  { value: 'news', label: 'News' },
  { value: 'updates', label: 'Updates' },
  { value: 'guides', label: 'Guides' },
  { value: 'tutorials', label: 'Tutorials' },
  { value: 'promotions', label: 'Promotions' },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    setIsLoading(true);

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
    }

    const { data } = await query.limit(20);

    if (data) setPosts(data);
    setIsLoading(false);
  };

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Blog</span>
          </nav>
          <h1 className="text-4xl font-display font-bold text-white mb-4">Blog</h1>
          <p className="text-gray-500 max-w-2xl">News, guides, tutorials, and updates from AuraxStore</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="glass px-4 py-2 rounded-xl flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 w-48 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <>
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="block glass-card overflow-hidden mb-12 group"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                    {featuredPost.featured_image_url ? (
                      <img
                        src={featuredPost.featured_image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-display font-bold text-white/20">
                          {featuredPost.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="badge badge-primary capitalize">{featuredPost.category}</span>
                      <span className="text-sm text-gray-500">
                        {featuredPost.reading_time} min read
                      </span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mb-4 group-hover:text-primary-400 transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-gray-500 mb-6">{featuredPost.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="glass-card overflow-hidden group"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-white/20">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="badge badge-primary text-xs capitalize">{post.category}</span>
                      <span className="text-xs text-gray-600">
                        {post.reading_time} min
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-primary-400 group-hover:text-primary-300 flex items-center gap-1">
                        Read <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
