'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralTextureCanvas, drawWoodgrain, drawLaminate, drawPlywoodEdge, createNormalMap } from '@/lib/textureUtils';

// Subcomponent: A singular textured architectural slab in the sculpture
type SlabProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  args: [number, number, number];
  type: 'plywood' | 'laminate' | 'veneer';
  color?: string;
};

function SculpturalSlab({ position, rotation, args, type, color = '#F5B800' }: SlabProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<{ maps: THREE.CanvasTexture[]; normals: THREE.CanvasTexture[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Generate high-fidelity textures and corresponding normal maps
    const faceCanvas = createProceduralTextureCanvas(1024, 1024, (ctx) => {
      if (type === 'plywood') {
        drawWoodgrain(ctx, 1024, 1024, '#E2D4BF', '#7A6850');
      } else if (type === 'veneer') {
        drawWoodgrain(ctx, 1024, 1024, '#4B382A', '#1C120A'); // Rich dark Walnut
      } else {
        drawLaminate(ctx, 1024, 1024, color); // Sitka Yellow Laminate
      }
    });

    const edgeCanvas = createProceduralTextureCanvas(256, 1024, (ctx) => {
      if (type === 'plywood') {
        drawPlywoodEdge(ctx, 256, 1024);
      } else {
        ctx.fillStyle = type === 'veneer' ? '#2A1F18' : '#1C1A17';
        ctx.fillRect(0, 0, 256, 1024);
      }
    });

    // Grayscale heightmaps for normal generation
    const faceHeightCanvas = createProceduralTextureCanvas(1024, 1024, (ctx) => {
      if (type === 'plywood') {
        drawWoodgrain(ctx, 1024, 1024, '#E2D4BF', '#7A6850', true);
      } else if (type === 'veneer') {
        drawWoodgrain(ctx, 1024, 1024, '#E2D4BF', '#7A6850', true);
      } else {
        drawLaminate(ctx, 1024, 1024, color, true);
      }
    });

    const edgeHeightCanvas = createProceduralTextureCanvas(256, 1024, (ctx) => {
      if (type === 'plywood') {
        drawPlywoodEdge(ctx, 256, 1024, true);
      } else {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 256, 1024);
      }
    });

    const faceNormalCanvas = createNormalMap(faceHeightCanvas, type === 'laminate' ? 0.35 : 1.3);
    const edgeNormalCanvas = createNormalMap(edgeHeightCanvas, 2.0);

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const edgeTex = new THREE.CanvasTexture(edgeCanvas);
    const faceNormalTex = new THREE.CanvasTexture(faceNormalCanvas);
    const edgeNormalTex = new THREE.CanvasTexture(edgeNormalCanvas);

    faceTex.colorSpace = THREE.SRGBColorSpace;
    edgeTex.colorSpace = THREE.SRGBColorSpace;
    faceNormalTex.colorSpace = THREE.NoColorSpace;
    edgeNormalTex.colorSpace = THREE.NoColorSpace;

    setTextures({
      maps: [edgeTex, edgeTex, edgeTex, edgeTex, faceTex, faceTex],
      normals: [edgeNormalTex, edgeNormalTex, edgeNormalTex, edgeNormalTex, faceNormalTex, faceNormalTex]
    });
  }, [type, color, mounted]);

  if (!textures) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      {textures.maps.map((tex, idx) => (
        <meshPhysicalMaterial
          key={idx}
          attach={`material-${idx}`}
          map={tex}
          normalMap={textures.normals[idx]}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={type === 'laminate' ? 0.92 : 0.48}
          metalness={0.02}
          clearcoat={type === 'laminate' ? 0.0 : 0.1}
          clearcoatRoughness={0.12}
        />
      ))}
    </mesh>
  );
}

// Particle dust motes component for environmental lighting depth
function DustMotes({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 12;     // X
      arr[i + 1] = (Math.random() - 0.5) * 8; // Y
      arr[i + 2] = (Math.random() - 0.5) * 8; // Z
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positionsArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positionsArr[idx + 1] += 0.0018 + Math.sin(time + i) * 0.0008;
      if (positionsArr[idx + 1] > 4) {
        positionsArr[idx + 1] = -4; // Reset to bottom
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F5B800"
        size={0.035}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}

// Dynamic lighting and group parallax container
function SceneController() {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const c = state.camera;
    
    // Eased intro camera pull-in (first 2.4s)
    if (time < 2.5) {
      c.position.setZ(THREE.MathUtils.lerp(c.position.z, 5.8, 0.04));
    } else {
      // Normal mouse parallax targeting position
      const targetX = mouse.current.x * 0.8;
      const targetY = -mouse.current.y * 0.6;
      c.position.setX(THREE.MathUtils.lerp(c.position.x, targetX, 0.05));
      c.position.setY(THREE.MathUtils.lerp(c.position.y, targetY, 0.05));
      c.position.setZ(THREE.MathUtils.lerp(c.position.z, 5.8, 0.05));
    }
    
    // Camera looks slightly toward center
    c.lookAt(0, 0, 0);

    // Parallax group tilting
    if (groupRef.current) {
      const targetX = mouse.current.x * 0.25;
      const targetY = mouse.current.y * 0.2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
    }

    // Interactive spotlight tracking
    if (lightRef.current) {
      const targetLightX = mouse.current.x * 4.5;
      const targetLightY = mouse.current.y * 3.5;
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetLightX, 0.08);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetLightY, 0.08);
    }
  });

  // Responsive responsive position shifting: offset to the right on desktop, centered on mobile/tablet
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 901;
  const groupPosX = isMobile ? 0.0 : 1.8;
  const groupPosY = isMobile ? -0.3 : 0.0;
  const groupScale = isMobile ? 0.8 : 1.05;

  return (
    <group ref={groupRef} position={[groupPosX, groupPosY, 0]} scale={[groupScale, groupScale, groupScale]}>
      {/* Ambient background light */}
      <ambientLight intensity={0.16} />

      {/* Point lights */}
      <pointLight position={[-4, 3, 2]} intensity={0.4} color="#8B8478" />

      {/* Interactive cursor tracking spotlight */}
      <spotLight
        ref={lightRef}
        position={[0, 4, 5]}
        angle={0.4}
        penumbra={0.85}
        intensity={2.8}
        color="#FFD23F" // Warm glow
        castShadow
      />

      {/* 3D MATERIAL SCULPTURE SLABS */}
      
      {/* 1. Plywood base block */}
      <SculpturalSlab
        position={[0.0, -1.8, 0.0]}
        rotation={[0.08, -Math.PI / 8, 0.0]}
        args={[2.2, 0.45, 1.4]}
        type="plywood"
      />

      {/* 2. Laminate vertical slab (Vibrant yellow focal point) */}
      <SculpturalSlab
        position={[-0.55, -0.2, 0.35]}
        rotation={[0.0, Math.PI / 7, -0.05]}
        args={[0.85, 2.5, 0.08]}
        type="laminate"
        color="#F5B800"
      />

      {/* 3. Walnut Veneer backing panel */}
      <SculpturalSlab
        position={[0.55, 0.1, -0.35]}
        rotation={[0.0, -Math.PI / 10, 0.06]}
        args={[1.3, 2.8, 0.06]}
        type="veneer"
      />
    </group>
  );
}

export default function ThreeHero() {
  return (
    <div className="absolute inset-0 z-0 w-full h-full select-none pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        style={{ pointerEvents: 'none' }}
      >
        <SceneController />

        {/* Floating dust */}
        <DustMotes count={80} />

        {/* Ambient floor shadow */}
        <ContactShadows 
          position={[0, -2.6, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4.0} 
        />
      </Canvas>
    </div>
  );
}
