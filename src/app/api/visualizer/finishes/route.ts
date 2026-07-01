import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';
import { Finish } from '@/types/visualizer';

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

export async function GET(req: NextRequest) {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      const db = readVisualizerDb();
      return NextResponse.json({ success: true, finishes: db.finishes });
    }

    const dbFinishes = await prisma.finish.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    const finishes: Finish[] = dbFinishes.map((f) => ({
      id: f.id,
      name: f.name,
      sku: f.sku,
      specLine: f.specLine,
      category: f.category.name,
      thumbnailImage: f.thumbnailImage,
      tileableTexture: f.tileableTexture,
      tileWidthCm: f.tileWidthCm ?? undefined,
      tileHeightCm: f.tileHeightCm ?? undefined,
      color: f.color ?? undefined,
      pbrMaps: f.pbrMaps ? JSON.parse(f.pbrMaps) : undefined,
      materialType: f.materialType as any,
      tags: JSON.parse(f.tags || '[]'),
      modelType: f.modelType as any,
      modelAsset: f.modelAsset ?? undefined,
      autoNormalMap: f.autoNormalMap ?? undefined,
      realWidthMm: f.realWidthMm ?? undefined,
      realHeightMm: f.realHeightMm ?? undefined,
      realThicknessMm: f.realThicknessMm ?? undefined,
      roughness: f.roughness ?? undefined,
      metalness: f.metalness ?? undefined,
      edgeStyle: f.category.defaultEdgeStyle as any, // inherits from category
    }));

    return NextResponse.json({ success: true, finishes });
  } catch (error: any) {
    console.error('Fetch finishes error:', error);
    return NextResponse.json({ error: 'Failed to fetch finishes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, sku, specLine, category, thumbnailImage, tileableTexture, tileWidthCm, tileHeightCm, color, pbrMaps, materialType, tags, status, modelType, modelAsset, autoNormalMap, realWidthMm, realHeightMm, realThicknessMm, roughness, metalness, edgeStyle } = body;

    if (!name || !sku || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const newFinish: Finish = {
        id: `finish-${Date.now()}`,
        name,
        sku,
        specLine: specLine || '',
        category,
        thumbnailImage: thumbnailImage || '',
        tileableTexture: tileableTexture || '',
        tileWidthCm: tileWidthCm || undefined,
        tileHeightCm: tileHeightCm || undefined,
        color: color || undefined,
        pbrMaps: pbrMaps || undefined,
        materialType: materialType || 'matte',
        tags: tags || [],
        modelType: modelType || 'generated',
        modelAsset: modelAsset || undefined,
        autoNormalMap: autoNormalMap || undefined,
        realWidthMm: realWidthMm || 1220,
        realHeightMm: realHeightMm || 2440,
        realThicknessMm: realThicknessMm || 18,
        roughness: roughness || undefined,
        metalness: metalness || undefined,
        edgeStyle: edgeStyle || undefined,
      };

      db.finishes.push(newFinish);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, finish: newFinish });
    }

    // Find category from db or create
    let cat = await prisma.finishCategory.findFirst({
      where: { name: { equals: category, mode: 'insensitive' } }
    });
    if (!cat) {
      cat = await prisma.finishCategory.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        }
      });
    }

    const finish = await prisma.finish.create({
      data: {
        name,
        sku,
        specLine: specLine || '',
        categoryId: cat.id,
        status: status || 'ACTIVE',
        thumbnailImage: thumbnailImage || '',
        tileableTexture: tileableTexture || '',
        pbrMaps: pbrMaps ? JSON.stringify(pbrMaps) : null,
        materialType: materialType || 'matte',
        tags: JSON.stringify(tags || []),
        color: color || null,
        tileWidthCm: tileWidthCm || null,
        tileHeightCm: tileHeightCm || null,
        modelType: modelType || 'generated',
        modelAsset: modelAsset || null,
        autoNormalMap: autoNormalMap || null,
        realWidthMm: realWidthMm || 1220,
        realHeightMm: realHeightMm || 2440,
        realThicknessMm: realThicknessMm || 18,
        roughness: roughness !== undefined ? roughness : null,
        metalness: metalness !== undefined ? metalness : null,
      }
    });

    return NextResponse.json({ success: true, finish });
  } catch (error: any) {
    console.error('Create finish error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create finish' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, sku, specLine, category, thumbnailImage, tileableTexture, tileWidthCm, tileHeightCm, color, pbrMaps, materialType, tags, status, modelType, modelAsset, autoNormalMap, realWidthMm, realHeightMm, realThicknessMm, roughness, metalness, edgeStyle } = body;

    if (!id) {
      return NextResponse.json({ error: 'Finish ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.finishes.findIndex((f) => f.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Finish not found' }, { status: 404 });
      }

      const updatedFinish: Finish = {
        ...db.finishes[idx],
        name: name !== undefined ? name : db.finishes[idx].name,
        sku: sku !== undefined ? sku : db.finishes[idx].sku,
        specLine: specLine !== undefined ? specLine : db.finishes[idx].specLine,
        category: category !== undefined ? category : db.finishes[idx].category,
        thumbnailImage: thumbnailImage !== undefined ? thumbnailImage : db.finishes[idx].thumbnailImage,
        tileableTexture: tileableTexture !== undefined ? tileableTexture : db.finishes[idx].tileableTexture,
        tileWidthCm: tileWidthCm !== undefined ? tileWidthCm : db.finishes[idx].tileWidthCm,
        tileHeightCm: tileHeightCm !== undefined ? tileHeightCm : db.finishes[idx].tileHeightCm,
        color: color !== undefined ? color : db.finishes[idx].color,
        pbrMaps: pbrMaps !== undefined ? pbrMaps : db.finishes[idx].pbrMaps,
        materialType: materialType !== undefined ? materialType : db.finishes[idx].materialType,
        tags: tags !== undefined ? tags : db.finishes[idx].tags,
        modelType: modelType !== undefined ? modelType : db.finishes[idx].modelType,
        modelAsset: modelAsset !== undefined ? modelAsset : db.finishes[idx].modelAsset,
        autoNormalMap: autoNormalMap !== undefined ? autoNormalMap : db.finishes[idx].autoNormalMap,
        realWidthMm: realWidthMm !== undefined ? realWidthMm : db.finishes[idx].realWidthMm,
        realHeightMm: realHeightMm !== undefined ? realHeightMm : db.finishes[idx].realHeightMm,
        realThicknessMm: realThicknessMm !== undefined ? realThicknessMm : db.finishes[idx].realThicknessMm,
        roughness: roughness !== undefined ? roughness : db.finishes[idx].roughness,
        metalness: metalness !== undefined ? metalness : db.finishes[idx].metalness,
        edgeStyle: edgeStyle !== undefined ? edgeStyle : db.finishes[idx].edgeStyle,
      };

      db.finishes[idx] = updatedFinish;
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, finish: updatedFinish });
    }

    const data: any = {};
    if (name) data.name = name;
    if (sku) data.sku = sku;
    if (specLine) data.specLine = specLine;
    if (thumbnailImage) data.thumbnailImage = thumbnailImage;
    if (tileableTexture) data.tileableTexture = tileableTexture;
    if (tileWidthCm !== undefined) data.tileWidthCm = tileWidthCm;
    if (tileHeightCm !== undefined) data.tileHeightCm = tileHeightCm;
    if (color !== undefined) data.color = color;
    if (pbrMaps) data.pbrMaps = JSON.stringify(pbrMaps);
    if (materialType) data.materialType = materialType;
    if (tags) data.tags = JSON.stringify(tags);
    if (status) data.status = status;
    if (modelType) data.modelType = modelType;
    if (modelAsset !== undefined) data.modelAsset = modelAsset;
    if (autoNormalMap !== undefined) data.autoNormalMap = autoNormalMap;
    if (realWidthMm !== undefined) data.realWidthMm = realWidthMm;
    if (realHeightMm !== undefined) data.realHeightMm = realHeightMm;
    if (realThicknessMm !== undefined) data.realThicknessMm = realThicknessMm;
    if (roughness !== undefined) data.roughness = roughness;
    if (metalness !== undefined) data.metalness = metalness;

    if (category) {
      let cat = await prisma.finishCategory.findFirst({
        where: { name: { equals: category, mode: 'insensitive' } }
      });
      if (!cat) {
        cat = await prisma.finishCategory.create({
          data: {
            name: category,
            slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          }
        });
      }
      data.categoryId = cat.id;
    }

    const finish = await prisma.finish.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, finish });
  } catch (error: any) {
    console.error('Update finish error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update finish' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Finish ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      db.finishes = db.finishes.filter((f) => f.id !== id);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true });
    }

    await prisma.finish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete finish error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete finish' }, { status: 500 });
  }
}
