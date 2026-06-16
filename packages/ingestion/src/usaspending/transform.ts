import type { UsaAward } from './fetch';
import type { ContractRow } from '../sam-gov/transform';

export function transformAward(award: UsaAward): ContractRow {
  const city = award['Place of Performance City Name'];
  const state = award['Place of Performance State Code'];
  const placeOfPerformance = [city, state].filter(Boolean).join(', ') || null;

  return {
    external_id:          award['Award ID'],
    source:               'usaspending',
    title:                `${award['Recipient Name']} — ${award['Awarding Agency']}`,
    value:                award['Award Amount'],
    status:               null,
    signal_type:          'Award',
    award_date:           award['Award Date'],
    raw_payload:          award,
    org_id:               null,
    office_code:          null,
    awarding_agency:      award['Awarding Agency'] ?? null,
    recipient:            award['Recipient Name'] ?? null,
    agency:               award['Awarding Agency'] ?? null,
    sub_agency:           award['Awarding Sub Agency'] ?? null,
    description:          award['Description'] ?? null,
    naics:                award['NAICS Code'] ? String(award['NAICS Code']) : null,
    psc_code:             award['PSC Code'] ?? null,
    notice_type:          award['Contract Award Type'] ?? null,
    place_of_performance: placeOfPerformance,
    set_aside:            null,
    solicitation_number:  null,
    deadline:             null,
    published_date:       null,
    poc:                  null,
    poc_email:            null,
    poc_phone:            null,
  };
}
