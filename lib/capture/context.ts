/**
 * Capture brief context builder — engineering spec §6.
 *
 * "The LLM receives a structured context object, never raw HTML: company
 *  profile and past performance, opportunity fields, computed evidence lines
 *  and fit bucket, incumbent contract record if found, up to 8 candidate
 *  people joined on the org lineage, recompete confidence and evidence."
 *
 * Everything here is computed deterministically first. The model's job is to
 * explain this object, not to discover anything — which is why the fit bucket
 * and the evidence lines arrive already decided (§5, no LLM in scoring).
 */
import type postgres from 'postgres';
import { isPreRfp, isRfi } from '../dod-scope';
import { getOrgAncestors, getOrgDescendants } from '../ingestion/org-resolver';
import { findIncumbent, type IncumbentCandidate } from './incumbent';
import { readRecompete, type RecompeteConfidence } from './recompete';
import { findCandidatePeople, ROLE_LABELS, type CandidatePerson } from './people';
import type { EvidenceLine, Fit } from '../matching/types';

type Sql = ReturnType<typeof postgres>;

export interface BriefContext {
  company: {
    name: string;
    description: string | null;
    website: string | null;
    naicsCodes: string[];
    pscCodes: string[];
    setAsides: string[];
    vehicles: string[];
    capabilities: string[];
    primePref: string;
    valueBand: { min: number | null; max: number | null };
    pastPerformance: Array<{
      title: string;
      org: string | null;
      value: number | null;
      naics: string | null;
      endDate: string | null;
    }>;
  };
  opportunity: {
    id: string;
    title: string;
    description: string | null;
    noticeType: string | null;
    solicitationNumber: string | null;
    naicsCode: string | null;
    pscCode: string | null;
    setAside: string | null;
    estimatedValue: number | null;
    postedDate: string | null;
    responseDeadline: string | null;
    org: string | null;
    officeName: string | null;
    placeOfPerformance: string | null;
    uiUrl: string | null;
    isPreRfp: boolean;
  };
  fit: {
    bucket: Fit;
    evidence: string[];
  };
  incumbent: {
    found: boolean;
    recipient: string | null;
    title: string | null;
    awardDate: string | null;
    endDate: string | null;
    totalObligation: number | null;
    vehicle: string | null;
    modificationCount: number | null;
    evidence: string[];
  };
  recompete: {
    confidence: RecompeteConfidence | null;
    evidence: string[];
    monthsToExpiry: number | null;
  };
  candidatePeople: Array<{
    person_id: string;
    name: string;
    title: string | null;
    role: string;
    org: string | null;
  }>;
}

/** Everything the generator needs beyond the prompt context. */
export interface BuiltContext {
  context: BriefContext;
  incumbentRecord: IncumbentCandidate | null;
  candidates: CandidatePerson[];
  orgLineage: string[];
}

export interface BuildContextInput {
  userCompanyId: string;
  opportunityId: string;
  now?: Date;
}

function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateString(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

export async function buildBriefContext(
  sql: Sql,
  input: BuildContextInput,
): Promise<BuiltContext | null> {
  const [company] = await sql<
    {
      name: string;
      description: string | null;
      website: string | null;
      naics_codes: string[];
      psc_codes: string[];
      set_asides: string[];
      vehicles: string[];
      capabilities: string[];
      prime_pref: string;
      min_value: string | null;
      max_value: string | null;
    }[]
  >`
    SELECT c.name, c.description, c.website,
           p.naics_codes, p.psc_codes, p.set_asides, p.vehicles, p.capabilities,
           p.prime_pref, p.min_value, p.max_value
    FROM user_companies c
    JOIN company_profiles p ON p.user_company_id = c.id
    WHERE c.id = ${input.userCompanyId}
  `;
  if (!company) return null;

  const [opportunity] = await sql<
    {
      id: string;
      title: string;
      description: string | null;
      notice_type: string | null;
      solicitation_number: string | null;
      naics_code: string | null;
      psc_code: string | null;
      set_aside: string | null;
      estimated_value: string | null;
      posted_date: Date | null;
      response_deadline: Date | null;
      canonical_org_id: string | null;
      office_name: string | null;
      place_of_performance: string | null;
      ui_url: string | null;
      org_label: string | null;
    }[]
  >`
    SELECT o.id, o.title, o.description, o.notice_type, o.solicitation_number,
           o.naics_code, o.psc_code, o.set_aside, o.estimated_value,
           o.posted_date, o.response_deadline, o.canonical_org_id, o.office_name,
           o.place_of_performance, o.ui_url,
           COALESCE(org.full_name, org.abbreviation, o.department_slug) AS org_label
    FROM opportunities o
    LEFT JOIN orgs org ON org.id = o.canonical_org_id
    WHERE o.id = ${input.opportunityId}
  `;
  if (!opportunity) return null;

  const [match] = await sql<{ fit: Fit; evidence: EvidenceLine[] }[]>`
    SELECT fit, evidence FROM matches
    WHERE user_company_id = ${input.userCompanyId} AND opportunity_id = ${input.opportunityId}
  `;

  const pastPerformanceRows = await sql<
    { title: string; value: string | null; naics_code: string | null; end_date: Date | null; org_label: string | null }[]
  >`
    SELECT pp.title, pp.value, pp.naics_code, pp.end_date,
           COALESCE(o.abbreviation, o.full_name) AS org_label
    FROM company_past_performance pp
    LEFT JOIN orgs o ON o.id = pp.canonical_org_id
    WHERE pp.user_company_id = ${input.userCompanyId}
    ORDER BY pp.end_date DESC NULLS LAST
    LIMIT 20
  `;

  // The opportunity's org lineage: itself, its ancestors and its descendants.
  // Incumbent detection and people lookup are both scoped to this.
  const orgLineage: string[] = [];
  if (opportunity.canonical_org_id) {
    const [ancestors, descendants] = await Promise.all([
      getOrgAncestors(sql, opportunity.canonical_org_id),
      getOrgDescendants(sql, opportunity.canonical_org_id),
    ]);
    orgLineage.push(opportunity.canonical_org_id, ...ancestors, ...descendants);
  }

  const preRfp = isPreRfp(opportunity.notice_type) || isRfi(opportunity.notice_type, opportunity.title);

  const incumbentResult = await findIncumbent(sql, {
    orgLineage,
    title: opportunity.title,
    naicsCode: opportunity.naics_code,
    pscCode: opportunity.psc_code,
  });

  const recompete = await readRecompete(sql, {
    opportunityId: opportunity.id,
    orgLineage,
    naicsCode: opportunity.naics_code,
    orgLabel: opportunity.org_label,
    incumbent: incumbentResult.incumbent,
    isPreRfp: preRfp,
    now: input.now,
  });

  const candidates = await findCandidatePeople(sql, orgLineage, opportunity.canonical_org_id);

  const context: BriefContext = {
    company: {
      name: company.name,
      description: company.description,
      website: company.website,
      naicsCodes: company.naics_codes ?? [],
      pscCodes: company.psc_codes ?? [],
      setAsides: company.set_asides ?? [],
      vehicles: company.vehicles ?? [],
      capabilities: company.capabilities ?? [],
      primePref: company.prime_pref,
      valueBand: { min: toNumber(company.min_value), max: toNumber(company.max_value) },
      pastPerformance: pastPerformanceRows.map((r) => ({
        title: r.title,
        org: r.org_label,
        value: toNumber(r.value),
        naics: r.naics_code,
        endDate: toDateString(r.end_date),
      })),
    },
    opportunity: {
      id: opportunity.id,
      title: opportunity.title,
      // The prompt is a context object, not a document dump. A long SAM
      // description adds tokens without adding judgement.
      description: opportunity.description?.slice(0, 4000) ?? null,
      noticeType: opportunity.notice_type,
      solicitationNumber: opportunity.solicitation_number,
      naicsCode: opportunity.naics_code,
      pscCode: opportunity.psc_code,
      setAside: opportunity.set_aside,
      estimatedValue: toNumber(opportunity.estimated_value),
      postedDate: toDateString(opportunity.posted_date),
      responseDeadline: toDateString(opportunity.response_deadline),
      org: opportunity.org_label,
      officeName: opportunity.office_name,
      placeOfPerformance: opportunity.place_of_performance,
      uiUrl: opportunity.ui_url,
      isPreRfp: preRfp,
    },
    fit: {
      bucket: match?.fit ?? 'weak',
      evidence: (match?.evidence ?? []).map((e) => e.line),
    },
    incumbent: {
      found: Boolean(incumbentResult.incumbent),
      recipient: incumbentResult.incumbent?.recipient ?? null,
      title: incumbentResult.incumbent?.title ?? null,
      awardDate: incumbentResult.incumbent?.awardDate ?? null,
      endDate: incumbentResult.incumbent?.endDate ?? null,
      totalObligation: incumbentResult.incumbent?.totalObligation ?? null,
      vehicle: incumbentResult.incumbent?.vehicle ?? null,
      modificationCount: incumbentResult.incumbent?.modificationCount ?? null,
      evidence: incumbentResult.evidence,
    },
    recompete: {
      confidence: recompete.confidence,
      evidence: recompete.evidence,
      monthsToExpiry: recompete.monthsToExpiry,
    },
    candidatePeople: candidates.map((c) => ({
      person_id: c.personId,
      name: c.name,
      title: c.title,
      role: ROLE_LABELS[c.role] || 'Unknown role',
      org: c.orgLabel,
    })),
  };

  return { context, incumbentRecord: incumbentResult.incumbent, candidates, orgLineage };
}
