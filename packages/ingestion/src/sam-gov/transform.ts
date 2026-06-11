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
}

function mapSetAside(code?: string): string | null {
  const map: Record<string, string> = {
    SBA: 'Competed', '8A': 'Competed', HZC: 'Competed',
    SDVOSBC: 'Competed', WOSB: 'Competed', EDWOSB: 'Competed',
    VSB: 'Competed', RSB: 'Competed', NONE: 'Competed',
    SBP: 'Sole Source',
  };
  return code ? (map[code] ?? 'Competed') : null;
}

// Extract FA-code from last path segment: "FA4600  55 CONS  PKP" → "fa4600"
function extractOfficeCode(fullParentPathCode?: string): string | null {
  if (!fullParentPathCode) return null;
  const segments = fullParentPathCode.split('.');
  const last = segments[segments.length - 1]?.trim().toLowerCase();
  return last || null;
}

// Second segment of fullParentPathName is the dept: "DEPT OF DEFENSE.DEPT OF THE AIR FORCE...."
function extractDepartment(fullParentPathName?: string): string | null {
  if (!fullParentPathName) return null;
  const segments = fullParentPathName.split('.');
  return segments[1]?.trim() ?? segments[0]?.trim() ?? null;
}

export function transformOpportunity(opp: SamOpportunity): ContractRow {
  return {
    external_id: opp.noticeId,
    source: 'sam_gov',
    title: opp.title,
    value: opp.award?.amount ?? null,
    status: mapSetAside(opp.typeOfSetAside),
    signal_type: opp.type === 'Award' ? 'Award' : 'Opportunity',
    award_date: opp.award?.date ?? null,
    raw_payload: opp,
    org_id: null,
    office_code: extractOfficeCode(opp.fullParentPathCode),
    awarding_agency: extractDepartment(opp.fullParentPathName),
  };
}
