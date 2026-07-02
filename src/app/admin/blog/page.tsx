'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, Plus, Edit2, Trash2, X, Eye } from 'lucide-react';

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  status: string; // 'DRAFT' | 'PUBLISHED'
  publishedAt: string;
  mediaType?: string;
  mediaUrl?: string;
};

function BlogConsole() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initAction = searchParams.get('action');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Material Guides',
    summary: '',
    content: '',
    author: 'Sitka Editor',
    status: 'PUBLISHED',
    mediaType: 'image',
    mediaUrl: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle action parameter on init load
  useEffect(() => {
    if (initAction === 'new' && !loading) {
      openNewForm();
      // Clear action param from url so it does not trigger again
      router.replace('/admin/blog');
    }
  }, [initAction, loading, router]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openNewForm = () => {
    setFormData({
      title: '',
      category: 'Material Guides',
      summary: '',
      content: '',
      author: 'Sitka Editor',
      status: 'PUBLISHED',
      mediaType: 'image',
      mediaUrl: '',
    });
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (p: Post) => {
    setFormData({
      title: p.title,
      category: p.category,
      summary: p.summary,
      content: p.content,
      author: p.author,
      status: p.status,
      mediaType: p.mediaType || 'image',
      mediaUrl: p.mediaUrl || '',
    });
    setEditingId(p.id);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const url = '/api/posts';
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { id: editingId, ...formData } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save blog post.');
      }

      await fetchPosts();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Assembling Blog Articles...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brass" /> Blog Journal CMS
          </h1>
          <p className="text-stone-dim text-xs">
            Draft, edit, and publish material education articles and case study highlights.
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-wider uppercase py-3.5 px-6 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Article
        </button>
      </div>

      {/* Blog Editor Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0a0806]/85 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-ink-2 border border-line rounded-sm max-w-[680px] w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-stone-dim hover:text-parchment transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg md:text-xl font-display font-medium text-parchment mb-4">
              {editingId ? 'Edit Journal Article' : 'Compose New Article'}
            </h3>

            {error && (
              <div className="bg-ember/15 border border-ember/30 text-ember-light p-3.5 rounded-sm text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Article Title *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTextChange}
                  required
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                  placeholder="e.g. Sourcing Logs: Crown Cut vs Quarter Cut"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Category *</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleTextChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  >
                    <option value="Material Guides">Material Guides</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Design Trends">Design Trends</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Author *</label>
                  <input 
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleTextChange}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Publication Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleTextChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Media Type</label>
                  <select 
                    name="mediaType"
                    value={formData.mediaType}
                    onChange={handleTextChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  >
                    <option value="image">Image Asset</option>
                    <option value="video">Video Loop</option>
                    <option value="none">No Media</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Media Asset Path / URL</label>
                <input 
                  type="text"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleTextChange}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember font-sans normal-case"
                  placeholder="e.g. /images/news-hero.jpg or https://youtube-nocookie.com/embed/..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Summary / Subhead * (Shown in cards)</label>
                <textarea 
                  name="summary"
                  value={formData.summary}
                  onChange={handleTextChange}
                  required
                  rows={2}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember font-sans normal-case"
                  placeholder="Enter a brief teaser summary..."
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Article Content * (Markdown Allowed)</label>
                  <span className="text-[8px] text-stone-dim/60 font-mono">Use double newlines for paragraphs</span>
                </div>
                <textarea 
                  name="content"
                  value={formData.content}
                  onChange={handleTextChange}
                  required
                  rows={10}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember font-sans normal-case"
                  placeholder="Write post content. Headings start with ## or ###. Bullet lists start with - "
                />
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-ember text-parchment py-3.5 mt-4 rounded-sm text-[10px] font-mono tracking-wider uppercase hover:bg-ember-light transition-colors disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Article'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Articles Grid List */}
      <div className="bg-ink-2 border border-line rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 bg-ink/30 border-b border-line text-xs font-mono text-stone-dim">
          Total Database Articles: <b className="text-parchment">{posts.length}</b>
        </div>

        {posts.length > 0 ? (
          <div className="divide-y divide-line/60">
            {posts.map((p) => {
              const dateStr = new Date(p.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <div 
                  key={p.id}
                  className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-ink/10 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-brass border border-brass/35 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{p.category}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${p.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{p.status}</span>
                    </div>
                    <h3 className="font-display font-medium text-base text-parchment leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-stone-dim font-sans normal-case truncate max-w-lg">
                      {p.summary}
                    </p>
                    <div className="text-[10px] text-stone-dim/75 font-mono pt-1">
                      <span>By {p.author}</span>
                      <span className="mx-2">•</span>
                      <span>Published {dateStr}</span>
                    </div>
                  </div>

                  {/* Edit buttons */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <a 
                      href={`/journal/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-line hover:border-stone hover:text-parchment rounded-sm transition-colors text-stone-dim cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </a>

                    <button 
                      onClick={() => openEditForm(p)}
                      className="p-2 border border-line hover:border-stone hover:text-parchment rounded-sm transition-colors text-stone-dim cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 border border-line hover:border-ember hover:text-ember-light rounded-sm transition-colors text-stone-dim cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-stone-dim text-sm">
            No blog posts found in the database.
          </div>
        )}
      </div>

    </div>
  );
}

export default function AdminBlog() {
  return (
    <Suspense fallback={
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Loading Journal Console...
      </div>
    }>
      <BlogConsole />
    </Suspense>
  );
}
