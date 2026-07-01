'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plank {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  grain: string;
}

interface FallingSlice {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  vx: number;
  opacity: number;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PLANK_HEIGHT = 32;
const CANVAS_W = 520;
const CANVAS_H = 700;
const SPEED_MULTIPLIER = 0.028;

const WOOD_COLORS = [
  { base: '#C8A97A', dark: '#8B6340' },  // Oak
  { base: '#E2D4BF', dark: '#7A6850' },  // Birch
  { base: '#B5876A', dark: '#6B4A2E' },  // Walnut
  { base: '#D4B896', dark: '#8C6A45' },  // Maple
  { base: '#A0785A', dark: '#5C3D20' },  // Cherry
  { base: '#F5B800', dark: '#C68A00' },  // Sitka Laminate
];

// ─── Draw woodgrain plank ─────────────────────────────────────────────────────
function drawPlank(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  baseColor: string, darkColor: string,
  alpha = 1
) {
  if (width <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Base fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, width, height);

  // Wood grain lines
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 7; i++) {
    const gx = x + (width * (i + 1)) / 8;
    ctx.globalAlpha = alpha * (0.08 + Math.random() * 0.06);
    ctx.beginPath();
    ctx.moveTo(gx + Math.sin(i) * 2, y);
    ctx.lineTo(gx + Math.sin(i + 1) * 2, y + height);
    ctx.stroke();
  }

  // Top highlight
  ctx.globalAlpha = alpha * 0.25;
  const grad = ctx.createLinearGradient(x, y, x, y + height);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, width, height * 0.4);

  // Edge shadow
  ctx.globalAlpha = alpha * 0.3;
  ctx.fillStyle = darkColor;
  ctx.fillRect(x, y + height - 4, width, 4);

  // Side dark edges (ply layers)
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = darkColor;
  ctx.fillRect(x, y, 2, height);
  ctx.fillRect(x + width - 2, y, 2, height);

  ctx.restore();
}

// ─── Main Game Component ──────────────────────────────────────────────────────
export default function PlywoodStackerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    planks: [] as Plank[],
    fallingSlices: [] as FallingSlice[],
    currentX: 0,
    currentDir: 1,
    currentWidth: CANVAS_W * 0.65,
    level: 0,
    score: 0,
    highScore: 0,
    gameState: 'idle' as 'idle' | 'playing' | 'gameover',
    animId: 0,
    colorIdx: 0,
  });

  const [displayScore, setDisplayScore] = useState(0);
  const [displayLevel, setDisplayLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [highScore, setHighScore] = useState(0);

  const getStackTop = useCallback(() => {
    const s = stateRef.current;
    if (s.planks.length === 0) return CANVAS_H - PLANK_HEIGHT;
    return s.planks[s.planks.length - 1].y - PLANK_HEIGHT;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#15120F');
    bgGrad.addColorStop(1, '#1E1A15');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid dots
    ctx.fillStyle = 'rgba(201,194,180,0.04)';
    for (let gx = 0; gx < CANVAS_W; gx += 20) {
      for (let gy = 0; gy < CANVAS_H; gy += 20) {
        ctx.fillRect(gx, gy, 1, 1);
      }
    }

    // Draw stacked planks
    s.planks.forEach((p, i) => {
      const c = WOOD_COLORS[i % WOOD_COLORS.length];
      drawPlank(ctx, p.x, p.y, p.width, p.height, c.base, c.dark);
    });

    // Draw falling slices
    s.fallingSlices.forEach(slice => {
      const c = WOOD_COLORS[s.colorIdx % WOOD_COLORS.length];
      drawPlank(ctx, slice.x, slice.y, slice.width, slice.height, c.base, c.dark, slice.opacity);
    });

    // Draw moving plank (current)
    if (s.gameState === 'playing') {
      const c = WOOD_COLORS[(s.colorIdx + 1) % WOOD_COLORS.length];
      const topY = getStackTop() - 6;
      drawPlank(ctx, s.currentX, topY, s.currentWidth, PLANK_HEIGHT, c.base, c.dark);

      // Saw guide line
      ctx.save();
      ctx.strokeStyle = 'rgba(245,184,0,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, topY + PLANK_HEIGHT + 2);
      ctx.lineTo(CANVAS_W, topY + PLANK_HEIGHT + 2);
      ctx.stroke();
      ctx.restore();
    }

    // Score overlay
    ctx.save();
    ctx.fillStyle = 'rgba(245,184,0,0.9)';
    ctx.font = 'bold 28px "Space Grotesk", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(String(s.score), CANVAS_W - 20, 50);

    ctx.fillStyle = 'rgba(201,194,180,0.5)';
    ctx.font = '11px monospace';
    ctx.fillText(`HI ${s.highScore}`, CANVAS_W - 20, 68);
    ctx.restore();

    // Level badge
    ctx.save();
    ctx.fillStyle = 'rgba(245,184,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 90, 30, 4);
    ctx.fill();
    ctx.fillStyle = '#F5B800';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL  ${s.level + 1}`, 22, 33);
    ctx.restore();
  }, [getStackTop]);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'playing') return;

    // Move plank
    const speed = (2.2 + s.level * SPEED_MULTIPLIER * 60) * s.currentDir;
    s.currentX += speed;

    if (s.currentX + s.currentWidth > CANVAS_W) {
      s.currentX = CANVAS_W - s.currentWidth;
      s.currentDir = -1;
    }
    if (s.currentX < 0) {
      s.currentX = 0;
      s.currentDir = 1;
    }

    // Animate falling slices
    s.fallingSlices = s.fallingSlices
      .map(slice => ({
        ...slice,
        y: slice.y + slice.vy,
        x: slice.x + slice.vx,
        vy: slice.vy + 0.4,
        opacity: slice.opacity - 0.018,
      }))
      .filter(slice => slice.opacity > 0 && slice.y < CANVAS_H + 50);

    draw();
    s.animId = requestAnimationFrame(gameLoop);
  }, [draw]);

  const drop = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'playing') return;

    const stackBase = s.planks.length > 0 ? s.planks[s.planks.length - 1] : null;
    const baseX = stackBase ? stackBase.x : 0;
    const baseW = stackBase ? stackBase.width : CANVAS_W;

    const overlapStart = Math.max(s.currentX, baseX);
    const overlapEnd = Math.min(s.currentX + s.currentWidth, baseX + baseW);
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 2) {
      // MISS — game over
      s.gameState = 'gameover';
      cancelAnimationFrame(s.animId);
      draw();
      setGameState('gameover');

      const stored = parseInt(localStorage.getItem('sitka-plywood-hi') || '0');
      const newHi = Math.max(stored, s.score);
      localStorage.setItem('sitka-plywood-hi', String(newHi));
      s.highScore = newHi;
      setHighScore(newHi);
      return;
    }

    const newY = getStackTop();

    // Create falling slice(s)
    if (s.currentX < overlapStart) {
      s.fallingSlices.push({
        x: s.currentX, y: newY,
        width: overlapStart - s.currentX,
        height: PLANK_HEIGHT,
        vy: 1, vx: -1.5, opacity: 1,
        color: WOOD_COLORS[s.colorIdx % WOOD_COLORS.length].base,
      });
    }
    if (s.currentX + s.currentWidth > overlapEnd) {
      s.fallingSlices.push({
        x: overlapEnd, y: newY,
        width: (s.currentX + s.currentWidth) - overlapEnd,
        height: PLANK_HEIGHT,
        vy: 1, vx: 1.5, opacity: 1,
        color: WOOD_COLORS[s.colorIdx % WOOD_COLORS.length].base,
      });
    }

    // Add plank to stack
    s.planks.push({ x: overlapStart, y: newY, width: overlapWidth, height: PLANK_HEIGHT, color: '', grain: '' });
    s.currentWidth = overlapWidth;
    s.currentX = overlapStart;
    s.colorIdx++;
    s.score++;
    s.level = Math.floor(s.score / 5);
    setDisplayScore(s.score);
    setDisplayLevel(s.level);
  }, [draw, getStackTop]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    cancelAnimationFrame(s.animId);

    const storedHi = parseInt(localStorage.getItem('sitka-plywood-hi') || '0');
    s.highScore = storedHi;
    setHighScore(storedHi);

    s.planks = [{ x: CANVAS_W * 0.175, y: CANVAS_H - PLANK_HEIGHT, width: CANVAS_W * 0.65, height: PLANK_HEIGHT, color: '', grain: '' }];
    s.fallingSlices = [];
    s.currentX = 0;
    s.currentWidth = CANVAS_W * 0.65;
    s.currentDir = 1;
    s.level = 0;
    s.score = 0;
    s.colorIdx = 0;
    s.gameState = 'playing';
    setDisplayScore(0);
    setDisplayLevel(0);
    setGameState('playing');

    s.animId = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') startGame();
        else drop();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drop, gameState, startGame]);

  // Draw idle screen on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, '#15120F');
    bg.addColorStop(1, '#1E1A15');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Sample planks
    for (let i = 0; i < 5; i++) {
      const c = WOOD_COLORS[i % WOOD_COLORS.length];
      const pw = CANVAS_W * 0.65 - i * 12;
      const px = (CANVAS_W - pw) / 2;
      drawPlank(ctx, px, CANVAS_H - PLANK_HEIGHT * (i + 1) - i * 2, pw, PLANK_HEIGHT, c.base, c.dark);
    }
  }, []);

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center py-8 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-[10px] font-mono tracking-[0.4em] text-stone-dim uppercase mb-1">Sitka Surfaces</p>
        <h1 className="text-4xl font-display font-semibold text-parchment">Plywood Stacker</h1>
        <p className="text-xs text-stone-dim mt-1 font-mono">Stack the planks. Don't miss.</p>
      </div>

      {/* Canvas wrapper */}
      <div className="relative" style={{ width: CANVAS_W, maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-lg border border-line cursor-pointer w-full"
          style={{ maxWidth: '100%', touchAction: 'none' }}
          onClick={() => {
            if (gameState === 'idle' || gameState === 'gameover') startGame();
            else drop();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === 'idle' || gameState === 'gameover') startGame();
            else drop();
          }}
        />

        {/* Idle overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
            style={{ background: 'rgba(21,18,15,0.75)', backdropFilter: 'blur(2px)' }}>
            <div className="text-center space-y-4 px-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-ember/20 flex items-center justify-center border border-ember/40">
                <span className="text-2xl">🪵</span>
              </div>
              <h2 className="text-xl font-display font-semibold text-parchment">Ready to Stack?</h2>
              <p className="text-stone-dim text-sm font-mono leading-relaxed">
                Tap or press <kbd className="bg-charcoal text-ember px-2 py-0.5 rounded text-xs border border-line">Space</kbd> to drop each plank.<br />
                Perfect alignment builds the tallest tower.
              </p>
              <button onClick={startGame}
                className="mt-2 px-8 py-3 bg-ember text-ember-text font-mono text-xs tracking-widest uppercase rounded-sm hover:bg-ember-light transition-colors">
                Start Game
              </button>
              <p className="text-[10px] text-stone-dim font-mono">
                Best: <span className="text-ember">{highScore}</span>
              </p>
            </div>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
            style={{ background: 'rgba(21,18,15,0.82)', backdropFilter: 'blur(3px)' }}>
            <div className="text-center space-y-4 px-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-900/30 flex items-center justify-center border border-red-800/40">
                <span className="text-3xl">🪚</span>
              </div>
              <h2 className="text-2xl font-display font-semibold text-parchment">Plank Dropped!</h2>
              <div className="space-y-1">
                <p className="text-4xl font-mono font-bold text-ember">{displayScore}</p>
                <p className="text-xs text-stone-dim font-mono">planks stacked</p>
              </div>
              {displayScore >= highScore && displayScore > 0 && (
                <p className="text-xs text-ember font-mono tracking-wider animate-pulse">🏆 New Best Score!</p>
              )}
              <p className="text-xs text-stone-dim font-mono">Best: {highScore}</p>
              <button onClick={startGame}
                className="mt-2 px-8 py-3 bg-ember text-ember-text font-mono text-xs tracking-widest uppercase rounded-sm hover:bg-ember-light transition-colors">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live stats bar */}
      {gameState === 'playing' && (
        <div className="mt-4 flex items-center gap-8 text-xs font-mono text-stone-dim">
          <span>Level <span className="text-ember">{displayLevel + 1}</span></span>
          <span>Score <span className="text-ember">{displayScore}</span></span>
          <span>Best <span className="text-ember">{highScore}</span></span>
        </div>
      )}

      <p className="mt-6 text-[10px] text-stone-dim font-mono text-center max-w-xs leading-relaxed opacity-60">
        Available offline · Tap canvas or press Space to drop · Precision earns levels
      </p>
    </div>
  );
}
