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
    const mediaItems = await prisma.heroMedia.findMany();
    const mediaMap: Record<string, { mediaType: string; mediaUrl: string; fallbackUrl?: string | null; eyebrow?: string | null; heading?: string | null; subheading?: string | null }> = {};
    mediaItems.forEach(item => {
      mediaMap[item.page] = {
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        fallbackUrl: item.fallbackUrl,
        eyebrow: item.eyebrow,
        heading: item.heading,
        subheading: item.subheading,
      };
    });
    return NextResponse.json({ success: true, media: mediaMap });
  } catch (error: any) {
    console.error('Fetch media error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero media list' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { page, mediaType, mediaUrl, fallbackUrl, eyebrow, heading, subheading } = body;

    if (!page || !mediaType || !mediaUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const media = await prisma.heroMedia.upsert({
      where: { page },
      update: { 
        mediaType, 
        mediaUrl, 
        fallbackUrl: fallbackUrl || null,
        eyebrow: eyebrow || null,
        heading: heading || null,
        subheading: subheading || null,
      },
      create: { 
        page, 
        mediaType, 
        mediaUrl, 
        fallbackUrl: fallbackUrl || null,
        eyebrow: eyebrow || null,
        heading: heading || null,
        subheading: subheading || null,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    console.error('Update media error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update hero media' }, { status: 500 });
  }
}
