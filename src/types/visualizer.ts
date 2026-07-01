export interface Finish {
  id: string;
  name: string;
  sku: string;
  specLine: string;
  category: string;
  thumbnailImage: string;      // URL to thumbnail image
  tileableTexture: string;     // URL to tileable texture image
  tileWidthCm?: number;        // Real-world width of one tile repeat (cm)
  tileHeightCm?: number;       // Real-world height of one tile repeat (cm)
  color?: string;              // Fallback solid color (if no tileableTexture is loaded or wanted)
  pbrMaps?: {
    normal?: string;
    roughness?: string;
    ao?: string;
  };
  materialType: 'matte' | 'gloss' | 'satin' | 'wood' | 'stone';
  tags: string[];
  modelType?: 'generated' | 'uploadedModel';
  modelAsset?: string;
  autoNormalMap?: string;
  realWidthMm?: number;
  realHeightMm?: number;
  realThicknessMm?: number;
  roughness?: number;
  metalness?: number;
  edgeStyle?: 'layeredPly' | 'flatSolid' | 'custom';
}

export interface VisualizerZone {
  id: string;
  label: string;
  mask: string | null;              // URL to RGBA mask PNG, or null -> full-quad mask
  shadingLayer: string | null;      // URL to grayscale shading PNG, or null -> extract from photo
  corners: [
    [number, number],               // Top-Left [x, y] in natural image pixel space
    [number, number],               // Top-Right [x, y]
    [number, number],               // Bottom-Right [x, y]
    [number, number]                // Bottom-Left [x, y]
  ];
  widthCm?: number;                 // Real-world width of the zone (cm)
  heightCm?: number;                // Real-world height of the zone (cm)
  allowedCategories: string[];
  defaultFinish: Finish;
  displayOrder: number;             // Higher rendered last = on top
}

export interface VisualizerScene {
  id: string;
  name: string;
  slug: string;
  roomImage: string;               // URL to background room photo
  naturalWidth: number;            // Pixel dimensions of room photo
  naturalHeight: number;
  status: 'DRAFT' | 'PUBLISHED';
  displayOrder: number;
  whereShown: string[];
  zones: VisualizerZone[];
  overlaySettings: {
    opacity: number;               // Default per-zone overlay opacity
    shadowIntensity?: number;
    vignetteIntensity?: number;
    edgeAO?: number;
  };
}

export interface HubPageSectionConfig {
  id: string;
  category: string; // "plywood" | "laminates" | "veneer" | "decoratives"
  sectionOrder: string[]; // ["swatches", "catalogue", "matrix", "faqs"]
  visibility: {
    swatches: boolean;
    catalogue: boolean;
    matrix: boolean;
    faqs: boolean;
  };
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface ComparisonMatrix {
  id: string;
  category: string;
  columns: { fieldKey: string; label: string }[];
  rows: { productId: string; productName?: string; values: Record<string, string> }[];
  sourceDocumentName?: string | null;
  sourceDocumentUrl?: string | null;
  sourceDocumentFormat?: string | null;
  extractionConfidence?: Record<string, number> | null;
  version: number;
  status: 'draft' | 'published';
}

