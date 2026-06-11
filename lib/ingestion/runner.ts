import { syncSamGov } from './sam-gov/sync';
import { syncUsaSpending } from './usaspending/sync';

const source = process.argv.find((a) => a.startsWith('--source='))?.split('=')[1];

async function main() {
  if (!source || !['sam_gov', 'usaspending', 'all'].includes(source)) {
    console.error('Usage: npm run ingest -- --source=sam_gov|usaspending|all');
    process.exit(1);
  }

  if (source === 'sam_gov' || source === 'all') await syncSamGov();
  if (source === 'usaspending' || source === 'all') await syncUsaSpending();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
