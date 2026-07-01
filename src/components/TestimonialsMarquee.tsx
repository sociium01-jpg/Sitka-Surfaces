'use client';

import React from 'react';

type TestimonialData = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
};

type TestimonialsMarqueeProps = {
  testimonials?: TestimonialData[];
};

export default function TestimonialsMarquee({ testimonials = [] }: TestimonialsMarqueeProps) {
  // Default fallback items from prototype copy
  const defaultItems = [
    {
      id: '1',
      quote: "We've stopped worrying about batch variation. What we sample is what arrives on site, every time.",
      name: "Gautam Mehta",
      role: "Principal Architect",
      company: "Studio Meridian",
    },
    {
      id: '2',
      quote: "Their veneer range let us match grain across an entire lobby wall without a single visible seam.",
      name: "Anjali Sen",
      role: "Interior Designer",
      company: "Formwork Interiors",
    },
    {
      id: '3',
      quote: "Sitka's laminates have been our default spec for every high-traffic commercial project for the last three years.",
      name: "Rajesh Malhotra",
      role: "Project Lead",
      company: "Cedar Point Hospitality",
    },
    {
      id: '4',
      quote: "Reorders are the real test of a material supplier. Three years in, the color match is still exact.",
      name: "Vikram Dev",
      role: "Contracting Partner",
      company: "Bellwood Build Co.",
    },
  ];

  const items = testimonials.length > 0 ? testimonials : defaultItems;

  // Duplicate items twice to ensure the marquee fills wide screens and loops seamlessly
  const doubledItems = [...items, ...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Gradients to fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused]">
        {doubledItems.map((item, idx) => (
          <div 
            key={`${item.id}-${idx}`}
            className="w-[340px] md:w-[380px] bg-ink-2 border border-line rounded-sm p-8 flex-shrink-0 flex flex-col justify-between hover:border-brass/30 transition-colors duration-300"
          >
            <p className="font-serif italic text-sm md:text-base text-parchment leading-relaxed">
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-6 text-[10px] md:text-xs text-stone-dim font-sans border-t border-line/20 pt-4">
              <span className="font-bold text-brass uppercase tracking-wider">{item.name}</span>
              <span className="mx-1.5 font-mono text-[9px]">•</span>
              <span>{item.role}, {item.company}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
