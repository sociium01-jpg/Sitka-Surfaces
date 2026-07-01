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
  
  // Catalog of finishes
  const catalog: Record<string, Finish[]> = {
    Plywood: [
      { id: 'ply-birch', name: 'Natural Birch Core', sku: 'PLY-BRCH-01', category: 'Plywood', imgUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80' },
      { id: 'ply-oak', name: 'Smoked Crown Oak', sku: 'PLY-OAK-04', category: 'Plywood', imgUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80' },
      { id: 'ply-walnut', name: 'American Walnut Core', sku: 'PLY-WLNT-09', category: 'Plywood', imgUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80' },
    ],
    Laminates: [
      { id: 'lam-yellow', name: 'Sitka Brand Yellow', sku: 'LAM-YEL-500', category: 'Laminates', color: '#F5B800' },
      { id: 'lam-charcoal', name: 'Matte Obsidian Charcoal', sku: 'LAM-CHAR-12', category: 'Laminates', color: '#1A1A1A' },
      { id: 'lam-parchment', name: 'Alabaster Parchment', sku: 'LAM-PARCH-88', category: 'Laminates', color: '#EDE6D8' },
    ],
    Veneer: [
      { id: 'ven-teak', name: 'Burmese Golden Teak', sku: 'VEN-TEAK-33', category: 'Veneer', imgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' },
      { id: 'ven-ash', name: 'Parchment White Ash', sku: 'VEN-ASH-15', category: 'Veneer', imgUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80' },
    ],
    Decoratives: [
      { id: 'dec-slat', name: 'Oak Acoustic Slat', sku: 'DEC-SLAT-02', category: 'Decoratives', imgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
      { id: 'dec-gold', name: 'Polished Brass Trim', sku: 'DEC-BRSS-07', category: 'Decoratives', color: '#D4A017' },
    ]
  };

  const zones: Zone[] = [
    { id: 'wall', label: 'Feature Wall', defaultFinishId: 'ply-walnut' },
    { id: 'cabinet', label: 'Cabinetry', defaultFinishId: 'lam-charcoal' },
    { id: 'countertop', label: 'Countertop', defaultFinishId: 'lam-yellow' },
    { id: 'floor', label: 'Floor', defaultFinishId: 'ven-teak' }
  ];

  // Map state zone -> finish
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
      {/* 1. INTERACTIVE ROOM SCENE (SVG Projection) */}
      <div className="flex-grow min-h-[380px] md:min-h-[460px] bg-[#110E0C] border border-line relative flex items-center justify-center overflow-hidden">
        {/* Pattern Definitions for SVGs */}
        <svg className="absolute w-0 h-0">
          <defs>
            {Object.values(catalog).flat().map((item) => (
              <pattern
                key={item.id}
                id={`pat-${item.id}`}
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                {item.color ? (
                  <rect width="120" height="120" fill={item.color} />
                ) : (
                  <image href={item.imgUrl} width="120" height="120" preserveAspectRatio="xMidYMid slice" />
                )}
              </pattern>
            ))}
          </defs>
        </svg>

        {/* Isometric Room Drawing */}
        <svg 
          viewBox="0 0 800 600" 
          className="w-full h-full max-w-[700px] select-none"
        >
          {/* Ambient Wall Shadow overlay */}
          <defs>
            <linearGradient id="wall-shadow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="black" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="floor-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="black" stopOpacity="0.5" />
              <stop offset="100%" stopColor="black" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* ZONE 1: FEATURE WALL */}
          <polygon
            points="50,50 450,50 450,450 50,450"
            fill={`url(#pat-${selections.wall.id})`}
            onClick={() => { setActiveZone('wall'); setActiveCategory(selections.wall.category); }}
            className={`cursor-pointer transition-all duration-500 hover:brightness-105 stroke-2 ${
              activeZone === 'wall' ? 'stroke-ember' : 'stroke-transparent'
            }`}
          />
          <polygon points="50,50 450,50 450,450 50,450" fill="url(#wall-shadow)" className="pointer-events-none" />

          {/* ZONE 4: FLOOR */}
          <polygon
            points="50,450 450,450 750,550 150,550"
            fill={`url(#pat-${selections.floor.id})`}
            onClick={() => { setActiveZone('floor'); setActiveCategory(selections.floor.category); }}
            className={`cursor-pointer transition-all duration-500 hover:brightness-105 stroke-2 ${
              activeZone === 'floor' ? 'stroke-ember' : 'stroke-transparent'
            }`}
          />
          <polygon points="50,450 450,450 750,550 150,550" fill="url(#floor-glow)" className="pointer-events-none" />

          {/* ZONE 2: CABINETRY */}
          <polygon
            points="450,200 750,200 750,450 450,450"
            fill={`url(#pat-${selections.cabinet.id})`}
            onClick={() => { setActiveZone('cabinet'); setActiveCategory(selections.cabinet.category); }}
            className={`cursor-pointer transition-all duration-500 hover:brightness-105 stroke-2 ${
              activeZone === 'cabinet' ? 'stroke-ember' : 'stroke-transparent'
            }`}
          />

          {/* ZONE 3: COUNTERTOP */}
          <polygon
            points="380,320 680,320 580,360 280,360"
            fill={`url(#pat-${selections.countertop.id})`}
            onClick={() => { setActiveZone('countertop'); setActiveCategory(selections.countertop.category); }}
            className={`cursor-pointer transition-all duration-500 hover:brightness-105 stroke-2 ${
              activeZone === 'countertop' ? 'stroke-ember' : 'stroke-transparent'
            }`}
          />
        </svg>

        {/* Floating Zone Indicator Tags */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">Visualizer Mode</span>
          <span className="block text-xs font-display font-medium text-parchment uppercase">Click zones inside the room to edit</span>
        </div>
      </div>

      {/* 2. CONTROL PANEL COLUMN */}
      <div className="w-full lg:w-96 flex flex-col justify-between p-6 border border-line bg-ink-2/40 space-y-6">
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
                      <div className="w-full h-full" style={{ backgroundColor: item.color }} />
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
