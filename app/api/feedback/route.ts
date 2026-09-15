import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, ownsCompany, unauthorized, forbidden } from '@/lib/auth';

/**
 * POST /api/feedback — §7, "One tap per opportunity".
 *
 * Product spec §11 makes these rows the primary success metric: "number of
 * genuinely actionable opportunities surfaced per customer per month.
 * Measured by the customer marking relevant or pursuing, not by how many we
 * sent."
 *
 * Acceptance criterion 10: "Not relevant permanently hides the opportunity for
 * that company and writes a feedback row."
 */
export const dynamic = 'force-dynamic';

const VERDICTS = new Set([
  'relevant',
  'not_relevant',
  'pursuing',
  'passed',
  'already_knew',
  'too_early',
  'wrong_capability',
]);

/** Verdicts that also take the opportunity off the feed. */
const HIDING_VERDICTS = new Set(['not_relevant', 'passed', 'wrong_capability']);

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  let body: { companyId?: string; opportunityId?: string; verdict?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { companyId, opportunityId, verdict, note } = body;
  if (!companyId || !opportunityId || !verdict) {
    return NextResponse.json(
      { error: 'companyId, opportunityId and verdict are required' },
      { status: 400 },
    );
  }
  if (!VERDICTS.has(verdict)) {
    return NextResponse.json(
      { error: `Unknown verdict "${verdict}". One of: ${[...VERDICTS].join(', ')}` },
      { status: 400 },
    );
  }
  if (!(await ownsCompany(userId, companyId))) return forbidden();

  const sql = getDb();

  const [match] = await sql<{ id: string }[]>`
    SELECT id FROM matches WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}
  `;
  if (!match) {
    return NextResponse.json({ error: 'No match for that company and opportunity' }, { status: 404 });
  }

  const [row] = await sql<{ id: string; created_at: Date }[]>`
    INSERT INTO feedback (user_company_id, opportunity_id, verdict, note)
    VALUES (${companyId}, ${opportunityId}, ${verdict}, ${note?.trim() || null})
    RETURNING id, created_at
  `;

  // Acceptance criterion 10. Dismissal survives a rescore (see
  // lib/matching/run.ts), so "permanently" holds.
  if (HIDING_VERDICTS.has(verdict)) {
    await sql`
      UPDATE matches SET dismissed_at = now()
      WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}
    `;
  }

  return NextResponse.json(
    { id: row.id, createdAt: row.created_at, hidden: HIDING_VERDICTS.has(verdict) },
    { status: 201 },
  );
}
