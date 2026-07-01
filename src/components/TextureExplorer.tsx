'use client';

import React, { useState, useRef } from 'react';
import { ZoomIn, Check, Info } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

type Swatch = {
  name: string;
  color?: string; // Hex color fallback
  imageUrl: string; // High-res image URL for zoom
  desc: string;
};

type TextureExplorerProps = {
  verticalName: string;
  swatches?: Swatch[];
};

export default function TextureExplorer({ verticalName, swatches }: TextureExplorerProps) {
  const { openBrochure } = useModal();
  
  // Default swatches per vertical if none are passed
  const defaultSwatches: Record<string, Swatch[]> = {
    plywood: [
      { 
        name: 'Birch Core Face', 
        imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
        desc: 'Pale, clean wood grain. Ultra-fine sanding face for immediate lamination.',
        color: '#decfa7'
      },
      { 
        name: 'Gurjan Core Face', 
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
        desc: 'Reddish-brown close grain. Highly dense hardwood core veneer.',
        color: '#8f4f34'
      }
    ],
    laminates: [
      { 
        name: 'Chalk White Matte', 
        imageUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80',
        desc: 'Super-matte micro-texture. Reflects minimal light and resists smudges.',
        color: '#f4f3ef'
      },
      { 
        name: 'Smoked Walnut Woodgrain', 
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        desc: 'Embossed grain pores matching the walnut print. Incredible depth.',
        color: '#3a271d'
      }
    ],
    veneer: [
      { 
        name: 'American Walnut Crown', 
        imageUrl: 'https://images.unsplash.com/photo-1507312152423-a88a400f63ae?auto=format&fit=crop&w=1200&q=80',
        desc: 'Rich cathedral loops. Deep chocolate tones with lighter sapwood contrasts.',
        color: '#503829'
      },
      { 
        name: 'Rift Silver Oak', 
        imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        desc: 'Clean, linear comb grain. Muted gray-blonde tone suitable for modern spaces.',
        color: '#b5a593'
      }
    ],
    decoratives: [
      { 
        name: 'Ribbed Charcoal Slats', 
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        desc: '3D ribbed profile slats. High sound absorption backing combined with clean lines.',
        color: '#242220'
      }
    ]
  };

  const list = swatches || defaultSwatches[verticalName.toLowerCase()] || defaultSwatches['plywood'];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = list[selectedIdx];

  // Magnifier Lens Zoom Logic
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Get mouse position relative to container
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPos({ x, y });
  };

  const [sampleOrdered, setSampleOrdered] = useState(false);

  const triggerSampleOrder = () => {
    setSampleOrdered(true);
    setTimeout(() => setSampleOrdered(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-ink-2 border border-line p-6 md:p-8 rounded-sm">
      
      {/* 1. Left Selector Panel (cols 4) */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-brass uppercase block mb-1">
            Finish Explorer
          </span>
          <h3 className="text-xl md:text-2xl font-display font-medium text-parchment">
            Texture &amp; Swatch Viewer
          </h3>
          <p className="text-stone-dim text-xs leading-relaxed mt-2">
            Zoom into actual high-resolution scans. Notice the grain pores, light reflection, and tactile details.
          </p>
        </div>

        {/* Swatch List */}
        <div className="space-y-3">
          {list.map((swatch, idx) => (
            <button
              key={swatch.name}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full text-left p-3.5 border flex items-start gap-4 transition-all duration-300 rounded-sm cursor-pointer ${
                selectedIdx === idx 
                  ? 'border-brass bg-ink' 
                  : 'border-line hover:border-stone-dim/35 bg-ink/20'
              }`}
            >
              {/* Color Block */}
              <div 
                className="w-10 h-10 border border-line flex-shrink-0 bg-cover bg-center rounded-sm"
                style={{ 
                  backgroundColor: swatch.color || '#242220',
                  backgroundImage: `url(${swatch.imageUrl})`
                }}
              />
              {/* Swatch info */}
              <div className="space-y-0.5">
                <span className="block text-xs font-semibold text-parchment">
                  {swatch.name}
                </span>
                <span className="block text-[10px] text-stone-dim leading-snug font-sans">
                  {swatch.desc.substring(0, 52)}...
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={triggerSampleOrder}
            className="flex-grow bg-ember hover:bg-ember-light text-parchment text-[10px] font-mono tracking-wider uppercase py-3.5 px-6 rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            {sampleOrdered ? (
              <>
                <Check className="w-3.5 h-3.5" /> Sample Requested
              </>
            ) : (
              'Order Physical Sample'
            )}
          </button>
          <button 
            onClick={() => openBrochure(verticalName)}
            className="border border-line hover:border-stone text-stone-dim hover:text-parchment text-[10px] font-mono tracking-wider uppercase py-3.5 px-6 rounded-sm transition-colors text-center cursor-pointer"
          >
            Download Specs
          </button>
        </div>
      </div>

      {/* 2. Right Interactive Zoom Panel (cols 8) */}
      <div className="lg:col-span-8 flex flex-col items-center">
        
        {/* Interactive Image Container */}
        <div 
          ref={containerRef}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          className="relative w-full h-[320px] md:h-[420px] bg-ink border border-line rounded-sm overflow-hidden cursor-crosshair group"
        >
          {/* Main Swatch Image */}
          <img 
            src={selected.imageUrl} 
            alt={selected.name}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
          />

          {/* Helper icon overlays */}
          {!showZoom && (
            <div className="absolute bottom-4 right-4 bg-[#0a0806]/80 text-parchment font-mono text-[9px] tracking-wider uppercase p-2 flex items-center gap-1.5 border border-line rounded-sm backdrop-blur-sm pointer-events-none">
              <ZoomIn className="w-3 h-3 text-ember-light" /> Hover to Zoom Texture
            </div>
          )}

          {/* Magnifier Lens */}
          {showZoom && (
            <div 
              className="absolute w-40 h-40 border-2 border-brass/75 rounded-full pointer-events-none shadow-2xl overflow-hidden bg-ink"
              style={{
                left: `${zoomPos.x}%`,
                top: `${zoomPos.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundImage: `url(${selected.imageUrl})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '400% 400%', // 4x Zoom
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
              }}
            />
          )}
        </div>

        {/* Selected Swatch Specs info strip */}
        <div className="w-full bg-ink border-t-0 border border-line p-4 rounded-b-sm flex items-center gap-3 text-stone-dim text-xs leading-relaxed">
          <Info className="w-4 h-4 text-brass flex-shrink-0" />
          <p>
            <b className="text-parchment">{selected.name} Details:</b> {selected.desc}
          </p>
        </div>

      </div>
    </div>
  );
}
