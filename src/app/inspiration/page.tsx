'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Grid, ArrowRight, Video, List, Layers, Play } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Block } from '@/types/visualizer';

export default function InspirationGallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [spaceTypes, setSpaceTypes] = useState<string[]>(['Kitchen', 'Office', 'Hospitality', 'Living']);
  const [selectedVertical, setSelectedVertical] = useState('All');
  const [selectedSpace, setSelectedSpace] = useState('All');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry'>('grid');
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [media, setMedia] = useState<any>({ mediaType: 'image', mediaUrl: '', eyebrow: '', heading: '', subheading: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects || []);
          if (data.spaceTypes && data.spaceTypes.length > 0) {
            setSpaceTypes(data.spaceTypes.map((t: any) => t.name));
          }
        }
      } catch (err) {
        console.error('Failed to load inspiration gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    async function fetchMedia() {
      try {
        const res = await fetch('/api/media');
        const data = await res.json();
        if (data.success && data.media.inspiration) {
          setMedia(data.media.inspiration);
        }
      } catch (err) {
        console.error('Failed to load inspiration media:', err);
      }
    }
    fetchProjects();
    fetchMedia();
  }, []);

  const verticalFilters = ['All', 'Plywood', 'Laminates', 'Veneer', 'Decoratives'];
  const spaceFilters = ['All', ...spaceTypes];

  // Filter projects list
  const filteredProjects = projects.filter((p) => {
    const matchesVert = selectedVertical === 'All' || p.verticals.some(v => v.toLowerCase() === selectedVertical.toLowerCase());
    const matchesSpace = selectedSpace === 'All' || p.spaceTypes.some(s => s.toLowerCase() === selectedSpace.toLowerCase());
    const isPublished = p.status === 'published';
    return matchesVert && matchesSpace && isPublished;
  });

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-12 select-none">
      
      {/* 1. Header Title / Hero Banner */}
      {media.mediaUrl ? (
        <section className="relative min-h-[40vh] flex flex-col justify-center py-16 bg-ink border border-line rounded-sm overflow-hidden mb-6 animate-fade-in">
          <div className="absolute inset-0 z-0">
            {media.mediaType === 'video' ? (
              <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 filter saturate-50">
                <source src={media.mediaUrl} type="video/mp4" />
              </video>
            ) : (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-25 filter saturate-50" 
                style={{ backgroundImage: `url("${media.mediaUrl}")` }} 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-[#15120F]/95" />
          </div>

          <div className="relative z-10 w-full p-8 md:p-12 space-y-4">
            <span className="text-xs font-mono tracking-widest text-brass uppercase block">
              {media.eyebrow || 'Lookbook Portfolio'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-display font-medium text-parchment leading-tight max-w-3xl">
              {media.heading || 'Specified, fabricated, lived in.'}
            </h1>
            <p className="text-stone text-xs sm:text-sm max-w-xl leading-relaxed">
              {media.subheading || 'Explore real-world case studies detailing how architects, interior designers, and contracting builders have specified and structured Sitka Surface materials.'}
            </p>
          </div>
        </section>
      ) : null}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        {!media.mediaUrl && (
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-mono tracking-widest text-brass uppercase block">
              {media.eyebrow || 'Lookbook Portfolio'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-medium text-parchment leading-tight">
              {media.heading || 'Specified, fabricated, lived in.'}
            </h1>
            <p className="text-stone text-base leading-relaxed">
              {media.subheading || 'Explore real-world case studies detailing how architects, interior designers, and contracting builders have specified and structured Sitka Surface materials.'}
            </p>
          </div>
        )}

        <div className={`flex gap-1.5 border border-line p-1 rounded-sm bg-ink-2 ${media.mediaUrl ? 'ml-auto' : ''}`}>
          <button
            onClick={() => setLayoutMode('grid')}
            className={`p-2 rounded-sm transition-colors cursor-pointer ${
              layoutMode === 'grid' ? 'bg-ember text-parchment' : 'text-stone-dim hover:text-stone'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode('masonry')}
            className={`p-2 rounded-sm transition-colors cursor-pointer ${
              layoutMode === 'masonry' ? 'bg-ember text-parchment' : 'text-stone-dim hover:text-stone'
            }`}
            title="Masonry View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Filters grid */}
      <div className="border-b border-line pb-8 space-y-5">
        {/* Filter by Vertical */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-mono tracking-wider uppercase text-stone-dim w-24">By Vertical:</span>
          <div className="flex gap-2 overflow-x-auto max-w-full custom-scrollbar pb-1">
            {verticalFilters.map((vert) => (
              <button
                key={vert}
                onClick={() => setSelectedVertical(vert)}
                className={`py-1.5 px-3 rounded-sm text-[10px] font-mono tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                  selectedVertical === vert 
                    ? 'bg-ember border-ember text-parchment' 
                    : 'border-line text-stone-dim hover:border-stone-dim/60 hover:text-stone'
                }`}
              >
                {vert}
              </button>
            ))}
          </div>
        </div>

        {/* Filter by Space Type */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-mono tracking-wider uppercase text-stone-dim w-24">By Space:</span>
          <div className="flex gap-2 overflow-x-auto max-w-full custom-scrollbar pb-1">
            {spaceFilters.map((space) => (
              <button
                key={space}
                onClick={() => setSelectedSpace(space)}
                className={`py-1.5 px-3 rounded-sm text-[10px] font-mono tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                  selectedSpace === space 
                    ? 'bg-ember border-ember text-parchment' 
                    : 'border-line text-stone-dim hover:border-stone-dim/60 hover:text-stone'
                }`}
              >
                {space}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Lookbook Grid / Masonry */}
      {loading ? (
        <div className="py-24 text-center text-stone-dim font-mono text-sm animate-pulse">
          Loading inspiration portfolio...
        </div>
      ) : (
        <motion.div 
          layout
          className={
            layoutMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((proj) => {
                // Find hero block details
                const heroBlock = proj.blocks.find((b) => b.type === 'hero');
                const videoBlock = proj.blocks.find((b) => b.type === 'video');
                
                const title = heroBlock?.title || proj.name;
                const location = heroBlock?.location || '';
                const credit = heroBlock?.credit || '';
                const heroImage = heroBlock?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                
                // Construct short summary from richText blocks
                const richTexts = proj.blocks.filter((b) => b.type === 'richText');
                const desc = richTexts[0]?.content 
                  ? richTexts[0].content.replace(/[#*`_]/g, '').slice(0, 140) + '...'
                  : 'Modern architecture and fabrication case study.';

                const isHovered = hoveredSlug === proj.slug;
                const hasVideo = !!videoBlock?.source;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    key={proj.slug}
                    className={`group border border-line bg-ink-2 rounded-sm overflow-hidden flex flex-col justify-between hover:border-brass/35 transition-colors duration-300 ${
                      layoutMode === 'masonry' ? 'break-inside-avoid mb-8 inline-block w-full' : ''
                    }`}
                    onMouseEnter={() => setHoveredSlug(proj.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  >
                    <div>
                      <div className="relative h-[240px] bg-zinc-900 overflow-hidden border-b border-line/45">
                        {isHovered && hasVideo ? (
                          <video
                            src={videoBlock?.source}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                            style={{ backgroundImage: `url(${heroImage})` }}
                          />
                        )}
                        {hasVideo && (
                          <span className="absolute bottom-3 right-3 bg-ink/75 border border-line/45 p-1.5 rounded-full z-10 text-brass hover:text-parchment" title="Video preview available">
                            <Video className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-stone-dim border-b border-line/20 pb-2.5">
                          <span>{proj.verticals.join(' · ')}</span>
                          <span className="text-brass">{proj.spaceTypes.join(' · ')}</span>
                        </div>
                        <h3 className="text-lg font-display font-medium text-parchment group-hover:text-ember-light transition-colors">
                          {title}
                        </h3>
                        <p className="text-stone-dim text-xs leading-relaxed font-sans normal-case">
                          {desc}
                        </p>
                        {location && (
                          <div className="text-[9px] font-mono text-stone/60">
                            Location: {location} {credit && `| Design: ${credit}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <Link 
                        href={`/inspiration/${proj.slug}`}
                        className="text-[10px] font-mono tracking-wider uppercase text-ember-light hover:text-ember transition-colors inline-flex items-center gap-1.5"
                      >
                        View Case Study <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full border border-dashed border-line p-16 text-center text-stone-dim text-sm w-full">
                No projects found matching the selected filters.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}
