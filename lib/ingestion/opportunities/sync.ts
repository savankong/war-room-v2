/**
 * SAM opportunities sync — engineering spec §4.
 *
 * Upsert on (source, external_id). Log every run to ingestion_runs with
 * inserted, updated, skipped, errored counts. Unresolved orgs keep
 * department_slug, get canonical_org_id = NULL, and stay in the table for the
 * admin review queue — they are never dropped.
 *
 * Acceptance criteria this satisfies:
 *   2. Re-running the same day produces zero duplicate rows.
 *   3. At least 85% of ingested opportunities resolve to a non-null
 *      canonical_org_id; unresolved rows appear in the admin queue.
 */
import type postgres from 'postgres';
import { isDodNotice } from '../../dod-scope';
import { resolveOrg, clearOrgCache } from '../org-resolver';
import { startRun, completeRun, failRun, emptyCounters, type RunCounters } from '../run-log';
import { fetchOpportunities, type FetchOptions, type SamOpportunity } from './fetch';
import { transformOpportunity, type OpportunityRow } from './transform';

type Sql = ReturnType<typeof postgres>;

export interface SyncOptions extends FetchOptions {
  /** Skip the API and use these notices. Used by tests and by replay. */
  notices?: SamOpportunity[];
  /** Parse and resolve but write nothing. */
  dryRun?: boolean;
}

export interface SyncResult extends RunCounters {
  runId: string | null;
  fetched: number;
  outOfScope: number;
  /** inserted + updated, over everything that reached the upsert. */
  resolvedOrgRate: number;
}

/**
 * The upsert deliberately does NOT overwrite canonical_org_id with NULL. Org
 * resolution improves as orgs are backfilled, and a later run that fails to
 * resolve must not erase a value an earlier run (or an admin) established.
 */
async function upsertOpportunity(
  sql: Sql,
  row: OpportunityRow,
  canonicalOrgId: string | null,
): Promise<'inserted' | 'updated'> {
  const result = await sql<{ inserted: boolean }[]>`
    INSERT INTO opportunities (
      external_id, source, title, notice_type, solicitation_number,
      naics_code, psc_code, set_aside, posted_date, response_deadline,
      archive_date, department_slug, canonical_org_id, office_name,
      estimated_value, description, ui_url, place_of_performance,
      poc_name, poc_email, raw_payload
    ) VALUES (
      ${row.external_id}, ${row.source}, ${row.title}, ${row.notice_type},
      ${row.solicitation_number}, ${row.naics_code}, ${row.psc_code},
      ${row.set_aside}, ${row.posted_date}, ${row.response_deadline},
      ${row.archive_date}, ${row.department_slug}, ${canonicalOrgId},
      ${row.office_name}, ${row.estimated_value}, ${row.description},
      ${row.ui_url}, ${row.place_of_performance}, ${row.poc_name},
      ${row.poc_email}, ${sql.json(row.raw_payload as never)}
    )
    ON CONFLICT (source, external_id) DO UPDATE SET
      title                = EXCLUDED.title,
      notice_type          = EXCLUDED.notice_type,
      solicitation_number  = EXCLUDED.solicitation_number,
      naics_code           = EXCLUDED.naics_code,
      psc_code             = EXCLUDED.psc_code,
      set_aside            = EXCLUDED.set_aside,
      posted_date          = EXCLUDED.posted_date,
      response_deadline    = EXCLUDED.response_deadline,
      archive_date         = EXCLUDED.archive_date,
      department_slug      = COALESCE(EXCLUDED.department_slug, opportunities.department_slug),
      canonical_org_id     = COALESCE(EXCLUDED.canonical_org_id, opportunities.canonical_org_id),
      office_name          = COALESCE(EXCLUDED.office_name, opportunities.office_name),
      estimated_value      = COALESCE(EXCLUDED.estimated_value, opportunities.estimated_value),
      description          = COALESCE(EXCLUDED.description, opportunities.description),
      ui_url               = COALESCE(EXCLUDED.ui_url, opportunities.ui_url),
      place_of_performance = COALESCE(EXCLUDED.place_of_performance, opportunities.place_of_performance),
      poc_name             = COALESCE(EXCLUDED.poc_name, opportunities.poc_name),
      poc_email            = COALESCE(EXCLUDED.poc_email, opportunities.poc_email),
      raw_payload          = EXCLUDED.raw_payload,
      updated_at           = now()
    RETURNING (xmax = 0) AS inserted
  `;
  return result[0]?.inserted ? 'inserted' : 'updated';
}

/**
 * Record a new_notice or sources_sought signal for a genuinely new row.
 * Only on insert: an update is an edit to a notice we already told people
 * about, and re-signalling it would put it back in the briefing.
 */
async function recordNoticeSignal(
  sql: Sql,
  externalId: string,
  row: OpportunityRow,
  canonicalOrgId: string | null,
): Promise<void> {
  const isSourcesSought = (row.notice_type ?? '').toLowerCase().includes('sources sought');
  const occurredAt = row.posted_date ?? new Date().toISOString().slice(0, 10);

  await sql`
    INSERT INTO signals (type, subject_type, subject_id, canonical_org_id, payload, occurred_at)
    SELECT
      ${isSourcesSought ? 'sources_sought' : 'new_notice'},
      'opportunity',
      o.id,
      ${canonicalOrgId},
      ${sql.json({ title: row.title, notice_type: row.notice_type, office_name: row.office_name })},
      ${occurredAt}::timestamptz
    FROM opportunities o
    WHERE o.source = 'sam' AND o.external_id = ${externalId}
    ON CONFLICT (type, subject_type, subject_id, occurred_at) DO NOTHING
  `;
}

export async function syncOpportunities(sql: Sql, options: SyncOptions = {}): Promise<SyncResult> {
  clearOrgCache();

  const counters = emptyCounters();
  let fetched = 0;
  let outOfScope = 0;
  let runId: string | null = null;

  if (!options.dryRun) {
    runId = await startRun(sql, 'sam_opportunities');
  }

  try {
    const notices = options.notices ?? (await fetchOpportunities(options));
    fetched = notices.length;

    for (const notice of notices) {
      if (!notice?.noticeId) {
        counters.skipped++;
        continue;
      }

      // §4 DoD scope filter. Out-of-scope notices are counted, not errors.
      if (!isDodNotice(notice.fullParentPathCode, notice.fullParentPathName)) {
        outOfScope++;
        counters.skipped++;
        continue;
      }

      try {
        const row = transformOpportunity(notice);
        const { canonicalOrgId } = await resolveOrg(sql, row._parentPathCode, row._parentPathName);
        if (!canonicalOrgId) counters.unresolvedOrg++;

        if (options.dryRun) {
          counters.inserted++;
          continue;
        }

        const outcome = await upsertOpportunity(sql, row, canonicalOrgId);
        counters[outcome === 'inserted' ? 'inserted' : 'updated']++;

        if (outcome === 'inserted') {
          await recordNoticeSignal(sql, row.external_id, row, canonicalOrgId);
        }
      } catch (err) {
        counters.errored++;
        // One malformed notice must not abort the run. The count surfaces in
        // the admin screen; the message goes to the worker log.
        console.error(`  notice ${notice.noticeId}: ${(err as Error).message}`);
      }
    }

    if (runId) await completeRun(sql, runId, counters);
  } catch (err) {
    if (runId) await failRun(sql, runId, (err as Error).message, counters);
    throw err;
  }

  const upserted = counters.inserted + counters.updated;
  const resolvedOrgRate = upserted ? (upserted - counters.unresolvedOrg) / upserted : 1;

  return { ...counters, runId, fetched, outOfScope, resolvedOrgRate };
}
