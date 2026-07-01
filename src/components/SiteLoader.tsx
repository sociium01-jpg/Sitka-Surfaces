'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function SiteLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'laminate' | 'peeling' | 'done'>('laminate');
  const [mounted, setMounted] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Draw procedural plywood grain onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    // Base birch color
    ctx.fillStyle = '#E2D4BF';
    ctx.fillRect(0, 0, w, h);

    // Growth rings
    ctx.strokeStyle = '#7A6850';
    ctx.lineWidth = 1.2;
    const cx = w * 0.45;
    const cy = -h * 0.2;
    for (let r = 40; r < Math.max(w, h) * 3.5; r += 14 + Math.random() * 10) {
      ctx.beginPath();
      ctx.globalAlpha = 0.06 + Math.random() * 0.09;
      ctx.ellipse(cx, cy, r, r * 1.55, Math.PI / 16, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Fine noise
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i] + noise));
      imgData.data[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + noise));
      imgData.data[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Ply edge lines
    const layers = 18;
    const lh = h / layers;
    for (let i = 0; i < layers; i++) {
      if (i % 2 === 1) {
        ctx.fillStyle = 'rgba(80,60,40,0.28)';
        ctx.fillRect(0, i * lh, w, lh * 0.35);
      }
    }
  }, [mounted]);

  // Progress ticker
  useEffect(() => {
    const startTime = performance.now();
    const duration = 2400;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(Math.floor(p));

      if (p >= 45 && phase === 'laminate') setPhase('peeling');
      if (p >= 100) {
        setPhase('done');
        setTimeout(() => setMounted(false), 900);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!mounted) return null;

  const peeledFraction = phase === 'done' ? 1 : phase === 'peeling' ? (progress - 45) / 55 : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        opacity: phase === 'done' ? 0 : 1,
        transition: 'opacity 0.8s ease',
        pointerEvents: phase === 'done' ? 'none' : 'all',
      }}
    >
      {/* === LAYER 1: Plywood grain (underneath, always visible) === */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* === LAYER 2: Yellow Laminate panel (slides up/peels away) === */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #F5B800 0%, #E09A00 100%)',
          clipPath: `inset(0 0 ${peeledFraction * 105}% 0)`,
          transition: 'clip-path 0.08s linear',
        }}
      />

      {/* Fine laminate stipple on yellow layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '4px 4px',
          clipPath: `inset(0 0 ${peeledFraction * 105}% 0)`,
          transition: 'clip-path 0.08s linear',
        }}
      />

      {/* Peel edge glow line */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: `${peeledFraction * 100}%`,
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #FFD23F 30%, #fff 50%, #FFD23F 70%, transparent 100%)',
          boxShadow: '0 0 18px 4px rgba(245,184,0,0.7)',
          opacity: phase === 'peeling' ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />

      {/* === CONTENT: Logo + Progress bar === */}
      <div className="relative z-10 flex flex-col items-center gap-8 select-none">
        {/* Logo wordmark */}
        <div className="text-center space-y-1">
          <span
            className="block text-[10px] font-mono tracking-[0.4em] uppercase"
            style={{ color: phase === 'peeling' && peeledFraction > 0.5 ? '#D4A017' : '#1A1409' }}
          >
            Est. 1998
          </span>
          <h1
            className="text-5xl md:text-7xl font-display font-semibold tracking-tight leading-none"
            style={{
              color: phase === 'peeling' && peeledFraction > 0.5 ? '#EDE6D8' : '#1A1409',
              transition: 'color 0.4s',
            }}
          >
            Sitka
          </h1>
          <p
            className="text-xs font-mono tracking-[0.3em] uppercase"
            style={{ color: phase === 'peeling' && peeledFraction > 0.5 ? '#C9C2B4' : '#4A3F30' }}
          >
            Surfaces
          </p>
        </div>

        {/* Progress track */}
        <div className="w-64 md:w-80 space-y-2">
          <div
            className="w-full h-[2px] rounded-full overflow-hidden"
            style={{ background: phase === 'peeling' && peeledFraction > 0.5 ? 'rgba(201,194,180,0.2)' : 'rgba(26,20,9,0.15)' }}
          >
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: phase === 'peeling' && peeledFraction > 0.5
                  ? 'linear-gradient(90deg, #F5B800, #FFD23F)'
                  : 'linear-gradient(90deg, #4A3F30, #1A1409)',
                boxShadow: phase === 'peeling' && peeledFraction > 0.5 ? '0 0 8px rgba(245,184,0,0.5)' : 'none',
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span
              className="text-[8px] font-mono tracking-widest uppercase"
              style={{ color: phase === 'peeling' && peeledFraction > 0.5 ? '#8B8478' : '#6B5D4A' }}
            >
              {progress < 45 ? 'Laminating surface...' : progress < 80 ? 'Pressing core...' : 'Finishing edge...'}
            </span>
            <span
              className="text-[8px] font-mono"
              style={{ color: phase === 'peeling' && peeledFraction > 0.5 ? '#F5B800' : '#4A3F30' }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
