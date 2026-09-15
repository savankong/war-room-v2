/**
 * Ingestion CLI. The worker (worker/index.ts) is what runs these on a
 * schedule; this is for running one by hand against a real database.
 *
 *   npm run ingest -- --source=opportunities
 *   npm run ingest -- --source=usaspending
 *   npm run ingest -- --source=all
 *   npm run ingest -- --source=opportunities --lookback=30 --dry-run
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getDb, closeDb } from '../db';
import { syncOpportunities } from './opportunities/sync';
import { syncUsaSpending } from './usaspending/sync';

const SOURCES = ['opportunities', 'usaspending', 'all'] as const;
type Source = (typeof SOURCES)[number];

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
}

async function main() {
  const source = arg('source') as Source | undefined;
  if (!source || !SOURCES.includes(source)) {
    console.error(`Usage: npm run ingest -- --source=${SOURCES.join('|')}`);
    process.exit(1);
  }

  const dryRun = process.argv.includes('--dry-run');
  const lookbackDays = arg('lookback') ? Number(arg('lookback')) : undefined;
  const maxRecords = arg('max') ? Number(arg('max')) : undefined;

  const sql = getDb();

  if (source === 'opportunities' || source === 'all') {
    const result = await syncOpportunities(sql, { dryRun, lookbackDays, maxRecords });
    console.log(
      `SAM opportunities: fetched ${result.fetched}, ` +
        `${result.inserted} inserted, ${result.updated} updated, ` +
        `${result.skipped} skipped (${result.outOfScope} outside DoD), ` +
        `${result.errored} errored`,
    );
    // Acceptance criterion 3 is a rate, so print it where a human will see it.
    const pct = (result.resolvedOrgRate * 100).toFixed(1);
    const verdict = result.resolvedOrgRate >= 0.85 ? 'meets' : 'BELOW';
    console.log(`  org resolution ${pct}% (${verdict} the 85% target); ${result.unresolvedOrg} in the admin queue`);
  }

  if (source === 'usaspending' || source === 'all') {
    await syncUsaSpending(sql);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
