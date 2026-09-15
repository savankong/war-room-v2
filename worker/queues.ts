/**
 * BullMQ queues — engineering spec §2.
 *
 * "Queue/cache: DO Managed Valkey (Redis). BullMQ for ingestion, scoring, and
 *  brief generation jobs."
 */
import { Queue, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';

export const JOB_NAMES = [
  'ingest-sam',
  'ingest-usaspending',
  'detect-signals',
  'score-matches',
  'generate-briefs',
  'send-briefings',
] as const;

export type JobName = (typeof JOB_NAMES)[number];

export const QUEUE_NAME = 'war-room';

let _connection: IORedis | null = null;
let _queue: Queue | null = null;

export function getConnection(): IORedis {
  if (!_connection) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error('REDIS_URL not set');
    _connection = new IORedis(url, {
      // Required by BullMQ: it manages its own retry semantics and a capped
      // retry count makes blocking commands throw mid-job instead.
      maxRetriesPerRequest: null,
      // DO Managed Valkey terminates TLS; rediss:// URLs need this on.
      ...(url.startsWith('rediss://') ? { tls: {} } : {}),
    });
  }
  return _connection;
}

export function getQueue(): Queue {
  if (!_queue) {
    _queue = new Queue(QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30_000 },
        // Keep enough history for the admin queue-health panel (§7.5) without
        // letting Redis grow without bound.
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 500 },
      },
    });
  }
  return _queue;
}

/**
 * Enqueue a job.
 *
 * jobId defaults to name + UTC date, so a cron that double-fires across a
 * restart does not run the same daily ingest twice: BullMQ drops a duplicate
 * jobId that is still known.
 */
export async function enqueue(
  name: JobName,
  data: Record<string, unknown> = {},
  options: JobsOptions = {},
): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  await getQueue().add(name, data, { jobId: `${name}:${day}`, ...options });
}

export async function closeQueues(): Promise<void> {
  await _queue?.close();
  _queue = null;
  _connection?.disconnect();
  _connection = null;
}
