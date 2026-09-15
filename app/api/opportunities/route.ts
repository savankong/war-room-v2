import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, ownsCompany, unauthorized, forbidden } from '@/lib/auth';
import { PROMPT_VERSION } from '@/lib/capture/prompt';

/**
 * GET /api/opportunities?companyId=&fit=
 *
 * The Today screen (§7.2): "Ranked Strong and Fair matches for the period.
 * Each row: title, org, notice type, deadline, fit badge, top two evidence
 * lines, next action."
 *
 * The numeric score is never returned (§5: "Never show a numeric score to the
 * user. Store it, display the bucket plus evidence."). It is not in the SELECT
 * at all, so it cannot reach the client through a careless spread.
 */
export const dynamic = 'force-dynamic';

const FITS = new Set(['strong', 'fair', 'weak']);

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
  if (!(await ownsCompany(userId, companyId))) return forbidden();

  const fitParam = url.searchParams.get('fit');
  const fits = fitParam && FITS.has(fitParam) ? [fitParam] : ['strong', 'fair'];
  const includeDismissed = url.searchParams.get('includeDismissed') === 'true';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);

  const sql = getDb();
  const rows = await sql`
    SELECT
      m.opportunity_id,
      m.fit,
      m.evidence,
      m.saved_at,
      m.dismissed_at,
      o.title,
      o.notice_type,
      o.solicitation_number,
      o.set_aside,
      o.estimated_value,
      o.response_deadline,
      o.posted_date,
      o.ui_url,
      COALESCE(org.abbreviation, org.full_name, o.office_name) AS org_label,
      b.recommendation,
      b.next_action,
      b.recompete_confidence,
      inc.recipient AS incumbent,
      f.verdict AS last_verdict
    FROM matches m
    JOIN opportunities o ON o.id = m.opportunity_id
    LEFT JOIN orgs org ON org.id = o.canonical_org_id
    LEFT JOIN capture_briefs b
      ON b.user_company_id = m.user_company_id
     AND b.opportunity_id = m.opportunity_id
     AND b.prompt_version = ${PROMPT_VERSION}
    LEFT JOIN contracts inc ON inc.id = b.incumbent_contract_id
    LEFT JOIN LATERAL (
      SELECT verdict FROM feedback
      WHERE user_company_id = m.user_company_id AND opportunity_id = m.opportunity_id
      ORDER BY created_at DESC LIMIT 1
    ) f ON true
    WHERE m.user_company_id = ${companyId}
      AND m.fit = ANY(${fits})
      AND (${includeDismissed} OR m.dismissed_at IS NULL)
      AND (o.response_deadline IS NULL OR o.response_deadline >= now())
    ORDER BY
      CASE m.fit WHEN 'strong' THEN 0 WHEN 'fair' THEN 1 ELSE 2 END,
      m.score DESC,
      o.response_deadline ASC NULLS LAST
    LIMIT ${limit}
  `;

  return NextResponse.json({
    opportunities: rows.map((r) => ({
      opportunityId: r.opportunity_id,
      title: r.title,
      org: r.org_label,
      noticeType: r.notice_type,
      solicitationNumber: r.solicitation_number,
      setAside: r.set_aside,
      estimatedValue: r.estimated_value === null ? null : Number(r.estimated_value),
      responseDeadline: r.response_deadline,
      postedDate: r.posted_date,
      samUrl: r.ui_url,
      fit: r.fit,
      // §7.2 shows the top two; score() already ordered them strongest first.
      evidence: (r.evidence ?? []).slice(0, 2).map((e: { line: string }) => e.line),
      recommendation: r.recommendation,
      nextAction: r.next_action,
      recompeteConfidence: r.recompete_confidence,
      incumbent: r.incumbent,
      saved: Boolean(r.saved_at),
      dismissed: Boolean(r.dismissed_at),
      lastVerdict: r.last_verdict,
    })),
  });
}

/** Save and Dismiss, inline on the Today row (§7.2). */
export async function PATCH(req: Request) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  let body: { companyId?: string; opportunityId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { companyId, opportunityId, action } = body;
  if (!companyId || !opportunityId || !action) {
    return NextResponse.json({ error: 'companyId, opportunityId and action are required' }, { status: 400 });
  }
  if (!(await ownsCompany(userId, companyId))) return forbidden();

  const sql = getDb();
  switch (action) {
    case 'save':
      await sql`UPDATE matches SET saved_at = now() WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}`;
      break;
    case 'unsave':
      await sql`UPDATE matches SET saved_at = NULL WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}`;
      break;
    case 'dismiss':
      await sql`UPDATE matches SET dismissed_at = now() WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}`;
      break;
    case 'undismiss':
      await sql`UPDATE matches SET dismissed_at = NULL WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}`;
      break;
    default:
      return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
