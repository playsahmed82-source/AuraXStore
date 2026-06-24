import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAuditEvent } from '../../lib/auth';
import type { BlogPost } from '../../lib/types';

const categories = ['news', 'updates', 'guides', 'tutorials', 'promotions'];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'news',
    featured_image_url: '',
    is_published: false,
    seo_title: '',
    seo_description: '',
  });

  const fetchPosts = useCallback(async () => {
    let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
    }

    if (filterCategory) {
      query = query.eq('category', filterCategory);
    }

    const { data } = await query.limit(50);
    if (data) setPosts(data);
  }, [searchQuery, filterCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const slug = formData.slug || generateSlug(formData.title);
    const postData = { ...formData, slug };

    if (editingPost) {
      await supabase
        .from('blog_posts')
        .update({
          ...postData,
          published_at: postData.is_published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPost.id);
      await logAuditEvent('update', 'blog_post', editingPost.id, null, postData);
    } else {
      await supabase.from('blog_posts').insert({
        ...postData,
        published_at: postData.is_published ? new Date().toISOString() : null,
      });
      await logAuditEvent('create', 'blog_post', 'new', null, postData);
    }

    setShowModal(false);
    setEditingPost(null);
    resetForm();
    fetchPosts();
    setIsSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    await logAuditEvent('delete', 'blog_post', id, { title }, null);
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const togglePublish = async (id: string, is_published: boolean) => {
    await supabase
      .from('blog_posts')
      .update({
        is_published,
        published_at: is_published ? new Date().toISOString() : null,
      })
      .eq('id', id);
    fetchPosts();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'news',
      featured_image_url: '',
      is_published: false,
      seo_title: '',
      seo_description: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Blog</h1>
          <p className="text-gray-500">Manage blog posts and articles</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 glass px-4 py-2 rounded-xl flex items-center">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 w-full focus:outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-white/10 rounded-xl text-white focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="capitalize">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Views</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{post.title}</p>
                        <p className="text-xs text-gray-500">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-accent capitalize">{post.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{post.view_count || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublish(post.id, !post.is_published)}
                      className={`badge ${post.is_published ? 'badge-success' : 'bg-gray-500/20 text-gray-400'}`}
                    >
                      {post.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {post.is_published && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-white"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => { setEditingPost(post); setFormData({ ...post, excerpt: post.excerpt || '', featured_image_url: post.featured_image_url || '', seo_title: post.seo_title || '', seo_description: post.seo_description || '' }); setShowModal(true); }} className="p-2 text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-gray-400 hover:text-error-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="relative glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingPost ? 'Edit Post' : 'Create Post'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field min-h-[200px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">SEO Description</label>
                  <input
                    type="text"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                Publish immediately
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary flex-1">
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
