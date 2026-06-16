import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const recipient = req.nextUrl.searchParams.get('recipient');
  if (!recipient) return NextResponse.json([], { status: 400 });

  const db = getDb();

  // Try to find a canonical org_id for this company name first
  const orgMatch = await db`
    SELECT id FROM orgs WHERE LOWER(full_name) = LOWER(${recipient}) AND branch = 'Industry' LIMIT 1
  `;

  let rows;
  if (orgMatch.length > 0) {
    // Preferred: match by canonical_org_id (picks up all awardee name variants)
    rows = await db`
      SELECT
        c.id, c.title, c.signal_type, c.source,
        c.value, c.award_date, c.status,
        c.naics_code, c.description,
        c.agency_or_lab AS org_name
      FROM contracts c
      WHERE c.canonical_org_id = ${orgMatch[0].id}
        AND c.signal_type IS NOT NULL
      ORDER BY c.value DESC NULLS LAST, c.created_at DESC
      LIMIT 200
    `;
  } else {
    // Fallback: match by awardee name (case-insensitive)
    rows = await db`
      SELECT
        c.id, c.title, c.signal_type, c.source,
        c.value, c.award_date, c.status,
        c.naics_code, c.description,
        c.agency_or_lab AS org_name
      FROM contracts c
      WHERE LOWER(c.awardee) = LOWER(${recipient})
        AND c.signal_type IS NOT NULL
      ORDER BY c.value DESC NULLS LAST, c.created_at DESC
      LIMIT 200
    `;
  }

  return NextResponse.json(rows);
}
