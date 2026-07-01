'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  author: string;
  publishedAt: string;
};

export default function JournalListing() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error('Failed to load journal posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const categories = ['All', 'Material Guides', 'Sustainability', 'Design Trends'];

  // Filter posts based on search query and category pill
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSlugImage = (s: string) => {
    switch (s) {
      case 'plywood-laminate-or-veneer-how-to-actually-choose':
        return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
      case 'what-fsc-certification-actually-means-for-your-project':
        return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80';
      case 'designing-with-grain-a-short-guide-to-veneer-matching':
        return 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80';
      default:
        return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
    }
  };

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      
      {/* 1. Header Title */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-mono tracking-widest text-brass uppercase block">
          Knowledge Base &amp; Journal
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-medium text-parchment leading-tight">
          From the Journal
        </h1>
        <p className="text-stone text-base leading-relaxed">
          Material specifications, sustainability audits, log cuts, and project features. Educating architects and designers on decisions that outlast the blueprint.
        </p>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-line pb-6">
        
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-4 rounded-sm text-[10px] font-mono tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-ember border-ember text-parchment' 
                  : 'border-line text-stone-dim hover:border-stone-dim/60 hover:text-stone'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-dim" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-ink-2 border border-line rounded-sm pl-10 pr-4 py-2.5 text-xs text-parchment placeholder-stone-dim focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </div>

      </div>

      {/* 3. Blog Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs font-mono uppercase text-stone-dim">
          Loading articles...
        </div>
      ) : (
        <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" delay={100}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              
              return (
                <article 
                  key={post.id}
                  className="border border-line bg-ink-2 p-0 rounded-sm hover:border-brass/35 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="w-full h-48 overflow-hidden relative border-b border-line">
                      <img 
                        src={getSlugImage(post.slug)} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                      />
                      <span className="absolute top-3 left-3 text-[8px] font-mono tracking-widest bg-ink-2 border border-line text-brass px-2 py-1 uppercase rounded-sm z-1">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-6 md:p-8 space-y-4">
                      <h2 className="text-base md:text-lg font-display font-medium text-parchment group-hover:text-ember-light transition-colors leading-snug">
                        <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="text-xs text-stone-dim leading-relaxed font-sans normal-case">
                        {post.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 pt-0 border-t border-line/30 flex flex-col sm:flex-row justify-between gap-3 text-[10px] font-mono text-stone-dim">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
                    </div>
                    <Link 
                      href={`/journal/${post.slug}`} 
                      className="text-ember-light hover:text-ember transition-colors uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto"
                    >
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full border border-dashed border-line p-16 text-center text-stone-dim text-sm">
              No journal entries match your filters. Try a different query.
            </div>
          )}
        </Reveal>
      )}

    </div>
  );
}
