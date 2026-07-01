'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { VisualizerScene, VisualizerZone, Finish } from '@/types/visualizer';

interface Props {
  scene: VisualizerScene;
  selections: Record<string, Finish>;
  activeZone: string | null;
  hoveredZone: string | null;
  onZoneClick: (zoneId: string) => void;
  onZoneHover: (zoneId: string | null) => void;
}

// ─── Custom GLSL Shader for the Material Overlays ──────────────────────────────
const VertexShader = `
  varying vec2 vPhotoUV;
  varying vec2 vFinishUV;
  attribute vec2 aPhotoUV;
  uniform vec2 uRepeat;

  void main() {
    vPhotoUV = aPhotoUV;
    vFinishUV = uv * uRepeat;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FragmentShader = `
  varying vec2 vPhotoUV;
  varying vec2 vFinishUV;

  uniform sampler2D uPhotoTex;
  uniform sampler2D uMaskTex;
  uniform sampler2D uShadingTex;
  uniform sampler2D uFinishTexOld;
  uniform sampler2D uFinishTexNew;

  uniform bool uHasMask;
  uniform bool uHasShading;
  uniform float uBlend;
  uniform vec3 uFallbackColorOld;
  uniform vec3 uFallbackColorNew;
  uniform bool uUseColorOld;
  uniform bool uUseColorNew;

  uniform float uOverlayOpacity;
  uniform bool uIsActive;
  uniform bool uIsHovered;
  uniform int uMaterialType; // 0=matte, 1=gloss, 2=satin, 3=wood, 4=stone

  void main() {
    // ── 1. Mask Check ──
    float maskAlpha = 1.0;
    if (uHasMask) {
      vec4 maskVal = texture2D(uMaskTex, vPhotoUV);
      maskAlpha = maskVal.a;
    }
    if (maskAlpha < 0.01) {
      discard;
    }

    // ── 2. Finish Color Mix (Cross-fade) ──
    vec4 colOld = uUseColorOld ? vec4(uFallbackColorOld, 1.0) : texture2D(uFinishTexOld, vFinishUV);
    vec4 colNew = uUseColorNew ? vec4(uFallbackColorNew, 1.0) : texture2D(uFinishTexNew, vFinishUV);
    vec4 finishCol = mix(colOld, colNew, uBlend);

    // ── 3. Shading / Luminance Extraction ──
    float shadowMult = 1.0;
    if (uHasShading) {
      vec4 shadingVal = texture2D(uShadingTex, vPhotoUV);
      shadowMult = shadingVal.r;
    } else {
      // Procedural fallback: read background photo luma
      vec4 photoVal = texture2D(uPhotoTex, vPhotoUV);
      float luma = 0.299 * photoVal.r + 0.587 * photoVal.g + 0.114 * photoVal.b;
      // Remap luma from 0-1 to 0.4-1.3 range for natural lighting multiplication
      shadowMult = mix(0.4, 1.3, luma);
    }

    // Blend finish onto surface with shadows
    vec3 finalRGB = finishCol.rgb * shadowMult;

    // ── 4. Gloss Specular Fake Highlights ──
    if (uMaterialType == 1) { // Gloss
      // Compute a soft diagonal specular glare based on coordinate offset
      float spec = smoothstep(0.4, 0.45, sin(vPhotoUV.x * 6.0 + vPhotoUV.y * 3.0));
      finalRGB += vec3(spec * 0.15);
    } else if (uMaterialType == 2) { // Satin
      float spec = smoothstep(0.4, 0.5, sin(vPhotoUV.x * 4.0 + vPhotoUV.y * 2.0));
      finalRGB += vec3(spec * 0.07);
    }

    // ── 5. Hover and Active Selection Glow Overlay ──
    if (uIsActive) {
      // Luminous gold highlight overlay
      finalRGB = mix(finalRGB, vec3(0.96, 0.72, 0.0), 0.15);
    } else if (uIsHovered) {
      // Pure white soft hover tint
      finalRGB = mix(finalRGB, vec3(1.0, 1.0, 1.0), 0.08);
    }

    gl_FragColor = vec4(finalRGB, maskAlpha * uOverlayOpacity);
  }
`;

export default function VisualizerCanvas({
  scene,
  selections,
  activeZone,
  hoveredZone,
  onZoneClick,
  onZoneHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  // Core ThreeJS References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);

  // Mesh and Material cache
  const zoneMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const texturesCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const backgroundMeshRef = useRef<THREE.Mesh | null>(null);

  // Animation Blends
  const blendStatesRef = useRef<
    Record<
      string,
      {
        startTime: number;
        oldFinish: Finish;
        newFinish: Finish;
        progress: number;
      }
    >
  >({});

  // Background and Shading textures
  const photoTextureRef = useRef<THREE.Texture | null>(null);

  // Helper to load and cache textures
  const loadTexture = (url: string, repeat = new THREE.Vector2(1, 1)): THREE.Texture => {
    if (!url) {
      // Fallback 1x1 white texture
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1, 1);
      }
      const t = new THREE.CanvasTexture(canvas);
      return t;
    }

    const cached = texturesCacheRef.current.get(url);
    if (cached) return cached;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.copy(repeat);
    texture.colorSpace = THREE.SRGBColorSpace;

    texturesCacheRef.current.set(url, texture);
    return texture;
  };

  // Check WebGL Support on mount
  useEffect(() => {
    try {
      const probe = document.createElement('canvas');
      const support = !!(probe.getContext('webgl') || probe.getContext('webgl2'));
      setWebglSupported(support);
      if (!support) setLoading(false);
    } catch {
      setWebglSupported(false);
      setLoading(false);
    }
  }, []);

  // Initialize ThreeJS Scene
  useEffect(() => {
    if (!webglSupported || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Create Scene
    const threeScene = new THREE.Scene();
    threeSceneRef.current = threeScene;

    // Create Camera (Centered Orthographic)
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Setup room photo texture
    const texLoader = new THREE.TextureLoader();
    const photoTexture = texLoader.load(scene.roomImage, () => {
      setLoading(false);
      // Re-trigger layout calculations once background texture is loaded
      triggerResize();
    });
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    photoTextureRef.current = photoTexture;

    // Background Room Photo Mesh
    const bgGeo = new THREE.PlaneGeometry(width, height);
    const bgMat = new THREE.MeshBasicMaterial({ map: photoTexture });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.z = 0; // Behind everything
    threeScene.add(bgMesh);
    backgroundMeshRef.current = bgMesh;

    // Build Zone Meshes
    // Sorted by displayOrder so they compile and overlap in correct order
    const sortedZones = [...scene.zones].sort((a, b) => a.displayOrder - b.displayOrder);

    sortedZones.forEach((zone) => {
      // 1. Load specific mask texture if present
      let maskTex: THREE.Texture | null = null;
      if (zone.mask) {
        maskTex = texLoader.load(zone.mask);
      }

      // 2. Load shading layer texture if present
      let shadingTex: THREE.Texture | null = null;
      if (zone.shadingLayer) {
        shadingTex = texLoader.load(zone.shadingLayer);
      }

      // 3. Create placeholder geometries/materials for now.
      // Geometry coordinates are scaled inside the ResizeObserver logic dynamically.
      const geom = new THREE.BufferGeometry();
      const initialFinish = selections[zone.id] || zone.defaultFinish;

      // Determine material type integer (0=matte, 1=gloss, 2=satin, 3=wood, 4=stone)
      let typeInt = 0;
      if (initialFinish.materialType === 'gloss') typeInt = 1;
      else if (initialFinish.materialType === 'satin') typeInt = 2;
      else if (initialFinish.materialType === 'wood') typeInt = 3;
      else if (initialFinish.materialType === 'stone') typeInt = 4;

      const finishTex = initialFinish.tileableTexture
        ? loadTexture(initialFinish.tileableTexture)
        : null;

      const mat = new THREE.ShaderMaterial({
        vertexShader: VertexShader,
        fragmentShader: FragmentShader,
        transparent: true,
        uniforms: {
          uPhotoTex: { value: photoTexture },
          uMaskTex: { value: maskTex },
          uShadingTex: { value: shadingTex },
          uFinishTexOld: { value: finishTex },
          uFinishTexNew: { value: finishTex },
          uHasMask: { value: !!maskTex },
          uHasShading: { value: !!shadingTex },
          uBlend: { value: 1.0 }, // Finished blend initially
          uFallbackColorOld: { value: new THREE.Color(initialFinish.color || '#ffffff') },
          uFallbackColorNew: { value: new THREE.Color(initialFinish.color || '#ffffff') },
          uUseColorOld: { value: !initialFinish.tileableTexture },
          uUseColorNew: { value: !initialFinish.tileableTexture },
          uRepeat: { value: new THREE.Vector2(2, 2) },
          uOverlayOpacity: { value: scene.overlaySettings.opacity },
          uIsActive: { value: false },
          uIsHovered: { value: false },
          uMaterialType: { value: typeInt },
        },
      });

      const mesh = new THREE.Mesh(geom, mat);
      // Give a tiny offset to Z-index based on display order to avoid Z-fighting
      mesh.position.z = 0.1 + zone.displayOrder * 0.05;

      threeScene.add(mesh);
      zoneMeshesRef.current.set(zone.id, mesh);
    });

    // Start Rendering Loop
    let animId = 0;
    const animate = (nowTime: number) => {
      // ── Process ongoing texture cross-fades ──
      Object.keys(blendStatesRef.current).forEach((zoneId) => {
        const state = blendStatesRef.current[zoneId];
        const elapsed = nowTime - state.startTime;
        const progress = Math.min(elapsed / 250, 1.0); // 250ms blend
        state.progress = progress;

        const mesh = zoneMeshesRef.current.get(zoneId);
        if (mesh) {
          const mat = mesh.material as THREE.ShaderMaterial;
          mat.uniforms.uBlend.value = progress;
        }

        if (progress >= 1.0) {
          // Finished cross-fade, cleanup old state
          delete blendStatesRef.current[zoneId];
        }
      });

      renderer.render(threeScene, camera);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    // Setup Layout resize detection
    const resizeObserver = new ResizeObserver(() => {
      triggerResize();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      bgGeo.dispose();
      bgMat.dispose();

      zoneMeshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.ShaderMaterial).dispose();
      });
      zoneMeshesRef.current.clear();
      texturesCacheRef.current.forEach((t) => t.dispose());
      texturesCacheRef.current.clear();
    };
  }, [webglSupported, scene]);

  // Handle Resize and Geometry Scale/Reposition
  const triggerResize = () => {
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const bgMesh = backgroundMeshRef.current;

    if (!container || !renderer || !camera || !bgMesh) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    renderer.setSize(W, H);

    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();

    // Scale background photo to perfectly stretch/fit container
    bgMesh.geometry.dispose();
    bgMesh.geometry = new THREE.PlaneGeometry(W, H);

    // Rescale geometries of each zone quad
    scene.zones.forEach((zone) => {
      const mesh = zoneMeshesRef.current.get(zone.id);
      if (!mesh) return;

      mesh.geometry.dispose();

      // Convert coordinates from Natural image space to World Space (Centered on canvas)
      const scaleX = W / scene.naturalWidth;
      const scaleY = H / scene.naturalHeight;

      const worldCorners = zone.corners.map(([px, py]) => {
        const wx = px * scaleX - W / 2;
        const wy = H / 2 - py * scaleY;
        return new THREE.Vector3(wx, wy, 0);
      });

      // Vertices: [TL, TR, BR, BL]
      const [tl, tr, br, bl] = worldCorners;

      // 4 vertices (3 floats each)
      const vertices = new Float32Array([
        tl.x, tl.y, 0, // TL
        tr.x, tr.y, 0, // TR
        br.x, br.y, 0, // BR
        bl.x, bl.y, 0, // BL
      ]);

      // UV mapping mapping flat square swatch to quad coordinates
      const uvs = new Float32Array([
        0, 1, // TL
        1, 1, // TR
        1, 0, // BR
        0, 0, // BL
      ]);

      // Photo Normalized Coordinate UVs for Mask and Luma sampler mapping
      const photoUVs = new Float32Array([
        zone.corners[0][0] / scene.naturalWidth, 1.0 - zone.corners[0][1] / scene.naturalHeight, // TL
        zone.corners[1][0] / scene.naturalWidth, 1.0 - zone.corners[1][1] / scene.naturalHeight, // TR
        zone.corners[2][0] / scene.naturalWidth, 1.0 - zone.corners[2][1] / scene.naturalHeight, // BR
        zone.corners[3][0] / scene.naturalWidth, 1.0 - zone.corners[3][1] / scene.naturalHeight, // BL
      ]);

      // Triangles CCW: TL->BR->BL (Triangle 1) and TL->TR->BR (Triangle 2)
      const indices = new Uint16Array([
        0, 2, 3, // TL, BR, BL
        0, 1, 2, // TL, TR, BR
      ]);

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geom.setAttribute('aPhotoUV', new THREE.BufferAttribute(photoUVs, 2));
      geom.setIndex(new THREE.BufferAttribute(indices, 1));

      mesh.geometry = geom;
    });
  };

  // Sync active states and material properties to uniforms on change
  useEffect(() => {
    scene.zones.forEach((zone) => {
      const mesh = zoneMeshesRef.current.get(zone.id);
      if (!mesh) return;

      const mat = mesh.material as THREE.ShaderMaterial;
      const isSelected = activeZone === zone.id;
      const isHovered = hoveredZone === zone.id;

      mat.uniforms.uIsActive.value = isSelected;
      mat.uniforms.uIsHovered.value = isHovered;
    });
  }, [activeZone, hoveredZone, scene]);

  // Handle Texture Transitions & Tiling on finish selection updates
  useEffect(() => {
    if (loading) return;

    scene.zones.forEach((zone) => {
      const mesh = zoneMeshesRef.current.get(zone.id);
      if (!mesh) return;

      const mat = mesh.material as THREE.ShaderMaterial;
      const finish = selections[zone.id] || zone.defaultFinish;

      // Determine material type int
      let typeInt = 0;
      if (finish.materialType === 'gloss') typeInt = 1;
      else if (finish.materialType === 'satin') typeInt = 2;
      else if (finish.materialType === 'wood') typeInt = 3;
      else if (finish.materialType === 'stone') typeInt = 4;
      mat.uniforms.uMaterialType.value = typeInt;

      // Compute physical-scale tiling repeat values
      const repeatX = (zone.widthCm || 200) / (finish.tileWidthCm || 60);
      const repeatY = (zone.heightCm || 120) / (finish.tileHeightCm || 60);
      mat.uniforms.uRepeat.value.set(repeatX, repeatY);

      // Check if finish changed to trigger transition
      const activeNewTexUrl = finish.tileableTexture || '';
      const oldTexVal = mat.uniforms.uFinishTexNew.value as THREE.Texture | null;
      const oldColor = mat.uniforms.uFallbackColorNew.value as THREE.Color;

      const finishTextureNew = activeNewTexUrl ? loadTexture(activeNewTexUrl) : null;

      // Check if actually different
      const currentTextureUrl = (oldTexVal?.image as any)?.src || '';
      const isDifferent =
        activeNewTexUrl !== currentTextureUrl ||
        (finish.color !== undefined && '#' + oldColor.getHexString() !== finish.color.toLowerCase());

      if (isDifferent) {
        // Start cross-fade transition
        mat.uniforms.uFinishTexOld.value = oldTexVal;
        mat.uniforms.uFallbackColorOld.value.copy(oldColor);
        mat.uniforms.uUseColorOld.value = mat.uniforms.uUseColorNew.value;

        // Set new values
        mat.uniforms.uFinishTexNew.value = finishTextureNew;
        if (finish.color) {
          mat.uniforms.uFallbackColorNew.value.set(finish.color);
        }
        mat.uniforms.uUseColorNew.value = !finish.tileableTexture;

        // Reset blend uniform
        mat.uniforms.uBlend.value = 0.0;

        blendStatesRef.current[zone.id] = {
          startTime: performance.now(),
          oldFinish: selections[zone.id], // Approximate tracker
          newFinish: finish,
          progress: 0.0,
        };
      }
    });
  }, [selections, loading, scene]);

  // Click direct-to-photo coordinates hit testing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert DOM click to natural image space coordinate
    const photoX = (clientX * scene.naturalWidth) / rect.width;
    const photoY = (clientY * scene.naturalHeight) / rect.height;

    // Sort zones by display order descending (test topmost visual elements first)
    const sortedZones = [...scene.zones].sort((a, b) => b.displayOrder - a.displayOrder);

    for (const zone of sortedZones) {
      if (isPointInPolygon([photoX, photoY], zone.corners)) {
        onZoneClick(zone.id);
        return;
      }
    }
  };

  // Hover direct-to-photo coordinates hit testing
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const photoX = (clientX * scene.naturalWidth) / rect.width;
    const photoY = (clientY * scene.naturalHeight) / rect.height;

    const sortedZones = [...scene.zones].sort((a, b) => b.displayOrder - a.displayOrder);

    let found: string | null = null;
    for (const zone of sortedZones) {
      if (isPointInPolygon([photoX, photoY], zone.corners)) {
        found = zone.id;
        break;
      }
    }

    onZoneHover(found);
    canvas.style.cursor = found ? 'pointer' : 'default';
  };

  const handleCanvasMouseLeave = () => {
    onZoneHover(null);
  };

  // Raycast/geometry polygon collision containment algorithm (Raycasting method)
  const isPointInPolygon = (point: [number, number], corners: [number, number][]) => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
      const xi = corners[i][0],
        yi = corners[i][1];
      const xj = corners[j][0],
        yj = corners[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  if (!webglSupported) {
    return (
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-ink border border-line text-stone p-8 text-center">
        <div className="max-w-md space-y-4">
          <p className="font-display font-medium text-parchment text-lg">
            Interactive visualiser requires WebGL.
          </p>
          <p className="text-sm text-stone-dim">
            It looks like your browser or device doesn't support WebGL. Please use a modern browser or request physical swatches below.
          </p>
          <a
            href="/contact"
            className="inline-block bg-ember text-ember-text font-mono text-xs tracking-widest uppercase px-6 py-3 hover:bg-ember-light transition-all"
          >
            Request Swatch Samples
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0D0B09] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink z-50 transition-opacity duration-300">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-ember border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-mono text-stone-dim tracking-widest uppercase">
              Rendering WebGL Visualizer...
            </p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className="w-full h-full block"
      />
    </div>
  );
}
