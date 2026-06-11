import type { UsaAward } from './fetch';
import type { ContractRow } from '../sam-gov/transform';

export function transformAward(award: UsaAward): ContractRow {
  return {
    external_id: award['Award ID'],
    source: 'usaspending',
    title: `${award['Recipient Name']} — ${award['Awarding Agency']}`,
    value: award['Award Amount'],
    status: null,
    signal_type: 'Award',
    award_date: award['Award Date'],
    raw_payload: award,
    org_id: null,
    office_code: null,
    awarding_agency: award['Awarding Agency'] ?? null,
  };
}
