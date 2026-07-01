import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';

function hasWriteAccess(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get('sitka_session');
  if (!sessionCookie || !sessionCookie.value) return false;
  const session = decryptSession(sessionCookie.value);
  if (!session) return false;
  return session.role === 'ADMIN' || session.role === 'EDITOR';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vertical = searchParams.get('vertical');
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
      });
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      return NextResponse.json({ success: true, product });
    }

    const whereClause: any = {};
    if (vertical) {
      whereClause.vertical = vertical.toUpperCase();
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, vertical, category, description, specs, swatches, applications, tags, isFeatured } = body;

    if (!name || !vertical || !category || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auto-generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Product name must be unique' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        vertical: vertical.toUpperCase(),
        category,
        description,
        specs: typeof specs === 'string' ? specs : JSON.stringify(specs || {}),
        swatches: typeof swatches === 'string' ? swatches : JSON.stringify(swatches || []),
        applications: typeof applications === 'string' ? applications : (applications || []).join(', '),
        tags: typeof tags === 'string' ? tags : (tags || []).join(', '),
        isFeatured: !!isFeatured,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, vertical, category, description, specs, swatches, applications, tags, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (name) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (vertical) data.vertical = vertical.toUpperCase();
    if (category) data.category = category;
    if (description) data.description = description;
    if (specs !== undefined) data.specs = typeof specs === 'string' ? specs : JSON.stringify(specs);
    if (swatches !== undefined) data.swatches = typeof swatches === 'string' ? swatches : JSON.stringify(swatches);
    if (applications !== undefined) data.applications = typeof applications === 'string' ? applications : applications.join(', ');
    if (tags !== undefined) data.tags = typeof tags === 'string' ? tags : tags.join(', ');
    if (isFeatured !== undefined) data.isFeatured = !!isFeatured;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
