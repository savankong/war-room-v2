/**
 * Briefing send — engineering spec §8 (`send-briefings`, Mon/Wed/Fri 07:00 ET)
 * and §9.
 *
 * Acceptance criterion 8: "A briefing sends on schedule, contains no more than
 * three opportunities, and every link resolves."
 */
import { Resend } from 'resend';
import type postgres from 'postgres';
import { buildBriefing, isEmpty, MAX_OPPORTUNITIES, type BriefingPayload } from './build';
import { renderHtml, renderSubject, renderText } from './render';

type Sql = ReturnType<typeof postgres>;

export interface SendOptions {
  /** Build and record, but do not call Resend. */
  dryRun?: boolean;
  now?: Date;
  /** Injected in tests. */
  resend?: Pick<Resend, 'emails'>;
}

export interface SendResult {
  userCompanyId: string;
  status: 'sent' | 'skipped_empty' | 'skipped_no_recipient' | 'skipped_already_sent' | 'skipped_not_allowlisted' | 'dry_run' | 'failed';
  briefingId: string | null;
  opportunityCount: number;
  messageId: string | null;
  error?: string;
}

/**
 * §9 default cadence is Mon/Wed/Fri; a company can choose weekly or off.
 * The period is "since the last briefing we sent", not a fixed seven days, so
 * a missed run does not silently drop everything that happened during it.
 */
async function periodFor(sql: Sql, userCompanyId: string, now: Date): Promise<{ start: Date; end: Date }> {
  const [last] = await sql<{ period_end: Date }[]>`
    SELECT period_end FROM briefings
    WHERE user_company_id = ${userCompanyId} AND sent_at IS NOT NULL
    ORDER BY period_end DESC
    LIMIT 1
  `;

  const start = last?.period_end ?? new Date(now.getTime() - 7 * 86_400_000);
  return { start, end: now };
}

/**
 * Safety catch for the §12 manual-briefing phase and for staging: when
 * BRIEFING_ALLOWLIST is set, only those addresses receive mail. An accidental
 * blast to real contractors during the gate phase is unrecoverable.
 */
function isAllowlisted(email: string): boolean {
  const raw = process.env.BRIEFING_ALLOWLIST;
  if (!raw?.trim()) return true;
  const allowed = raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function sendBriefingFor(
  sql: Sql,
  userCompanyId: string,
  options: SendOptions = {},
): Promise<SendResult> {
  const now = options.now ?? new Date();
  const { start, end } = await periodFor(sql, userCompanyId, now);

  const [recipient] = await sql<{ email: string; full_name: string | null; briefing_frequency: string }[]>`
    SELECT u.email, u.full_name, c.briefing_frequency
    FROM user_companies c
    JOIN users u ON u.id = c.owner_user_id
    WHERE c.id = ${userCompanyId}
  `;

  if (!recipient?.email) {
    return { userCompanyId, status: 'skipped_no_recipient', briefingId: null, opportunityCount: 0, messageId: null };
  }

  const periodStartDate = start.toISOString().slice(0, 10);
  const periodEndDate = end.toISOString().slice(0, 10);

  // Checked before building. A rerun after a partial failure should say
  // "already sent", and assembling a briefing we will not send is wasted work
  // — the build excludes already-sent opportunities, so it would come back
  // empty and report that instead.
  const [existing] = await sql<{ id: string; sent_at: Date | null }[]>`
    SELECT id, sent_at FROM briefings
    WHERE user_company_id = ${userCompanyId}
      AND period_start = ${periodStartDate}
      AND period_end = ${periodEndDate}
  `;
  if (existing?.sent_at) {
    return {
      userCompanyId,
      status: 'skipped_already_sent',
      briefingId: existing.id,
      opportunityCount: 0,
      messageId: null,
    };
  }

  const payload = await buildBriefing(sql, { userCompanyId, periodStart: start, periodEnd: end });
  if (!payload) {
    return { userCompanyId, status: 'skipped_no_recipient', briefingId: null, opportunityCount: 0, messageId: null };
  }

  // §5's "fewer, better" taken seriously: an empty week gets no email.
  if (isEmpty(payload)) {
    return { userCompanyId, status: 'skipped_empty', briefingId: null, opportunityCount: 0, messageId: null };
  }

  if (payload.opportunities.length > MAX_OPPORTUNITIES) {
    throw new Error(
      `Briefing for ${userCompanyId} has ${payload.opportunities.length} opportunities; the cap is ${MAX_OPPORTUNITIES}`,
    );
  }

  // The UNIQUE on (user_company_id, period_start, period_end) is what makes
  // the retry above safe against a race as well as a rerun.
  const [briefing] = await sql<{ id: string }[]>`
    INSERT INTO briefings (user_company_id, period_start, period_end, payload, opportunity_count)
    VALUES (${userCompanyId}, ${periodStartDate}, ${periodEndDate},
            ${sql.json(payload as never)}, ${payload.opportunities.length})
    ON CONFLICT (user_company_id, period_start, period_end) DO UPDATE SET
      payload = EXCLUDED.payload,
      opportunity_count = EXCLUDED.opportunity_count
    RETURNING id
  `;

  if (options.dryRun) {
    return {
      userCompanyId,
      status: 'dry_run',
      briefingId: briefing.id,
      opportunityCount: payload.opportunities.length,
      messageId: null,
    };
  }

  if (!isAllowlisted(recipient.email)) {
    return {
      userCompanyId,
      status: 'skipped_not_allowlisted',
      briefingId: briefing.id,
      opportunityCount: payload.opportunities.length,
      messageId: null,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const client = options.resend ?? (apiKey ? new Resend(apiKey) : null);
  if (!client) {
    return {
      userCompanyId,
      status: 'failed',
      briefingId: briefing.id,
      opportunityCount: payload.opportunities.length,
      messageId: null,
      error: 'RESEND_API_KEY not set',
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.BRIEFING_FROM_EMAIL ?? 'War Room <briefing@warroomusa.com>',
      to: recipient.email,
      subject: renderSubject(payload),
      text: renderText(payload),
      html: renderHtml(payload),
    });

    if (error) {
      return {
        userCompanyId,
        status: 'failed',
        briefingId: briefing.id,
        opportunityCount: payload.opportunities.length,
        messageId: null,
        error: error.message,
      };
    }

    await sql`
      UPDATE briefings SET sent_at = now(), resend_message_id = ${data?.id ?? null}
      WHERE id = ${briefing.id}
    `;

    return {
      userCompanyId,
      status: 'sent',
      briefingId: briefing.id,
      opportunityCount: payload.opportunities.length,
      messageId: data?.id ?? null,
    };
  } catch (err) {
    return {
      userCompanyId,
      status: 'failed',
      briefingId: briefing.id,
      opportunityCount: payload.opportunities.length,
      messageId: null,
      error: (err as Error).message,
    };
  }
}

/** Companies due a briefing today, honouring each one's chosen cadence. */
export async function listBriefingRecipients(sql: Sql, now = new Date()): Promise<string[]> {
  const day = now.getUTCDay(); // 0 Sun .. 6 Sat
  const isMwf = day === 1 || day === 3 || day === 5;
  const isMonday = day === 1;

  const rows = await sql<{ id: string }[]>`
    SELECT c.id
    FROM user_companies c
    JOIN company_profiles p ON p.user_company_id = c.id
    WHERE c.status = 'active'
      AND c.plan IN ('trial', 'capture')
      AND c.briefing_frequency <> 'off'
      AND (
        (c.briefing_frequency = 'mwf' AND ${isMwf})
        OR (c.briefing_frequency = 'weekly' AND ${isMonday})
      )
  `;
  return rows.map((r) => r.id);
}

export async function sendAllBriefings(sql: Sql, options: SendOptions = {}): Promise<SendResult[]> {
  const companies = await listBriefingRecipients(sql, options.now);
  const results: SendResult[] = [];

  for (const companyId of companies) {
    // Sequential on purpose: Resend rate-limits, and one bad company must not
    // take the run down.
    results.push(await sendBriefingFor(sql, companyId, options));
  }

  const sent = results.filter((r) => r.status === 'sent').length;
  const failed = results.filter((r) => r.status === 'failed');
  console.log(`Briefings: ${sent} sent, ${results.length - sent} skipped or failed`);
  for (const failure of failed) {
    console.error(`  ${failure.userCompanyId}: ${failure.error}`);
  }

  return results;
}

export type { BriefingPayload };
