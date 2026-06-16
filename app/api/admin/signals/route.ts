import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getDb();
  const b = await req.json();
  const id = `manual-${Date.now().toString(36)}`;

  await db`
    INSERT INTO contracts (
      id, title, signal_type, source, value, award_amt,
      award_date, deadline, recipient, org_id, set_aside,
      poc, poc_email, naics, description
    ) VALUES (
      ${id}, ${b.title}, ${b.signal_type ?? 'Opportunity'},
      ${b.source ?? 'manual'},
      ${b.value ?? null}, ${b.award_amt ? Number(b.award_amt) : null},
      ${b.award_date ? new Date(b.award_date) : null},
      ${b.deadline ?? null},
      ${b.recipient ?? null}, ${b.org_id ?? null},
      ${b.set_aside ?? null}, ${b.poc ?? null}, ${b.poc_email ?? null},
      ${b.naics ?? null}, ${b.description ?? null}
    )
  `;
  return NextResponse.json({ ok: true, id });
}
