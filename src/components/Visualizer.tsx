'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useModal } from '@/context/ModalContext';
import LaminateToWoodButton from '@/components/LaminateToWoodButton';
import VisualizerCanvas from '@/components/VisualizerCanvas';
import { VisualizerScene, Finish } from '@/types/visualizer';

export default function Visualizer() {
  const { openBrochure } = useModal();

  // CMS dynamic states
  const [scenes, setScenes] = useState<VisualizerScene[]>([]);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);

  const [selections, setSelections] = useState<Record<string, Finish>>({});
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CMS Data on Mount
  useEffect(() => {
    async function fetchVisualizerData() {
      try {
        const [scenesRes, finishesRes] = await Promise.all([
          fetch('/api/visualizer/scenes'),
          fetch('/api/visualizer/finishes'),
        ]);

        const [scenesData, finishesData] = await Promise.all([
          scenesRes.json(),
          finishesRes.json(),
        ]);

        if (scenesData.success && finishesData.success) {
          const publishedScenes = scenesData.scenes.filter(
            (s: VisualizerScene) => s.status === 'PUBLISHED'
          );
          setScenes(publishedScenes);
          setFinishes(finishesData.finishes);

          // Populate initial selections for the first active scene
          if (publishedScenes.length > 0) {
            const firstScene = publishedScenes[0];
            const initialSels: Record<string, Finish> = {};
            firstScene.zones.forEach((zone: any) => {
              initialSels[zone.id] = zone.defaultFinish;
            });
            setSelections(initialSels);

            if (firstScene.zones.length > 0) {
              const defaultZone = firstScene.zones[0];
              setActiveZone(defaultZone.id);
              if (defaultZone.defaultFinish) {
                setActiveCategory(defaultZone.defaultFinish.category);
              }
            }
          }
        } else {
          setError('Failed to load Visualizer configuration from database.');
        }
      } catch (err) {
        console.error('Fetch visualizer data error:', err);
        setError('Connection error loading visualizer configurations.');
      } finally {
        setLoading(false);
      }
    }
    fetchVisualizerData();
  }, []);

  const activeScene = scenes[activeSceneIdx];

  // Group fetched finishes by category name
  const finishesCatalog = useMemo(() => {
    const catalog: Record<string, Finish[]> = {};
    finishes.forEach((f) => {
      if (!catalog[f.category]) {
        catalog[f.category] = [];
      }
      catalog[f.category].push(f);
    });
    return catalog;
  }, [finishes]);

  // Handler when scene changes
  const handleSceneChange = (idx: number) => {
    setActiveSceneIdx(idx);
    const targetScene = scenes[idx];
    const newSels: Record<string, Finish> = {};
    targetScene.zones.forEach((z) => {
      newSels[z.id] = z.defaultFinish;
    });
    setSelections(newSels);

    if (targetScene.zones.length > 0) {
      const defaultZone = targetScene.zones[0];
      setActiveZone(defaultZone.id);
      if (defaultZone.defaultFinish) {
        setActiveCategory(defaultZone.defaultFinish.category);
      }
    }
  };

  const handleZoneClick = (zoneId: string) => {
    setActiveZone(zoneId);
    if (!activeScene) return;
    const zone = activeScene.zones.find((z) => z.id === zoneId);
    if (zone) {
      const currentFinish = selections[zoneId];
      if (currentFinish) {
        setActiveCategory(currentFinish.category);
      } else if (zone.allowedCategories.length > 0) {
        setActiveCategory(zone.allowedCategories[0]);
      }
    }
  };

  const handleSelectFinish = (finish: Finish) => {
    if (!activeZone) return;
    setSelections((prev) => ({ ...prev, [activeZone]: finish }));
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-ink border border-line rounded-sm">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-ember border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-mono text-stone-dim tracking-widest uppercase">
            Loading Visualizer CMS...
          </p>
        </div>
      </div>
    );
  }

  // Graceful empty state when no room scenes are published
  if (scenes.length === 0 || !activeScene) {
    return (
      <div className="w-full py-24 px-8 flex flex-col items-center justify-center bg-ink-2/30 border border-line text-center rounded-sm">
        <div className="max-w-md space-y-4">
          <span className="block text-[8px] font-mono tracking-widest text-ember uppercase">
            CMS DATA OFFLINE
          </span>
          <h3 className="font-display text-lg font-medium text-parchment">
            No Published Scenes Available
          </h3>
          <p className="text-xs text-stone-dim leading-relaxed">
            There are no room scenes published in the Admin CMS. Go to the Admin Visualizer page to create and configure masking zones.
          </p>
          <a
            href="/admin/visualizer"
            className="inline-block bg-ember text-ember-text font-mono text-[10px] tracking-widest uppercase px-6 py-3 hover:bg-ember-light transition-all rounded-sm font-semibold"
          >
            Configure Visualizer
          </a>
        </div>
      </div>
    );
  }

  const currentSelection = activeZone ? selections[activeZone] : null;
  const activeZoneObj = activeZone ? activeScene.zones.find((z) => z.id === activeZone) : null;
  const activeZoneLabel = activeZoneObj?.label ?? '';

  // Get allowed finishes categories for active zone
  const allowedCategories = activeZoneObj?.allowedCategories || [];
  const currentCategoryFinishes = finishesCatalog[activeCategory] || [];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-0 items-stretch border border-line overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT PANEL — WebGL Render Canvas
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex-grow bg-[#0D0B09] h-[50vh] xl:h-auto min-h-[400px] xl:min-h-[600px] overflow-hidden">
        <VisualizerCanvas
          scene={activeScene}
          selections={selections}
          activeZone={activeZone}
          hoveredZone={hoveredZone}
          onZoneClick={handleZoneClick}
          onZoneHover={setHoveredZone}
        />

        {/* Zone hotspot overlay labels (Responsive dynamic positioning) */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {activeScene.zones.map((zone) => {
            const xs = zone.corners.map((c) => c[0]);
            const ys = zone.corners.map((c) => c[1]);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            const pctX = (centerX / activeScene.naturalWidth) * 100;
            const pctY = (centerY / activeScene.naturalHeight) * 100;

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

        {/* Top Left Corner Scene switcher dropdown/tabs (Only visible if > 1 scenes exist) */}
        <div className="absolute top-3 left-3 z-10 space-y-2 pointer-events-auto">
          {scenes.length > 1 ? (
            <div className="flex items-center gap-1.5 bg-black/60 border border-line/50 p-1.5 rounded-sm backdrop-blur-md">
              <span className="text-[8px] font-mono tracking-wider text-ember uppercase font-bold pl-1.5">
                Room:
              </span>
              <select
                value={activeSceneIdx}
                onChange={(e) => handleSceneChange(Number(e.target.value))}
                className="bg-transparent text-parchment text-[10px] font-display font-medium outline-none border-none pr-4 cursor-pointer"
              >
                {scenes.map((s, idx) => (
                  <option key={s.id} value={idx} className="bg-ink text-parchment">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="pointer-events-none">
              <span className="block text-[8px] font-mono tracking-widest text-ember uppercase opacity-90">
                Realtime Visualiser
              </span>
              <span className="block text-[10px] font-display font-medium text-white/80">
                Click any surface directly to customize
              </span>
            </div>
          )}
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
            {activeScene.zones.map((z) => (
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
            {Object.keys(finishesCatalog).map((cat) => {
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
              const isSelected = selections[activeZone || '']?.id === item.id;
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
