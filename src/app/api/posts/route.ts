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
    const slug = searchParams.get('slug');

    if (slug) {
      const post = await prisma.post.findUnique({
        where: { slug },
      });
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      return NextResponse.json({ success: true, post });
    }

    const posts = await prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, summary, content, author, status } = body;

    if (!title || !category || !summary || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Post title must be unique' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        category,
        summary,
        content,
        author: author || 'Sitka Editor',
        status: status || 'PUBLISHED',
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!hasWriteAccess(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, category, summary, content, author, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (title) {
      data.title = title;
      data.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (category) data.category = category;
    if (summary) data.summary = summary;
    if (content) data.content = content;
    if (author) data.author = author;
    if (status) data.status = status;

    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
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
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
