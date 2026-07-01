import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';
import { VisualizerScene, VisualizerZone } from '@/types/visualizer';

function hasWriteAccess(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get('sitka_session');
  if (!sessionCookie || !sessionCookie.value) return false;
  const session = decryptSession(sessionCookie.value);
  if (!session) return false;
  return session.role === 'ADMIN' || session.role === 'EDITOR';
}

// Check database connectivity
async function isDbOnline(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// GET: Fetch all scenes
export async function GET(req: NextRequest) {
  try {
    const isOnline = await isDbOnline();
    if (!isOnline) {
      const db = readVisualizerDb();
      return NextResponse.json({ success: true, scenes: db.scenes });
    }

    const dbScenes = await prisma.visualizerScene.findMany({
      include: {
        zones: {
          include: {
            defaultFinish: {
              include: {
                category: true
              }
            }
          },
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    // Remap prisma shape to frontend contract
    const scenes: VisualizerScene[] = dbScenes.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      roomImage: s.roomImage,
      naturalWidth: s.naturalWidth,
      naturalHeight: s.naturalHeight,
      status: s.status as 'DRAFT' | 'PUBLISHED',
      displayOrder: s.displayOrder,
      whereShown: JSON.parse(s.whereShown || '[]'),
      overlaySettings: JSON.parse(s.overlaySettings || '{}'),
      zones: s.zones.map((z) => ({
        id: z.id,
        label: z.label,
        mask: z.mask,
        shadingLayer: z.shadingLayer,
        corners: JSON.parse(z.corners || '[]'),
        widthCm: z.widthCm ?? undefined,
        heightCm: z.heightCm ?? undefined,
        allowedCategories: JSON.parse(z.allowedCategories || '[]'),
        displayOrder: z.displayOrder,
        defaultFinish: z.defaultFinish ? {
          id: z.defaultFinish.id,
          name: z.defaultFinish.name,
          sku: z.defaultFinish.sku,
          specLine: z.defaultFinish.specLine,
          category: z.defaultFinish.category.name,
          thumbnailImage: z.defaultFinish.thumbnailImage,
          tileableTexture: z.defaultFinish.tileableTexture,
          tileWidthCm: z.defaultFinish.tileWidthCm ?? undefined,
          tileHeightCm: z.defaultFinish.tileHeightCm ?? undefined,
          color: z.defaultFinish.color ?? undefined,
          pbrMaps: z.defaultFinish.pbrMaps ? JSON.parse(z.defaultFinish.pbrMaps) : undefined,
          materialType: z.defaultFinish.materialType as any,
          tags: JSON.parse(z.defaultFinish.tags || '[]')
        } : (null as any)
      }))
    }));

    return NextResponse.json({ success: true, scenes });
  } catch (error: any) {
    console.error('Fetch scenes error:', error);
    return NextResponse.json({ error: 'Failed to fetch scenes' }, { status: 500 });
  }
}

// POST: Create a scene
export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, roomImage, naturalWidth, naturalHeight, status, displayOrder, whereShown, overlaySettings, zones } = body;

    if (!name || !roomImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const newScene: VisualizerScene = {
        id: `scene-${Date.now()}`,
        name,
        slug,
        roomImage,
        naturalWidth: naturalWidth || 1024,
        naturalHeight: naturalHeight || 1024,
        status: status || 'DRAFT',
        displayOrder: displayOrder || 0,
        whereShown: whereShown || [],
        overlaySettings: overlaySettings || { opacity: 0.75 },
        zones: zones || [],
      };

      db.scenes.push(newScene);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, scene: newScene });
    }

    // Prisma implementation
    const scene = await prisma.visualizerScene.create({
      data: {
        name,
        slug,
        roomImage,
        naturalWidth: naturalWidth || 1024,
        naturalHeight: naturalHeight || 1024,
        status: status || 'DRAFT',
        displayOrder: displayOrder || 0,
        whereShown: JSON.stringify(whereShown || []),
        overlaySettings: JSON.stringify(overlaySettings || { opacity: 0.75 }),
      }
    });

    return NextResponse.json({ success: true, scene });
  } catch (error: any) {
    console.error('Create scene error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create scene' }, { status: 500 });
  }
}

// PUT: Update a scene or its zones
export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, roomImage, naturalWidth, naturalHeight, status, displayOrder, whereShown, overlaySettings, zones } = body;

    if (!id) {
      return NextResponse.json({ error: 'Scene ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.scenes.findIndex((s) => s.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
      }

      const updatedScene: VisualizerScene = {
        ...db.scenes[idx],
        name: name !== undefined ? name : db.scenes[idx].name,
        slug: name !== undefined ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : db.scenes[idx].slug,
        roomImage: roomImage !== undefined ? roomImage : db.scenes[idx].roomImage,
        naturalWidth: naturalWidth !== undefined ? naturalWidth : db.scenes[idx].naturalWidth,
        naturalHeight: naturalHeight !== undefined ? naturalHeight : db.scenes[idx].naturalHeight,
        status: status !== undefined ? status : db.scenes[idx].status,
        displayOrder: displayOrder !== undefined ? displayOrder : db.scenes[idx].displayOrder,
        whereShown: whereShown !== undefined ? whereShown : db.scenes[idx].whereShown,
        overlaySettings: overlaySettings !== undefined ? overlaySettings : db.scenes[idx].overlaySettings,
        zones: zones !== undefined ? zones : db.scenes[idx].zones,
      };

      db.scenes[idx] = updatedScene;
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, scene: updatedScene });
    }

    // Prisma implementation:
    const data: any = {};
    if (name) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (roomImage) data.roomImage = roomImage;
    if (naturalWidth !== undefined) data.naturalWidth = naturalWidth;
    if (naturalHeight !== undefined) data.naturalHeight = naturalHeight;
    if (status) data.status = status;
    if (displayOrder !== undefined) data.displayOrder = displayOrder;
    if (whereShown) data.whereShown = JSON.stringify(whereShown);
    if (overlaySettings) data.overlaySettings = JSON.stringify(overlaySettings);

    const scene = await prisma.visualizerScene.update({
      where: { id },
      data,
    });

    // If zones are provided, perform bulk sync
    if (zones && Array.isArray(zones)) {
      // Delete old zones
      await prisma.visualizerZone.deleteMany({
        where: { sceneId: id }
      });

      // Insert new zones
      for (const zone of zones) {
        // Find default finish id
        let defaultFinishId: string | null = null;
        if (zone.defaultFinish) {
          const fin = await prisma.finish.findFirst({
            where: { sku: zone.defaultFinish.sku }
          });
          if (fin) defaultFinishId = fin.id;
        }

        await prisma.visualizerZone.create({
          data: {
            id: zone.id,
            sceneId: id,
            label: zone.label,
            mask: zone.mask || null,
            shadingLayer: zone.shadingLayer || null,
            corners: JSON.stringify(zone.corners),
            allowedCategories: JSON.stringify(zone.allowedCategories),
            defaultFinishId,
            widthCm: zone.widthCm || null,
            heightCm: zone.heightCm || null,
            displayOrder: zone.displayOrder || 0,
          }
        });
      }
    }

    return NextResponse.json({ success: true, scene });
  } catch (error: any) {
    console.error('Update scene error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update scene' }, { status: 500 });
  }
}

// DELETE: Delete a scene
export async function DELETE(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Scene ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      db.scenes = db.scenes.filter((s) => s.id !== id);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true });
    }

    await prisma.visualizerScene.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete scene error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete scene' }, { status: 500 });
  }
}
