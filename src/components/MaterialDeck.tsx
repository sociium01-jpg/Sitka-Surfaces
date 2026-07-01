'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type DeckCard = {
  num: string;
  title: string;
  tagline: string;
  desc: string;
  imgUrl: string;
  href: string;
};

export default function MaterialDeck() {
  const [activeIndex, setActiveIndex] = useState(0);

  const cards: DeckCard[] = [
    {
      num: '01',
      title: 'Plywood',
      tagline: 'The structure underneath the beauty.',
      desc: 'Engineered core panels built for strength, screw-holding, and dead-flat lamination.',
      imgUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80', // High-contrast stacked raw wood layers
      href: '/surfaces/plywood',
    },
    {
      num: '02',
      title: 'Laminates',
      tagline: 'Built for the surfaces that get touched the most.',
      desc: 'High-pressure laminates in matte, gloss, and textured finishes that shrug off scratches and daily wear.',
      imgUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1000&q=80', // Vibrant light oak custom laminates scene
      href: '/surfaces/laminates',
    },
    {
      num: '03',
      title: 'Veneer',
      tagline: 'Real wood, cut thin, made honest.',
      desc: 'Natural wood veneers sliced for grain-true consistency — the character of solid timber, without the cost.',
      imgUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80', // Rich teak veneer grain
      href: '/surfaces/veneer',
    },
    {
      num: '04',
      title: 'Decoratives',
      tagline: 'The detail that makes a space feel finished.',
      desc: 'Decorative surfaces, edgebanding, and specialty panels for the details that need more than a flat finish.',
      imgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80', // Ribbed acoustic slats feature wall
      href: '/surfaces/decoratives',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Deck Row */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 lg:h-[480px] w-full relative">
        {cards.map((card, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={card.num}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => {
                if (window.innerWidth >= 1024) {
                  setActiveIndex(index);
                }
              }}
              className={`relative flex flex-col justify-end p-6 md:p-8 border border-line rounded-sm overflow-hidden cursor-pointer bg-ink-2 transition-all duration-500 ease-custom min-h-[140px] lg:min-h-0 ${
                isActive 
                  ? 'lg:flex-[2.6]' 
                  : 'lg:flex-1'
              }`}
            >
              {/* Card Background Texture */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500 transform scale-105 group-hover:scale-100"
                style={{ 
                  backgroundImage: `url(${card.imgUrl})`,
                  opacity: isActive ? 0.75 : 0.35,
                  filter: isActive ? 'saturate(1.15) brightness(0.85)' : 'saturate(0.65) brightness(0.55)'
                }}
              />
              
              {/* Overlay Grid lines (replicates the prototype grid details) */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />

              {/* Card Number */}
              <div className="absolute top-6 left-6 md:left-8 font-mono text-[10px] tracking-widest text-brass">
                {card.num}
              </div>

              {/* Content Panel */}
              <div className="relative z-10 space-y-2 max-w-lg">
                <h3 className="text-xl md:text-2xl font-display font-medium text-parchment flex items-center gap-2">
                  {card.title}
                </h3>
                
                {/* Collapsible Details */}
                <div className={`transition-all duration-500 overflow-hidden ${
                  isActive 
                    ? 'max-h-[180px] opacity-100' 
                    : 'lg:max-h-0 lg:opacity-0 max-h-[180px] opacity-100 lg:pointer-events-none'
                }`}>
                  <p className="font-serif italic text-sm md:text-base text-parchment/90 mb-2">
                    {card.tagline}
                  </p>
                  <p className="text-xs md:text-sm text-stone-dim leading-relaxed max-w-sm mb-4">
                    {card.desc}
                  </p>
                  
                  <Link 
                    href={card.href}
                    className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-parchment text-[10px] font-mono tracking-wider uppercase py-2.5 px-5 rounded-sm transition-all duration-300 transform translate-y-0 active:translate-y-0.5"
                  >
                    Explore Range <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Help Tip */}
      <p className="text-[10px] font-mono tracking-wider text-stone-dim text-center uppercase">
        Hover or tap a panel to expand — click the button to explore
      </p>
    </div>
  );
}
