'use client';

import { useMemo } from 'react';

export type DeviceCapability = 'high' | 'mid' | 'low';

/**
 * Heuristic device capability detection for the 3D Hero.
 *
 * Tiers:
 *   high — Desktop / high-power: full PBR + postprocessing pipeline
 *   mid  — Tablet / mid-power: PBR textures, no postprocessing
 *   low  — Mobile / low-power: static image fallback
 *
 * Heuristic factors:
 *   1. Viewport width  (proxy for form factor)
 *   2. navigator.hardwareConcurrency  (CPU core count)
 *   3. WebGL2 feature support  (GPU capability proxy)
 *   4. prefers-reduced-motion  (accessibility override)
 */
export function useDeviceCapability(): DeviceCapability {
  return useMemo<DeviceCapability>(() => {
    if (typeof window === 'undefined') return 'low'; // SSR

    // Accessibility: always use low-motion / static presentation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'low';
    }

    const w = window.innerWidth;
    const cores = navigator.hardwareConcurrency ?? 2;

    // WebGL2 check — fast, one-time canvas probe
    let hasWebGL2 = false;
    try {
      const probe = document.createElement('canvas');
      hasWebGL2 = !!probe.getContext('webgl2');
    } catch {
      hasWebGL2 = false;
    }

    // High tier: wide screen, quad-core+ CPU, WebGL2
    if (w >= 1024 && cores >= 4 && hasWebGL2) return 'high';

    // Mid tier: tablet-size or capable but not top-end
    if (w >= 768 && hasWebGL2) return 'mid';

    // Low tier: small screen, no WebGL2, or low CPU
    return 'low';
  }, []); // Computed once on mount
}
