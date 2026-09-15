/**
 * SAM.gov opportunities fetcher — engineering spec §4.
 *
 * Differences from the v2 fetcher (packages/ingestion/src/sam-gov/fetch.ts),
 * which pulled a single page of 100 notices and stopped:
 *
 *  - Pages to exhaustion, so a daily run actually sees the whole window.
 *  - Filters to the in-scope notice types (§4) at the API rather than locally,
 *    which keeps award notices out of the opportunities table entirely.
 *  - Retries on 429 and 5xx. SAM rate-limits hard and a daily job that dies on
 *    the first 429 silently ingests nothing.
 */
import { IN_SCOPE_PTYPES } from '../../dod-scope';

export interface SamPointOfContact {
  type?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface SamOpportunity {
  noticeId: string;
  title: string;
  type?: string;
  baseType?: string;
  typeOfSetAside?: string;
  typeOfSetAsideDesc?: string;
  naicsCode?: string;
  classificationCode?: string; // PSC
  solicitationNumber?: string;
  responseDeadLine?: string;
  postedDate?: string;
  archiveDate?: string;
  fullParentPathName?: string;
  fullParentPathCode?: string;
  organizationType?: string;
  officeAddress?: { city?: string; state?: string; zipcode?: string };
  description?: string;
  uiLink?: string;
  pointOfContact?: SamPointOfContact[];
  placeOfPerformance?: {
    city?: { name?: string };
    state?: { name?: string; code?: string };
    country?: { code?: string };
  };
  award?: { amount?: number | string; date?: string; awardee?: { name?: string } };
  [key: string]: unknown;
}

const SAM_SEARCH_URL = 'https://api.sam.gov/opportunities/v2/search';

/** SAM caps `limit` at 1000, but large pages time out; 500 is the stable size. */
const PAGE_SIZE = 500;

/** SAM rejects a postedFrom/postedTo span wider than one year. */
const MAX_WINDOW_DAYS = 365;

export interface FetchOptions {
  /** Days back from today. Daily runs use a small overlap to catch late edits. */
  lookbackDays?: number;
  /** Stop after this many notices. Unset means fetch everything in the window. */
  maxRecords?: number;
  apiKey?: string;
  /** Injected in tests. */
  fetchImpl?: typeof fetch;
}

function formatSamDate(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(
  url: string,
  fetchImpl: typeof fetch,
  attempt = 0,
): Promise<{ opportunitiesData?: SamOpportunity[]; totalRecords?: number }> {
  const res = await fetchImpl(url);

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 4) {
      throw new Error(`SAM.gov ${res.status} after ${attempt + 1} attempts`);
    }
    // 2s, 4s, 8s, 16s. SAM's per-key daily quota resets at midnight UTC, so a
    // 429 that survives all four retries is a quota exhaustion, not a burst.
    const backoffMs = 2000 * 2 ** attempt;
    console.warn(`  SAM.gov ${res.status}; retrying in ${backoffMs}ms`);
    await sleep(backoffMs);
    return fetchPage(url, fetchImpl, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`SAM.gov API error ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }

  return res.json();
}

/**
 * Fetch in-scope DoD notices posted in the lookback window.
 *
 * DoD filtering happens in the transform, not here: SAM's department filter
 * parameters have changed shape more than once, and over-filtering at the API
 * silently loses notices we would never know we missed. Pulling wide and
 * filtering locally costs bandwidth and keeps the miss visible in the counts.
 */
export async function fetchOpportunities(options: FetchOptions = {}): Promise<SamOpportunity[]> {
  const apiKey = options.apiKey ?? process.env.SAM_GOV_API_KEY ?? process.env.SAM_API_KEY;
  if (!apiKey) throw new Error('SAM_GOV_API_KEY not set');

  const fetchImpl = options.fetchImpl ?? fetch;
  const lookbackDays = Math.min(options.lookbackDays ?? 7, MAX_WINDOW_DAYS);

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - lookbackDays);

  const collected: SamOpportunity[] = [];

  // One request per notice type: SAM's ptype parameter takes a single value,
  // and passing several comma-joined silently returns only the first.
  for (const ptype of IN_SCOPE_PTYPES) {
    let offset = 0;

    for (;;) {
      const params = new URLSearchParams({
        api_key: apiKey,
        limit: String(PAGE_SIZE),
        offset: String(offset),
        postedFrom: formatSamDate(from),
        postedTo: formatSamDate(today),
        ptype,
      });

      const page = await fetchPage(`${SAM_SEARCH_URL}?${params}`, fetchImpl);
      const batch = page.opportunitiesData ?? [];
      collected.push(...batch);

      if (options.maxRecords && collected.length >= options.maxRecords) {
        return collected.slice(0, options.maxRecords);
      }

      if (batch.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;

      // Stay well inside SAM's rate limit across a multi-page pull.
      await sleep(250);
    }
  }

  return collected;
}
