import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';

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
      return NextResponse.json({ success: true, categories: db.categories });
    }

    const categories = await prisma.finishCategory.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, displayOrder, defaultEdgeStyle, defaultRoughness, defaultMetalness, deckImage, tagline, description, metaLine } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        slug,
        displayOrder: displayOrder || 0,
        defaultEdgeStyle: defaultEdgeStyle || 'flatSolid',
        defaultRoughness: defaultRoughness !== undefined ? defaultRoughness : 0.5,
        defaultMetalness: defaultMetalness !== undefined ? defaultMetalness : 0.0,
        deckImage: deckImage || null,
        tagline: tagline || null,
        description: description || null,
        metaLine: metaLine || null,
      };

      db.categories.push(newCategory);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, category: newCategory });
    }

    const category = await prisma.finishCategory.create({
      data: {
        name,
        slug,
        displayOrder: displayOrder || 0,
        defaultEdgeStyle: defaultEdgeStyle || 'flatSolid',
        defaultRoughness: defaultRoughness !== undefined ? defaultRoughness : 0.5,
        defaultMetalness: defaultMetalness !== undefined ? defaultMetalness : 0.0,
        deckImage: deckImage || null,
        tagline: tagline || null,
        description: description || null,
        metaLine: metaLine || null,
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, displayOrder, defaultEdgeStyle, defaultRoughness, defaultMetalness, deckImage, tagline, description, metaLine } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.categories.findIndex((c) => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      const updatedCategory = {
        ...db.categories[idx],
        name: name !== undefined ? name : db.categories[idx].name,
        slug: name !== undefined ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : db.categories[idx].slug,
        displayOrder: displayOrder !== undefined ? displayOrder : db.categories[idx].displayOrder,
        defaultEdgeStyle: defaultEdgeStyle !== undefined ? defaultEdgeStyle : db.categories[idx].defaultEdgeStyle,
        defaultRoughness: defaultRoughness !== undefined ? defaultRoughness : db.categories[idx].defaultRoughness,
        defaultMetalness: defaultMetalness !== undefined ? defaultMetalness : db.categories[idx].defaultMetalness,
        deckImage: deckImage !== undefined ? deckImage : db.categories[idx].deckImage,
        tagline: tagline !== undefined ? tagline : db.categories[idx].tagline,
        description: description !== undefined ? description : db.categories[idx].description,
        metaLine: metaLine !== undefined ? metaLine : db.categories[idx].metaLine,
      };

      db.categories[idx] = updatedCategory;
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, category: updatedCategory });
    }

    const data: any = {};
    if (name) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (displayOrder !== undefined) data.displayOrder = displayOrder;
    if (defaultEdgeStyle !== undefined) data.defaultEdgeStyle = defaultEdgeStyle;
    if (defaultRoughness !== undefined) data.defaultRoughness = defaultRoughness;
    if (defaultMetalness !== undefined) data.defaultMetalness = defaultMetalness;
    if (deckImage !== undefined) data.deckImage = deckImage;
    if (tagline !== undefined) data.tagline = tagline;
    if (description !== undefined) data.description = description;
    if (metaLine !== undefined) data.metaLine = metaLine;

    const category = await prisma.finishCategory.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      db.categories = db.categories.filter((c) => c.id !== id);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true });
    }

    await prisma.finishCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
