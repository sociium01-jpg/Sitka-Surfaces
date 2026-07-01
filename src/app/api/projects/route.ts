import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';
import { Project } from '@/types/visualizer';

let prisma: any = null;
try {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
} catch (e) {
  console.warn('Prisma client initialization bypassed, using JSON storage');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  try {
    if (prisma) {
      if (slug) {
        const project = await prisma.project.findUnique({
          where: { slug },
        });
        if (!project) {
          return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          project: {
            ...project,
            verticals: JSON.parse(project.verticals),
            spaceTypes: JSON.parse(project.spaceTypes),
            blocks: JSON.parse(project.blocks),
          },
        });
      }

      const dbProjects = await prisma.project.findMany({
        orderBy: { homepageOrder: 'asc' },
      });
      const projects = dbProjects.map((p: any) => ({
        ...p,
        verticals: JSON.parse(p.verticals),
        spaceTypes: JSON.parse(p.spaceTypes),
        blocks: JSON.parse(p.blocks),
      }));

      // Retrieve default spaceTypes
      const spaceTypes = [
        { id: 'kitchen', name: 'Kitchen' },
        { id: 'office', name: 'Office' },
        { id: 'hospitality', name: 'Hospitality' },
        { id: 'living', name: 'Living' },
        { id: 'retail', name: 'Retail' },
        { id: 'facade', name: 'Facade' },
      ];

      return NextResponse.json({ success: true, projects, spaceTypes });
    }
  } catch (err) {
    console.error('PostgreSQL Projects query failed, falling back:', err);
  }

  // File system fallback
  const db = readVisualizerDb();
  if (slug) {
    const project = db.projects.find((p) => p.slug === slug);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  }

  return NextResponse.json({
    success: true,
    projects: db.projects || [],
    spaceTypes: db.spaceTypes || [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, status, verticals, spaceTypes, featuredOnHomepage, homepageOrder, blocks } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      slug,
      status: status || 'draft',
      verticals: verticals || [],
      spaceTypes: spaceTypes || [],
      featuredOnHomepage: !!featuredOnHomepage,
      homepageOrder: homepageOrder || 0,
      blocks: blocks || [],
    };

    try {
      if (prisma) {
        const created = await prisma.project.create({
          data: {
            name: newProject.name,
            slug: newProject.slug,
            status: newProject.status,
            verticals: JSON.stringify(newProject.verticals),
            spaceTypes: JSON.stringify(newProject.spaceTypes),
            featuredOnHomepage: newProject.featuredOnHomepage,
            homepageOrder: newProject.homepageOrder,
            blocks: JSON.stringify(newProject.blocks),
          },
        });
        return NextResponse.json({
          success: true,
          project: {
            ...created,
            verticals: JSON.parse(created.verticals),
            spaceTypes: JSON.parse(created.spaceTypes),
            blocks: JSON.parse(created.blocks),
          },
        });
      }
    } catch (dbErr: any) {
      if (dbErr.code === 'P2002') {
        return NextResponse.json({ success: false, error: 'A project with this slug already exists' }, { status: 400 });
      }
      throw dbErr;
    }

    // Fallback JSON File
    const db = readVisualizerDb();
    if (db.projects.some((p) => p.slug === slug)) {
      return NextResponse.json({ success: false, error: 'A project with this slug already exists' }, { status: 400 });
    }
    db.projects.push(newProject);
    writeVisualizerDb(db);

    return NextResponse.json({ success: true, project: newProject });
  } catch (err: any) {
    console.error('Failed to create project:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, status, verticals, spaceTypes, featuredOnHomepage, homepageOrder, blocks } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    try {
      if (prisma) {
        const updated = await prisma.project.update({
          where: { id },
          data: {
            name,
            slug,
            status,
            verticals: verticals ? JSON.stringify(verticals) : undefined,
            spaceTypes: spaceTypes ? JSON.stringify(spaceTypes) : undefined,
            featuredOnHomepage,
            homepageOrder,
            blocks: blocks ? JSON.stringify(blocks) : undefined,
          },
        });
        return NextResponse.json({
          success: true,
          project: {
            ...updated,
            verticals: JSON.parse(updated.verticals),
            spaceTypes: JSON.parse(updated.spaceTypes),
            blocks: JSON.parse(updated.blocks),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma Project update failed, falling back:', dbErr);
    }

    // Fallback JSON File
    const db = readVisualizerDb();
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const current = db.projects[idx];
    const updatedProject: Project = {
      ...current,
      name: name !== undefined ? name : current.name,
      slug: slug !== undefined ? slug : current.slug,
      status: status !== undefined ? status : current.status,
      verticals: verticals !== undefined ? verticals : current.verticals,
      spaceTypes: spaceTypes !== undefined ? spaceTypes : current.spaceTypes,
      featuredOnHomepage: featuredOnHomepage !== undefined ? !!featuredOnHomepage : current.featuredOnHomepage,
      homepageOrder: homepageOrder !== undefined ? homepageOrder : current.homepageOrder,
      blocks: blocks !== undefined ? blocks : current.blocks,
    };

    db.projects[idx] = updatedProject;
    writeVisualizerDb(db);

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (err: any) {
    console.error('Failed to update project:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    try {
      if (prisma) {
        await prisma.project.delete({
          where: { id },
        });
        return NextResponse.json({ success: true });
      }
    } catch (dbErr) {
      console.warn('Prisma Project delete failed, falling back:', dbErr);
    }

    const db = readVisualizerDb();
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    db.projects.splice(idx, 1);
    writeVisualizerDb(db);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete project:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
