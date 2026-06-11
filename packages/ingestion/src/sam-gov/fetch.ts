export interface SamOpportunity {
  noticeId: string;
  title: string;
  type: string;
  typeOfSetAside?: string;
  departmentName?: string;
  agencyName?: string;
  award?: { amount?: number; date?: string };
  [key: string]: unknown;
}

export async function fetchSamOpportunities(): Promise<SamOpportunity[]> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  if (!apiKey) throw new Error('SAM_GOV_API_KEY not set');

  const today = new Date();
  const ago30 = new Date(today);
  ago30.setDate(today.getDate() - 30);
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;

  const params = new URLSearchParams({
    api_key: apiKey,
    limit: '100',
    offset: '0',
    postedFrom: fmt(ago30),
    postedTo: fmt(today),
  });

  const res = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`);
  if (!res.ok) throw new Error(`SAM.gov API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return (data.opportunitiesData ?? []) as SamOpportunity[];
}
