'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, BookOpen } from 'lucide-react';
import Reveal from '@/components/Reveal';

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
};

export default function JournalArticle({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  
  // Unwrap parameters
  const { slug } = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts?slug=${slug}`);
        const data = await res.json();
        if (data.success && data.post) {
          setPost(data.post);
        } else {
          router.push('/journal');
        }
      } catch (err) {
        console.error(err);
        router.push('/journal');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono tracking-wider uppercase text-stone-dim">
        Opening Article...
      </div>
    );
  }

  if (!post) return null;

  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Custom parser to translate markdown string into styled React elements
  const renderContent = (markdownText: string) => {
    return markdownText.split('\n\n').map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H3 Headings
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg md:text-xl font-display font-medium text-parchment mt-8 mb-4 border-b border-line/20 pb-2">
            {trimmed.substring(4)}
          </h3>
        );
      }

      // H2 Headings
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl md:text-2xl font-display font-medium text-parchment mt-10 mb-5 border-b border-line/30 pb-2">
            {trimmed.substring(3)}
          </h2>
        );
      }

      // Bullet Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc pl-6 my-4 space-y-2 text-stone-dim text-xs md:text-sm font-sans normal-case">
            {trimmed.split('\n').map((line, lIdx) => {
              const lineContent = line.trim().substring(2);
              return <li key={lIdx}>{lineContent}</li>;
            })}
          </ul>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-stone-dim text-sm leading-relaxed mb-5 font-sans normal-case">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back navigation */}
        <Link 
          href="/journal"
          className="text-stone hover:text-parchment text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        {/* Article Meta */}
        <Reveal className="space-y-4 pt-4 border-t border-line/45">
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-brass uppercase">
            <span>{post.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dateStr}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-parchment leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-stone-dim text-xs font-mono">
            <User className="w-4 h-4 text-brass" />
            <span>Written by <b className="text-stone">{post.author}</b></span>
          </div>
        </Reveal>

        {/* Article Summary Quote Box */}
        <Reveal className="bg-ink-2 border-l-2 border-ember border-t border-b border-r border-line/40 p-5 md:p-6 rounded-sm my-6" delay={100}>
          <div className="flex gap-3 items-start">
            <BookOpen className="w-5 h-5 text-ember-light flex-shrink-0 mt-0.5" />
            <p className="text-parchment text-xs md:text-sm font-sans italic leading-relaxed">
              {post.summary}
            </p>
          </div>
        </Reveal>

        {/* Article Body Content */}
        <Reveal className="prose prose-invert max-w-none text-stone font-sans" delay={150}>
          {renderContent(post.content)}
        </Reveal>

        {/* Footer Info Callout */}
        <Reveal className="pt-12 mt-12 border-t border-line/40 text-center space-y-4" delay={200}>
          <h4 className="text-xs font-mono tracking-wider uppercase text-brass">Specifying for a live project?</h4>
          <p className="text-stone-dim text-xs max-w-md mx-auto leading-relaxed">
            Need samples or catalog specification data sheets for your design board? Talk to our materials specialist for direct assistance.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/contact" 
              className="bg-ember hover:bg-ember-light text-parchment text-[10px] font-mono tracking-wider uppercase py-3 px-6 rounded-sm transition-colors"
            >
              Get a Quote
            </Link>
            <button 
              onClick={() => router.push('/journal')}
              className="border border-line hover:border-stone text-stone-dim hover:text-parchment text-[10px] font-mono tracking-wider uppercase py-3 px-6 rounded-sm transition-colors cursor-pointer"
            >
              Browse Articles
            </button>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
