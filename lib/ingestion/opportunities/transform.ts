/**
 * SAM notice -> opportunities row — engineering spec §3 and §4.
 *
 * Everything here is pure so it is testable without a database or an API key.
 * Org resolution is deliberately not done here: it needs a connection, and
 * keeping it out means a bad org lookup cannot corrupt a parsed field.
 */
import type { SamOpportunity } from './fetch';

export interface OpportunityRow {
  external_id: string;
  source: 'sam';
  title: string;
  notice_type: string | null;
  solicitation_number: string | null;
  naics_code: string | null;
  psc_code: string | null;
  set_aside: string | null;
  posted_date: string | null;
  response_deadline: string | null;
  archive_date: string | null;
  department_slug: string | null;
  office_name: string | null;
  estimated_value: number | null;
  description: string | null;
  ui_url: string | null;
  place_of_performance: string | null;
  poc_name: string | null;
  poc_email: string | null;
  raw_payload: SamOpportunity;
  /** Carried alongside the row so sync can resolve the org. Not a column. */
  _parentPathCode: string | null;
  _parentPathName: string | null;
}

export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  if (!html.includes('<')) return html.trim() || null;
  return (
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#\d+;/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || null
  );
}

/**
 * SAM's `description` is sometimes the text and sometimes a noticedesc URL
 * pointing at it. Storing the URL as if it were prose is what produced the
 * "Loading description…" dead ends in v2, so a URL is stored as null and the
 * ui_url link carries the user instead.
 */
function parseDescription(value: string | null | undefined): string | null {
  const text = stripHtml(value);
  if (!text) return null;
  if (/^https?:\/\//i.test(text)) return null;
  return text;
}

/** SAM dates arrive as ISO, as MM/dd/yyyy, and occasionally with a timezone. */
function parseDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const usFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (usFormat) return `${usFormat[3]}-${usFormat[1]}-${usFormat[2]}`;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function parseDateOnly(value: string | null | undefined): string | null {
  const parsed = parseDate(value);
  return parsed ? parsed.slice(0, 10) : null;
}

function parseAmount(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[$,]/g, ''));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/**
 * Parent path segments: "DEPT OF DEFENSE.DEPT OF THE AIR FORCE.AFLCMC.AFLCMC/WNS".
 * The first segment is the department, the last is the buying office.
 */
function pathSegments(path: string | null | undefined): string[] {
  return (path ?? '')
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractPlaceOfPerformance(pop: SamOpportunity['placeOfPerformance']): string | null {
  if (!pop) return null;
  const parts = [pop.city?.name, pop.state?.name ?? pop.state?.code, pop.country?.code].filter(Boolean);
  return parts.join(', ') || null;
}

export function transformOpportunity(opp: SamOpportunity): OpportunityRow {
  const nameSegments = pathSegments(opp.fullParentPathName);
  const primaryPoc =
    opp.pointOfContact?.find((p) => (p.type ?? '').toLowerCase() === 'primary') ??
    opp.pointOfContact?.[0] ??
    null;

  return {
    external_id: opp.noticeId,
    source: 'sam',
    title: opp.title?.trim() || '(untitled notice)',
    notice_type: opp.type ?? opp.baseType ?? null,
    solicitation_number: opp.solicitationNumber?.trim() || null,
    naics_code: opp.naicsCode?.trim() || null,
    psc_code: opp.classificationCode?.trim() || null,
    set_aside: opp.typeOfSetAsideDesc?.trim() || opp.typeOfSetAside?.trim() || null,
    posted_date: parseDateOnly(opp.postedDate),
    response_deadline: parseDate(opp.responseDeadLine),
    archive_date: parseDateOnly(opp.archiveDate),
    department_slug: nameSegments[0] ?? null,
    office_name: nameSegments.length > 1 ? nameSegments[nameSegments.length - 1] : null,
    // SAM exposes an award amount on award notices, which are out of scope
    // here, so estimated_value is usually null on ingest. §5 treats a null
    // value as "unknown" rather than "outside the band" precisely because of
    // this — see scoreValueBand in lib/matching/score.ts.
    estimated_value: parseAmount(opp.award?.amount),
    description: parseDescription(opp.description),
    ui_url: opp.uiLink ?? null,
    place_of_performance: extractPlaceOfPerformance(opp.placeOfPerformance),
    poc_name: primaryPoc?.fullName?.trim() || null,
    poc_email: primaryPoc?.email?.trim()?.toLowerCase() || null,
    raw_payload: opp,
    _parentPathCode: opp.fullParentPathCode ?? null,
    _parentPathName: opp.fullParentPathName ?? null,
  };
}
