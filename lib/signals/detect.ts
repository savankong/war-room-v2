/**
 * Signal detection — engineering spec §4 and §8 (`detect-signals`, nightly).
 *
 * §4: "One addition: a nightly job writing contract_expiring signals for any
 *      active contract with end_date inside 18 months."
 *
 * 18 months is not arbitrary — it is the outer edge of the §6 recompete
 * window, so a contract entering this set is one the briefing can start
 * positioning against.
 *
 * Every detector is idempotent through the UNIQUE constraint on
 * (type, subject_type, subject_id, occurred_at): a nightly re-run writes
 * nothing new for a contract already signalled.
 */
import type postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

export interface DetectionResult {
  contractExpiring: number;
  newAwards: number;
}

/**
 * occurred_at is the contract's end_date, not "now". That makes the signal
 * idempotent across runs (the same expiry produces the same key) and makes
 * "expires soonest" a plain ORDER BY for the briefing.
 */
export async function detectExpiringContracts(sql: Sql): Promise<number> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO signals (type, subject_type, subject_id, canonical_org_id, payload, occurred_at)
    SELECT
      'contract_expiring',
      'contract',
      c.id,
      c.canonical_org_id,
      jsonb_build_object(
        'title', c.title,
        'recipient', c.recipient,
        'end_date', c.end_date,
        'total_obligation', c.total_obligation,
        'naics_code', c.naics_code,
        'psc_code', c.psc_code,
        'vehicle', c.vehicle
      ),
      c.end_date::timestamptz
    FROM contracts c
    WHERE c.end_date IS NOT NULL
      AND c.end_date >= current_date
      AND c.end_date <= current_date + interval '18 months'
      AND c.canonical_org_id IS NOT NULL
    ON CONFLICT (type, subject_type, subject_id, occurred_at) DO NOTHING
    RETURNING id
  `;
  return rows.length;
}

/**
 * Awards recorded since the last run. Feeds the briefing's market-signals
 * section — "who just won work at an office you target" is the cheapest
 * competitive intelligence we have.
 */
export async function detectNewAwards(sql: Sql, sinceDays = 7): Promise<number> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO signals (type, subject_type, subject_id, canonical_org_id, payload, occurred_at)
    SELECT
      'new_award',
      'contract',
      c.id,
      c.canonical_org_id,
      jsonb_build_object(
        'title', c.title,
        'recipient', c.recipient,
        'award_amt', c.award_amt,
        'total_obligation', c.total_obligation,
        'naics_code', c.naics_code
      ),
      c.award_date::timestamptz
    FROM contracts c
    WHERE c.award_date IS NOT NULL
      AND c.award_date >= current_date - (${sinceDays}::int || ' days')::interval
      AND c.canonical_org_id IS NOT NULL
      AND c.signal_type = 'Award'
    ON CONFLICT (type, subject_type, subject_id, occurred_at) DO NOTHING
    RETURNING id
  `;
  return rows.length;
}

export async function detectSignals(sql: Sql): Promise<DetectionResult> {
  const contractExpiring = await detectExpiringContracts(sql);
  const newAwards = await detectNewAwards(sql);
  console.log(`Signals: ${contractExpiring} contract_expiring, ${newAwards} new_award`);
  return { contractExpiring, newAwards };
}

/**
 * Signals relevant to one company: anything in the lineage of a target org, or
 * matching a NAICS the company works in. Read by the briefing's "Market
 * signals" section, which §9 caps at four lines.
 */
export async function signalsForCompany(
  sql: Sql,
  userCompanyId: string,
  options: { since?: Date; limit?: number } = {},
): Promise<Array<{ id: string; type: string; occurredAt: Date; payload: Record<string, unknown>; orgLabel: string | null }>> {
  const since = options.since ?? new Date(Date.now() - 7 * 86_400_000);
  const limit = options.limit ?? 4;

  const rows = await sql<
    { id: string; type: string; occurred_at: Date; payload: Record<string, unknown>; org_label: string | null }[]
  >`
    WITH profile AS (
      SELECT target_org_ids, naics_codes FROM company_profiles WHERE user_company_id = ${userCompanyId}
    ),
    lineage AS (
      SELECT o.id FROM orgs o, profile p WHERE o.id = ANY(p.target_org_ids)
      UNION
      SELECT o.id FROM orgs o, profile p WHERE o.parent_id = ANY(p.target_org_ids)
    )
    SELECT s.id, s.type, s.occurred_at, s.payload,
           COALESCE(org.abbreviation, org.full_name) AS org_label
    FROM signals s
    LEFT JOIN orgs org ON org.id = s.canonical_org_id
    WHERE s.detected_at >= ${since}
      AND (
        s.canonical_org_id IN (SELECT id FROM lineage)
        -- unnest, not = ANY(SELECT naics_codes ...): that subquery returns a
        -- single text[] value, so Postgres compares text to text[] and errors
        -- with "operator does not exist".
        OR s.payload->>'naics_code' IN (SELECT unnest(naics_codes) FROM profile)
      )
    ORDER BY s.occurred_at DESC
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    occurredAt: r.occurred_at,
    payload: r.payload,
    orgLabel: r.org_label,
  }));
}
