/**
 * Procedural texture utilities for drawing woodgrain, laminate, and layered plywood edge textures onto canvas elements,
 * including normal map generation for realistic depth and stipple lighting responses.
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

// Convert a grayscale heightmap canvas into a normal map canvas
export function createNormalMap(heightCanvas: HTMLCanvasElement, strength = 1.5): HTMLCanvasElement {
  const width = heightCanvas.width;
  const height = heightCanvas.height;
  
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = width;
  normalCanvas.height = height;
  
  const hCtx = heightCanvas.getContext('2d');
  const nCtx = normalCanvas.getContext('2d');
  
  if (!hCtx || !nCtx) return normalCanvas;
  
  const imgData = hCtx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  
  const normalImgData = nCtx.createImageData(width, height);
  const normalPixels = normalImgData.data;
  
  // Sobel-like filter for height delta gradients
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Sample adjacent pixel heights (using Red channel as grayscale height proxy)
      const xLeft  = (x > 0) ? pixels[(y * width + (x - 1)) * 4] : pixels[idx];
      const xRight = (x < width - 1) ? pixels[(y * width + (x + 1)) * 4] : pixels[idx];
      const yUp    = (y > 0) ? pixels[((y - 1) * width + x) * 4] : pixels[idx];
      const yDown  = (y < height - 1) ? pixels[((y + 1) * width + x) * 4] : pixels[idx];
      
      // Calculate gradients
      const dx = (xRight - xLeft) / 255.0 * strength;
      const dy = (yDown - yUp) / 255.0 * strength;
      const dz = 1.0 / strength;
      
      // Normalize vector
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;
      
      // Map [-1, 1] range to [0, 255] color byte range
      normalPixels[idx]     = Math.floor((nx * 0.5 + 0.5) * 255); // R -> X normal
      normalPixels[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // G -> Y normal
      normalPixels[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255); // B -> Z normal
      normalPixels[idx + 3] = 255;                                // Alpha
    }
  }
  
  nCtx.putImageData(normalImgData, 0, 0);
  return normalCanvas;
}

// Draw alternating light and dark veneers for a plywood edge
export function drawPlywoodEdge(ctx: CanvasRenderingContext2D, width: number, height: number, drawHeightmap = false) {
  const layers = 17; // Alternating ply stripes
  const layerHeight = height / layers;

  if (drawHeightmap) {
    ctx.fillStyle = '#808080'; // Neutral mid-height
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#C9C2B4'; // Base light wood color
    ctx.fillRect(0, 0, width, height);
  }

  for (let i = 0; i < layers; i++) {
    if (i % 2 === 1) {
      // Dark glue/core stripe
      ctx.fillStyle = drawHeightmap ? '#404040' : '#6E5D46';
      ctx.fillRect(0, i * layerHeight, width, layerHeight + 0.5);

      // Edge fiber noise
      ctx.fillStyle = drawHeightmap ? '#202020' : 'rgba(0,0,0,0.12)';
      for (let j = 0; j < 6; j++) {
        const x = Math.random() * width;
        const w = Math.random() * (width / 2);
        ctx.fillRect(x, i * layerHeight + Math.random() * layerHeight, w, 1.2);
      }
    } else {
      // Light grain stripe
      ctx.fillStyle = drawHeightmap ? '#A0A0A0' : 'rgba(255,255,255,0.15)';
      for (let j = 0; j < 6; j++) {
        const x = Math.random() * width;
        const w = Math.random() * (width / 2);
        ctx.fillRect(x, i * layerHeight + Math.random() * layerHeight, w, 1.2);
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
  grainColor = '#6E5D46',
  drawHeightmap = false
) {
  if (drawHeightmap) {
    ctx.fillStyle = '#808080'; // Base level
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Growth rings
  ctx.strokeStyle = drawHeightmap ? '#303030' : grainColor;
  ctx.lineWidth = 1.5;
  
  const centerX = width / 2 + (Math.random() - 0.5) * width * 1.5;
  const centerY = -height * 0.3;

  for (let r = 30; r < Math.max(width, height) * 3; r += 10 + Math.random() * 8) {
    ctx.beginPath();
    ctx.globalAlpha = drawHeightmap ? 0.35 : 0.08 + Math.random() * 0.10;
    ctx.ellipse(centerX, centerY, r, r * 1.6, Math.PI / 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // Add fine wood fiber noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * (drawHeightmap ? 15 : 6);
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}

// Draw matte laminate texture with fine stipple texture
export function drawLaminate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color = '#F5B800',
  drawHeightmap = false
) {
  if (drawHeightmap) {
    ctx.fillStyle = '#808080'; // Base height
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw stipple stexture dots for physical grip feel
  ctx.fillStyle = drawHeightmap ? '#A0A0A0' : 'rgba(255,255,255,0.06)';
  for (let i = 0; i < width * height * 0.06; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.fillStyle = drawHeightmap ? '#606060' : 'rgba(0,0,0,0.06)';
  for (let i = 0; i < width * height * 0.06; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1, 1);
  }
}
