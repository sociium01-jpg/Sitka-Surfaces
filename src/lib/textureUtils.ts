/**
 * Procedural texture utilities for drawing woodgrain, laminate, and layered plywood edge textures onto canvas elements.
 */

// Helper to create a canvas and return it
export function createProceduralTextureCanvas(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx);
  }
  return canvas;
}

// Draw alternating light and dark veneers for a plywood edge
export function drawPlywoodEdge(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const layers = 15; // Alternating ply stripes
  const layerHeight = height / layers;

  ctx.fillStyle = '#C9C2B4'; // Base light wood color
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < layers; i++) {
    // Alternate dark/light stripes
    if (i % 2 === 1) {
      ctx.fillStyle = '#6E5D46'; // Dark adhesive/core layer
      ctx.fillRect(0, i * layerHeight, width, layerHeight + 0.5);

      // Add horizontal fiber noise
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let j = 0; j < 5; j++) {
        const x = Math.random() * width;
        const w = Math.random() * (width / 2);
        ctx.fillRect(x, i * layerHeight + Math.random() * layerHeight, w, 1);
      }
    } else {
      // Add light fiber noise
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let j = 0; j < 5; j++) {
        const x = Math.random() * width;
        const w = Math.random() * (width / 2);
        ctx.fillRect(x, i * layerHeight + Math.random() * layerHeight, w, 1);
      }
    }
  }
}

// Draw procedural woodgrain with rings and noise
export function drawWoodgrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseColor = '#D4A017',
  grainColor = '#6E5D46'
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Growth rings
  ctx.strokeStyle = grainColor;
  ctx.lineWidth = 1;
  
  const centerX = width / 2 + (Math.random() - 0.5) * width * 2;
  const centerY = -height * 0.5;

  // Draw concentric ellipses to simulate grain lines
  for (let r = 20; r < Math.max(width, height) * 3; r += 8 + Math.random() * 6) {
    ctx.beginPath();
    ctx.globalAlpha = 0.08 + Math.random() * 0.08;
    ctx.ellipse(centerX, centerY, r, r * 1.8, Math.PI / 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // Add fine wood fiber noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 6;
    data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
  }
  ctx.putImageData(imgData, 0, 0);
}

// Draw matte laminate texture with fine stipple texture
export function drawLaminate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color = '#F5B800'
) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Add a very subtle stipple effect for matte texture
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < width * height * 0.05; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let i = 0; i < width * height * 0.05; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1, 1);
  }
}
