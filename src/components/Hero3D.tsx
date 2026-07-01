'use client';

import React, {
  useRef,
  useState,
  useEffect,
  Suspense,
  useMemo,
} from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  useTexture,
  PerspectiveCamera,
} from '@react-three/drei';
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Noise,
  Vignette,
  BrightnessContrast,
  HueSaturation,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import * as THREE from 'three';
import { useDeviceCapability } from '@/lib/useDeviceCapability';

// ─── Constants ────────────────────────────────────────────────────────────────
const POLYHAVEN = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k';
const POLYHAVEN_HDR = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k';

// Confirmed PolyHaven CC0 PBR texture map URLs (1K JPG)
const TEX = {
  // Birch Plywood — photoscanned birch ply face grain
  plywood: {
    map:          `${POLYHAVEN}/plywood/plywood_diff_1k.jpg`,
    normalMap:    `${POLYHAVEN}/plywood/plywood_nor_gl_1k.jpg`,
    roughnessMap: `${POLYHAVEN}/plywood/plywood_rough_1k.jpg`,
    aoMap:        `${POLYHAVEN}/plywood/plywood_ao_1k.jpg`,
  },
  // Oak Veneer — fine straight grain, warm natural tones
  veneer: {
    map:          `${POLYHAVEN}/oak_veneer_01/oak_veneer_01_diff_1k.jpg`,
    normalMap:    `${POLYHAVEN}/oak_veneer_01/oak_veneer_01_nor_gl_1k.jpg`,
    roughnessMap: `${POLYHAVEN}/oak_veneer_01/oak_veneer_01_rough_1k.jpg`,
    aoMap:        `${POLYHAVEN}/oak_veneer_01/oak_veneer_01_ao_1k.jpg`,
  },
  // Dark Walnut — cherry/mahogany hardwood (ply edge standIn)
  walnut: {
    map:          `${POLYHAVEN}/dark_wood/dark_wood_diff_1k.jpg`,
    normalMap:    `${POLYHAVEN}/dark_wood/dark_wood_nor_gl_1k.jpg`,
    roughnessMap: `${POLYHAVEN}/dark_wood/dark_wood_rough_1k.jpg`,
    aoMap:        `${POLYHAVEN}/dark_wood/dark_wood_ao_1k.jpg`,
  },
  // Laminate surface — smooth, slightly glossy (tinted Sitka Yellow)
  laminate: {
    map:          `${POLYHAVEN}/laminate_floor_02/laminate_floor_02_diff_1k.jpg`,
    normalMap:    `${POLYHAVEN}/laminate_floor_02/laminate_floor_02_nor_gl_1k.jpg`,
    roughnessMap: `${POLYHAVEN}/laminate_floor_02/laminate_floor_02_rough_1k.jpg`,
    aoMap:        `${POLYHAVEN}/laminate_floor_02/laminate_floor_02_ao_1k.jpg`,
  },
} as const;

// HDRI environment — single-source studio softbox (neutral, controlled)
const HDRI_URL = `${POLYHAVEN_HDR}/studio_small_09_1k.hdr`;

// ─── Easing ───────────────────────────────────────────────────────────────────
const easeOut3 = (t: number) => 1 - Math.pow(1 - Math.min(t, 1), 3);
const lerp = THREE.MathUtils.lerp;

// ─── Texture setup helper ─────────────────────────────────────────────────────
function setupTexture(
  tex: THREE.Texture,
  repeat = new THREE.Vector2(1, 1),
  isColor = false
) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.copy(repeat);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ─── Panel A — Dominant Plywood Sheet ────────────────────────────────────────
function PlywoodPanel() {
  const maps = useTexture(TEX.plywood);

  useMemo(() => {
    // Face grain repeats 1.5× for better wood grain density
    setupTexture(maps.map, new THREE.Vector2(1.5, 1.5), true);
    setupTexture(maps.normalMap, new THREE.Vector2(1.5, 1.5));
    setupTexture(maps.roughnessMap, new THREE.Vector2(1.5, 1.5));
    setupTexture(maps.aoMap, new THREE.Vector2(1.5, 1.5));
  }, [maps]);

  // Per-face materials: front/back = birch plywood face, edges = side grain
  const faceMat = (
    <meshPhysicalMaterial
      map={maps.map}
      normalMap={maps.normalMap}
      normalScale={new THREE.Vector2(1.2, 1.2)}
      roughnessMap={maps.roughnessMap}
      aoMap={maps.aoMap}
      aoMapIntensity={0.8}
      roughness={0.72}
      metalness={0.0}
      clearcoat={0.12}
      clearcoatRoughness={0.35}
    />
  );

  return (
    <mesh
      position={[0.7, 0.0, 0.0]}
      rotation={[0.03, -0.18, 0.02]}
      castShadow
      receiveShadow
    >
      {/* Width=3.2, Height=4.0, Depth=0.12 — large dominant panel */}
      <boxGeometry args={[3.2, 4.0, 0.12]} />
      {/* Left */}
      <meshPhysicalMaterial attach="material-0" {...(maps as object)} roughness={0.85} metalness={0} />
      {/* Right */}
      <meshPhysicalMaterial attach="material-1" {...(maps as object)} roughness={0.85} metalness={0} />
      {/* Top */}
      <meshPhysicalMaterial attach="material-2" {...(maps as object)} roughness={0.85} metalness={0} />
      {/* Bottom */}
      <meshPhysicalMaterial attach="material-3" {...(maps as object)} roughness={0.85} metalness={0} />
      {/* Front face */}
      <meshPhysicalMaterial
        attach="material-4"
        map={maps.map}
        normalMap={maps.normalMap}
        normalScale={new THREE.Vector2(1.2, 1.2)}
        roughnessMap={maps.roughnessMap}
        aoMap={maps.aoMap}
        aoMapIntensity={0.8}
        roughness={0.72}
        metalness={0.0}
        clearcoat={0.12}
        clearcoatRoughness={0.35}
      />
      {/* Back face */}
      <meshPhysicalMaterial
        attach="material-5"
        map={maps.map}
        normalMap={maps.normalMap}
        normalScale={new THREE.Vector2(1.2, 1.2)}
        roughnessMap={maps.roughnessMap}
        aoMap={maps.aoMap}
        aoMapIntensity={0.8}
        roughness={0.72}
        metalness={0.0}
        clearcoat={0.12}
        clearcoatRoughness={0.35}
      />
    </mesh>
  );
}

// ─── Panel B — Laminate Accent with Clearcoat Specular ────────────────────────
function LaminatePanel() {
  const maps = useTexture(TEX.laminate);

  useMemo(() => {
    setupTexture(maps.map, new THREE.Vector2(2, 2), true);
    setupTexture(maps.normalMap, new THREE.Vector2(2, 2));
    setupTexture(maps.roughnessMap, new THREE.Vector2(2, 2));
    setupTexture(maps.aoMap, new THREE.Vector2(2, 2));
  }, [maps]);

  return (
    <mesh
      position={[-1.5, -0.25, 0.55]}
      rotation={[0.02, 0.22, -0.03]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1.8, 3.2, 0.06]} />
      {/* Edges — dark */}
      {[0, 1, 2, 3].map((i) => (
        <meshPhysicalMaterial
          key={i}
          attach={`material-${i}`}
          color="#1A1409"
          roughness={0.6}
          metalness={0.0}
        />
      ))}
      {/* Front face — matte laminate with Sitka Yellow color tint + glossy clearcoat */}
      <meshPhysicalMaterial
        attach="material-4"
        map={maps.map}
        normalMap={maps.normalMap}
        normalScale={new THREE.Vector2(0.4, 0.4)}
        roughnessMap={maps.roughnessMap}
        aoMap={maps.aoMap}
        color="#F5B800"
        roughness={0.08}
        metalness={0.0}
        clearcoat={0.95}
        clearcoatRoughness={0.04}
        envMapIntensity={1.8}
      />
      {/* Back face */}
      <meshPhysicalMaterial
        attach="material-5"
        color="#C68A00"
        roughness={0.55}
        metalness={0.0}
      />
    </mesh>
  );
}

// ─── Panel C — Oak Veneer Depth Element ──────────────────────────────────────
function VeneerPanel() {
  const maps = useTexture(TEX.veneer);

  useMemo(() => {
    setupTexture(maps.map, new THREE.Vector2(1.2, 1.8), true);
    setupTexture(maps.normalMap, new THREE.Vector2(1.2, 1.8));
    setupTexture(maps.roughnessMap, new THREE.Vector2(1.2, 1.8));
    setupTexture(maps.aoMap, new THREE.Vector2(1.2, 1.8));
  }, [maps]);

  return (
    <mesh
      position={[1.9, 0.18, -0.65]}
      rotation={[0.0, -0.28, 0.01]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[2.4, 3.6, 0.08]} />
      {[0, 1, 2, 3].map((i) => (
        <meshPhysicalMaterial
          key={i}
          attach={`material-${i}`}
          color="#3A2B1E"
          roughness={0.78}
          metalness={0.0}
        />
      ))}
      <meshPhysicalMaterial
        attach="material-4"
        map={maps.map}
        normalMap={maps.normalMap}
        normalScale={new THREE.Vector2(0.9, 0.9)}
        roughnessMap={maps.roughnessMap}
        aoMap={maps.aoMap}
        aoMapIntensity={0.7}
        roughness={0.58}
        metalness={0.0}
        clearcoat={0.18}
        clearcoatRoughness={0.22}
      />
      <meshPhysicalMaterial
        attach="material-5"
        map={maps.map}
        normalMap={maps.normalMap}
        normalScale={new THREE.Vector2(0.9, 0.9)}
        roughnessMap={maps.roughnessMap}
        roughness={0.65}
        metalness={0.0}
      />
    </mesh>
  );
}

// ─── Post-Processing Effects (full pipeline) ──────────────────────────────────
function PostFX({ reducedMotion }: { reducedMotion: boolean }) {
  const dofRef = useRef<{ focusDistance: number; bokehScale: number }>({
    focusDistance: reducedMotion ? 0.018 : 0.0,
    bokehScale: reducedMotion ? 2.2 : 8.0,
  });

  // Rack-focus animation: 0 → 1.8s
  const [dofState, setDofState] = useState({
    focusDistance: reducedMotion ? 0.018 : 0.0,
    bokehScale: reducedMotion ? 2.2 : 8.0,
  });

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    const p = easeOut3(Math.min(t / 1.8, 1));
    const fd = lerp(0.0, 0.018, p);
    const bs = lerp(8.0, 2.2, p);

    // Only trigger React re-render every ~8 frames (smooth enough for DOF)
    if (
      Math.abs(fd - dofRef.current.focusDistance) > 0.0003 ||
      Math.abs(bs - dofRef.current.bokehScale) > 0.05
    ) {
      dofRef.current.focusDistance = fd;
      dofRef.current.bokehScale = bs;
      setDofState({ focusDistance: fd, bokehScale: bs });
    }
  });

  return (
    <EffectComposer multisampling={4}>
      {/* 1. Depth of Field — rack-focus from macro-close to sharp */}
      <DepthOfField
        focusDistance={dofState.focusDistance}
        focalLength={0.022}
        bokehScale={dofState.bokehScale}
        height={480}
      />

      {/* 2. Bloom — only catches the yellow rim specular highlight (high threshold) */}
      <Bloom
        luminanceThreshold={0.72}
        luminanceSmoothing={0.2}
        intensity={0.38}
        kernelSize={KernelSize.MEDIUM}
        blendFunction={BlendFunction.SCREEN}
      />

      {/* 3. Film grain — subtle, subtracts from the CG-render read */}
      <Noise
        opacity={0.022}
        blendFunction={BlendFunction.OVERLAY}
      />

      {/* 4. Cinematic vignette */}
      <Vignette
        offset={0.14}
        darkness={0.52}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 5. Colour grade — warm shadows toward brand ink, slight contrast lift */}
      <HueSaturation
        saturation={0.08}
        blendFunction={BlendFunction.NORMAL}
      />
      <BrightnessContrast
        brightness={0.02}
        contrast={0.06}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

// ─── Scene Controller — Camera, Parallax, Lighting ───────────────────────────
function SceneController({ reducedMotion }: { reducedMotion: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const rimLightRef = useRef<THREE.SpotLight>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reducedMotion]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cam = state.camera;

    if (!reducedMotion) {
      // Phase 1 — Camera pull-back (0 → 2.5s)
      if (t < 2.5) {
        const p = easeOut3(Math.min(t / 2.0, 1));
        cam.position.z = lerp(2.2, 5.6, p);
        cam.position.x = lerp(0, 0, 1); // Stays centered during pull-back
      } else {
        // Phase 2 — Mouse parallax (very subtle, "photograph sway")
        cam.position.x = lerp(cam.position.x, mouse.current.x * 0.55, 0.045);
        cam.position.y = lerp(cam.position.y, -mouse.current.y * 0.4, 0.045);
        cam.position.z = lerp(cam.position.z, 5.6, 0.06);
      }
      cam.lookAt(0.4, 0, 0); // Look slightly right toward panels

      // Slow idle drift — panels breathe gently
      if (groupRef.current && t > 2.5) {
        groupRef.current.rotation.y =
          lerp(groupRef.current.rotation.y, Math.sin(t * 0.12) * 0.022, 0.03);
        groupRef.current.rotation.x =
          lerp(groupRef.current.rotation.x, Math.sin(t * 0.09) * 0.012, 0.03);
      }

      // Rim light tracks mouse gently
      if (rimLightRef.current) {
        rimLightRef.current.position.x = lerp(
          rimLightRef.current.position.x,
          4 + mouse.current.x * 1.5,
          0.04
        );
        rimLightRef.current.position.y = lerp(
          rimLightRef.current.position.y,
          2 + mouse.current.y * 1.0,
          0.04
        );
      }
    }
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 901;
  const gx = isMobile ? 0.0 : 0.6;
  const gs = isMobile ? 0.72 : 1.0;

  return (
    <>
      {/* HDRI environment — studio softbox, background hidden */}
      <Environment files={HDRI_URL} background={false} />

      {/* Ambient — very low, lets HDRI dominate */}
      <ambientLight intensity={0.08} />

      {/* Key light — warm, directional, from upper-left */}
      <directionalLight
        position={[-4, 5, 3]}
        color="#FFD8A0"
        intensity={2.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />

      {/* Fill light — cool hemisphere, wraps shadows */}
      <hemisphereLight
        args={['#C9C2B4', '#15120F', 0.5]}
      />

      {/* Rim light — Sitka Yellow, edge-lights the laminate panel */}
      <spotLight
        ref={rimLightRef}
        position={[5, 2, -2]}
        color="#F5B800"
        intensity={2.2}
        angle={0.35}
        penumbra={0.9}
        castShadow={false}
        distance={18}
      />

      {/* Contact shadow under the panel stack */}
      <ContactShadows
        position={[0.6, -2.4, 0]}
        opacity={0.35}
        scale={12}
        blur={3.0}
        far={5}
        color="#15120F"
      />

      {/* Panel group — idle drift is applied to this */}
      <group ref={groupRef} position={[gx, 0, 0]} scale={[gs, gs, gs]}>
        <Suspense fallback={null}>
          <PlywoodPanel />
          <LaminatePanel />
          <VeneerPanel />
        </Suspense>
      </group>
    </>
  );
}

// ─── Mid-tier scene — PBR textures, no postprocessing ────────────────────────
function SceneMid() {
  return (
    <>
      <SceneController reducedMotion={false} />
    </>
  );
}

// ─── Full-tier scene — complete PBR + postprocessing pipeline ─────────────────
function SceneFull({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <SceneController reducedMotion={reducedMotion} />
      <PostFX reducedMotion={reducedMotion} />
    </>
  );
}

// ─── Static Fallback (low-power / prefers-reduced-motion) ────────────────────
function StaticFallback() {
  return (
    <div className="absolute inset-0 bg-ink">
      {/* Blurred plywood image — matches the macro-close opening frame */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80")',
          filter: 'blur(2px) brightness(0.65) saturate(0.8)',
          transform: 'scale(1.05)',
        }}
      />
      {/* Dark vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-ink/60 to-ink/90" />
    </div>
  );
}

// ─── Root Hero3D Component ────────────────────────────────────────────────────
export default function Hero3D() {
  const capability = useDeviceCapability();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Low-power or accessibility: serve static image
  if (capability === 'low') {
    return (
      <div className="absolute inset-0 z-0 w-full h-full">
        <StaticFallback />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 w-full h-full select-none pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.2], fov: 58 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {capability === 'high' ? (
            <SceneFull reducedMotion={reducedMotion} />
          ) : (
            <SceneMid />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
