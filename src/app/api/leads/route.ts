import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptSession } from '@/lib/auth';
import { Resend } from 'resend';

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

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: 'Sitka Surfaces <onboarding@resend.dev>',
          to: email,
          subject: 'Your Sitka Surfaces Material Guide & Brochure',
          html: `<div style="font-family: sans-serif; color: #242220; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c9c2b4; border-radius: 4px;">
            <h2 style="color: #b9502a; font-family: inherit;">Your Sitka Surfaces Material Guide</h2>
            <p>Dear ${name},</p>
            <p>Thank you for requesting our guide. We have recorded your interest in <b>${interestArea}</b> panels.</p>
            <p>You can download the full catalog specifications brochure PDF below:</p>
            <p style="margin: 30px 0;">
              <a href="https://sitkasurfaces.com/brochure.pdf" style="background-color: #b9502a; color: #fdfcf7; text-decoration: none; padding: 12px 24px; border-radius: 2px; font-weight: bold; display: inline-block;">Download Catalog Brochure</a>
            </p>
            <p>Our materials expert will be in touch with your team shortly to address any custom layout, sequence matching, or substrate questions.</p>
            <hr style="border: 0; border-top: 1px solid #c9c2b4; margin: 30px 0;" />
            <p style="font-size: 11px; color: #736d66;">Sitka Surfaces · 12, Industrial Area, Bangalore · info@sitkasurfaces.com</p>
          </div>`
        });
      } catch (err) {
        console.error('Email sending failed:', err);
      }
    }

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
