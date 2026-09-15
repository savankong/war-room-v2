import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isInternalRequest } from '@/lib/auth';

/**
 * GET /api/admin/ops — the internal admin screen (§7.5).
 *
 * "Ingestion run log, unresolved org queue, brief generation cost, per-company
 *  match counts, job queue health. This replaces the one-off diagnostic
 *  functions from the Netlify era. Expect to live in this screen for the first
 *  month."
 *
 * Internal only, behind SAM_SYNC_TOKEN. Queue health comes from BullMQ and is
 * fetched separately by the worker's own endpoint — this returns everything
 * that lives in Postgres.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isInternalRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();

  const [runs, unresolvedCount, unresolvedSample, briefCost, companies, orgResolution] = await Promise.all([
    sql`
      SELECT id, source, status, records_synced, inserted_count, updated_count,
             skipped_count, errored_count, unresolved_org_count,
             error_log, started_at, completed_at
      FROM ingestion_runs
      ORDER BY started_at DESC
      LIMIT 25
    `,

    sql`SELECT count(*)::int AS count FROM opportunities WHERE canonical_org_id IS NULL`,

    // The unresolved-org queue: grouped by department so one bad mapping shows
    // up as one row to fix rather than 400 rows to scroll.
    sql`
      SELECT department_slug,
             count(*)::int AS count,
             max(ingested_at) AS last_seen,
             (array_agg(office_name ORDER BY ingested_at DESC))[1:3] AS sample_offices
      FROM opportunities
      WHERE canonical_org_id IS NULL
      GROUP BY department_slug
      ORDER BY count DESC
      LIMIT 25
    `,

    // §7.5 "brief generation cost". Tokens, not dollars: the per-token price
    // is not in the database and a hardcoded rate would go stale silently.
    sql`
      SELECT
        count(*)::int AS briefs,
        count(*) FILTER (WHERE generator = 'template')::int AS template_fallbacks,
        coalesce(sum(input_tokens), 0)::bigint AS input_tokens,
        coalesce(sum(output_tokens), 0)::bigint AS output_tokens,
        model
      FROM capture_briefs
      WHERE generated_at >= now() - interval '30 days'
      GROUP BY model
    `,

    sql`
      SELECT c.id, c.name, c.plan, c.status, c.briefing_frequency,
             c.onboarding_completed_at,
             count(m.id) FILTER (WHERE m.fit = 'strong')::int AS strong,
             count(m.id) FILTER (WHERE m.fit = 'fair')::int AS fair,
             count(m.id) FILTER (WHERE m.dismissed_at IS NOT NULL)::int AS dismissed,
             (SELECT count(*) FROM capture_briefs b WHERE b.user_company_id = c.id)::int AS briefs,
             (SELECT count(*) FROM briefings br WHERE br.user_company_id = c.id AND br.sent_at IS NOT NULL)::int AS briefings_sent,
             (SELECT max(sent_at) FROM briefings br WHERE br.user_company_id = c.id) AS last_briefing_at
      FROM user_companies c
      LEFT JOIN matches m ON m.user_company_id = c.id
      WHERE c.status <> 'deleted'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `,

    // Acceptance criterion 3 is a rate, so show it as one.
    sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE canonical_org_id IS NOT NULL)::int AS resolved
      FROM opportunities
    `,
  ]);

  const resolution = orgResolution[0];
  const rate = resolution.total > 0 ? resolution.resolved / resolution.total : 1;

  return NextResponse.json({
    ingestionRuns: runs,
    orgResolution: {
      total: resolution.total,
      resolved: resolution.resolved,
      rate: Number(rate.toFixed(4)),
      // §10 acceptance criterion 3.
      meetsTarget: rate >= 0.85,
    },
    unresolvedOrgQueue: {
      total: unresolvedCount[0].count,
      byDepartment: unresolvedSample,
    },
    briefGeneration: briefCost,
    companies,
  });
}
