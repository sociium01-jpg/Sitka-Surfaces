'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useModal } from '@/context/ModalContext';
import LaminateToWoodButton from '@/components/LaminateToWoodButton';

// ─── Types ────────────────────────────────────────────────────────────────────
type Finish = {
  id: string;
  name: string;
  sku: string;
  category: string;
  color?: string;
  imgUrl?: string;
};

type ZoneId = 'wall' | 'upperCabinet' | 'countertop' | 'lowerCabinet' | 'floor';

type Zone = {
  id: ZoneId;
  label: string;
  /** Points as [x,y] in CANVAS_W × CANVAS_H pixel space */
  points: [number, number][];
  /** CSS label position for the hotspot tag */
  labelPos: { x: number; y: number };
};

// ─── Canvas / Image Constants ────────────────────────────────────────────────
// Room photo: generated 1024×1024, placed in /public/visualizer-room.png
// All zone coordinates are in this 1024×1024 pixel space.
// Measured directly from the generated image visual inspection:
//   Wall       : y   0 →  317  (top 31%)
//   UpperCab   : y 317 →  481  (31% → 47%)
//   Countertop : y 481 →  614  (47% → 60%)  ← includes backsplash gap + slab
//   LowerCab   : y 614 →  901  (60% → 88%)
//   Floor      : y 901 → 1024  (88% → 100%)
// X: full width 0 → 1024 for all zones (orthographic shot, no perspective)

const IMG_W = 1024;
const IMG_H = 1024;

// Zone definitions — pixel coordinates in IMG_W × IMG_H space
const ZONES: Zone[] = [
  {
    id: 'wall',
    label: 'Feature Wall',
    points: [
      [0,   0],
      [1024, 0],
      [1024, 317],
      [0,   317],
    ],
    labelPos: { x: 50, y: 15 },
  },
  {
    id: 'upperCabinet',
    label: 'Upper Cabinets',
    points: [
      [0,   317],
      [1024, 317],
      [1024, 481],
      [0,   481],
    ],
    labelPos: { x: 50, y: 39 },
  },
  {
    id: 'countertop',
    label: 'Countertop',
    points: [
      [0,   481],
      [1024, 481],
      [1024, 614],
      [0,   614],
    ],
    labelPos: { x: 50, y: 53 },
  },
  {
    id: 'lowerCabinet',
    label: 'Lower Cabinets',
    points: [
      [0,   614],
      [1024, 614],
      [1024, 901],
      [0,   901],
    ],
    labelPos: { x: 50, y: 73 },
  },
  {
    id: 'floor',
    label: 'Floor',
    points: [
      [0,   901],
      [1024, 901],
      [1024, 1024],
      [0,   1024],
    ],
    labelPos: { x: 50, y: 94 },
  },
];

// ─── Material Catalog ─────────────────────────────────────────────────────────
const CATALOG: Record<string, Finish[]> = {
  Plywood: [
    {
      id: 'ply-birch',
      name: 'Natural Birch Core',
      sku: 'PLY-BRCH-01',
      category: 'Plywood',
      imgUrl:
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=512&auto=format&fit=crop',
    },
    {
      id: 'ply-oak',
      name: 'Smoked Crown Oak',
      sku: 'PLY-OAK-04',
      category: 'Plywood',
      imgUrl:
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=512&auto=format&fit=crop',
    },
    {
      id: 'ply-walnut',
      name: 'American Walnut',
      sku: 'PLY-WLNT-09',
      category: 'Plywood',
      imgUrl:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=512&auto=format&fit=crop',
    },
  ],
  Laminates: [
    {
      id: 'lam-yellow',
      name: 'Sitka Brand Yellow',
      sku: 'LAM-YEL-500',
      category: 'Laminates',
      color: '#F5B800',
    },
    {
      id: 'lam-charcoal',
      name: 'Matte Obsidian Charcoal',
      sku: 'LAM-CHAR-12',
      category: 'Laminates',
      color: '#2C2825',
    },
    {
      id: 'lam-parchment',
      name: 'Alabaster Parchment',
      sku: 'LAM-PARCH-88',
      category: 'Laminates',
      color: '#EDE6D8',
    },
    {
      id: 'lam-sage',
      name: 'Nordic Sage Green',
      sku: 'LAM-SAGE-21',
      category: 'Laminates',
      color: '#7A8F7A',
    },
    {
      id: 'lam-terracotta',
      name: 'Fired Terracotta',
      sku: 'LAM-TERRA-07',
      category: 'Laminates',
      color: '#B5603A',
    },
    {
      id: 'lam-slate',
      name: 'Storm Grey Slate',
      sku: 'LAM-SLATE-33',
      category: 'Laminates',
      color: '#5C6370',
    },
  ],
  Veneer: [
    {
      id: 'ven-teak',
      name: 'Burmese Golden Teak',
      sku: 'VEN-TEAK-33',
      category: 'Veneer',
      imgUrl:
        'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=512&auto=format&fit=crop',
    },
    {
      id: 'ven-ash',
      name: 'Parchment White Ash',
      sku: 'VEN-ASH-15',
      category: 'Veneer',
      imgUrl:
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=512&auto=format&fit=crop',
    },
    {
      id: 'ven-maple',
      name: 'Figured Maple',
      sku: 'VEN-MPL-08',
      category: 'Veneer',
      imgUrl:
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=512&auto=format&fit=crop',
    },
  ],
  Decoratives: [
    {
      id: 'dec-slat',
      name: 'Oak Acoustic Slat',
      sku: 'DEC-SLAT-02',
      category: 'Decoratives',
      imgUrl:
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=512&auto=format&fit=crop',
    },
    {
      id: 'dec-concrete',
      name: 'Raw Concrete Panel',
      sku: 'DEC-CONC-05',
      category: 'Decoratives',
      color: '#9E9E9E',
    },
    {
      id: 'dec-brass',
      name: 'Polished Brass Trim',
      sku: 'DEC-BRSS-07',
      category: 'Decoratives',
      color: '#D4A017',
    },
  ],
};

// Default material selections per zone
const DEFAULTS: Record<ZoneId, Finish> = {
  wall:         CATALOG.Plywood[2],     // Walnut
  upperCabinet: CATALOG.Veneer[0],      // Teak
  countertop:   CATALOG.Laminates[5],   // Slate
  lowerCabinet: CATALOG.Laminates[1],   // Charcoal
  floor:        CATALOG.Veneer[2],      // Maple
};

// ─── Utility: Build Path2D from zone points ───────────────────────────────────
function buildPath(points: [number, number][]): Path2D {
  const path = new Path2D();
  path.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i][0], points[i][1]);
  }
  path.closePath();
  return path;
}

// ─── Utility: Choose composite mode based on material brightness ──────────────
// Dark colors: multiply (shadow-preserving). Light colors: screen (lightens).
// Neutral: color-dodge or source-over at low opacity.
function compositeMode(finish: Finish): GlobalCompositeOperation {
  if (!finish.color) return 'multiply'; // textures always multiply
  const hex = finish.color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance > 0.75) return 'soft-light';  // Very light colors: soft-light
  if (luminance > 0.45) return 'multiply';     // Mid tones: multiply
  return 'multiply';                            // Dark: multiply
}

// ─── Utility: Overlay opacity based on material type ─────────────────────────
function overlayOpacity(finish: Finish): number {
  if (!finish.color) return 0.65;
  const hex = finish.color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Light colors need less opacity (they already wash things out at high alpha)
  if (luminance > 0.75) return 0.35;
  if (luminance > 0.45) return 0.55;
  return 0.70; // Dark colors need higher opacity
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Visualizer() {
  const { openBrochure } = useModal();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── State ──
  const [selections, setSelections] = useState<Record<ZoneId, Finish>>(DEFAULTS);
  const [activeZone, setActiveZone] = useState<ZoneId>('lowerCabinet');
  const [activeCategory, setActiveCategory] = useState<string>('Laminates');
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null);
  const [imagesReady, setImagesReady] = useState(false);

  // ── Image cache ──
  const imgCache = useRef<Record<string, HTMLImageElement>>({});
  const roomImgRef = useRef<HTMLImageElement | null>(null);

  // Build a full list of all image URLs to preload
  const allImgUrls = useMemo(() => {
    const urls: string[] = ['/visualizer-room.png'];
    Object.values(CATALOG).flat().forEach((f) => {
      if (f.imgUrl) urls.push(f.imgUrl);
    });
    return [...new Set(urls)];
  }, []);

  // Preload all images
  useEffect(() => {
    let loaded = 0;
    const total = allImgUrls.length;

    allImgUrls.forEach((url) => {
      if (imgCache.current[url]) {
        loaded++;
        if (loaded >= total) setImagesReady(true);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgCache.current[url] = img;
        if (url === '/visualizer-room.png') roomImgRef.current = img;
        loaded++;
        if (loaded >= total) setImagesReady(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded >= total) setImagesReady(true);
      };
      img.src = url;
    });
  }, [allImgUrls]);

  // ── Canvas Render Pipeline ──────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !roomImgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = IMG_W;
    const H = IMG_H;

    // ── PASS 1: Draw full room photo as base ──
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(roomImgRef.current, 0, 0, W, H);

    // ── PASS 2: Per-zone material overlay (isolated compositing) ──
    ZONES.forEach((zone) => {
      const finish = selections[zone.id];
      const path = buildPath(zone.points);

      ctx.save();
      // Clip to this zone's exact polygon
      ctx.clip(path);

      // Choose blend mode based on material luminance
      const mode = compositeMode(finish);
      const alpha = overlayOpacity(finish);

      ctx.globalCompositeOperation = mode;
      ctx.globalAlpha = alpha;

      if (finish.color) {
        // Solid color fill
        ctx.fillStyle = finish.color;
        ctx.fillRect(0, 0, W, H);
      } else if (finish.imgUrl && imgCache.current[finish.imgUrl]) {
        // Tiled texture pattern
        const texImg = imgCache.current[finish.imgUrl];
        const pattern = ctx.createPattern(texImg, 'repeat');
        if (pattern) {
          // Scale pattern so each tile is ~400px wide for visual richness
          const scale = 400 / texImg.naturalWidth;
          const m = new DOMMatrix();
          m.scaleSelf(scale, scale);
          pattern.setTransform(m);
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, W, H);
        }
      }

      ctx.restore();
    });

    // ── PASS 3: Hover highlight (subtle white glow) ──
    if (hoveredZone) {
      const hZone = ZONES.find((z) => z.id === hoveredZone);
      if (hZone) {
        const path = buildPath(hZone.points);
        ctx.save();
        ctx.clip(path);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    }

    // ── PASS 4: Active zone border — luminous amber dashed outline ──
    const activeZoneObj = ZONES.find((z) => z.id === activeZone);
    if (activeZoneObj) {
      const pts = activeZoneObj.points;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      // Outer glow
      ctx.shadowColor = '#F5B800';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = '#F5B800';
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 8]);
      ctx.lineDashOffset = (Date.now() / 40) % 24; // animated march

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }
  }, [selections, activeZone, hoveredZone]);

  // ── Animate the marching ants border ──
  useEffect(() => {
    if (!imagesReady) return;
    let rafId: number;
    const loop = () => {
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render, imagesReady]);

  // ── Canvas Click → Zone Hit Test ──────────────────────────────────────────
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // Scale DOM coords → canvas pixel coords
      const scaleX = IMG_W / rect.width;
      const scaleY = IMG_H / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      // Test zones in reverse order (topmost first visually)
      const reversed = [...ZONES].reverse();
      for (const zone of reversed) {
        const path = buildPath(zone.points);
        const ctx = canvas.getContext('2d');
        if (ctx && ctx.isPointInPath(path, cx, cy)) {
          setActiveZone(zone.id);
          setActiveCategory(selections[zone.id].category);
          return;
        }
      }
    },
    [selections]
  );

  // ── Canvas Hover → Zone Detection ─────────────────────────────────────────
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = IMG_W / rect.width;
      const scaleY = IMG_H / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let found: ZoneId | null = null;
      for (const zone of ZONES) {
        const path = buildPath(zone.points);
        if (ctx.isPointInPath(path, cx, cy)) {
          found = zone.id;
          break;
        }
      }
      setHoveredZone(found);
      canvas.style.cursor = found ? 'pointer' : 'default';
    },
    []
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredZone(null);
  }, []);

  // ── Finish selection ──
  const handleSelectFinish = (finish: Finish) => {
    setSelections((prev) => ({ ...prev, [activeZone]: finish }));
  };

  const currentSelection = selections[activeZone];
  const activeZoneLabel = ZONES.find((z) => z.id === activeZone)?.label ?? '';

  return (
    <div className="w-full flex flex-col xl:flex-row gap-0 items-stretch border border-line overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT PANEL — Canvas Room Scene
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative flex-grow bg-[#0D0B09] overflow-hidden">
        {/* Loading state */}
        {!imagesReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink z-50">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-2 border-ember border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-mono text-stone-dim tracking-widest uppercase">
                Loading materials...
              </p>
            </div>
          </div>
        )}

        {/* The Canvas — fills the container, 1:1 aspect ratio like the room image */}
        <canvas
          ref={canvasRef}
          width={IMG_W}
          height={IMG_H}
          className="w-full h-auto block"
          style={{ maxHeight: '70vh', objectFit: 'contain' }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
        />

        {/* Zone hotspot overlay labels */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              className={`pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase rounded-sm border transition-all duration-200 ${
                activeZone === zone.id
                  ? 'bg-ember text-ember-text border-ember shadow-lg shadow-ember/40'
                  : 'bg-black/40 text-white/70 border-white/20 hover:border-ember/60 hover:text-ember backdrop-blur-sm'
              }`}
              style={{
                left: `${zone.labelPos.x}%`,
                top: `${zone.labelPos.y}%`,
              }}
              onClick={() => {
                setActiveZone(zone.id);
                setActiveCategory(selections[zone.id].category);
              }}
            >
              {zone.label}
            </button>
          ))}
        </div>

        {/* Corner badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="block text-[8px] font-mono tracking-widest text-ember uppercase opacity-70">
            Visualizer Mode
          </span>
          <span className="block text-[10px] font-display font-medium text-white/80">
            Click any surface to customise
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Controls
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full xl:w-88 flex flex-col bg-ink-2/60 border-l border-line">
        {/* Active zone header */}
        <div className="px-5 py-4 border-b border-line/50">
          <span className="text-[8px] font-mono tracking-widest text-brass uppercase block mb-2">
            Active Surface
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => {
                  setActiveZone(z.id);
                  setActiveCategory(selections[z.id].category);
                }}
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
            {Object.keys(CATALOG).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 text-[8px] font-mono uppercase tracking-wider text-center border rounded-sm transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'border-parchment text-parchment font-semibold bg-parchment/5'
                    : 'border-line text-stone-dim hover:text-stone hover:border-stone-dim'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Finish swatches */}
        <div className="px-5 py-4 flex-grow overflow-y-auto border-b border-line/50">
          <span className="text-[8px] font-mono tracking-widest text-brass uppercase block mb-3">
            Select Finish
          </span>
          <div className="grid grid-cols-3 gap-2">
            {CATALOG[activeCategory]?.map((item) => {
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
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: item.color }}
                    />
                  ) : (
                    <img
                      src={item.imgUrl}
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
                  {/* Name tooltip on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p className="text-[6px] font-mono text-white truncate leading-tight">
                      {item.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current selection detail + CTA */}
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
                src={currentSelection?.imgUrl}
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
              openBrochure(
                `Sample Request: ${currentSelection?.name} (${currentSelection?.sku})`
              )
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
