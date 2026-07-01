'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinishCategory {
  id: string;
  name: string;
  slug: string;
  deckImage?: string | null;
  tagline?: string | null;
  description?: string | null;
  metaLine?: string | null;
}

const FALLBACK_CATEGORIES: FinishCategory[] = [
  {
    id: 'cat-plywood',
    name: 'Plywood Core',
    slug: 'plywood',
    tagline: 'The structure underneath the beauty.',
    description: 'Engineered core panels built for strength, screw-holding, and dead-flat lamination.',
    metaLine: '8 grades · MR → Marine',
    deckImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'cat-laminates',
    name: 'HPL Laminates',
    slug: 'laminates',
    tagline: 'Built for the surfaces that get touched the most.',
    description: 'High-pressure laminates in matte, gloss, and textured finishes that shrug off scratches and daily wear.',
    metaLine: '32 options · Matte → Gloss',
    deckImage: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'cat-veneer',
    name: 'Natural Veneer',
    slug: 'veneer',
    tagline: 'Real wood, cut thin, made honest.',
    description: 'Natural wood veneers sliced for grain-true consistency — the character of solid timber, without the cost.',
    metaLine: '18 species · Rotary → Rift',
    deckImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'cat-decoratives',
    name: 'Decoratives & Edging',
    slug: 'decoratives',
    tagline: 'The detail that makes a space feel finished.',
    description: 'Decorative surfaces, edgebanding, and specialty panels for the details that need more than a flat finish.',
    metaLine: '12 products · Slats → Edges',
    deckImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
  },
];

// Individual Card Component with Lerped 3D Tilt Physics and layout animations
function DeckCard({
  category,
  index,
  isActive,
  onActivate,
}: {
  category: FinishCategory;
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Lerped mouse move handler to simulate weight and damping
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isActive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Apply a soft tilt angle (max 10 degrees)
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24,
      }}
      onClick={onActivate}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex flex-col justify-end p-6 md:p-8 border border-line rounded-sm overflow-hidden cursor-pointer bg-ink-2 min-h-[180px] lg:min-h-0 ${
        isActive ? 'lg:flex-[2.8]' : 'lg:flex-1'
      }`}
      style={{
        boxShadow: isActive
          ? '0 30px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245,184,0,0.12)'
          : '0 10px 25px rgba(0,0,0,0.3)',
      }}
    >
      {/* 3D tilt-sensitive inner container */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none"
        animate={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          z: isActive ? 20 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 18,
        }}
      >
        {/* Ken Burns image effect with smooth zoom on hover */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${category.deckImage || 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80'})`,
          }}
          animate={{
            scale: isActive ? 1.04 : 1.0,
            opacity: isActive ? 0.8 : 0.45,
          }}
          transition={{
            duration: 4,
            ease: 'easeOut',
          }}
        />
        {/* Dark bottom gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#110E0C] via-[#110E0C]/40 to-transparent" />
      </motion.div>

      {/* Stacked Sheet Depth Shadows (only for active card) */}
      {isActive && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-ember/25 z-0 animate-pulse pointer-events-none" />
      )}

      {/* Card number */}
      <div className="absolute top-6 left-6 md:left-8 font-mono text-[9px] tracking-widest text-brass select-none z-10">
        0{index + 1}
      </div>

      {/* Content panel */}
      <div className="relative z-10 space-y-3 max-w-sm pointer-events-auto">
        <h3 className="text-xl md:text-2xl font-display font-medium text-parchment uppercase">
          {category.name}
        </h3>

        {/* Animated Text Reveal (staggered translateY + opacity) */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Meta label */}
              {category.metaLine && (
                <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">
                  {category.metaLine}
                </span>
              )}

              {/* Tagline & Description */}
              <div className="space-y-1.5">
                {category.tagline && (
                  <p className="font-serif italic text-sm text-parchment/90 leading-relaxed">
                    {category.tagline}
                  </p>
                )}
                {category.description && (
                  <p className="text-xs text-stone-dim leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Accent bar using scaleX transform */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 15 }}
                className="h-[1px] bg-ember origin-left w-14"
              />

              <Link
                href={`/surfaces/${category.slug}`}
                className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-parchment text-[9px] font-mono tracking-widest uppercase py-2.5 px-5 rounded-sm transition-all duration-300 active:translate-y-0.5"
              >
                Explore Collection <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MaterialDeck() {
  const [categories, setCategories] = useState<FinishCategory[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch categories from visualizer CMS endpoint
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/visualizer/categories');
        const data = await res.json();
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch {
        setCategories(FALLBACK_CATEGORIES);
      }
    }
    loadCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="space-y-6 w-full">
      {/* Choreographed entrance container */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="flex flex-col lg:flex-row gap-4 lg:gap-2 lg:h-[490px] w-full relative pb-6"
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
      >
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            className="flex flex-col lg:flex-1"
            style={{ display: 'contents' }}
          >
            <DeckCard
              category={cat}
              index={idx}
              isActive={activeIndex === idx}
              onActivate={() => setActiveIndex(idx)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Interaction Help tip */}
      <p className="text-[9px] font-mono tracking-wider text-stone-dim text-center uppercase select-none">
        Hover or tap a panel to reveal collection specifications
      </p>
    </div>
  );
}
