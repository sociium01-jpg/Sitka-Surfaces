import fs from 'fs';
import path from 'path';
import { VisualizerScene, VisualizerZone, Finish, HubPageSectionConfig, FAQ, ComparisonMatrix } from '@/types/visualizer';
import { defaultScene, FINISHES } from '@/lib/visualizerScene';

const STORAGE_PATH = path.join(process.cwd(), 'src/lib/visualizerDb.json');

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
  hubConfigs: HubPageSectionConfig[];
  faqs: FAQ[];
  matrices: ComparisonMatrix[];
}

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

  // Hub outlines config defaults
  const initialHubConfigs: HubPageSectionConfig[] = ['plywood', 'laminates', 'veneer', 'decoratives'].map((vertical) => ({
    id: `config-${vertical}`,
    category: vertical,
    sectionOrder: ['swatches', 'catalogue', 'matrix', 'faqs'],
    visibility: { swatches: true, catalogue: true, matrix: true, faqs: true },
  }));

  // Initial FAQs
  const initialFaqs: FAQ[] = [
    {
      id: 'faq-ply-1',
      category: 'plywood',
      question: 'What is the difference between MR and BWR grade plywood?',
      answer: 'MR (Moisture Resistant) plywood handles everyday indoor humidity; BWR (Boiling Water Resistant) is tested for prolonged hot water contact, making it standard for kitchen cabinets.',
      displayOrder: 1,
    },
    {
      id: 'faq-ply-2',
      category: 'plywood',
      question: 'Can Sitka Plywood be used for exterior facades?',
      answer: 'Yes — our Marine Grade IS 710 range is manufactured with specialized phenolic adhesives specifically for continuous outdoor facades.',
      displayOrder: 2,
    },
    {
      id: 'faq-lam-1',
      category: 'laminates',
      question: 'What is compact laminate?',
      answer: 'Compact laminate is a self-supporting solid sheet (usually 6mm to 18mm thickness) pressed under high heat and pressure, requiring no plywood substrate. Perfect for washroom cubicles and modern countertops.',
      displayOrder: 1,
    },
    {
      id: 'faq-lam-2',
      category: 'laminates',
      question: 'Do gloss finishes show fingerprints?',
      answer: 'Yes, gloss reflects direct light. For high-touch areas, we recommend choosing our Matte or Anti-Fingerprint options.',
      displayOrder: 2,
    },
  ];

  // Initial Comparison Matrices
  const initialMatrices: ComparisonMatrix[] = [
    {
      id: 'matrix-plywood',
      category: 'plywood',
      columns: [
        { fieldKey: 'grade', label: 'Grade' },
        { fieldKey: 'thickness', label: 'Thickness Range' },
        { fieldKey: 'waterResistance', label: 'Water Resistance' },
        { fieldKey: 'idealUse', label: 'Ideal Use' },
        { fieldKey: 'emission', label: 'Emission Level' },
      ],
      rows: [
        {
          productId: 'bwr-grade',
          productName: 'BWR Grade Corewood',
          values: {
            grade: 'BWR (IS 303)',
            thickness: '6mm - 25mm',
            waterResistance: 'Boiling Water Resistant (72 hrs)',
            idealUse: 'Kitchen Cabinets, Wardrobes',
            emission: 'E1 Certified',
          },
        },
        {
          productId: 'marine-grade',
          productName: 'Marine Grade IS 710',
          values: {
            grade: 'Marine (IS 710)',
            thickness: '9mm - 19mm',
            waterResistance: 'Boiling Water Proof (100 hrs)',
            idealUse: 'External Cladding, Wet Areas',
            emission: 'E0 Certified',
          },
        },
      ],
      sourceDocumentName: 'Plywood_Specs_Sheet.xlsx',
      sourceDocumentFormat: 'xlsx',
      version: 1,
      status: 'published',
    },
  ];

  return {
    scenes: [defaultScene],
    categories: initialCategories,
    finishes: initialFinishes,
    hubConfigs: initialHubConfigs,
    faqs: initialFaqs,
    matrices: initialMatrices,
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
    const data = JSON.parse(raw);
    
    // Ensure new properties exist for backwards compatibility
    if (!data.hubConfigs) data.hubConfigs = [];
    if (!data.faqs) data.faqs = [];
    if (!data.matrices) data.matrices = [];
    
    return data;
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
