export interface UsaAward {
  'Award ID': string;
  'Recipient Name': string;
  'Award Amount': number;
  'Awarding Agency': string;
  'Award Date': string;
  [key: string]: unknown;
}

export async function fetchUsaSpendingAwards(): Promise<UsaAward[]> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const res = await fetch('https://api.usaspending.gov/api/v2/awards/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: {
        award_type_codes: ['A', 'B', 'C', 'D'],
        date_type: 'date_signed',
        date_range: { start_date: fmt(thirtyDaysAgo), end_date: fmt(today) },
      },
      fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency', 'Award Date'],
      limit: 100,
      page: 1,
    }),
  });

  if (!res.ok) throw new Error(`USASpending API error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  return (data.results ?? []) as UsaAward[];
}
