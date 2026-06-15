const BASE = 'https://api.beholder-gov.com/api/v1';

function headers() {
  const key = process.env.BEHOLDER_GOV_API_KEY;
  if (!key) throw new Error('BEHOLDER_GOV_API_KEY not set');
  return { 'X-API-Key': key, 'Content-Type': 'application/json' };
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`Beholder-Gov ${path}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface RiskIndicator {
  signal_type: string;
  severity: string;
  score: number;
  evidence: string;
}

export interface BeholderAuditLead {
  id: string;
  title: string;
  description?: string;
  agency?: string;
  office?: string;
  contractor?: string;
  naics?: string;
  award_amount?: number;
  award_date?: string;
  risk_score?: number;
  risk_indicators?: RiskIndicator[];
  [key: string]: unknown;
}

export interface BeholderAward {
  id: string;
  title?: string;
  description?: string;
  agency?: string;
  sub_agency?: string;
  office?: string;
  recipient_name?: string;
  award_amount?: number;
  award_date?: string;
  naics?: string;
  set_aside?: string;
  risk_score?: number;
  risk_indicators?: RiskIndicator[];
  [key: string]: unknown;
}

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export async function fetchBeholderAuditLeads(page = 1, pageSize = 50): Promise<BeholderAuditLead[]> {
  const data = await get<ListResponse<BeholderAuditLead>>('/audit-leads', {
    page: String(page),
    page_size: String(pageSize),
  });
  return data.items ?? [];
}

export async function fetchBeholderAwards(page = 1, pageSize = 100): Promise<BeholderAward[]> {
  const data = await get<ListResponse<BeholderAward>>('/awards', {
    page: String(page),
    page_size: String(pageSize),
  });
  return data.items ?? [];
}
