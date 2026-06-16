export interface UsaAward {
  'Award ID': string;
  'Recipient Name': string;
  'Award Amount': number;
  'Awarding Agency': string;
  'Awarding Sub Agency'?: string;
  'Award Date': string;
  'Description'?: string;
  'Place of Performance City Name'?: string;
  'Place of Performance State Code'?: string;
  'NAICS Code'?: string;
  'NAICS Description'?: string;
  'PSC Code'?: string;
  'Contract Award Type'?: string;
  'generated_internal_id'?: string;
  [key: string]: unknown;
}

export async function fetchUsaSpendingAwards(): Promise<UsaAward[]> {
  const today = new Date();
  const ago30 = new Date(today);
  ago30.setDate(today.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const fields = [
    'Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency',
    'Awarding Sub Agency', 'Award Date', 'Description',
    'Place of Performance City Name', 'Place of Performance State Code',
    'NAICS Code', 'NAICS Description', 'PSC Code',
    'Contract Award Type', 'generated_internal_id',
  ];

  const allResults: UsaAward[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          award_type_codes: ['A', 'B', 'C', 'D'],
          time_period: [{ start_date: fmt(ago30), end_date: fmt(today) }],
        },
        fields,
        limit,
        page,
        sort: 'Award Amount',
        order: 'desc',
      }),
    });

    if (!res.ok) throw new Error(`USASpending API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const results = (data.results ?? []) as UsaAward[];
    allResults.push(...results);

    if (!data.page_metadata?.hasNext || allResults.length >= 10000) break;
    page++;
  }

  return allResults;
}
