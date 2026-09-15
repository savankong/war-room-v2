import type { UsaAward } from './fetch';

export interface AwardContractRow {
  external_id: string;
  source: 'usaspending';
  title: string;
  value: string | null;
  status: string | null;
  signal_type: 'Award';
  award_date: string | null;
  start_date: string | null;
  end_date: string | null;
  naics_code: string | null;
  psc_code: string | null;
  vehicle: string | null;
  total_obligation: number | null;
  modification_count: number | null;
  recipient: string | null;
  recipient_uei: string | null;
  raw_payload: UsaAward;
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s || null;
}

function amount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function date(value: unknown): string | null {
  const s = text(value);
  if (!s) return null;
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

/**
 * USASpending returns NAICS and PSC as "541512 -- Computer Systems Design" in
 * some responses and as a bare code in others. Only the code is useful for
 * matching (§5 compares codes and 4-digit families).
 */
function code(value: unknown): string | null {
  const s = text(value);
  if (!s) return null;
  const match = /^([A-Za-z0-9]+)/.exec(s);
  return match ? match[1] : null;
}

export function transformAward(award: UsaAward): AwardContractRow {
  const recipient = text(award['Recipient Name']);
  const agency = text(award['Awarding Sub Agency']) ?? text(award['Awarding Agency']);

  // The award id is the natural key; generated_internal_id is the fallback
  // because some award types return the former empty.
  const externalId = text(award['Award ID']) ?? text(award.generated_internal_id);

  return {
    external_id: externalId ?? `usaspending-unknown-${Date.now()}`,
    source: 'usaspending',
    // Prefer the real description. The v2 title was always
    // "RECIPIENT — AGENCY", which made title-similarity incumbent matching
    // (§6) compare a vendor name against an opportunity title and never hit.
    title: text(award.Description) ?? [recipient, agency].filter(Boolean).join(' — ') ?? 'Untitled award',
    value: text(award['Award Amount']),
    status: text(award['Contract Award Type']),
    signal_type: 'Award',
    award_date: date(award['Award Date']),
    start_date: date(award['Start Date']),
    end_date: date(award['End Date']),
    naics_code: code(award.NAICS),
    psc_code: code(award.PSC),
    vehicle: text(award['Contract Award Type']),
    total_obligation: amount(award['Total Obligations']) ?? amount(award['Award Amount']),
    // USASpending's search endpoint does not return a modification count; it
    // lives on the award detail endpoint. Left null rather than guessed —
    // product spec §8 rule 1 forbids invented contract values, and a brief
    // that says "0 modifications" when we never checked is exactly that.
    modification_count: null,
    recipient,
    recipient_uei: text(award['Recipient UEI']),
    raw_payload: award,
  };
}
