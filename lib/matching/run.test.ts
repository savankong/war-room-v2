/**
 * Integration test for the scoring run. Needs TEST_DATABASE_URL; see
 * lib/ingestion/opportunities/sync.test.ts for setup.
 *
 * Covers engineering spec §10 acceptance criterion 4: "For a seeded test
 * company, every Strong match has at least three evidence lines and zero
 * excluded-keyword hits."
 */
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import postgres from 'postgres';
import { scoreCompany, loadScoringContext, loadOpportunities } from './run';

const TEST_DB = process.env.TEST_DATABASE_URL;

type Sql = ReturnType<typeof postgres>;
let sql: Sql;
let companyId: string;

const EXCLUDED = 'janitorial';

async function seedCompany(): Promise<string> {
  const [user] = await sql<{ id: number }[]>`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${`scoring-${Date.now()}@example.test`}, 'x', 'Scoring Test')
    RETURNING id
  `;

  const [company] = await sql<{ id: string }[]>`
    INSERT INTO user_companies (name, owner_user_id, plan)
    VALUES ('Scoring Test Co', ${user.id}, 'trial')
    RETURNING id
  `;

  await sql`
    INSERT INTO company_profiles (
      user_company_id, naics_codes, psc_codes, set_asides, target_org_ids,
      capabilities, excluded_keywords, min_value, max_value
    ) VALUES (
      ${company.id}, ARRAY['541512'], ARRAY['D399'], ARRAY['Small Business'],
      ARRAY['disa'], ARRAY['cloud migration','zero trust'], ARRAY[${EXCLUDED}],
      500000, 10000000
    )
  `;

  await sql`
    INSERT INTO company_past_performance (user_company_id, canonical_org_id, title, naics_code)
    VALUES (${company.id}, 'disa', 'Prior DISA cloud work', '541512')
  `;

  return company.id;
}

async function seedOpportunity(overrides: Record<string, unknown> = {}): Promise<string> {
  const row = {
    external_id: `opp-${Math.random().toString(36).slice(2)}`,
    source: 'sam',
    title: 'Enterprise Cloud Migration Support',
    description: 'Support for cloud migration and zero trust architecture.',
    notice_type: 'Sources Sought',
    naics_code: '541512',
    psc_code: 'D399',
    set_aside: null,
    estimated_value: 2_000_000,
    response_deadline: new Date(Date.now() + 30 * 86_400_000),
    canonical_org_id: 'disa',
    posted_date: new Date().toISOString().slice(0, 10),
    ...overrides,
  };

  const [inserted] = await sql<{ id: string }[]>`
    INSERT INTO opportunities ${sql(row as never)} RETURNING id
  `;
  return inserted.id;
}

describe('scoreCompany', { skip: TEST_DB ? false : 'TEST_DATABASE_URL not set' }, () => {
  before(async () => {
    sql = postgres(TEST_DB!, { max: 1, prepare: false, onnotice: () => {} });
  });

  after(async () => {
    await sql?.end({ timeout: 5 });
  });

  beforeEach(async () => {
    await sql`DELETE FROM matches`;
    await sql`DELETE FROM company_past_performance`;
    await sql`DELETE FROM company_profiles`;
    await sql`DELETE FROM user_companies`;
    await sql`DELETE FROM opportunities`;
    companyId = await seedCompany();
  });

  test('loads a profile, past performance and org lineage', async () => {
    const context = await loadScoringContext(sql, companyId);
    assert.ok(context);
    assert.deepEqual(context.profile.naicsCodes, ['541512']);
    assert.equal(context.profile.minValue, 500_000);
    assert.ok(context.lineage.targets.has('disa'));
    assert.ok(context.pastPerformance.orgLineage.has('disa'));
    assert.equal(context.pastPerformance.naicsCounts.get('541512'), 1);
  });

  test('a null value band stays null rather than becoming zero', async () => {
    await sql`UPDATE company_profiles SET min_value = NULL, max_value = NULL WHERE user_company_id = ${companyId}`;
    const context = await loadScoringContext(sql, companyId);
    assert.equal(context!.profile.minValue, null);
    assert.equal(context!.profile.maxValue, null);
  });

  test('persists matches and skips disqualified opportunities', async () => {
    await seedOpportunity();
    await seedOpportunity({ title: `${EXCLUDED} services for Building 4` });

    const result = await scoreCompany(sql, companyId);
    assert.equal(result.scored, 2);
    assert.equal(result.disqualified, 1);
    assert.equal(result.persisted, 1);

    const rows = await sql`SELECT fit FROM matches WHERE user_company_id = ${companyId}`;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].fit, 'strong');
  });

  // Acceptance criterion 4.
  test('every strong match has 3+ evidence lines and no excluded-keyword hit', async () => {
    await seedOpportunity();
    await seedOpportunity({ title: 'Zero Trust Architecture Support', estimated_value: 750_000 });
    await seedOpportunity({ title: `${EXCLUDED} support services` });
    await seedOpportunity({ title: 'Grounds Maintenance', naics_code: '561730', psc_code: 'S208', canonical_org_id: null, description: 'Mowing.' });

    const result = await scoreCompany(sql, companyId);
    const strong = result.results.filter((r) => r.fit === 'strong' && !r.disqualified);
    assert.ok(strong.length > 0, 'expected at least one strong match');

    for (const match of strong) {
      assert.ok(match.evidence.length >= 3, `strong match has only ${match.evidence.length} evidence lines`);
    }

    const opportunities = await loadOpportunities(sql, { postedWithinDays: null });
    const byId = new Map(opportunities.map((o) => [o.id, o]));
    for (const match of strong) {
      const opp = byId.get(match.opportunityId)!;
      const text = `${opp.title} ${opp.description ?? ''}`.toLowerCase();
      assert.ok(!text.includes(EXCLUDED), `strong match contains the excluded keyword: ${opp.title}`);
    }
  });

  test('rescoring is idempotent — one row per opportunity', async () => {
    await seedOpportunity();

    await scoreCompany(sql, companyId);
    await scoreCompany(sql, companyId);

    const [{ count }] = await sql<{ count: string }[]>`
      SELECT count(*) FROM matches WHERE user_company_id = ${companyId}
    `;
    assert.equal(Number(count), 1);
  });

  test('a dismissal survives a rescore', async () => {
    // Acceptance criterion 10: not relevant hides the opportunity permanently.
    const oppId = await seedOpportunity();
    await scoreCompany(sql, companyId);
    await sql`UPDATE matches SET dismissed_at = now() WHERE opportunity_id = ${oppId}`;

    await scoreCompany(sql, companyId);

    const [row] = await sql<{ dismissed_at: Date | null }[]>`
      SELECT dismissed_at FROM matches WHERE opportunity_id = ${oppId}
    `;
    assert.ok(row.dismissed_at, 'rescore must not clear a dismissal');
  });

  test('an opportunity that starts disqualifying stops being surfaced', async () => {
    const oppId = await seedOpportunity();
    await scoreCompany(sql, companyId);
    assert.equal((await sql`SELECT id FROM matches WHERE opportunity_id = ${oppId}`).length, 1);

    // The customer adds an exclusion that now catches it.
    await sql`
      UPDATE company_profiles SET excluded_keywords = ARRAY['cloud migration']
      WHERE user_company_id = ${companyId}
    `;
    await scoreCompany(sql, companyId);

    assert.equal((await sql`SELECT id FROM matches WHERE opportunity_id = ${oppId}`).length, 0);
  });

  test('does not score an opportunity whose deadline has passed', async () => {
    await seedOpportunity({ response_deadline: new Date(Date.now() - 86_400_000) });
    const result = await scoreCompany(sql, companyId);
    // Filtered in SQL before it ever reaches the scorer.
    assert.equal(result.scored, 0);
  });

  test('dry run writes nothing', async () => {
    await seedOpportunity();
    const result = await scoreCompany(sql, companyId, { dryRun: true });
    assert.ok(result.scored > 0);
    assert.equal(result.persisted, 0);
    assert.equal((await sql`SELECT id FROM matches`).length, 0);
  });
});
