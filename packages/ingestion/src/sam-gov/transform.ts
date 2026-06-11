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
    awarding_agency: opp.agencyName ?? opp.departmentName ?? null,
  };
}
