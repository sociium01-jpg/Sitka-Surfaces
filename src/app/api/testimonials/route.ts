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
    const all = searchParams.get('all') === 'true';

    const where: any = {};
    if (!all) {
      where.approved = true;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    console.error('Fetch testimonials error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { quote, name, role, company, vertical, persona, approved, order } = body;

    if (!quote || !name || !role || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        quote,
        name,
        role,
        company,
        vertical: vertical || 'General',
        persona: persona || 'Other',
        approved: approved !== undefined ? !!approved : true,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error: any) {
    console.error('Create testimonial error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, quote, name, role, company, vertical, persona, approved, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (quote) data.quote = quote;
    if (name) data.name = name;
    if (role) data.role = role;
    if (company) data.company = company;
    if (vertical) data.vertical = vertical;
    if (persona) data.persona = persona;
    if (approved !== undefined) data.approved = !!approved;
    if (order !== undefined) data.order = parseInt(order);

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    console.error('Update testimonial error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update testimonial' }, { status: 500 });
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
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 });
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete testimonial' }, { status: 500 });
  }
}
