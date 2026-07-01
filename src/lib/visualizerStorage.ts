import fs from 'fs';
import path from 'path';
import { VisualizerScene, VisualizerZone, Finish } from '@/types/visualizer';
import { defaultScene, FINISHES } from '@/lib/visualizerScene';

const STORAGE_PATH = path.join(process.cwd(), 'src/lib/visualizerDb.json');

// Interface matching DB schema structure for JSON storage
interface VisualizerJSONDb {
  scenes: VisualizerScene[];
  categories: {
    id: string;
    name: string;
    slug: string;
    displayOrder: number;
    defaultEdgeStyle?: string;
    defaultRoughness?: number;
    defaultMetalness?: number;
    deckImage?: string | null;
    tagline?: string | null;
    description?: string | null;
    metaLine?: string | null;
  }[];
  finishes: Finish[];
}

// Initial default data if file is missing
const getDefaultDbData = (): VisualizerJSONDb => {
  const initialFinishes: Finish[] = Object.values(FINISHES).flat();
  const deckMetadata: Record<string, { tagline: string; description: string; metaLine: string; image: string }> = {
    Plywood: {
      tagline: 'The structure underneath the beauty.',
      description: 'Engineered core panels built for strength, screw-holding, and dead-flat lamination.',
      metaLine: '8 grades · MR → Marine',
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80',
    },
    Laminates: {
      tagline: 'Built for the surfaces that get touched the most.',
      description: 'High-pressure laminates in matte, gloss, and textured finishes that shrug off scratches and daily wear.',
      metaLine: '32 options · Matte → Gloss',
      image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1000&q=80',
    },
    Veneer: {
      tagline: 'Real wood, cut thin, made honest.',
      description: 'Natural wood veneers sliced for grain-true consistency — the character of solid timber, without the cost.',
      metaLine: '18 species · Rotary → Rift',
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80',
    },
    Decoratives: {
      tagline: 'The detail that makes a space feel finished.',
      description: 'Decorative surfaces, edgebanding, and specialty panels for the details that need more than a flat finish.',
      metaLine: '12 products · Slats → Edges',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    },
  };

  const initialCategories = Object.keys(FINISHES).map((catName, idx) => {
    const meta = deckMetadata[catName] || {
      tagline: 'Premium structural and surface sheets.',
      description: 'Calibrated material lines engineered for architecture.',
      metaLine: 'Sitka surfaces specification',
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1000&q=80',
    };

    return {
      id: `cat-${catName.toLowerCase()}`,
      name: catName,
      slug: catName.toLowerCase(),
      displayOrder: idx,
      defaultEdgeStyle: catName.toLowerCase() === 'plywood' ? 'layeredPly' : 'flatSolid',
      defaultRoughness: 0.5,
      defaultMetalness: 0.0,
      deckImage: meta.image,
      tagline: meta.tagline,
      description: meta.description,
      metaLine: meta.metaLine,
    };
  });

  return {
    scenes: [defaultScene],
    categories: initialCategories,
    finishes: initialFinishes,
  };
};

export function readVisualizerDb(): VisualizerJSONDb {
  try {
    if (!fs.existsSync(STORAGE_PATH)) {
      const defaultData = getDefaultDbData();
      writeVisualizerDb(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading visualizer storage file, using defaults', err);
    return getDefaultDbData();
  }
}

export function writeVisualizerDb(data: VisualizerJSONDb) {
  try {
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write visualizer storage file', err);
  }
}
