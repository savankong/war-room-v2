/**
 * Worker component — engineering spec §2 and §8.
 *
 * "DO App Platform worker component. Long running, owns the scheduler and
 *  queue consumers."
 * "node-cron inside the worker, enqueuing BullMQ jobs. DO App Platform Jobs
 *  are deploy-lifecycle only, not cron."
 *
 * Two halves in one process: node-cron enqueues on a schedule, a BullMQ Worker
 * consumes. The split means a job that takes 40 minutes cannot block the next
 * schedule tick, and a redeploy mid-job leaves the job in the queue rather
 * than losing it.
 *
 * §15 open decision 1 (node-cron vs DO Functions scheduled triggers) is still
 * open. This is the node-cron answer; the schedule table below is the only
 * thing that would need to move.
 *
 *   npm run worker                 run the scheduler and the consumer
 *   npm run worker -- --once=ingest-sam    run one job now and exit
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { Worker, type Job } from 'bullmq';
import cron from 'node-cron';
import { getDb, closeDb } from '../lib/db';
import { runJob } from './jobs';
import { enqueue, getConnection, closeQueues, QUEUE_NAME, JOB_NAMES, type JobName } from './queues';

/**
 * §8's schedule. Times are ET as the spec states them; node-cron is given an
 * explicit timezone rather than relying on the container's, because DO App
 * Platform containers run UTC and "07:00" would silently become 02:00 ET.
 */
const SCHEDULE: Array<{ cron: string; job: JobName; note: string }> = [
  { cron: '0 6 * * *', job: 'ingest-sam', note: 'daily 06:00 ET' },
  { cron: '30 2 * * *', job: 'ingest-usaspending', note: 'nightly' },
  { cron: '0 3 * * *', job: 'detect-signals', note: 'nightly' },
  // Scoring runs after ingest, brief generation after scoring. Spaced by the
  // clock rather than chained so one slow run delays the next rather than
  // cancelling it.
  { cron: '0 7 * * *', job: 'score-matches', note: 'daily, after ingest' },
  { cron: '30 7 * * *', job: 'generate-briefs', note: 'daily, after scoring' },
  { cron: '0 8 * * 1,3,5', job: 'send-briefings', note: 'Mon/Wed/Fri 07:00 ET' },
];

const TIMEZONE = process.env.WORKER_TIMEZONE ?? 'America/New_York';

/** One job at a time: these are long, database-heavy, and not worth racing. */
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 1);

async function runOnce(name: string): Promise<void> {
  if (!(JOB_NAMES as readonly string[]).includes(name)) {
    console.error(`Unknown job "${name}". One of: ${JOB_NAMES.join(', ')}`);
    process.exit(1);
  }
  const sql = getDb();
  try {
    await runJob(sql, name as JobName);
  } finally {
    await closeDb();
  }
}

async function main(): Promise<void> {
  const once = process.argv.find((a) => a.startsWith('--once='))?.split('=')[1];
  if (once) {
    await runOnce(once);
    return;
  }

  const sql = getDb();

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => runJob(sql, job.name as JobName),
    {
      connection: getConnection(),
      concurrency: CONCURRENCY,
      // Ingest runs can exceed the default lock duration; without this BullMQ
      // decides the job is stalled and runs it a second time in parallel.
      lockDuration: 10 * 60_000,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[queue] ${job?.name ?? 'unknown'} failed (attempt ${job?.attemptsMade}): ${err.message}`);
  });
  worker.on('error', (err) => {
    console.error(`[queue] worker error: ${err.message}`);
  });

  const tasks = SCHEDULE.map(({ cron: expression, job, note }) => {
    console.log(`[cron] ${job} — ${expression} (${note}, ${TIMEZONE})`);
    return cron.schedule(
      expression,
      () => {
        enqueue(job).catch((err) => console.error(`[cron] enqueue ${job} failed: ${err.message}`));
      },
      { timezone: TIMEZONE },
    );
  });

  console.log(`[worker] up, consuming ${QUEUE_NAME} at concurrency ${CONCURRENCY}`);

  // DO App Platform sends SIGTERM on redeploy. Draining rather than exiting
  // lets an in-flight job finish instead of being retried from the start.
  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[worker] ${signal} received, draining`);
    for (const task of tasks) task.stop();
    await worker.close();
    await closeQueues();
    await closeDb();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch(async (err) => {
  console.error(err);
  await closeDb().catch(() => {});
  process.exit(1);
});
