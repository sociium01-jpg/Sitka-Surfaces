'use client';

import React, { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import LaminateToWoodButton from '@/components/LaminateToWoodButton';

type Finish = {
  id: string;
  name: string;
  sku: string;
  category: string;
  color?: string;
  imgUrl?: string;
};

type Zone = {
  id: 'wall' | 'cabinet' | 'countertop' | 'floor';
  label: string;
  defaultFinishId: string;
};

export default function Visualizer() {
  const { openBrochure } = useModal();
  
  // High-fidelity stable texture catalogs
  const catalog: Record<string, Finish[]> = {
    Plywood: [
      { id: 'ply-birch', name: 'Natural Birch Core', sku: 'PLY-BRCH-01', category: 'Plywood', imgUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=500&auto=format&fit=crop' },
      { id: 'ply-oak', name: 'Smoked Crown Oak', sku: 'PLY-OAK-04', category: 'Plywood', imgUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=500&auto=format&fit=crop' },
      { id: 'ply-walnut', name: 'American Walnut Core', sku: 'PLY-WLNT-09', category: 'Plywood', imgUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=500&auto=format&fit=crop' },
    ],
    Laminates: [
      { id: 'lam-yellow', name: 'Sitka Brand Yellow', sku: 'LAM-YEL-500', category: 'Laminates', color: '#F5B800' },
      { id: 'lam-charcoal', name: 'Matte Obsidian Charcoal', sku: 'LAM-CHAR-12', category: 'Laminates', color: '#1E1A15' },
      { id: 'lam-parchment', name: 'Alabaster Parchment', sku: 'LAM-PARCH-88', category: 'Laminates', color: '#EDE6D8' },
    ],
    Veneer: [
      { id: 'ven-teak', name: 'Burmese Golden Teak', sku: 'VEN-TEAK-33', category: 'Veneer', imgUrl: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=500&auto=format&fit=crop' },
      { id: 'ven-ash', name: 'Parchment White Ash', sku: 'VEN-ASH-15', category: 'Veneer', imgUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=500&auto=format&fit=crop' },
    ],
    Decoratives: [
      { id: 'dec-slat', name: 'Oak Acoustic Slat', sku: 'DEC-SLAT-02', category: 'Decoratives', imgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500&auto=format&fit=crop' },
      { id: 'dec-gold', name: 'Polished Brass Trim', sku: 'DEC-BRSS-07', category: 'Decoratives', color: '#D4A017' },
    ]
  };

  const zones: Zone[] = [
    { id: 'wall', label: 'Feature Wall', defaultFinishId: 'ply-walnut' },
    { id: 'cabinet', label: 'Cabinetry', defaultFinishId: 'lam-charcoal' },
    { id: 'countertop', label: 'Countertop', defaultFinishId: 'lam-yellow' },
    { id: 'floor', label: 'Floor', defaultFinishId: 'ven-teak' }
  ];

  const [selections, setSelections] = useState<Record<string, Finish>>({
    wall: catalog.Plywood[2], // Walnut
    cabinet: catalog.Laminates[1], // Charcoal
    countertop: catalog.Laminates[0], // Yellow
    floor: catalog.Veneer[0], // Teak
  });

  const [activeZone, setActiveZone] = useState<'wall' | 'cabinet' | 'countertop' | 'floor'>('countertop');
  const [activeCategory, setActiveCategory] = useState<string>('Laminates');

  const handleSelectFinish = (finish: Finish) => {
    setSelections(prev => ({
      ...prev,
      [activeZone]: finish
    }));
  };

  const currentSelection = selections[activeZone];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch bg-ink-2/40 border border-line p-6 relative">
      {/* SVG Pattern Library */}
      <svg className="absolute w-0 h-0">
        <defs>
          {Object.values(catalog).flat().map((item) => (
            <pattern
              key={item.id}
              id={`pat-vis-${item.id}`}
              width="256"
              height="256"
              patternUnits="userSpaceOnUse"
            >
              {item.color ? (
                <rect width="256" height="256" fill={item.color} />
              ) : (
                <image href={item.imgUrl} width="256" height="256" preserveAspectRatio="xMidYMid slice" />
              )}
            </pattern>
          ))}
        </defs>
      </svg>

      {/* 1. ROOM SCENE INTERACTIVE CONTAINER */}
      <div className="flex-grow min-h-[380px] md:min-h-[480px] bg-[#110E0C] border border-line relative overflow-hidden flex items-center justify-center">
        {/* Ultra-realistic modern architectural interior photograph backdrop */}
        <img 
          src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80" 
          alt="Interior Room Scene"
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-95"
        />

        {/* Highlight Overlay Grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none z-10" />

        {/* Vector SVG overlays matching room perspective landmarks */}
        <svg 
          viewBox="0 0 1000 650" 
          className="absolute inset-0 w-full h-full z-20 select-none mix-blend-multiply opacity-80"
        >
          {/* ZONE 1: FEATURE WALL PANEL (Back wall wood paneling) */}
          <polygon
            points="50,40 460,40 460,480 50,540"
            fill={`url(#pat-vis-${selections.wall.id})`}
            onClick={() => { setActiveZone('wall'); setActiveCategory(selections.wall.category); }}
            className={`cursor-pointer transition-all duration-300 hover:brightness-110 ${
              activeZone === 'wall' ? 'stroke-ember stroke-3 brightness-105' : 'stroke-transparent'
            }`}
          />

          {/* ZONE 4: FLOOR (Tile/Wood ground overlay) */}
          <polygon
            points="50,540 460,480 1000,520 1000,650 50,650"
            fill={`url(#pat-vis-${selections.floor.id})`}
            onClick={() => { setActiveZone('floor'); setActiveCategory(selections.floor.category); }}
            className={`cursor-pointer transition-all duration-300 hover:brightness-110 ${
              activeZone === 'floor' ? 'stroke-ember stroke-3 brightness-105' : 'stroke-transparent'
            }`}
          />

          {/* ZONE 2: CABINETRY (Kitchen/Console cabinets) */}
          <polygon
            points="460,180 880,140 880,480 460,480"
            fill={`url(#pat-vis-${selections.cabinet.id})`}
            onClick={() => { setActiveZone('cabinet'); setActiveCategory(selections.cabinet.category); }}
            className={`cursor-pointer transition-all duration-300 hover:brightness-110 ${
              activeZone === 'cabinet' ? 'stroke-ember stroke-3 brightness-105' : 'stroke-transparent'
            }`}
          />

          {/* ZONE 3: COUNTERTOP (Console / Desk top surface) */}
          <polygon
            points="460,340 880,300 780,360 360,400"
            fill={`url(#pat-vis-${selections.countertop.id})`}
            onClick={() => { setActiveZone('countertop'); setActiveCategory(selections.countertop.category); }}
            className={`cursor-pointer transition-all duration-300 hover:brightness-110 ${
              activeZone === 'countertop' ? 'stroke-ember stroke-3 brightness-105' : 'stroke-transparent'
            }`}
          />
        </svg>

        {/* SVG highlight overlay borders for visual feedback on click */}
        <svg 
          viewBox="0 0 1000 650" 
          className="absolute inset-0 w-full h-full z-35 pointer-events-none"
        >
          {activeZone === 'wall' && (
            <polygon points="50,40 460,40 460,480 50,540" fill="none" stroke="#F5B800" strokeWidth="2.5" className="animate-pulse" />
          )}
          {activeZone === 'floor' && (
            <polygon points="50,540 460,480 1000,520 1000,650 50,650" fill="none" stroke="#F5B800" strokeWidth="2.5" className="animate-pulse" />
          )}
          {activeZone === 'cabinet' && (
            <polygon points="460,180 880,140 880,480 460,480" fill="none" stroke="#F5B800" strokeWidth="2.5" className="animate-pulse" />
          )}
          {activeZone === 'countertop' && (
            <polygon points="460,340 880,300 780,360 360,400" fill="none" stroke="#F5B800" strokeWidth="2.5" className="animate-pulse" />
          )}
        </svg>

        {/* Floating Zone Indicator Tags */}
        <div className="absolute top-4 left-4 z-40 pointer-events-none select-none">
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">Visualizer Mode</span>
          <span className="block text-xs font-display font-medium text-white uppercase drop-shadow-md">
            Click room surfaces to customize
          </span>
        </div>
      </div>

      {/* 2. CONTROL PANEL COLUMN */}
      <div className="w-full lg:w-96 flex flex-col justify-between p-6 border border-line bg-ink-2/40 space-y-6 z-40">
        <div className="space-y-6">
          {/* Active Zone Title */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono tracking-widest text-brass uppercase block">Active Area</span>
            <div className="flex flex-wrap gap-1.5">
              {zones.map(z => (
                <button
                  key={z.id}
                  onClick={() => { setActiveZone(z.id); setActiveCategory(selections[z.id].category); }}
                  className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
                    activeZone === z.id
                      ? 'border-ember text-ember font-bold bg-ember/10'
                      : 'border-line text-stone hover:border-stone-dim'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono tracking-widest text-brass uppercase block">Material Vertical</span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(catalog).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 text-[9px] font-mono uppercase tracking-wider text-center border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'border-parchment text-parchment font-semibold'
                      : 'border-line text-stone-dim hover:text-stone'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Swatch Selection Grid */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono tracking-widest text-brass uppercase block">Select Finish</span>
            <div className="grid grid-cols-3 gap-2">
              {catalog[activeCategory]?.map((item) => {
                const isSelected = selections[activeZone].id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectFinish(item)}
                    className={`h-16 border rounded-sm transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected ? 'border-ember ring-1 ring-ember' : 'border-line hover:border-stone-dim'
                    }`}
                    title={item.name}
                  >
                    {item.color ? (
                      <div className="w-full h-full animate-fade-in" style={{ backgroundColor: item.color }} />
                    ) : (
                      <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-ember/15 flex items-center justify-center">
                        <span className="text-[8px] font-mono bg-ember text-ember-text px-1 rounded-sm font-semibold">OK</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. CURRENT SELECTION DETAILS & CTA */}
        <div className="pt-6 border-t border-line/30 space-y-4">
          <div className="p-3 bg-ink/60 border border-line rounded-sm space-y-1.5">
            <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">Current Finish</span>
            <div className="flex items-center gap-3">
              {currentSelection.color ? (
                <div className="w-8 h-8 rounded-sm border border-line" style={{ backgroundColor: currentSelection.color }} />
              ) : (
                <img src={currentSelection.imgUrl} alt={currentSelection.name} className="w-8 h-8 rounded-sm object-cover border border-line" />
              )}
              <div>
                <span className="block text-xs font-semibold text-parchment leading-tight">{currentSelection.name}</span>
                <span className="block text-[9px] font-mono text-stone-dim uppercase tracking-wider">{currentSelection.sku}</span>
              </div>
            </div>
          </div>

          <LaminateToWoodButton
            onClick={() => openBrochure(`Sample Request: ${currentSelection.name} (${currentSelection.sku})`)}
            label="Request This Sample"
            loadingLabel="Adding Request..."
            className="w-full text-[10px]"
          />
        </div>
      </div>
    </div>
  );
}
