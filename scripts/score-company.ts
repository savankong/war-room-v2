/**
 * Score one company and print the results for eyeballing.
 *
 * Engineering spec §11 step 4: "Matching engine per §5, plus a CLI script that
 * scores one company and prints results for eyeballing."
 *
 * This is the tool for the §5 tuning loop. Scoring weights are a product
 * decision, and the only way to know they are wrong is to read the output
 * against a company you know.
 *
 *   npm run score -- --company=<user_company_id>
 *   npm run score -- --company=<id> --fit=strong --limit=10
 *   npm run score -- --company=<id> --write        (persist to `matches`)
 *   npm run score -- --company=<id> --explain=<opportunity_id>
 *
 * Dry by default: it prints without touching `matches` unless --write.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDb, closeDb } from '../lib/db';
import { scoreCompany, loadOpportunities, loadScoringContext } from '../lib/matching/run';
import { scoreOpportunity } from '../lib/matching/score';
import type { Fit } from '../lib/matching/types';

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
}

const FIT_ORDER: Record<Fit, number> = { strong: 0, fair: 1, weak: 2 };

async function main() {
  const companyId = arg('company');
  if (!companyId) {
    console.error('Usage: npm run score -- --company=<user_company_id> [--fit=strong|fair|weak] [--limit=N] [--write] [--explain=<opportunity_id>]');
    process.exit(1);
  }

  const fitFilter = arg('fit') as Fit | undefined;
  const limit = Number(arg('limit') ?? 25);
  const write = process.argv.includes('--write');
  const explainId = arg('explain');

  const sql = getDb();

  const [company] = await sql<{ name: string; plan: string }[]>`
    SELECT name, plan FROM user_companies WHERE id = ${companyId}
  `;
  if (!company) {
    console.error(`No user_companies row with id=${companyId}`);
    process.exit(1);
  }

  // --explain: one opportunity, every factor, including why it was dropped.
  if (explainId) {
    const context = await loadScoringContext(sql, companyId);
    if (!context) throw new Error(`No company_profiles row for ${companyId}`);

    const all = await loadOpportunities(sql, { postedWithinDays: null });
    const opportunity = all.find((o) => o.id === explainId);
    if (!opportunity) {
      console.error(`Opportunity ${explainId} is not in the live set (archived, or deadline passed).`);
      process.exit(1);
    }

    const result = scoreOpportunity({
      opportunity,
      profile: context.profile,
      pastPerformance: context.pastPerformance,
      lineage: context.lineage,
    });

    console.log(`\n${opportunity.title}`);
    console.log(`${opportunity.orgName ?? 'unresolved org'} · ${opportunity.noticeType ?? 'unknown type'}\n`);

    if (result.disqualified) {
      console.log(`DISQUALIFIED (${result.disqualified.reason}): ${result.disqualified.detail}\n`);
    } else {
      console.log(`${result.fit.toUpperCase()} — score ${result.score}\n`);
      for (const line of result.evidence) {
        console.log(`  +${String(line.points).padStart(2)}  ${line.line}`);
      }
      console.log();
    }
    return;
  }

  const result = await scoreCompany(sql, companyId, { dryRun: !write });

  console.log(`\n${company.name} (${company.plan})`);
  console.log(
    `${result.scored} live opportunities scored: ` +
      `${result.strong} strong, ${result.fair} fair, ${result.weak} weak, ` +
      `${result.disqualified} disqualified`,
  );
  console.log(write ? `Wrote ${result.persisted} rows to matches.\n` : 'Dry run — nothing written. Pass --write to persist.\n');

  // Disqualifier breakdown answers "why is my feed empty", which is the first
  // thing to check when a seeded company returns nothing.
  const reasons = new Map<string, number>();
  for (const r of result.results) {
    if (r.disqualified) reasons.set(r.disqualified.reason, (reasons.get(r.disqualified.reason) ?? 0) + 1);
  }
  if (reasons.size) {
    console.log('Disqualified by:');
    for (const [reason, count] of [...reasons].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(count).padStart(5)}  ${reason}`);
    }
    console.log();
  }

  const shown = result.results
    .filter((r) => !r.disqualified)
    .filter((r) => (fitFilter ? r.fit === fitFilter : r.fit !== 'weak'))
    .sort((a, b) => FIT_ORDER[a.fit] - FIT_ORDER[b.fit] || b.score - a.score)
    .slice(0, limit);

  if (!shown.length) {
    console.log('No matches at that fit level.\n');
    return;
  }

  const titles = new Map<string, { title: string; org: string | null; type: string | null }>();
  const opportunities = await loadOpportunities(sql, { postedWithinDays: null });
  for (const o of opportunities) titles.set(o.id, { title: o.title, org: o.orgName, type: o.noticeType });

  for (const r of shown) {
    const meta = titles.get(r.opportunityId);
    console.log(`${r.fit.toUpperCase().padEnd(6)} ${String(r.score).padStart(3)}  ${meta?.title ?? r.opportunityId}`);
    console.log(`              ${meta?.org ?? 'unresolved org'} · ${meta?.type ?? 'unknown type'}`);
    for (const line of r.evidence) {
      console.log(`              +${String(line.points).padStart(2)} ${line.line}`);
    }
    console.log();
  }

  // Acceptance criterion 4: every Strong match has at least three evidence
  // lines. Checked here because this is the script used to eyeball a seeded
  // company before the app exists.
  const thinStrong = result.results.filter((r) => r.fit === 'strong' && !r.disqualified && r.evidence.length < 3);
  if (thinStrong.length) {
    console.log(
      `! ${thinStrong.length} strong ${thinStrong.length === 1 ? 'match has' : 'matches have'} ` +
        `fewer than 3 evidence lines (acceptance criterion 4).`,
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
