import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { readVisualizerDb, writeVisualizerDb } from '@/lib/visualizerStorage';
import { FAQ } from '@/types/visualizer';

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
      let list = db.faqs;
      if (category) {
        list = list.filter((f) => f.category === category);
      }
      list.sort((a, b) => a.displayOrder - b.displayOrder);
      return NextResponse.json({ success: true, faqs: list });
    }

    const whereClause: any = {};
    if (category) {
      whereClause.category = category;
    }

    const faqs = await prisma.fAQ.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ success: true, faqs });
  } catch (error: any) {
    console.error('Fetch FAQs error:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, question, answer, displayOrder } = body;

    if (!category || !question || !answer) {
      return NextResponse.json({ error: 'Missing required FAQ fields' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const newFaq: FAQ = {
        id: `faq-${Date.now()}`,
        category,
        question,
        answer,
        displayOrder: displayOrder || 0,
      };
      db.faqs.push(newFaq);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, faq: newFaq });
    }

    const faq = await prisma.fAQ.create({
      data: {
        category,
        question,
        answer,
        displayOrder: displayOrder || 0,
      },
    });

    return NextResponse.json({ success: true, faq });
  } catch (error: any) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create FAQ' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, category, question, answer, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      const idx = db.faqs.findIndex((f) => f.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
      }

      const updated: FAQ = {
        ...db.faqs[idx],
        category: category !== undefined ? category : db.faqs[idx].category,
        question: question !== undefined ? question : db.faqs[idx].question,
        answer: answer !== undefined ? answer : db.faqs[idx].answer,
        displayOrder: displayOrder !== undefined ? displayOrder : db.faqs[idx].displayOrder,
      };

      db.faqs[idx] = updated;
      writeVisualizerDb(db);
      return NextResponse.json({ success: true, faq: updated });
    }

    const data: any = {};
    if (category !== undefined) data.category = category;
    if (question !== undefined) data.question = question;
    if (answer !== undefined) data.answer = answer;
    if (displayOrder !== undefined) data.displayOrder = displayOrder;

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, faq });
  } catch (error: any) {
    console.error('Update FAQ error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update FAQ' }, { status: 500 });
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
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    const isOnline = await isDbOnline();

    if (!isOnline) {
      const db = readVisualizerDb();
      db.faqs = db.faqs.filter((f) => f.id !== id);
      writeVisualizerDb(db);
      return NextResponse.json({ success: true });
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete FAQ' }, { status: 500 });
  }
}
