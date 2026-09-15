# War Room v3 — AI DoD capture analyst

Implementation of the [product spec](https://wiki.yourrosterapp.com/doc/war-room-v3-product-spec-Nh6kGV74Im)
and [engineering spec](https://wiki.yourrosterapp.com/doc/war-room-v3-ai-dod-capture-analyst-engineering-spec-gEOuHhSHVu).

## Before you run any of this

Engineering spec §12 gates the build: *"Do not start step 1 until the manual
briefing test has run for four weeks with five real DoD contractors."* That gate
has not been reported as met. The code is here, but `BRIEFING_ALLOWLIST` is set
empty in `.do/app.yaml`, which stops the send job mailing anyone outside the
allowlist. Leave it that way until the gate passes.

`lib/dod-scope.ts` ships an **unverified** DoD agency list — §4 says to confirm
it against the live SAM and USASpending APIs rather than hardcode from memory.
Run `npm run verify-dod-agencies`, correct the list, and set `VERIFIED_AT`.

## Layout

```
migrations/            numbered .sql, run by scripts/migrate.ts
lib/
  db.ts                pooled + direct Postgres (§2)
  dod-scope.ts         DoD filter, pre-RFP classification (§4)
  ingestion/           SAM opportunities + USASpending awards (§4)
  matching/            deterministic scoring, no LLM (§5)
  capture/             incumbent, recompete, brief generation (§6)
  briefing/            payload, plain-text render, Resend send (§9)
  billing/             Stripe checkout and webhook (§8)
  signals/             nightly detectors (§4)
worker/                node-cron + BullMQ, the scheduler and consumers (§2, §8)
app/(app)/today        ranked matches (§7.2)
app/(app)/brief/[id]   capture brief (§7.3)
app/(app)/onboarding   three steps (§7.1)
app/(app)/settings     profile, cadence, billing (§7.4)
app/(app)/admin/ops    internal (§7.5)
```

## Running it

```bash
npm install
cp .env.example .env.local        # fill in DATABASE_URL at minimum

npm run migrate -- --status       # what is applied
npm run migrate                   # apply everything pending
npm run migrate -- --baseline 040 # existing prod DB only, once, before the above

npm run dev
npm run worker                    # scheduler + queue consumers
npm run worker -- --once=ingest-sam
npm run ingest -- --source=opportunities --lookback=30
npm run score -- --company=<id>   # dry by default; --write to persist
npm test
npm run typecheck
```

### Migrating the existing production database

Migrations 001-040 predate this runner: they were applied by hand and are not
safe to re-run (019 and 020 are data migrations). They live in
`migrations/legacy/`, one directory per migration, and load alongside the flat
`migrations/*.sql` files from 041 on. On the restored DigitalOcean database, run
the baseline once:

```bash
DATABASE_URL_DIRECT=<direct string> npm run migrate -- --baseline 040
DATABASE_URL_DIRECT=<direct string> npm run migrate
```

A database built from zero skips the baseline — the whole chain runs, including
`028a_legacy_bootstrap`, which creates four tables that reached production
through inline DDL in request handlers and never appeared in a migration.

## What is deliberately not built

Out of scope for v1 per §14: relationship graph and "Who Should I Know?",
contact enrichment, company and agency intelligence pages, watchlists, team
workspace, CRM integrations, exports, public API, civilian agencies, and the
Scout / Team / Enterprise tiers.

## Open decisions (§15)

1. **Scheduler.** node-cron in the worker is implemented. DO Functions
   scheduled triggers were not evaluated. The schedule table in
   `worker/index.ts` is the only thing that would move.
2. **warroomusa.com during migration.** Not addressed here; a deploy decision.
3. **Org picker scope.** `/api/org-tree` serves both: a curated shortlist by
   default and `?scope=full` for the whole hierarchy, so the decision can be
   made from real onboarding sessions.

## Reference data

The DoD org graph, its abbreviations and metadata, and ~4,200 leadership
contacts are plain SQL in `seeds/`, loaded by `npm run seed`. This is reference
data, not schema: it is deliberately **not** part of `npm run migrate`, so a bad
row can never block a deploy. Statements are idempotent upserts run one at a
time, and a failure on one is reported without stopping the rest.

```
npm run seed                  every seed, in dependency order
npm run seed -- --list        what exists, and how many statements each
npm run seed -- --dry-run     parse and count, execute nothing
npm run seed -- orgs-master   just one
```

Order matters because `contacts.org_id` is a foreign key onto `orgs`;
`scripts/seed.ts` encodes the order that applies cleanly from zero.

`npm run link-offices` resolves `contracts.contracting_office` strings to orgs.
It is a job rather than data, and it predates `lib/ingestion/org-resolver.ts` —
new code should use the resolver.

## Gates

`npm run lint`, `npm run typecheck`, `npm run build` and `npm test` all pass,
and CI runs every one of them on every push. Lint is pinned at
`--max-warnings=50`, so the remaining warnings can only go down.

## Known pre-existing problems

- `no-explicit-any` is switched off in two files — `app/(app)/admin/
  AdminClient.tsx` and `app/(app)/DiscoverClient.tsx` — with the reason written
  at the top of each. Everything typeable from a known shape in them has been
  typed; what remains is a generic edit modal over eight entity types and data
  fetched from `/api/industry/*`, which has no declared response contract. The
  rule is still an error in every other file. Fix both when those screens are
  rewritten.

- `scripts/import-sbir-csv.mjs` imports `csv-parse`, which is not a declared
  dependency, so it cannot run. `scripts/load-sbir-csv.mjs` does the same job
  without it.
