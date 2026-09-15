/**
 * Integration tests for briefing assembly and send. Needs TEST_DATABASE_URL.
 *
 * Covers acceptance criterion 8: "A briefing sends on schedule, contains no
 * more than three opportunities, and every link resolves."
 *
 * Resend is always injected, so this suite never sends mail.
 */
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import postgres from 'postgres';
import { buildBriefing, MAX_OPPORTUNITIES } from './build';
import { sendBriefingFor, listBriefingRecipients } from './send';

const TEST_DB = process.env.TEST_DATABASE_URL;

type Sql = ReturnType<typeof postgres>;
let sql: Sql;
let companyId: string;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function fakeResend() {
  const sent: Array<{ to: string; subject: string; text: string; html: string }> = [];
  const resend = {
    emails: {
      send: async (message: { to: string; subject: string; text: string; html: string }) => {
        sent.push(message);
        return { data: { id: `msg-${sent.length}` }, error: null };
      },
    },
  };
  return { resend: resend as never, sent };
}

async function seedCompany(): Promise<string> {
  const [user] = await sql<{ id: number }[]>`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${`brief-${Date.now()}@example.test`}, 'x', 'Brief Test')
    RETURNING id
  `;
  const [company] = await sql<{ id: string }[]>`
    INSERT INTO user_companies (name, owner_user_id, plan, briefing_frequency)
    VALUES ('Briefing Test Co', ${user.id}, 'trial', 'mwf')
    RETURNING id
  `;
  await sql`
    INSERT INTO company_profiles (user_company_id, naics_codes, target_org_ids)
    VALUES (${company.id}, ARRAY['541512'], ARRAY['disa'])
  `;
  return company.id;
}

async function seedMatch(score: number, title: string, fit: 'strong' | 'fair' = 'strong'): Promise<string> {
  const [opportunity] = await sql<{ id: string }[]>`
    INSERT INTO opportunities (external_id, source, title, notice_type, naics_code, response_deadline, canonical_org_id, posted_date)
    VALUES (${`b-${Math.random().toString(36).slice(2)}`}, 'sam', ${title}, 'Sources Sought', '541512',
            ${daysFromNow(30)}, 'disa', current_date)
    RETURNING id
  `;
  await sql`
    INSERT INTO matches (user_company_id, opportunity_id, score, fit, evidence)
    VALUES (${companyId}, ${opportunity.id}, ${score}, ${fit},
            ${sql.json([
              { factor: 'naics_exact', points: 25, line: 'Same NAICS as your past work (541512)' },
              { factor: 'org_target', points: 20, line: 'DISA is one of your target organizations' },
            ])})
  `;
  return opportunity.id;
}

describe('briefing send', { skip: TEST_DB ? false : 'TEST_DATABASE_URL not set' }, () => {
  before(() => {
    sql = postgres(TEST_DB!, { max: 1, prepare: false, onnotice: () => {} });
  });

  after(async () => {
    await sql?.end({ timeout: 5 });
  });

  beforeEach(async () => {
    await sql`DELETE FROM briefings`;
    await sql`DELETE FROM feedback`;
    await sql`DELETE FROM capture_briefs`;
    await sql`DELETE FROM matches`;
    await sql`DELETE FROM company_profiles`;
    await sql`DELETE FROM user_companies`;
    await sql`DELETE FROM opportunities`;
    await sql`DELETE FROM signals`;
    companyId = await seedCompany();
  });

  // Acceptance criterion 8.
  test('never sends more than three opportunities, however many qualify', async () => {
    for (let i = 0; i < 9; i++) await seedMatch(90 - i, `Cloud Opportunity ${i}`);

    const { resend, sent } = fakeResend();
    const result = await sendBriefingFor(sql, companyId, { resend });

    assert.equal(result.status, 'sent');
    assert.equal(result.opportunityCount, MAX_OPPORTUNITIES);
    assert.match(sent[0].text, /6 more matches cleared the bar/);
  });

  test('picks the highest-scoring matches', async () => {
    await seedMatch(45, 'Low scorer', 'fair');
    await seedMatch(95, 'High scorer');
    await seedMatch(70, 'Middle scorer');

    const payload = await buildBriefing(sql, {
      userCompanyId: companyId,
      periodStart: new Date(Date.now() - 7 * 86_400_000),
      periodEnd: new Date(),
    });

    assert.deepEqual(
      payload!.opportunities.map((o) => o.title),
      ['High scorer', 'Middle scorer', 'Low scorer'],
    );
  });

  test('excludes weak matches', async () => {
    await seedMatch(20, 'Weak one', 'fair');
    await sql`UPDATE matches SET fit = 'weak' WHERE user_company_id = ${companyId}`;

    const payload = await buildBriefing(sql, {
      userCompanyId: companyId,
      periodStart: new Date(Date.now() - 7 * 86_400_000),
      periodEnd: new Date(),
    });
    assert.equal(payload!.opportunities.length, 0);
  });

  test('excludes a dismissed match', async () => {
    await seedMatch(90, 'Dismissed one');
    await sql`UPDATE matches SET dismissed_at = now() WHERE user_company_id = ${companyId}`;

    const payload = await buildBriefing(sql, {
      userCompanyId: companyId,
      periodStart: new Date(Date.now() - 7 * 86_400_000),
      periodEnd: new Date(),
    });
    assert.equal(payload!.opportunities.length, 0);
  });

  test('excludes an opportunity the customer already judged', async () => {
    const oppId = await seedMatch(90, 'Already known');
    await sql`
      INSERT INTO feedback (user_company_id, opportunity_id, verdict)
      VALUES (${companyId}, ${oppId}, 'already_knew')
    `;

    const payload = await buildBriefing(sql, {
      userCompanyId: companyId,
      periodStart: new Date(Date.now() - 7 * 86_400_000),
      periodEnd: new Date(),
    });
    assert.equal(payload!.opportunities.length, 0);
  });

  test('never repeats an opportunity across briefings', async () => {
    await seedMatch(90, 'First week headline');

    const { resend, sent } = fakeResend();
    const first = await sendBriefingFor(sql, companyId, { resend });
    assert.equal(first.status, 'sent');
    assert.equal(first.opportunityCount, 1);

    // Nothing new since, so the second run has nothing to say.
    const second = await sendBriefingFor(sql, companyId, {
      resend,
      now: new Date(Date.now() + 3 * 86_400_000),
    });
    assert.equal(second.status, 'skipped_empty');
    assert.equal(sent.length, 1);
  });

  test('sends nothing at all rather than an empty briefing', async () => {
    const { resend, sent } = fakeResend();
    const result = await sendBriefingFor(sql, companyId, { resend });
    assert.equal(result.status, 'skipped_empty');
    assert.equal(sent.length, 0);
  });

  test('records the send with its Resend message id', async () => {
    await seedMatch(90, 'Recorded one');
    const { resend } = fakeResend();
    const result = await sendBriefingFor(sql, companyId, { resend });

    const [row] = await sql<{ sent_at: Date | null; resend_message_id: string | null; opportunity_count: number }[]>`
      SELECT sent_at, resend_message_id, opportunity_count FROM briefings WHERE id = ${result.briefingId!}
    `;
    assert.ok(row.sent_at);
    assert.equal(row.resend_message_id, 'msg-1');
    assert.equal(row.opportunity_count, 1);
  });

  test('a rerun does not double-send', async () => {
    await seedMatch(90, 'Only once');
    const { resend, sent } = fakeResend();

    const now = new Date();
    const first = await sendBriefingFor(sql, companyId, { resend, now });
    const again = await sendBriefingFor(sql, companyId, { resend, now });

    assert.equal(first.status, 'sent');
    assert.equal(sent.length, 1, 'the second run must not send a second email');
    // The period rolls forward to the last send, so the rerun's window is
    // empty rather than a duplicate of the same period.
    assert.equal(again.status, 'skipped_empty');
  });

  test('two sends on the same day do not produce a third', async () => {
    // The reachable path for the already-sent guard. Once a briefing has been
    // sent today, the period collapses to (today, today); a second send with
    // new content writes that row, and any further run inside the same day
    // must find it rather than send again.
    const { resend, sent } = fakeResend();
    const now = new Date();

    await seedMatch(90, 'Morning headline');
    assert.equal((await sendBriefingFor(sql, companyId, { resend, now })).status, 'sent');

    await seedMatch(85, 'Afternoon headline');
    assert.equal((await sendBriefingFor(sql, companyId, { resend, now })).status, 'sent');
    assert.equal(sent.length, 2);

    await seedMatch(80, 'Evening headline');
    const third = await sendBriefingFor(sql, companyId, { resend, now });
    assert.equal(third.status, 'skipped_already_sent');
    assert.equal(sent.length, 2, 'the day already had its briefing');
  });

  test('a send that failed is retried for the same period', async () => {
    await seedMatch(90, 'Retried');
    const now = new Date();

    // First attempt fails at the Resend call, so sent_at stays null.
    const failing = {
      emails: {
        send: async () => ({ data: null, error: { message: 'upstream unavailable' } }),
      },
    } as never;
    const first = await sendBriefingFor(sql, companyId, { resend: failing, now });
    assert.equal(first.status, 'failed');

    const { resend, sent } = fakeResend();
    const second = await sendBriefingFor(sql, companyId, { resend, now });
    assert.equal(second.status, 'sent');
    assert.equal(sent.length, 1);
    assert.equal(second.briefingId, first.briefingId, 'the retry reuses the same briefing row');
  });

  test('the allowlist blocks sending to anyone else', async () => {
    await seedMatch(90, 'Gated');
    const previous = process.env.BRIEFING_ALLOWLIST;
    process.env.BRIEFING_ALLOWLIST = 'someone-else@example.test';
    try {
      const { resend, sent } = fakeResend();
      const result = await sendBriefingFor(sql, companyId, { resend });
      assert.equal(result.status, 'skipped_not_allowlisted');
      assert.equal(sent.length, 0);
    } finally {
      if (previous === undefined) delete process.env.BRIEFING_ALLOWLIST;
      else process.env.BRIEFING_ALLOWLIST = previous;
    }
  });

  test('a dry run records the briefing but sends nothing', async () => {
    await seedMatch(90, 'Dry run');
    const { resend, sent } = fakeResend();
    const result = await sendBriefingFor(sql, companyId, { resend, dryRun: true });

    assert.equal(result.status, 'dry_run');
    assert.equal(sent.length, 0);
    const [row] = await sql<{ sent_at: Date | null }[]>`SELECT sent_at FROM briefings WHERE id = ${result.briefingId!}`;
    assert.equal(row.sent_at, null);
  });

  describe('cadence (§9)', () => {
    test('mwf companies are due on Monday, Wednesday and Friday', async () => {
      const monday = new Date('2026-09-14T12:00:00Z');
      const tuesday = new Date('2026-09-15T12:00:00Z');
      assert.ok((await listBriefingRecipients(sql, monday)).includes(companyId));
      assert.ok(!(await listBriefingRecipients(sql, tuesday)).includes(companyId));
    });

    test('weekly companies are due on Monday only', async () => {
      await sql`UPDATE user_companies SET briefing_frequency = 'weekly' WHERE id = ${companyId}`;
      const monday = new Date('2026-09-14T12:00:00Z');
      const wednesday = new Date('2026-09-16T12:00:00Z');
      assert.ok((await listBriefingRecipients(sql, monday)).includes(companyId));
      assert.ok(!(await listBriefingRecipients(sql, wednesday)).includes(companyId));
    });

    test('off means never', async () => {
      await sql`UPDATE user_companies SET briefing_frequency = 'off' WHERE id = ${companyId}`;
      const monday = new Date('2026-09-14T12:00:00Z');
      assert.ok(!(await listBriefingRecipients(sql, monday)).includes(companyId));
    });

    test('a cancelled company gets nothing', async () => {
      await sql`UPDATE user_companies SET plan = 'cancelled' WHERE id = ${companyId}`;
      const monday = new Date('2026-09-14T12:00:00Z');
      assert.ok(!(await listBriefingRecipients(sql, monday)).includes(companyId));
    });
  });
});
