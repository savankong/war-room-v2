import type { SamOpportunity } from './fetch';

export interface ContractRow {
  external_id: string;
  source: 'sam_gov' | 'usaspending';
  title: string;
  value: number | null;
  status: string | null;
  signal_type: 'Opportunity' | 'Award' | 'Budget';
  award_date: string | null;
  raw_payload: unknown;
  org_id: string | null;
  awarding_agency: string | null;
  office_code: string | null;
  // Enriched fields
  description: string | null;
  naics: string | null;
  psc_code: string | null;
  set_aside: string | null;
  solicitation_number: string | null;
  notice_type: string | null;
  deadline: string | null;
  published_date: string | null;
  poc: string | null;
  poc_email: string | null;
  poc_phone: string | null;
  place_of_performance: string | null;
  agency: string | null;
  sub_agency: string | null;
  recipient: string | null;
}

// Extract FA-code from last path segment
function extractOfficeCode(fullParentPathCode?: string): string | null {
  if (!fullParentPathCode) return null;
  const segments = fullParentPathCode.split('.');
  const last = segments[segments.length - 1]?.trim().toLowerCase();
  return last || null;
}

// Second segment = dept, third = sub-agency
function extractDepartment(fullParentPathName?: string): { agency: string | null; subAgency: string | null } {
  if (!fullParentPathName) return { agency: null, subAgency: null };
  const segments = fullParentPathName.split('.');
  return {
    agency: segments[1]?.trim() ?? segments[0]?.trim() ?? null,
    subAgency: segments[2]?.trim() ?? null,
  };
}

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  if (!html.includes('<')) return html.trim() || null;
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || null;
}

function extractPlaceOfPerformance(pop?: SamOpportunity['placeOfPerformance']): string | null {
  if (!pop) return null;
  const parts = [pop.city?.name, pop.state?.name, pop.country?.code].filter(Boolean);
  return parts.join(', ') || null;
}

export function transformOpportunity(opp: SamOpportunity): ContractRow {
  const { agency, subAgency } = extractDepartment(opp.fullParentPathName);
  const primaryPoc = opp.pointOfContact?.find(p => (p.type || '').toLowerCase() === 'primary')
    ?? opp.pointOfContact?.[0]
    ?? null;

  return {
    external_id: opp.noticeId,
    source: 'sam_gov',
    title: opp.title,
    value: opp.award?.amount ?? null,
    status: opp.typeOfSetAsideDesc || opp.typeOfSetAside || null,
    signal_type: opp.type === 'Award' ? 'Award' : 'Opportunity',
    award_date: opp.award?.date ?? null,
    raw_payload: opp,
    org_id: null,
    office_code: extractOfficeCode(opp.fullParentPathCode),
    awarding_agency: agency,
    // Enriched
    description: stripHtml(opp.description),
    naics: opp.naicsCode ?? null,
    psc_code: opp.classificationCode ?? null,
    set_aside: opp.typeOfSetAsideDesc || opp.typeOfSetAside || null,
    solicitation_number: opp.solicitationNumber ?? null,
    notice_type: opp.type || opp.baseType || null,
    deadline: opp.responseDeadLine ?? null,
    published_date: opp.postedDate ?? null,
    poc: primaryPoc?.fullName ?? null,
    poc_email: primaryPoc?.email ?? null,
    poc_phone: primaryPoc?.phone ?? null,
    place_of_performance: extractPlaceOfPerformance(opp.placeOfPerformance),
    agency,
    sub_agency: subAgency,
    recipient: opp.award?.awardee?.name ?? null,
  };
}
