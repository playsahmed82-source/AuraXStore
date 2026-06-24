import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, User, Share2, Facebook, Twitter, Linkedin, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (data) {
      setPost(data);
      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      // Fetch related posts
      const { data: related } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', data.category)
        .eq('is_published', true)
        .neq('id', data.id)
        .limit(3);
      if (related) setRelatedPosts(related);
    }

    setIsLoading(false);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-white/5 rounded w-48 mb-6" />
            <div className="h-12 bg-white/5 rounded w-3/4 mb-8" />
            <div className="h-96 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Post Not Found</h2>
          <p className="text-gray-500 mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link to="/blog" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white line-clamp-1">{post.title}</span>
        </nav>

        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge badge-primary capitalize">{post.category}</span>
              <span className="text-sm text-gray-500">
                {post.reading_time || 5} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>AuraxStore Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.view_count || 0} views</span>
              </div>
            </div>
          </header>

          {post.featured_image_url && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none mb-12">
            <div
              className="text-gray-300 space-y-6"
              dangerouslySetInnerHTML={{
                __html: post.content?.split('\n').map(p => `<p>${p}</p>`).join('') || '',
              }}
            />
          </div>

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Share this article</h3>
            <div className="flex gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="glass-card overflow-hidden group"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                    {p.featured_image_url ? (
                      <img
                        src={p.featured_image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-white/20">
                          {p.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(p.published_at || p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
