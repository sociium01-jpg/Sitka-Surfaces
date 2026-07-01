'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Finish } from '@/types/visualizer';

// Dynamically import SpecViewer3D to disable SSR since it uses WebGL/Three.js
const SpecViewer3D = dynamic(() => import('@/components/SpecViewer3D'), { ssr: false });

// Demo mock finishes for the homepage spec inspector panel
const DEMO_PLYWOOD: Finish = {
  id: 'demo-plywood',
  name: 'Natural Birch Structural Core',
  sku: 'PLY-BRCH-01',
  specLine: 'BWR Grade · Multi-ply Core',
  category: 'Plywood',
  thumbnailImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=256&auto=format&fit=crop',
  tileableTexture: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1024&auto=format&fit=crop',
  realWidthMm: 1220,
  realHeightMm: 2440,
  realThicknessMm: 18,
  roughness: 0.65,
  metalness: 0.0,
  materialType: 'wood',
  edgeStyle: 'layeredPly', // striped edges
  tags: ['structural', 'birch'],
  modelType: 'generated',
};

const DEMO_LAMINATE: Finish = {
  id: 'demo-laminate',
  name: 'Sitka High Pressure Laminate',
  sku: 'LAM-YEL-500',
  specLine: 'HPL Surface · Phenolic Core',
  category: 'Laminates',
  thumbnailImage: '',
  tileableTexture: '',
  color: '#F5B800',
  realWidthMm: 1220,
  realHeightMm: 2440,
  realThicknessMm: 1.2, // Very thin compared to plywood!
  roughness: 0.15,
  metalness: 0.05,
  materialType: 'gloss',
  edgeStyle: 'flatSolid', // dark solid core edge
  tags: ['gloss', 'yellow'],
  modelType: 'generated',
};

export default function ThreeInspector() {
  const [materialType, setMaterialType] = useState<'plywood' | 'laminate'>('plywood');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[450px] bg-ink-2/60 border border-line flex items-center justify-center">
        <span className="text-xs font-mono text-stone-dim uppercase">Loading interactive spec viewer...</span>
      </div>
    );
  }

  const activeFinish = materialType === 'plywood' ? DEMO_PLYWOOD : DEMO_LAMINATE;

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-stretch">
      {/* 3D Canvas Viewport Box */}
      <div className="flex-grow h-[450px] bg-[#110E0C] border border-line relative overflow-hidden group cursor-grab active:cursor-grabbing">
        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 z-10 space-y-1 select-none pointer-events-none">
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">3D Spec Viewer</span>
          <span className="block text-xs font-display font-medium text-parchment uppercase">
            {activeFinish.name}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 z-10 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-300">
          <span className="text-[9px] font-mono uppercase tracking-widest text-parchment">
            ← Drag to rotate · Scroll to zoom →
          </span>
        </div>

        {/* 3D WebGL Canvas SpecViewer */}
        <SpecViewer3D finish={activeFinish} />
      </div>

      {/* Control Panel Column */}
      <div className="w-full md:w-80 flex flex-col justify-between p-6 border border-line bg-ink-2/40">
        <div className="space-y-6">
          <span className="text-[10px] font-mono tracking-widest text-brass uppercase block border-b border-line/30 pb-2">
            Spec Inspector
          </span>

          {/* Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMaterialType('plywood')}
              className={`py-3 text-[10px] font-mono tracking-wider uppercase text-center border transition-all cursor-pointer ${
                materialType === 'plywood'
                  ? 'border-ember bg-ember text-ember-text font-bold'
                  : 'border-line hover:border-stone-dim text-stone'
              }`}
            >
              Plywood
            </button>
            <button
              onClick={() => setMaterialType('laminate')}
              className={`py-3 text-[10px] font-mono tracking-wider uppercase text-center border transition-all cursor-pointer ${
                materialType === 'laminate'
                  ? 'border-ember bg-ember text-ember-text font-bold'
                  : 'border-line hover:border-stone-dim text-stone'
              }`}
            >
              Laminate
            </button>
          </div>

          {/* Description HUD */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-display font-medium text-parchment">
              {materialType === 'plywood' ? 'Multi-layered Core Wood' : 'High Pressure Surface'}
            </h4>
            <p className="text-xs text-stone-dim leading-relaxed">
              {materialType === 'plywood'
                ? 'Birch cross-banded corewood. Rotated under calibrated lighting to reveal the physical layered edges, natural grain variance, and micro-texture thickness.'
                : 'Gloss Sitka yellow HPL surface. Simulated with solid phenolic core borders, showing thin laminate specs and accurate light specular glares.'}
            </p>
          </div>
        </div>

        {/* Dynamic Metric HUD */}
        <div className="pt-6 border-t border-line/30 space-y-2 font-mono text-[9px] text-stone-dim uppercase tracking-wider">
          <div className="flex justify-between">
            <span>Dimensions:</span>
            <span className="text-parchment font-semibold">
              {activeFinish.realWidthMm} × {activeFinish.realHeightMm} mm
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thickness:</span>
            <span className="text-parchment font-semibold">{activeFinish.realThicknessMm} mm</span>
          </div>
          <div className="flex justify-between">
            <span>Edge Treatment:</span>
            <span className="text-parchment font-semibold">
              {materialType === 'plywood' ? 'Layered ply edge' : 'Flat solid edge'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
