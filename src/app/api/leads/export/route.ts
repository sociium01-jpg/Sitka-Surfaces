import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Auth Check
    const sessionCookie = req.cookies.get('sitka_session');
    if (!sessionCookie || !sessionCookie.value) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const session = decryptSession(sessionCookie.value);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV string
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Interest Area', 'Persona', 'Created At', 'UTM Source'];
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      l.email,
      `"${l.phone}"`,
      l.company ? `"${l.company.replace(/"/g, '""')}"` : '',
      l.interestArea,
      l.persona,
      l.createdAt.toISOString(),
      l.utmSource || 'website'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="sitka-leads-export.csv"',
      },
    });
  } catch (error) {
    console.error('Export leads error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
