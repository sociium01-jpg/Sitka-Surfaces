import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';
import { HubPageSectionConfig } from '@/types/visualizer';

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
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      if (category) {
        let config = db.hubConfigs.find((c) => c.category === category);
        if (!config) {
          config = {
            id: `config-${category}`,
            category,
            sectionOrder: ['swatches', 'catalogue', 'matrix', 'faqs'],
            visibility: { swatches: true, catalogue: true, matrix: true, faqs: true },
          };
        }
        return NextResponse.json({ success: true, config });
      }
      return NextResponse.json({ success: true, configs: db.hubConfigs });
    }

    if (category) {
      let config = await prisma.hubPageSectionConfig.findUnique({
        where: { category }
      });
      if (!config) {
        // Return default layout configuration
        return NextResponse.json({
          success: true,
          config: {
            category,
            sectionOrder: ['swatches', 'catalogue', 'matrix', 'faqs'],
            visibility: { swatches: true, catalogue: true, matrix: true, faqs: true }
          }
        });
      }
      return NextResponse.json({
        success: true,
        config: {
          id: config.id,
          category: config.category,
          sectionOrder: JSON.parse(config.sectionOrder),
          visibility: JSON.parse(config.visibility)
        }
      });
    }

    const configs = await prisma.hubPageSectionConfig.findMany();
    const mapped = configs.map((c) => ({
      id: c.id,
      category: c.category,
      sectionOrder: JSON.parse(c.sectionOrder),
      visibility: JSON.parse(c.visibility)
    }));

    return NextResponse.json({ success: true, configs: mapped });
  } catch (error: any) {
    console.error('Fetch hub config error:', error);
    return NextResponse.json({ error: 'Failed to fetch hub configurations' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, sectionOrder, visibility } = body;

    if (!category || !sectionOrder || !visibility) {
      return NextResponse.json({ error: 'Missing required configuration parameters' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.hubConfigs.findIndex((c) => c.category === category);
      const updated: HubPageSectionConfig = {
        id: idx !== -1 ? db.hubConfigs[idx].id : `config-${category}`,
        category,
        sectionOrder,
        visibility,
      };

      if (idx !== -1) {
        db.hubConfigs[idx] = updated;
      } else {
        db.hubConfigs.push(updated);
      }
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, config: updated });
    }

    const config = await prisma.hubPageSectionConfig.upsert({
      where: { category },
      create: {
        category,
        sectionOrder: JSON.stringify(sectionOrder),
        visibility: JSON.stringify(visibility)
      },
      update: {
        sectionOrder: JSON.stringify(sectionOrder),
        visibility: JSON.stringify(visibility)
      }
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        category: config.category,
        sectionOrder: JSON.parse(config.sectionOrder),
        visibility: JSON.parse(config.visibility)
      }
    });
  } catch (error: any) {
    console.error('Update hub config error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update hub configuration' }, { status: 500 });
  }
}
