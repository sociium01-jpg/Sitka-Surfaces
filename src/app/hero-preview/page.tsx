'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import — Hero3D is WebGL, must be client-only, no SSR
const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false });

// Capability override via ?capability=low|mid|high query param for testing
function useCapabilityOverride() {
  const [override, setOverride] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOverride(params.get('capability'));
  }, []);
  return override;
}

export default function HeroPreviewPage() {
  const capabilityOverride = useCapabilityOverride();

  // Headline reveal animation — timed to sync with DOF rack-focus (1.2–2.0s)
  const [headlineVisible, setHeadlineVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHeadlineVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">

      {/* ── 3D Canvas Layer ── */}
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>

      {/* ── Gradient overlay (bottom fade) ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-ink/70 to-transparent" />
      </div>

      {/* ── Hero Headline Overlay ── */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center">
        <div className="container mx-auto px-8 md:px-16">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div
              className="mb-4 transition-all duration-700"
              style={{
                opacity: headlineVisible ? 1 : 0,
                transform: headlineVisible ? 'translateY(0)' : 'translateY(12px)',
                filter: headlineVisible ? 'blur(0)' : 'blur(6px)',
                transitionDelay: '0ms',
              }}
            >
              <span className="inline-block text-[9px] font-mono tracking-[0.35em] text-ember uppercase border border-ember/30 px-3 py-1 bg-ember/8">
                Premium Surface Materials
              </span>
            </div>

            {/* Headline — word-by-word reveal staggered */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.06] text-parchment mb-6">
              {['Material', 'made\u00A0for', 'architects.'].map((word, i) => (
                <span
                  key={i}
                  className="block transition-all duration-700"
                  style={{
                    opacity: headlineVisible ? 1 : 0,
                    transform: headlineVisible ? 'translateY(0)' : 'translateY(20px)',
                    filter: headlineVisible ? 'blur(0)' : 'blur(8px)',
                    transitionDelay: `${60 + i * 80}ms`,
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>

            {/* Sub-copy */}
            <p
              className="text-stone text-sm md:text-base leading-relaxed max-w-md transition-all duration-700"
              style={{
                opacity: headlineVisible ? 1 : 0,
                transform: headlineVisible ? 'translateY(0)' : 'translateY(14px)',
                filter: headlineVisible ? 'blur(0)' : 'blur(4px)',
                transitionDelay: '320ms',
              }}
            >
              Engineered plywood core panels, high-pressure laminates, natural
              veneers and decoratives — built for structural strength and
              lifetime visual character.
            </p>

            {/* CTA buttons */}
            <div
              className="mt-10 flex flex-wrap gap-4 transition-all duration-700"
              style={{
                opacity: headlineVisible ? 1 : 0,
                transform: headlineVisible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: '440ms',
                pointerEvents: headlineVisible ? 'auto' : 'none',
              }}
            >
              <a
                href="/surfaces"
                className="inline-flex items-center gap-2 bg-ember text-ember-text text-xs font-mono tracking-widest uppercase px-8 py-4 hover:bg-ember-light transition-colors duration-300"
              >
                Explore Surfaces
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 border border-line text-stone text-xs font-mono tracking-widest uppercase px-8 py-4 hover:border-stone-dim hover:text-parchment transition-colors duration-300"
              >
                Request Samples
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-all duration-700"
        style={{
          opacity: headlineVisible ? 0.5 : 0,
          transitionDelay: '600ms',
        }}
      >
        <span className="text-[8px] font-mono tracking-widest text-stone-dim uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-stone-dim to-transparent animate-pulse" />
      </div>

      {/* ── Dev: Capability indicator ── */}
      {capabilityOverride && (
        <div className="absolute top-4 right-4 z-50 bg-ember text-ember-text text-[8px] font-mono px-2 py-1 rounded-sm">
          FORCED: {capabilityOverride.toUpperCase()}
        </div>
      )}
    </div>
  );
}
