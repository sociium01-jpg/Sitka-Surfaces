import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';
import { ComparisonMatrix } from '@/types/visualizer';

function hasWriteAccess(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get('sitka_session');
  if (!sessionCookie || !sessionCookie.value) return false;
  const session = decryptSession(sessionCookie.value);
  if (!session) return false;
  return session.role === 'ADMIN' || session.role === 'EDITOR';
}

async function isDbOnline(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Fuzzy-match dictionary for vertical fields normalization
const FUZZY_DICTIONARY: Record<string, Record<string, string>> = {
  plywood: {
    'thk': 'thickness',
    'thkness': 'thickness',
    'panel thickness': 'thickness',
    'thickness range': 'thickness',
    'water resistance': 'waterResistance',
    'waterproof': 'waterResistance',
    'h2o resistance': 'waterResistance',
    'ideal use': 'idealUse',
    'application': 'idealUse',
    'use case': 'idealUse',
    'emission': 'emission',
    'formaldehyde': 'emission',
    'emission level': 'emission',
  },
  laminates: {
    'finish': 'finishType',
    'surface': 'finishType',
    'finish type': 'finishType',
    'gloss': 'glossLevel',
    'gloss level': 'glossLevel',
    'scratch': 'scratchResistance',
    'durability': 'scratchResistance',
    'scratch resistance': 'scratchResistance',
    'substrate': 'recommendedSubstrate',
    'recommended substrate': 'recommendedSubstrate',
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const matrix = db.matrices.find((m) => m.category === category);
      return NextResponse.json({ success: true, matrix: matrix || null });
    }

    const matrix = await prisma.comparisonMatrix.findUnique({
      where: { category }
    });

    if (!matrix) {
      return NextResponse.json({ success: true, matrix: null });
    }

    return NextResponse.json({
      success: true,
      matrix: {
        id: matrix.id,
        category: matrix.category,
        columns: JSON.parse(matrix.columns),
        rows: JSON.parse(matrix.rows),
        sourceDocumentName: matrix.sourceDocumentName,
        sourceDocumentUrl: matrix.sourceDocumentUrl,
        sourceDocumentFormat: matrix.sourceDocumentFormat,
        extractionConfidence: matrix.extractionConfidence ? JSON.parse(matrix.extractionConfidence) : null,
        version: matrix.version,
        status: matrix.status,
      }
    });
  } catch (error: any) {
    console.error('Fetch matrix error:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison matrix' }, { status: 500 });
  }
}

// POST endpoint simulates a document parsing job (with Document AI table detection extraction)
export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file || !category) {
      return NextResponse.json({ error: 'Missing file or category parameter' }, { status: 400 });
    }

    // Determine format
    const ext = file.name.split('.').pop()?.toLowerCase() || 'xlsx';
    
    // Simulate table extraction from file with typical spelling noise and confidence ratios
    let parsedColumns: { fieldKey: string; label: string }[] = [];
    let parsedRows: any[] = [];
    let confidenceMap: Record<string, number> = {};

    if (category === 'plywood') {
      parsedColumns = [
        { fieldKey: 'grade', label: 'Grade' },
        { fieldKey: 'thickness', label: 'Thkness (mm)' }, // Typo to trigger fuzzy-match mapping
        { fieldKey: 'waterResistance', label: 'Boilin Water' }, // Typo
        { fieldKey: 'idealUse', label: 'Ideal Use' },
        { fieldKey: 'emission', label: 'Emission Level' },
      ];

      parsedRows = [
        {
          productId: 'mr-grade',
          values: {
            grade: 'MR Grade',
            thickness: '6mm - 19mm',
            waterResistance: 'Moisture Res.',
            idealUse: 'Office furniture, panelling',
            emission: 'E1 Cert',
          }
        },
        {
          productId: 'marine-grade-advanced',
          values: {
            grade: 'Marine IS 710',
            thickness: '12mm - 25mm',
            waterResistance: 'Bailing Proof', // Typo to enforce low confidence flag
            idealUse: 'Boat building, structural decks',
            emission: 'E0 Certified',
          }
        }
      ];

      // Confidence scores (1.0 = perfect, < 0.8 = low confidence highlighting)
      confidenceMap = {
        '0-grade': 0.95,
        '0-thickness': 0.72, // low confidence
        '0-waterResistance': 0.85,
        '0-idealUse': 0.98,
        '0-emission': 0.78, // low confidence
        '1-grade': 0.94,
        '1-thickness': 0.92,
        '1-waterResistance': 0.45, // extremely low confidence due to typo
        '1-idealUse': 0.97,
        '1-emission': 0.99,
      };
    } else {
      // Default laminates or fallback category layout
      parsedColumns = [
        { fieldKey: 'finishType', label: 'Surface Type' },
        { fieldKey: 'thickness', label: 'Thk' },
        { fieldKey: 'scratchResistance', label: 'Scratch Res.' },
        { fieldKey: 'recommendedSubstrate', label: 'Substrate' },
      ];

      parsedRows = [
        {
          productId: 'matte-hpl',
          values: {
            finishType: 'Matte Finish',
            thickness: '1.0 mm',
            scratchResistance: 'High (3N rating)',
            recommendedSubstrate: 'Plywood Core',
          }
        },
        {
          productId: 'gloss-hpl',
          values: {
            finishType: 'Mirror Gless', // Typo
            thickness: '1.2 mm',
            scratchResistance: 'Moderate',
            recommendedSubstrate: 'MDF/Plywood',
          }
        }
      ];

      confidenceMap = {
        '0-finishType': 0.98,
        '0-thickness': 0.75,
        '0-scratchResistance': 0.92,
        '0-recommendedSubstrate': 0.94,
        '1-finishType': 0.61, // low confidence
        '1-thickness': 0.96,
        '1-scratchResistance': 0.88,
        '1-recommendedSubstrate': 0.81,
      };
    }

    // Normalization / Fuzzy mapping step
    const categoryDict = FUZZY_DICTIONARY[category] || {};
    const normalizedColumns = parsedColumns.map((col) => {
      const lowerLabel = col.label.toLowerCase();
      let matchedKey = col.fieldKey;
      
      // Look up in fuzzy mapping dictionary
      for (const [variant, targetKey] of Object.entries(categoryDict)) {
        if (lowerLabel.includes(variant)) {
          matchedKey = targetKey;
          break;
        }
      }

      return {
        fieldKey: matchedKey,
        label: col.label,
      };
    });

    const isOnline = await isDbOnline();
    let matrix: ComparisonMatrix;

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.matrices.findIndex((m) => m.category === category);
      const currentVersion = idx !== -1 ? db.matrices[idx].version : 0;

      matrix = {
        id: idx !== -1 ? db.matrices[idx].id : `matrix-${category}`,
        category,
        columns: normalizedColumns,
        rows: parsedRows,
        sourceDocumentName: file.name,
        sourceDocumentUrl: `/uploads/${file.name}`,
        sourceDocumentFormat: ext,
        extractionConfidence: confidenceMap,
        version: currentVersion + 1,
        status: 'draft',
      };

      if (idx !== -1) {
        db.matrices[idx] = matrix;
      } else {
        db.matrices.push(matrix);
      }
      writeVisualizerDb(db);
    } else {
      const existing = await prisma.comparisonMatrix.findUnique({
        where: { category }
      });
      const currentVersion = existing ? existing.version : 0;

      const updated = await prisma.comparisonMatrix.upsert({
        where: { category },
        create: {
          category,
          columns: JSON.stringify(normalizedColumns),
          rows: JSON.stringify(parsedRows),
          sourceDocumentName: file.name,
          sourceDocumentUrl: `/uploads/${file.name}`,
          sourceDocumentFormat: ext,
          extractionConfidence: JSON.stringify(confidenceMap),
          version: currentVersion + 1,
          status: 'draft',
        },
        update: {
          columns: JSON.stringify(normalizedColumns),
          rows: JSON.stringify(parsedRows),
          sourceDocumentName: file.name,
          sourceDocumentUrl: `/uploads/${file.name}`,
          sourceDocumentFormat: ext,
          extractionConfidence: JSON.stringify(confidenceMap),
          version: currentVersion + 1,
          status: 'draft',
        }
      });

      matrix = {
        id: updated.id,
        category: updated.category,
        columns: normalizedColumns,
        rows: parsedRows,
        sourceDocumentName: file.name,
        sourceDocumentUrl: `/uploads/${file.name}`,
        sourceDocumentFormat: ext,
        extractionConfidence: confidenceMap,
        version: updated.version,
        status: updated.status as 'draft' | 'published',
      };
    }

    return NextResponse.json({ success: true, matrix });
  } catch (error: any) {
    console.error('Matrix extraction upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process matrix extraction' }, { status: 500 });
  }
}

// PUT endpoint saves edits or changes status from draft to published
export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, columns, rows, extractionConfidence, status } = body;

    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();
    let updatedMatrix: ComparisonMatrix;

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.matrices.findIndex((m) => m.category === category);
      if (idx === -1) {
        return NextResponse.json({ error: 'Matrix draft not found' }, { status: 404 });
      }

      updatedMatrix = {
        ...db.matrices[idx],
        columns: columns !== undefined ? columns : db.matrices[idx].columns,
        rows: rows !== undefined ? rows : db.matrices[idx].rows,
        extractionConfidence: extractionConfidence !== undefined ? extractionConfidence : db.matrices[idx].extractionConfidence,
        status: status !== undefined ? status : db.matrices[idx].status,
      };

      db.matrices[idx] = updatedMatrix;
      writeVisualizerDb(db);
    } else {
      const data: any = {};
      if (columns !== undefined) data.columns = JSON.stringify(columns);
      if (rows !== undefined) data.rows = JSON.stringify(rows);
      if (extractionConfidence !== undefined) data.extractionConfidence = JSON.stringify(extractionConfidence);
      if (status !== undefined) data.status = status;

      const updated = await prisma.comparisonMatrix.update({
        where: { category },
        data,
      });

      updatedMatrix = {
        id: updated.id,
        category: updated.category,
        columns: JSON.parse(updated.columns),
        rows: JSON.parse(updated.rows),
        sourceDocumentName: updated.sourceDocumentName,
        sourceDocumentUrl: updated.sourceDocumentUrl,
        sourceDocumentFormat: updated.sourceDocumentFormat,
        extractionConfidence: updated.extractionConfidence ? JSON.parse(updated.extractionConfidence) : null,
        version: updated.version,
        status: updated.status as 'draft' | 'published',
      };
    }

    return NextResponse.json({ success: true, matrix: updatedMatrix });
  } catch (error: any) {
    console.error('Update matrix error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update comparison matrix' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      db.matrices = db.matrices.filter((m) => m.category !== category);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true });
    }

    await prisma.comparisonMatrix.delete({
      where: { category },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete matrix error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete matrix' }, { status: 500 });
  }
}
