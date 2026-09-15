/**
 * Integration test for the SAM opportunities sync.
 *
 * Covers engineering spec §10 acceptance criteria 2 and 3:
 *   2. A daily ingestion run logs to ingestion_runs, and re-running the same
 *      day produces zero duplicate rows.
 *   3. At least 85% of ingested opportunities resolve to a non-null
 *      canonical_org_id. Unresolved rows appear in the admin queue.
 *
 * Needs a database. Set TEST_DATABASE_URL to a throwaway Postgres with the
 * migrations applied; the suite skips itself when that is unset so the unit
 * tests still run anywhere.
 *
 *   createdb warroom_test
 *   DATABASE_URL_DIRECT=postgres://.../warroom_test npm run migrate
 *   TEST_DATABASE_URL=postgres://.../warroom_test npm test
 */
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import postgres from 'postgres';
import { syncOpportunities } from './sync';
import { clearOrgCache } from '../org-resolver';
import type { SamOpportunity } from './fetch';

const TEST_DB = process.env.TEST_DATABASE_URL;

type Sql = ReturnType<typeof postgres>;
let sql: Sql;

function notice(overrides: Partial<SamOpportunity> = {}): SamOpportunity {
  return {
    noticeId: `notice-${Math.random().toString(36).slice(2)}`,
    title: 'Enterprise Cloud Migration Support',
    type: 'Sources Sought',
    naicsCode: '541512',
    classificationCode: 'D399',
    postedDate: '2026-09-01',
    responseDeadLine: '2026-12-30T17:00:00-04:00',
    // DISA is one of the 21 blocking orgs migration 051 guarantees.
    fullParentPathName: 'DEPT OF DEFENSE.DEFENSE INFORMATION SYSTEMS AGENCY',
    fullParentPathCode: '097.9700.DISA',
    ...overrides,
  };
}

describe('syncOpportunities', { skip: TEST_DB ? false : 'TEST_DATABASE_URL not set' }, () => {
  before(() => {
    sql = postgres(TEST_DB!, { max: 1, prepare: false, onnotice: () => {} });
  });

  after(async () => {
    await sql?.end({ timeout: 5 });
  });

  beforeEach(async () => {
    clearOrgCache();
    await sql`DELETE FROM signals WHERE subject_type = 'opportunity'`;
    await sql`DELETE FROM opportunities`;
    await sql`DELETE FROM ingestion_runs WHERE source = 'sam_opportunities'`;
  });

  test('inserts in-scope notices and logs the run', async () => {
    const result = await syncOpportunities(sql, {
      notices: [notice(), notice(), notice()],
    });

    assert.equal(result.inserted, 3);
    assert.equal(result.updated, 0);
    assert.equal(result.errored, 0);

    const [run] = await sql<{ status: string; inserted_count: number; records_synced: number }[]>`
      SELECT status, inserted_count, records_synced FROM ingestion_runs WHERE id = ${result.runId!}
    `;
    assert.equal(run.status, 'success');
    assert.equal(run.inserted_count, 3);
    assert.equal(run.records_synced, 3);
  });

  // Acceptance criterion 2.
  test('re-running the same notices produces zero duplicate rows', async () => {
    const batch = [notice(), notice(), notice()];

    const first = await syncOpportunities(sql, { notices: batch });
    assert.equal(first.inserted, 3);

    const second = await syncOpportunities(sql, { notices: batch });
    assert.equal(second.inserted, 0, 'second run must insert nothing');
    assert.equal(second.updated, 3);

    const [{ count }] = await sql<{ count: string }[]>`SELECT count(*) FROM opportunities`;
    assert.equal(Number(count), 3);
  });

  test('an update does not overwrite a resolved org with null', async () => {
    const one = notice();
    await syncOpportunities(sql, { notices: [one] });

    const [before] = await sql<{ canonical_org_id: string | null }[]>`
      SELECT canonical_org_id FROM opportunities WHERE external_id = ${one.noticeId}
    `;
    assert.ok(before.canonical_org_id, 'first run should resolve DISA');

    // Same notice, but the org path has gone missing upstream.
    clearOrgCache();
    await syncOpportunities(sql, {
      notices: [{ ...one, fullParentPathCode: undefined, fullParentPathName: 'DEPT OF DEFENSE' }],
    });

    const [after] = await sql<{ canonical_org_id: string | null }[]>`
      SELECT canonical_org_id FROM opportunities WHERE external_id = ${one.noticeId}
    `;
    assert.equal(after.canonical_org_id, before.canonical_org_id);
  });

  test('skips notices outside DoD without erroring', async () => {
    const result = await syncOpportunities(sql, {
      notices: [
        notice(),
        notice({
          fullParentPathCode: '070.7000.HSCG',
          fullParentPathName: 'DEPT OF HOMELAND SECURITY.US COAST GUARD',
        }),
      ],
    });

    assert.equal(result.inserted, 1);
    assert.equal(result.outOfScope, 1);
    assert.equal(result.skipped, 1);
    assert.equal(result.errored, 0);
  });

  // Acceptance criterion 3.
  test('keeps unresolved-org rows and leaves them in the admin queue', async () => {
    const unresolvable = notice({
      fullParentPathCode: '097.9700.ZZZNOSUCHOFFICE',
      fullParentPathName: 'DEPT OF DEFENSE.ZZZ NONEXISTENT COMMAND',
    });

    const result = await syncOpportunities(sql, { notices: [unresolvable] });

    // Never dropped (§4): the row is written with department_slug intact.
    assert.equal(result.inserted, 1);

    const [row] = await sql<{ canonical_org_id: string | null; department_slug: string }[]>`
      SELECT canonical_org_id, department_slug FROM opportunities
      WHERE external_id = ${unresolvable.noticeId}
    `;
    assert.equal(row.department_slug, 'DEPT OF DEFENSE');

    // The admin queue is exactly this slice.
    const queue = await sql`
      SELECT id FROM opportunities WHERE canonical_org_id IS NULL
    `;
    assert.equal(queue.length, 1);
  });

  test('reports the org resolution rate the 85% criterion is measured against', async () => {
    const notices = [
      notice(),
      notice(),
      notice(),
      notice(),
      notice({
        fullParentPathCode: '097.9700.ZZZNOSUCHOFFICE',
        fullParentPathName: 'DEPT OF DEFENSE.ZZZ NONEXISTENT COMMAND',
      }),
    ];

    const result = await syncOpportunities(sql, { notices });
    assert.equal(result.inserted, 5);
    assert.equal(result.unresolvedOrg, 1);
    assert.equal(result.resolvedOrgRate, 0.8);
  });

  test('records a sources_sought signal on insert but not on re-ingest', async () => {
    const one = notice({ type: 'Sources Sought' });

    await syncOpportunities(sql, { notices: [one] });
    const afterFirst = await sql`SELECT id FROM signals WHERE type = 'sources_sought'`;
    assert.equal(afterFirst.length, 1);

    await syncOpportunities(sql, { notices: [one] });
    const afterSecond = await sql`SELECT id FROM signals WHERE type = 'sources_sought'`;
    assert.equal(afterSecond.length, 1, 'an edit to a known notice must not re-signal');
  });

  test('one malformed notice does not abort the run', async () => {
    const result = await syncOpportunities(sql, {
      notices: [
        notice(),
        // No noticeId: cannot be keyed, must be skipped rather than thrown.
        notice({ noticeId: undefined as unknown as string }),
        notice(),
      ],
    });

    assert.equal(result.inserted, 2);
    assert.equal(result.skipped, 1);
  });
});
