import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, interestArea, persona, utmSource } = body;

    if (!name || !email || !phone || !interestArea || !persona) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company: company || null,
        interestArea,
        persona,
        utmSource: utmSource || 'website',
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error: any) {
    console.error('Lead submission error:', error);
    return NextResponse.json({ error: 'Failed to record lead' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Auth Check
    const sessionCookie = req.cookies.get('sitka_session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const session = decryptSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('Fetch leads error:', error);
    return NextResponse.json({ error: 'Failed to retrieve leads' }, { status: 500 });
  }
}
