/**
 * Recompete confidence — engineering spec §6.
 *
 *   High:   active matching contract expiring within 12 months AND a Sources
 *           Sought or RFI posted by the same office
 *   Medium: matching contract expiring within 18 months, no pre-solicitation
 *           activity yet
 *   Low:    inferred from office and NAICS pattern only
 *
 * "Always render the evidence below the label." Product spec §8 rule 3 makes
 * that a requirement rather than a nicety, so this returns the label and the
 * evidence together and there is no way to get one without the other.
 */
import type postgres from 'postgres';
import type { IncumbentCandidate } from './incumbent';

type Sql = ReturnType<typeof postgres>;

export type RecompeteConfidence = 'high' | 'medium' | 'low';

export interface RecompeteRead {
  confidence: RecompeteConfidence | null;
  evidence: string[];
  /** Months until the incumbent contract ends, when known. */
  monthsToExpiry: number | null;
}

function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/**
 * Has this office already posted pre-solicitation activity for this
 * requirement? That is what separates High from Medium: a Sources Sought means
 * the office has started shaping, which is the moment §2 says the business is
 * won or lost.
 */
async function hasPreSolicitationActivity(
  sql: Sql,
  orgLineage: string[],
  naicsCode: string | null,
  excludeOpportunityId: string,
): Promise<{ found: boolean; detail: string | null }> {
  if (!orgLineage.length) return { found: false, detail: null };

  const rows = await sql<{ title: string; notice_type: string; posted_date: Date | null }[]>`
    SELECT title, notice_type, posted_date
    FROM opportunities
    WHERE canonical_org_id = ANY(${orgLineage})
      AND id <> ${excludeOpportunityId}
      AND (
        notice_type ILIKE '%sources sought%'
        OR notice_type ILIKE '%request for information%'
        OR title ILIKE '%request for information%'
        OR title ~* '\\yRFI\\y'
      )
      AND (${naicsCode}::text IS NULL OR naics_code = ${naicsCode})
      AND posted_date >= current_date - interval '18 months'
    ORDER BY posted_date DESC
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return { found: false, detail: null };

  const when = row.posted_date ? ` posted ${row.posted_date.toISOString().slice(0, 10)}` : '';
  return { found: true, detail: `${row.notice_type}${when}: ${row.title}` };
}

export interface RecompeteInput {
  opportunityId: string;
  orgLineage: string[];
  naicsCode: string | null;
  orgLabel: string | null;
  incumbent: IncumbentCandidate | null;
  /** Is this notice itself a Sources Sought or RFI? */
  isPreRfp: boolean;
  now?: Date;
}

export async function readRecompete(sql: Sql, input: RecompeteInput): Promise<RecompeteRead> {
  const now = input.now ?? new Date();
  const evidence: string[] = [];

  const endDate = input.incumbent?.endDate ? new Date(input.incumbent.endDate) : null;
  const monthsToExpiry = endDate ? monthsBetween(now, endDate) : null;

  // Low: no incumbent contract to anchor on, so the read is a pattern
  // inference from the office and NAICS only. Said plainly rather than dressed
  // up — §8 rule 4, uncertainty is stated, never smoothed over.
  if (!input.incumbent || monthsToExpiry === null) {
    const orgLabel = input.orgLabel ?? 'this organization';
    evidence.push(
      `No prior contract identified, so this read is inferred from ${orgLabel}'s buying pattern` +
        (input.naicsCode ? ` in NAICS ${input.naicsCode}` : '') +
        ' alone.',
    );
    if (input.isPreRfp) {
      evidence.push('The notice itself is pre-RFP, which usually means a requirement is being shaped now.');
    }
    return { confidence: 'low', evidence, monthsToExpiry: null };
  }

  // Already expired, or expiring beyond the 18-month horizon §6 defines.
  if (monthsToExpiry < 0) {
    evidence.push(
      `The prior contract ended ${input.incumbent.endDate}, so a follow-on may already have been awarded outside our data.`,
    );
    return { confidence: 'low', evidence, monthsToExpiry };
  }

  if (monthsToExpiry > 18) {
    evidence.push(
      `The prior contract does not expire until ${input.incumbent.endDate}, beyond the window where positioning usually pays off.`,
    );
    return { confidence: 'low', evidence, monthsToExpiry };
  }

  const preSolicitation = await hasPreSolicitationActivity(
    sql,
    input.orgLineage,
    input.naicsCode,
    input.opportunityId,
  );

  // High: expiring within 12 months AND pre-solicitation activity at the same
  // office. The notice being scored counts as that activity when it is itself
  // a Sources Sought or RFI.
  if (monthsToExpiry <= 12 && (preSolicitation.found || input.isPreRfp)) {
    evidence.push(`Prior contract expires ${input.incumbent.endDate}, within 12 months.`);
    if (input.isPreRfp) {
      evidence.push('This notice is itself pre-RFP activity from the same office.');
    }
    if (preSolicitation.detail) {
      evidence.push(`Same office also posted ${preSolicitation.detail}`);
    }
    return { confidence: 'high', evidence, monthsToExpiry };
  }

  // Medium: expiring within 18 months, no pre-solicitation activity yet.
  evidence.push(`Prior contract expires ${input.incumbent.endDate}, within 18 months.`);
  evidence.push('No pre-solicitation activity from this office yet, so timing is not yet confirmed.');
  return { confidence: 'medium', evidence, monthsToExpiry };
}
