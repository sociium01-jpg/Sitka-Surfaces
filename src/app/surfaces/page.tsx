'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Box, Disc, LayoutGrid } from 'lucide-react';
import Reveal from '@/components/Reveal';

const VERTICAL_SECTIONS = [
  {
    name: 'Plywood Core',
    slug: 'plywood',
    desc: 'Engineered multi-ply birch cores optimized for absolute stability, structural load-bearing capacity, and high-precision routing.',
    count: '24 Swatches',
    icon: Layers,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop',
    color: 'from-amber/20 to-transparent',
  },
  {
    name: 'HPL Laminates',
    slug: 'laminates',
    desc: 'High-pressure surface laminates designed for heavy contact, extreme scratch/heat resistance, and absolute color consistency.',
    count: '32 Swatches',
    icon: Box,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop',
    color: 'from-blue-500/10 to-transparent',
  },
  {
    name: 'Natural Veneer',
    slug: 'veneer',
    desc: 'Sequenced and sequence-matched raw and backed natural wood face veneers. True timber character sliced thin for architectural paneling.',
    count: '18 Swatches',
    icon: LayoutGrid,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=600&auto=format&fit=crop',
    color: 'from-emerald-500/10 to-transparent',
  },
  {
    name: 'Decoratives & Edging',
    slug: 'decoratives',
    desc: 'Ribbed acoustic slats, matching edgebands, and architectural highlight panels to resolve the final detailing of your design.',
    count: '12 Swatches',
    icon: Disc,
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=600&auto=format&fit=crop',
    color: 'from-purple-500/10 to-transparent',
  },
];

export default function SurfacesLanding() {
  return (
    <div className="w-full bg-[#110E0C] text-stone min-h-screen py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Cinematic Header */}
        <div className="max-w-2xl space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">
            Material Collections
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-medium text-parchment leading-tight">
            Explore Material Worlds
          </h1>
          <p className="text-stone-dim text-sm md:text-base leading-relaxed">
            Calibrated cores, engineered durability, and genuine grain realism. Select a product vertical below to explore specifications, dimensions, and swatches.
          </p>
        </div>

        {/* 4 Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {VERTICAL_SECTIONS.map((section, idx) => {
            const Icon = section.icon;

            return (
              <Reveal key={section.slug} delay={idx * 100}>
                <Link
                  href={`/surfaces/${section.slug}`}
                  className="group relative flex flex-col h-[400px] border border-line bg-ink-2/30 hover:border-ember transition-all duration-500 rounded-sm overflow-hidden"
                >
                  {/* Background image panel with parallax zoom on hover */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={section.image}
                      alt={section.name}
                      className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 ease-out saturate-50"
                    />
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                  </div>

                  {/* Top content HUD */}
                  <div className="relative z-10 p-6 flex justify-between items-start">
                    <div className="p-2 border border-line bg-ink-2/60 text-brass rounded-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-stone-dim bg-ink-2/80 px-2 py-1 border border-line/40 rounded-sm uppercase">
                      {section.count}
                    </span>
                  </div>

                  {/* Bottom content HUD */}
                  <div className="relative z-10 mt-auto p-6 space-y-3">
                    <div className="space-y-1">
                      <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">
                        Vertical 0{idx + 1}
                      </span>
                      <h2 className="text-xl md:text-2xl font-display font-medium text-parchment group-hover:text-ember-light transition-colors">
                        {section.name}
                      </h2>
                    </div>
                    
                    <p className="text-stone-dim text-xs leading-relaxed max-w-sm">
                      {section.desc}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5 text-[10px] font-mono text-brass group-hover:text-parchment transition-colors">
                      Explore Vertical <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

      </div>
    </div>
  );
}
