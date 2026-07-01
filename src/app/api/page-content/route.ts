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
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
    }

    const contentItems = await prisma.pageContent.findMany({
      where: { page },
    });

    // Map to a key-value object of "section_key" -> value for easy frontend usage
    const contentMap: Record<string, string> = {};
    contentItems.forEach(item => {
      contentMap[`${item.section}_${item.key}`] = item.value;
    });

    return NextResponse.json({ success: true, content: contentMap });
  } catch (error: any) {
    console.error('Fetch page content error:', error);
    return NextResponse.json({ error: 'Failed to retrieve page content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { page, section, key, value } = body;

    if (!page || !section || !key || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contentItem = await prisma.pageContent.upsert({
      where: {
        page_section_key: {
          page,
          section,
          key,
        },
      },
      update: { value },
      create: { page, section, key, value },
    });

    return NextResponse.json({ success: true, contentItem });
  } catch (error: any) {
    console.error('Update page content error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update page content' }, { status: 500 });
  }
}
