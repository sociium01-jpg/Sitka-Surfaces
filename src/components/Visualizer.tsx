'use client';

import React, { useState, useMemo } from 'react';
import { useModal } from '@/context/ModalContext';
import LaminateToWoodButton from '@/components/LaminateToWoodButton';
import VisualizerCanvas from '@/components/VisualizerCanvas';
import { defaultScene, FINISHES } from '@/lib/visualizerScene';
import { Finish } from '@/types/visualizer';

export default function Visualizer() {
  const { openBrochure } = useModal();

  // Create initial selections state from the defaultScene zones defaultFinish configuration
  const initialSelections = useMemo(() => {
    const state: Record<string, Finish> = {};
    defaultScene.zones.forEach((z) => {
      state[z.id] = z.defaultFinish;
    });
    return state;
  }, []);

  const [selections, setSelections] = useState<Record<string, Finish>>(initialSelections);
  const [activeZone, setActiveZone] = useState<string>('lowerCabinet');
  const [activeCategory, setActiveCategory] = useState<string>('Laminates');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Callbacks
  const handleZoneClick = (zoneId: string) => {
    setActiveZone(zoneId);
    const zone = defaultScene.zones.find((z) => z.id === zoneId);
    if (zone) {
      // Switch category if the current active category isn't allowed in this zone
      const finish = selections[zoneId];
      setActiveCategory(finish.category);
    }
  };

  const handleSelectFinish = (finish: Finish) => {
    setSelections((prev) => ({ ...prev, [activeZone]: finish }));
  };

  const currentSelection = selections[activeZone];
  const activeZoneObj = defaultScene.zones.find((z) => z.id === activeZone);
  const activeZoneLabel = activeZoneObj?.label ?? '';

  // Get only allowed finishes categories for active zone
  const allowedCategories = activeZoneObj?.allowedCategories || [];
  const currentCategoryFinishes = FINISHES[activeCategory] || [];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-0 items-stretch border border-line overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT PANEL — WebGL Render Canvas
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex-grow bg-[#0D0B09] h-[50vh] xl:h-auto min-h-[400px] xl:min-h-[600px] overflow-hidden">
        <VisualizerCanvas
          scene={defaultScene}
          selections={selections}
          activeZone={activeZone}
          hoveredZone={hoveredZone}
          onZoneClick={handleZoneClick}
          onZoneHover={setHoveredZone}
        />

        {/* Zone hotspot overlay labels (Responsive dynamic positioning) */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {defaultScene.zones.map((zone) => {
            // Find centroid or label center (we map positions relative to middle)
            // Let's use simple percentages for hotspot tags based on bounding box
            const xs = zone.corners.map((c) => c[0]);
            const ys = zone.corners.map((c) => c[1]);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            const pctX = (centerX / defaultScene.naturalWidth) * 100;
            const pctY = (centerY / defaultScene.naturalHeight) * 100;

            const isActive = activeZone === zone.id;

            return (
              <button
                key={zone.id}
                className={`pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase rounded-sm border transition-all duration-200 ${
                  isActive
                    ? 'bg-ember text-ember-text border-ember shadow-lg shadow-ember/40'
                    : 'bg-black/50 text-white/70 border-white/20 hover:border-ember/60 hover:text-ember backdrop-blur-sm'
                }`}
                style={{
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                }}
                onClick={() => handleZoneClick(zone.id)}
              >
                {zone.label}
              </button>
            );
          })}
        </div>

        {/* Top Left Corner info badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          <span className="block text-[8px] font-mono tracking-widest text-ember uppercase opacity-90">
            WebGL Realtime visualiser
          </span>
          <span className="block text-[10px] font-display font-medium text-white/80">
            Select any surface directly to customize
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Settings & Controls Panel
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full xl:w-88 flex flex-col bg-ink-2/60 border-l border-line">
        {/* Active zone buttons */}
        <div className="px-5 py-4 border-b border-line/50">
          <span className="text-[8px] font-mono tracking-widest text-brass uppercase block mb-2">
            Active Surface
          </span>
          <div className="flex flex-wrap gap-1.5">
            {defaultScene.zones.map((z) => (
              <button
                key={z.id}
                onClick={() => handleZoneClick(z.id)}
                className={`px-2.5 py-1.5 text-[8px] font-mono uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
                  activeZone === z.id
                    ? 'border-ember text-ember font-bold bg-ember/10'
                    : 'border-line text-stone-dim hover:border-stone-dim hover:text-stone'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-4 border-b border-line/50">
          <span className="text-[8px] font-mono tracking-widest text-brass uppercase block mb-2">
            Material Type
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.keys(FINISHES).map((cat) => {
              const isAllowed = allowedCategories.includes(cat);
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  disabled={!isAllowed}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 text-[8px] font-mono uppercase tracking-wider text-center border rounded-sm transition-all ${
                    !isAllowed
                      ? 'opacity-25 cursor-not-allowed border-transparent text-stone-dim'
                      : isActive
                      ? 'border-parchment text-parchment font-semibold bg-parchment/5 cursor-pointer'
                      : 'border-line text-stone-dim hover:text-stone hover:border-stone-dim cursor-pointer'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Swatches selector Grid */}
        <div className="px-5 py-4 flex-grow overflow-y-auto border-b border-line/50 max-h-[300px] xl:max-h-none">
          <span className="text-[8px] font-mono tracking-widest text-brass uppercase block mb-3">
            Select Finish
          </span>
          <div className="grid grid-cols-3 gap-2">
            {currentCategoryFinishes.map((item) => {
              const isSelected = selections[activeZone]?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectFinish(item)}
                  className={`h-16 border rounded-sm transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'border-ember ring-1 ring-ember scale-[0.97]'
                      : 'border-line hover:border-stone-dim hover:scale-[0.98]'
                  }`}
                  title={item.name}
                >
                  {item.color ? (
                    <div className="w-full h-full" style={{ backgroundColor: item.color }} />
                  ) : (
                    <img
                      src={item.thumbnailImage}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-ember/20 flex items-center justify-center">
                      <span className="text-[7px] font-mono bg-ember text-ember-text px-1.5 py-0.5 rounded-sm font-bold">
                        ✓ ON
                      </span>
                    </div>
                  )}
                  {/* Tooltip on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 px-1 py-0.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p className="text-[6px] font-mono text-white truncate leading-tight">
                      {item.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected card detail & sample request */}
        <div className="px-5 py-4 space-y-3">
          <span className="text-[8px] font-mono tracking-widest text-brass uppercase block">
            Applied to: {activeZoneLabel}
          </span>
          <div className="flex items-center gap-3 p-3 bg-ink/50 border border-line rounded-sm">
            {currentSelection?.color ? (
              <div
                className="w-10 h-10 rounded-sm border border-line flex-shrink-0"
                style={{ backgroundColor: currentSelection.color }}
              />
            ) : (
              <img
                src={currentSelection?.thumbnailImage}
                alt={currentSelection?.name}
                className="w-10 h-10 rounded-sm object-cover border border-line flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-parchment leading-tight truncate">
                {currentSelection?.name}
              </span>
              <span className="block text-[9px] font-mono text-stone-dim uppercase tracking-wider mt-0.5">
                {currentSelection?.sku}
              </span>
            </div>
          </div>

          <LaminateToWoodButton
            onClick={() =>
              openBrochure(`Sample Request: ${currentSelection?.name} (${currentSelection?.sku})`)
            }
            label="Request This Sample"
            loadingLabel="Adding Request..."
            className="w-full text-[9px]"
          />
        </div>
      </div>
    </div>
  );
}
