/**
 * Incumbent detection — engineering spec §6.
 *
 * "Search contracts for: same canonical_org_id lineage, matching NAICS or PSC,
 *  title similarity above threshold, end_date in the future or within the last
 *  six months. Rank by total obligation, take the top candidate. If nothing
 *  clears threshold the brief says so plainly rather than guessing."
 *
 * That last sentence is the whole design constraint. Product spec §8 rule 1:
 * "No invented people, contract values, or dates. If we can't find the
 * incumbent, the brief says we couldn't." A capture professional loses trust
 * permanently the first time a tool confidently names the wrong incumbent, so
 * this returns null rather than the best of a bad set.
 */
import type postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

/**
 * pg_trgm similarity threshold. 0.3 is loose enough to match
 * "Enterprise Cloud Migration Support" against "Cloud Migration Services
 * Support" and tight enough to reject an unrelated contract at the same
 * office. Tune against real data with the acceptance criterion 5 review
 * (70% of manually reviewed cases).
 */
export const TITLE_SIMILARITY_THRESHOLD = 0.3;

export interface IncumbentCandidate {
  contractId: string;
  title: string;
  recipient: string | null;
  awardAmount: number | null;
  totalObligation: number | null;
  awardDate: string | null;
  startDate: string | null;
  endDate: string | null;
  vehicle: string | null;
  modificationCount: number | null;
  canonicalOrgId: string | null;
  naicsCode: string | null;
  pscCode: string | null;
  titleSimilarity: number;
}

export interface IncumbentResult {
  incumbent: IncumbentCandidate | null;
  /** Human-readable lines the brief renders under the incumbent block. */
  evidence: string[];
  /** Runners-up, for the admin screen when a call looks wrong. */
  alternates: IncumbentCandidate[];
}

export interface IncumbentSearchInput {
  /** Every org in the opportunity's lineage, from loadOrgLineage. */
  orgLineage: string[];
  title: string;
  naicsCode: string | null;
  pscCode: string | null;
}

function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateString(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

export async function findIncumbent(
  sql: Sql,
  input: IncumbentSearchInput,
): Promise<IncumbentResult> {
  // Without an org lineage there is nothing to scope the search to, and a
  // department-wide title match would name a random vendor.
  if (!input.orgLineage.length) {
    return {
      incumbent: null,
      evidence: ['No prior contract identified: this notice could not be resolved to a specific organization.'],
      alternates: [],
    };
  }

  const rows = await sql<
    {
      id: string;
      title: string;
      recipient: string | null;
      award_amt: string | null;
      total_obligation: string | null;
      award_date: Date | null;
      start_date: Date | null;
      end_date: Date | null;
      vehicle: string | null;
      modification_count: number | null;
      canonical_org_id: string | null;
      naics_code: string | null;
      psc_code: string | null;
      title_similarity: number;
    }[]
  >`
    SELECT c.id, c.title, c.recipient, c.award_amt, c.total_obligation,
           c.award_date, c.start_date, c.end_date, c.vehicle,
           c.modification_count, c.canonical_org_id, c.naics_code, c.psc_code,
           similarity(c.title, ${input.title}) AS title_similarity
    FROM contracts c
    WHERE c.canonical_org_id = ANY(${input.orgLineage})
      AND c.title IS NOT NULL
      -- Matching NAICS or PSC. Both null on the opportunity means we cannot
      -- narrow by capability and fall back to title similarity alone.
      AND (
        ${input.naicsCode}::text IS NULL AND ${input.pscCode}::text IS NULL
        OR (${input.naicsCode}::text IS NOT NULL AND c.naics_code = ${input.naicsCode})
        OR (${input.pscCode}::text IS NOT NULL AND c.psc_code = ${input.pscCode})
      )
      -- Active, or recently enough expired to still be the incumbent.
      -- A null end_date is excluded: without it we cannot claim the contract
      -- is live, and guessing is what §8 rule 1 forbids.
      AND c.end_date IS NOT NULL
      AND c.end_date >= current_date - interval '6 months'
      AND similarity(c.title, ${input.title}) >= ${TITLE_SIMILARITY_THRESHOLD}
    -- §6: rank by total obligation.
    ORDER BY c.total_obligation DESC NULLS LAST, title_similarity DESC
    LIMIT 5
  `;

  if (!rows.length) {
    return {
      incumbent: null,
      evidence: ['No prior contract identified for this requirement in our award data.'],
      alternates: [],
    };
  }

  const candidates: IncumbentCandidate[] = rows.map((r) => ({
    contractId: r.id,
    title: r.title,
    recipient: r.recipient,
    awardAmount: toNumber(r.award_amt),
    totalObligation: toNumber(r.total_obligation),
    awardDate: toDateString(r.award_date),
    startDate: toDateString(r.start_date),
    endDate: toDateString(r.end_date),
    vehicle: r.vehicle,
    modificationCount: r.modification_count,
    canonicalOrgId: r.canonical_org_id,
    naicsCode: r.naics_code,
    pscCode: r.psc_code,
    titleSimilarity: Number(r.title_similarity),
  }));

  const [incumbent, ...alternates] = candidates;

  const evidence: string[] = [];
  if (incumbent.recipient) {
    evidence.push(`Held by ${incumbent.recipient}`);
  } else {
    evidence.push('Prior contract found, but the awardee is not recorded in our data.');
  }
  if (incumbent.endDate) evidence.push(`Current period of performance ends ${incumbent.endDate}`);
  if (incumbent.totalObligation !== null) {
    evidence.push(`Total obligated to date ${formatUsd(incumbent.totalObligation)}`);
  }
  if (incumbent.vehicle) evidence.push(`Awarded under ${incumbent.vehicle}`);
  if (incumbent.modificationCount !== null) {
    evidence.push(`${incumbent.modificationCount} modifications on record`);
  }
  evidence.push(`Matched on title similarity and ${incumbent.naicsCode ? `NAICS ${incumbent.naicsCode}` : `PSC ${incumbent.pscCode}`}`);

  return { incumbent, evidence, alternates };
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}
