/**
 * Job implementations — engineering spec §8.
 *
 * Each is a plain async function taking a sql handle, so it can be run from
 * the worker, from a CLI, or from a test without a Redis connection.
 */
import type postgres from 'postgres';
import { syncOpportunities } from '../lib/ingestion/opportunities/sync';
import { syncUsaSpending } from '../lib/ingestion/usaspending/sync';
import { detectSignals } from '../lib/signals/detect';
import { scoreCompany, listScorableCompanies, loadOpportunities } from '../lib/matching/run';
import { generateCaptureBrief, listBriefsToGenerate } from '../lib/capture/generate';
import { sendAllBriefings } from '../lib/briefing/send';
import type { JobName } from './queues';

type Sql = ReturnType<typeof postgres>;

export interface JobResult {
  name: JobName;
  ok: boolean;
  detail: Record<string, unknown>;
}

async function runIngestSam(sql: Sql): Promise<JobResult> {
  const result = await syncOpportunities(sql, { lookbackDays: 7 });
  return {
    name: 'ingest-sam',
    ok: true,
    detail: {
      fetched: result.fetched,
      inserted: result.inserted,
      updated: result.updated,
      skipped: result.skipped,
      errored: result.errored,
      orgResolutionRate: Number(result.resolvedOrgRate.toFixed(3)),
    },
  };
}

async function runIngestUsaSpending(sql: Sql): Promise<JobResult> {
  const result = await syncUsaSpending(sql);
  return { name: 'ingest-usaspending', ok: true, detail: { fetched: result.fetched, inserted: result.inserted } };
}

async function runDetectSignals(sql: Sql): Promise<JobResult> {
  const result = await detectSignals(sql);
  return { name: 'detect-signals', ok: true, detail: { ...result } };
}

/**
 * §8: score-matches, daily after ingest.
 *
 * Opportunities are loaded once and reused across every company — the set is
 * identical for all of them, and reloading per company turns an O(companies)
 * job into O(companies × opportunities) of database traffic.
 */
async function runScoreMatches(sql: Sql): Promise<JobResult> {
  const companies = await listScorableCompanies(sql);
  const opportunities = await loadOpportunities(sql, { postedWithinDays: 90 });

  let strong = 0;
  let fair = 0;
  let failed = 0;

  for (const companyId of companies) {
    try {
      const result = await scoreCompany(sql, companyId, { opportunities });
      strong += result.strong;
      fair += result.fair;
    } catch (err) {
      failed++;
      console.error(`  scoring ${companyId}: ${(err as Error).message}`);
    }
  }

  return {
    name: 'score-matches',
    ok: true,
    detail: { companies: companies.length, opportunities: opportunities.length, strong, fair, failed },
  };
}

/** §8: generate-briefs, daily after scoring. Strong matches only (§6). */
async function runGenerateBriefs(sql: Sql): Promise<JobResult> {
  const pending = await listBriefsToGenerate(sql);
  let generated = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await generateCaptureBrief(sql, item.userCompanyId, item.opportunityId);
      generated++;
    } catch (err) {
      failed++;
      console.error(`  brief ${item.userCompanyId}/${item.opportunityId}: ${(err as Error).message}`);
    }
  }

  return { name: 'generate-briefs', ok: true, detail: { pending: pending.length, generated, failed } };
}

async function runSendBriefings(sql: Sql): Promise<JobResult> {
  const results = await sendAllBriefings(sql);
  const sent = results.filter((r) => r.status === 'sent').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  return { name: 'send-briefings', ok: failed === 0, detail: { attempted: results.length, sent, failed } };
}

const HANDLERS: Record<JobName, (sql: Sql) => Promise<JobResult>> = {
  'ingest-sam': runIngestSam,
  'ingest-usaspending': runIngestUsaSpending,
  'detect-signals': runDetectSignals,
  'score-matches': runScoreMatches,
  'generate-briefs': runGenerateBriefs,
  'send-briefings': runSendBriefings,
};

export async function runJob(sql: Sql, name: JobName): Promise<JobResult> {
  const handler = HANDLERS[name];
  if (!handler) throw new Error(`Unknown job: ${name}`);

  const started = Date.now();
  console.log(`[job] ${name} starting`);
  try {
    const result = await handler(sql);
    console.log(`[job] ${name} finished in ${Date.now() - started}ms`, result.detail);
    return result;
  } catch (err) {
    console.error(`[job] ${name} failed after ${Date.now() - started}ms: ${(err as Error).message}`);
    throw err;
  }
}

export { HANDLERS };
