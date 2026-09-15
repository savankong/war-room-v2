/**
 * USASpending awards fetcher — engineering spec §4.
 *
 * The v2 version asked for five fields, one page of 100, with no agency
 * filter. That is enough to say who won something recently and not enough for
 * §6, which needs period of performance, PSC, vehicle and obligation totals to
 * identify an incumbent and read a recompete.
 *
 * Field names below are USASpending's display-name style for
 * spending_by_award. They are not verified against the live API — the
 * transform reads every field defensively and tolerates a rename rather than
 * writing nulls silently. Run `npm run verify-dod-agencies` for the agency
 * half of §4's "confirm against the live APIs" instruction.
 */
const SEARCH_URL = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';

/** USASpending caps page size at 100. */
const PAGE_SIZE = 100;

export interface UsaAward {
  'Award ID'?: string;
  'Recipient Name'?: string;
  'Recipient UEI'?: string;
  'Award Amount'?: number | string;
  'Total Obligations'?: number | string;
  'Awarding Agency'?: string;
  'Awarding Sub Agency'?: string;
  'Award Date'?: string;
  'Start Date'?: string;
  'End Date'?: string;
  'Last Modified Date'?: string;
  'Contract Award Type'?: string;
  Description?: string;
  NAICS?: string;
  PSC?: string;
  generated_internal_id?: string;
  [key: string]: unknown;
}

const FIELDS = [
  'Award ID',
  'Recipient Name',
  'Recipient UEI',
  'Award Amount',
  'Total Obligations',
  'Awarding Agency',
  'Awarding Sub Agency',
  'Award Date',
  'Start Date',
  'End Date',
  'Last Modified Date',
  'Contract Award Type',
  'Description',
  'NAICS',
  'PSC',
];

/**
 * §4 restricts ingestion to DoD. USASpending filters by toptier agency name,
 * not code, and these four names cover the military departments plus the
 * Fourth Estate (which reports under Department of Defense).
 */
const DOD_TOPTIER_NAMES = [
  'Department of Defense',
  'Department of the Army',
  'Department of the Navy',
  'Department of the Air Force',
];

export interface UsaSpendingFetchOptions {
  lookbackDays?: number;
  maxRecords?: number;
  fetchImpl?: typeof fetch;
}

export async function fetchUsaSpendingAwards(
  options: UsaSpendingFetchOptions = {},
): Promise<UsaAward[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const lookbackDays = options.lookbackDays ?? 30;

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - lookbackDays);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const collected: UsaAward[] = [];
  let page = 1;

  for (;;) {
    const res = await fetchImpl(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          // A/B/C/D are the contract award types; grants and loans are not
          // procurement and have no place in the incumbent read.
          award_type_codes: ['A', 'B', 'C', 'D'],
          time_period: [{ start_date: fmt(from), end_date: fmt(today) }],
          agencies: DOD_TOPTIER_NAMES.map((name) => ({
            type: 'awarding',
            tier: 'toptier',
            name,
          })),
        },
        fields: FIELDS,
        limit: PAGE_SIZE,
        page,
        sort: 'Award Amount',
        order: 'desc',
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`USASpending API error ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as { results?: UsaAward[]; page_metadata?: { hasNext?: boolean } };
    const batch = data.results ?? [];
    collected.push(...batch);

    if (options.maxRecords && collected.length >= options.maxRecords) {
      return collected.slice(0, options.maxRecords);
    }

    const hasNext = data.page_metadata?.hasNext ?? batch.length === PAGE_SIZE;
    if (!hasNext || !batch.length) break;
    page += 1;
  }

  return collected;
}
