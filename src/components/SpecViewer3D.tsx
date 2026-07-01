'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Finish } from '@/types/visualizer';

interface Props {
  finish: Finish;
}

// Scale factor: 600mm = 1 unit in Three.js scene
const SCALE = 600;

// ─── Path A: GLTF Model Loader Component ──────────────────────────────────────
function GLTFModel({ url, realWidth, realHeight, realThickness }: {
  url: string;
  realWidth: number;
  realHeight: number;
  realThickness: number;
}) {
  const gltf = useLoader(GLTFLoader, url);

  useEffect(() => {
    if (!gltf) return;

    // 1. Correct Color Space of all textures inside GLTF
    gltf.scene.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat: any) => {
            if (mat.map) {
              mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.map.needsUpdate = true;
            }
            if (mat.normalMap) {
              mat.normalMap.colorSpace = THREE.NoColorSpace;
              mat.normalMap.needsUpdate = true;
            }
          });
        }
      }
    });

    // 2. Compute bounding box and auto-scale to match spec dimensions
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    const targetX = realWidth / SCALE;
    const targetY = realHeight / SCALE;
    const targetZ = realThickness / SCALE;

    // Avoid division by zero
    const scaleX = size.x > 0 ? targetX / size.x : 1;
    const scaleY = size.y > 0 ? targetY / size.y : 1;
    const scaleZ = size.z > 0 ? targetZ / size.z : 1;

    gltf.scene.scale.set(scaleX, scaleY, scaleZ);

    // Center scene
    const newBox = new THREE.Box3().setFromObject(gltf.scene);
    const center = new THREE.Vector3();
    newBox.getCenter(center);
    gltf.scene.position.sub(center);
  }, [gltf, realWidth, realHeight, realThickness]);

  return <primitive object={gltf.scene} />;
}

// ─── Path B: Auto-Generated Panel Mesh Component ──────────────────────────────
function GeneratedPanel({ finish }: { finish: Finish }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [faceTexture, setFaceTexture] = useState<THREE.Texture | null>(null);
  const [normalTexture, setNormalTexture] = useState<THREE.Texture | null>(null);
  const [edgeTexture, setEdgeTexture] = useState<THREE.Texture | null>(null);

  const width = (finish.realWidthMm || 1220) / SCALE;
  const height = (finish.realHeightMm || 2440) / SCALE;
  const thickness = (finish.realThicknessMm || 18) / SCALE;

  // Set default material params
  const roughness = finish.roughness !== undefined ? finish.roughness : 0.65;
  const metalness = finish.metalness !== undefined ? finish.metalness : 0.0;
  const isGloss = finish.materialType === 'gloss';

  // 1. Load Swatch Face Texture
  useEffect(() => {
    if (!finish.tileableTexture) {
      setFaceTexture(null);
      setNormalTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(finish.tileableTexture, (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      setFaceTexture(texture);

      // 2. Generate client-side Sobel normal map from the texture image as fallback
      if (finish.autoNormalMap) {
        loader.load(finish.autoNormalMap, (normTex) => {
          normTex.wrapS = THREE.RepeatWrapping;
          normTex.wrapT = THREE.RepeatWrapping;
          normTex.colorSpace = THREE.NoColorSpace;
          setNormalTexture(normTex);
        });
      } else {
        createClientNormalMap(texture.image, (normTex) => {
          setNormalTexture(normTex);
        });
      }
    });
  }, [finish.tileableTexture, finish.autoNormalMap]);

  // 3. Generate Edge Strip texture based on Category configuration
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const style = finish.edgeStyle || 'flatSolid';

    if (style === 'layeredPly') {
      // Draw plywood core stripes (Birch cross section layers)
      const layers = 11;
      const h = canvas.height / layers;
      for (let i = 0; i < layers; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#C4B59F' : '#9E8B75';
        ctx.fillRect(0, i * h, canvas.width, h);
      }
    } else {
      // Flat solid edge - phenolic core (Charcoal tone) or matched color
      ctx.fillStyle = finish.color || '#2C2825';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    setEdgeTexture(tex);

    return () => tex.dispose();
  }, [finish.edgeStyle, finish.color]);

  // Client-side Sobel Normal Map generator
  const createClientNormalMap = (img: HTMLImageElement, callback: (t: THREE.Texture) => void) => {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 512;
    canvas.height = img.naturalHeight || 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const width = canvas.width;
    const height = canvas.height;
    const normals = new Uint8ClampedArray(width * height * 4);

    // Sobel filters
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Fetch surrounding grayscale values
        const getGray = (px: number, py: number) => {
          const i = (py * width + px) * 4;
          return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        };

        const g00 = getGray(x - 1, y - 1);
        const g10 = getGray(x, y - 1);
        const g20 = getGray(x + 1, y - 1);
        const g01 = getGray(x - 1, y);
        const g21 = getGray(x + 1, y);
        const g02 = getGray(x - 1, y + 1);
        const g12 = getGray(x, y + 1);
        const g22 = getGray(x + 1, y + 1);

        const dx = (g20 + 2 * g21 + g22) - (g00 + 2 * g01 + g02);
        const dy = (g02 + 2 * g12 + g22) - (g00 + 2 * g10 + g20);

        // Normalize vector
        const strength = 1.8;
        const vx = -dx * strength;
        const vy = -dy * strength;
        const vz = 1.0;
        const len = Math.sqrt(vx * vx + vy * vy + vz * vz);

        // Map [-1, 1] to [0, 255]
        normals[idx] = Math.round(((vx / len) + 1.0) * 127.5);
        normals[idx + 1] = Math.round(((vy / len) + 1.0) * 127.5);
        normals[idx + 2] = Math.round(((vz / len) + 1.0) * 127.5);
        normals[idx + 3] = 255;
      }
    }

    const normData = new ImageData(normals, width, height);
    ctx.putImageData(normData, 0, 0);

    const normTex = new THREE.CanvasTexture(canvas);
    normTex.wrapS = THREE.RepeatWrapping;
    normTex.wrapT = THREE.RepeatWrapping;
    normTex.colorSpace = THREE.NoColorSpace;
    callback(normTex);
  };

  // Materials configuration per side
  // Order: Right (0), Left (1), Top (2), Bottom (3), Front (4), Back (5)
  const faceMat = (
    <meshPhysicalMaterial
      map={faceTexture}
      color={finish.color || '#ffffff'}
      normalMap={normalTexture}
      normalScale={new THREE.Vector2(0.8, 0.8)}
      roughness={roughness}
      metalness={metalness}
      clearcoat={isGloss ? 0.9 : 0.05}
      clearcoatRoughness={0.05}
    />
  );

  const edgeMat = (
    <meshPhysicalMaterial
      map={edgeTexture}
      color={finish.color ? undefined : '#ffffff'}
      roughness={0.8}
      metalness={0.0}
    />
  );

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[width, height, thickness]} />
      {/* Attach materials to each face index */}
      {edgeMat} {/* Right */}
      {edgeMat} {/* Left */}
      {edgeMat} {/* Top */}
      {edgeMat} {/* Bottom */}
      {faceMat} {/* Front */}
      {faceMat} {/* Back */}
    </mesh>
  );
}

// ─── Scene environment & light calibration ───
function CalibrationLights() {
  return (
    <>
      {/* Calibrated neutral white lighting rig (D65 Temp equivalent) */}
      <ambientLight intensity={0.4} color="#FFFFFF" />

      {/* Key light: neutral white, inverse-square physics */}
      <directionalLight
        position={[4, 5, 4]}
        intensity={1.2}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />

      {/* Soft fill light keeping details visible in shadow regions */}
      <directionalLight
        position={[-4, -3, 2]}
        intensity={0.4}
        color="#FFFFFF"
      />
    </>
  );
}

export default function SpecViewer3D({ finish }: Props) {
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const probe = document.createElement('canvas');
      setWebglSupported(!!(probe.getContext('webgl') || probe.getContext('webgl2')));
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#110E0C] border border-line text-stone text-center p-8">
        <div className="max-w-xs space-y-3">
          <p className="font-display font-medium text-parchment text-sm">
            3D Spec inspection requires WebGL.
          </p>
          <img
            src={finish.thumbnailImage || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop'}
            alt={finish.name}
            className="w-48 h-48 mx-auto object-cover rounded-sm border border-line opacity-50"
          />
          <p className="text-[10px] text-stone-dim">
            Enable hardware acceleration or try a modern browser to inspect grain layers.
          </p>
        </div>
      </div>
    );
  }

  const isModel = finish.modelType === 'uploadedModel' && finish.modelAsset;

  return (
    <div className="relative w-full h-full bg-[#110E0C] overflow-hidden select-none">
      {/* 3D Canvas with exact color mapping constraints */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.NoToneMapping, // Neutral color-accuracy tone-mapping
          outputColorSpace: THREE.SRGBColorSpace, // Calibrated color space output
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 3.8], fov: 42 }}
      >
        <Suspense fallback={null}>
          <CalibrationLights />
          {isModel ? (
            <GLTFModel
              url={finish.modelAsset!}
              realWidth={finish.realWidthMm || 1220}
              realHeight={finish.realHeightMm || 2440}
              realThickness={finish.realThicknessMm || 18}
            />
          ) : (
            <GeneratedPanel finish={finish} />
          )}
          <OrbitControls
            enableZoom={true}
            maxDistance={5.5}
            minDistance={1.8}
            enablePan={false}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
