'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Grid, ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';

type Project = {
  title: string;
  slug: string;
  city: string;
  spaceType: string; // 'Kitchen' | 'Office' | 'Hospitality' | 'Living'
  materials: string;
  verticals: string[]; // ['Veneer', 'Laminates', etc.]
  desc: string;
  imgUrl: string;
};

export default function InspirationGallery() {
  const [selectedVertical, setSelectedVertical] = useState('All');
  const [selectedSpace, setSelectedSpace] = useState('All');

  const projects: Project[] = [
    {
      title: 'Amber House Residence',
      slug: 'amber-house-residence',
      city: 'Bangalore',
      spaceType: 'Kitchen',
      materials: 'Veneer · Laminates',
      verticals: ['Veneer', 'Laminates'],
      desc: 'A full-floor residential renovation using book-matched walnut veneer panelling against a matte laminate kitchen run.',
      imgUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Northline Studio Office',
      slug: 'northline-studio-office',
      city: 'Mumbai',
      spaceType: 'Office',
      materials: 'Plywood · Decoratives',
      verticals: ['Plywood', 'Decoratives'],
      desc: 'An open-plan creative workspace built entirely on flexible plywood millwork partitions with matched edgebanding detail.',
      imgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Cedar Point Hospitality',
      slug: 'cedar-point-hospitality',
      city: 'Goa',
      spaceType: 'Hospitality',
      materials: 'Laminates',
      verticals: ['Laminates'],
      desc: 'Heavy duty high-pressure compact laminate specified across 60 hotel rooms for a consistent, high-durability finish at scale.',
      imgUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Harbor Lobby Panelling',
      slug: 'harbor-lobby-panelling',
      city: 'Kochi',
      spaceType: 'Hospitality',
      materials: 'Veneer',
      verticals: ['Veneer'],
      desc: 'Sequence-matched American Walnut veneer wraps a 40ft executive lobby wall without a single visible seam.',
      imgUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Veneer Wood Kitchen Fitout',
      slug: 'veneer-wood-kitchen-fitout',
      city: 'Hyderabad',
      spaceType: 'Kitchen',
      materials: 'Veneer · Plywood',
      verticals: ['Veneer', 'Plywood'],
      desc: 'BWP boiling water proof plywood substrate cores paired with sequence-matched raw walnut veneer faces, sealed on site.',
      imgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Spacial Corporate Boardroom',
      slug: 'spacial-corporate-boardroom',
      city: 'Pune',
      spaceType: 'Office',
      materials: 'Decoratives · Veneer',
      verticals: ['Decoratives', 'Veneer'],
      desc: '3D ribbed slatted acoustic backdrops paired with a custom-built natural ash wood veneer boardroom table.',
      imgUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    }
  ];

  const verticalFilters = ['All', 'Plywood', 'Laminates', 'Veneer', 'Decoratives'];
  const spaceFilters = ['All', 'Kitchen', 'Office', 'Hospitality', 'Living'];

  // Filter projects list
  const filteredProjects = projects.filter(p => {
    const matchesVert = selectedVertical === 'All' || p.verticals.includes(selectedVertical);
    const matchesSpace = selectedSpace === 'All' || p.spaceType === selectedSpace;
    return matchesVert && matchesSpace;
  });

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      
      {/* 1. Header Title */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-mono tracking-widest text-brass uppercase block">
          Lookbook Portfolio
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-medium text-parchment leading-tight">
          Specified, fabricated, lived in.
        </h1>
        <p className="text-stone text-base leading-relaxed">
          Explore real-world case studies detailing how architects, interior designers, and contracting builders have specified and structured Sitka Surface materials.
        </p>
      </div>

      {/* 2. Filters grid */}
      <div className="border-b border-line pb-8 space-y-5">
        
        {/* Filter by Vertical */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-mono tracking-wider uppercase text-stone-dim w-24">By Vertical:</span>
          <div className="flex gap-2 overflow-x-auto max-w-full custom-scrollbar pb-1">
            {verticalFilters.map(vert => (
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
            {spaceFilters.map(space => (
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

      {/* 3. Lookbook Grid */}
      <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" delay={100}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((proj) => (
            <div 
              key={proj.slug}
              className="group border border-line bg-ink-2 rounded-sm overflow-hidden flex flex-col justify-between hover:border-brass/35 transition-colors duration-300"
            >
              <div>
                <div 
                  className="h-[220px] bg-cover bg-center bg-zinc-800 transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${proj.imgUrl})` }}
                />
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-stone-dim border-b border-line/20 pb-2.5">
                    <span>{proj.materials}</span>
                    <span className="text-brass">{proj.spaceType}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-medium text-parchment group-hover:text-ember-light transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-stone-dim text-xs leading-relaxed">
                    {proj.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-6 pt-2">
                <Link 
                  href={`/inspiration/${proj.slug}`}
                  className="text-[10px] font-mono tracking-wider uppercase text-ember-light hover:text-ember transition-colors inline-flex items-center gap-1.5"
                >
                  View Case Study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full border border-dashed border-line p-16 text-center text-stone-dim text-sm">
            No projects found matching the selected filters.
          </div>
        )}
      </Reveal>

    </div>
  );
}
