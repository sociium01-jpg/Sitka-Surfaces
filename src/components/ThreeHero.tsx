'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralTextureCanvas, drawWoodgrain, drawLaminate, drawPlywoodEdge } from '@/lib/textureUtils';

type PanelProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  type: 'plywood' | 'laminate' | 'veneer' | 'decorative';
  color?: string;
  delay?: number;
};

function ProceduralPanel({ position, rotation, type, color = '#F5B800', delay = 0 }: PanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<THREE.CanvasTexture[] | null>(null);

  // Generate procedural textures on mount
  useEffect(() => {
    const faceCanvas = createProceduralTextureCanvas(512, 1024, (ctx) => {
      if (type === 'plywood') {
        drawWoodgrain(ctx, 512, 1024, '#E0D2BC', '#8B775C'); // Birch/Oak plywood grain
      } else if (type === 'veneer') {
        drawWoodgrain(ctx, 512, 1024, '#4B382A', '#1E120A'); // Walnut veneer grain
      } else if (type === 'laminate') {
        drawLaminate(ctx, 512, 1024, color); // Matte yellow laminate
      } else {
        drawLaminate(ctx, 512, 1024, '#1C1C1C'); // Charcoal decorative
      }
    });

    const edgeCanvas = createProceduralTextureCanvas(128, 512, (ctx) => {
      if (type === 'plywood') {
        drawPlywoodEdge(ctx, 128, 512); // Layered edge lines
      } else if (type === 'laminate') {
        ctx.fillStyle = '#2A2521'; // Solid charcoal core edge
        ctx.fillRect(0, 0, 128, 512);
      } else {
        ctx.fillStyle = '#1C1A17';
        ctx.fillRect(0, 0, 128, 512);
      }
    });

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const edgeTex = new THREE.CanvasTexture(edgeCanvas);
    
    faceTex.colorSpace = THREE.SRGBColorSpace;
    edgeTex.colorSpace = THREE.SRGBColorSpace;

    // Six materials for BoxGeometry: [right, left, top, bottom, front, back]
    setTextures([
      edgeTex, // right
      edgeTex, // left
      edgeTex, // top
      edgeTex, // bottom
      faceTex, // front
      faceTex, // back
    ]);
  }, [type, color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() + delay;

    // Float position oscillation
    meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.15;
    meshRef.current.position.x = position[0] + Math.cos(time * 0.4) * 0.08;

    // Subtle drift rotation
    meshRef.current.rotation.x = rotation[0] + Math.sin(time * 0.2) * 0.04;
    meshRef.current.rotation.y = rotation[1] + Math.cos(time * 0.25) * 0.05;
    meshRef.current.rotation.z = rotation[2] + Math.sin(time * 0.15) * 0.02;
  });

  if (!textures) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[1.5, 2.5, 0.06]} />
      {textures.map((tex, idx) => (
        <meshPhysicalMaterial 
          key={idx} 
          attach={`material-${idx}`} 
          map={tex} 
          roughness={type === 'laminate' ? 0.9 : 0.6}
          metalness={0.05}
          clearcoat={type === 'laminate' ? 0.0 : 0.05}
        />
      ))}
    </mesh>
  );
}

// Particle dust motes
function DustMotes({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 12; // X
      arr[i + 1] = (Math.random() - 0.5) * 8; // Y
      arr[i + 2] = (Math.random() - 0.5) * 8; // Z
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Drift upwards
      positions[idx + 1] += 0.002 + Math.sin(time + i) * 0.001;
      // Wrap around Y
      if (positions[idx + 1] > 4) {
        positions[idx + 1] = -4;
      }
      // Gentle X/Z float noise
      positions[idx] += Math.sin(time * 0.5 + i) * 0.001;
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
        size={0.035}
        color="#EDE6D8"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Scene controller for camera intro and mouse parallax
function SceneController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Start camera far away for the transition zoom intro
    camera.position.set(0, 0, 15);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) - 0.5;
      mouse.current.y = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Eased intro camera pull-in (first 2.4s)
    if (time < 2.5) {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.8, 0.04);
    } else {
      // Normal mouse parallax targeting position
      const targetX = mouse.current.x * 0.8;
      const targetY = -mouse.current.y * 0.6;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.8, 0.05);
    }
    
    // Camera looks slightly toward center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function ThreeHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Fallback template matching the layout exactly
    return (
      <div className="absolute inset-0 bg-[#15120F] flex items-center justify-center">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(245,184,0,0.12),transparent_60%)]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#15120F] r3f-canvas">
      {/* Dynamic 3D canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#15120F'));
        }}
      >
        <ambientLight intensity={0.5} />
        {/* Warm keylight */}
        <directionalLight 
          position={[5, 8, 4]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        {/* Soft fill light */}
        <directionalLight 
          position={[-5, 4, -2]} 
          intensity={0.4} 
        />
        {/* Subtle orange accent backlight */}
        <pointLight
          position={[0, 0, -3]}
          intensity={0.8}
          color="#F5B800"
          distance={10}
        />

        {/* 4 Drifting Surface Panels */}
        <group position={[0, 0.2, 0]}>
          <ProceduralPanel 
            position={[-1.8, 0.5, 0.2]} 
            rotation={[0.1, 0.3, -0.05]} 
            type="plywood" 
            delay={0}
          />
          <ProceduralPanel 
            position={[-0.5, -0.7, 0.8]} 
            rotation={[0.25, -0.2, 0.05]} 
            type="laminate" 
            color="#F5B800" 
            delay={2.5}
          />
          <ProceduralPanel 
            position={[0.8, 0.8, -0.4]} 
            rotation={[-0.15, -0.25, 0.02]} 
            type="veneer" 
            delay={5.0}
          />
          <ProceduralPanel 
            position={[2.0, -0.4, 0.4]} 
            rotation={[0.2, 0.15, -0.08]} 
            type="decorative" 
            delay={7.5}
          />
        </group>

        {/* Dust motes */}
        <DustMotes count={100} />

        {/* Soft ground contact shadow */}
        <ContactShadows 
          position={[0, -2.8, 0]} 
          opacity={0.5} 
          scale={12} 
          blur={2.4} 
          far={4.5} 
        />

        {/* Camera and mouse controller */}
        <SceneController />
      </Canvas>
    </div>
  );
}
