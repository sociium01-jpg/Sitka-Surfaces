'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralTextureCanvas, drawWoodgrain, drawLaminate, drawPlywoodEdge, createNormalMap } from '@/lib/textureUtils';

type InspectorPanelProps = {
  materialType: 'plywood' | 'laminate';
  color?: string;
  isHovered: boolean;
};

function InspectorPanel({ materialType, color = '#F5B800', isHovered }: InspectorPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<{ maps: THREE.CanvasTexture[]; normals: THREE.CanvasTexture[] } | null>(null);

  // Generate high-res procedural textures
  useEffect(() => {
    // Diffuse Canvas Maps
    const faceCanvas = createProceduralTextureCanvas(1024, 1024, (ctx) => {
      if (materialType === 'plywood') {
        drawWoodgrain(ctx, 1024, 1024, '#E2D4BF', '#7A6850'); // Birch face veneer
      } else {
        drawLaminate(ctx, 1024, 1024, color); // Matte brand yellow laminate face
      }
    });

    const edgeCanvas = createProceduralTextureCanvas(256, 1024, (ctx) => {
      if (materialType === 'plywood') {
        drawPlywoodEdge(ctx, 256, 1024); // Heavy striped ply edge layers
      } else {
        ctx.fillStyle = '#1C1A17'; // Solid phenolic resin core edge
        ctx.fillRect(0, 0, 256, 1024);
      }
    });

    // Height Canvas Maps for generating Normals
    const faceHeightCanvas = createProceduralTextureCanvas(1024, 1024, (ctx) => {
      if (materialType === 'plywood') {
        drawWoodgrain(ctx, 1024, 1024, '#E2D4BF', '#7A6850', true); // Heightmap flag true
      } else {
        drawLaminate(ctx, 1024, 1024, color, true); // Heightmap flag true
      }
    });

    const edgeHeightCanvas = createProceduralTextureCanvas(256, 1024, (ctx) => {
      if (materialType === 'plywood') {
        drawPlywoodEdge(ctx, 256, 1024, true); // Heightmap flag true
      } else {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 256, 1024);
      }
    });

    const faceNormalCanvas = createNormalMap(faceHeightCanvas, materialType === 'laminate' ? 0.35 : 1.5);
    const edgeNormalCanvas = createNormalMap(edgeHeightCanvas, 2.5);

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const edgeTex = new THREE.CanvasTexture(edgeCanvas);
    const faceNormalTex = new THREE.CanvasTexture(faceNormalCanvas);
    const edgeNormalTex = new THREE.CanvasTexture(edgeNormalCanvas);
    
    faceTex.colorSpace = THREE.SRGBColorSpace;
    edgeTex.colorSpace = THREE.SRGBColorSpace;
    faceNormalTex.colorSpace = THREE.NoColorSpace;
    edgeNormalTex.colorSpace = THREE.NoColorSpace;

    setTextures({
      maps: [
        edgeTex, // right
        edgeTex, // left
        edgeTex, // top
        edgeTex, // bottom
        faceTex, // front
        faceTex, // back
      ],
      normals: [
        edgeNormalTex, // right
        edgeNormalTex, // left
        edgeNormalTex, // top
        edgeNormalTex, // bottom
        faceNormalTex, // front
        faceNormalTex, // back
      ]
    });
  }, [materialType, color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Slow baseline rotation if user is not actively dragging
    if (!isHovered) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  if (!textures) return null;

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[2.0, 3.2, 0.08]} />
      {textures.maps.map((tex, idx) => (
        <meshPhysicalMaterial 
          key={idx} 
          attach={`material-${idx}`} 
          map={tex} 
          normalMap={textures.normals[idx]}
          normalScale={new THREE.Vector2(0.9, 0.9)}
          roughness={materialType === 'laminate' ? 0.95 : 0.45}
          metalness={0.02}
          clearcoat={materialType === 'laminate' ? 0.0 : 0.12}
          clearcoatRoughness={0.15}
        />
      ))}
    </mesh>
  );
}

export default function ThreeInspector() {
  const [materialType, setMaterialType] = useState<'plywood' | 'laminate'>('plywood');
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[450px] bg-ink-2/60 border border-line flex items-center justify-center">
        <span className="text-xs font-mono text-stone-dim uppercase">Loading interactive viewer...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-stretch">
      {/* 3D Canvas Box */}
      <div 
        className="flex-grow h-[450px] bg-[#110E0C] border border-line relative overflow-hidden group cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Inspector HUD overlays */}
        <div className="absolute top-4 left-4 z-10 space-y-1 select-none pointer-events-none">
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">3D Inspector</span>
          <span className="block text-xs font-display font-medium text-parchment uppercase">
            {materialType === 'plywood' ? 'Engineered Plywood' : 'HPL Laminate'}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 z-10 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-300">
          <span className="text-[9px] font-mono uppercase tracking-widest text-parchment">
            ← Drag to rotate · Scroll to zoom →
          </span>
        </div>

        {/* Canvas */}
        <Canvas shadows camera={{ position: [0, 0, 4.2], fov: 50 }}>
          <ambientLight intensity={0.35} />
          
          {/* Main Keylight */}
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.0} 
            castShadow
          />

          {/* Ramping Inspection Spotlight on hover */}
          <spotLight 
            position={[0, 4, 3]} 
            intensity={isHovered ? 1.8 : 0.3} 
            angle={0.5} 
            penumbra={1} 
            color="#FFF4D1" 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />

          {/* Drifting fill pointlight */}
          <pointLight 
            position={[-4, -2, 2]} 
            intensity={0.2} 
            color="#FFFFFF" 
          />

          <InspectorPanel materialType={materialType} isHovered={isHovered} />

          <OrbitControls 
            enableZoom={true} 
            maxDistance={6.0} 
            minDistance={2.2} 
            enablePan={false} 
          />
        </Canvas>
      </div>

      {/* Materials Specs HUD Control Column */}
      <div className="w-full md:w-80 flex flex-col justify-between p-6 border border-line bg-ink-2/40">
        <div className="space-y-6">
          <span className="text-[10px] font-mono tracking-widest text-brass uppercase block border-b border-line/30 pb-2">
            Spec Inspector
          </span>

          {/* Material Selector Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMaterialType('plywood')}
              className={`py-3 text-[10px] font-mono tracking-wider uppercase text-center border transition-all cursor-pointer ${
                materialType === 'plywood'
                  ? 'border-ember bg-ember text-ember-text font-bold'
                  : 'border-line hover:border-stone-dim text-stone'
              }`}
            >
              Plywood
            </button>
            <button
              onClick={() => setMaterialType('laminate')}
              className={`py-3 text-[10px] font-mono tracking-wider uppercase text-center border transition-all cursor-pointer ${
                materialType === 'laminate'
                  ? 'border-ember bg-ember text-ember-text font-bold'
                  : 'border-line hover:border-stone-dim text-stone'
              }`}
            >
              Laminate
            </button>
          </div>

          {/* Dynamic Technical Specs Text */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-display font-medium text-parchment">
              {materialType === 'plywood' 
                ? 'Core Structural View' 
                : 'Protective Surface Layer'}
            </h4>
            <p className="text-xs text-stone-dim leading-relaxed">
              {materialType === 'plywood'
                ? 'Inspect the alternating cross-banded birch veneer cores. Plywood faces showcase structural oak with detailed growth grain, while edges remain unmasked to showcase raw material layers.'
                : 'Inspect the flat protective HPL (High-Pressure Laminate) face. Featuring the signature Sitka amber-yellow pigmentation, fused under high heat with a dark core phenolic layer.'}
            </p>
          </div>
        </div>

        {/* Live HUD specifications metrics */}
        <div className="pt-6 border-t border-line/30 space-y-2 font-mono text-[9px] text-stone-dim uppercase tracking-wider">
          <div className="flex justify-between">
            <span>Dimensions:</span>
            <span className="text-parchment font-semibold">2440 × 1220 mm</span>
          </div>
          <div className="flex justify-between">
            <span>Core Corewood:</span>
            <span className="text-parchment font-semibold">
              {materialType === 'plywood' ? 'Birch Multi-layer' : 'Kraft Phenolic'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Edge Treatment:</span>
            <span className="text-parchment font-semibold">
              {materialType === 'plywood' ? 'Layered ply edge' : 'Flat solid edge'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
