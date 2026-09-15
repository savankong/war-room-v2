import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserId, ownsCompany, unauthorized, forbidden } from '@/lib/auth';
import { generateCaptureBrief, getCachedBrief } from '@/lib/capture/generate';

/**
 * GET /api/briefs/:companyId/:opportunityId — the Capture Brief page (§7.3).
 *
 * §6: generation is triggered when a match scores Strong, a user opens a Fair
 * match, or a user saves an opportunity — and "never regenerate on page load".
 * So this returns the cached brief when one exists and generates only when the
 * match is Fair and has no brief yet. A Strong match without a brief means the
 * nightly job has not caught up; it generates here rather than showing the
 * customer an empty page.
 */
export const dynamic = 'force-dynamic';
// Brief generation is an LLM call with adaptive thinking; the platform default
// would cut it off mid-generation.
export const maxDuration = 120;

export async function GET(req: Request, ctx: RouteContext<'/api/briefs/[companyId]/[opportunityId]'>) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const { companyId, opportunityId } = await ctx.params;
  if (!(await ownsCompany(userId, companyId))) return forbidden();

  const sql = getDb();

  const [match] = await sql<{ fit: string; evidence: Array<{ line: string }> }[]>`
    SELECT fit, evidence FROM matches
    WHERE user_company_id = ${companyId} AND opportunity_id = ${opportunityId}
  `;
  if (!match) {
    return NextResponse.json({ error: 'No match for that company and opportunity' }, { status: 404 });
  }

  // §5: only Strong and Fair generate a capture brief.
  if (match.fit === 'weak') {
    return NextResponse.json(
      { error: 'This opportunity scored too low to brief', fit: match.fit },
      { status: 409 },
    );
  }

  let brief = await getCachedBrief(sql, companyId, opportunityId);
  if (!brief) {
    const generated = await generateCaptureBrief(sql, companyId, opportunityId);
    brief = generated.brief;
  }

  const [opportunity] = await sql`
    SELECT o.id, o.title, o.description, o.notice_type, o.solicitation_number,
           o.naics_code, o.psc_code, o.set_aside, o.estimated_value,
           o.posted_date, o.response_deadline, o.ui_url, o.place_of_performance,
           COALESCE(org.full_name, org.abbreviation, o.department_slug) AS org_label,
           org.id AS org_id, o.office_name
    FROM opportunities o
    LEFT JOIN orgs org ON org.id = o.canonical_org_id
    WHERE o.id = ${opportunityId}
  `;

  const [incumbent] = brief.incumbentContractId
    ? await sql`
        SELECT id, title, recipient, award_date, start_date, end_date,
               total_obligation, award_amt, vehicle, modification_count
        FROM contracts WHERE id = ${brief.incumbentContractId}
      `
    : [null];

  return NextResponse.json({
    opportunity: opportunity
      ? {
          ...opportunity,
          estimated_value: opportunity.estimated_value === null ? null : Number(opportunity.estimated_value),
        }
      : null,
    fit: {
      bucket: match.fit,
      // §5: the bucket plus evidence, never the number.
      evidence: (match.evidence ?? []).map((e) => e.line),
    },
    brief: {
      recommendation: brief.recommendation,
      summary: brief.summary,
      whyItMatters: brief.whyItMatters,
      recommendationRationale: brief.recommendationRationale,
      nextAction: brief.nextAction,
      people: brief.people,
      generator: brief.generator,
      generatedAt: brief.generatedAt,
    },
    incumbent: incumbent
      ? {
          ...incumbent,
          total_obligation: incumbent.total_obligation === null ? null : Number(incumbent.total_obligation),
        }
      : null,
    incumbentEvidence: brief.incumbentEvidence,
    recompete: {
      confidence: brief.recompeteConfidence,
      // §8 rule 3: the label never ships without its evidence.
      evidence: brief.recompeteEvidence,
    },
  });
}
