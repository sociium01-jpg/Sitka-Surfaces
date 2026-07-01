import fs from 'fs';
import path from 'path';
import { VisualizerScene, VisualizerZone, Finish } from '@/types/visualizer';
import { defaultScene, FINISHES } from '@/lib/visualizerScene';

const STORAGE_PATH = path.join(process.cwd(), 'src/lib/visualizerDb.json');

// Interface matching DB schema structure for JSON storage
interface VisualizerJSONDb {
  scenes: VisualizerScene[];
  categories: { id: string; name: string; slug: string; displayOrder: number }[];
  finishes: Finish[];
}

// Initial default data if file is missing
const getDefaultDbData = (): VisualizerJSONDb => {
  const initialFinishes: Finish[] = Object.values(FINISHES).flat();
  const initialCategories = Object.keys(FINISHES).map((catName, idx) => ({
    id: `cat-${catName.toLowerCase()}`,
    name: catName,
    slug: catName.toLowerCase(),
    displayOrder: idx,
  }));

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
